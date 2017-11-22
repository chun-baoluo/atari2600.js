import { Flag, Register, Rom } from './RAM';
import { CPU } from './CPU';

// TODO: Check what will happen if decremented unsigned value goes below zero (0xCA)
// TODO: Conditional branches - additional cycle when jump
// TODO: Possible 0x95 problem with signed/unsigned values, needs double checking

export class Opcode {
    
    private static getInt8(val: number) {
        return new Int8Array([val])[0];
    };
    
    private static getUint8(val: number) {
        return new Uint8Array([val])[0];
    };

    // SEI
    public static 0x78() {
        Flag.I = 1;
        
        return 2;
    };
    
    // STA nn, X
    public static 0x95() {    
        
        console.log(Rom.data);
        
        // Rom.data[Rom.data[++Register.PC] + Register.X] = Register.A;
        
        Register.PC++;
        
        //console.log('ADDRESS', this.getUint8(Rom.data[Register.PC]), this.getUint8(Register.X), this.getUint8(Rom.data[Register.PC] + Register.X));
        
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
        
        let signed: number = this.getInt8(Register.X);

        if(signed == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(signed < 0) {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        };

        return 2;
    };
    
    // LDA #nn
    public static 0xA9() {
        Register.A = Rom.data[++Register.PC];
        
        let signed: number = this.getInt8(Register.A);

        if(signed == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(signed < 0) {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        };

        return 2;        
    };
    
    // DEX
    public static 0xCA() {
        Register.X--;
        
        let signed: number = this.getInt8(Register.X);

        if(Register.X == 0) {
            // Register.X = 255;
            
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        };
        
        if(signed < 0) {
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
        
        Register.PC += num;
        
        return 3;
			//cpu.setCycle(3 + (isNextPage(register.PC, register.PC += num)? 1 : 0));
		
    };
    
    // CLD
    public static 0xD8() {
        Flag.D = 0;
        
        return 2;
    };
};
