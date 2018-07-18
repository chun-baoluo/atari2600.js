import { Flag, Register, RAM } from './RAM';
import { Convert } from './Common';

// TODO: Memory mirroring
// TODO: Decimal mode for ABD/SBC

export class Opcode {

    private static isNextPage(address: number, addressWithOffset: number): boolean {
        return address >> 0x08 % 0xFF != addressWithOffset >> 0x08 % 0xFF;
    };

    private static isZero(value: number): number {
        return (value == 0 ? 1 : 0)
    };

    private static isNegative(value: number): number {
        return (Convert.toInt8(value) < 0 ? 1 : 0);
    };

    private static ADC(value: number): void {
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

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);

        Flag.V = ((~(old ^ RAM.get(Register.PC)) & (old ^ Register.A) & 0x80) == Register.A ? 1 : 0);
    };

    private static AND(value: number): void {
        Register.A = Register.A & value;

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);
    };

    private static ASL(address: number): void {
        let value: number = RAM.read(address);

        let carry: string = Convert.toBin(value).charAt(0);

        value = Convert.toUint8(value << 1);

        RAM.write(address, value);

        Flag.Z = this.isZero(value);

        Flag.N = this.isNegative(value);

        Flag.C = parseInt(carry);
    };

    private static CMP(name: string, value: number): void {
        Flag.Z = (Register[name] == value ? 1 : 0);

        Flag.N = this.isNegative(Register[name] - value);

        Flag.C = (Register[name] - value >= 0 ? 1 : 0);
    };

    private static CJMP(name: string, value: boolean): number {
        if(Flag[name] == value) {
            Register.PC++;
            return 2;
        };

        let num: number = Convert.toInt8(RAM.get(++Register.PC));

        return 3 + (this.isNextPage(Register.PC, Register.PC += num) ? 1 : 0);
    };

    private static DEC(address: number): void {
        let result: number = RAM.write(address, RAM.get(address) - 1);

        Flag.Z = this.isZero(result);

        Flag.N = this.isNegative(result);
    };

    private static EOR(value: number): void {
        Register.A = Register.A ^ value;

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);
    };

    private static INC(address: number): void {
        let result: number = RAM.write(address, RAM.get(address) + 1);

        Flag.Z = this.isZero(result);

        Flag.N = this.isNegative(result);
    };

    private static LD(name: string, address: number): void {
        Register[name] = RAM.read(address);

        Flag.Z = this.isZero(Register[name]);

        Flag.N = this.isNegative(Register[name]);
    };

    private static LSR(address: number): void {
        let value: number = RAM.read(address);

        let carry: string = Convert.toBin(value).charAt(7);

        value = Convert.toUint8(value >>> 1);

        RAM.write(address, value);

        Flag.Z = 0;

        Flag.N = this.isNegative(value);

        Flag.C = parseInt(carry);
    };

    private static next2BYTES(): number {
        let low: number = RAM.get(++Register.PC);
        let high: number = RAM.get(++Register.PC);
        return ((high & 0xFF) << 8) | (low & 0xFF);
    };

    private static ORA(value: number): void {
        Register.A = Register.A | value;

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);
    };

    private static ROL(address: number): void {
        let value: number = RAM.read(address);

        let carry: string = Convert.toBin(value).charAt(0);

        value = Convert.toUint8(value << 1);

        let rotated: string = Convert.toBin(value).slice(0, -1) + Flag.C.toString();

        RAM.write(address, parseInt(rotated, 2));

        Flag.Z = this.isZero(RAM.get(address));

        Flag.N = this.isNegative(RAM.get(address));

        Flag.C = parseInt(carry);
    };

    private static ROR(address: number): void {
        let addressValue: number = RAM.read(address);

        let carry: string = Convert.toBin(addressValue).charAt(7);

        let value = Convert.toUint8(addressValue >>> 1);

        let rotated: string = Flag.C.toString() + Convert.toBin(value).substring(1);

        RAM.write(address, parseInt(rotated, 2));

        Flag.Z = this.isZero(RAM.get(address));

        Flag.N = this.isNegative(RAM.get(address));

        Flag.C = parseInt(carry);
    };

    private static POP(): number {
        Register.S = (Register.S + 1) & 0xFF;

        return RAM.get(Register.S);
    };

    private static PUSH(value: number): void {
        RAM.set(Register.S, value);

        Register.S = (Register.S - 1) & 0xFF;
    };

    private static WORD(address: number): number {
        return ((RAM.read(address + 1) & 0xFF) << 8) | (RAM.read(address) & 0xFF);
    };

    // BRK
    public static 0x00(): number {
        Flag.B = 1;

        let flags: number = parseInt('' + Flag.N + Flag.V + Flag.U + Flag.B + Flag.D + Flag.I + Flag.Z + Flag.C, 2);

        Flag.I = 1;

        this.PUSH((Register.PC + 1) >> 8);

        this.PUSH(Register.PC + 1);

        this.PUSH(flags);

        Register.PC = this.WORD(0xFFFE);

        return 7;
    };

    // ORA (nn, X)
    public static 0x01(): number {
        this.ORA(RAM.read(this.WORD(Convert.toUint8(RAM.get(++Register.PC) + Register.X))));

        return 6;
    };

    // NOP nn
    public static 0x04(): number {
        Register.PC++;
        return 3;
    };

    // ORA nn
    public static 0x05(): number {
        this.ORA(RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // ASL nn
    public static 0x06(): number {
        this.ASL(RAM.get(++Register.PC));

        return 5;
    };

    // PHP
    public static 0x08(): number {
        let flags: number = parseInt('' + Flag.N + Flag.V + 1 + 1 + Flag.D + Flag.I + Flag.Z + Flag.C, 2);

        this.PUSH(flags);

        return 3;
    };

    // ORA #nn
    public static 0x09(): number {
        this.ORA(RAM.get(++Register.PC));

        return 2;
    };

    // ASL A
    public static 0x0A(): number {
        let carry: string = Convert.toBin(Register.A).charAt(0);

        Register.A = Convert.toUint8(Register.A << 1);

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);

        Flag.C = parseInt(carry);

        return 2;
    };

    // NOP nnnn
    public static 0x0C(): number {
        this.next2BYTES();
        return 4;
    };

    // ORA nnnn
    public static 0x0D(): number {
        this.ORA(RAM.read(this.next2BYTES()));

        return 4;
    };

    // ASL nnnn
    public static 0x0E(): number {
        this.ASL(this.next2BYTES());

        return 6;
    };

    // BPL nnn
    public static 0x10(): number {
        return this.CJMP('N', true);
    };

    // ORA (nn), Y
    public static 0x11(): number {
        let address: number = this.WORD(RAM.get(++Register.PC));

        this.ORA(RAM.read(address + Register.Y));

        return 5 + (this.isNextPage(address, address + Register.Y) ? 1 : 0);
    };

    // NOP nn, X
    public static 0x14(): number {
        Register.PC++;
        return 4;
    };

    // ORA nn, X
    public static 0x15(): number {
        this.ORA(RAM.read(Convert.toUint8(RAM.get(++Register.PC) + Register.X)));

        return 4;
    };

    // ASL nn, X
    public static 0x16(): number {
        this.ASL(Convert.toUint8(RAM.get(++Register.PC) + Register.X));

        return 6;
    };

    // CLC
    public static 0x18(): number {
        Flag.C = 0;

        return 2;
    };

    // ORA nnnn, Y
    public static 0x19(): number {
        let address: number = this.next2BYTES();

        this.ORA(RAM.read((address + Register.Y) & 0xFFFF));

        return 4 + (this.isNextPage(address, (address + Register.Y) & 0xFFFF) ? 1 : 0);
    };

    // NOP nnnn, X
    public static 0x1C(): number {
        let address: number = this.next2BYTES();
        return 4 + (this.isNextPage(address, (address + Register.X) & 0xFFFF) ? 1 : 0);
    };

    // ORA nnnn, X
    public static 0x1D(): number {
        let address: number = this.next2BYTES();

        this.ORA(RAM.read((address + Register.X) & 0xFFFF));

        return 4 + (this.isNextPage(address, (address + Register.X) & 0xFFFF) ? 1 : 0);
    };

    // ASL nnnn, X
    public static 0x1E(): number {
        this.ASL((this.next2BYTES() + Register.X) & 0xFFFF);

        return 7;
    };

    // JSR nnnn
    public static 0x20(): number {
        let address: number = this.next2BYTES();

        this.PUSH(Register.PC >> 8);
        this.PUSH(Register.PC);
        Register.PC = address - 1;

        return 6;
    };

    // AND (nn, X)
    public static 0x21(): number {
        this.AND(RAM.read(this.WORD(Convert.toUint8(RAM.get(++Register.PC) + Register.X))));

        return 6;
    };

    // BIT nn
    public static 0x24(): number {
        let value: number = RAM.read(RAM.get(++Register.PC));

        let bin: string = Convert.toBin(value);

        Flag.Z = this.isZero(Register.A & value);

        Flag.N = (bin.charAt(0) == '1' ? 1 : 0);

        Flag.V = (bin.charAt(1) == '1' ? 1 : 0);

        return 3;
    };

    // AND nn
    public static 0x25(): number {
        this.AND(RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // ROL nn
    public static 0x26(): number {
        this.ROL(RAM.get(++Register.PC));

        return 5;
    };

    // PLP
    public static 0x28(): number {
        let val: Array<string> = Convert.toBin(this.POP()).split('');

        Flag.N = parseInt(val[0]);

        Flag.V = parseInt(val[1]);

        Flag.B = parseInt(val[3]);

        Flag.D = parseInt(val[4]);

        Flag.I = parseInt(val[5]);

        Flag.Z = parseInt(val[6]);

        Flag.C = parseInt(val[7]);

        return 4;
    };

    // AND #nn
    public static 0x29(): number {
        this.AND(RAM.get(++Register.PC));

        return 2;
    };

    // ROL A
    public static 0x2A(): number {

        let value: number = Register.A;

        let carry: string = Convert.toBin(value).charAt(0);

        value = Convert.toUint8(value << 1);

        let rotated: string = Convert.toBin(value).slice(0, -1) + Flag.C.toString();

        value = Convert.toUint8(parseInt(rotated, 2));

        Register.A = value;

        Flag.Z = this.isZero(value);

        Flag.N = this.isNegative(value);

        Flag.C = parseInt(carry);

        return 2;
    };

    // BIT nnnn
    public static 0x2C(): number {
        let value: number = RAM.read(this.next2BYTES());

        let bin: string = Convert.toBin(value);

        Flag.Z = this.isZero(Register.A & value);

        Flag.N = (bin.charAt(0) == '1' ? 1 : 0);

        Flag.V = (bin.charAt(1) == '1' ? 1 : 0);

        return 4;
    };

    // AND nnnn
    public static 0x2D(): number {
        this.AND(RAM.read(this.next2BYTES()));

        return 4;
    };

    // ROL nnnn
    public static 0x2E(): number {
        this.ROL(this.next2BYTES());

        return 6;
    };

    // BMI nnn
    public static 0x30(): number {
        return this.CJMP('N', false);
    };

    // AND (nn), Y
    public static 0x31(): number {
        let address: number = this.WORD(RAM.get(++Register.PC));

        this.AND(RAM.read(address + Register.Y));

        return 5 + (this.isNextPage(address, address + Register.Y) ? 1 : 0);
    };

    // NOP nn, X
    public static 0x34(): number {
        return this[0x14]();
    };

    // AND nn, X
    public static 0x35(): number {
        this.AND(RAM.read(Convert.toUint8(RAM.get(++Register.PC) + Register.X)));

        return 4;
    };

    // ROL nn, X
    public static 0x36(): number {
        this.ROL(Convert.toUint8(RAM.get(++Register.PC) + Register.X));

        return 6;
    };

    // SEC
    public static 0x38(): number {
        Flag.C = 1;

        return 2;
    };

    // AND nnnn, Y
    public static 0x39(): number {
        let address: number = this.next2BYTES();

        this.AND(RAM.read((address + Register.Y) & 0xFFFF));

        return 4 + (this.isNextPage(address, (address + Register.Y) & 0xFFFF) ? 1 : 0);
    };

    // NOP nnnn, X
    public static 0x3C(): number {
        return this[0x1C]();
    };

    // AND nnnn, X
    public static 0x3D(): number {
        let address: number = this.next2BYTES();

        this.AND(RAM.read((address + Register.X) & 0xFFFF));

        return 4 + (this.isNextPage(address, (address + Register.X) & 0xFFFF) ? 1 : 0);
    };

    // ROL nnnn, X
    public static 0x3E(): number {
        this.ROL((this.next2BYTES() + Register.X) & 0xFFFF);

        return 7;
    };

    // RTI
    public static 0x40(): number {
        let val: Array<string> = Convert.toBin(this.POP()).split('');

        Register.PC = this.POP();

        Register.PC += this.POP() << 8;

        Flag.N = parseInt(val[0]);

        Flag.V = parseInt(val[1]);

        Flag.D = parseInt(val[4]);

        Flag.I = parseInt(val[5]);

        Flag.Z = parseInt(val[6]);

        Flag.C = parseInt(val[7]);

        return 6;
    };

    // EOR (nn, X)
    public static 0x41(): number {
        this.EOR(RAM.read(this.WORD(Convert.toUint8(RAM.get(++Register.PC) + Register.X))));

        return 6;
    };

    // NOP nn
    public static 0x44(): number {
        return this[0x04]();
    };

    // EOR nn
    public static 0x45(): number {
        this.EOR(RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // LSR nn
    public static 0x46(): number {
        this.LSR(RAM.get(++Register.PC));

        return 5;
    };

    // PHA
    public static 0x48(): number {
        this.PUSH(Register.A);

        return 3;
    };

    // EOR #nn
    public static 0x49(): number {
        this.EOR(RAM.get(++Register.PC));

        return 2;
    };

    // LSR A
    public static 0x4A(): number {
        let carry: string = Convert.toBin(Register.A).charAt(7);

        Register.A = Convert.toUint8(Register.A >>> 1);

        Flag.Z = 0;

        Flag.N = this.isNegative(Register.A);

        Flag.C = parseInt(carry);

        return 2;
    };

    // ALR #nn
    public static 0x4B(): number {
        let bin: string = Convert.toBin(Register.A & RAM.get(++Register.PC));

        Register.A = (Register.A & RAM.get(Register.PC)) >>> 1

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);

        Flag.C = (bin.charAt(7) == '1' ? 1 : 0);

        return 2;
    };

    // JMP nnnn
    public static 0x4C(): number {
        let address: number = this.next2BYTES();

        Register.PC = address - 1;

        return 3;
    };

    // EOR nnnn
    public static 0x4D(): number {
        this.EOR(RAM.read(this.next2BYTES()));

        return 4;
    };

    // LSR nnnn
    public static 0x4E(): number {
        this.LSR(this.next2BYTES());

        return 6;
    };

    // BVC nnn
    public static 0x50(): number {
        return this.CJMP('V', true);
    };

    // EOR (nn), Y
    public static 0x51(): number {
        let address: number = this.WORD(RAM.get(++Register.PC));

        this.EOR(RAM.read(address + Register.Y));

        return 5 + (this.isNextPage(address, address + Register.Y) ? 1 : 0);
    };

    // NOP nn, X
    public static 0x54(): number {
        return this[0x14]();
    };

    // EOR nn, X
    public static 0x55(): number {
        this.EOR(RAM.read(Convert.toUint8(RAM.get(++Register.PC) + Register.X)));

        return 4;
    };

    // LSR nn, X
    public static 0x56(): number {
        this.LSR(Convert.toUint8(RAM.get(++Register.PC) + Register.X));

        return 6;
    };

    // CLI
    public static 0x58(): number {
        Flag.I = 0;

        return 2;
    };

    // EOR nnnn, Y
    public static 0x59(): number {
        let address: number = this.next2BYTES();

        this.EOR(RAM.read((address + Register.Y) & 0xFFFF));

        return 4 + (this.isNextPage(address, (address + Register.Y) & 0xFFFF) ? 1 : 0);
    };

    // NOP nnnn, X
    public static 0x5C(): number {
        return this[0x1C]();
    };

    // EOR nnnn, X
    public static 0x5D(): number {
        let address: number = this.next2BYTES();

        this.EOR(RAM.read((address + Register.X) & 0xFFFF));

        return 4 + (this.isNextPage(address, (address + Register.X) & 0xFFFF) ? 1 : 0);
    };

    // LSR nnnn, X
    public static 0x5E(): number {
        this.LSR((this.next2BYTES() + Register.X) & 0xFFFF);

        return 7;
    };

    // RTS
    public static 0x60(): number {
        Register.PC = this.POP();
        Register.PC += this.POP() << 8;

        return 6;
    };

    // NOP nn
    public static 0x64(): number {
        return this[0x04]();
    };

    // ADC nn
    public static 0x65(): number {
        this.ADC(RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // ROR nn
    public static 0x66(): number {
        this.ROR(RAM.get(++Register.PC));

        return 5;
    };

    // PLA
    public static 0x68(): number {
        Register.A = this.POP();

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);

        return 4;
    };

    // ADC #nn
    public static 0x69(): number {
        this.ADC(RAM.get(++Register.PC));

        return 2;
    };

    // ROR A
    public static 0x6A(): number {
        let carry: string = Convert.toBin(Register.A).charAt(7);

        let value = Convert.toUint8(Register.A >>> 1);

        let rotated: string = Flag.C.toString() + Convert.toBin(value).substring(1);

        Register.A = Convert.toUint8(parseInt(rotated, 2));

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);

        Flag.C = parseInt(carry);

        return 2;
    };

    // JMP (nnnn)
    public static 0x6C(): number {
        let address: number = this.next2BYTES();

        let low: number = RAM.read(address);

        let high: number = ((address & 0xFF) == 0xFF ? RAM.read(address - 0xFF) : RAM.read(address + 1));

        let value: number = (((high & 0xFF) << 8) | (low & 0xFF));

        Register.PC = value - 1;

        return 5;
    };

    // ADC nnnn
    public static 0x6D(): number {
        this.ADC(RAM.read(this.next2BYTES()));

        return 4;
    };

    // ROR nnnn
    public static 0x6E(): number {
        this.ROR(this.next2BYTES());

        return 6;
    };

    // BVS nnn
    public static 0x70(): number {
        return this.CJMP('V', false);
    };

    // ADC (nn), Y
    public static 0x71(): number {
        let address: number = this.WORD(RAM.get(++Register.PC));

        this.ADC(RAM.read(address + Register.Y));

        return 5 + (this.isNextPage(address, address + Register.Y) ? 1 : 0);
    };

    // NOP nn, X
    public static 0x74(): number {
        return this[0x14]();
    };

    // ADC nn, X
    public static 0x75(): number {
        this.ADC(RAM.read(Convert.toUint8(RAM.get(++Register.PC) + Register.X)));

        return 4;
    };

    // ROR nn, X
    public static 0x76(): number {
        this.ROR(Convert.toUint8(RAM.get(++Register.PC) + Register.X));

        return 6;
    };

    // SEI
    public static 0x78(): number {
        Flag.I = 1;

        return 2;
    };

    // ADC nnnn, Y
    public static 0x79(): number {
        let address: number = this.next2BYTES();
        this.ADC(RAM.read((address + Register.Y) & 0xFFFF));

        return 4 + (this.isNextPage(address, (address + Register.Y) & 0xFFFF) ? 1 : 0);
    };

    // NOP nnnn, X
    public static 0x7C(): number {
        return this[0x1C]();
    };

    // ADC nnnn, X
    public static 0x7D(): number {
        let address: number = this.next2BYTES();
        this.ADC(RAM.read((address + Register.X) & 0xFFFF));

        return 4 + (this.isNextPage(address, (address + Register.X) & 0xFFFF) ? 1 : 0);
    };

    // ROR nnnn, X
    public static 0x7E(): number {
        this.ROR((this.next2BYTES() + Register.X) & 0xFFFF);

        return 7;
    };

    // NOP #nn
    public static 0x80(): number {
        Register.PC++;
        return 2;
    };

    // STA (nn, X)
    public static 0x81(): number {
        RAM.write(RAM.read(this.WORD(Convert.toUint8(RAM.get(++Register.PC) + Register.X))), Register.A);

        return 6;
    };

    // NOP #nn
    public static 0x82(): number {
        return this[0x80]();
    };

    // STY nn
    public static 0x84(): number {
        RAM.write(RAM.get(++Register.PC), Register.Y);

        return 3;
    };

    // STA nn
    public static 0x85(): number {
        RAM.write(RAM.get(++Register.PC), Register.A);

        return 3;
    };

    // STX nn
    public static 0x86(): number {
        RAM.write(RAM.get(++Register.PC), Register.X);

        return 3;
    };

    // DEY
    public static 0x88(): number {
        Register.Y = Convert.toUint8(Register.Y - 1);

        Flag.Z = this.isZero(Register.Y);

        Flag.N = this.isNegative(Register.Y);

        return 2;
    };

    // NOP #nn
    public static 0x89(): number {
        return this[0x80]();
    };

    // TXA
    public static 0x8A(): number {
        Register.A = Register.X;

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);

        return 2;
    };

    // STY nnnn
    public static 0x8C(): number {
        RAM.write(this.next2BYTES(), Register.Y);

        return 4;
    };

    // STA nnnn
    public static 0x8D(): number {
        RAM.write(this.next2BYTES(), Register.A);

        return 4;
    };

    // STX nnnn
    public static 0x8E(): number {
        RAM.write(this.next2BYTES(), Register.X);

        return 4;
    };

    // BCC/BLT nnn
    public static 0x90(): number {
        return this.CJMP('C', true);
    };

    // STA (nn), Y
    public static 0x91(): number {
        RAM.write(this.WORD(RAM.get(++Register.PC)) + Register.Y, Register.A);

        return 6;
    };

    // STY nn, X
    public static 0x94(): number {
        RAM.write(Convert.toUint8(RAM.get(++Register.PC) + Register.X), Register.Y);
        return 4;
    };

    // STA nn, X
    public static 0x95(): number {
        RAM.write(Convert.toUint8(RAM.get(++Register.PC) + Register.X), Register.A);
        return 4;
    };

    // STX nn, Y
    public static 0x96(): number {
        RAM.write(Convert.toUint8(RAM.get(++Register.PC) + Register.Y), Register.X);

        return 4;
    };

    // TYA
    public static 0x98(): number {
        Register.A = Register.Y;

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);

        return 2;
    };

    // STA nnnn, Y
    public static 0x99(): number {
        RAM.write((this.next2BYTES() + Register.Y) & 0xFFFF, Register.A);

        return 5;
    };

    // TXS
    public static 0x9A(): number {
        Register.S = Register.X;

        return 2;
    };

    // STA nnnn, X
    public static 0x9D(): number {
        RAM.write((this.next2BYTES() + Register.X) & 0xFFFF, Register.A);

        return 5;
    };

    // LDY #nn
    public static 0xA0(): number {
        this.LD('Y', ++Register.PC);

        return 2;
    };

    // LDA (nn, X)
    public static 0xA1(): number {
        this.LD('A', this.WORD(Convert.toUint8(RAM.get(++Register.PC) + Register.X)));

        return 6;
    };

    // LDX #nn
    public static 0xA2(): number {
        this.LD('X', ++Register.PC);

        return 2;
    };

    // LDY nn
    public static 0xA4(): number {
        this.LD('Y', RAM.get(++Register.PC));

        return 3;
    };

    // LDA nn
    public static 0xA5(): number {
        this.LD('A', RAM.get(++Register.PC));

        return 3;
    };

    // LDX nn
    public static 0xA6(): number {
        this.LD('X', RAM.get(++Register.PC));

        return 3;
    };

    // LAX nn
    public static 0xA7(): number {
        Register.A = Register.X = RAM.read(RAM.get(++Register.PC));

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);

        return 3;
    };

    // TAY
    public static 0xA8(): number {
        Register.Y = Register.A;

        Flag.Z = this.isZero(Register.Y);

        Flag.N = this.isNegative(Register.Y);

        return 2;
    };

    // LDA #nn
    public static 0xA9(): number {
        this.LD('A', ++Register.PC);

        return 2;
    };

    // TAX
    public static 0xAA(): number {
        Register.X = Register.A;

        Flag.Z = this.isZero(Register.X);

        Flag.N = this.isNegative(Register.X);

        return 2;
    };

    // LDY nnnn
    public static 0xAC(): number {
        this.LD('Y', this.next2BYTES());

        return 4;
    };

    // LDA nnnn
    public static 0xAD(): number {
        this.LD('A', this.next2BYTES());

        return 4;
    };

    // LDX nnnn
    public static 0xAE(): number {
        this.LD('X', this.next2BYTES());

        return 4;
    };

    // BCS/BGE nnn
    public static 0xB0(): number {
        return this.CJMP('C', false);
    };

    // LDA (nn), Y
    public static 0xB1(): number {
        let address: number = this.WORD(RAM.get(++Register.PC));

        this.LD('A', address + Register.Y);

        return 5 + (this.isNextPage(address, address + Register.Y) ? 1 : 0);
    };

    // LAX (nn), Y
    private static 0xB3(): number {
        let address: number = this.WORD(RAM.get(++Register.PC));

        Register.A = Register.X = RAM.read(address + Register.Y);

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);

        return 5 + (this.isNextPage(address, address + Register.Y) ? 1 : 0);
    };

    // LDY nn, X
    public static 0xB4(): number {
        this.LD('Y', Convert.toUint8(RAM.get(++Register.PC) + Register.X));

        return 4;
    };

    // LDA nn, X
    public static 0xB5(): number {
        this.LD('A', Convert.toUint8(RAM.get(++Register.PC) + Register.X));

        return 4;
    };

    // LDX nn, Y
    public static 0xB6(): number {
        this.LD('X', Convert.toUint8(RAM.get(++Register.PC) + Register.Y));

        return 4;
    };

    // LAX nn, Y
    public static 0xB7(): number {
        Register.A = Register.X = RAM.read(Convert.toUint8(RAM.get(++Register.PC) + Register.Y));

        Flag.Z = this.isZero(Register.A);

        Flag.N = this.isNegative(Register.A);

        return 4;
    };

    // CLV
    public static 0xB8(): number {
        Flag.V = 0;

        return 2;
    };

    // LDA nnnn, Y
    public static 0xB9(): number {
        let address: number = this.next2BYTES();

        this.LD('A', (address + Register.Y) & 0xFFFF);

        return 4 + (this.isNextPage(address, (address + Register.Y) & 0xFFFF) ? 1 : 0);
    };

    // TSX
    public static 0xBA(): number {
        Register.X = Register.S;

        Flag.Z = this.isZero(Register.X);

        Flag.N = this.isNegative(Register.X);

        return 2;
    };

    // LDY nnnn, X
    public static 0xBC(): number {
        let address: number = this.next2BYTES();

        this.LD('Y', (address + Register.X) & 0xFFFF);

        return 4 + (this.isNextPage(address, (address + Register.X) & 0xFFFF) ? 1 : 0);
    };

    // LDA nnnn, X
    public static 0xBD(): number {
        let address: number = this.next2BYTES();

        this.LD('A', (address + Register.X) & 0xFFFF);

        return 4 + (this.isNextPage(address, (address + Register.X) & 0xFFFF) ? 1 : 0);
    };

    // LDX nnnn, Y
    public static 0xBE(): number {
        let address: number = this.next2BYTES();

        this.LD('X', (address + Register.Y) & 0xFFFF);

        return 4 + (this.isNextPage(address, (address + Register.Y) & 0xFFFF) ? 1 : 0);
    };

    // CPY #nn
    public static 0xC0(): number {
        this.CMP('Y', RAM.get(++Register.PC));

        return 2;
    };

    // CMP (nn, X)
    public static 0xC1(): number {
        this.CMP('A', RAM.read(this.WORD(Convert.toUint8(RAM.get(++Register.PC) + Register.X))));

        return 6;
    };

    // NOP #nn
    public static 0xC2(): number {
        return this[0x80]();
    };

    // CPY nn
    public static 0xC4(): number {
        this.CMP('Y', RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // CMP nn
    public static 0xC5(): number {
        this.CMP('A', RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // DEC nn
    public static 0xC6(): number {
        this.DEC(RAM.get(++Register.PC));

        return 5;
    };

    // DCP op
    public static 0xC7(): number {
        let address: number = RAM.get(++Register.PC);

        let value: number = RAM.write(address, RAM.get(address) - 1);

        Flag.Z = this.isZero(Register.A - value);

        Flag.N = this.isNegative(Register.A - value);

        Flag.C = (Register.A - value >= 0 ? 1 : 0);

        return 5;
    };

    // INY
    public static 0xC8(): number {
        Register.Y = Convert.toUint8(Register.Y + 1);

        Flag.Z = this.isZero(Register.Y);

        Flag.N = this.isNegative(Register.Y);

        return 2;
    };

    // CMP #nn
    public static 0xC9(): number {
        this.CMP('A', RAM.get(++Register.PC));

        return 2;
    };

    // DEX
    public static 0xCA(): number {
        Register.X = Convert.toUint8(Register.X - 1);

        Flag.Z = this.isZero(Register.X);

        Flag.N = this.isNegative(Register.X);

        return 2;
    };

    // AXS #nn
    public static 0xCB(): number {
        let value: number = RAM.get(++Register.PC);

        let and: number = Register.X & Register.A;

        Register.X = Convert.toUint8(and - value);

        Flag.Z = this.isZero(Register.X);

        Flag.N = this.isNegative(Register.X);

        Flag.C = (and - value >= 0 ? 1 : 0);

        return 2;
    };

    // CPY nnnn
    public static 0xCC(): number {
        this.CMP('Y', RAM.read(this.next2BYTES()));

        return 4;
    };

    // CMP nnnn
    public static 0xCD(): number {
        this.CMP('A', RAM.read(this.next2BYTES()));

        return 4;
    };

    // DEC nnnn
    public static 0xCE(): number {
        this.DEC(this.next2BYTES());

        return 6;
    };

    // BNE
    public static 0xD0(): number {
        return this.CJMP('Z', true);
    };

    // CMP (nn),Y
    public static 0xD1(): number {
        let address: number = this.WORD(RAM.get(++Register.PC));

        this.CMP('A', RAM.read(address + Register.Y));

        return 5 + (this.isNextPage(address, address + Register.Y) ? 1 : 0);;
    };

    // NOP nn, X
    public static 0xD4(): number {
        return this[0x14]();
    };

    // CMP nn, X
    public static 0xD5(): number {
        this.CMP('A', RAM.read(Convert.toUint8(RAM.get(++Register.PC) + Register.X)));

        return 4;
    };

    // DEC nn, X
    public static 0xD6(): number {
        this.DEC(Convert.toUint8(RAM.get(++Register.PC) + Register.X));

        return 6;
    };

    // CLD
    public static 0xD8(): number {
        Flag.D = 0;

        return 2;
    };

    // CMP nnnn, Y
    public static 0xD9(): number {
        let address: number = this.next2BYTES();

        this.CMP('A', RAM.read((address + Register.Y) & 0xFFFF));

        return 4 + (this.isNextPage(address, (address + Register.Y) & 0xFFFF) ? 1 : 0);
    };

    // NOP nnnn, X
    public static 0xDC(): number {
        return this[0x1C]();
    };

    // CMP nnnn, X
    public static 0xDD(): number {
        let address: number = this.next2BYTES();

        this.CMP('A', RAM.read((address + Register.X) & 0xFFFF));

        return 4 + (this.isNextPage(address, (address + Register.X) & 0xFFFF) ? 1 : 0);
    };

    // DEC nnnn, X
    public static 0xDE(): number {
        this.DEC((this.next2BYTES() + Register.X) & 0xFFFF);

        return 7;
    };

    // CPX #nn
    public static 0xE0(): number {
        this.CMP('X', RAM.get(++Register.PC));

        return 2;
    };

    // NOP #nn
    public static 0xE2(): number {
        return this[0x80]();
    };

    // CPX nn
    public static 0xE4(): number {
        this.CMP('X', RAM.read(RAM.get(++Register.PC)));

        return 3;
    };

    // SBC nn
    public static 0xE5(): number {
        this.ADC(Convert.toUint8(~RAM.read(RAM.get(++Register.PC))));

        return 3;
    };

    // INC nn
    public static 0xE6(): number {
        this.INC(RAM.get(++Register.PC));

        return 5;
    };

    // INX
    public static 0xE8(): number {
        Register.X = Convert.toUint8(Register.X + 1);

        Flag.Z = this.isZero(Register.X);

        Flag.N = this.isNegative(Register.X);

        return 2;
    };

    // SBC #nn
    public static 0xE9(): number {
        this.ADC(Convert.toUint8(~RAM.get(++Register.PC)));

        return 2;
    };

    // NOP
    public static 0xEA(): number {
        return 2;
    };

    // CPX nnnn
    public static 0xEC(): number {
        this.CMP('X', RAM.read(this.next2BYTES()));

        return 4;
    };

    // SBC nnnn
    public static 0xED(): number {
        this.ADC(Convert.toUint8(~RAM.read(this.next2BYTES())));

        return 4;
    };

    // INC nnnn
    public static 0xEE(): number {
        this.INC(this.next2BYTES());

        return 6;
    };

    // BEQ/BZS nnn
    public static 0xF0(): number {
        return this.CJMP('Z', false);
    };

    // NOP nn, X
    public static 0xF4(): number {
        return this[0x14]();
    };

    // SBC nn, X
    public static 0xF5(): number {
        this.ADC(Convert.toUint8(~RAM.read(Convert.toUint8(RAM.get(++Register.PC) + Register.X))));

        return 4;
    };

    // INC nn, X
    public static 0xF6(): number {
        this.INC(Convert.toUint8(RAM.get(++Register.PC) + Register.X));

        return 6;
    };

    // SED
    public static 0xF8(): number {
        Flag.D = 1;

        return 2;
    };

    // SBC nnnn, Y
    public static 0xF9(): number {
        let address = this.next2BYTES();
        this.ADC(Convert.toUint8(~RAM.read((address + Register.Y) & 0xFFFF)));

        return 4 + (this.isNextPage(address, (address + Register.Y) & 0xFFFF) ? 1 : 0);
    };

    // NOP nnnn, X
    public static 0xFC(): number {
        return this[0x1C]();
    };

    // SBC nnnn, X
    public static 0xFD(): number {
        let address = this.next2BYTES();
        this.ADC(Convert.toUint8(~RAM.read((address + Register.X) & 0xFFFF)));

        return 4 + (this.isNextPage(address, (address + Register.X) & 0xFFFF) ? 1 : 0);
    };

    // INC nnnn, X
    public static 0xFE(): number {
        this.INC((this.next2BYTES() + Register.X) & 0xFFFF);

        return 7;
    };
};
