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

    flipToThree() {
        const sizeX = this.size.x;
        const sizeY = this.size.y;
        const sizeZ = this.size.z;

        const targetSizeX = this.size.y;
        const targetSizeY = this.size.z;
        const targetSizeZ = this.size.x;

        let three_voxels = new Array(targetSizeX * targetSizeY * targetSizeZ);
        three_voxels.fill(null);

        for (let x = 0; x < sizeX; x++) {
            for (let y = 0; y < sizeY; y++) {
                for (let z = 0; z < sizeZ; z++) {
                    let voxel = this.voxels[x + y * sizeX + z * sizeX * sizeY];

                    let targetX = y;
                    let targetY = z;
                    let targetZ = x;

                    three_voxels[targetX + targetY * targetSizeX + targetZ * targetSizeX * targetSizeY] = voxel;
                }
            }
        }

        this.voxels = three_voxels;

        this.size = {
            x: targetSizeX,
            y: targetSizeY,
            z: targetSizeZ,
        };
    }
}