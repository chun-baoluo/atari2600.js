import Display from './Display';
import { RomReader } from './RomReader';

import { Register, Rom } from './RAM';

export class App {
    display: Display = null;

    handleRom() {
        this.display.nextFrame().then(() => {
            this.handleRom();
            // setTimeout(() => this.handleRom(), 1000 / 60);
        });
    };

    processFile()  {
    	console.log('Reading process started!');

    	let file: any = (<HTMLInputElement>document.getElementById('file')).files[0];
        let canvas: any = document.getElementById('canvas');

        this.display = new Display(canvas);

        let reader = new RomReader(file, (rom: Uint8Array, size: number) => {
            Rom.data.set(rom);
            Rom.size = size;
            this.handleRom();
        });
    };
}
