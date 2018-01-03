import {} from 'mocha';
import {} from 'chai';

import { Opcode } from '../dev/Opcode';
import { Flag, Register, RAM } from '../dev/RAM';
import { Convert } from '../dev/Common';

let beforeEachCallback = () => {
    Flag.B = 0;
    Flag.C = 0;
    Flag.D = 0;
    Flag.I = 0;
    Flag.N = 0;
    Flag.V = 0;
    Flag.Z = 0;
    Register.A = 0;
    Register.PC = 0;
    Register.S = 0;
    Register.X = 0;
    Register.Y = 0;
    RAM.reset();
};

describe("CPU Jump and Control Instructions", () => {
    beforeEach(beforeEachCallback);

    it("(0x00) should set break and interrupt flags, increase programm counter by two and put it to the stack pointer", () => {
        chai.assert.strictEqual(Opcode[0x00](), 7);
        chai.assert.strictEqual(Flag.B, 1);
        chai.assert.strictEqual(Flag.I, 1);
        // chai.assert.strictEqual(Register.PC, 2);
        chai.assert.strictEqual(Register.S, Register.PC);
    });

    it("(0x10) should jump if Negative flag isn't set", () => {
        RAM.readRom(new Uint8Array([0xD0, -0x01, 0x02]));

        chai.assert.strictEqual(Opcode[0x10](), 3);
        chai.assert.strictEqual(Register.PC, 0);

        Flag.N = 1;
        Register.PC = 0;
        chai.assert.strictEqual(Opcode[0x10](), 2);
        chai.assert.strictEqual(Register.PC, 1);
    });

    it("(0x18) should clear the carry flag", () => {
        Flag.C = 1;
        chai.assert.strictEqual(Opcode[0x18](), 2);
        chai.assert.strictEqual(Flag.C, 0);
    });

    it("(0x20) should jump to subroutine", () => {
        RAM.readRom(new Uint8Array([0x20, 0x05, 0xF0, 0xA5, 0x01, 0x60]));

        chai.assert.strictEqual(Opcode[0x20](), 6);
        chai.assert.strictEqual(Register.PC, 4);
    });

    it("(0x30) should jump if Negative flag is set", () => {
        RAM.readRom(new Uint8Array([0xD0, -0x01, 0x02]));
        Flag.N = 1;
        chai.assert.strictEqual(Opcode[0x30](), 3);
        chai.assert.strictEqual(Register.PC, 0);

        Flag.N = 0;
        Register.PC = 0;
        chai.assert.strictEqual(Opcode[0x30](), 2);
        chai.assert.strictEqual(Register.PC, 1);
    });

    it("(0x38) should set the carry flag", () => {
        chai.assert.strictEqual(Opcode[0x38](), 2);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x4C) should jump to nnnn", () => {
        RAM.readRom(new Uint8Array([0x4C, 0x01, 0xFF]));

        chai.assert.strictEqual(Opcode[0x4C](), 3);

        Register.PC++;
        chai.assert.strictEqual(Register.PC, 1);
    });

    it("(0x58) should clear the interrupt disable bit", () => {
        Flag.I = 1;
        chai.assert.strictEqual(Opcode[0x58](), 2);
        chai.assert.strictEqual(Flag.I, 0);
    });

    it("(0x60) should return from subroutine", () => {
        RAM.stack.push(6);

        chai.assert.strictEqual(Opcode[0x60](), 6);
        chai.assert.strictEqual(Register.PC, 6);
    });

    it("(0x78) should set the interrupt disable bit", () => {
        chai.assert.strictEqual(Opcode[0x78](), 2);
        chai.assert.strictEqual(Flag.I, 1);
    });

    it("(0x90) should jump if Carry flag isn't set", () => {
        RAM.readRom(new Uint8Array([0xD0, 0xFF, 0x02]));

        chai.assert.strictEqual(Opcode[0x90](), 3);
        chai.assert.strictEqual(Register.PC, 0);

        Flag.C = 1;
        Register.PC = 0;
        chai.assert.strictEqual(Opcode[0x90](), 2);
        chai.assert.strictEqual(Register.PC, 1);
    });

    it("(0xB0) should jump if Carry flag is set", () => {
        RAM.readRom(new Uint8Array([0xB0, 0xFF, 0x02]));

        Flag.C = 1;

        chai.assert.strictEqual(Opcode[0xB0](), 3);
        chai.assert.strictEqual(Register.PC, 0);

        Flag.C = 0;

        Register.PC = 0;
        chai.assert.strictEqual(Opcode[0xB0](), 2);
        chai.assert.strictEqual(Register.PC, 1);
    });

    it("(0xB8) should clear the overflow flag", () => {
        Flag.V = 1;
        chai.assert.strictEqual(Opcode[0xB8](), 2);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0xD0) should jump if Zero flag isn/'t set", () => {
        RAM.readRom(new Uint8Array([0xD0, -0x01, 0x02]));

        chai.assert.strictEqual(Opcode[0xD0](), 3);
        chai.assert.strictEqual(Register.PC, 0);

        Flag.Z = 1;
        Register.PC = 0;
        chai.assert.strictEqual(Opcode[0xD0](), 2);
        chai.assert.strictEqual(Register.PC, 1);
    });

    it("(0xD8) should clear the decimal mode", () => {
        Flag.D = 1;
        chai.assert.strictEqual(Opcode[0xD8](), 2);
        chai.assert.strictEqual(Flag.D, 0);
    });

    it("(0xEA) should do nothing", () => {
        chai.assert.strictEqual(Opcode[0xEA](), 2);
    });

    it("(0xF0) should jump if Zero flag is set", () => {
        RAM.readRom(new Uint8Array([0xD0, -0x01, 0x02]));

        chai.assert.strictEqual(Opcode[0xF0](), 2);
        chai.assert.strictEqual(Register.PC, 1);

        Flag.Z = 1;
        Register.PC = 0;
        chai.assert.strictEqual(Opcode[0xF0](), 3);
        chai.assert.strictEqual(Register.PC, 0);
    });

    it("(0xF8) should set the decimal mode", () => {
        chai.assert.strictEqual(Opcode[0xF8](), 2);
        chai.assert.strictEqual(Flag.D, 1);
    });
});

describe("CPU Memory and Register Transfers", () => {
    beforeEach(beforeEachCallback);

    it("(0x84) should set an address value (nn) to be equal register Y", () => {
        RAM.set(0x32, 2);
        RAM.readRom(new Uint8Array([0x84, 0x32]));
        Register.Y = 5;

        chai.assert.strictEqual(Opcode[0x84](), 3);
        chai.assert.strictEqual(RAM.get(0x32), Register.Y);
    });

    it("(0x85) should set an address value (nn) to be equal register A", () => {
        RAM.set(0x32, 2);
        RAM.readRom(new Uint8Array([0x85, 0x32]));
        Register.A = 5;

        chai.assert.strictEqual(Opcode[0x85](), 3);
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
    });

    it("(0x86) should set an address value (nn) to be equal register X", () => {
        RAM.set(0x32, 0);
        RAM.readRom(new Uint8Array([0x86, 0x32]));
        Register.X = 5;

        chai.assert.strictEqual(Opcode[0x86](), 3);
        chai.assert.strictEqual(RAM.get(0x32), Register.X);
    });

    it("(0x8A) should set register A to be equal register X, change N and Z flags", () => {
        Register.X = 0xFA;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x8A](), 2);

        chai.assert.strictEqual(Register.A, Register.X);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        Register.X = 0;

        chai.assert.strictEqual(Opcode[0x8A](), 2);
        chai.assert.strictEqual(Register.A, Register.X);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0x8D) should set an address value (nnnn) to be equal register A", () => {
        RAM.set(0x01, 0);
        RAM.readRom(new Uint8Array([0x85, 0x01, 0x00]));
        Register.A = 5;

        chai.assert.strictEqual(Opcode[0x8D](), 4);
        chai.assert.strictEqual(RAM.get(0x01), Register.A);
    });

    it("(0x95) should set an address value + X register to be equal register A", () => {
        RAM.set(0x32, 0);
        RAM.readRom(new Uint8Array([0x95, 0x31]));
        Register.X = 0x01;
        Register.A = 5;

        chai.assert.strictEqual(Opcode[0x95](), 4);
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
    });

    it("(0x98) should set register A to be equal register Y, change N and Z flags", () => {
        Register.Y = 0xFA;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x98](), 2);
        chai.assert.strictEqual(Register.A, Register.Y);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        Register.Y = 0;

        chai.assert.strictEqual(Opcode[0x98](), 2);
        chai.assert.strictEqual(Register.A, Register.Y);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0x9A) should set register S to be equal register X", () => {
        Register.X = 0xAA;
        chai.assert.strictEqual(Opcode[0x9A](), 2);
        chai.assert.strictEqual(Register.S, Register.X);
    });

    it("(0xA0) should set register Y to #nn, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xA0, 0xFF, 0]));
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xA0](), 2);
        chai.assert.strictEqual(Register.Y, RAM.rom(1));
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xA0](), 2);
        chai.assert.strictEqual(Register.Y, RAM.rom(2));
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xA2) should set register X to #nn, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xA2, 0xFF, 0]));
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xA2](), 2);
        chai.assert.strictEqual(Register.X, RAM.rom(1));
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xA2](), 2);
        chai.assert.strictEqual(Register.X, RAM.rom(2));
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xA4) should set register Y to nn, change N and Z flags", () => {
        RAM.set(0x01, 5);
        RAM.readRom(new Uint8Array([0xA4, 0x01]));

        chai.assert.strictEqual(Opcode[0xA4](), 3);
        chai.assert.strictEqual(RAM.get(0x01), Register.Y);
    });

    it("(0xA5) should set register A to nn, change N and Z flags", () => {
        RAM.set(0x01, 5);
        RAM.readRom(new Uint8Array([0xA5, 0x01]));

        chai.assert.strictEqual(Opcode[0xA5](), 3);
        chai.assert.strictEqual(RAM.get(0x01), Register.A);
    });

    it("(0xA6) should set register X to nn, change N and Z flags", () => {
        RAM.set(0x01, 5);
        RAM.readRom(new Uint8Array([0xA6, 0x01]));

        chai.assert.strictEqual(Opcode[0xA6](), 3);
        chai.assert.strictEqual(RAM.get(0x01), Register.X);
    });

    it("(0xA8) should set register Y to be equal register A, change N and Z flags", () => {
        Register.A = 0xFA;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xA8](), 2);
        chai.assert.strictEqual(Register.Y, Register.A);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        Register.A = 0;

        chai.assert.strictEqual(Opcode[0xA8](), 2);
        chai.assert.strictEqual(Register.Y, Register.A);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xA9) should set register A to #nn, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xA9, 0xFF, 0]));
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xA9](), 2);
        chai.assert.strictEqual(Register.A, RAM.rom(1));
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xA9](), 2);
        chai.assert.strictEqual(Register.A, RAM.rom(2));
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xAA) should set register X to be equal register A, change N and Z flags", () => {
        Register.A = 0xFA;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xAA](), 2);
        chai.assert.strictEqual(Register.X, Register.A);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        Register.A = 0;

        chai.assert.strictEqual(Opcode[0xAA](), 2);
        chai.assert.strictEqual(Register.X, Register.A);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xAD) should set register A to nnnn, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xAD, 0x01, 0x00, 0x02, 0x00]));
        RAM.set(0x01, 0xFA);
        RAM.set(0x02, 0);
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xAD](), 4);
        chai.assert.strictEqual(RAM.get(0x01), Register.A);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xAD](), 4);
        chai.assert.strictEqual(RAM.get(0x02), Register.A);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xB5) should set register A to be equal nn + X", () => {
        Register.A = 5;
        RAM.readRom(new Uint8Array([0xB5, 0x31]));
        RAM.set(0x32, 3);
        Register.X = 0x01;

        chai.assert.strictEqual(Opcode[0xB5](), 4);
        chai.assert.strictEqual(Register.A, 3);
    });

    it("(0xB9) should set register A to nnnn + Y, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xAD, 0x31, 0x00, 0x33, 0x00]));
        RAM.set(0x32, 0xFA);
        RAM.set(0x34, 0);
        Register.Y = 1;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xB9](), 5);
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xB9](), 5);
        chai.assert.strictEqual(RAM.get(0x34), Register.A);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xBC) should set register Y to nnnn + X, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xAD, 0x31, 0x00, 0x33, 0x00]));
        RAM.set(0x32, 0xFA);
        RAM.set(0x34, 0);
        Register.X = 1;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xBC](), 5);
        chai.assert.strictEqual(RAM.get(0x32), Register.Y);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xBC](), 5);
        chai.assert.strictEqual(RAM.get(0x34), Register.Y);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xBD) should set register A to nnnn + X, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xAD, 0x31, 0x00, 0x33, 0x00]));
        RAM.set(0x32, 0xFA);
        RAM.set(0x34, 0);
        Register.X = 1;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xBD](), 5);
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xBD](), 5);
        chai.assert.strictEqual(RAM.get(0x34), Register.A);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xBE) should set register X to nnnn + Y, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xAD, 0x31, 0x00, 0x33, 0x00]));
        RAM.set(0x32, 0xFA);
        RAM.set(0x34, 0);
        Register.Y = 1;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xBE](), 5);
        chai.assert.strictEqual(RAM.get(0x32), Register.X);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xBE](), 5);
        chai.assert.strictEqual(RAM.get(0x34), Register.X);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });
});

describe("CPU Arithmetic/Logical Operations", () => {
    beforeEach(beforeEachCallback);

    it("(0x09) should do OR operation with A and #nn, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xE0, 0x00, 0xFF]));

        Register.A = 0;

        chai.assert.strictEqual(Opcode[0x09](), 2);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x09](), 2);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x0A) should left shift register A, change N, Z and C flags", () => {
        Register.A = 0xFF;

        chai.assert.strictEqual(Opcode[0x0A](), 2);
        chai.assert.strictEqual(Register.A, 0xFE);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x0A](), 2);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x16) should left shift nn + X, change N, Z and C flags", () => {
        RAM.readRom(new Uint8Array([0x16, 0x31, 0x32]));
        Register.X = 0x01;
        RAM.set(0x32, 0xFF);

        chai.assert.strictEqual(Opcode[0x16](), 6);
        chai.assert.strictEqual(RAM.get(0x32), 0xFE);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        RAM.set(0x33, 128);

        chai.assert.strictEqual(Opcode[0x16](), 6);
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x26) should rotate left through carry nn, change N, Z and C flags", () => {
        RAM.readRom(new Uint8Array([0x36, 0x32, 0x33]));
        RAM.set(0x32, 0xFF);

        chai.assert.strictEqual(Opcode[0x26](), 5);
        chai.assert.strictEqual(RAM.get(0x32), 0xFE);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        RAM.set(0x33, 127);

        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x26](), 5);
        chai.assert.strictEqual(RAM.get(0x33), 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);
    });

    it("(0x29) should do AND operation with A and #nn, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xE0, 0x01, 0xFF]));

        Register.A = 0x02;

        chai.assert.strictEqual(Opcode[0x29](), 2);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x29](), 2);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x36) should rotate left through carry nn + X, change N, Z and C flags", () => {
        RAM.readRom(new Uint8Array([0x36, 0x31, 0x32]));
        Register.X = 0x01;
        RAM.set(0x32, 0xFF);

        chai.assert.strictEqual(Opcode[0x36](), 6);
        chai.assert.strictEqual(RAM.get(0x32), 0xFE);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        RAM.set(0x33, 127);

        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x36](), 6);
        chai.assert.strictEqual(RAM.get(0x33), 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);
    });

    it("(0x3D) should do AND operation with A and nnnn + X, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0x3D, 0x31, 0x00, 0x32, 0x00]));
        RAM.set(0x32, 0x00);
        RAM.set(0x33, 0xFF);

        Register.X = 0x01;
        Register.A = 0x02;

        chai.assert.strictEqual(Opcode[0x3D](), 5);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x3D](), 5);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x45) should do XOR operation with A and nn, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0x45, 0x32, 0x33]));
        RAM.set(0x32, 1);
        RAM.set(0x33, 1);

        Register.A = 0x01;

        chai.assert.strictEqual(Opcode[0x45](), 3);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x45](), 3);
        chai.assert.strictEqual(Register.A, 129);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x49) should do XOR operation with A and #nn, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0x49, 0x01, 0x01]));

        Register.A = 0x01;

        chai.assert.strictEqual(Opcode[0x49](), 2);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x49](), 2);
        chai.assert.strictEqual(Register.A, 129);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x4A) should right shift register A, change N, Z and C flags", () => {
        Register.A = 0x1;

        chai.assert.strictEqual(Opcode[0x4A](), 2);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        Register.A = 0xFF;

        chai.assert.strictEqual(Opcode[0x4A](), 2);
        chai.assert.strictEqual(Register.A, 127);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x56) should right shift nn + X, change N, Z and C flags", () => {
        RAM.readRom(new Uint8Array([0x56, 0x31, 0x32]));
        RAM.set(0x32, 0x01);
        Register.X = 0x01;

        chai.assert.strictEqual(Opcode[0x56](), 6);
        chai.assert.strictEqual(RAM.get(0x32), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        RAM.set(0x33, 0xFF);

        chai.assert.strictEqual(Opcode[0x56](), 6);
        chai.assert.strictEqual(RAM.get(0x33), 127);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x65) should add nn to accumulator with carry, change N, Z, C and V flags", () => {
        RAM.readRom(new Uint8Array([0x65, 0x00, 0x01]));
        Register.A = 127;
        Flag.C = Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x65](), 3);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 1);

        Register.A = new Uint8Array([-128])[0];
        Flag.C = 1;

        chai.assert.strictEqual(Opcode[0x65](), 3);
        chai.assert.strictEqual(Register.A, 129);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0x69) should add #nn to accumulator with carry, change N, Z, C and V flags", () => {
        RAM.readRom(new Uint8Array([0x69, 0x00, 0x01]));
        Register.A = 127;
        Flag.C = Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x69](), 2);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 1);

        Register.A = new Uint8Array([-128])[0];
        Flag.C = 0;

        chai.assert.strictEqual(Opcode[0x69](), 2);
        chai.assert.strictEqual(Register.A, 129);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0x6A) should rorate right through carry register A, change N, Z and C flags", () => {
        Register.A = 0xFF;
        Flag.N = Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x6A](), 2);
        chai.assert.strictEqual(Register.A, 127);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        Register.A = 0xFE;

        chai.assert.strictEqual(Opcode[0x6A](), 2);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);
    });

    it("(0x76) should rorate right through carry nn + X, change N, Z and C flags", () => {
        RAM.readRom(new Uint8Array([0x56, 0x31, 0x32]));
        RAM.set(0x32, 0xFF);
        Register.X = 0x01;
        Flag.N = Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x76](), 6);
        chai.assert.strictEqual(RAM.get(0x32), 127);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        RAM.set(0x33, 0xFE);

        chai.assert.strictEqual(Opcode[0x76](), 6);
        chai.assert.strictEqual(RAM.get(0x33), 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);
    });

    it("(0x7D) should add nnnn + X to accumulator with carry, change N, Z, C and V flags", () => {
        RAM.readRom(new Uint8Array([0x7D, 0x00, 0x31, 0x00, 0x32]));
        RAM.set(0x32, 0x01);
        RAM.set(0x33, 0x01);
        Register.A = 127;
        Register.X = 0x01;
        Flag.C = Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x7D](), 5);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 1);

        Register.A = new Uint8Array([-127])[0];
        Flag.C = 1;

        chai.assert.strictEqual(Opcode[0x7D](), 5);
        chai.assert.strictEqual(Register.A, 130);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0x88) should decrement register Y by one, change N and Z flags", () => {
        let value: number = new Uint8Array([0xFF])[0];
        Register.Y = value;
        Flag.Z = 1;


        chai.assert.strictEqual(Opcode[0x88](), 2);
        chai.assert.strictEqual(Register.Y, value - 1);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        value = new Uint8Array([0x01])[0];
        Register.Y = value;

        chai.assert.strictEqual(Opcode[0x88](), 2);
        chai.assert.strictEqual(Register.Y, value - 1);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xC0) should compare results of Y - #nn, set N, Z and C flags", () => {
        RAM.readRom(new Uint8Array([0xE0, 0x32, 0x32, 0x36]));
        Register.Y = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xC0](), 2);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.Y = 0x32;

        chai.assert.strictEqual(Opcode[0xC0](), 2);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.Y = 0x38;

        chai.assert.strictEqual(Opcode[0xC0](), 2);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xC5) should compare results of A - nn, set N, Z and C flags", () => {
        RAM.readRom(new Uint8Array([0xC5, 0x32, 0x32, 0x36]));
        RAM.set(0x32, 0x32);
        RAM.set(0x36, 0x36);
        Register.A = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xC5](), 3);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.A = 0x32;

        chai.assert.strictEqual(Opcode[0xC5](), 3);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.A = 0x38;

        chai.assert.strictEqual(Opcode[0xC5](), 3);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xC6) should decrement nn by one, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xE6, 0x32, 0x33]));
        Flag.Z = 1;

        RAM.set(0x32, 0xFA);

        chai.assert.strictEqual(Opcode[0xC6](), 5);
        chai.assert.strictEqual(RAM.get(0x32), 0xF9);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        RAM.set(0x33, 0x01);

        chai.assert.strictEqual(Opcode[0xC6](), 5);
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xC8) should increment register Y by one, change N and Z flags", () => {
        let value: number = new Uint8Array([0xE8])[0];
        Register.Y = value;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xC8](), 2);
        chai.assert.strictEqual(Register.Y, Convert.toUint8(value + 1));
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        value = new Uint8Array([0xFF])[0];
        Register.Y = value;

        chai.assert.strictEqual(Opcode[0xC8](), 2);
        chai.assert.strictEqual(Register.Y, Convert.toUint8(value + 1));
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xC9) should compare results of A - #nn, set N, Z and C flags", () => {
        RAM.readRom(new Uint8Array([0xC9, 0x32, 0x32, 0x36]));
        Register.A = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xC9](), 2);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.A = 0x32;

        chai.assert.strictEqual(Opcode[0xC9](), 2);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.A = 0x38;

        chai.assert.strictEqual(Opcode[0xC9](), 2);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xCA) should decrement register X by one, change N and Z flags", () => {
        let value: number = new Uint8Array([0xFF])[0];
        Register.X = value;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xCA](), 2);
        chai.assert.strictEqual(Register.X, value - 1);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        value = new Uint8Array([0x01])[0];
        Register.X = value;

        chai.assert.strictEqual(Opcode[0xCA](), 2);
        chai.assert.strictEqual(Register.X, value - 1);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xE0) should compare results of X - #nn, set N, Z and C flags", () => {
        RAM.readRom(new Uint8Array([0xE0, 0x32, 0x32, 0x36]));
        Register.X = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xE0](), 2);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.X = 0x32;

        chai.assert.strictEqual(Opcode[0xE0](), 2);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.X = 0x38;

        chai.assert.strictEqual(Opcode[0xE0](), 2);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xE4) should compare results of Y - nn, set N, Z and C flags", () => {
        RAM.readRom(new Uint8Array([0xC5, 0x32, 0x32, 0x36]));
        RAM.set(0x32, 0x32);
        RAM.set(0x36, 0x36);
        Register.Y = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xE4](), 3);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.Y = 0x32;

        chai.assert.strictEqual(Opcode[0xE4](), 3);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.Y = 0x38;

        chai.assert.strictEqual(Opcode[0xE4](), 3);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xE5) should substract nn from accumulator with borrow, change N, Z, C and V flags", () => {
        RAM.readRom(new Uint8Array([0xE5, 0x00, 0x01]));
        Register.A = 128;
        Flag.C = Flag.Z = 0;

        chai.assert.strictEqual(Opcode[0xE5](), 3);
        chai.assert.strictEqual(Register.A, 127);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);

        Register.A = new Uint8Array([-128])[0];
        Flag.C = 1;

        chai.assert.strictEqual(Opcode[0xE5](), 3);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0xE6) should increment nn by one, change N and Z flags", () => {
        RAM.readRom(new Uint8Array([0xE6, 0x32, 0x33]));
        Flag.Z = 1;

        RAM.set(0x32, 0xFA);

        chai.assert.strictEqual(Opcode[0xE6](), 5);
        chai.assert.strictEqual(RAM.get(0x32), 0xFB);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        RAM.set(0x33, 0xFF);

        chai.assert.strictEqual(Opcode[0xE6](), 5);
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xE8) should increment register X by one, change N and Z flags", () => {
        let value: number = new Uint8Array([0xE8])[0];
        Register.X = value;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xE8](), 2);
        chai.assert.strictEqual(Register.X, Convert.toUint8(value + 1));
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        value = new Uint8Array([0xFF])[0];
        Register.X = value;

        chai.assert.strictEqual(Opcode[0xE8](), 2);
        chai.assert.strictEqual(Register.X, Convert.toUint8(value + 1));
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xE9) should substract #nn from accumulator with borrow, change N, Z, C and V flags", () => {
        RAM.readRom(new Uint8Array([0xE9, 0x00, 0x01]));
        Register.A = 128;
        Flag.C = Flag.Z = 0;

        chai.assert.strictEqual(Opcode[0xE9](), 2);
        chai.assert.strictEqual(Register.A, 127);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);

        Register.A = new Uint8Array([-128])[0];
        Flag.C = 0;

        chai.assert.strictEqual(Opcode[0xE9](), 2);
        chai.assert.strictEqual(Register.A, 126);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);
    });
});
