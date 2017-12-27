import {} from 'mocha';
import {} from 'chai';

import { Opcode } from '../dev/Opcode';
import { Register, RAM } from '../dev/RAM';
import { TIA } from '../dev/TIA';

let beforeEachCallback = () => {
    TIA.canvas = document.createElement('canvas');
    RAM.reset();
    Register.PC = 0;
};

describe("TIA", () => {
    beforeEach(beforeEachCallback);

    it("should make exactly 19912 (262 x 76) CPU pulses per frame", () => {
        Opcode[0xFA] = function () {
            return 1;
        };
        
        let rom: Uint8Array = new Uint8Array(19912);
        
        RAM.readRom(rom);

        for(let i in rom) {
            RAM.set(61440 + parseInt(i), 0xFA);
        };

        return TIA.nextFrame().then(() => {
            chai.assert.strictEqual(Register.PC, 262 * 76);
        });
    });
})
