import { RomReader } from './RomReader';
import { CPU } from './CPU';
import { Register, RAM } from './RAM';
import { TIA } from './TIA';
import { PIA } from './PIA';
import { Colors }  from './Colors';

interface IOptions {
    colors?: string;
    imageRendering?: string;
};

export class App {

    constructor(canvas: HTMLCanvasElement, options: IOptions = {}) {
        this.handleRom = this.handleRom.bind(this);
        this.onCanvasDrop = this.onCanvasDrop.bind(this);

        canvas.style.setProperty('image-rendering', options.imageRendering || 'pixelated');
        canvas.addEventListener("dragover", (e: MouseEvent) => e.preventDefault());
        canvas.addEventListener('drop', this.onCanvasDrop);

        TIA.colorPalette = new Map(Colors[options.colors] || Colors['NTSC']);
        TIA.canvas = canvas;
        PIA.initInputs();
    };

    private handleRom(): void {
        TIA.nextFrame().then(() => {
            requestAnimationFrame(this.handleRom);
            console.log('NEW FRAME');
        });
    };

    private onCanvasDrop(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        this.processFile(e.dataTransfer.files[0]);
    };

    public processFile(file: File): void  {
        console.log('Reading process started!');

        let reader = new RomReader(file, (banks: Array<Uint8Array>, type: string) => {
            RAM.readRom(banks, type);
            this.handleRom();
        });
    };
}
