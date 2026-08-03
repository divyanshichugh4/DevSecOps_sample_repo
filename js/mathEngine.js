/* ==========================================================================
   MATH ENGINE - MATHJS EVALUATION & STATE WRAPPER
   ========================================================================== */

export class MathEngine {
    constructor() {
        this.angleUnit = 'DEG'; // 'DEG' or 'RAD'
        this.memory = 0;
        this.lastResult = null;
    }

    setAngleUnit(unit) {
        if (unit === 'DEG' || unit === 'RAD') {
            this.angleUnit = unit;
        }
    }

    toggleAngleUnit() {
        this.angleUnit = this.angleUnit === 'DEG' ? 'RAD' : 'DEG';
        return this.angleUnit;
    }

    /**
     * Evaluate mathematical expression string safely
     */
    evaluate(expression) {
        if (!expression || expression.trim() === '') return '0';

        try {
            // Preprocess expression for DEG vs RAD
            let sanitized = this._preprocessTrig(expression);
            
            // Evaluate with math.js if available, else fallback
            let result;
            if (typeof math !== 'undefined') {
                result = math.evaluate(sanitized);
            } else {
                result = eval(sanitized);
            }

            if (result === undefined || result === null || isNaN(result)) {
                return 'Error';
            }

            // Format result nicely
            let formatted = this._formatResult(result);
            this.lastResult = formatted;
            return formatted;

        } catch (err) {
            console.warn('Math evaluation error:', err);
            return 'Syntax Error';
        }
    }

    /**
     * Handle trigonometric conversion if in DEG mode
     */
    _preprocessTrig(expr) {
        let sanitized = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/π/g, 'pi');

        if (this.angleUnit === 'DEG') {
            // Replace sin(x), cos(x), tan(x) with sin(x deg), etc. if using mathjs
            sanitized = sanitized.replace(/(sin|cos|tan)\(([^)]+)\)/g, (match, fn, arg) => {
                return `${fn}((${arg}) * deg)`;
            });
        }
        return sanitized;
    }

    /**
     * Format numerical output with proper precision
     */
    _formatResult(num) {
        if (typeof num === 'object' && num.entries) {
            num = num.entries;
        }
        if (typeof num === 'number') {
            if (!isFinite(num)) return 'Infinity';
            // Round floating point inaccuracies (e.g. 0.1 + 0.2)
            let precisionResult = parseFloat(num.toFixed(10));
            return precisionResult.toString();
        }
        return String(num);
    }

    /* Memory Registers */
    memoryClear() {
        this.memory = 0;
        return this.memory;
    }

    memoryRecall() {
        return this.memory.toString();
    }

    memoryAdd(val) {
        let num = parseFloat(val) || 0;
        this.memory += num;
        return this.memory;
    }

    memorySubtract(val) {
        let num = parseFloat(val) || 0;
        this.memory -= num;
        return this.memory;
    }
}
