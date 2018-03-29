import {} from 'mocha';
import {} from 'chai';

import { Convert } from '../dev/Common';

describe("Conversion functions", () => {
    it("should convert number to Uint8", () => {
        chai.assert.strictEqual(Convert.toUint8(257), 1);
        chai.assert.strictEqual(Convert.toUint8(455), 199);
    });

    it("should convert number to Int8", () => {
        chai.assert.strictEqual(Convert.toInt8(55), 55);
        chai.assert.strictEqual(Convert.toInt8(240), -16);
    });

    it("should convert number to it's binary representation", () => {
        chai.assert.strictEqual(Convert.toBin(3), '00000011');
        chai.assert.strictEqual(Convert.toBin(24), '00011000');
    });

    it("should convert decimal to BCD", () => {
        chai.assert.strictEqual(Convert.toBCD(37), 55);
        chai.assert.strictEqual(Convert.toBCD(29), 41);
    });

    it("should convert BCD to decimal", () => {
        chai.assert.strictEqual(Convert.toDecBCD(55), 37);
        chai.assert.strictEqual(Convert.toDecBCD(41), 29);
    });
});
