import { Convert } from './Common';
import { RAM } from './RAM';
import { CPU } from './CPU';

interface GameObject {
    position?: number;
};

abstract class GameObject {
    public imageData: ImageData = new ImageData(160, 220);

    public abstract pixel(imageData: ImageData, scanline: number, clock: number): ImageData;

    public setImageData(imageData: ImageData, scanline: number, clock: number, color: Array<number>): ImageData {
        let pixelindex: number = (scanline * 160 + clock) << 2;
        this.imageData.data[pixelindex] = imageData.data[pixelindex] = color[0];
        this.imageData.data[pixelindex + 1] = imageData.data[pixelindex + 1] = color[1];
        this.imageData.data[pixelindex + 2] = imageData.data[pixelindex + 2] = color[2];
        this.imageData.data[pixelindex + 3] = imageData.data[pixelindex + 3] = 255;

        return this.imageData;
    };
};

class Background extends GameObject {
    public colubk: Array<number> = [0, 0, 0];

    public pixel(imageData: ImageData, scanline: number, clock: number): ImageData {
        return this.setImageData(imageData, scanline, clock, this.colubk)
    };
};

class Playfield extends GameObject {
    public reflect: boolean = false;
    public colupf: Array<number> = [0, 0, 0];
    public scoreMode: boolean = false;
    public colup0: Array<number> = [0, 0, 0];
    public colup1: Array<number> = [0, 0, 0];
    public pf0: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];
    public pf1: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];
    public pf2: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];

    public pixel(imageData: ImageData, scanline: number, clock: number): ImageData {
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

        return (c ? this.setImageData(imageData, scanline, clock, c) : null);
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

    public pixel(imageData: ImageData, scanline: number, clock: number): ImageData {
        if((this.vdelbl ? this.prevEnabl : this.enabl) && clock >= this.position && clock < this.position + this.size) {
            return this.setImageData(imageData, scanline, clock, this.colupf);
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

    public pixel(imageData: ImageData, scanline: number, clock: number): ImageData {
        if(this.enam && clock >= this.position && clock < this.position + this.size) {
            return this.setImageData(imageData, scanline, clock, this.colup);
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

    public pixel(imageData: ImageData, scanline: number, clock: number): ImageData {
        let grp: Array<string> = (this.vdelp ? this.prevGrp : (this.grp));
        let index: number = (((clock - this.position) / this.size) >> 0) % 8;
        index = (this.refp ? 7 - index : index);

        for(let p of this.pixelRange) {
            let startingPosition: number = this.position + p;

            if(clock >= startingPosition && clock < (startingPosition + 8) && grp[index] == '1') {
                return this.setImageData(imageData, scanline, clock, this.colup);
            };
        };
    };
};

export class TIA {

    private static _canvas: HTMLCanvasElement = null;

    public static ball: Ball = new Ball();

    public static bk: Background = new Background();

    public static clock: number = 0;

    public static colorPalette: Map<number, number[]> = null;

    public static ctx: CanvasRenderingContext2D = null;

	public static imageData: ImageData = null;

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

    public static set canvas(canvas: HTMLCanvasElement) {
        this._canvas = canvas;

        this._canvas.width = 160;

        this._canvas.height = 222;

        this.ctx = canvas.getContext('2d');

        this.ctx.fillStyle = '#000';

        this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this.imageData = this.ctx.createImageData(this._canvas.width, this._canvas.height);
    };

    private static checkCollisions(i: number): void {
        let ballData: Uint8ClampedArray = this.ball.imageData.data;
        let pfData: Uint8ClampedArray = this.pf.imageData.data;
        let p0Data: Uint8ClampedArray = this.p0.imageData.data;
        let p1Data: Uint8ClampedArray = this.p1.imageData.data;
        let m0Data: Uint8ClampedArray = this.m0.imageData.data;
        let m1Data: Uint8ClampedArray = this.m1.imageData.data;

        // CXM0P
        if(m0Data[i + 3] == 255 && p1Data[i + 3] == 255) {
            RAM.set(0x30, RAM.get(0x30) | 0x80);
        };

        if(m0Data[i + 3] == 255 && p0Data[i + 3] == 255) {
            RAM.set(0x30, RAM.get(0x30) | 0x40);
        };

        // CXM1P
        if(m1Data[i + 3] == 255 && p0Data[i + 3] == 255) {
            RAM.set(0x31, RAM.get(0x31) | 0x80);
        };

        if(m1Data[i + 3] == 255 && p1Data[i + 3] == 255) {
            RAM.set(0x31, RAM.get(0x31) | 0x40);
        };

        // CXP0FB
        if(p0Data[i + 3] == 255 && pfData[i + 3] == 255) {
            RAM.set(0x32, RAM.get(0x32) | 0x80);
        };

        if(p0Data[i + 3] == 255 && ballData[i + 3] == 255) {
            RAM.set(0x32, RAM.get(0x32) | 0x40);
        };

        // CXP1FB
        if(p1Data[i + 3] == 255 && pfData[i + 3] == 255) {
            RAM.set(0x33, RAM.get(0x33) | 0x80);
        };

        if(p1Data[i + 3] == 255 && ballData[i + 3] == 255) {
            RAM.set(0x33, RAM.get(0x33) | 0x40);
        };

        // CXM0FB
        if(m0Data[i + 3] == 255 && pfData[i + 3] == 255) {
            RAM.set(0x34, RAM.get(0x34) | 0x80);
        };

        if(m0Data[i + 3] == 255 && ballData[i + 3] == 255) {
            RAM.set(0x34, RAM.get(0x34) | 0x40);
        };

        // CXM1FB
        if(m1Data[i + 3] == 255 && pfData[i + 3] == 255) {
            RAM.set(0x35, RAM.get(0x35) | 0x80);
        };

        if(m1Data[i + 3] == 255 && ballData[i + 3] == 255) {
            RAM.set(0x35, RAM.get(0x35) | 0x40);
        };

        // CXBLPF
        if(ballData[i + 3] == 255 && pfData[i + 3] == 255) {
            RAM.set(0x36, RAM.get(0x36) | 0x80);
        };

        // CXPPMM
        if(p0Data[i + 3] == 255 && p1Data[i + 3] == 255) {
            RAM.set(0x37, RAM.get(0x37) | 0x80);
        };

        if(m0Data[i + 3] == 255 && m1Data[i + 3] == 255) {
            RAM.set(0x37, RAM.get(0x37) | 0x40);
        };

    };

    private static draw(): void {
        this.ctx.putImageData(this.imageData, 0, 0);
    };

    public static nextFrame(): Promise<boolean> {
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
            this.resetCanvases();

            resolve(true);
        });
    };

    private static pixel(scanline: number, clock: number): void {
        if(this.pfp) {
            this.bk.pixel(this.imageData, scanline, clock);
            this.p1.pixel(this.imageData, scanline, clock);
            this.m1.pixel(this.imageData, scanline, clock);
            this.p0.pixel(this.imageData, scanline, clock);
            this.m0.pixel(this.imageData, scanline, clock);
            this.pf.pixel(this.imageData, scanline, clock);
            this.ball.pixel(this.imageData, scanline, clock);
            this.checkCollisions((scanline * this._canvas.width + clock) << 2);
            return;
        };

        this.bk.pixel(this.imageData, scanline, clock);
        this.pf.pixel(this.imageData, scanline, clock);
        this.ball.pixel(this.imageData, scanline, clock);
        this.p0.pixel(this.imageData, scanline, clock);
        this.m0.pixel(this.imageData, scanline, clock);
        this.p1.pixel(this.imageData, scanline, clock);
        this.m1.pixel(this.imageData, scanline, clock);

        this.checkCollisions((scanline * this._canvas.width + clock) << 2);
    };

    public static getPixelRange(value: number): Array<number> {
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

    public static resetCanvases(): void {
        this.imageData = new ImageData(this._canvas.width, this._canvas.height);
        TIA.bk.imageData = new ImageData(this._canvas.width, this._canvas.height);
        TIA.pf.imageData = new ImageData(this._canvas.width, this._canvas.height);
        TIA.p0.imageData = new ImageData(this._canvas.width, this._canvas.height);
        TIA.p1.imageData = new ImageData(this._canvas.width, this._canvas.height);
        TIA.m0.imageData = new ImageData(this._canvas.width, this._canvas.height);
        TIA.m1.imageData = new ImageData(this._canvas.width, this._canvas.height);
        TIA.ball.imageData = new ImageData(this._canvas.width, this._canvas.height);
    };
};
