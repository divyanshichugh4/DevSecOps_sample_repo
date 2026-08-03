// Simple Calculator JavaScript Logic

let currentExpression = '';
let currentResult = '0';
let shouldResetDisplay = false;

const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

function updateDisplay() {
    expressionEl.textContent = currentExpression;
    resultEl.textContent = currentResult;
}

function appendNumber(num) {
    if (shouldResetDisplay) {
        currentExpression = '';
        currentResult = '0';
        shouldResetDisplay = false;
    }

    if (num === '.' && currentExpression.slice(-1) === '.') return;

    currentExpression += num;
    calculatePreview();
}

function appendOperator(op) {
    shouldResetDisplay = false;
    if (currentExpression === '' && currentResult !== '0') {
        currentExpression = currentResult;
    }

    const lastChar = currentExpression.trim().slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
        currentExpression = currentExpression.trim().slice(0, -1) + op;
    } else if (currentExpression !== '') {
        currentExpression += ' ' + op + ' ';
    }
    updateDisplay();
}

function clearAll() {
    currentExpression = '';
    currentResult = '0';
    shouldResetDisplay = false;
    updateDisplay();
}

function clearEntry() {
    currentExpression = '';
    updateDisplay();
}

function backspace() {
    if (currentExpression.length > 0) {
        currentExpression = currentExpression.trimEnd();
        currentExpression = currentExpression.slice(0, -1).trimEnd();
        calculatePreview();
    }
}

function toggleSign() {
    if (currentExpression !== '') {
        if (currentExpression.startsWith('-')) {
            currentExpression = currentExpression.slice(1);
        } else {
            currentExpression = '-' + currentExpression;
        }
        calculatePreview();
    }
}

function calculatePreview() {
    try {
        if (currentExpression.trim() === '') {
            currentResult = '0';
        } else {
            let expr = currentExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
            let res = Function('"use strict";return (' + expr + ')')();
            if (res !== undefined && !isNaN(res) && isFinite(res)) {
                // Round to max 8 decimal places if needed
                currentResult = String(Math.round(res * 1e8) / 1e8);
            }
        }
    } catch (e) {
        // Syntax incomplete during typing
    }
    updateDisplay();
}

function calculateResult() {
    if (!currentExpression) return;
    try {
        let expr = currentExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        let res = Function('"use strict";return (' + expr + ')')();
        if (res !== undefined && !isNaN(res) && isFinite(res)) {
            currentResult = String(Math.round(res * 1e8) / 1e8);
            currentExpression = currentExpression + ' =';
            shouldResetDisplay = true;
        } else {
            currentResult = 'Error';
        }
    } catch (e) {
        currentResult = 'Error';
    }
    updateDisplay();
}

// Event Listeners for Buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const num = btn.getAttribute('data-num');
        const op = btn.getAttribute('data-op');
        const action = btn.getAttribute('data-action');

        if (num !== null) appendNumber(num);
        else if (op !== null) appendOperator(op);
        else if (action) {
            switch (action) {
                case 'clear-all': clearAll(); break;
                case 'clear-entry': clearEntry(); break;
                case 'backspace': backspace(); break;
                case 'toggle-sign': toggleSign(); break;
                case 'equals': calculateResult(); break;
            }
        }
    });
});

// Keyboard Controls
window.addEventListener('keydown', (e) => {
    const key = e.key;

    if (key >= '0' && key <= '9') appendNumber(key);
    else if (key === '.') appendNumber('.');
    else if (key === '+') appendOperator('+');
    else if (key === '-') appendOperator('-');
    else if (key === '*') appendOperator('*');
    else if (key === '/') appendOperator('/');
    else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculateResult();
    } else if (key === 'Backspace') backspace();
    else if (key === 'Escape') clearAll();
});
