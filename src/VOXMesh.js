import { Mesh } from "three";

export default class VOXMesh extends Mesh {
    constructor(geometry, materials, lights) {
        super(geometry, materials);
        this.lights = lights;
    }
}