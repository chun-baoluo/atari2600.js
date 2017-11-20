import Display from './Display';
import { RomReader } from './RomReader';

import { Register, Rom } from './RAM';

export class App {
    display: Display = null;

    constructor() {
        this.handleRom = this.handleRom.bind(this);
    };

    handleRom() {
        this.display.nextFrame().then(() => {
            setTimeout(() => this.handleRom(), 1000);
        });
    };

    processFile()  {

    	console.log('Reading process started!');

    	let file: any = (<HTMLInputElement>document.getElementById('file')).files[0];
        let canvas: any = document.getElementById('canvas');

        this.display = new Display(canvas);

        let reader = new RomReader(file, (rom: Int8Array) => {
            Rom.data = rom;
            this.handleRom();
        });
    };
}
