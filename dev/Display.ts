import { Register, RAM } from './RAM';
import { CPU } from './CPU';
import { Convert } from './Common';
import { TIA } from './TIA';

export default class Display {
    
    canvas: any;

    ctx: any;

	w: number;

	h: number;

	data: any;

	scanline: number = 0;

	clock: number = 0;

    constructor(canvas: any) {
        
        this.ctx = canvas.getContext('2d');

		this.w = canvas.width;

		this.h = canvas.height;

		this.ctx.fillStyle = 'black';

		this.ctx.fillRect(0, 0, this.w, this.h);
        
        this.data = this.ctx.getImageData(0, 0, this.w, this.h);
    };

    nextFrame() {
        return new Promise((resolve: Function, reject: Function) => {
            let cpuCounter: number = 0;
            
            // if(RAM.get(0x00) == 0) // 00000010
            for(this.scanline = 1; this.scanline <= 3; this.scanline++) {
                for(this.clock = 0; this.clock < 228; this.clock += 3) {
                    CPU.pulse();
                };

                CPU.unlock();
            };
            
            for(this.scanline = 1; this.scanline <= 37; this.scanline++) {
                for(this.clock = 0; this.clock < 228; this.clock += 3) {
                    CPU.pulse();
                };
                
                CPU.unlock();
            };
            
            for(this.scanline = 1; this.scanline <= 192; this.scanline++) {
                for(this.clock = 0; this.clock < 68; this.clock += 3) {
                    CPU.pulse();
                };
                
                let counter: number = 2;
                for(this.clock = 68; this.clock < 228; this.clock += 1) {
                    
                    this.data = TIA.draw(this.data, this.w, this.h, this.scanline, this.clock - 68);
                    
                    if(counter > 2) {
                        counter = 0;
                        CPU.pulse();
                    };
                    counter++;
                };
                
                CPU.unlock();
            };
            
            
            this.ctx.putImageData(this.data, 0, 0);
            
            for(this.scanline = 1; this.scanline <= 30; this.scanline++) {
                for(this.clock = 0; this.clock < 228; this.clock += 3) {
                    CPU.pulse();
                };
                
                CPU.unlock();
            };
            
            resolve(true);
        });
    };
};
