import {} from 'mocha';
import {} from 'chai';

import { Opcode } from '../dev/Opcode';
import { Flag, Register, Rom } from '../dev/RAM';

describe("Opcode", () => {
    beforeEach(() => {
        Flag.D = 0;
        Flag.I = 0;
        Register.PC = 0;
        Rom.data = new Int8Array([]);
    });

    it("(0x78) should set interrupt disable bit", () => {
        
        Opcode[0x78]();
        chai.assert.strictEqual(Flag.I, 1);
    });
    
    it("(0xa2) should set register X to nn, change N and Z flags", () => {
        Rom.data = new Int8Array([0xa2, 0xff, 0]);
        
        Opcode[0xa2]();
        chai.assert.strictEqual(Register.X, Rom.data[1]);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        
        Opcode[0xa2]();
        chai.assert.strictEqual(Register.X, Rom.data[2]);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });
    
    it("(0xd8) should clear decimal mode", () => {
        Flag.D = 1;
        Opcode[0xd8]();
        chai.assert.strictEqual(Flag.D, 0);
    });
});