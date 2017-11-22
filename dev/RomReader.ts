export class RomReader {
    callback: Function;

    rom: Uint8Array;

    romSize: number;
    
    reader: FileReader = new FileReader();

    constructor(file: any, callback: Function) {
        this.onRomLoadEnd = this.onRomLoadEnd.bind(this);
        this.callback = callback;
        this.reader.onloadend = this.onRomLoadEnd;
        this.reader.readAsArrayBuffer(file);
    };

    // Lets mirror our data to match 64K rom
    onRomLoadEnd(evt: any) {  
        this.rom = new Uint8Array(65536);
        this.romSize = evt.target.result.byteLength;
        for(let i: number = 0; i < 65536; i += this.romSize) {
            this.rom.set((new Uint8Array(evt.target.result)), i);
        };
        
        this.callback(this.rom, this.romSize);
    };
};
