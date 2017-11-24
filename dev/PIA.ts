import { RAM } from './RAM';

export class PIA {
    
    private static timer: number = null;
    
    private static timerValues: any = {
        0x294: -1,
        0x295: -1,
        0x296: -1,
        0x297: -1
    };
    
    public static tick() {
        RAM.set(0x296, RAM.get(0x296) - 1);
        RAM.set(0x284, RAM.get(0x296));
    };
};