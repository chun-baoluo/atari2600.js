import {} from 'mocha';
import {} from 'chai';

import { Opcode } from '../dev/Opcode';
import { Flag, Register, Rom, RAM } from '../dev/RAM';
import { Convert } from '../dev/Common';

let beforeEachCallback = () => {
    Flag.D = 0;
    Flag.I = 0;
    Flag.N = 0;
    Flag.Z = 0;
    Register.A = 0;
    Register.PC = 0;
    Register.S = 0;
    Register.X = 0;
    Register.Y = 0;
    Rom.data = new Uint8Array([]);
    RAM.reset();    
};

describe("CPU Jump and Control Instructions", () => {
    beforeEach(beforeEachCallback);

    it("(0x10) should jump if Negative flag is set", () => {
        Rom.data = new Uint8Array([0xD0, -0x01, 0x02]);
        Opcode[0x10]();
        chai.assert.strictEqual(Register.PC, 0);

        Flag.N = 1;
        Register.PC = 0;
        Opcode[0x10]();
        chai.assert.strictEqual(Register.PC, 1);
    });

    it("(0x4C) should jump to nnnn", () => {
        Rom.data = new Uint8Array([0x4C, 0x01, 0xFF]);
        Opcode[0x4C]();
        Register.PC++;
        chai.assert.strictEqual(Register.PC, 1);
    });

    it("(0x78) should set the interrupt disable bit", () => {
        Opcode[0x78]();
        chai.assert.strictEqual(Flag.I, 1);
    });

    it("(0xD0) should jump if Zero flag is set", () => {
        Rom.data = new Uint8Array([0xD0, -0x01, 0x02]);
        Opcode[0xD0]();
        chai.assert.strictEqual(Register.PC, 0);

        Flag.Z = 1;
        Register.PC = 0;
        Opcode[0xD0]();
        chai.assert.strictEqual(Register.PC, 1);
    });

    it("(0xD8) should clear decimal mode", () => {
        Flag.D = 1;
        Opcode[0xD8]();
        chai.assert.strictEqual(Flag.D, 0);
    });

    it("(0xEA) should do nothing", () => {
        Opcode[0xEA]();
    });
});

describe("CPU Memory and Register Transfers", () => {
    beforeEach(beforeEachCallback);

    it("(0x84) should set an address value (nn) to be equal register Y", () => {
        RAM.set(0x32, 2);
        Rom.data = new Uint8Array([0x84, 0x32]);
        Register.Y = 5;

        Opcode[0x84]();
        chai.assert.strictEqual(RAM.get(0x32), Register.Y);
    });

    it("(0x85) should set an address value (nn) to be equal register A", () => {
        RAM.set(0x32, 2);
        Rom.data = new Uint8Array([0x85, 0x32]);
        Register.A = 5;

        Opcode[0x85]();
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
    });

    it("(0x86) should set an address value (nn) to be equal register X", () => {
        RAM.set(0x32, 0);
        Rom.data = new Uint8Array([0x86, 0x32]);
        Register.X = 5;

        Opcode[0x86]();
        chai.assert.strictEqual(RAM.get(0x32), Register.X);
    });
    
    it("(0x8A) should set register A to be equal register X, change N and Z flags", () => {
        Register.X = 0xFA;
        Flag.Z = 1;
        
        Opcode[0x8A]();
        
        chai.assert.strictEqual(Register.A, Register.X);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        Register.X = 0;

        Opcode[0x8A]();
        chai.assert.strictEqual(Register.A, Register.X);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0x8D) should set an address value (nnnn) to be equal register A", () => {
        RAM.set(0x01, 0);
        Rom.data = new Uint8Array([0x85, 0x01, 0x00]);
        Register.A = 5;

        Opcode[0x95]();
        chai.assert.strictEqual(RAM.get(0x01), Register.A);
    });

    it("(0x95) should set an address value + X register to be equal register A", () => {
        RAM.set(0x32, 0);
        Rom.data = new Uint8Array([0x95, 0x31]);
        Register.X = 0x01;
        Register.A = 5;

        Opcode[0x95]();
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
    });

    it("(0x9A) should set register S to be equal register X", () => {
        Register.X = 0xAA;
        Opcode[0x9A]();
        chai.assert.strictEqual(Register.S, Register.X);
    });

    it("(0xA0) should set register Y to #nn, change N and Z flags", () => {
        Rom.data = new Uint8Array([0xA0, 0xFF, 0]);
        Flag.Z = 1;

        Opcode[0xA0]();
        chai.assert.strictEqual(Register.Y, Rom.data[1]);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        Opcode[0xA0]();
        chai.assert.strictEqual(Register.Y, Rom.data[2]);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xA2) should set register X to #nn, change N and Z flags", () => {
        Rom.data = new Uint8Array([0xA2, 0xFF, 0]);
        Flag.Z = 1;

        Opcode[0xA2]();
        chai.assert.strictEqual(Register.X, Rom.data[1]);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        Opcode[0xA2]();
        chai.assert.strictEqual(Register.X, Rom.data[2]);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });
    
    it("(0xA5) should set register A to nn, change N and Z flags", () => {
        RAM.set(0x01, 5);
        Rom.data = new Uint8Array([0xA5, 0x01]);

        Opcode[0xA5]();
        chai.assert.strictEqual(RAM.get(0x01), Register.A);
    });
    
    it("(0xA6) should set register X to nn, change N and Z flags", () => {
        RAM.set(0x01, 5);
        Rom.data = new Uint8Array([0xA6, 0x01]);

        Opcode[0xA6]();
        chai.assert.strictEqual(RAM.get(0x01), Register.X);
    });

    it("(0xA9) should set register A to #nn, change N and Z flags", () => {
        Rom.data = new Uint8Array([0xA9, 0xFF, 0]);
        Flag.Z = 1;

        Opcode[0xA9]();
        chai.assert.strictEqual(Register.A, Rom.data[1]);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        Opcode[0xA9]();
        chai.assert.strictEqual(Register.A, Rom.data[2]);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });
    
    it("(0xAA) should set register X to be equal register A, change N and Z flags", () => {
        Register.A = 0xFA;
        Flag.Z = 1;
        
        Opcode[0xAA]();
        
        chai.assert.strictEqual(Register.X, Register.A);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        Register.A = 0;

        Opcode[0xAA]();
        chai.assert.strictEqual(Register.X, Register.A);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xAD) should set register A to nnnn, change N and Z flags", () => {
        RAM.set(0x01, 0xFA);
        RAM.set(0x02, 0);
        Rom.data = new Uint8Array([0xAD, 0x01, 0x00, 0x02, 0x00]);
        Flag.Z = 1;

        Opcode[0xAD]();
        chai.assert.strictEqual(RAM.get(0x01), Register.A);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        
        Opcode[0xAD]();
        chai.assert.strictEqual(RAM.get(0x02), Register.A);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        
    });
    
    it("(0xBD) should set register A to nnnn + X, change N and Z flags", () => {
        RAM.set(0x32, 0xFA);
        RAM.set(0x34, 0);
        Rom.data = new Uint8Array([0xAD, 0x31, 0x00, 0x33, 0x00]);
        Register.X = 1;
        Flag.Z = 1;

        Opcode[0xBD]();
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        
        Opcode[0xBD]();
        chai.assert.strictEqual(RAM.get(0x34), Register.A);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });
});

describe("CPU Arithmetic/Logical Operations", () => {
    beforeEach(beforeEachCallback);

    it("(0x88) should decrement register Y by one, change N and Z flags", () => {
        let value: number = new Uint8Array([0xFF])[0];
        Register.Y = value;
        Flag.Z = 1;

        Opcode[0x88]();
        chai.assert.strictEqual(Register.Y, value - 1);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        value = new Uint8Array([0x01])[0];
        Register.Y = value;

        Opcode[0x88]();
        chai.assert.strictEqual(Register.Y, value - 1);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });
    
    it("(0xC0) should compare results of Y - #nn, set N, Z and C flags", () => {
        Rom.data = new Uint8Array([0xE0, 0x32, 0x32, 0x36]);
        Register.Y = 0x07;
        Flag.Z = 1;

        Opcode[0xC0]();
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.Y = 0x32;
        
        Opcode[0xC0]();
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);
        
        Register.Y = 0x38;
        
        Opcode[0xC0]();
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });
    
    it("(0xC6) should decrement nn by one, change N and Z flags", () => {
        Rom.data = new Uint8Array([0xE6, 0x32, 0x33]);
        Flag.Z = 1;

        RAM.set(0x32, 0xFA);
        Opcode[0xC6]();
        
        chai.assert.strictEqual(RAM.get(0x32), 0xF9);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        RAM.set(0x33, 0x01);
        Opcode[0xC6]();
        
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });
    
    it("(0xC8) should increment register Y by one, change N and Z flags", () => {
        let value: number = new Uint8Array([0xE8])[0];
        Register.Y = value;
        Flag.Z = 1;

        Opcode[0xC8]();
        chai.assert.strictEqual(Register.Y, Convert.toUint8(value + 1));
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        value = new Uint8Array([0xFF])[0];
        Register.Y = value;

        Opcode[0xC8]();
        chai.assert.strictEqual(Register.Y, Convert.toUint8(value + 1));
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xCA) should decrement register X by one, change N and Z flags", () => {
        let value: number = new Uint8Array([0xFF])[0];
        Register.X = value;
        Flag.Z = 1;

        Opcode[0xCA]();
        chai.assert.strictEqual(Register.X, value - 1);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        value = new Uint8Array([0x01])[0];
        Register.X = value;

        Opcode[0xCA]();
        chai.assert.strictEqual(Register.X, value - 1);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });
    
    it("(0xE0) should compare results of X - #nn, set N, Z and C flags", () => {
        Rom.data = new Uint8Array([0xE0, 0x32, 0x32, 0x36]);
        Register.X = 0x07;
        Flag.Z = 1;

        Opcode[0xE0]();
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.X = 0x32;
        
        Opcode[0xE0]();
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);
        
        Register.X = 0x38;
        
        Opcode[0xE0]();
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xE6) should increment nn by one, change N and Z flags", () => {
        Rom.data = new Uint8Array([0xE6, 0x32, 0x33]);
        Flag.Z = 1;

        RAM.set(0x32, 0xFA);
        Opcode[0xE6]();
        
        chai.assert.strictEqual(RAM.get(0x32), 0xFB);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        RAM.set(0x33, 0xFF);
        Opcode[0xE6]();
        
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xE8) should increment register X by one, change N and Z flags", () => {
        let value: number = new Uint8Array([0xE8])[0];
        Register.X = value;
        Flag.Z = 1;

        Opcode[0xE8]();
        chai.assert.strictEqual(Register.X, Convert.toUint8(value + 1));
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        value = new Uint8Array([0xFF])[0];
        Register.X = value;

        Opcode[0xE8]();
        chai.assert.strictEqual(Register.X, Convert.toUint8(value + 1));
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });
});
