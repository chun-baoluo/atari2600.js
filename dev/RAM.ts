import { PIA } from './PIA';
import { CPU } from './CPU';
import { Convert } from './Common';
import { TIA } from './TIA';

export class Register {
	public static A: number = 0; // Accumulator
	public static P: number = 0; // Processor Counter
	public static PC: number = 61440; // Program Counter
	public static S: number = 0xFF; // Stack Pointer
	public static X: number = 0; // Index Register X
	public static Y: number = 0; // Index Register Y
};

export class Flag {
	public static B: number = 0; // Break flag
	public static C: number = 0; // Carry
	public static D: number = 1; // Decimal mode
	public static I: number = 0; // Interrupt disable bit
	public static N: number = 0; // Negative/Sign
	public static V: number = 0; // Overflow
	public static Z: number = 0; // Zero
};

export class RAM {
	public static memory: Uint8Array = new Uint8Array(65536);

	public static romSize: number = null;

	public static get(address: number) {
		return this.memory[address];
	};

	public static read(address: number) {
		let value: number = this.memory[address];

		if(this[address] !== undefined) {
			this[address]();
		};

		return value;
	};

	public static readRom(rom: Uint8Array) {
		this.reset();

		this.romSize = rom.length;

		this.memory = new Uint8Array(61440 + rom.length);

		this.memory[0x284] = (Math.random() * 255) >> 0;
		this.memory[0x294] = (Math.random() * 255) >> 0;
		this.memory[0x295] = (Math.random() * 255) >> 0;
		this.memory[0x296] = (Math.random() * 255) >> 0;
		this.memory[0x297] = (Math.random() * 255) >> 0;

		this.memory.set(rom, 61440);
	};

	public static reset() {
		this.memory = new Uint8Array(65536);
	};

	public static set(address: number, value: number) {
		this.memory[address] = value;

		return this.memory[address];
	};

	public static write(address: number, value: number) {
		if(this[address] !== undefined) {
			value = this[address](value);
		};

		this.memory[address] = value;

		return this.memory[address];
	};

	// VSYNC write
	private static 0x00(value: number) {
		if(value === undefined) return;
		if(Convert.toBin(this.memory[0x00]).charAt(6) == '0' && Convert.toBin(value).charAt(6) == '1') {
			TIA.expectNewFrame = true;
		};
		return value;
	};

	// WSYNC write
	private static 0x02(value: number) {
		if(value === undefined) return;
		CPU.lock();
		return value;
	};

	// NUSIZ0 write
	private static 0x04(value: number) {
		if(value === undefined) return;
		TIA.p0.nusiz = parseInt(Convert.toBin(value).substring(5, 7), 2);
		return value;
	};

	// NUSIZ1 write
	private static 0x05(value: number) {
		if(value === undefined) return;
		TIA.p1.nusiz = parseInt(Convert.toBin(value).substring(5, 7), 2);
		return value;
	};

	// COLUP0 write
	private static 0x06(value: number) {
		if(value === undefined) return;
		let colup0: Array<number> = Convert.toColorArray(TIA.color(Convert.toBin(value)));
		TIA.pf.colup0 = colup0;
		TIA.p0.colup = colup0;
		return value;
	};

	// COLUP1 write
	private static 0x07(value: number) {
		if(value === undefined) return;
		let colup1: Array<number> = Convert.toColorArray(TIA.color(Convert.toBin(value)));
		TIA.pf.colup1 = colup1;
		TIA.p1.colup = colup1;
		return value;
	};

	// COLUPF write
	private static 0x08(value: number) {
		if(value === undefined) return;
		TIA.pf.colupf = Convert.toColorArray(TIA.color(Convert.toBin(value)));
		return value;
	};

	// COLUBK write
	private static 0x09(value: number) {
		if(value === undefined) return;
		TIA.bk.colubk = Convert.toColorArray(TIA.color(Convert.toBin(value)));
		return value;
	};

	// CTRLPF  write
	private static 0x0A(value: number) {
		if(value === undefined) return;
		let ctrlpf: Array<string> = Convert.toBin(value).split('');
		TIA.pf.ctrlpf = ctrlpf;
		TIA.pf.reflect = (ctrlpf[7] == '1');
		TIA.pf.scoreMode = (ctrlpf[6] == '1' && ctrlpf[5] == '0');
		return value;
	};

	// PF0 write
	private static 0x0D(value: number) {
		if(value === undefined) return;
		TIA.pf.pf0 = Convert.toBin(value).split('').reverse();
		return value;
	};

	// PF1 write
	private static 0x0E(value: number) {
		if(value === undefined) return;
		TIA.pf.pf1 = Convert.toBin(value).split('').reverse();
		return value;
	};

	// PF2 write
	private static 0x0F(value: number) {
		if(value === undefined) return;
		TIA.pf.pf2 = Convert.toBin(value).split('').reverse();
		return value;
	};

	// RESP0 write
	private static 0x10(value: number) {
		if(value === undefined) return;
		TIA.resp0 = true;
		return value;
	};

	// RESP1 write
	private static 0x11(value: number) {
		if(value === undefined) return;
		TIA.resp1 = true;
		return value;
	};

	// GRP0 write
	private static 0x1B(value: number) {
		if(value === undefined) return;
		TIA.p0.grp = Convert.toBin(value).split('');
		return value;
	};

	// GRP1 write
	private static 0x1C(value: number) {
		if(value === undefined) return;
		TIA.p1.grp = Convert.toBin(value).split('');
		return value;
	};

	// INSTAT read
	private static 0x285() {
		let bits: Array<string> = Convert.toBin(this.memory[0x285]).split('');
		bits[1] = '0';
		this.memory[0x285] = parseInt(bits.join(''), 2)
		return this.memory[0x285];
	};

	// TIM1T write
	private static 0x294(value: number) {
		if(value === undefined) return;
		let bits: Array<string> = Convert.toBin(this.memory[0x285]).split('');

		value = new Uint8Array([value - 1])[0];
		bits[0] = '0';
		this.memory[0x294] = value;
		PIA.setTimer(0x294);

		return value;
	};

	// TIM8T write
	private static 0x295(value: number) {
		if(value === undefined) return;
		let bits: Array<string> = Convert.toBin(this.memory[0x285]).split('');

		value = new Uint8Array([value - 1])[0];
		bits[0] = '0';
		this.memory[0x295] = value;
		PIA.setTimer(0x295);

		return value;
	};

	// TIM64T write
	private static 0x296(value: number) {
		if(value === undefined) return;
		let bits: Array<string> = Convert.toBin(this.memory[0x285]).split('');

		value = new Uint8Array([value - 1])[0];
		bits[0] = '0';
		this.memory[0x296] = value;
		PIA.setTimer(0x296);

		return value;
	};

	// TIM1024T write
	private static 0x297(value: number) {
		if(value === undefined) return;
		let bits: Array<string> = Convert.toBin(this.memory[0x285]).split('');

		value = new Uint8Array([value - 1])[0];
		bits[0] = '0';
		this.memory[0x297] = value;
		PIA.setTimer(0x297);

		return value;
	};
};
