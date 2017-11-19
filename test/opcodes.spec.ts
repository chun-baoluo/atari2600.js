import {} from 'mocha';
import {} from 'chai';

import { Opcode } from '../dev/Opcode';
import { Flag } from '../dev/RAM';

describe("Opcode", () => {
    beforeEach(() => {

    });

    it("(0x78) should set interrupt disable bit to 1", () => {
        Opcode[0x78]();

        chai.assert.strictEqual(Flag.I, 1);
    });
});
