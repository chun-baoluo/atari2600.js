import { Convert } from './Common';
import { RAM } from './RAM';

export class TIA {
    
    public static draw(data: any, w: number, h: number, scanline: number, clock: number) {
        
        let reflect: any = (Convert.toBin(RAM.get(0x0A)).split('').reverse()[0] == '1');
    
        let pf0: Array<string> = Convert.toBin(RAM.get(0x0D)).split('').reverse();
        let pf1: Array<string> = Convert.toBin(RAM.get(0x0E)).split('').reverse();
        let pf2: Array<string> = Convert.toBin(RAM.get(0x0F)).split('').reverse();
        
        let c: number = null;
        let pf = this.toHex(this.color(Convert.toBin(RAM.get(0x08)).split('').reverse()));
        let bk = this.toHex(this.color(Convert.toBin(RAM.get(0x09)).split('').reverse()));
    
        if(clock <= 16) {
            for(let i = 4; i <= 16; i += 4) {
                if(clock <= i) {
                    if(pf0[4 + (i / 4) - 1] == '1') {
                        c = pf;
                        break;
                    };
                    c = bk;
                    break;
                };
            };
        } else if(clock > 16 && clock <= 48) {
            for(let i = 20; i <= 48; i += 4) {
                if(clock <= i) {
                    if(pf1[7 - (i / 4 - 5)] == '1') {
                        c = pf;
                        break;
                    };
                    c = bk;
                    break;
                };
            };
        } else if(clock > 48 && clock <= 80) {
            for(let i = 52; i <= 80; i += 4) {
                if(clock <= i) {
                    if(pf2[0 + (i / 4 - 13)] == '1') {
                        c = pf;
                        break;
                    };
                    c = bk;
                    break;
                };
            };
        } else if(clock > 80 && clock <= 96 && !reflect) { // REF = 0
            for(let i = 84; i <= 96; i += 4) {
                if(clock <= i) {
                    if(pf0[4 + (i / 4) - 21] == '1') {
                        c = pf;
                        break;
                    };
                    c = bk;
                    break;
                };
            };
        } else if(clock > 96 && clock <= 128 && !reflect) {
            for(let i = 100; i <= 128; i += 4) {
                if(clock <= i) {
                    if(pf1[7 - (i / 4 - 25)] == '1') {
                        c = pf;
                        break;
                    };
                    c = bk;
                    break;
                };
            };
        } else if(clock > 128 && clock <= 160 && !reflect) {
            for(let i = 132; i <= 160; i += 4) {
                if(clock <= i) {
                    if(pf2[0 + (i / 4 - 33)] == '1') {
                        c = pf;
                        break;
                    };
                    c = bk;
                    break;
                };
            };
        } else if(clock > 80 && clock <= 112 && reflect) { // REF = 1
            for(let i = 84; i <= 112; i += 4) {
                if(clock <= i) {
                    if(pf2[7 - (i / 4 - 21)] == '1') {
                        c = pf;
                        break;
                    };
                    c = bk;
                    break;
                };
            };
        } else if(clock > 112 && clock <= 144 && reflect) {
            for(let i = 116; i <= 144; i += 4) {
                if(clock <= i) {
                    if(pf1[0 + (i / 4 - 29)] == '1') {
                        c = pf;
                        break;
                    };
                    c = bk;
                    break;
                };
            };
            
        } else if(clock > 144 && clock <= 160 && reflect) {
            for(let i = 148; i <= 160; i += 4) {
                if(clock <= i) {
                    if(pf1[7 - (i / 4 - 37)] == '1') {
                        c = pf;
                        break;
                    };
                    c = bk;
                    break;
                };
            };
        }

        console.log();

        var pixelindex = Math.floor((scanline * w + ( 2 * clock)) * 4);
        data.data[pixelindex] = c[0];
        data.data[pixelindex + 1] = c[1];
        data.data[pixelindex + 2] = c[2];

        var pixelindex = Math.floor((scanline * w + ( 2 * clock - 1)) * 4);
        data.data[pixelindex] = c[0];
        data.data[pixelindex + 1] = c[1];
        data.data[pixelindex + 2] = c[2];
    
        return data;
    
    };
    
    public static luminate(hex: string, lum: number) {
        if(hex == '#000000' && lum == 1) {
			return '#FFFFFF';
		}

		hex = String(hex).replace(/[^0-9a-f]/gi, '');
        
		if (hex.length < 6) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}

		lum = lum || 0;

		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i * 2,2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
			rgb += ("00" + c).substr(c.length);
		}

		return rgb;        
    };
    
    public static toHex(hex: string) {
        hex = hex.replace('#','');
        var c: any = [];
        c[0] = parseInt(hex.substring(0,2), 16);
        c[1] = parseInt(hex.substring(2,4), 16);
        c[2] = parseInt(hex.substring(4,6), 16);
        return c;
    };
    
    public static color(val: Array<any>) {
        var color: string = null;
		var luminance: number = null;
		switch(val[3] + val[2] + val[1]) {
			case '000':
				luminance = 0;
				break;
			case '001':
				luminance = 0.142;
				break;
			case '010':
				luminance = 0.284;
				break;
			case '011':
				luminance = 0.426;
				break;
			case '100':
				luminance = 0.568;
				break;
			case '101':
				luminance = 0.710;
				break;
			case '110':
				luminance = 0.852;
				break;
			case '111':
				luminance = 1;
				break;
		}
		switch(val[7] + val[6] + val[5]  + val[4]) {
			case '0000':
				color = '#000000';
				break;
			case '0001':
				color = '#444400';
				break;
			case '0010':
				color = '#702800';
				break;
			case '0011':
				color = '#841800';
				break;
			case '0100':
				color = '#880000';
				break;
			case '0101':
				color = '#78005c';
				break;
			case '0110':
				color = '#480078';
				break;
			case '0111':
				color = '#140084';
				break;
			case '1000':
				color = '#000088';
				break;
			case '1001':
				color = '#00187c';
				break;
			case '1010':
				color = '#002c5c';
				break;
			case '1011':
				color = '#003c3c';
				break;
			case '1100':
				color = '#003c00';
				break;
			case '1101':
				color = '#143800';
				break;
			case '1110':
				color = '#2c3000';
				break;
			case '1111':
				color = '#442800';
				break;
			default:
				console.log('not found');
				console.log(val);
				color = '#000000';
				break;
		}

		return this.luminate(color, luminance);        
    };
};