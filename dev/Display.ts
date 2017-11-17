import { Register } from './RAM';
import { CPU } from './CPU';

export default class Display {

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

		this.data = this.ctx.getImageData(0, 0, this.w, this.h);

		this.ctx.fillStyle = 'black';

		this.ctx.fillRect(0, 0, this.w, this.h);
    };

    nextFrame() {
        return new Promise((resolve: Function, reject: Function) => {
            console.log('NEXT FRAME');
            
            CPU.pulse();
            
            resolve(true);
        });
    };
};
