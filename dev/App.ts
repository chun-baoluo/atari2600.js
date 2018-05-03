import { RomReader } from './RomReader';
import { CPU } from './CPU';
import { Register, RAM } from './RAM';
import { TIA } from './TIA';
import { PIA } from './PIA';
import { Colors }  from './Colors';

export class App {

    constructor(canvas: any, options: any = {}) {
        this.handleRom = this.handleRom.bind(this);
        canvas.style.imageRendering = options.imageRendering || 'pixelated';
        TIA.colorPalette = new Map(Colors[options.colors] || Colors['NTSC']);
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

        let reader = new RomReader(file, (banks: Array<Uint8Array>, type: string) => {
            RAM.readRom(banks, type);
            this.handleRom();
        });
    };
}
