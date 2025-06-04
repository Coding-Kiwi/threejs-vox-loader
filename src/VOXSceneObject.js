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
            light.position.x -= this.obj.size.x * 0.5;
            light.position.y -= this.obj.size.y * 0.5;
            light.position.z -= this.obj.size.z * 0.5;
            this.add(light);
        }

        this.position.set(
            this.obj.position.y,
            this.obj.position.z,
            this.obj.position.x
        );

        if (this.obj.rotation) {
            this.setRotationFromMatrix(this.obj.rotation);
        }
    }
}