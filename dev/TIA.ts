import { Convert } from './Common';
import { RAM } from './RAM';
import { CPU } from './CPU';

// TODO: String to number for colors
// TODO: Move player nusiz position calculation to RAM

abstract class GameObject {
    protected _canvas: any = null;
    protected _ctx: any = null;
    protected _imageData: any = null;

    public get canvas() {
        this._ctx.putImageData(this._imageData, 0, 0);
        this._imageData = this._ctx.createImageData(this._canvas.width, this._canvas.height);
        return this._canvas;
    };

    public set canvas(canvas: any) {
        this._canvas = canvas;
    };

    constructor() {
        this._canvas = document.createElement('canvas');

        this._canvas.width = 160;

        this._canvas.height = 192;

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
    public size: number = 1;
    public enabl: boolean = false;

    pixel(scanline: number, clock: number) {

    };
};

class Missle extends GameObject {
    public missle: number = 0;
    public enam: boolean = false;

    constructor(missle: number) {
        super();
        this.missle = missle;
    };

    pixel(scanline: number, clock: number) {

    };
};

class Player extends GameObject {
    public colup: Array<number> = [0, 0, 0];
    public grp: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];
    public nusiz: number = 0;
    private player: number = 0;
    public position: number = null;

    constructor(player: number = 0) {
        super();
        this.player = player;
    };

    pixel(scanline: number, clock: number) {
        if(this.position && this.position <= clock && this.position + 8 > clock && this.grp[((clock - this.position)) % 8] == '1') {
            return this.setImageData(scanline, clock, this.colup);
        };

        let drawPlayer: boolean = false;

        switch(this.nusiz) {
            case 1:
                if(clock >= 80 * this.player + 16 && clock < 80 * this.player + 24) {
                    drawPlayer = true;
                };
                break;
            case 2:
                if(clock >= 80 * this.player + 32 && clock < 80 * this.player + 40) {
                    drawPlayer = true;
                };
                break;
            case 3:
                if(clock >= 80 * this.player + 16 && clock < 80 * this.player + 24 || clock >= 80 * this.player + 32 && clock < 80 * this.player + 40) {
                    drawPlayer = true;
                };
                break;
            case 4:
                if(clock >= 80 * this.player + 72 && clock < 80 * this.player + 80) {
                    drawPlayer = true;
                };
                break;
            case 5:
                if(clock >= 80 * this.player + 8 && clock < 80 * this.player + 16) {
                    drawPlayer = true;
                };
                break;
            case 6:
                if(clock >= 80 * this.player + 32 && clock < 80 * this.player + 40 || clock >= 80 * this.player + 72 && clock < 80 * this.player + 80) {
                    drawPlayer = true;
                };
                break;
            case 7:
                if(clock >= 80 * this.player + 8 && clock < 80 * this.player + 32) {
                    drawPlayer = true;
                };
                break;
        };

        if(!this.position && (clock >= 80 * this.player && clock < (80 * this.player + 8) || drawPlayer) && this.grp[(8 + clock) % 8] == '1') {
            return this.setImageData(scanline, clock, this.colup);
        };
    };
};

export class TIA {
    private static colorPalette: Map<any, any> = new Map([
        ['0000000','#000000'],
        ['0000001','#1A1A1A'],
        ['0000010','#393939'],
        ['0000011','#5B5B5B'],
        ['0000100','#7E7E7E'],
        ['0000101','#A2A2A2'],
        ['0000110','#C7C7C7'],
        ['0000111','#EDEDED'],

        ['0001000','#190200'],
        ['0001001','#3A1F00'],
        ['0001010','#5D4100'],
        ['0001011','#826400'],
        ['0001100','#A78800'],
        ['0001101','#CCAD00'],
        ['0001110','#F2D219'],
        ['0001111','#FEFA40'],

        ['0010000','#370000'],
        ['0010001','#5E0800'],
        ['0010010','#832700'],
        ['0010011','#A94900'],
        ['0010100','#CF6C00'],
        ['0010101','#F58F17'],
        ['0010110','#FEB438'],
        ['0010111','#FEDF6F'],

        ['0011000','#470000'],
        ['0011001','#730000'],
        ['0011010','#981300'],
        ['0011011','#BE3216'],
        ['0011100','#E45335'],
        ['0011101','#FE7657'],
        ['0011110','#FE9C81'],
        ['0011111','#FEC6BB'],

        ['0100000','#440008'],
        ['0100001','#6F001F'],
        ['0100010','#960640'],
        ['0100011','#BB2462'],
        ['0100100','#E14585'],
        ['0100101','#FE67AA'],
        ['0100110','#FE8CD6'],
        ['0100111','#FEB7F6'],

        ['0101000','#2D004A'],
        ['0101001','#570067'],
        ['0101010','#7D058C'],
        ['0101011','#A122B1'],
        ['0101100','#C743D7'],
        ['0101101','#ED65FE'],
        ['0101110','#FE8AF6'],
        ['0101111','#FEB5F7'],

        ['0110000','#0D0082'],
        ['0110001','#3300A2'],
        ['0110010','#550FC9'],
        ['0110011','#782DF0'],
        ['0110100','#9C4EFE'],
        ['0110101','#C372FE'],
        ['0110110','#EB98FE'],
        ['0110111','#FEC0F9'],

        ['0111000','#000091'],
        ['0111001','#0A05BD'],
        ['0111010','#2822E4'],
        ['0111011','#4842FE'],
        ['0111100','#6B64FE'],
        ['0111101','#908AFE'],
        ['0111110','#B7B0FE'],
        ['0111111','#DFD8FE'],

        ['1000000','#000072'],
        ['1000001','#001CAB'],
        ['1000010','#033CD6'],
        ['1000011','#205EFD'],
        ['1000100','#4081FE'],
        ['1000101','#64A6FE'],
        ['1000110','#89CEFE'],
        ['1000111','#B0F6FE'],

        ['1001000','#00103A'],
        ['1001001','#00316E'],
        ['1001010','#0055A2'],
        ['1001011','#0579C8'],
        ['1001100','#239DEE'],
        ['1001101','#44C2FE'],
        ['1001110','#68E9FE'],
        ['1001111','#8FFEFE'],

        ['1010000','#001F02'],
        ['1010001','#004326'],
        ['1010010','#006957'],
        ['1010011','#008D7A'],
        ['1010100','#1BB19E'],
        ['1010101','#3BD7C3'],
        ['1010110','#5DFEE9'],
        ['1010111','#86FEFE'],

        ['1011000','#002403'],
        ['1011001','#004A05'],
        ['1011010','#00700C'],
        ['1011011','#09952B'],
        ['1011100','#28BA4C'],
        ['1011101','#49E06E'],
        ['1011110','#6CFE92'],
        ['1011111','#97FEB5'],

        ['1100000','#002102'],
        ['1100001','#004604'],
        ['1100010','#086B00'],
        ['1100011','#289000'],
        ['1100100','#49B509'],
        ['1100101','#6BDB28'],
        ['1100110','#8FFE49'],
        ['1100111','#BBFE69'],

        ['1101000','#001501'],
        ['1101001','#103600'],
        ['1101010','#305900'],
        ['1101011','#537E00'],
        ['1101100','#76A300'],
        ['1101101','#9AC800'],
        ['1101110','#BFEE1E'],
        ['1101111','#E8FE3E'],

        ['1110000','#1A0200'],
        ['1110001','#3B1F00'],
        ['1110010','#5E4100'],
        ['1110011','#836400'],
        ['1110100','#A88800'],
        ['1110101','#CEAD00'],
        ['1110110','#F4D218'],
        ['1110111','#FEFA40'],

        ['1111000','#380000'],
        ['1111001','#5F0800'],
        ['1111010','#842700'],
        ['1111011','#AA4900'],
        ['1111100','#D06B00'],
        ['1111101','#F68F18'],
        ['1111110','#FEB439'],
        ['1111111','#FEDF70']
    ]);

    private static _canvas: any = null;

    public static ctx: any = null;

    public static clock: number = 0;

	public static imageData: any = null;

    public static expectNewFrame: boolean = false;

    public static nusiz0: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];

    public static nusiz1: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];

    private static _resp0: boolean = false;

    private static _resp1: boolean = false;

    public static p0: Player = new Player(0);

    public static p1: Player = new Player(1);

    public static m0: Missle = new Missle(0);

    public static m1: Missle = new Missle(1);

    public static pfp: boolean = false;

    public static bk: Background = new Background();

    public static pf: Playfield = new Playfield();

    public static ball: Ball = new Ball();

    public static color(val: string) {
        return this.colorPalette.get(val.slice(0, -1));
    };

    public static get canvas() {
        return this._canvas;
    };

    public static set canvas(canvas: any) {
        this._canvas = canvas;

        this._canvas.width = 160;

        this._canvas.height = 192;

        this.ctx = canvas.getContext('2d');

        this.ctx.fillStyle = '#000';

        this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this.imageData = this.ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    };

    public static get resp0() {
        return this._resp0;
    };

    public static set resp0(resp0: boolean) {
        this._resp0 = resp0;

        this.p0.position = (this.clock <= 68 ? null : this.clock - 68);
    };

    public static get resp1() {
        return this._resp1;
    };

    public static set resp1(resp1: boolean) {
        this._resp1 = resp1;

        this.p1.position = (this.clock <= 68 ? null : this.clock - 68);
    };

    private static draw() {
        this.ctx.drawImage(this.bk.canvas, 0, 0);
        this.ctx.drawImage(this.pf.canvas, 0, 0);
        this.ctx.drawImage(this.p0.canvas, 0, 0);
        this.ctx.drawImage(this.p1.canvas, 0, 0);
    };

    public static nextFrame() {
        return new Promise((resolve: Function) => {
            for(let scanline = 0; scanline < 3; scanline++) {
                for(this.clock = 0; this.clock < 228; this.clock += 3) {
                    CPU.pulse();
                };

                CPU.unlock();
            };

            for(let scanline = 0; scanline < 37; scanline++) {
                for(this.clock = 0; this.clock < 228; this.clock += 3) {
                    CPU.pulse();
                };

                CPU.unlock();
            };

            for(let scanline = 0; scanline < 192; scanline++) {
                for(this.clock = 0; this.clock < 68; this.clock += 3) {
                    CPU.pulse();
                };

                let counter: number = 2;
                for(this.clock = 68; this.clock < 228; this.clock += 1) {
                    this.pixel(scanline, this.clock - 68);

                    if(counter > 2) {
                        counter = 0;
                        CPU.pulse();
                    };

                    counter++;
                };

                CPU.unlock();
            };

            this.draw();

            for(let scanline = 0; scanline < 30; scanline++) {
                for(this.clock = 0; this.clock < 228; this.clock += 3) {
                    CPU.pulse();
                };

                CPU.unlock();
            };

            this.expectNewFrame = false;

            resolve(true);
        });
    };

    private static pixel(scanline: number, clock: number) {
        this.bk.pixel(scanline, clock);
        this.pf.pixel(scanline, clock);
        this.p0.pixel(scanline, clock);
        this.p1.pixel(scanline, clock);
    };
};
