export default class ModelObject {
    constructor(size) {
        this.size = size;
        this.voxels = [];
        this.position = { x: 0, y: 0, z: 0 }
    }

    getVoxel(x, y, z) {
        const offset_y = this.size.x;
        const offset_z = this.size.x * this.size.y;

        const index = x + (y * offset_y) + (z * offset_z);
        return this.voxels[index];
    }
}