import { CPU } from './CPU';
import { Flag, Register, Rom } from './RAM';

export class Opcode {

    public static 0x78() {
        Flag.I = 1;
        CPU.setCycle(2);
    };

    public static 0xa2() {
        Register.X = Rom.data[++Register.PC];

        if(Register.X == 0) {
            Flag.Z = 1;
        } else {
            Flag.Z = 0;
        }
        
        if(Register.X < 0) {
            Flag.N = 1;
        } else {
            Flag.N = 0;
        }

        CPU.setCycle(2);
    };
    
    public static 0xd8() {
        Flag.D = 0;
        CPU.setCycle(2);
    };
};
