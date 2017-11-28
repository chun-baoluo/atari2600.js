import { RAM } from './RAM';

// TODO: Timer restart after reading from INTIM?

export class PIA {
    
    private static timer: number = null;
    
    private static cycle: number = 0;
    
    private static timers: any = {
        0x294: {
            active: false,
            interval: 1,
            value: 0
        },
        0x295: {
            active: false,
            interval: 8,
            value: 0
        },
        0x296: {
            active: false,
            interval: 64,
            value: 0
        },
        0x297: {
            active: false,
            interval: 1024,
            value: 0
        }
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
            
            console.log('PIAtick', RAM.get(0x296).toString(16),  RAM.get(0x284).toString(16), this.cycle, this.timer);
            
            if(this.timer && this.cycle == 0) {
                if(RAM.get(i) == 0 && RAM.set(i, RAM.get(i) - 1) == 0xFF) {
                    this.timer = null;
                    this.cycle = 0;
                    RAM.set(0x285, 192);
                };
                
                this.setTimer(this.timer);
                RAM.set(0x284, RAM.get(i));
            };
        };
        
        this.cycle--;
        
    };
};