import {
    FileLoader,
    Loader,
    Matrix4
} from 'three';

import VOXFile from "./VOXFile.js";
import VOXScene from './VOXScene.js';

function unpackRotation(byte) {
    const row0Index = (byte >> 0) & 0b11;
    const row1Index = (byte >> 2) & 0b11;
    const row0Sign = (byte >> 4) & 0b1;
    const row1Sign = (byte >> 5) & 0b1;
    const row2Sign = (byte >> 6) & 0b1;

    const usedIndices = [row0Index, row1Index];
    const row2Index = [0, 1, 2].find(i => !usedIndices.includes(i));

    const R = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];

    R[0][row0Index] = row0Sign ? -1 : 1;
    R[1][row1Index] = row1Sign ? -1 : 1;
    R[2][row2Index] = row2Sign ? -1 : 1;

    return R;
}

export default class VOXLoader extends Loader {
    constructor(opts = {}, manager) {
        super(manager);
        this.loader = new FileLoader(manager);

        this.options = Object.assign({
            defaultMaterialOptions: {
                flatShading: true,
                roughness: 0,
                metalness: 0
            },
            enableMetalness: true,
            enableRoughness: true,
            enableGlass: true,
            enableEmissive: true,
            lightIntensity: 10,
            lightDistance: 3,
            lightDecay: 2,
        }, opts);
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
        file.version = file.readInt32();
        file.readDefaultPalette();

        while (file.head < file.buffer.length) {
            file.readNextChunk();
        }

        delete file.head;
        delete file.buffer;

        //rearrange models based on scene graph

        for (const node_id in file.nodes) {
            const node = file.nodes[node_id];
            if (node.type !== "S") continue;

            let model_ids = node.models.map(m => m.id);

            let parentT = null;
            let current = node.id;
            while (!parentT) {
                let parent = Object.values(file.nodes).find(p => p.child_node_ids && p.child_node_ids.includes(current));
                if (!parent) break;

                current = parent.id;

                if (parent.type === "T") parentT = parent;
            }

            if (parentT && parentT.frames.length && parentT.frames[0]._t) {
                model_ids.forEach(m => {
                    let pos = parentT.frames[0]._t.split(" ").map(i => parseInt(i));

                    file.objects[m].position = {
                        x: pos[0],
                        y: pos[1],
                        z: pos[2],
                    };

                    let rot = parentT.frames[0]._r;
                    if (rot) {
                        rot = unpackRotation(rot);

                        // Transpose the rot 3x3 row-major into column-major
                        const m11 = rot[0][0], m12 = rot[0][1], m13 = rot[0][2];
                        const m21 = rot[1][0], m22 = rot[1][1], m23 = rot[1][2];
                        const m31 = rot[2][0], m32 = rot[2][1], m33 = rot[2][2];

                        const matrix = new Matrix4();
                        matrix.set(
                            m13, m23, m33, 0,
                            m11, m21, m31, 0,
                            m12, m22, m32, 0,
                            0, 0, 0, 1
                        );

                        file.objects[m].rotation = matrix;
                    }
                })
            }
        }

        // === build the scene ===

        const scene = new VOXScene(file);
        scene.init(this.options);
        return scene;
    }
}