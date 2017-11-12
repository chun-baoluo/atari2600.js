import Display from './Display';
import RomReader from './RomReader';

import Register from './Register';

export class App {
    processFile()  {

    	console.log('Reading process started!');

    	let file: any = (<HTMLInputElement>document.getElementById('file')).files[0];

        let reader = new RomReader(file, (rom: Uint8Array) => {
            console.log(rom);

            let canvas: any = document.getElementById('canvas');

            let display: any = new Display(canvas);

            display.nextFrame().then(() => {
                console.log('REGISTER ', Register.A);
            });

        });
    };
}
