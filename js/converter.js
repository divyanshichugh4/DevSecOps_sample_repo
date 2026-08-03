/* ==========================================================================
   CONVERTER CONTROLLER - UI CONTROLLER FOR MEASUREMENT CONVERSIONS
   ========================================================================== */

import { UNIT_CATEGORIES, convertValue } from './unitData.js';

export class ConverterController {
    constructor() {
        this.currentCategory = 'length';
        this.unitFrom = 'm';
        this.unitTo = 'cm';
    }

    initUI() {
        this.renderUnits();
    }

    setCategory(catKey) {
        if (UNIT_CATEGORIES[catKey]) {
            this.currentCategory = catKey;
            const units = Object.keys(UNIT_CATEGORIES[catKey].units);
            this.unitFrom = units[0] || '';
            this.unitTo = units[1] || units[0] || '';
            this.renderUnits();
        }
    }

    renderUnits() {
        const cat = UNIT_CATEGORIES[this.currentCategory];
        if (!cat) return;

        const selectFrom = document.getElementById('convUnitFrom');
        const selectTo = document.getElementById('convUnitTo');

        if (!selectFrom || !selectTo) return;

        selectFrom.innerHTML = '';
        selectTo.innerHTML = '';

        Object.entries(cat.units).forEach(([key, obj]) => {
            const opt1 = document.createElement('option');
            opt1.value = key;
            opt1.textContent = obj.label;
            selectFrom.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = key;
            opt2.textContent = obj.label;
            selectTo.appendChild(opt2);
        });

        selectFrom.value = this.unitFrom;
        selectTo.value = this.unitTo;
    }

    calculate(inputVal) {
        const val = parseFloat(inputVal);
        if (isNaN(val)) return { result: 0, formula: '' };

        const selectFrom = document.getElementById('convUnitFrom');
        const selectTo = document.getElementById('convUnitTo');

        if (selectFrom) this.unitFrom = selectFrom.value;
        if (selectTo) this.unitTo = selectTo.value;

        const result = convertValue(val, this.currentCategory, this.unitFrom, this.unitTo);
        const catObj = UNIT_CATEGORIES[this.currentCategory];
        
        let fromLabel = catObj?.units[this.unitFrom]?.label || this.unitFrom;
        let toLabel = catObj?.units[this.unitTo]?.label || this.unitTo;

        let formulaText = `1 ${fromLabel} → ${convertValue(1, this.currentCategory, this.unitFrom, this.unitTo).toFixed(4)} ${toLabel}`;

        return {
            result: parseFloat(result.toFixed(6)),
            formula: formulaText
        };
    }

    swap() {
        const temp = this.unitFrom;
        this.unitFrom = this.unitTo;
        this.unitTo = temp;

        const selectFrom = document.getElementById('convUnitFrom');
        const selectTo = document.getElementById('convUnitTo');
        if (selectFrom && selectTo) {
            selectFrom.value = this.unitFrom;
            selectTo.value = this.unitTo;
        }
    }
}
