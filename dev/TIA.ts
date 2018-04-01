import { Convert } from './Common';
import { RAM } from './RAM';
import { CPU } from './CPU';

interface GameObject {
    position?: number;
};

abstract class GameObject {
    protected _canvas: any = null;
    protected _ctx: any = null;
    protected _imageData: any = null;

    public get canvas() {
        this._ctx.putImageData(this._imageData, 0, 0);
        this._imageData = this._ctx.createImageData(this._canvas.width, this._canvas.height);
        return this._canvas;
    };

    constructor() {
        this._canvas = document.createElement('canvas');

        this._canvas.width = 160;

        this._canvas.height = 222;

        this._ctx = this._canvas.getContext('2d');

        this._imageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    };

    public abstract pixel(scanline: number, clock: number): any;

    public setImageData(scanline: number, clock: number, color: any) {
        let pixelindex = (scanline * this._canvas.width + clock) << 2;
        this._imageData.data[pixelindex] = color[0];
        this._imageData.data[pixelindex + 1] = color[1];
        this._imageData.data[pixelindex + 2] = color[2];
        this._imageData.data[pixelindex + 3] = 255;
        return this._imageData;
    };
};

class Background extends GameObject {
    public colubk: Array<number> = [0, 0, 0];

    pixel(scanline: number, clock: number) {
        return this.setImageData(scanline, clock, this.colubk)
    };
};

class Playfield extends GameObject {
    public reflect: boolean = false;
    public ctrlpf: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];
    public colupf: Array<number> = [0, 0, 0];
    public scoreMode: boolean = false;
    public colup0: Array<number> = [0, 0, 0];
    public colup1: Array<number> = [0, 0, 0];
    public pf0: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];
    public pf1: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];
    public pf2: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];

    pixel(scanline: number, clock: number) {
        let c: Array<number> = null;

        if(clock <= 16) {
            for(let i = 4; i <= 16; i += 4) {
                if(clock <= i) {
                    if(this.pf0[4 + (i / 4) - 1] == '1') {
                        c = (this.scoreMode ? this.colup0 : this.colupf);
                    };
                    break;
                };
            };
        } else if(clock > 16 && clock <= 48) {
            for(let i = 20; i <= 48; i += 4) {
                if(clock <= i) {
                    if(this.pf1[7 - (i / 4 - 5)] == '1') {
                        c = (this.scoreMode ? this.colup0 : this.colupf);
                    };
                    break;
                };
            };
        } else if(clock > 48 && clock <= 80) {
            for(let i = 52; i <= 80; i += 4) {
                if(clock <= i) {
                    if(this.pf2[0 + (i / 4 - 13)] == '1') {
                        c = (this.scoreMode ? this.colup0 : this.colupf);
                    };
                    break;
                };
            };
        } else if(clock > 80 && clock <= 96 && !this.reflect) { // REF = 0
            for(let i = 84; i <= 96; i += 4) {
                if(clock <= i) {
                    if(this.pf0[4 + (i / 4) - 21] == '1') {
                        c = (this.scoreMode ? this.colup1 : this.colupf);
                    };
                    break;
                };
            };
        } else if(clock > 96 && clock <= 128 && !this.reflect) {
            for(let i = 100; i <= 128; i += 4) {
                if(clock <= i) {
                    if(this.pf1[7 - (i / 4 - 25)] == '1') {
                        c = (this.scoreMode ? this.colup1 : this.colupf);
                    };
                    break;
                };
            };
        } else if(clock > 128 && clock <= 160 && !this.reflect) {
            for(let i = 132; i <= 160; i += 4) {
                if(clock <= i) {
                    if(this.pf2[0 + (i / 4 - 33)] == '1') {
                        c = (this.scoreMode ? this.colup1 : this.colupf);
                    };
                    break;
                };
            };
        } else if(clock > 80 && clock <= 112 && this.reflect) { // REF = 1
            for(let i = 84; i <= 112; i += 4) {
                if(clock <= i) {
                    if(this.pf2[7 - (i / 4 - 21)] == '1') {
                        c = (this.scoreMode ? this.colup1 : this.colupf);
                    };
                    break;
                };
            };
        } else if(clock > 112 && clock <= 144 && this.reflect) {
            for(let i = 116; i <= 144; i += 4) {
                if(clock <= i) {
                    if(this.pf1[0 + (i / 4 - 29)] == '1') {
                        c = (this.scoreMode ? this.colup1 : this.colupf);
                    };
                    break;
                };
            };
        } else if(clock > 144 && clock <= 160 && this.reflect) {
            for(let i = 148; i <= 160; i += 4) {
                if(clock <= i) {
                    if(this.pf0[7 - (i / 4 - 37)] == '1') {
                        c = (this.scoreMode ? this.colup1 : this.colupf);
                    };
                    break;
                };
            };
        };

        return (c ? this.setImageData(scanline, clock, c) : null);
    };
};

class Ball extends GameObject {
    public colupf: Array<number> = [0, 0, 0];
    public prevEnabl: boolean = false;
    public enabl: boolean = false;
    public hmbl: number = 0;
    public position: number = null;
    public size: number = 1;
    public vdelbl: boolean = false;

    pixel(scanline: number, clock: number) {
        if((this.vdelbl ? this.prevEnabl : this.enabl) && clock >= this.position && clock < this.position + this.size) {
            return this.setImageData(scanline, clock, this.colupf);
        };
    };
};

class Missile extends GameObject {
    public colup: Array<number> = [0, 0, 0];
    public missile: number = 0;
    public hmm: number = 0;
    public enam: boolean = false;
    public size: number = 0;
    public position: number = null;

    constructor(missile: number) {
        super();
        this.missile = missile;
    };

    pixel(scanline: number, clock: number) {
        if(this.enam && clock >= this.position && clock < this.position + this.size) {
            return this.setImageData(scanline, clock, this.colup);
        };
    };
};

class Player extends GameObject {
    public colup: Array<number> = [0, 0, 0];
    public grp: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];
    public prevGrp: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];
    public hmp: number = 0;
    public nusiz: number = 0;
    private player: number = 0;
    public position: number = null;
    public refp: boolean = false;
    public vdelp: boolean = false;
    public pixelRange: Array<number> = [0];
    public size: number = 1;

    constructor(player: number = 0) {
        super();
        this.player = player;
        this.position = 80 * player;
    };

    pixel(scanline: number, clock: number) {
        let grp: Array<string> = (this.vdelp ? this.prevGrp : (this.grp));
        let index: any = (((clock - this.position) / this.size) >> 0) % 8;
        index = (this.refp ? 7 - index : index);

        for(let p of this.pixelRange) {
            let startingPosition: number = this.position + p;

            if(clock >= startingPosition && clock < (startingPosition + 8) && grp[index] == '1') {
                return this.setImageData(scanline, clock, this.colup);
            };
        };
    };
};

export class TIA {

    private static _canvas: any = null;

    public static ball: Ball = new Ball();

    public static bk: Background = new Background();

    public static clock: number = 0;

    public static colorPalette: Map<number, number[]> = null;

    public static ctx: any = null;

	public static imageData: any = null;

    public static expectNewFrame: boolean = false;

    public static m0: Missile = new Missile(0);

    public static m1: Missile = new Missile(1);

    public static nusiz0: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];

    public static nusiz1: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];

    public static p0: Player = new Player(0);

    public static p1: Player = new Player(1);

    public static pf: Playfield = new Playfield();

    public static pfp: boolean = false;

    public static scanline: number = 0;

    public static set canvas(canvas: any) {
        this._canvas = canvas;

        this._canvas.width = 160;

        this._canvas.height = 222;

        this.ctx = canvas.getContext('2d');

        this.ctx.fillStyle = '#000';

        this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this.imageData = this.ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    };

    private static draw() {
        if(this.pfp) {
            this.ctx.drawImage(this.bk.canvas, 0, 0);
            this.ctx.drawImage(this.p1.canvas, 0, 0);
            this.ctx.drawImage(this.m1.canvas, 0, 0);
            this.ctx.drawImage(this.p0.canvas, 0, 0);
            this.ctx.drawImage(this.m0.canvas, 0, 0);
            this.ctx.drawImage(this.pf.canvas, 0, 0);
            this.ctx.drawImage(this.ball.canvas, 0, 0);

            return;
        };

        this.ctx.drawImage(this.bk.canvas, 0, 0);
        this.ctx.drawImage(this.pf.canvas, 0, 0);
        this.ctx.drawImage(this.ball.canvas, 0, 0);
        this.ctx.drawImage(this.p0.canvas, 0, 0);
        this.ctx.drawImage(this.m0.canvas, 0, 0);
        this.ctx.drawImage(this.p1.canvas, 0, 0);
        this.ctx.drawImage(this.m1.canvas, 0, 0);
    };

    public static nextFrame() {
        return new Promise((resolve: Function) => {
            let scanline: number = 0;

            while(scanline < 262) {
                for(this.clock = 0; this.clock < 68; this.clock += 3) {
                    CPU.pulse();
                };

                let counter: number = 2;
                for(this.clock = 68; this.clock < 228; this.clock += 1) {


                    if(counter > 2) {
                        counter = 0;
                        CPU.pulse();
                    };

                    counter++;

                    if(this.scanline > 30 && this.scanline < 252) {
                        this.pixel(this.scanline - 30, this.clock - 68);
                    };
                };

                CPU.unlock();

                scanline++;
                this.scanline++;
            };

            this.draw();

            resolve(true);
        });
    };

    private static pixel(scanline: number, clock: number) {
        this.bk.pixel(scanline, clock);
        this.pf.pixel(scanline, clock);
        this.p0.pixel(scanline, clock);
        this.p1.pixel(scanline, clock);
        this.m0.pixel(scanline, clock);
        this.m1.pixel(scanline, clock);
        this.ball.pixel(scanline, clock);
    };

    public static getPixelRange(value: number) {
        let range: Array<number> = [0];

        switch(value) {
            case 1:
                range = [0, 16];
                break;
            case 2:
                range = [0, 32];
                break;
            case 3:
                range = [0, 16, 32];
                break;
            case 4:
                range = [0, 72];
                break;
            case 5:
                range = [0, 8];
                break;
            case 6:
                range = [0, 32, 72];
                break;
            case 7:
                range = [0, 8, 16, 24];
                break;
        };

        return range;
    };
};
