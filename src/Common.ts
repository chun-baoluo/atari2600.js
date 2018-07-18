export class Convert {
    public static toInt8(val: number): number {
        return new Int8Array([val])[0];
    };

    public static toUint8(val: number): number {
        return val & 0xFF;
    };

    public static toBCD(val: number): number {
        return Math.abs((val / 10 << 4) | val % 10) % 100;
    };

    public static toDecBCD(val: number): number {
        return ((val >> 4) * 10) + (val & 0x0F);
    };

    public static toBin(val: number): string {
        return ('00000000' + (val >>> 0).toString(2)).slice(-8);
    };
};
