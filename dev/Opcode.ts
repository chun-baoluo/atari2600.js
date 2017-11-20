import { CPU } from './CPU';
import { Flag, Register, Rom } from './RAM';

export class Opcode {

    // SEI
    public static 0x78() {
        Flag.I = 1;
        
        return 2;
    };
    
    // TXS
    public static 0x9A() {
        Register.S = Register.X;
        
        return 2;
    };

    // LDX #nn
    public static 0xA2() {
        Register.X = Rom.data[++Register.PC];
        
        let signed: number = new Int8Array([Register.X])[0];

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
        
        let signed: number = new Int8Array([Register.A])[0];

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
    
    // CLD
    public static 0xD8() {
        Flag.D = 0;
        
        return 2;
    };
};
