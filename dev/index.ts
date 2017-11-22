import { App } from './App';

let app: App = new App();

(<HTMLInputElement>document.getElementById('file')).onchange = () => app.processFile();
