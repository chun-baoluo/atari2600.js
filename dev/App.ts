import { RomReader } from './RomReader';
import { CPU } from './CPU';
import { Register, RAM } from './RAM';
import { TIA } from './TIA';

export class App {

    constructor(canvas: any) {
        this.handleRom = this.handleRom.bind(this);
        TIA.canvas = canvas;
    };

    private handleRom() {
        for(; Register.PC < 61440 + RAM.romSize ;) {
            CPU.pulse();
            CPU.unlock();

            if(TIA.expectNewFrame) {
                TIA.nextFrame().then(() => {
                    requestAnimationFrame(this.handleRom);
                });
                console.log('NEW FRAME');
                break;
            };
        };
    };

    public processFile(file: any)  {
        console.log('Reading process started!');
        
        let reader = new RomReader(file, (rom: Uint8Array) => {
            RAM.readRom(rom);
            this.handleRom();
        });
    };
}
