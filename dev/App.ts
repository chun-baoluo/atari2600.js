import { RomReader } from './RomReader';
import { CPU } from './CPU';
import { Register, Rom, RAM } from './RAM';
import { TIA } from './TIA';

export class App {

    constructor(canvas: any) {
        this.handleRom = this.handleRom.bind(this);
        TIA.canvas = canvas;
    };

    private handleRom() {
        for(; Register.PC < Rom.size ;) {
            CPU.pulse();
            CPU.unlock();

            if(TIA.expectNewFrame) {
                TIA.nextFrame().then(() => {
                    TIA.expectNewFrame = false;
                    setTimeout(() => requestAnimationFrame(this.handleRom), 1000 / 60);
                    console.log('FRAME ENDED');
                });
                break;
            };
        };
    };

    public processFile(file: any)  {
    	console.log('Reading process started!');

        let reader = new RomReader(file, (rom: Uint8Array) => {
            Rom.data = rom;
            Rom.size = rom.byteLength;

            RAM.readRom(rom);

            this.handleRom();
        });
    };
}
