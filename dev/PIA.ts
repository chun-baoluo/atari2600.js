import { RAM } from './RAM';
import { Convert } from './Common';

// TODO: Timer restart after reading from INTIM?
// TODO: Missing cycle?

export class PIA {

    private static timer: number = null;

    private static cycle: number = 0;

    private static timers: any = {
        0x294: {
            active: false,
            interval: 1
        },
        0x295: {
            active: false,
            interval: 8
        },
        0x296: {
            active: false,
            interval: 64
        },
        0x297: {
            active: false,
            interval: 1024
        }
    };

    private static keydown(e: any) {
        let key = e.keyCode;
        let swcha: any = Convert.toBin(RAM.get(0x280)).split('');
        let inpt4: any = Convert.toBin(RAM.get(0x3C)).split('');
        let inpt5: any = Convert.toBin(RAM.get(0x3D)).split('');

        if(key == 38) {
            swcha[3] = '0';
        } else if(key == 39) {
            swcha[0] = '0';
        }  else if(key == 40) {
            swcha[2] = '0';
        } else if(key == 37) {
            swcha[1] = '0';
        } else if(key == 17) {
            inpt4[0] = '0';
        } else if(key == 87) {
            swcha[7] = '0';
        } else if(key == 65) {
            swcha[5] = '0';
        } else if(key == 83) {
            swcha[6] = '0';
        } else if(key == 68) {
            swcha[4] = '0';
        } else if(key == 17) {
            inpt5[0] = '0';
        };

        RAM.set(0x280, parseInt(swcha.join(''), 2));
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
        this.cycle = this.timers[address].interval;
        RAM.set(0x284, RAM.get(address));
    };

    public static tick() {
        for(let i: number = 0x294; i <= 0x297; i++) {
            if(this.timer != i) {
                RAM.set(i, RAM.get(i) - 1);
                continue;
            };

            if(this.timer && this.cycle == 0) {
                let before: number = RAM.get(i);
                let after: number = RAM.set(i, RAM.get(i) - 1);

                this.setTimer(i);

                if(before == 0 && after == 0xFF) {
                    this.timer = null;
                    this.cycle = 0;
                    RAM.set(0x285, 192);
                };
            };
        };

        this.cycle--;
    };
};
