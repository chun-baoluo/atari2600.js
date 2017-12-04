import { Register, RAM } from './RAM';
import { CPU } from './CPU';
import { Convert } from './Common';
import { TIA } from './TIA';

export default class Display {

    canvas: any;

    ctx: any;

	data: any;

    constructor(canvas: any) {
        this.canvas = canvas;

        this.ctx = canvas.getContext('2d');

		this.ctx.fillStyle = 'black';

		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    };

    nextFrame() {    
        return new Promise((resolve: Function, reject: Function) => {
            let cpuCounter: number = 0;

            //if(RAM.get(0x00) != 0) // 00000010
            for(let scanline = 1; scanline <= 3; scanline++) {
                for(let clock = 0; clock < 228; clock += 3) {
                    CPU.pulse();
                };

                CPU.unlock();
            };

            //if(RAM.get(0x01) != 0)
            for(let scanline = 1; scanline <= 37; scanline++) {
                for(let clock = 0; clock < 228; clock += 3) {
                    CPU.pulse();
                };

                CPU.unlock();
            };

            for(let scanline = 1; scanline <= 192; scanline++) {
                for(let clock = 0; clock < 68; clock += 3) {
                    CPU.pulse();
                };

                let counter: number = 2;
                for(let clock = 68; clock < 228; clock += 1) {

                    this.data = TIA.draw(this.data, this.canvas.width, this.canvas.height, scanline, clock - 68);

                    if(counter > 2) {
                        counter = 0;
                        CPU.pulse();
                    };
                    counter++;
                };

                CPU.unlock();
            };


            this.ctx.putImageData(this.data, 0, 0);

            for(let scanline = 1; scanline <= 30; scanline++) {
                for(let clock = 0; clock < 228; clock += 3) {
                    CPU.pulse();
                };

                CPU.unlock();
            };

            resolve(true);
        });
    };
};
