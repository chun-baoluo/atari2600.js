export class Convert {
    public static toInt8(val: number) {
        return new Int8Array([val])[0];
    };
    
    public static toUint8(val: number) {
        return new Uint8Array([val])[0];
    };
    
    public static toBin(val: number) {
        let bits: string = (val >>> 0).toString(2);
        
        if(bits.length > 8) {
            return ('0000000000000000' + bits).slice(-16);
        };
        
        return ('00000000' + bits).slice(-8);
    };
    
    public static toColorArray(hex: string) {
        let c: any = [];
        hex = hex.replace('#','');
        c[0] = parseInt(hex.substring(0, 2), 16);
        c[1] = parseInt(hex.substring(2, 4), 16);
        c[2] = parseInt(hex.substring(4, 6), 16);
        return c;
    };    
};