export class RomReader extends FileReader {
    callback: Function;

    rom: Int8Array;

    romSize: number;

    constructor(file: any, callback: Function) {
        super();
        this.callback = callback;
        this.onloadend = this.onRomLoadEnd;
        this.readAsArrayBuffer(file);
    };

    // Lets mirror our data to match 64K rom
    onRomLoadEnd() {
        this.rom = new Int8Array(65536);
        this.romSize = this.result.byteLength
        for(let i: number = 0; i < 65536; i += this.romSize) {
            this.rom.set((new Int8Array(this.result)), i);
        };
        console.log(this.rom);
        this.callback(this.rom);
    };
};
