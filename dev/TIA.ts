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
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
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
    public enabl: boolean = false;
    public hmbl: number = 0;
    public position: number = null;
    public size: number = 1;
    public sizeCounter = 0;
    public vdelbl: boolean = false;

    pixel(scanline: number, clock: number) {
        if(this.enabl && (this.sizeCounter--) != 0) {
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
    public sizeCounter = 0;
    public position: number = null;

    constructor(missile: number) {
        super();
        this.missile = missile;
    };

    pixel(scanline: number, clock: number) {
        if(this.enam && (this.sizeCounter--) != 0) {
            return this.setImageData(scanline, clock, this.colup);
        };
    };
};

class Player extends GameObject {
    public colup: Array<number> = [0, 0, 0];
    public grp: Array<string> = ['0', '0', '0', '0', '0', '0', '0', '0'];
    public hmp: number = 0;
    public nusiz: number = 0;
    private player: number = 0;
    public position: number = null;
    public refp: boolean = false;
    public vdelp: boolean = false;
    public pixelRange: Array<number> = [0];

    constructor(player: number = 0) {
        super();
        this.player = player;
    };

    pixel(scanline: number, clock: number) {
        let offset: number = (!this.position ? 80 * this.player : 0);
        for(let p of this.pixelRange) {
            if(clock >= ((this.position || offset) + p) && clock < ((this.position || offset) + p + 8) && this.grp[(clock - this.position) % 8] == '1') {
                return this.setImageData(scanline, clock, this.colup);
            };
        };
    };
};

export class TIA {
    private static colorPalette: Map<string, number[]> = new Map([
        ['0000000', [0, 0, 0]], // #000000
        ['0000001', [26, 26, 26]], // #1A1A1A
        ['0000010', [57, 57, 57]], // #393939
        ['0000011', [91, 91, 91]], // #5B5B5B
        ['0000100', [126, 126, 126]], //#7E7E7E
        ['0000101', [162, 162, 162]], // #A2A2A2
        ['0000110', [199, 199, 199]], // #C7C7C7
        ['0000111', [237, 237, 237]], // #EDEDED

        ['0001000', [25, 2, 0]], // #190200
        ['0001001', [58, 31, 0]], // #3A1F00
        ['0001010', [93, 65, 0]], // #5D4100
        ['0001011', [130, 100, 0]], // #826400
        ['0001100', [167, 136, 0]], // #A78800
        ['0001101', [204, 172, 0]], // #CCAD00
        ['0001110', [242, 210, 25]], // #F2D219
        ['0001111', [254, 250, 64]], // #FEFA40

        ['0010000', [55, 0, 0]], // #370000
        ['0010001', [94, 8, 0]], // #5E0800
        ['0010010', [131, 39, 0]], // #832700
        ['0010011', [169, 73, 0]], // #A94900
        ['0010100', [207, 108, 0]], // #CF6C00
        ['0010101', [245, 143, 23]], // #F58F17
        ['0010110', [254, 180, 56]], // #FEB438
        ['0010111', [254, 223, 111]], // #FEDF6F

        ['0011000', [71, 0, 0]], // #470000
        ['0011001', [115, 0, 0]], // #730000
        ['0011010', [152, 19, 0]], // #981300
        ['0011011', [190, 50, 22]], // #BE3216
        ['0011100', [228, 83, 53]], // #E45335
        ['0011101', [254, 118, 87]], // #FE7657
        ['0011110', [254, 156, 129]], // #FE9C81
        ['0011111', [254, 198, 187]], // #FEC6BB

        ['0100000', [68, 0, 8]], // #440008
        ['0100001', [111, 0 , 31]], // #6F001F
        ['0100010', [150, 6, 64]], // #960640
        ['0100011', [187, 36, 98]], // #BB2462
        ['0100100', [225, 69, 133]], // #E14585
        ['0100101', [254, 103, 170]], // #FE67AA
        ['0100110', [254, 140, 214]], // #FE8CD6
        ['0100111', [254, 183, 246]], // #FEB7F6

        ['0101000', [45, 0, 74]], // #2D004A
        ['0101001', [87, 0, 103]], // #570067
        ['0101010', [125, 5, 140]], // #7D058C
        ['0101011', [161, 34, 177]], // #A122B1
        ['0101100', [199, 67, 215]], // #C743D7
        ['0101101', [237, 101, 254]], // #ED65FE
        ['0101110', [254, 138, 246]], // #FE8AF6
        ['0101111', [254, 181, 247]], // #FEB5F7

        ['0110000', [13, 0, 130]], // #0D0082
        ['0110001', [51, 0, 162]], // #3300A2
        ['0110010', [85, 15, 201]], // #550FC9
        ['0110011', [120, 45, 240]], // #782DF0
        ['0110100', [156, 78, 254]], // #9C4EFE
        ['0110101', [195, 114, 254]], // #C372FE
        ['0110110', [235, 152, 254]], // #EB98FE
        ['0110111', [254, 192, 249]],

        ['0111000', [0, 0, 145]], // #000091
        ['0111001', [10, 5, 189]], // #0A05BD
        ['0111010', [40, 34, 228]], // #2822E4
        ['0111011', [72, 66, 254]], // #4842FE
        ['0111100', [107, 100, 254]], // #6B64FE
        ['0111101', [144, 138, 254]], // #908AFE
        ['0111110', [183, 176, 254]], // #B7B0FE
        ['0111111', [223, 216, 254]],

        ['1000000', [0, 0, 114]], // #000072
        ['1000001', [0, 28, 171]], // #001CAB
        ['1000010', [3, 60, 214]], // #033CD6
        ['1000011', [32, 94, 253]], // #205EFD
        ['1000100', [64, 129, 254]], // #4081FE
        ['1000101', [100, 166, 254]], // #64A6FE
        ['1000110', [137, 206, 254]], // #89CEFE
        ['1000111', [176, 246, 254]], // #B0F6FE

        ['1001000', [0, 16, 58]], // #00103A
        ['1001001', [0, 49, 110]], // #00316E
        ['1001010', [0, 85, 162]], // #0055A2
        ['1001011', [5, 121, 200]], // #0579C8
        ['1001100', [35, 157, 238]], // #239DEE
        ['1001101', [68, 194, 254]], // #44C2FE
        ['1001110', [104, 233, 254]], // #68E9FE
        ['1001111', [143, 254, 254]], // #8FFEFE

        ['1010000', [0, 31, 2]], // #001F02
        ['1010001', [0, 67, 38]], // #004326
        ['1010010', [0, 105, 87]], // #006957
        ['1010011', [0, 141, 122]], // #008D7A
        ['1010100', [27, 177, 158]], // #1BB19E
        ['1010101', [59, 215, 195]], // #3BD7C3
        ['1010110', [93, 254, 233]], // #5DFEE9
        ['1010111', [134, 254, 254]], // #86FEFE

        ['1011000', [0, 36, 3]], // #002403
        ['1011001', [0, 74, 5]], // #004A05
        ['1011010', [0, 112, 12]], // #00700C
        ['1011011', [9, 149, 43]], // #09952B
        ['1011100', [40, 186, 76]], // #28BA4C
        ['1011101', [73, 224, 110]], // #49E06E
        ['1011110', [108, 254, 146]], // #6CFE92
        ['1011111', [151, 254, 181]], // #97FEB5

        ['1100000', [0, 33, 2]], // #002102
        ['1100001', [0, 70, 4]], // #004604
        ['1100010', [8, 107, 0]], // #086B00
        ['1100011', [40, 144, 0]], // #289000
        ['1100100', [73, 181, 9]], // #49B509
        ['1100101', [107, 219, 40]], // #6BDB28
        ['1100110', [143, 254, 73]], // #8FFE49
        ['1100111', [187, 254, 105]], // #BBFE69

        ['1101000', [0, 21, 1]], // #001501
        ['1101001', [16, 54, 0]], // #103600
        ['1101010', [48, 89, 0]], // #305900
        ['1101011', [83, 126, 0]], // #537E00
        ['1101100', [118, 163, 0]], // #76A300
        ['1101101', [154, 200, 0]], // #9AC800
        ['1101110', [191, 238, 30]], // #BFEE1E
        ['1101111', [232, 254, 62]], // #E8FE3E

        ['1110000', [26, 2, 0]], // #1A0200
        ['1110001', [59, 31, 0]], // #3B1F00
        ['1110010', [94, 65, 0]], // #5E4100
        ['1110011', [131, 100, 0]], // #836400
        ['1110100', [168, 136, 0]], // #A88800
        ['1110101', [206, 173, 0]], // #CEAD00
        ['1110110', [244, 210, 24]], // #F4D218
        ['1110111', [254, 250, 64]], // #FEFA40

        ['1111000', [56,0, 0]], // #380000
        ['1111001', [95, 8, 0]], // #5F0800
        ['1111010', [132, 39, 0]], // #842700
        ['1111011', [170, 73, 0]], // #AA4900
        ['1111100', [208, 107, 0]], // #D06B00
        ['1111101', [246, 143, 24]], // #F68F18
        ['1111110', [254, 180, 57]], // #FEB439
        ['1111111', [254, 223, 112]] // #FEDF70
    ]);

    private static _canvas: any = null;

    public static ball: Ball = new Ball();

    public static bk: Background = new Background();

    public static ctx: any = null;

    public static clock: number = 0;

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

    public static color(val: string) {
        return this.colorPalette.get(val.slice(0, -1));
    };

    public static get canvas() {
        return this._canvas;
    };

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
                for(this.scanline = 0; this.scanline < 262; this.scanline++) {
                    for(this.clock = 0; this.clock < 68; this.clock += 3) {
                        CPU.pulse();
                    };

                    let counter: number = 2;
                    for(this.clock = 68; this.clock < 228; this.clock += 1) {
                        if(this.scanline > 30 && this.scanline < 252) {
                            this.pixel(this.scanline - 30, this.clock - 68);
                        };

                        if(counter > 2) {
                            counter = 0;
                            CPU.pulse();
                        };

                        counter++;
                    };

                    CPU.unlock();
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

    public static getPixelRange(player: number, value: number) {
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
