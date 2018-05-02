export class RomReader {
    callback: Function;

    reader: FileReader = new FileReader();

    constructor(file: any, callback: Function) {
        this.onRomLoadEnd = this.onRomLoadEnd.bind(this);
        this.callback = callback;
        this.reader.onloadend = this.onRomLoadEnd;
        this.reader.readAsArrayBuffer(file);
    };

    onRomLoadEnd(evt: any) {
        let rom: Uint8Array = new Uint8Array(evt.target.result);
        let romSize: number = rom.length;
        let banks: Array<Uint8Array> = [];

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

        this.callback(banks);
    };
};
