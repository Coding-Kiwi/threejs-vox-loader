import { VOXLoader } from '../src/index.js';

describe('built VOXLoader', () => {
    it('should pass smoke test', () => {
        const loader = new VOXLoader();
        expect(loader).toBeInstanceOf(VOXLoader);
    });
});