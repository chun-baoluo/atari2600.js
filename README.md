# Atari2600.js

This project is an attempt to emulate Atari2600 video game console.

Right now, the app is able to emulate some simple atari 2600 roms, for example from [here](http://khryssun.free.fr/programming_code.html#Sources_Background). Only .bin or .a26 formats are supported.

I hope I'll have enough time, patience and inspiration to finish it.

## Usage example

You'll need a canvas and a file input HTML element for this to work.

```js

    let canvas = document.getElementById('canvas');
    let app = new Atari2600.App(canvas);

    document.getElementById('fileinput').onchange = () => {
        let file = (document.getElementById('fileinput')).files[0];
        app.processFile(file);
    };

```

Then after you load a rom, your canvas will start rendering automatically.
