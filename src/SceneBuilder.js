import { BufferGeometry, Color, Float32BufferAttribute, MeshStandardMaterial, PointLight } from "three";
import VOXSceneObject from "./VOXSceneObject.js";

function optimizeGrid(grid, w, h) {
    let rectangles = [];

    let colors = new Set();
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            if (grid[x][y] === null) continue;
            colors.add(grid[x][y]);
        }
    }

    if (colors.size === 0) return [];
    colors = [...colors];

    colors.forEach(color => {
        let c_rectangles = [];

        for (let x = 0; x < w; x++) {
            let start_y = null;
            let end_y = null;

            for (let y = 0; y <= h; y++) {
                let wall = grid[x][y] === color;

                if (wall && y < h) {
                    if (start_y == null) start_y = y;
                    end_y = y;
                } else if (start_y !== null) {
                    if (y == h - 1) {
                        end_y = y - 1;
                    }

                    let overlaps = [];

                    for (const r in c_rectangles) {
                        let rect = c_rectangles[r];

                        if ((rect.end_x == x) && (start_y <= rect.y) && (end_y >= rect.end_y)) {
                            overlaps.push(rect);
                        }
                    }

                    overlaps.sort((a, b) => a.y - b.y);

                    for (const o in overlaps) {
                        let rect = overlaps[o];

                        if (start_y < rect.y) {
                            c_rectangles.push({
                                x: x,
                                y: start_y,
                                end_x: x + 1,
                                end_y: rect.y - 1,
                                color
                            });
                            start_y = rect.y;
                        }

                        if (start_y == rect.y) {
                            rect.end_x++;

                            if (end_y == rect.end_y) {
                                start_y = null;
                                end_y == null;
                            } else if (end_y > rect.end_y) {
                                start_y = rect.end_y + 1;
                            }
                        }
                    }

                    if (start_y !== null) {
                        c_rectangles.push({
                            x: x,
                            y: start_y,
                            end_x: x + 1,
                            end_y: end_y,
                            color
                        });

                        start_y = null;
                        end_y = null;
                    }
                }
            }

            if (start_y !== null) {
                c_rectangles.push({
                    x: x,
                    y: start_y,
                    end_x: x + 1,
                    end_y: end_y,
                    color
                });
                start_y = null;
                end_y = null;
            }
        }

        rectangles.push(...c_rectangles);
    })

    return rectangles.map(box => {
        return {
            a: box.x,
            b: box.y,
            end_a: box.end_x,
            end_b: box.end_y + 1,
            color: box.color
        }
    });
}

export function buildSceneObject(file, obj, options) {
    obj.flipToThree();

    const sizeX = obj.size.x;
    const sizeY = obj.size.y;
    const sizeZ = obj.size.z;

    const positionsByColor = {};
    let lights = {};

    const directions = [
        {
            name: "x-",
            axis: "x",
            face_axis: ["y", "z"],
            offset: { x: -1, y: 0, z: 0 },
            slices: [],
            getFace(base, r) {
                return [
                    base, r.a, r.b,
                    base, r.a, r.end_b,
                    base, r.end_a, r.b,
                    base, r.end_a, r.end_b,
                    base, r.end_a, r.b,
                    base, r.a, r.end_b,
                ]
            }
        },
        {
            name: "x+",
            axis: "x",
            face_axis: ["y", "z"],
            offset: { x: 1, y: 0, z: 0 },
            slices: [],
            getFace(base, r) {
                return [
                    base + 1, r.a, r.b,
                    base + 1, r.end_a, r.b,
                    base + 1, r.a, r.end_b,
                    base + 1, r.end_a, r.end_b,
                    base + 1, r.a, r.end_b,
                    base + 1, r.end_a, r.b,
                ]
            }
        },
        {
            name: "y+",
            axis: "y",
            face_axis: ["x", "z"],
            offset: { x: 0, y: 1, z: 0 },
            slices: [],
            getFace(base, r) {
                return [
                    r.a, base + 1, r.end_b,
                    r.end_a, base + 1, r.end_b,
                    r.a, base + 1, r.b,
                    r.end_a, base + 1, r.b,
                    r.a, base + 1, r.b,
                    r.end_a, base + 1, r.end_b,
                ]
            }
        },
        {
            name: "y-",
            axis: "y",
            face_axis: ["x", "z"],
            offset: { x: 0, y: -1, z: 0 },
            slices: [],
            getFace(base, r) {
                return [
                    r.a, base, r.end_b,
                    r.a, base, r.b,
                    r.end_a, base, r.end_b,
                    r.end_a, base, r.b,
                    r.end_a, base, r.end_b,
                    r.a, base, r.b,
                ]
            }
        },
        {
            name: "z+",
            axis: "z",
            face_axis: ["x", "y"],
            offset: { x: 0, y: 0, z: 1 },
            slices: [],
            getFace(base, r) {
                return [
                    r.a, r.b, base + 1,
                    r.end_a, r.b, base + 1,
                    r.a, r.end_b, base + 1,
                    r.end_a, r.end_b, base + 1,
                    r.a, r.end_b, base + 1,
                    r.end_a, r.b, base + 1
                ]
            }
        },
        {
            name: "z-",
            axis: "z",
            face_axis: ["x", "y"],
            offset: { x: 0, y: 0, z: -1 },
            slices: [],
            getFace(base, r) {
                return [
                    r.a, r.b, base,
                    r.a, r.end_b, base,
                    r.end_a, r.b, base,
                    r.end_a, r.end_b, base,
                    r.end_a, r.b, base,
                    r.a, r.end_b, base
                ]
            }
        }
    ];

    for (let x = 0; x < sizeX; x++) {
        for (let y = 0; y < sizeY; y++) {
            for (let z = 0; z < sizeZ; z++) {
                let current = obj.getVoxel(x, y, z);
                let coords = { x, y, z };

                directions.forEach(dir => {
                    let last = obj.getVoxel(x + dir.offset.x, y + dir.offset.y, z + dir.offset.z);

                    if (last === null && current !== null) {
                        let slice_index = coords[dir.axis];

                        if (!dir.slices[slice_index]) {
                            let sliceWidth = obj.size[dir.face_axis[0]];
                            let sliceHeight = obj.size[dir.face_axis[1]];

                            let arr = new Array(sliceWidth);
                            for (let k = 0; k < sliceWidth; k++) {
                                arr[k] = new Array(sliceHeight);
                                arr[k].fill(null);
                            }

                            dir.slices[slice_index] = arr;
                        }

                        let slice_coord_a = coords[dir.face_axis[0]];
                        let slice_coord_b = coords[dir.face_axis[1]];

                        dir.slices[slice_index][slice_coord_a][slice_coord_b] = current;
                    }
                })
            }
        }
    }

    directions.forEach(dir => {
        let sliceWidth = obj.size[dir.face_axis[0]];
        let sliceHeight = obj.size[dir.face_axis[1]];

        dir.slices.forEach((slice, slice_index) => {
            let rectangles = optimizeGrid(slice, sliceWidth, sliceHeight);

            rectangles.forEach(r => {
                if (!positionsByColor[r.color]) positionsByColor[r.color] = [];

                //add positive x face
                positionsByColor[r.color].push(...dir.getFace(parseInt(slice_index), r));

                let voxel_coord = {};
                voxel_coord[dir.axis] = parseInt(slice_index);
                voxel_coord[dir.face_axis[0]] = r.a;
                voxel_coord[dir.face_axis[1]] = r.b;

                const mat = file.getMaterial(r.color);
                if (mat?._type === "_emit") {

                    const color = file.getThreeColor(r.color);

                    let light = new PointLight(color, options.lightIntensity, options.lightDistance, options.lightDecay);
                    light.position.set(
                        voxel_coord.x + 0.5,
                        voxel_coord.y + 0.5,
                        voxel_coord.z + 0.5,
                    );

                    lights[voxel_coord.x + "," + voxel_coord.y + "," + voxel_coord.z] = light;
                }
            });
        })
    })

    const geometry = new BufferGeometry();

    const positions = [];
    const materials = [];

    let groupOffset = 0;

    for (const c in positionsByColor) {
        let colorpos = positionsByColor[c];

        let color_index = parseInt(c);

        let vertexCount = colorpos.length / 3;
        geometry.addGroup(groupOffset, vertexCount, materials.length);
        positions.push(...colorpos);

        groupOffset += vertexCount;

        const mat = file.getMaterial(color_index);
        const color = file.getThreeColor(color_index);

        const opts = {
            ...options.defaultMaterialOptions
        };

        if (typeof mat._type !== 'undefined') {
            if (options.enableEmissive && mat._type === '_emit') {
                opts.emissive = color;
                opts.emissiveIntensity = 0.5;
            }

            if (options.enableMetalness && typeof mat._metal !== "undefined") {
                opts.metalness = parseFloat(mat._metal);
            }

            if (options.enableRoughness && typeof mat._rough !== "undefined") {
                opts.roughness = parseFloat(mat._rough);
            }

            if (options.enableGlass && typeof mat._alpha !== "undefined") {
                opts.transparent = true;
                opts.opacity = mat._alpha;
            }
        }

        opts.color = color;

        let meshmat = new MeshStandardMaterial(opts);
        meshmat.name = color_index;

        materials.push(meshmat);
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    geometry.center();

    let sceneObj = new VOXSceneObject(obj);
    sceneObj.init(geometry, materials, Object.values(lights));
    return sceneObj;
}