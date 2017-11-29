import { Flag, Register, Rom, RAM } from './RAM';
import { Convert } from './Common';

// TODO: Negative flag - proper setting
// TODO: Memory mirroring

export class Opcode {
    
    private static isNextPage(pc1: number, pc2: number) {
        return ('000' + pc1.toString(16)).slice(-4).charAt(0) != ('000' + pc2.toString(16)).slice(-4).charAt(0);    
    };
    
    // BPL nnn
    public static 0x10() {
        //Flag.N = 1;
                
        if(Flag.N == 1) {
			Register.PC++;
			return 2;
		};
        
		let num: number = Convert.toInt8(Rom.data[++Register.PC]);
        
        return 3 + (this.isNextPage(Register.PC, Register.PC += num) ? 1 : 0);        
    };
    
    // JMP nnnn
    public static 0x4C() {
        let low: number = Rom.data[++Register.PC];
        let high: number = Rom.data[++Register.PC];
        let address: number = ((high & 0xFF) << 8) | (low & 0xFF);
    
        Register.PC = address & 0xFF;
        Register.PC--;
    
        return 3;
    };

    // SEI
    public static 0x78() {
        Flag.I = 1;
        
        return 2;
    };
    
    // STA nn
    public static 0x85() {
        RAM.write(Rom.data[++Register.PC], Register.A);
        return 3;
    };
    
    // STX nn
    public static 0x86() {
        RAM.write(Rom.data[++Register.PC], Register.X);
        return 3;
    };
    
    // DEY
    public static 0x88() {
        Register.Y = Convert.toUint8(Register.Y - 1);

        if(Register.Y == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(Convert.toBin(Register.Y).charAt(0) == '1') {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        };
        
        return 2;
    };
    
    // STA nnnn 
    public static 0x8D() {
        let low: number = Rom.data[++Register.PC];
        let high: number = Rom.data[++Register.PC];
        let address: number = ((high & 0xff) << 8) | (low & 0xff);
        
        RAM.write(address, Register.A);
        
        return 4;
    };
    
    // STA nn, X
    public static 0x95() {    
        RAM.write(Rom.data[++Register.PC] + Register.X, Register.A);
        return 4;
    };
    
    // TXS
    public static 0x9A() {
        Register.S = Register.X;
        
        return 2;
    };

    // LDY #nn
    public static 0xA0() {
        Register.Y = Rom.data[++Register.PC];

        if(Register.Y == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(Convert.toBin(Register.Y).charAt(0) == '1') {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        };

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
        
        if(Convert.toBin(Register.X).charAt(0) == '1') {
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
        
        if(Convert.toBin(Register.A).charAt(0) == '1') {
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
        let address: number = ((high & 0xFF) << 8) | (low & 0xFF);
        
        Register.A = RAM.read(address);
        
        if(Register.A == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(Convert.toBin(Register.A).charAt(0) == '1') {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        };
        
        return 4;
    };
    
    // DEX
    public static 0xCA() {
        Register.X = Convert.toUint8(Register.X - 1);

        if(Register.X == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(Convert.toBin(Register.X).charAt(0) == '1') {
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
        
		let num: number = Convert.toInt8(Rom.data[++Register.PC]);
        
        return 3 + (this.isNextPage(Register.PC, Register.PC += num)? 1 : 0);
    };
    
    // CLD
    public static 0xD8() {
        Flag.D = 0;
        
        return 2;
    };
    
    // INX
    public static 0xE8() {
        Register.X = Convert.toUint8(Register.X + 1);

        if(Register.X == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(Convert.toBin(Register.X).charAt(0) == '1') {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        };
        
        return 2;
    };
};
