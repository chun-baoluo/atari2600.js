import { Flag, Register, RAM } from './RAM';
import { Convert } from './Common';

// TODO: Memory mirroring
// TODO: Check if BRK works correctly + shouls stack pointer be an array instead?

export class Opcode {

    private static isNextPage(pc1: number, pc2: number) {
        let left: string = ('000' + pc1.toString(16)).slice(-4);
        let right: string = ('000' + pc2.toString(16)).slice(-4);
        return left.charAt(0) != right.charAt(0) || left.charAt(1) != right.charAt(1);
    };

    // BRK
    public static 0x00() {
        Flag.B = 1;
        Flag.I = 1;
        Register.PC += 2;
        Register.S = Register.PC;
        return 7;
    };

    // ORA #nn
    public static 0x09() {
        Register.A = Register.A | RAM.rom(++Register.PC);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 2;
    };

    // ASL A
    public static 0x0A() {

        let carry: string = Convert.toBin(Register.A).charAt(0);

        Register.A = Convert.toUint8(Register.A << 1);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        Flag.C = parseInt(carry);

        return 2;
    };

    // BPL nnn
    public static 0x10() {
        if(Flag.N == 1) {
			Register.PC++;
			return 2;
		};

		let num: number = Convert.toInt8(RAM.rom(++Register.PC));

        return 3 + (this.isNextPage(Register.PC, Register.PC += num) ? 1 : 0);
    };

    // ASL nn, X
    public static 0x16() {
        let address: number = RAM.rom(++Register.PC) + Register.X;

        let value: number = RAM.read(address);

        let carry: string = Convert.toBin(value).charAt(0);

        value = Convert.toUint8(value << 1);

        RAM.write(address, value);

        Flag.Z = (value == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(value) < 0 ? 1 : 0);

        Flag.C = parseInt(carry);

        return 6;
    };

    // CLC
    public static 0x18() {
        Flag.C = 0;

        return 2;
    };

    // JSR nnnn
    public static 0x20() {
        let low: number = RAM.rom(++Register.PC);
        let high: number = RAM.rom(++Register.PC);
        let address: number = ((high & 0xFF) << 8) | (low & 0xFF);

        Register.S = Register.PC;
        Register.PC = (address - 61440) - 1;

        return 6;
    };

    // AND #nn
    public static 0x29() {
        Register.A = Register.A & RAM.rom(++Register.PC);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 2;
    };

    // ROL nn, X
    public static 0x36() {
        let address: number = RAM.rom(++Register.PC) + Register.X;

        let value: number = RAM.read(address);

        let carry: string = Convert.toBin(value).charAt(0);

        value = Convert.toUint8(value << 1);

        let rotated: string = Convert.toBin(value).slice(0, -1) + Flag.C.toString();

        value = Convert.toUint8(parseInt(rotated, 2));

        RAM.write(address, value);

        Flag.Z = (value == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(value) < 0 ? 1 : 0);

        Flag.C = parseInt(carry);

        return 6;
    };

    // SEC
    public static 0x38() {
        Flag.C = 1;

        return 2;
    };

    // LSR A
    public static 0x4A() {
        let carry: string = Convert.toBin(Register.A).charAt(7);

        Register.A = Convert.toUint8(Register.A >>> 1);

        Flag.Z = 0;

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        Flag.C = parseInt(carry);

        return 2;
    };

    // JMP nnnn
    public static 0x4C() {
        let low: number = RAM.rom(++Register.PC);
        let high: number = RAM.rom(++Register.PC);
        let address: number = ((high & 0xFF) << 8) | (low & 0xFF);

        Register.PC = (address & 0xFF) - 1;

        return 3;
    };

    // LSR nn, X
    public static 0x56() {
        let address: number = RAM.rom(++Register.PC) + Register.X;
        let value: number = RAM.read(address);
        let carry: string = Convert.toBin(value).charAt(7);

        value = Convert.toUint8(value >>> 1);

        RAM.write(address, value);

        Flag.Z = 0;

        Flag.N = (Convert.toInt8(value) < 0 ? 1 : 0);

        Flag.C = parseInt(carry);

        return 6;
    };

    // CLI
    public static 0x58() {
        Flag.I = 0;

        return 2;
    };

    // RTS
    public static 0x60() {
        Register.PC = Register.S;
        return 6;
    };

    // ROR A
    public static 0x6A() {
        let carry: string = Convert.toBin(Register.A).charAt(7);

        let value = Convert.toUint8(Register.A >>> 1);

        let rotated: string = Flag.C.toString() + Convert.toBin(value).substring(1);

        Register.A = Convert.toUint8(parseInt(rotated, 2));

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        Flag.C = parseInt(carry);

        return 2;
    };

    // ROR nn, X
    public static 0x76() {
        let address: number = RAM.rom(++Register.PC) + Register.X;

        let value: number = RAM.read(address);

        let carry: string = Convert.toBin(value).charAt(7);

        value = Convert.toUint8(value >>> 1);

        let rotated: string = Flag.C.toString() + Convert.toBin(value).substring(1);

        value = Convert.toUint8(parseInt(rotated, 2));

        RAM.write(address, value);

        Flag.Z = (value == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(value) < 0 ? 1 : 0);

        Flag.C = parseInt(carry);

        return 6;
    };

    // SEI
    public static 0x78() {
        Flag.I = 1;

        return 2;
    };

    // STY nn
    public static 0x84() {
        RAM.write(RAM.rom(++Register.PC), Register.Y);
        return 3;
    };

    // STA nn
    public static 0x85() {
        RAM.write(RAM.rom(++Register.PC), Register.A);
        return 3;
    };

    // STX nn
    public static 0x86() {
        RAM.write(RAM.rom(++Register.PC), Register.X);
        return 3;
    };

    // DEY
    public static 0x88() {
        Register.Y = Convert.toUint8(Register.Y - 1);

        Flag.Z = (Register.Y == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.Y) < 0 ? 1 : 0);

        return 2;
    };

    // TXA
    public static 0x8A() {
        Register.A = Register.X;

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 2;
    };

    // STA nnnn
    public static 0x8D() {
        let low: number = RAM.rom(++Register.PC);
        let high: number = RAM.rom(++Register.PC);
        let address: number = ((high & 0xff) << 8) | (low & 0xff);

        RAM.write(address, Register.A);

        return 4;
    };

    // BCC/BLT nnn
    public static 0x90() {
        if(Flag.C == 1) {
            Register.PC++;
            return 2;
        };

        let num: number = Convert.toInt8(RAM.rom(++Register.PC));

        return 3 + (this.isNextPage(Register.PC, Register.PC += num) ? 1 : 0);
    };

    // STA nn, X
    public static 0x95() {
        RAM.write(RAM.rom(++Register.PC) + Register.X, Register.A);
        return 4;
    };

    // TXS
    public static 0x9A() {
        Register.S = Register.X;

        return 2;
    };

    // LDY #nn
    public static 0xA0() {
        Register.Y = RAM.rom(++Register.PC);

        Flag.Z = (Register.Y == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.Y) < 0 ? 1 : 0);

        return 2;
    };

    // LDX #nn
    public static 0xA2() {
        Register.X = RAM.rom(++Register.PC);

        Flag.Z = (Register.X == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.X) < 0 ? 1 : 0);

        return 2;
    };

    // LDA nn
    public static 0xA5() {
        Register.A = RAM.read(RAM.rom(++Register.PC));

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 3;
    };

    // LDX nn
    public static 0xA6() {
        Register.X = RAM.read(RAM.rom(++Register.PC));

        Flag.Z = (Register.X == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.X) < 0 ? 1 : 0);

        return 3;
    };

    // TAY
    public static 0xA8() {
        Register.Y = Register.A;

        Flag.Z = (Register.Y == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.Y) < 0 ? 1 : 0);

        return 2;
    };

    // LDA #nn
    public static 0xA9() {
        Register.A = RAM.rom(++Register.PC);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 2;
    };

    // TAX
    public static 0xAA() {
        Register.X = Register.A;

        Flag.Z = (Register.X == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.X) < 0 ? 1 : 0);

        return 2;
    };

    // LDA nnnn
    public static 0xAD() {
        let low: number = RAM.rom(++Register.PC);
        let high: number = RAM.rom(++Register.PC);
        let address: number = ((high & 0xFF) << 8) | (low & 0xFF);

        Register.A = RAM.read(address);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 4;
    };

    // BCS/BGE nnn
    public static 0xB0() {
        if(Flag.C == 0) {
            Register.PC++;
            return 2;
        };

        let num: number = Convert.toInt8(RAM.rom(++Register.PC));

        return 3 + (this.isNextPage(Register.PC, Register.PC += num) ? 1 : 0);
    };

    // LDA nn, X
    public static 0xB5() {
        Register.A = RAM.read(RAM.rom(++Register.PC) + Register.X);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 4;
    };

    // CLV
    public static 0xB8() {
        Flag.V = 0;

        return 2;
    };

    // LDA nnnn, X
    public static 0xBD() {
        let low: number = RAM.rom(++Register.PC);
        let high: number = RAM.rom(++Register.PC);
        let address: number = ((high & 0xFF) << 8) | (low & 0xFF);

        Register.A = RAM.read(address + Register.X);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 4 + (this.isNextPage(61440 + Register.PC, address + Register.X) ? 1 : 0);
    };

    // CPY #nn
    public static 0xC0() {
        let value: number = RAM.rom(++Register.PC);

        Flag.Z = (Register.Y == value ? 1 : 0);

        Flag.N = (Register.Y < value ? 1 : 0);

        Flag.C = (Register.Y >= value ? 1 : 0);

        return 2;
    };

    // DEC nn
    public static 0xC6() {
        let address: number = RAM.rom(++Register.PC);
        let result: number = RAM.write(address, RAM.get(address) - 1);

        Flag.Z = (result == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(result) < 0 ? 1 : 0);

        return 5;
    };

    // INY
    public static 0xC8() {
        Register.Y = Convert.toUint8(Register.Y + 1);

        Flag.Z = (Register.Y == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.Y) < 0 ? 1 : 0);

        return 2;
    };

    // CMP #nn
    public static 0xC9() {
        let value: number = RAM.rom(++Register.PC);

        Flag.Z = (Register.A == value ? 1 : 0);

        Flag.N = (Register.A < value ? 1 : 0);

        Flag.C = (Register.A >= value ? 1 : 0);

        return 2;
    };

    // DEX
    public static 0xCA() {
        Register.X = Convert.toUint8(Register.X - 1);

        Flag.Z = (Register.X == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.X) < 0 ? 1 : 0);

        return 2;
    };

    // BNE
    public static 0xD0() {
        if(Flag.Z == 1) {
			Register.PC++;
			return 2;
		};

		let num: number = Convert.toInt8(RAM.rom(++Register.PC));

        return 3 + (this.isNextPage(Register.PC, Register.PC += num) ? 1 : 0);
    };

    // CLD
    public static 0xD8() {
        Flag.D = 0;

        return 2;
    };

    // CPX #nn
    public static 0xE0() {
        let value: number = RAM.rom(++Register.PC);

        Flag.Z = (Register.X == value ? 1 : 0);

        Flag.N = (Register.X < value ? 1 : 0);

        Flag.C = (Register.X >= value ? 1 : 0);

        return 2;
    };

    // INC nn
    public static 0xE6() {
        let address: number = RAM.rom(++Register.PC);
        let result: number = RAM.write(address, RAM.get(address) + 1);

        Flag.Z = (result == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(result) < 0 ? 1 : 0);

        return 5;
    };

    // INX
    public static 0xE8() {
        Register.X = Convert.toUint8(Register.X + 1);

        Flag.Z = (Register.X == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.X) < 0 ? 1 : 0);

        return 2;
    };

    // No operator
    public static 0xEA() {
        return 2;
    };

    // BEQ/BZS nnn
    public static 0xF0() {
        if(Flag.Z == 0) {
            Register.PC++;
            return 2;
        };

        let num: number = Convert.toInt8(RAM.rom(++Register.PC));

        return 3 + (this.isNextPage(Register.PC, Register.PC += num) ? 1 : 0);
    };

    // SED
    public static 0xF8() {
        Flag.D = 1;

        return 2;
    };
};
