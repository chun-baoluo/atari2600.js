export class CPU {
	locked: boolean = false;

	cycle: number = 0;

	public lock() {
		this.locked = true;
	};

	public unlock() {
		this.locked = false;
	};

	public pulse() {
	};

	public setCycle(val: number) {
		this.cycle = val;
	};
};
