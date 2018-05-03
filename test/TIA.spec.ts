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

    it("should make exactly 19912 (262 x 76) CPU pulses per frame", () => {
        Opcode[0xFA] = function () {
            return 1;
        };

        let rom: Uint8Array = new Uint8Array(19912);

        RAM.memory[0x0FFC] = 0;
        RAM.memory[0x0FFD] = 0xF0;

        RAM.readRom([rom], '4KB');

        Register.PC = 0xF000;

        for(let i in rom) {
            RAM.set(61440 + parseInt(i), 0xFA);
        };

        return TIA.nextFrame().then(() => {
            chai.assert.strictEqual(Register.PC - 61440, 262 * 76);
        });
    });
})
