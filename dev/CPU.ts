import { Register, RAM } from './RAM';
import { Opcode } from './Opcode';
import { PIA } from './PIA';

export class CPU {
	private static _locked: boolean = false;

	private static _cycle: number = 0;

	public static lock() {
		this._locked = true;
	};

	public static unlock() {
		this._locked = false;
	};

	public static pulse() {
		if(this._locked) {
			return false;
		};

		if(this._cycle <= 0) {
			try {
				// console.log(RAM.rom(Register.PC).toString(16));
				this._cycle = Opcode[RAM.rom(Register.PC)]();
			} catch(e) {
				console.log('Error', RAM.rom(Register.PC).toString(16), Register.PC);
				throw e;
			}
			Register.PC++;
		};
		PIA.tick();
		this._cycle--;

	};
};
