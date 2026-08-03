/* ==========================================================================
   HISTORY ENGINE - CALCULATION LOG STORAGE & DRAWER MANAGER
   ========================================================================== */

export class HistoryEngine {
    constructor() {
        this.storageKey = 'antigravity_calc_history';
        this.items = this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        } catch (e) {}
    }

    add(expression, result) {
        if (!expression || expression.trim() === '' || result === 'Syntax Error') return;

        const newItem = {
            id: Date.now(),
            expression,
            result,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        this.items.unshift(newItem);
        if (this.items.length > 50) {
            this.items.pop(); // Keep last 50
        }
        this.save();
        this.render();
    }

    clear() {
        this.items = [];
        this.save();
        this.render();
    }

    render(onSelectCallback) {
        const listEl = document.getElementById('historyList');
        if (!listEl) return;

        if (this.items.length === 0) {
            listEl.innerHTML = '<div class="empty-history">No calculations recorded</div>';
            return;
        }

        listEl.innerHTML = '';
        this.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-expr">${item.expression}</div>
                <div class="history-res">= ${item.result}</div>
            `;
            div.addEventListener('click', () => {
                if (typeof onSelectCallback === 'function') {
                    onSelectCallback(item);
                }
            });
            listEl.appendChild(div);
        });
    }
}
