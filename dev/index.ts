import { App } from './App';

let app = new App();

(<HTMLInputElement>document.getElementById('file')).onchange = () => app.processFile();
