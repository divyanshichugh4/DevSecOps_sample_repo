/* ==========================================================================
   SOUND ENGINE - WEB AUDIO API SYNTHESIZER
   ========================================================================== */

export class SoundEngine {
    constructor() {
        this.enabled = true;
        this.ctx = null;
    }

    _initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
    }

    playClick() {
        if (!this.enabled) return;
        this._initContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
            osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.04);
        } catch (e) {
            // Audio context permission error silent catch
        }
    }

    playOperator() {
        if (!this.enabled) return;
        this._initContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(1174.66, this.ctx.currentTime + 0.06);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.06);
        } catch (e) {}
    }

    playEquals() {
        if (!this.enabled) return;
        this._initContext();
        if (!this.ctx) return;

        try {
            // Dual chord chime
            [523.25, 659.25, 783.99].forEach((freq, i) => { // C Major chord
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.03);

                gain.gain.setValueAtTime(0.1, this.ctx.currentTime + i * 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(this.ctx.currentTime + i * 0.03);
                osc.stop(this.ctx.currentTime + 0.25);
            });
        } catch (e) {}
    }

    playError() {
        if (!this.enabled) return;
        this._initContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (e) {}
    }
}
