import { Flag, Register, RAM } from './RAM';
import { Convert } from './Common';

// TODO: Memory mirroring
// TODO: Check if BRK works correctly + shouls stack pointer be an array instead?
// TODO: ADC? SBC?
// TODO: Stack pointer and S
// TODO: Decimal mode for ABD/SBC

export class Opcode {

    private static isNextPage(pc1: number, pc2: number) {
        let left: string = ('000' + pc1.toString(16)).slice(-4);
        let right: string = ('000' + pc2.toString(16)).slice(-4);
        return left.charAt(0) != right.charAt(0) || left.charAt(1) != right.charAt(1);
    };

    private static next2byteAddress() {
        let low: number = RAM.get(++Register.PC);
        let high: number = RAM.get(++Register.PC);
        return ((high & 0xFF) << 8) | (low & 0xFF);
    };

    private static ADC(value: number) {
        let old: number = Register.A;

        let result: number = null;

        if(Flag.D) {
            result = Convert.toDecBCD(Register.A) + Flag.C + Convert.toDecBCD(value);
            Flag.C = (result > 99 ? 1 : 0);
        } else {
            result = Register.A + Flag.C + value;
            Flag.C = (result > 0xFF ? 1 : 0);
        };

        Register.A = Convert.toUint8(result);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        Flag.V = ((~(old ^ RAM.get(Register.PC)) & (old ^ Register.A) & 0x80) == Register.A ? 1 : 0);
    };

    private static AND(value: number) {
        Register.A = Register.A & value;

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);
    };

    private static CMP(name: string, value: number) {
        Flag.Z = (Register[name] == value ? 1 : 0);

        Flag.N = (Register[name] < value ? 1 : 0);

        Flag.C = (Register[name] >= value ? 1 : 0);
    };

    private static CJMP(name: string, value: boolean) {
        if(Flag[name] == value) {
            Register.PC++;
            return 2;
        };

        let num: number = Convert.toInt8(RAM.get(++Register.PC));

        return 3 + (this.isNextPage(Register.PC, Register.PC += num) ? 1 : 0);
    };

    private static ORA(value: number) {
        Register.A = Register.A | value;

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);
    };

    // BRK
    public static 0x00() {
        Flag.B = 1;
        Flag.I = 1;

        RAM.set(Register.S, (Register.PC + 1) >> 8);

        Register.S = (Register.S - 1) & 0xFF;

        RAM.set(Register.S, Register.PC + 1);

        Register.S = (Register.S - 1) & 0xFF;

        RAM.set(Register.S, Register.P);

        Register.PC = RAM.read(0xFFFE);

        return 7;
    };

    // ORA (nn, X)
    public static 0x01() {
        this.ORA(RAM.read(RAM.read(RAM.get(++Register.PC) + Register.X)));

        return 6;
    };

    // ORA #nn
    public static 0x09() {
        this.ORA(RAM.get(++Register.PC));

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
        return this.CJMP('N', true);
    };

    // ASL nn, X
    public static 0x16() {
        let address: number = RAM.get(++Register.PC) + Register.X;

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
        let address: number = this.next2byteAddress();

        RAM.set(Register.S, (Register.PC - 1) >> 8);

        Register.S = (Register.S - 1) & 0xFF;

        RAM.set(Register.S, Register.PC - 1);

        Register.S = (Register.S - 1) & 0xFF;

        Register.PC = address - 1;

        return 6;
    };

    // AND nn
    public static 0x25() {
        this.AND(RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // ROL nn
    public static 0x26() {
        let address: number = RAM.get(++Register.PC);

        let value: number = RAM.read(address);

        let carry: string = Convert.toBin(value).charAt(0);

        value = Convert.toUint8(value << 1);

        let rotated: string = Convert.toBin(value).slice(0, -1) + Flag.C.toString();

        value = Convert.toUint8(parseInt(rotated, 2));

        RAM.write(address, value);

        Flag.Z = (value == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(value) < 0 ? 1 : 0);

        Flag.C = parseInt(carry);

        return 5;
    };

    // AND #nn
    public static 0x29() {
        this.AND(RAM.get(++Register.PC));

        return 2;
    };

    // BMI nnn
    public static 0x30() {
        return this.CJMP('N', false);
    };

    // ROL nn, X
    public static 0x36() {
        let address: number = RAM.get(++Register.PC) + Register.X;

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

    // AND nnnn, Y
    public static 0x39() {
        let address: number = this.next2byteAddress();

        this.AND(RAM.read(address + Register.Y));

        return 4  + (this.isNextPage(Register.PC, address + Register.Y) ? 1 : 0);
    };

    // AND nnnn, X
    public static 0x3D() {
        let address: number = this.next2byteAddress();

        this.AND(RAM.read(address + Register.X));

        return 4  + (this.isNextPage(Register.PC, address + Register.X) ? 1 : 0);
    };

    // EOR nn
    public static 0x45() {
        Register.A = Register.A ^ RAM.read(RAM.get(++Register.PC));

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 3;
    };

    // LSR nn
    public static 0x46() {
        let address: number = RAM.get(++Register.PC);

        let value: number = RAM.read(address);

        let carry: string = Convert.toBin(value).charAt(7);

        value = Convert.toUint8(value >>> 1);

        RAM.write(address, value);

        Flag.Z = 0;

        Flag.N = (Convert.toInt8(value) < 0 ? 1 : 0);

        Flag.C = parseInt(carry);

        return 5;
    };

    // EOR #nn
    public static 0x49() {
        Register.A = Register.A ^ RAM.get(++Register.PC);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

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
        let address: number = this.next2byteAddress();

        Register.PC = address - 1;

        return 3;
    };

    // LSR nn, X
    public static 0x56() {
        let address: number = RAM.get(++Register.PC) + Register.X;
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

        Register.S = (Register.S + 1) & 0xFF;

        Register.PC = RAM.get(Register.S) + 1;

        Register.S = (Register.S + 1) & 0xFF;

        Register.PC += RAM.get(Register.S) << 8;

        return 6;
    };

    // ADC nn
    public static 0x65() {
        this.ADC(RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // ROR nn
    public static 0x66() {

        let address: number = RAM.get(++Register.PC);

        let addressValue: number = RAM.read(address);

        let carry: string = Convert.toBin(addressValue).charAt(7);

        let value = Convert.toUint8(addressValue >>> 1);

        let rotated: string = Flag.C.toString() + Convert.toBin(value).substring(1);

        RAM.write(address, parseInt(rotated, 2));

        Flag.Z = (RAM.get(address) == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(RAM.get(address)) < 0 ? 1 : 0);

        Flag.C = parseInt(carry);

        return 5;
    };

    // ADC #nn
    public static 0x69() {
        this.ADC(RAM.get(++Register.PC));

        return 2;
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
        let address: number = RAM.get(++Register.PC) + Register.X;

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

    // ADC nnnn, X
    public static 0x7D() {
        let address: number = this.next2byteAddress();
        this.ADC(RAM.read(address + Register.X));

        return 4  + (this.isNextPage(Register.PC, address + Register.X) ? 1 : 0);
    };

    // STY nn
    public static 0x84() {
        RAM.write(RAM.get(++Register.PC), Register.Y);
        return 3;
    };

    // STA nn
    public static 0x85() {
        RAM.write(RAM.get(++Register.PC), Register.A);
        return 3;
    };

    // STX nn
    public static 0x86() {
        RAM.write(RAM.get(++Register.PC), Register.X);
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
        let address: number = this.next2byteAddress();
        RAM.write(address, Register.A);

        return 4;
    };

    // BCC/BLT nnn
    public static 0x90() {
        return this.CJMP('C', true);
    };

    // STA nn, X
    public static 0x95() {
        RAM.write(RAM.get(++Register.PC) + Register.X, Register.A);
        return 4;
    };

    // TYA
    public static 0x98() {
        Register.A = Register.Y;

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 2;
    };

    // STA nnnn, Y
    public static 0x99() {
        let address: number = this.next2byteAddress();
        RAM.write(address + Register.Y, Register.A);

        return 5;
    };

    // TXS
    public static 0x9A() {
        Register.S = Register.X;

        return 2;
    };

    // LDY #nn
    public static 0xA0() {
        Register.Y = RAM.get(++Register.PC);

        Flag.Z = (Register.Y == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.Y) < 0 ? 1 : 0);

        return 2;
    };

    // LDX #nn
    public static 0xA2() {
        Register.X = RAM.get(++Register.PC);

        Flag.Z = (Register.X == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.X) < 0 ? 1 : 0);

        return 2;
    };

    // LDY nn
    public static 0xA4() {
        Register.Y = RAM.read(RAM.get(++Register.PC));

        Flag.Z = (Register.Y == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.Y) < 0 ? 1 : 0);

        return 3;
    };

    // LDA nn
    public static 0xA5() {
        Register.A = RAM.read(RAM.get(++Register.PC));

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 3;
    };

    // LDX nn
    public static 0xA6() {
        Register.X = RAM.read(RAM.get(++Register.PC));

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
        Register.A = RAM.get(++Register.PC);

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
        let address: number = this.next2byteAddress();

        Register.A = RAM.read(address);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 4;
    };

    // BCS/BGE nnn
    public static 0xB0() {
        return this.CJMP('C', false);
    };

    // LDA (nn), Y
    public static 0xB1() {
        let address: number = RAM.read(RAM.get(++Register.PC)) + Register.Y;

        Register.A = RAM.read(address);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 5 + (this.isNextPage(Register.PC, address) ? 1 : 0);
    };

    // LDA nn, X
    public static 0xB5() {
        Register.A = RAM.read(RAM.get(++Register.PC) + Register.X);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 4;
    };

    // CLV
    public static 0xB8() {
        Flag.V = 0;

        return 2;
    };

    // LDA nnnn, Y
    public static 0xB9() {
        let address: number = this.next2byteAddress();
        Register.A = RAM.read(address + Register.Y);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 4 + (this.isNextPage(Register.PC, address + Register.Y) ? 1 : 0);
    };

    // LDY nnnn, X
    public static 0xBC() {
        let address: number = this.next2byteAddress();
        Register.Y = RAM.read(address + Register.X);

        Flag.Z = (Register.Y == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.Y) < 0 ? 1 : 0);

        return 4 + (this.isNextPage(Register.PC, address + Register.X) ? 1 : 0);
    };

    // LDA nnnn, X
    public static 0xBD() {
        let address: number = this.next2byteAddress();
        Register.A = RAM.read(address + Register.X);

        Flag.Z = (Register.A == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.A) < 0 ? 1 : 0);

        return 4 + (this.isNextPage(Register.PC, address + Register.X) ? 1 : 0);
    };

    // LDX nnnn, Y
    public static 0xBE() {
        let address: number = this.next2byteAddress();
        Register.X = RAM.read(address + Register.Y);

        Flag.Z = (Register.X == 0 ? 1 : 0);

        Flag.N = (Convert.toInt8(Register.X) < 0 ? 1 : 0);

        return 4 + (this.isNextPage(Register.PC, address + Register.Y) ? 1 : 0);
    };

    // CPY #nn
    public static 0xC0() {
        this.CMP('Y', RAM.get(++Register.PC));

        return 2;
    };

    // CPY nn
    public static 0xC4() {
        this.CMP('Y', RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // CMP nn
    public static 0xC5() {
        this.CMP('A', RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // DEC nn
    public static 0xC6() {
        let address: number = RAM.get(++Register.PC);
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
        let value: number = RAM.get(++Register.PC);

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
        return this.CJMP('Z', true);
    };

    // CLD
    public static 0xD8() {
        Flag.D = 0;

        return 2;
    };

    // CPX #nn
    public static 0xE0() {
        this.CMP('X', RAM.get(++Register.PC));

        return 2;
    };

    // CPX nn
    public static 0xE4() {
        this.CMP('X', RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // SBC nn
    public static 0xE5() {
        this.ADC(~RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // INC nn
    public static 0xE6() {
        let address: number = RAM.get(++Register.PC);
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

    // SBC #nn
    public static 0xE9() {
        this.ADC(~RAM.get(++Register.PC));

        return 2;
    };

    // No operator
    public static 0xEA() {
        return 2;
    };

    // BEQ/BZS nnn
    public static 0xF0() {
        return this.CJMP('Z', false);
    };

    // SED
    public static 0xF8() {
        Flag.D = 1;

        return 2;
    };
};
