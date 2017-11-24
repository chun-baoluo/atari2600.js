import { RAM } from './RAM';

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
    
    public static tick() {
        // console.log('PIAtick', RAM.get(0x296).toString(16),  RAM.get(0x284).toString(16), this.timer);

        for(let i: number = 0x294; i <= 0x297; i++) {
            
            console.log(i, this.timers[i], RAM.get(i), RAM.get(i) != this.timers[i].value);
                    
            if(!this.timers[i].active && RAM.get(i) != this.timers[i].value) {
                this.timer = i;
                this.timers[i].active = true;
                RAM.set(i, RAM.get(i) - 1);
            };
            
            if(!this.timer) {
                RAM.set(i, RAM.get(i) - 1);
            };
        };
        
        if(this.timer) {
            let value: number = RAM.get(this.timer) - this.timers[this.timer].interval;
            
            if(value <= 0) {
                this.timers[this.timer].value = 0;
                this.timers[this.timer].active = false;
                this.timer = null;
                RAM.set(0x284, 0);
            } else {
                this.timers[this.timer].value = value;
                RAM.set(this.timer, value);
                RAM.set(0x284, value);                
            };
        };

    };
};