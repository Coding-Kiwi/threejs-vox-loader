import { readFile } from "fs/promises";
import path from 'path';

import { VOXLoader, VOXScene } from '../src/index.js';

async function fixture(name, ...args) {
    return readFile(path.join('tests', 'fixtures', name), ...args);
}

describe('Load the cube model', () => {
    it('should load the model', async () => {
        const loader = new VOXLoader();
        const result = loader.parse(await fixture('cube.vox'))

        expect(result).toBeInstanceOf(VOXScene);
        expect(result.children[0].lights.length).toBe(0);
    });
});