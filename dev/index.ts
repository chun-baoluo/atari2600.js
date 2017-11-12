import { App } from './app.ts';

var app = new App();

console.log(app.processFile);

(<HTMLInputElement>document.getElementById('file')).onchange = app.processFile;