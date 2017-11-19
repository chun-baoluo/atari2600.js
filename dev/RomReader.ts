export class RomReader extends FileReader {
    callback: Function;

    rom: Uint8Array;

    romSize: number;

    constructor(file: any, callback: Function) {
        super();
        this.callback = callback;
        this.onloadend = this.onRomLoadEnd;
        this.readAsArrayBuffer(file);

        FileReader.apply(this);
    };

    // Lets mirror our data to match 64K rom
    onRomLoadEnd() {
        this.rom = new Uint8Array(65536);
        this.romSize = this.result.byteLength
        for(let i: number = 0; i < 65536; i += this.romSize) {
            this.rom.set((new Uint8Array(this.result)), i);
        };
        this.callback(this.rom);
    };
};
