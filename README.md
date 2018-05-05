# Atari2600.js

This project is an attempt to emulate Atari 2600 video game console. The work is in progress. I hope I'll have enough time, patience and inspiration to finish it.

Right now, the app is able to properly emulate only simple Atari 2600 roms, for example from [here](http://khryssun.free.fr/programming_code.html#Sources_Background). A lot of actual games are somewhat playable, like Texas Chainsaw Massacre, however Player, Ball and Missile graphics maybe a little messed up.

You can check out the latest build [here](https://star-collector.github.io/atari2600.js/). Do not forget to bring your own roms!

## Installation

```sh

	$ npm install atari2600.js

```

## Usage example

You'll need a canvas and a file input HTML elements for this to work.

```js
    import { Atari2600 } from 'atari2600.js';
    // or in case of node-like require: let Atari2600 = require('atari2600.js');
    // or in case of inclusion with a <script> tag: let Atari2600 = atari2600.App;

    let canvas = document.getElementById('canvas');
    let app = new Atari2600(canvas, {
        colors: 'NTSC' // optional (possible values - NTSC, PAL or SECAM, default - NTSC)
        imageRendering: 'pixelated' // optional (values are the same as in image-rendering CSS property, default - pixelated)
    });
    let fileinput = document.getElementById('fileinput');

    fileinput.onchange = () => {
        let file = fileinput.files[0];
        app.processFile(file);
    };

```

Then after you load a rom, your canvas will start rendering automatically.

## Controls

First joystick: Arrow Keys + Ctrl.  
Second joystick: WASD + Shift.  

Reset Button: /  
Select Button: .  
P0 Difficulty Switch: ,  
P1 Difficulty Switch: m  
