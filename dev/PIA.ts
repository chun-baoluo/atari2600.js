import { RAM } from './RAM';
import { Convert } from './Common';

// TODO: Timer restart after reading from INTIM?

export class PIA {
    public static prevTimer: number = null;

    public static timer: number = null;

    public static cycle: number = 0;

    public static timerIntervals: any = {
        0x294: 1,
        0x295: 8,
        0x296: 64,
        0x297: 1024
    };

    private static keydown(e: any) {
        let key = e.keyCode;
        let swcha: any = Convert.toBin(RAM.get(0x280)).split('');
        let swchb: any = Convert.toBin(RAM.get(0x282)).split('');
        let inpt4: any = Convert.toBin(RAM.get(0x3C)).split('');
        let inpt5: any = Convert.toBin(RAM.get(0x3D)).split('');

        if(key == 38) { // Player 0
            swcha[3] = '0';
        } else if(key == 39) {
            swcha[0] = '0';
        }  else if(key == 40) {
            swcha[2] = '0';
        } else if(key == 37) {
            swcha[1] = '0';
        } else if(key == 17) {
            inpt4[0] = '0';
        } else if(key == 87) { // Player 1
            swcha[7] = '0';
        } else if(key == 65) {
            swcha[5] = '0';
        } else if(key == 83) {
            swcha[6] = '0';
        } else if(key == 68) {
            swcha[4] = '0';
        } else if(key == 16) {
            inpt5[0] = '0';
        } else if(key == 191) { // Switches
            swchb[7] = (swchb[7] == '0' ? '1' : '0');
        } else if(key == 190) {
            swchb[6] = (swchb[6] == '0' ? '1' : '0');
        } else if(key == 78) {
            swchb[1] = (swchb[1] == '0' ? '1' : '0');
        } else if(key == 77) {
            swchb[0] = (swchb[0] == '0' ? '1' : '0');
        };

        RAM.set(0x280, parseInt(swcha.join(''), 2));
        RAM.set(0x282, parseInt(swchb.join(''), 2));
        RAM.set(0x3C, parseInt(inpt4.join(''), 2));
        RAM.set(0x3D, parseInt(inpt5.join(''), 2));
    };

    private static keyup(e: any) {
        RAM.set(0x280, 0xFF);
        RAM.set(0x3C, 0xFF);
        RAM.set(0x3D, 0xFF);
    };

    public static initInputs() {
        document.addEventListener("keydown", this.keydown, false);
        document.addEventListener("keyup", this.keyup, false);
    };

    public static setTimer(address: number) {
        this.timer = address;
        this.cycle = this.timerIntervals[address];
        RAM.set(0x284, RAM.get(address));
    };

    public static tick() {
        for(let i: number = 0x294; i <= 0x297; i++) {
            if(this.timer != i) {
                continue;
            };

            if(this.timer && this.cycle == 0) {
                let before: number = RAM.get(0x284);
                let after: number = RAM.set(0x284, RAM.get(0x284) - 1);;

                this.cycle = this.timerIntervals[i];

                if(before == 0 && after == 0xFF) {
                    this.prevTimer = i;
                    this.timer = null;
                    this.cycle = 0;
                    RAM.set(0x285, 192);
                };
            };
        };

        this.cycle--;
    };
};
