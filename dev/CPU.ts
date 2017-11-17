import { Register } from './RAM';

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
		if(!this.locked && this.cycle == 0) {
			
			Register.PC++;
		}
		this.cycle--;
	};

	public static setCycle(val: number) {
		this.cycle = val;
	};
};
