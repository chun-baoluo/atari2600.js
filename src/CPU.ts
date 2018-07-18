import { Register, RAM } from './RAM';
import { Opcode } from './Opcode';
import { PIA } from './PIA';

export class CPU {
	private static _locked: boolean = false;

	private static _cycle: number = 0;

	public static lock(): void {
		this._locked = true;
	};

	public static unlock(): void {
		this._locked = false;
	};

	public static pulse(): void {
		PIA.tick();
		if(this._locked) {
			return;
		};

		if(this._cycle <= 0) {
			try {
				// console.log(RAM.get(Register.PC).toString(16), Register.PC.toString(16));
				this._cycle = Opcode[RAM.get(Register.PC)]();
			} catch(e) {
				console.log('Error', RAM.get(Register.PC).toString(16), Register.PC.toString(16));
				throw e;
			};
			Register.PC++;
		};
		this._cycle--;

	};
};
