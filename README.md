# Atari2600.js

This project is an attempt to emulate Atari2600 video game console.

Right now, the app is able to properly emulate only simple Atari 2600 roms, for example from [here](http://khryssun.free.fr/programming_code.html#Sources_Background). Some actual games are somewhat playable (if they load at all), like Texas Chainsaw Massacre, however Player, Ball and Missile graphics maybe a little messed up. Only .bin and .a26 formats are supported.

You can check out the latest build [here](https://star-collector.github.io/atari2600.js/). Do not forget to bring your own roms!

I hope I'll have enough time, patience and inspiration to finish it.

## Usage example

You'll need a canvas and a file input HTML elements for this to work.

```js

    let canvas = document.getElementById('canvas');
    let app = new Atari2600.App(canvas, {
        colors: 'NTSC' // optional (possible values - NTSC, PAL or SECAM, default - NTSC)
    });
    let fileinput = document.getElementById('fileinput');

    fileinput.onchange = () => {
        let file = fileinput.files[0];
        app.processFile(file);
    };

```

Then after you load a rom, your canvas will start rendering automatically.
