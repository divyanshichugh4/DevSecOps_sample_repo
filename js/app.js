/* ==========================================================================
   APP MAIN CONTROLLER - ANTIGRAVITY CALCULATOR PRO
   ========================================================================== */

import { MathEngine } from './mathEngine.js';
import { SoundEngine } from './soundEngine.js';
import { GrapherEngine } from './grapher.js';
import { ProgrammerEngine } from './programmer.js';
import { ConverterController } from './converter.js';
import { HistoryEngine } from './history.js';

class CalculatorApp {
    constructor() {
        this.math = new MathEngine();
        this.sound = new SoundEngine();
        this.grapher = null;
        this.programmer = new ProgrammerEngine();
        this.converter = new ConverterController();
        this.history = new HistoryEngine();

        this.expression = '';
        this.currentMode = 'standard'; // standard, scientific, graphing, programmer, converter

        this.initDOM();
        this.bindEvents();
        this.bindKeyboard();

        // Initialize Lucide icons if available
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    initDOM() {
        this.displayExprEl = document.getElementById('displayExpression');
        this.displayResEl = document.getElementById('displayResult');
        this.angleBadgeEl = document.getElementById('angleUnitBadge');
        this.memoryBadgeEl = document.getElementById('memoryBadge');
        this.baseBadgeEl = document.getElementById('baseBadge');

        this.historyDrawer = document.getElementById('historyDrawer');
        this.scientificKeypad = document.getElementById('scientificKeypad');

        // Init grapher canvas
        this.grapher = new GrapherEngine('graphCanvas', 'graphHoverCoords');

        // Init converter UI
        this.converter.initUI();
        this.updateConverter();

        // Init programmer grid
        this.initBitGrid();

        // Render initial history
        this.history.render((item) => {
            this.expression = item.expression;
            this.updateDisplay(item.result);
            this.toggleHistoryDrawer(false);
        });
    }

    bindEvents() {
        // 1. Mode Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                this.switchMode(mode);
                this.sound.playClick();
            });
        });

        // 2. Theme Selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                document.body.className = e.target.value;
                this.sound.playClick();
            });
        }

        // 3. Sound Toggle
        const soundBtn = document.getElementById('soundToggleBtn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.sound.enabled = !this.sound.enabled;
                soundBtn.classList.toggle('active', this.sound.enabled);
                const icon = document.getElementById('soundIcon');
                if (icon) {
                    icon.setAttribute('data-lucide', this.sound.enabled ? 'volume-2' : 'volume-x');
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        }

        // 4. History Drawer Toggle
        const histToggleBtn = document.getElementById('historyToggleBtn');
        const closeHistBtn = document.getElementById('closeHistoryBtn');
        const clearHistBtn = document.getElementById('clearHistoryBtn');

        if (histToggleBtn) histToggleBtn.addEventListener('click', () => this.toggleHistoryDrawer());
        if (closeHistBtn) closeHistBtn.addEventListener('click', () => this.toggleHistoryDrawer(false));
        if (clearHistBtn) clearHistBtn.addEventListener('click', () => {
            this.history.clear();
            this.sound.playOperator();
        });

        // 5. Calculator Keypad Buttons
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleKeyClick(btn);
            });
        });

        // 6. Grapher Toolbar Events
        const plotBtn = document.getElementById('plotBtn');
        const graphFnInput = document.getElementById('graphFnInput');
        if (plotBtn && graphFnInput) {
            plotBtn.addEventListener('click', () => {
                this.grapher.setExpression(graphFnInput.value);
                this.sound.playOperator();
            });
            graphFnInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.grapher.setExpression(graphFnInput.value);
                    this.sound.playEquals();
                }
            });
        }

        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const fn = chip.getAttribute('data-fn');
                if (graphFnInput) graphFnInput.value = fn;
                this.grapher.setExpression(fn);
                this.sound.playClick();
            });
        });

        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetGraphBtn = document.getElementById('resetGraphBtn');
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => { this.grapher.zoomIn(); this.sound.playClick(); });
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { this.grapher.zoomOut(); this.sound.playClick(); });
        if (resetGraphBtn) resetGraphBtn.addEventListener('click', () => { this.grapher.resetView(); this.sound.playClick(); });

        // 7. Converter Events
        const catBtns = document.querySelectorAll('.cat-btn');
        catBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                catBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.converter.setCategory(btn.getAttribute('data-cat'));
                this.updateConverter();
                this.sound.playClick();
            });
        });

        const convInput = document.getElementById('convValFrom');
        const selectFrom = document.getElementById('convUnitFrom');
        const selectTo = document.getElementById('convUnitTo');
        const swapBtn = document.getElementById('convSwapBtn');

        if (convInput) convInput.addEventListener('input', () => this.updateConverter());
        if (selectFrom) selectFrom.addEventListener('change', () => this.updateConverter());
        if (selectTo) selectTo.addEventListener('change', () => this.updateConverter());
        if (swapBtn) swapBtn.addEventListener('click', () => {
            this.converter.swap();
            this.updateConverter();
            this.sound.playClick();
        });
    }

    bindKeyboard() {
        window.addEventListener('keydown', (e) => {
            // Ignore keyboard shortcuts if typing in text inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

            const key = e.key;

            if (key >= '0' && key <= '9') {
                this.insertText(key);
                this.sound.playClick();
            } else if (key === '.') {
                this.insertText('.');
                this.sound.playClick();
            } else if (['+', '-', '*', '/', '%', '^', '(', ')'].includes(key)) {
                let mappedOp = key;
                if (key === '*') mappedOp = ' * ';
                if (key === '/') mappedOp = ' / ';
                if (key === '+') mappedOp = ' + ';
                if (key === '-') mappedOp = ' - ';
                this.insertText(mappedOp);
                this.sound.playOperator();
            } else if (key === 'Enter' || key === '=') {
                e.preventDefault();
                this.calculateResult();
            } else if (key === 'Backspace') {
                this.backspace();
                this.sound.playClick();
            } else if (key === 'Escape') {
                this.clearAll();
                this.sound.playOperator();
            }
        });
    }

    switchMode(mode) {
        this.currentMode = mode;

        // Update Nav Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const isActive = btn.getAttribute('data-mode') === mode;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        // Hide/Show Panels
        const calcPadView = document.getElementById('calcPadView');
        const graphingView = document.getElementById('graphingView');
        const programmerView = document.getElementById('programmerView');
        const converterView = document.getElementById('converterView');
        const displaySection = document.getElementById('displaySection');

        calcPadView.classList.add('hidden-panel');
        graphingView.classList.add('hidden-panel');
        programmerView.classList.add('hidden-panel');
        converterView.classList.add('hidden-panel');

        // Reset display badges
        this.baseBadgeEl.classList.add('hidden');

        if (mode === 'standard') {
            displaySection.style.display = 'flex';
            calcPadView.classList.remove('hidden-panel');
            this.scientificKeypad.classList.add('hidden');
        } else if (mode === 'scientific') {
            displaySection.style.display = 'flex';
            calcPadView.classList.remove('hidden-panel');
            this.scientificKeypad.classList.remove('hidden');
        } else if (mode === 'graphing') {
            displaySection.style.display = 'none';
            graphingView.classList.remove('hidden-panel');
            this.grapher.resize();
        } else if (mode === 'programmer') {
            displaySection.style.display = 'flex';
            programmerView.classList.remove('hidden-panel');
            this.baseBadgeEl.classList.remove('hidden');
            this.updateProgrammerDisplays();
        } else if (mode === 'converter') {
            displaySection.style.display = 'none';
            converterView.classList.remove('hidden-panel');
        }
    }

    handleKeyClick(btn) {
        const insert = btn.getAttribute('data-insert');
        const action = btn.getAttribute('data-action');

        if (insert !== null) {
            this.insertText(insert);
            this.sound.playClick();
        } else if (action) {
            switch (action) {
                case 'clear-all':
                    this.clearAll();
                    this.sound.playOperator();
                    break;
                case 'backspace':
                    this.backspace();
                    this.sound.playClick();
                    break;
                case 'equals':
                    this.calculateResult();
                    break;
                case 'negate':
                    this.toggleNegate();
                    this.sound.playClick();
                    break;
                case 'deg-rad':
                    const unit = this.math.toggleAngleUnit();
                    this.angleBadgeEl.textContent = unit;
                    const degBtn = document.getElementById('degRadToggle');
                    if (degBtn) degBtn.textContent = unit;
                    this.sound.playClick();
                    break;
                case 'mc':
                    this.math.memoryClear();
                    this.memoryBadgeEl.classList.add('hidden');
                    this.sound.playClick();
                    break;
                case 'mr':
                    this.insertText(this.math.memoryRecall());
                    this.sound.playClick();
                    break;
                case 'm-plus':
                    this.math.memoryAdd(this.displayResEl.textContent);
                    this.memoryBadgeEl.classList.remove('hidden');
                    this.sound.playClick();
                    break;
                case 'm-minus':
                    this.math.memorySubtract(this.displayResEl.textContent);
                    this.memoryBadgeEl.classList.remove('hidden');
                    this.sound.playClick();
                    break;
            }
        }
    }

    insertText(text) {
        this.expression += text;
        this.updateDisplay();
    }

    backspace() {
        if (this.expression.length > 0) {
            this.expression = this.expression.slice(0, -1);
            this.updateDisplay();
        }
    }

    clearAll() {
        this.expression = '';
        this.updateDisplay('0');
    }

    toggleNegate() {
        if (this.expression.startsWith('-')) {
            this.expression = this.expression.substring(1);
        } else {
            this.expression = '-' + this.expression;
        }
        this.updateDisplay();
    }

    calculateResult() {
        if (!this.expression) return;

        const res = this.math.evaluate(this.expression);

        if (res === 'Error' || res === 'Syntax Error') {
            this.sound.playError();
            this.updateDisplay(res);
        } else {
            this.sound.playEquals();
            this.history.add(this.expression, res);
            this.updateProgrammerFromVal(res);
            this.updateDisplay(res);
            this.expression = res; // Chain next calculation
        }
    }

    updateDisplay(resOverride = null) {
        this.displayExprEl.textContent = this.expression;

        if (resOverride !== null) {
            this.displayResEl.textContent = resOverride;
        } else if (this.expression.trim() !== '') {
            // Live preview calculation
            const liveRes = this.math.evaluate(this.expression);
            if (liveRes !== 'Syntax Error' && liveRes !== 'Error') {
                this.displayResEl.textContent = liveRes;
                this.updateProgrammerFromVal(liveRes);
            }
        } else {
            this.displayResEl.textContent = '0';
        }
    }

    /* Programmer Mode Helpers */
    initBitGrid() {
        const grid = document.getElementById('bitGrid');
        if (!grid) return;
        grid.innerHTML = '';

        for (let i = 15; i >= 0; i--) {
            const cell = document.createElement('div');
            cell.className = 'bit-cell';
            cell.dataset.bit = i;
            cell.textContent = '0';
            cell.addEventListener('click', () => {
                const displays = this.programmer.toggleBit(i);
                this.renderProgrammerDisplays(displays);
                this.sound.playClick();
            });
            grid.appendChild(cell);
        }
    }

    updateProgrammerFromVal(valStr) {
        const displays = this.programmer.setValue(valStr);
        this.renderProgrammerDisplays(displays);
    }

    updateProgrammerDisplays() {
        const displays = this.programmer.getDisplays();
        this.renderProgrammerDisplays(displays);
    }

    renderProgrammerDisplays(displays) {
        if (!displays) return;
        const decVal = document.getElementById('decVal');
        const hexVal = document.getElementById('hexVal');
        const octVal = document.getElementById('octVal');
        const binVal = document.getElementById('binVal');

        if (decVal) decVal.textContent = displays.DEC;
        if (hexVal) hexVal.textContent = displays.HEX;
        if (octVal) octVal.textContent = displays.OCT;
        if (binVal) binVal.textContent = displays.BIN;

        // Update 16-bit grid visual
        const val = this.programmer.value;
        document.querySelectorAll('.bit-cell').forEach(cell => {
            const bit = parseInt(cell.dataset.bit, 10);
            const isOn = (val & (1 << bit)) !== 0;
            cell.classList.toggle('on', isOn);
            cell.textContent = isOn ? '1' : '0';
        });
    }

    /* Converter Mode Helpers */
    updateConverter() {
        const convInput = document.getElementById('convValFrom');
        const convResultInput = document.getElementById('convValTo');
        const formulaEl = document.getElementById('conversionFormula');

        if (convInput && convResultInput && formulaEl) {
            const data = this.converter.calculate(convInput.value);
            convResultInput.value = data.result;
            formulaEl.textContent = data.formula;
        }
    }

    /* History Drawer Toggle */
    toggleHistoryDrawer(open = null) {
        if (open === null) {
            this.historyDrawer.classList.toggle('open');
        } else if (open) {
            this.historyDrawer.classList.add('open');
        } else {
            this.historyDrawer.classList.remove('open');
        }
    }
}

// Instantiate App when DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CalculatorApp();
});
