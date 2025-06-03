import path from 'path';
import { readFile } from "fs/promises";

import { VOXLoader, VOXMesh } from '../src/index.js';

async function fixture(name, ...args) {
    return readFile(path.join('tests', 'fixtures', name), ...args);
}

describe('Load the cube model', () => {
    it('should load the model', async () => {
        const loader = new VOXLoader();
        const result = loader.parse(await fixture('cube.vox'))

        expect(result).toBeInstanceOf(VOXMesh);
        expect(result.lights.length).toBe(0);
    });
});