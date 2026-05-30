// /HF-Workbench/js/modeling-engine.js
// Hybrid Modeling Engine: Analytical + NEC-2 WASM

import { NEC } from "./nec-engine.js";

/*
    Public API:
    ModelingEngine.solve(geometry, options)
    → returns high-resolution radiation data:
        {
            elevation: { angles: [...], gain: [...] },
            azimuth:   { angles: [...], gain: [...] },
            swr:       { freq: [...], swr: [...] },
            gain:      { freq: [...], gain: [...] },
            erp:       { freq: [...], erp: [...] }
        }
*/

export const ModelingEngine = {

    async solve(geometry, options = {}) {
        // Decide which engine to use
        const useNEC = this._shouldUseNEC(geometry);

        if (useNEC) {
            return await this._runNEC(geometry, options);
        } else {
            return this._runAnalytical(geometry, options);
        }
    },

    // ------------------------------------------------------------
    // ENGINE SELECTION LOGIC
    // ------------------------------------------------------------
    _shouldUseNEC(geometry) {
        // NEC is used for:
        // - loops
        // - skyloops
        // - arrays
        // - loading coils
        // - cap hats
        // - non-vertical geometries
        // - multi-element systems

        if (geometry.type === "loop") return true;
        if (geometry.type === "skyloop") return true;
        if (geometry.elements && geometry.elements > 1) return true;
        if (geometry.loadingCoil?.enabled) return true;
        if (geometry.capHat?.enabled) return true;
        if (geometry.array) return true;

        // Simple verticals and dipoles use analytical engine
        return false;
    },

    // ------------------------------------------------------------
    // NEC-2 ENGINE
    // ------------------------------------------------------------
    async _runNEC(geometry, options) {
        const nec = await NEC.load();

        const necInput = NEC.buildCards(geometry, options);
        const necOutput = await nec.run(necInput);

        return {
            elevation: {
                angles: necOutput.elevation.angles,
                gain: necOutput.elevation.gain
            },
            azimuth: {
                angles: necOutput.azimuth.angles,
                gain: necOutput.azimuth.gain
            },
            swr: {
                freq: necOutput.swr.freq,
                swr: necOutput.swr.swr
            },
            gain: {
                freq: necOutput.gain.freq,
                gain: necOutput.gain.gain
            },
            erp: {
                freq: necOutput.erp.freq,
                erp: necOutput.erp.erp
            }
        };
    },

    // ------------------------------------------------------------
    // ANALYTICAL ENGINE
    // ------------------------------------------------------------
    _runAnalytical(geometry, options) {
        const freq = geometry.frequencyMHz;
        const lambda = 300 / freq;

        // High-resolution angle arrays
        const elevAngles = Array.from({ length: 721 }, (_, i) => i * 0.25);
        const azAngles   = Array.from({ length: 1441 }, (_, i) => i * 0.25);

        // Simple analytical patterns
        const elevGain = elevAngles.map(a => {
            const rad = a * Math.PI / 180;
            return 10 * Math.log10(Math.abs(Math.sin(rad)) + 0.001);
        });

        const azGain = azAngles.map(a => {
            const rad = a * Math.PI / 180;
            return 10 * Math.log10(1 + 0.5 * Math.cos(rad));
        });

        // Frequency sweep
        const sweep = [
            freq - 0.15,
            freq,
            freq + 0.15
        ];

        const swr = sweep.map(f => 1.2 + 0.8 * Math.abs(f - freq));
        const gain = sweep.map(f => 2 + 0.5 * Math.cos((f - freq) * 10));
        const erp = gain.map(g => 100 * Math.pow(10, g / 10));

        return {
            elevation: { angles: elevAngles, gain: elevGain },
            azimuth:   { angles: azAngles, gain: azGain },
            swr:       { freq: sweep, swr },
            gain:      { freq: sweep, gain },
            erp:       { freq: sweep, erp }
        };
    }
};
