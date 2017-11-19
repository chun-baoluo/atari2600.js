import { Register, Rom } from './RAM';
import { Opcode } from './Opcode';

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
		if(!this.locked && this.cycle == 0) {;
			Opcode[Rom.data[Register.PC++]]();
		}
		this.cycle--;
	};

	public static setCycle(val: number) {
		this.cycle = val;
	};
};
