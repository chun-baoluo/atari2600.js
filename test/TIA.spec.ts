import {} from 'mocha';
import {} from 'chai';

import { Opcode } from '../dev/Opcode';
import { Register, RAM } from '../dev/RAM';
import { TIA } from '../dev/TIA';

let beforeEachCallback = () => {
    TIA.canvas = document.createElement('canvas');
    RAM.reset();
    Register.PC = 61440;
};

describe("TIA", () => {
    beforeEach(beforeEachCallback);

    it("should make exactly 19912 (262 x 76) CPU pulses per frame", function() {
        Opcode[0xFA] = function () {
            return 1;
        };

        this.timeout(0);

        RAM.memory = new Uint8Array(0xF000 + 19912);

        for(let i = 0; i < 19912; i++) {
            RAM.set(0xF000 + i, 0xFA);
        };

        return TIA.nextFrame().then(() => {
            chai.assert.strictEqual(Register.PC - 0xF000, 262 * 76);
        });
    });
})
