import {} from 'mocha';
import {} from 'chai';

import { Opcode } from '../dev/Opcode';
import { Register, Rom } from '../dev/RAM';
import { TIA } from '../dev/TIA';

let beforeEachCallback = () => {
    TIA.canvas = document.createElement('canvas');
    Rom.data = new Uint8Array(65330);
    Register.PC = 0;
};

describe("TIA", () => {
    beforeEach(beforeEachCallback);

    it("should make exactly 19912 (262 x 76) CPU pulses per frame", () => {
        Opcode[0xFA] = function () {
            return 1;
        };

        for(let i in Rom.data) {
            Rom.data[i] = 0xFA;
        };

        return TIA.nextFrame().then(() => {
            chai.assert.strictEqual(Register.PC, 262 * 76);
        });
    });
})
