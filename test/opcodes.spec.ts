import {} from 'mocha';
import {} from 'chai';

import { Opcode } from '../dev/Opcode';
import { Flag, Register, Rom, RAM } from '../dev/RAM';
import { Convert } from '../dev/Common';

describe("CPU Jump and Control Instructions", () => {
    beforeEach(() => {
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
    });
    
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
});

describe("CPU Memory and Register Transfers", () => {
    beforeEach(() => {
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
    });

    it("(0x85) should set an address value (nn) to be equal regsiter A", () => {
        RAM.set(0x32, 2);
        Rom.data = new Uint8Array([0x85, 0x32]);
        Register.A = 5;
        
        Opcode[0x85]();
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
    });
    
    it("(0x86) should set an address value (nn) to be equal regsiter X", () => {
        RAM.set(0x32, 0);
        Rom.data = new Uint8Array([0x86, 0x32]);
        Register.X = 5;
        
        Opcode[0x86]();
        chai.assert.strictEqual(RAM.get(0x32), Register.X);
    });
    
    it("(0x8D) should set an address value (nnnn) to be equal regsiter A", () => {
        RAM.set(0x01, 0);
        Rom.data = new Uint8Array([0x85, 0x01, 0x00]);
        Register.A = 5;
        
        Opcode[0x95]();
        chai.assert.strictEqual(RAM.get(0x01), Register.A);
    });
    
    it("(0x95) should set an address value + X register to be equal regsiter A", () => {
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

    it("(0xA0) should set register Y to nn, change N and Z flags", () => {
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
    
    it("(0xA2) should set register X to nn, change N and Z flags", () => {
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
    
    it("(0xA9) should set register A to nn, change N and Z flags", () => {
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
    
    it("(0xAD) should set register A to nnnn, change N and Z flags", () => {
        RAM.set(0x01, 5);
        Rom.data = new Uint8Array([0xAD, 0x01, 0x00]);
        
        Opcode[0xAD]();
        chai.assert.strictEqual(RAM.get(0x01), Register.A);
    });
});

describe("CPU Arithmetic/Logical Operations", () => {
    beforeEach(() => {
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
    });
    
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