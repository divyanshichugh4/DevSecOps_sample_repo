/* ==========================================================================
   PROGRAMMER ENGINE - MULTI-BASE & BITWISE CONTROLLER
   ========================================================================== */

export class ProgrammerEngine {
    constructor() {
        this.value = 0; // Current 32-bit integer value
        this.activeBase = 'DEC'; // 'DEC', 'HEX', 'OCT', 'BIN'
    }

    setValue(val) {
        let parsed = parseInt(val, 10);
        if (isNaN(parsed)) parsed = 0;
        this.value = parsed >>> 0; // Ensure 32-bit unsigned representation
        return this.getDisplays();
    }

    setBase(base) {
        if (['DEC', 'HEX', 'OCT', 'BIN'].includes(base)) {
            this.activeBase = base;
        }
        return this.activeBase;
    }

    toggleBit(bitIndex) {
        if (bitIndex < 0 || bitIndex > 31) return;
        const mask = 1 << bitIndex;
        this.value = (this.value ^ mask) >>> 0;
        return this.getDisplays();
    }

    getDisplays() {
        const val = this.value;
        return {
            DEC: val.toString(10),
            HEX: val.toString(16).toUpperCase(),
            OCT: val.toString(8),
            BIN: this._formatBinary(val.toString(2).padStart(16, '0'))
        };
    }

    _formatBinary(binStr) {
        // Group binary digits into 4s e.g. 0000 1101 1010
        return binStr.replace(/(.{4})/g, '$1 ').trim();
    }

    evaluateBitwise(op, operand) {
        let a = this.value;
        let b = parseInt(operand, 10) || 0;
        let res = 0;

        switch (op) {
            case '&': res = a & b; break;
            case '|': res = a | b; break;
            case '^': res = a ^ b; break;
            case '~': res = ~a; break;
            case '<<': res = a << b; break;
            case '>>': res = a >> b; break;
            default: res = a; break;
        }
        this.value = res >>> 0;
        return this.getDisplays();
    }
}
