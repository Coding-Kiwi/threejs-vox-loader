export default class ModelObject {
    constructor(size) {
        this.size = size;
        this.voxels = [];
        this.position = { x: 0, y: 0, z: 0 }
    }

    getVoxel(x, y, z) {
        if (x < 0 || y < 0 || z < 0 || x >= this.size.x || y >= this.size.y || z >= this.size.z) return null;
        return this.voxels[x + y * this.size.x + z * this.size.x * this.size.y];
    }
}