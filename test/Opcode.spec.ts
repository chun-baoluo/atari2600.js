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
    Register.PC = 61440;
    Register.S = 0xFF;
    Register.X = 0;
    Register.Y = 0;
    RAM.reset();
};

describe("CPU Jump and Control Instructions", () => {
    beforeEach(beforeEachCallback);

    it("(0x00) should set break and interrupt flags, increase programm counter by two and put it to the stack pointer", () => {
        Flag.C = 1;
        chai.assert.strictEqual(Opcode[0x00](), 7);
        chai.assert.strictEqual(Flag.B, 1);
        chai.assert.strictEqual(Flag.I, 1);
        chai.assert.strictEqual(RAM.get(Register.S + 1), parseInt('' + Flag.N + Flag.V + Flag.U + 1 + Flag.D + 0 + Flag.Z + Flag.C, 2));
        chai.assert.strictEqual(Register.PC, 0);
        chai.assert.strictEqual(Register.S, 0xFC);
    });

    it("(0x10) should jump if Negative flag isn't set", () => {
        RAM.memory.set(new Uint8Array([0x10, -0x01, 0x02]), 0xF000);

        chai.assert.strictEqual(Opcode[0x10](), 3);
        chai.assert.strictEqual(Register.PC, 61440);

        Flag.N = 1;
        Register.PC = 61440;
        chai.assert.strictEqual(Opcode[0x10](), 2);
        chai.assert.strictEqual(Register.PC, 61441);
    });

    it("(0x18) should clear the carry flag", () => {
        Flag.C = 1;
        chai.assert.strictEqual(Opcode[0x18](), 2);
        chai.assert.strictEqual(Flag.C, 0);
    });

    it("(0x20) should jump to subroutine", () => {
        RAM.memory.set(new Uint8Array([0x20, 0x05, 0xF0, 0xA5, 0x01, 0x60]), 0xF000);

        chai.assert.strictEqual(Opcode[0x20](), 6);
        chai.assert.strictEqual(Register.PC, 61444);
        chai.assert.strictEqual(Register.S, 0xFD);
    });

    it("(0x30) should jump if Negative flag is set", () => {
        RAM.memory.set(new Uint8Array([0x30, -0x01, 0x02]), 0xF000);
        Flag.N = 1;
        chai.assert.strictEqual(Opcode[0x30](), 3);
        chai.assert.strictEqual(Register.PC, 61440);

        Flag.N = 0;
        Register.PC = 61440;
        chai.assert.strictEqual(Opcode[0x30](), 2);
        chai.assert.strictEqual(Register.PC, 61441);
    });

    it("(0x38) should set the carry flag", () => {
        chai.assert.strictEqual(Opcode[0x38](), 2);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x4C) should jump to nnnn", () => {
        RAM.memory.set(new Uint8Array([0x4C, 0x01, 0xFF]), 0xF000);
        chai.assert.strictEqual(Opcode[0x4C](), 3);

        Register.PC++;
        chai.assert.strictEqual(Register.PC, 0xFF01);
    });

    it("(0x50) should jump if overflow flag isn't set", () => {
        RAM.memory.set(new Uint8Array([0x50, -0x01, 0x02]), 0xF000);

        chai.assert.strictEqual(Opcode[0x50](), 3);
        chai.assert.strictEqual(Register.PC, 61440);

        Flag.V = 1;
        Register.PC = 61440;
        chai.assert.strictEqual(Opcode[0x50](), 2);
        chai.assert.strictEqual(Register.PC, 61441);
    });

    it("(0x58) should clear the interrupt disable bit", () => {
        Flag.I = 1;
        chai.assert.strictEqual(Opcode[0x58](), 2);
        chai.assert.strictEqual(Flag.I, 0);
    });

    it("(0x60) should return from subroutine", () => {
        // RAM.stack.push(6);
        Register.S = 0xFD;
        chai.assert.strictEqual(Opcode[0x60](), 6);
        chai.assert.strictEqual(Register.S, 0xFF);
    });

    it("(0x6C) should jump to [nnnn]", () => {
        RAM.memory.set(new Uint8Array([0x6C, 0xF0, 0x00, 0xFF, 0x03]), 0xF000);
        RAM.set(0xF0, 0xD8);
        RAM.set(0xF1, 0xF7);

        chai.assert.strictEqual(Opcode[0x6C](), 5);

        Register.PC++;
        chai.assert.strictEqual(Register.PC, 0xF7D8);

        Register.PC = 0xF002;
        RAM.set(0x03FF, 0x01);
        RAM.set(0x0300, 0xFF);
        chai.assert.strictEqual(Opcode[0x6C](), 5);

        Register.PC++;
        chai.assert.strictEqual(Register.PC, 0xFF01);
    });

    it("(0x70) should jump if overflow flag is set", () => {
        RAM.memory.set(new Uint8Array([0x70, -0x01, 0x02]), 0xF000);
        Flag.V = 1;
        chai.assert.strictEqual(Opcode[0x70](), 3);
        chai.assert.strictEqual(Register.PC, 61440);

        Flag.V = 0;
        Register.PC = 61440;
        chai.assert.strictEqual(Opcode[0x70](), 2);
        chai.assert.strictEqual(Register.PC, 61441);
    });

    it("(0x78) should set the interrupt disable bit", () => {
        chai.assert.strictEqual(Opcode[0x78](), 2);
        chai.assert.strictEqual(Flag.I, 1);
    });

    it("(0x90) should jump if Carry flag isn't set", () => {
        RAM.memory.set(new Uint8Array([0x90, 0xFF, 0x02]), 0xF000);

        chai.assert.strictEqual(Opcode[0x90](), 3);
        chai.assert.strictEqual(Register.PC, 61440);

        Flag.C = 1;
        Register.PC = 61440;
        chai.assert.strictEqual(Opcode[0x90](), 2);
        chai.assert.strictEqual(Register.PC, 61441);
    });

    it("(0xB0) should jump if Carry flag is set", () => {
        RAM.memory.set(new Uint8Array([0xB0, 0xFF, 0x02]), 0xF000);

        Flag.C = 1;

        chai.assert.strictEqual(Opcode[0xB0](), 3);
        chai.assert.strictEqual(Register.PC, 61440);

        Flag.C = 0;

        Register.PC = 61440;
        chai.assert.strictEqual(Opcode[0xB0](), 2);
        chai.assert.strictEqual(Register.PC, 61441);
    });

    it("(0xB8) should clear the overflow flag", () => {
        Flag.V = 1;
        chai.assert.strictEqual(Opcode[0xB8](), 2);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0xD0) should jump if Zero flag isn/'t set", () => {
        RAM.memory.set(new Uint8Array([0xD0, -0x01, 0x02]), 0xF000);

        chai.assert.strictEqual(Opcode[0xD0](), 3);
        chai.assert.strictEqual(Register.PC, 61440);

        Flag.Z = 1;
        Register.PC = 61440;
        chai.assert.strictEqual(Opcode[0xD0](), 2);
        chai.assert.strictEqual(Register.PC, 61441);
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
        RAM.memory.set(new Uint8Array([0xD0, -0x01, 0x02]), 0xF000);

        chai.assert.strictEqual(Opcode[0xF0](), 2);
        chai.assert.strictEqual(Register.PC, 61441);

        Flag.Z = 1;
        Register.PC = 61440;
        chai.assert.strictEqual(Opcode[0xF0](), 3);
        chai.assert.strictEqual(Register.PC, 61440);
    });

    it("(0xF8) should set the decimal mode", () => {
        chai.assert.strictEqual(Opcode[0xF8](), 2);
        chai.assert.strictEqual(Flag.D, 1);
    });
});

describe("CPU Memory and Register Transfers", () => {
    beforeEach(beforeEachCallback);

    it("(0x08) should push register P to the stack", () => {
        Flag.C = 1;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x08](), 3);
        chai.assert.strictEqual(RAM.get(0xFF), 51);
    });

    it("(0x28) should get register P to the stack", () => {
        Register.S = 0xFE;
        RAM.set(0xFF, parseInt('11000000', 2));

        chai.assert.strictEqual(Opcode[0x28](), 4);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.V, 1);
    });

    it("(0x48) should push register A to the stack", () => {
        Register.A = 0x05;

        chai.assert.strictEqual(Opcode[0x48](), 3);
        chai.assert.strictEqual(RAM.get(0xFF), Register.A);
    });

    it("(0x68) should pop value from the stack and set register A to be equal it, change N and Z flags", () => {
        Register.S = 0xFD;
        RAM.set(0xFE, 128);
        RAM.set(0xFF, 0);

        chai.assert.strictEqual(Opcode[0x68](), 4);
        chai.assert.strictEqual(128, Register.A);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);

        chai.assert.strictEqual(Opcode[0x68](), 4);
        chai.assert.strictEqual(0, Register.A);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.N, 0);
    });

    it("(0x84) should set an address value (nn) to be equal register Y", () => {
        RAM.set(0x32, 2);
        RAM.memory.set(new Uint8Array([0x84, 0x32]), 0xF000);
        Register.Y = 5;

        chai.assert.strictEqual(Opcode[0x84](), 3);
        chai.assert.strictEqual(RAM.get(0x32), Register.Y);
    });

    it("(0x85) should set an address value (nn) to be equal register A", () => {
        RAM.set(0x32, 2);
        RAM.memory.set(new Uint8Array([0x85, 0x32]), 0xF000);
        Register.A = 5;

        chai.assert.strictEqual(Opcode[0x85](), 3);
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
    });

    it("(0x86) should set an address value (nn) to be equal register X", () => {
        RAM.set(0x32, 0);
        RAM.memory.set(new Uint8Array([0x86, 0x32]), 0xF000);
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

    it("(0x8C) should set an address value (nnnn) to be equal register Y", () => {
        RAM.memory.set(new Uint8Array([0x8C, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 0);
        Register.Y = 5;

        chai.assert.strictEqual(Opcode[0x8C](), 4);
        chai.assert.strictEqual(RAM.get(0x32), Register.Y);
    });

    it("(0x8D) should set an address value (nnnn) to be equal register A", () => {
        RAM.set(0x01, 0);
        RAM.memory.set(new Uint8Array([0x85, 0x01, 0x00]), 0xF000);
        Register.A = 5;

        chai.assert.strictEqual(Opcode[0x8D](), 4);
        chai.assert.strictEqual(RAM.get(0x01), Register.A);
    });

    it("(0x8E) should set an address value (nnnn) to be equal register X", () => {
        RAM.set(0x01, 0);
        RAM.memory.set(new Uint8Array([0x8E, 0x01, 0x00]), 0xF000);
        Register.X = 5;

        chai.assert.strictEqual(Opcode[0x8E](), 4);
        chai.assert.strictEqual(RAM.get(0x01), Register.X);
    });

    it("(0x91) should set an address value [WORD[nn]+y] to be equal register A", () => {
        RAM.memory.set(new Uint8Array([0x91, 0x32]), 0xF000);
        RAM.set(0x32, 0x35);
        RAM.set(0x33, 0x00);
        RAM.set(0x37, 0x36);
        Register.Y = 0x02;
        Register.A = 0x05;

        chai.assert.strictEqual(Opcode[0x91](), 6);
        chai.assert.strictEqual(RAM.get(0x37), Register.A);
    });

    it("(0x94) should set an address value + X register to be equal register Y", () => {
        RAM.set(0x32, 0);
        RAM.memory.set(new Uint8Array([0x94, 0x31]), 0xF000);
        Register.X = 0x01;
        Register.Y = 5;

        chai.assert.strictEqual(Opcode[0x94](), 4);
        chai.assert.strictEqual(RAM.get(0x32), Register.Y);
    });

    it("(0x95) should set an address value + X register to be equal register A", () => {
        RAM.set(0x32, 0);
        RAM.memory.set(new Uint8Array([0x95, 0x31]), 0xF000);
        Register.X = 0x01;
        Register.A = 5;

        chai.assert.strictEqual(Opcode[0x95](), 4);
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
    });

    it("(0x96) should set an address value + Y register to be equal register X", () => {
        RAM.memory.set(new Uint8Array([0x96, 0x31]), 0xF000);
        RAM.set(0x32, 0);
        Register.Y = 0x01;
        Register.X = 5;

        chai.assert.strictEqual(Opcode[0x96](), 4);
        chai.assert.strictEqual(RAM.get(0x32), Register.X);
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

    it("(0x99) should set an address value (nnnn + Y) to be equal register A", () => {
        RAM.memory.set(new Uint8Array([0x99, 0x31, 0x00]), 0xF000);
        Register.Y = 0x01;
        RAM.set(0x32, 0);
        Register.A = 5;

        chai.assert.strictEqual(Opcode[0x99](), 5);
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
    });

    it("(0x9A) should set register S to be equal register X", () => {
        Register.X = 0xAA;
        chai.assert.strictEqual(Opcode[0x9A](), 2);
        chai.assert.strictEqual(Register.S, Register.X);
    });

    it("(0x9D) should set an address value [nnnn + X] to be equal register A", () => {
        RAM.memory.set(new Uint8Array([0x85, 0x31, 0x00]), 0xF000);
        RAM.set(0x32, 0);
        Register.A = 0x05;
        Register.X = 0x01;

        chai.assert.strictEqual(Opcode[0x9D](), 5);
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
    });

    it("(0xA0) should set register Y to #nn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xA0, 0xFF, 0]), 0xF000);
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xA0](), 2);
        chai.assert.strictEqual(Register.Y, RAM.get(61441));
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xA0](), 2);
        chai.assert.strictEqual(Register.Y, RAM.get(61442));
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xA1) should set register A to (nn, X), change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xA1, 0x32]), 0xF000);
        RAM.set(0x34, 0x33);
        RAM.set(0x33, 0x36);
        Register.X = 0x02;

        chai.assert.strictEqual(Opcode[0xA1](), 6);
        chai.assert.strictEqual(RAM.get(0x33), Register.A);
    });

    it("(0xA2) should set register X to #nn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xA2, 0xFF, 0]), 0xF000);
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xA2](), 2);
        chai.assert.strictEqual(Register.X, RAM.get(61441));
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xA2](), 2);
        chai.assert.strictEqual(Register.X, RAM.get(61442));
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xA4) should set register Y to nn, change N and Z flags", () => {
        RAM.set(0x01, 5);
        RAM.memory.set(new Uint8Array([0xA4, 0x01]), 0xF000);

        chai.assert.strictEqual(Opcode[0xA4](), 3);
        chai.assert.strictEqual(RAM.get(0x01), Register.Y);
    });

    it("(0xA5) should set register A to nn, change N and Z flags", () => {
        RAM.set(0x01, 5);
        RAM.memory.set(new Uint8Array([0xA5, 0x01]), 0xF000);

        chai.assert.strictEqual(Opcode[0xA5](), 3);
        chai.assert.strictEqual(RAM.get(0x01), Register.A);
    });

    it("(0xA6) should set register X to nn, change N and Z flags", () => {
        RAM.set(0x01, 5);
        RAM.memory.set(new Uint8Array([0xA6, 0x01]), 0xF000);

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
        RAM.memory.set(new Uint8Array([0xA9, 0xFF, 0]), 0xF000);
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xA9](), 2);
        chai.assert.strictEqual(Register.A, RAM.get(61441));
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xA9](), 2);
        chai.assert.strictEqual(Register.A, RAM.get(61442));
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

    it("(0xAC) should set register Y to nnnn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xAC, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x31, 0xFA);
        RAM.set(0x32, 0);
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xAC](), 4);
        chai.assert.strictEqual(RAM.get(0x31), Register.Y);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xAC](), 4);
        chai.assert.strictEqual(RAM.get(0x32), Register.Y);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xAD) should set register A to nnnn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xAD, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x31, 0xFA);
        RAM.set(0x32, 0);
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xAD](), 4);
        chai.assert.strictEqual(RAM.get(0x31), Register.A);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xAD](), 4);
        chai.assert.strictEqual(RAM.get(0x32), Register.A);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xAE) should set register X to nnnn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xAE, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x31, 0xFA);
        RAM.set(0x32, 0);
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xAE](), 4);
        chai.assert.strictEqual(RAM.get(0x31), Register.X);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xAE](), 4);
        chai.assert.strictEqual(RAM.get(0x32), Register.X);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xB1) should set register A to (nn), Y, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xB1, 0x32]), 0xF000);
        RAM.set(0x32, 0x33);
        RAM.set(0x35, 0x36);
        Register.Y = 0x02;

        chai.assert.strictEqual(Opcode[0xB1](), 6);
        chai.assert.strictEqual(RAM.get(0x35), Register.A);
    });

    it("(0xB5) should set register Y to be equal nn + X", () => {
        Register.Y = 5;
        RAM.memory.set(new Uint8Array([0xB4, 0x31]), 0xF000);
        RAM.set(0x32, 3);
        Register.X = 0x01;

        chai.assert.strictEqual(Opcode[0xB4](), 4);
        chai.assert.strictEqual(Register.Y, 3);
    });

    it("(0xB5) should set register A to be equal nn + X", () => {
        Register.A = 5;
        RAM.memory.set(new Uint8Array([0xB5, 0x31]), 0xF000);
        RAM.set(0x32, 3);
        Register.X = 0x01;

        chai.assert.strictEqual(Opcode[0xB5](), 4);
        chai.assert.strictEqual(Register.A, 3);
    });

    it("(0xB6) should set register X to be equal nn + Y", () => {
        RAM.memory.set(new Uint8Array([0xB6, 0x31]), 0xF000);
        RAM.set(0x32, 3);
        Register.X = 5;
        Register.Y = 0x01;

        chai.assert.strictEqual(Opcode[0xB6](), 4);
        chai.assert.strictEqual(Register.X, 3);
    });

    it("(0xB9) should set register A to nnnn + Y, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xAD, 0x31, 0x00, 0x33, 0x00]), 0xF000);
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

    it("(0xBA) should set register X to be equal register S, change N and Z flags", () => {
        Register.S = 0xFA;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xBA](), 2);

        chai.assert.strictEqual(Register.X, Register.S);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        Register.S = 0;

        chai.assert.strictEqual(Opcode[0xBA](), 2);
        chai.assert.strictEqual(Register.X, Register.S);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xBC) should set register Y to nnnn + X, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xAD, 0x31, 0x00, 0x33, 0x00]), 0xF000);
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
        RAM.memory.set(new Uint8Array([0xAD, 0x31, 0x00, 0x33, 0x00]), 0xF000);
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
        RAM.memory.set(new Uint8Array([0xAD, 0x31, 0x00, 0x33, 0x00]), 0xF000);
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

    it("(0x01) should do OR operation with A and (nn, X), change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x01, 0x32, 0x33]), 0xF000);
        RAM.set(0x33, 0x38);
        RAM.set(0x38, 0x00);

        Register.A = 0;
        Register.X = 1;

        chai.assert.strictEqual(Opcode[0x01](), 6);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;
        RAM.set(0x34, 0x39);
        RAM.set(0x39, 0xFF);

        chai.assert.strictEqual(Opcode[0x01](), 6);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x05) should do OR operation with A and nn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x05, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 0);
        RAM.set(0x33, 0xFF);
        Register.A = 0;

        chai.assert.strictEqual(Opcode[0x05](), 3);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x05](), 3);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x06) should left shift nn, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x16, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 0xFF);

        chai.assert.strictEqual(Opcode[0x06](), 5);
        chai.assert.strictEqual(RAM.get(0x32), 0xFE);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        RAM.set(0x33, 128);

        chai.assert.strictEqual(Opcode[0x06](), 5);
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x09) should do OR operation with A and #nn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xE0, 0x00, 0xFF]), 0xF000);

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

    it("(0x0D) should do OR operation with A and nnnn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x0D, 0x32, 0x00, 0x33, 0x00]), 0xF000);
        RAM.set(0x32, 0);
        RAM.set(0x33, 0xFF);
        Register.A = 0;

        chai.assert.strictEqual(Opcode[0x0D](), 4);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x0D](), 4);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x0E) should left shift nnnn, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x0E, 0x32, 0x00, 0x33, 0x00]), 0xF000);
        RAM.set(0x32, 0xFF);

        chai.assert.strictEqual(Opcode[0x0E](), 6);
        chai.assert.strictEqual(RAM.get(0x32), 0xFE);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        RAM.set(0x33, 128);

        chai.assert.strictEqual(Opcode[0x0E](), 6);
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x11) should do OR operation with A and [[nn]+Y], change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x11, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 0x37);
        RAM.set(0x38, 0x00);

        Register.A = 0;
        Register.Y = 0x01;

        chai.assert.strictEqual(Opcode[0x11](), 6);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;
        RAM.set(0x33, 0x38);
        RAM.set(0x39, 0xFF);

        chai.assert.strictEqual(Opcode[0x11](), 6);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x15) should do OR operation with A and nn + X, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x15, 0x31, 0x32]), 0xF000);
        RAM.set(0x32, 0);
        RAM.set(0x33, 0xFF);
        Register.X = 0x01;
        Register.A = 0;

        chai.assert.strictEqual(Opcode[0x15](), 4);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x15](), 4);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x16) should left shift nn + X, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x16, 0x31, 0x32]), 0xF000);
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

    it("(0x19) should do OR operation with A and nnnn + Y, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x19, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 0);
        RAM.set(0x33, 0xFF);
        Register.A = 0;
        Register.Y = 0x01;

        chai.assert.strictEqual(Opcode[0x19](), 5);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x19](), 5);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x1D) should do OR operation with A and nnnn + X, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x1D, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 0);
        RAM.set(0x33, 0xFF);
        Register.A = 0;
        Register.X = 0x01;

        chai.assert.strictEqual(Opcode[0x1D](), 5);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x1D](), 5);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x1E) should left shift [nnnn + X], change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x1E, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        Register.X = 0x01;
        RAM.set(0x32, 0xFF);

        chai.assert.strictEqual(Opcode[0x1E](), 7);
        chai.assert.strictEqual(RAM.get(0x32), 0xFE);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        RAM.set(0x33, 128);

        chai.assert.strictEqual(Opcode[0x1E](), 7);
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x24) should test A and nn, change N, Z and V flags", () => {
        RAM.memory.set(new Uint8Array([0x24, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 0x00);
        RAM.set(0x33, 0xFF);

        Register.A = 1;

        chai.assert.strictEqual(Opcode[0x24](), 3);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.V, 0);

        chai.assert.strictEqual(Opcode[0x24](), 3);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.V, 1);
    });

    it("(0x25) should do AND operation with A and nn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xE0, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 0x01);
        RAM.set(0x33, 0xFF);

        Register.A = 0x02;

        chai.assert.strictEqual(Opcode[0x25](), 3);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x25](), 3);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x26) should rotate left through carry nn, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x36, 0x32, 0x33]), 0xF000);
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
        RAM.memory.set(new Uint8Array([0xE0, 0x01, 0xFF]), 0xF000);

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

    it("(0x2A) should rotate left through carry register A, change N, Z and C flags", () => {
        Register.A = 0xFF;

        chai.assert.strictEqual(Opcode[0x2A](), 2);
        chai.assert.strictEqual(Register.A, 0xFE);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        Register.A = 127;

        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x2A](), 2);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);
    });

    it("(0x2C) should test A and nnnn, change N, Z and V flags", () => {
        RAM.memory.set(new Uint8Array([0x2C, 0x32, 0x00, 0x33, 0x00]), 0xF000);
        RAM.set(0x32, 0x00);
        RAM.set(0x33, 0xFF);

        Register.A = 1;

        chai.assert.strictEqual(Opcode[0x2C](), 4);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.V, 0);

        chai.assert.strictEqual(Opcode[0x2C](), 4);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.V, 1);
    });

    it("(0x2D) should do AND operation with A and nnnn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x3D, 0x32, 0x00, 0x33, 0x00]), 0xF000);
        RAM.set(0x32, 0x00);
        RAM.set(0x33, 0xFF);

        Register.A = 0x02;

        chai.assert.strictEqual(Opcode[0x2D](), 4);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x2D](), 4);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x35) should do AND operation with A and nn + X, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x35, 0x31, 0x32]), 0xF000);
        RAM.set(0x32, 0x01);
        RAM.set(0x33, 0xFF);
        Register.X = 0x01;
        Register.A = 0x02;

        chai.assert.strictEqual(Opcode[0x35](), 4);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x35](), 4);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });


    it("(0x36) should rotate left through carry nn + X, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x36, 0x31, 0x32]), 0xF000);
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

    it("(0x39) should do AND operation with A and nnnn + Y, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x3D, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 0x00);
        RAM.set(0x33, 0xFF);

        Register.Y = 0x01;
        Register.A = 0x02;

        chai.assert.strictEqual(Opcode[0x39](), 5);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x39](), 5);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x3D) should do AND operation with A and nnnn + X, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x3D, 0x31, 0x00, 0x32, 0x00]), 0xF000);
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
        RAM.memory.set(new Uint8Array([0x45, 0x32, 0x33]), 0xF000);
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

    it("(0x46) should right shift nn, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x46, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 0x01);
        RAM.set(0x33, 0xFF);

        chai.assert.strictEqual(Opcode[0x46](), 5);
        chai.assert.strictEqual(RAM.get(0x32), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        chai.assert.strictEqual(Opcode[0x46](), 5);
        chai.assert.strictEqual(RAM.get(0x33), 127);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x49) should do XOR operation with A and #nn, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x49, 0x01, 0x01]), 0xF000);

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
        Register.A = 0x01;

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

    it("(0x4E) should right shift nnnn, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x4E, 0x32, 0x00, 0x33, 0x00]), 0xF000);
        RAM.set(0x32, 0x01);
        RAM.set(0x33, 0xFF);

        chai.assert.strictEqual(Opcode[0x4E](), 6);
        chai.assert.strictEqual(RAM.get(0x32), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        chai.assert.strictEqual(Opcode[0x4E](), 6);
        chai.assert.strictEqual(RAM.get(0x33), 127);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0x55) should do XOR operation with A and [nn + X], change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x55, 0x31, 0x32]), 0xF000);
        RAM.set(0x32, 1);
        RAM.set(0x33, 1);
        Register.X = 0x01;
        Register.A = 0x01;

        chai.assert.strictEqual(Opcode[0x55](), 4);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x55](), 4);
        chai.assert.strictEqual(Register.A, 129);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x56) should right shift nn + X, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x56, 0x31, 0x32]), 0xF000);
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

    it("(0x59) should do XOR operation with A and [nnnn + Y], change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x59, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 1);
        RAM.set(0x33, 1);
        Register.Y = 0x01;
        Register.A = 0x01;

        chai.assert.strictEqual(Opcode[0x59](), 5);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x59](), 5);
        chai.assert.strictEqual(Register.A, 129);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x5D) should do XOR operation with A and [nnnn + X], change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0x5D, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 1);
        RAM.set(0x33, 1);
        Register.X = 0x01;
        Register.A = 0x01;

        chai.assert.strictEqual(Opcode[0x5D](), 5);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);

        Register.A = 128;

        chai.assert.strictEqual(Opcode[0x5D](), 5);
        chai.assert.strictEqual(Register.A, 129);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
    });

    it("(0x65) should add nn to accumulator with carry, change N, Z, C and V flags", () => {
        RAM.memory.set(new Uint8Array([0x65, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 2);
        RAM.set(0x33, 1);
        Register.A = 125;
        Flag.C = Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x65](), 3);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 1);

        Register.A = new Uint8Array([-129])[0];
        Flag.C = 1;

        chai.assert.strictEqual(Opcode[0x65](), 3);
        chai.assert.strictEqual(Register.A, 129);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0x66) should rorate right through carry address nn, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x66, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 0xFF);
        Flag.N = Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x66](), 5);
        chai.assert.strictEqual(RAM.get(0x32), 127);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);

        RAM.set(0x33, 0xFE);

        chai.assert.strictEqual(Opcode[0x66](), 5);
        chai.assert.strictEqual(RAM.get(0x33), 0xFF);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);
    });

    it("(0x69) should add #nn to accumulator with carry, change N, Z, C and V flags", () => {
        RAM.memory.set(new Uint8Array([0x69, 0x00, 0x01]), 0xF000);
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

    it("(0x6D) should add nnnn to accumulator with carry, change N, Z, C and V flags", () => {
        RAM.memory.set(new Uint8Array([0x6D, 0x32, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 0x01);
        RAM.set(0x33, 0x01);
        Register.A = 127;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x6D](), 4);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 1);

        Register.A = new Uint8Array([-127])[0];
        Flag.C = 1;

        chai.assert.strictEqual(Opcode[0x6D](), 4);
        chai.assert.strictEqual(Register.A, 131);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0x75) should add nn + X to accumulator with carry, change N, Z, C and V flags", () => {
        RAM.memory.set(new Uint8Array([0x75, 0x31, 0x32]), 0xF000);
        RAM.set(0x32, 2);
        RAM.set(0x33, 1);
        Register.A = 125;
        Flag.C = Flag.Z = 1;
        Register.X = 0x01

        chai.assert.strictEqual(Opcode[0x75](), 4);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 1);

        Register.A = new Uint8Array([-129])[0];

        Flag.C = 1;

        chai.assert.strictEqual(Opcode[0x75](), 4);
        chai.assert.strictEqual(Register.A, 129);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0x76) should rorate right through carry nn + X, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0x56, 0x31, 0x32]), 0xF000);
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

    it("(0x79) should add nnnn + Y to accumulator with carry, change N, Z, C and V flags", () => {
        RAM.memory.set(new Uint8Array([0x79, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 0x01);
        RAM.set(0x33, 0x01);
        Register.A = 127;
        Register.Y = 0x01;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x79](), 5);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 1);

        Register.A = new Uint8Array([-127])[0];
        Flag.C = 1;

        chai.assert.strictEqual(Opcode[0x79](), 5);
        chai.assert.strictEqual(Register.A, 131);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0x7D) should add nnnn + X to accumulator with carry, change N, Z, C and V flags", () => {
        RAM.memory.set(new Uint8Array([0x7D, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 0x01);
        RAM.set(0x33, 0x01);
        Register.A = 127;
        Register.X = 0x01;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x7D](), 5);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 0);
        chai.assert.strictEqual(Flag.V, 1);

        Register.A = new Uint8Array([-127])[0];
        Flag.C = 1;

        chai.assert.strictEqual(Opcode[0x7D](), 5);
        chai.assert.strictEqual(Register.A, 131);
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
        RAM.memory.set(new Uint8Array([0xE0, 0x32, 0x32, 0x36]), 0xF000);
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

    it("(0xC4) should compare results of Y - nn, set N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xC4, 0x32, 0x32, 0x36]), 0xF000);
        RAM.set(0x32, 0x32);
        RAM.set(0x36, 0x36);
        Register.Y = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xC4](), 3);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.Y = 0x32;

        chai.assert.strictEqual(Opcode[0xC4](), 3);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.Y = 0x38;

        chai.assert.strictEqual(Opcode[0xC4](), 3);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xC5) should compare results of A - nn, set N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xC5, 0x32, 0x32, 0x36]), 0xF000);
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
        RAM.memory.set(new Uint8Array([0xE6, 0x32, 0x33]), 0xF000);
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
        RAM.memory.set(new Uint8Array([0xC9, 0x32, 0x32, 0x36]), 0xF000);
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

    it("(0xCC) should compare results of Y - nnnn, set N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xCC, 0x32, 0x00, 0x32, 0x00, 0x36, 0x00]), 0xF000);
        RAM.set(0x32, 0x32);
        RAM.set(0x36, 0x36);
        Register.Y = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xCC](), 4);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.Y = 0x32;

        chai.assert.strictEqual(Opcode[0xCC](), 4);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.Y = 0x38;

        chai.assert.strictEqual(Opcode[0xCC](), 4);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xD9) should compare results of A - [nnnn], set N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xD9, 0x32, 0x00, 0x32, 0x00, 0x36, 0x00]), 0xF000);
        RAM.set(0x32, 0x32);
        RAM.set(0x36, 0x36);
        Register.A = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xCD](), 4);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.A = 0x32;

        chai.assert.strictEqual(Opcode[0xCD](), 4);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.A = 0x38;

        chai.assert.strictEqual(Opcode[0xCD](), 4);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xD5) should compare results of A - [nn + X], set N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xC5, 0x31, 0x31, 0x35]), 0xF000);
        RAM.set(0x32, 0x32);
        RAM.set(0x36, 0x36);
        Register.X = 0x01;
        Register.A = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xD5](), 4);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.A = 0x32;

        chai.assert.strictEqual(Opcode[0xD5](), 4);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.A = 0x38;

        chai.assert.strictEqual(Opcode[0xD5](), 4);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xD6) should decrement [nn + X] by one, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xD6, 0x31, 0x32]), 0xF000);
        RAM.set(0x32, 0xFA);
        RAM.set(0x33, 0x01);
        Register.X = 0x01;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xD6](), 6);
        chai.assert.strictEqual(RAM.get(0x32), 0xF9);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        chai.assert.strictEqual(Opcode[0xD6](), 6);
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xD9) should compare results of A - [nnnn + Y], set N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xD9, 0x31, 0x00, 0x31, 0x00, 0x35, 0x00]), 0xF000);
        RAM.set(0x32, 0x32);
        RAM.set(0x36, 0x36);
        Register.Y = 0x01;
        Register.A = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xD9](), 5);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.A = 0x32;

        chai.assert.strictEqual(Opcode[0xD9](), 5);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.A = 0x38;

        chai.assert.strictEqual(Opcode[0xD9](), 5);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xDD) should compare results of A - [nnnn + X], set N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xDD, 0x31, 0x00, 0x31, 0x00, 0x35, 0x00]), 0xF000);
        RAM.set(0x32, 0x32);
        RAM.set(0x36, 0x36);
        Register.X = 0x01;
        Register.A = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xDD](), 5);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.A = 0x32;

        chai.assert.strictEqual(Opcode[0xDD](), 5);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.A = 0x38;

        chai.assert.strictEqual(Opcode[0xDD](), 5);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xE0) should compare results of X - #nn, set N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xE0, 0x32, 0x32, 0x36]), 0xF000);
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

    it("(0xE4) should compare results of X - nn, set N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xC5, 0x32, 0x32, 0x36]), 0xF000);
        RAM.set(0x32, 0x32);
        RAM.set(0x36, 0x36);
        Register.X = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xE4](), 3);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.X = 0x32;

        chai.assert.strictEqual(Opcode[0xE4](), 3);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.X = 0x38;

        chai.assert.strictEqual(Opcode[0xE4](), 3);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xE5) should substract nn from accumulator with borrow, change N, Z, C and V flags", () => {
        RAM.memory.set(new Uint8Array([0xE5, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 1);
        RAM.set(0x33, 2);
        Register.A = 128;
        Flag.C = Flag.Z = 0;

        chai.assert.strictEqual(Opcode[0xE5](), 3);
        chai.assert.strictEqual(Register.A, 126);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 1);
        chai.assert.strictEqual(Flag.V, 0);

        Register.A = new Uint8Array([-126])[0];
        Flag.Z = Flag.V = 1;

        chai.assert.strictEqual(Opcode[0xE5](), 3);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 1);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0xE6) should increment nn by one, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xE6, 0x32, 0x33]), 0xF000);
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
        RAM.memory.set(new Uint8Array([0xE9, 0x00, 0x01]), 0xF000);
        Register.A = 128;
        Flag.C = Flag.Z = 0;

        chai.assert.strictEqual(Opcode[0xE9](), 2);
        chai.assert.strictEqual(Register.A, 127);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 1);
        chai.assert.strictEqual(Flag.V, 0);

        Register.A = new Uint8Array([-128])[0];
        Flag.C = 0;

        chai.assert.strictEqual(Opcode[0xE9](), 2);
        chai.assert.strictEqual(Register.A, 126);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 1);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0xEC) should compare results of X - [nnnn], set N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xDD, 0x32, 0x00, 0x32, 0x00, 0x36, 0x00]), 0xF000);
        RAM.set(0x32, 0x32);
        RAM.set(0x36, 0x36);
        Register.X = 0x07;
        Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xEC](), 4);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Register.X = 0x32;

        chai.assert.strictEqual(Opcode[0xEC](), 4);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);

        Register.X = 0x38;

        chai.assert.strictEqual(Opcode[0xEC](), 4);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xF5) should substract nn + X from accumulator with borrow, change N, Z, C and V flags", () => {
        RAM.memory.set(new Uint8Array([0xF5, 0x31, 0x32]), 0xF000);
        RAM.set(0x32, 1);
        RAM.set(0x33, 2);
        Register.A = 126;
        Register.X = 0x01;
        Flag.C = Flag.Z = 0;

        chai.assert.strictEqual(Opcode[0xF5](), 4);
        chai.assert.strictEqual(Register.A, 124);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 1);
        chai.assert.strictEqual(Flag.V, 0);

        Register.A = new Uint8Array([-126])[0];
        Flag.C = Flag.Z = Flag.V = 1;

        chai.assert.strictEqual(Opcode[0xF5](), 4);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 1);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0xF6) should increment nn + X by one, change N and Z flags", () => {
        RAM.memory.set(new Uint8Array([0xF6, 0x31, 0x32]), 0xF000);
        Register.X = 0x01;
        Flag.Z = 1;

        RAM.set(0x32, 0xFA);

        chai.assert.strictEqual(Opcode[0xF6](), 6);
        chai.assert.strictEqual(RAM.get(0x32), 0xFB);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);

        RAM.set(0x33, 0xFF);

        chai.assert.strictEqual(Opcode[0xF6](), 6);
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
    });

    it("(0xF9) should substract nnnn + Y from accumulator with borrow, change N, Z, C and V flags", () => {
        RAM.memory.set(new Uint8Array([0xFD, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 1);
        RAM.set(0x33, 2);
        Register.A = 126;
        Register.Y = 0x01;
        Flag.C = Flag.Z = 0;

        chai.assert.strictEqual(Opcode[0xF9](), 5);
        chai.assert.strictEqual(Register.A, 124);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 1);
        chai.assert.strictEqual(Flag.V, 0);

        Register.A = new Uint8Array([-126])[0];
        Flag.C = Flag.V = Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xF9](), 5);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 1);
        chai.assert.strictEqual(Flag.V, 0);
    });

    it("(0xFD) should substract nnnn + X from accumulator with borrow, change N, Z, C and V flags", () => {
        RAM.memory.set(new Uint8Array([0xFD, 0x31, 0x00, 0x32, 0x00]), 0xF000);
        RAM.set(0x32, 1);
        RAM.set(0x33, 2);
        Register.A = 126;
        Register.X = 0x01;
        Flag.C = Flag.Z = 0;

        chai.assert.strictEqual(Opcode[0xFD](), 5);
        chai.assert.strictEqual(Register.A, 124);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 1);
        chai.assert.strictEqual(Flag.V, 0);

        Register.A = new Uint8Array([-126])[0];
        Flag.C = Flag.Z = Flag.V = 1;

        chai.assert.strictEqual(Opcode[0xFD](), 5);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.C, 1);
        chai.assert.strictEqual(Flag.V, 0);
    });
});

describe("CPU Illegal Opcodes", () => {
    beforeEach(beforeEachCallback);

    it("(0x04, 0x44, 0x64) should do NOP nn", () => {
        chai.assert.strictEqual(Opcode[0x04](), 3);
        chai.assert.strictEqual(Register.PC, 61441);
    });

    it("(0x0C) should do NOP nnnn", () => {
        chai.assert.strictEqual(Opcode[0x0C](), 4);
        chai.assert.strictEqual(Register.PC, 61442);
    });

    it("(0x14, 0x34, 0x54, 0x74, 0xD4, 0xF4) should do NOP nn, X", () => {
        chai.assert.strictEqual(Opcode[0x14](), 4);
        chai.assert.strictEqual(Register.PC, 61441);
    });

    it("(0x1C, 0x3C, 0x5C, 0x7C, 0xDC, 0xFC) should do NOP nnnn, X", () => {
        RAM.memory.set(new Uint8Array([0x1C, 0x31, 0x32]), 0xF000);
        chai.assert.strictEqual(Opcode[0x1C](), 5);
        chai.assert.strictEqual(Register.PC, 61442);
    });

    it("(0x4B) should do AND with A and #nn, shift result 1 bit to the right, change Z, N and C flags", () => {
        RAM.memory.set(new Uint8Array([0x4B, 0xFF]), 0xF000);
        Register.A = 0x02;
        Flag.C = Flag.N = Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0x4B](), 2);
        chai.assert.strictEqual(Register.A, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 0);
    });

    it("(0x80, 0x82, 0x89, 0xC2, 0xE2) should do NOP", () => {
        chai.assert.strictEqual(Opcode[0x80](), 2);
        chai.assert.strictEqual(Register.PC, 61441);
    });

    it("(0xA7) should do LAX with nn, change Z and N flags", () => {
        RAM.memory.set(new Uint8Array([0xA7, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 128);
        RAM.set(0x33, 0);

        chai.assert.strictEqual(Opcode[0xA7](), 3);
        chai.assert.strictEqual(Flag.N, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Register.A, 128);
        chai.assert.strictEqual(Register.A, Register.X);

        chai.assert.strictEqual(Opcode[0xA7](), 3);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Register.A, 0);
        chai.assert.strictEqual(Register.A, Register.X);
    });

    it("(0xB3) should do LAX with (nn) and Y, change Z and N flags", () => {
        RAM.memory.set(new Uint8Array([0xB3, 0x31, 0x32]), 0xF000);
        RAM.set(0x31, 0x33);
        RAM.set(0x34, 0x00);

        RAM.set(0x32, 0x34);
        RAM.set(0x35, 0xFF);

        Register.Y = 0x01;

        chai.assert.strictEqual(Opcode[0xB3](), 6);
        chai.assert.strictEqual(Register.A, 0x00);
        chai.assert.strictEqual(Register.A, Register.X);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.N, 0);

        chai.assert.strictEqual(Opcode[0xB3](), 6);
        chai.assert.strictEqual(Register.A, 0xFF);
        chai.assert.strictEqual(Register.A, Register.X);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 1);
    });

    it("(0xC7) should decrement nn by one, change N, Z and C flags", () => {
        RAM.memory.set(new Uint8Array([0xC7, 0x32, 0x33]), 0xF000);
        RAM.set(0x32, 0xFA);
        RAM.set(0x33, 0x01);
        Flag.Z = Flag.C = 1;

        chai.assert.strictEqual(Opcode[0xC7](), 5);
        chai.assert.strictEqual(RAM.get(0x32), 0xF9);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.C, 0);

        Flag.N = 0;

        chai.assert.strictEqual(Opcode[0xC7](), 5);
        chai.assert.strictEqual(RAM.get(0x33), 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.Z, 1);
        chai.assert.strictEqual(Flag.C, 1);
    });

    it("(0xCB) should do AND with A and X, substract #nn, change Z, N and C flags", () => {
        RAM.memory.set(new Uint8Array([0xCB, 0x01]), 0xF000);
        Register.A = 0x02;
        Register.X = 0x02;
        Flag.N = Flag.Z = 1;

        chai.assert.strictEqual(Opcode[0xCB](), 2);
        chai.assert.strictEqual(Register.X, 1);
        chai.assert.strictEqual(Flag.Z, 0);
        chai.assert.strictEqual(Flag.N, 0);
        chai.assert.strictEqual(Flag.C, 1);
    });
});
