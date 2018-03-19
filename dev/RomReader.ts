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
        this.callback(new Uint8Array(evt.target.result));
    };
};
