import { Group, Mesh } from "three";

export default class VOXSceneObject extends Group {
    constructor(obj) {
        super();
        this.obj = obj;
    }

    init(geometry, materials, lights) {
        this.lights = lights;

        let mesh = new Mesh(geometry, materials);
        this.add(mesh);

        for (const l in this.lights) {
            const light = this.lights[l];
            this.add(light);
        }

        //set the position of the object in the scene
        //the anchor of each object is in its center, so translate by half the size
        this.position.set(
            this.obj.position.y - this.obj.size.y * 0.5,
            this.obj.position.z - this.obj.size.z * 0.5,
            this.obj.position.x - this.obj.size.x * 0.5
        );

        if (this.obj.rotation) {
            this.setRotationFromMatrix(this.obj.rotation);
        }
    }
}