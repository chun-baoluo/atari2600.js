export class RomReader {
    callback: Function;

    reader: FileReader = new FileReader();

    constructor(file: any, callback: Function) {
        this.onRomLoadEnd = this.onRomLoadEnd.bind(this);
        this.callback = callback;
        this.reader.onloadend = this.onRomLoadEnd;
        this.reader.readAsArrayBuffer(file);
    };

    private determineRomType(rom: Uint8Array) {
        switch(rom.length) {
            case 1024:
                return '1KB';
            case 2048:
                return '2KB';
            case 4096:
                return '4KB';
            case 8192:
                return '8KB';
            case 12288:
                return '12KB';
            case 16384:
                return '16KB';
            case 32768:
                return '32KB';
            default:
                return;
        };
    };

    private onRomLoadEnd(evt: any) {
        let rom: Uint8Array = new Uint8Array(evt.target.result);

        let romSize: number = rom.length;
        let banks: Array<Uint8Array> = [];
        let romType: string = this.determineRomType(rom);

        // in case rom's size is less than 4KB
        for(let i = romSize; i < 0x1000; i += romSize) {
            let old: Uint8Array = rom;
            rom = new Uint8Array(i + romSize);
            rom.set(old, 0);
            rom.set(new Uint8Array(evt.target.result), i);
        };

        // lets parse rom into 4KB banks
        for(let i = 0; i < rom.length; i += 0x1000) {
            banks.push(new Uint8Array(rom.buffer, i, 0x1000));
        };

        this.callback(banks, romType);
    };
};
