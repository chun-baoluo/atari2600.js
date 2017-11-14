import Display from './Display';
import { RomReader } from './RomReader';

import Register from './Register';

export class App {
    display: Display = null;

    constructor() {
        this.handleRom = this.handleRom.bind(this);
    };

    handleRom(rom: Uint8Array) {
        this.display.nextFrame().then(() => {
            setTimeout(() => this.handleRom(rom), 1000);
        });
    };

    processFile()  {

    	console.log('Reading process started!');

    	let file: any = (<HTMLInputElement>document.getElementById('file')).files[0];
        let canvas: any = document.getElementById('canvas');

        this.display = new Display(canvas);

        let reader = new RomReader(file, this.handleRom);
    };
}
