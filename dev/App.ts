import Display from './Display';
import { RomReader } from './RomReader';

import { Register, Rom, RAM } from './RAM';

export class App {
    display: Display = null;

    handleRom() {
        this.display.nextFrame().then(() => {
            setTimeout(() => this.handleRom(), 3000);
            console.log('FRAME ENDED');
        });
    };

    processFile()  {
    	console.log('Reading process started!');

    	let file: any = (<HTMLInputElement>document.getElementById('file')).files[0];
        let canvas: any = document.getElementById('canvas');

        this.display = new Display(canvas);

        let reader = new RomReader(file, (rom: Uint8Array) => {
            Rom.data = rom;
            Rom.size = rom.byteLength;
            
            RAM.readRom(rom);
            
            this.handleRom();
        });
    };
}
