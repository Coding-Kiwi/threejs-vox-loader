import {
    BufferGeometry,
    FileLoader,
    Float32BufferAttribute,
    Loader,
    MeshStandardMaterial,
    PointLight
} from 'three';

import VOXFile from "./VOXFile.js";
import VOXMesh from './VOXMesh.js';

export default class VOXLoader extends Loader {
    constructor(manager) {
        super(manager);
        this.loader = new FileLoader(manager);
    }

    load(url, onLoad, onProgress, onError) {
        const scope = this;

        scope.loader.setResponseType('arraybuffer');
        scope.loader.load(url, (text) => {
            onLoad(scope.parse(text));
        }, onProgress, onError);
    }

    parse(data) {
        let file = new VOXFile(new Uint8Array(data));
        let container = file.readChar();

        if (container !== "VOX ") throw new Error("Only vox files supported");
        file.version = file.readUInt32();
        file.readDefaultPalette();

        while (file.head < data.length) {
            file.readNextChunk();
        }

        delete file.head;
        delete file.buffer;

        // === build the mesh ===

        const sizeX = file.size.x;
        const sizeY = file.size.y;
        const sizeZ = file.size.z;
        const halfX = sizeX / 2;
        const halfY = sizeY / 2;
        const halfZ = sizeZ / 2;

        const lights = [];
        const vertices = [];
        const colors = [];
        const geometry = new BufferGeometry();

        const offset_y = sizeX;
        const offset_z = sizeX * sizeY;

        let startGroup = 0;
        let groupMaterial = null;
        let usedMaterials = [];
        let hasColors = false;

        const px = [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0]; //positive x face (right)
        const py = [0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1]; //positive y face (top)
        const pz = [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1]; //positive z face (front)
        const nx = [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1]; //negative x face (left)
        const ny = [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0]; //negative y face (bottom)
        const nz = [0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0]; //negative z face (back)

        function add(face, x, y, z, color, material) {
            if (material && groupMaterial !== material.id) {
                if (vertices.length > startGroup) {
                    let index = usedMaterials.indexOf(groupMaterial);
                    if (index === -1) {
                        usedMaterials.push(groupMaterial);
                        index = usedMaterials.length - 1;
                    }
                    geometry.addGroup(startGroup / 3, (vertices.length - startGroup) / 3, index);
                }
                startGroup = vertices.length;
                groupMaterial = material.id;
            }

            x -= halfX; // center model in X
            y -= halfZ; // center model in Y (note: Y/Z swap explained below)
            z += halfY; // offset Z forward (voxel space to Three.js space)

            for (let i = 0; i < 18; i += 3) {
                vertices.push(face[i + 0] + x, face[i + 1] + y, face[i + 2] + z);
                colors.push(color.r, color.g, color.b);
            }
        }

        file.voxels.forEach((colorIndex, index) => {
            if (colorIndex === null) return;

            const x = index % offset_y;
            const y = Math.floor(index / offset_y) % sizeY;
            const z = Math.floor(index / offset_z);

            const color = file.getThreeColor(colorIndex);
            if (!hasColors && (color.r > 0 || color.g > 0 || color.b > 0)) hasColors = true;

            const material = file.getMaterial(colorIndex);

            if (file.voxels[index + 1] === null || x === sizeX - 1) add(px, x, z, - y, color, material);
            if (file.voxels[index - 1] === null || x === 0) add(nx, x, z, - y, color, material);
            if (file.voxels[index + offset_y] === null || y === sizeY - 1) add(ny, x, z, - y, color, material);
            if (file.voxels[index - offset_y] === null || y === 0) add(py, x, z, - y, color, material);
            if (file.voxels[index + offset_z] === null || z === sizeZ - 1) add(pz, x, z, - y, color, material);
            if (file.voxels[index - offset_z] === null || z === 0) add(nz, x, z, - y, color, material);

            const isEmissive = material?._type === "_emit";

            if (isEmissive) {
                let light = new PointLight(color, 0.5, 0.1, 1);
                light.castShadow = true;

                light.position.set(
                    x + 0.5 - halfX,
                    z + 0.5 - halfY,
                    y - 0.5 + halfZ,
                );

                lights.push(light);
            }
        });

        // Final group
        if (vertices.length > startGroup) {
            let index = usedMaterials.indexOf(groupMaterial);
            if (index === -1) {
                usedMaterials.push(groupMaterial);
                index = usedMaterials.length - 1;
            }
            geometry.addGroup(startGroup / 3, (vertices.length - startGroup) / 3, index);
        }

        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        let materials = [];

        if (usedMaterials.length) {
            materials = usedMaterials.map(m => {
                const mat = file.getMaterial(m);
                const color = file.getThreeColor(m);

                const opts = {
                    flatShading: true
                };

                if (mat._type === '_emit') {
                    opts.emissive = color;
                    opts.emissiveIntensity = 0.5;
                }

                if (typeof mat._rough !== "undefined") {
                    opts.roughness = parseFloat(mat._rough);
                }

                if (typeof mat._metal !== "undefined") {
                    opts.metalness = parseFloat(mat._metal);
                }

                if (hasColors) opts.color = color;

                return new MeshStandardMaterial(opts);
            });
        } else {
            materials = new MeshStandardMaterial();

            if (hasColors) {
                geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
                materials.vertexColors = true;
            }
        }

        return new VOXMesh(geometry, materials, lights);
    }
}