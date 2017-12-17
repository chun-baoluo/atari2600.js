import { Register, Rom } from './RAM';
import { Opcode } from './Opcode';
import { PIA } from './PIA';

export class CPU {
	private static locked: boolean = false;

	private static cycle: number = 0;

	public static lock() {
		this.locked = true;
	};

	public static unlock() {
		this.locked = false;
	};

	public static pulse() {
		if(this.locked) {
			return false;
		};

		if(this.cycle <= 0) {
			try {
				// console.log(Rom.data[Register.PC].toString(16));
				this.setCycle(Opcode[Rom.data[Register.PC]]());
			} catch(e) {
				console.log('Error', Rom.data[Register.PC].toString(16), Register.PC);
				throw e;
			}
			Register.PC++;
		};
		PIA.tick();
		this.cycle--;

	};

	public static setCycle(val: number) {
		this.cycle = val;
	};
};
