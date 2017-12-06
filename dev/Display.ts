import { Register, RAM } from './RAM';
import { CPU } from './CPU';
import { Convert } from './Common';
import { TIA } from './TIA';

export default class Display {

    canvas: any;

    ctx: any;

	imageData: any;

    constructor(canvas: any) {
        this.canvas = canvas;
        
        this.canvas.width = 160;
        
        this.canvas.height = 192;

        this.ctx = canvas.getContext('2d');

		this.ctx.fillStyle = '#000';

		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    };

    nextFrame() {    
        return new Promise((resolve: Function, reject: Function) => {

            // if(RAM.get(0x00) != 0)
            for(let scanline = 1; scanline <= 3; scanline++) {
                console.log('SCANLINE', scanline);
                
                for(let clock = 0; clock < 228; clock += 3) {
                    CPU.pulse();
                };

                CPU.unlock();
            };

            // if(RAM.get(0x01) != 0)
            for(let scanline = 1; scanline <= 37; scanline++) {
                console.log('SCANLINE', scanline + 3);
                
                for(let clock = 0; clock < 228; clock += 3) {
                    CPU.pulse();
                };

                CPU.unlock();
            };

            for(let scanline = 1; scanline <= 192; scanline++) {
                console.log('SCANLINE', scanline + 40);
                
                for(let clock = 0; clock < 68; clock += 3) {
                    CPU.pulse();
                };

                let counter: number = 2;
                for(let clock = 68; clock < 228; clock += 1) {

                    this.imageData = TIA.draw(this.imageData, this.canvas.width, this.canvas.height, scanline, clock - 68);

                    if(counter > 2) {
                        counter = 0;
                        CPU.pulse();
                    };
                    counter++;
                };

                CPU.unlock();
            };

            this.ctx.putImageData(this.imageData, 0, 0);

            for(let scanline = 1; scanline <= 30; scanline++) {
                console.log('SCANLINE', scanline + 232);
                
                for(let clock = 0; clock < 228; clock += 3) {
                    CPU.pulse();
                };

                CPU.unlock();
            };

            resolve(true);
        });
    };
};
