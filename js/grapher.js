/* ==========================================================================
   GRAPHER ENGINE - CANVAS 2D FUNCTION GRAPHING
   ========================================================================== */

export class GrapherEngine {
    constructor(canvasId, tooltipId) {
        this.canvas = document.getElementById(canvasId);
        this.tooltip = document.getElementById(tooltipId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.expression = 'sin(x)';
        this.scale = 40; // Pixels per unit
        this.offsetX = 0; // Center offset X in pixels
        this.offsetY = 0; // Center offset Y in pixels

        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        if (this.canvas) {
            this._initCanvas();
            this._bindEvents();
        }
    }

    _initCanvas() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio || rect.width;
        this.canvas.height = rect.height * window.devicePixelRatio || rect.height;
        this.draw();
    }

    setExpression(expr) {
        this.expression = expr;
        this.draw();
    }

    zoomIn() {
        this.scale *= 1.25;
        this.draw();
    }

    zoomOut() {
        this.scale /= 1.25;
        if (this.scale < 5) this.scale = 5;
        this.draw();
    }

    resetView() {
        this.scale = 40;
        this.offsetX = 0;
        this.offsetY = 0;
        this.draw();
    }

    draw() {
        if (!this.ctx || !this.canvas) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        const centerX = w / 2 + this.offsetX;
        const centerY = h / 2 + this.offsetY;

        // 1. Draw Grid lines
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';

        const step = this.scale;
        const startX = centerX % step;
        for (let x = startX; x < w; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        const startY = centerY % step;
        for (let y = startY; y < h; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // 2. Draw Main Axes
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';

        // X Axis
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(w, centerY);
        ctx.stroke();

        // Y Axis
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, h);
        ctx.stroke();

        // Axis Tick Labels
        ctx.fillStyle = 'rgba(241, 245, 249, 0.5)';
        ctx.font = '11px Fira Code';
        ctx.textAlign = 'center';

        // X labels
        for (let x = startX; x < w; x += step * 2) {
            const mathX = ((x - centerX) / this.scale).toFixed(1);
            if (Math.abs(x - centerX) > 5) {
                ctx.fillText(mathX, x, centerY + 16);
            }
        }

        // 3. Plot Function Curve
        if (!this.expression) return;

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#ff007f';
        ctx.shadowColor = 'rgba(255, 0, 127, 0.5)';
        ctx.shadowBlur = 10;
        ctx.beginPath();

        let isDrawing = false;
        let compiled = null;

        try {
            if (typeof math !== 'undefined') {
                compiled = math.compile(this.expression);
            }
        } catch (e) {
            return;
        }

        for (let pixelX = 0; pixelX < w; pixelX += 2) {
            const xVal = (pixelX - centerX) / this.scale;
            let yVal;

            try {
                if (compiled) {
                    yVal = compiled.evaluate({ x: xVal });
                } else {
                    yVal = eval(this.expression.replace(/x/g, `(${xVal})`));
                }

                if (typeof yVal !== 'number' || isNaN(yVal) || !isFinite(yVal)) {
                    isDrawing = false;
                    continue;
                }

                const pixelY = centerY - yVal * this.scale;

                if (pixelY < -100 || pixelY > h + 100) {
                    isDrawing = false;
                    continue;
                }

                if (!isDrawing) {
                    ctx.moveTo(pixelX, pixelY);
                    isDrawing = true;
                } else {
                    ctx.lineTo(pixelX, pixelY);
                }
            } catch (e) {
                isDrawing = false;
            }
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow
    }

    _bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStartX = e.clientX - this.offsetX;
            this.dragStartY = e.clientY - this.offsetY;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.offsetX = e.clientX - this.dragStartX;
                this.offsetY = e.clientY - this.dragStartY;
                this.draw();
            }

            // Tooltip hover coordinates
            if (this.canvas && this.tooltip) {
                const rect = this.canvas.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {

                    const w = this.canvas.width;
                    const h = this.canvas.height;
                    const centerX = w / 2 + this.offsetX;
                    const centerY = h / 2 + this.offsetY;

                    const mouseCanvasX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
                    const mouseCanvasY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

                    const mathX = ((mouseCanvasX - centerX) / this.scale).toFixed(2);
                    const mathY = ((centerY - mouseCanvasY) / this.scale).toFixed(2);

                    this.tooltip.textContent = `x: ${mathX}, y: ${mathY}`;
                }
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        }, { passive: false });
    }
}
