import { RomReader } from './RomReader';
import { CPU } from './CPU';
import { Register, RAM } from './RAM';
import { TIA } from './TIA';
import { PIA } from './PIA';

export class App {

    constructor(canvas: any) {
        this.handleRom = this.handleRom.bind(this);
        TIA.canvas = canvas;
        PIA.initInputs();
    };

    private handleRom() {
        TIA.nextFrame().then(() => {
            requestAnimationFrame(this.handleRom);
            console.log('NEW FRAME');
        });
    };

    public processFile(file: any)  {
        console.log('Reading process started!');
        
        let reader = new RomReader(file, (rom: Uint8Array) => {
            RAM.readRom(rom);
            this.handleRom();
        });
    };
}
