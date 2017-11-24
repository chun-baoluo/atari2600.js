export class Register {
	public static A: number = 0; // Accumulator
	public static P: number = 0; // Processor Counter
	public static PC: number = 0; // Program Counter
	public static S: number = 0; // Stack Pointer
	public static X: number = 0; // Index Register X
	public static Y: number = 0; // Index Register Y
};

export class Flag {
	public static '-': number = 1; // Not used?
	public static B: number = 0; // Break flag
	public static C: number = 0; // Carry
	public static D: number = 1; // Decimal mode
	public static I: number = 0; // Interrupt disable bit
	public static N: number = 0; // Negative/Sign
	public static V: number = 0; // Overflow
	public static Z: number = 0; // Zero
};

export class RAM {
	private static memory: Uint8Array = new Uint8Array(65536);
	
	public static get(address: number) {
		return this.memory[address];
	};
	
	public static readRom(rom: Uint8Array) {
		this.memory[0x294] = (Math.random() * 255) >> 0;
		this.memory[0x295] = (Math.random() * 255) >> 0;
		this.memory[0x296] = (Math.random() * 255) >> 0;
		this.memory[0x297] = (Math.random() * 255) >> 0;
		
		this.memory.set(rom, 61440);
	};
	
	public static set(address: number, value: number) {
		this.memory[address] = value;
	};
};

export class Rom {
	public static data: Uint8Array = null;
	public static size: number = 0;
};
