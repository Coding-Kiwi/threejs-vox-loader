import { Box3, Group, Vector3 } from "three";
import { buildSceneObject } from "./SceneBuilder.js";

export default class VOXScene extends Group {
    constructor(voxfile) {
        super();

        this.voxfile = voxfile;
    }

    init(options) {
        this.voxfile.objects.forEach(obj => {
            let sceneObject = buildSceneObject(this.voxfile, obj, options);
            this.add(sceneObject);
        });

        const box3 = new Box3().setFromObject(this);
        const vector = new Vector3();
        box3.getCenter(vector);

        this.children.forEach(child => {
            child.position.x -= vector.x;
            child.position.y -= vector.y;
            child.position.z -= vector.z;
        });
    }
}