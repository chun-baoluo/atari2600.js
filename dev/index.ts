import { App } from './App';

var app = new App();

console.log(app.processFile);

(<HTMLInputElement>document.getElementById('file')).onchange = app.processFile;
