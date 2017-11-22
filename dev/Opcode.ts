import { Flag, Register, Rom, RAM } from './RAM';
import { CPU } from './CPU';

// TODO: Negative flag - proper setting
// TODO: Memory mirroring

export class Opcode {
    
    private static getInt8(val: number) {
        return new Int8Array([val])[0];
    };
    
    private static getUint8(val: number) {
        return new Uint8Array([val])[0];
    };
    
    private static isNextPage(pc1: number, pc2: number) {
        return ('000' + pc1.toString(16)).slice(-4).charAt(0) != ('000' + pc2.toString(16)).slice(-4).charAt(0);    
    };
    
    private static toBin(val: number) {
        return ('00000000' + (val >>> 0).toString(2)).slice(-8);
    };
    
    // BPL nnn
    public static 0x10() {        
        if(Flag.N == 1) {
			Register.PC++;
			return 2;
		};
        
		let num: number = this.getInt8(Rom.data[++Register.PC]);
        
        return 3 + (this.isNextPage(Register.PC, Register.PC += num)? 1 : 0);        
    };

    // SEI
    public static 0x78() {
        Flag.I = 1;
        
        return 2;
    };
    
    // STA nn
    public static 0x85() {
        RAM.set(Rom.data[++Register.PC], Register.A);
        return 3;
    };
    
    // STA nnnn 
    public static 0x8D() {
        let low: number = Rom.data[++Register.PC];
        let high: number = Rom.data[++Register.PC];
        let address: number = ((high & 0xff) << 8) | (low & 0xff);
        
        RAM.set(address, Register.A);
        
        return 4;
    };
    
    // STA nn, X
    public static 0x95() {    
        RAM.set(Rom.data[++Register.PC] + Register.X, Register.A);
        return 4;
    };
    
    // TXS
    public static 0x9A() {
        Register.S = Register.X;
        
        return 2;
    };

    // LDX #nn
    public static 0xA2() {
        Register.X = Rom.data[++Register.PC];

        if(Register.X == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(this.toBin(Register.X).charAt(0) == '1') {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        };

        return 2;
    };
    
    // LDA #nn
    public static 0xA9() {
        Register.A = Rom.data[++Register.PC];

        if(Register.A == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(this.toBin(Register.A).charAt(0) == '1') {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        };

        return 2;        
    };
    
    // LDA nnnn
    public static 0xAD() {
        let low: number = Rom.data[++Register.PC];
        let high: number = Rom.data[++Register.PC];
        let address: number = ((high & 0xff) << 8) | (low & 0xff);
        
        console.log(address, RAM.get(address));
        
        Register.A = RAM.get(address);
        
        if(Register.A == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(this.toBin(Register.A).charAt(0) == '1') {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        };
        
        return 4;
    };
    
    // DEX
    public static 0xCA() {
        Register.X--;
        
        let signed: number = this.getInt8(Register.X);
        
        if(Register.X < 0) {
            Register.X = 255;
        };

        if(Register.X == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(this.toBin(Register.X).charAt(0) == '1') {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        };
        
        return 2;
    };
    
    // BNE
    public static 0xD0() {
        if(Flag.Z == 1) {
			Register.PC++;
			return 2;
		};
        
		let num: number = this.getInt8(Rom.data[++Register.PC]);
        
        return 3 + (this.isNextPage(Register.PC, Register.PC += num)? 1 : 0);
    };
    
    // CLD
    public static 0xD8() {
        Flag.D = 0;
        
        return 2;
    };
};
