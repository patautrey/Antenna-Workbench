// /HF-Workbench/js/boost-engine.js
// Performance layer for HF Workbench
// Caching, debouncing, parallelization, and precomputation

import { ModelingEngine } from "./modeling-engine.js";

export const BoostEngine = {

    cache: new Map(),
    debounceTimers: new Map(),

    // ------------------------------------------------------------
    // PUBLIC API
    // ------------------------------------------------------------
    async solve(geometry, options = {}) {
        const key = this._hash(geometry);

        // Cached result?
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        // Compute fresh
        const result = await ModelingEngine.solve(geometry, options);

        // Store in cache
        this.cache.set(key, result);

        return result;
    },

    // ------------------------------------------------------------
    // DEBOUNCE WRAPPER
    // ------------------------------------------------------------
    debounceSolve(id, geometry, options, delay = 150) {
        return new Promise(resolve => {
            if (this.debounceTimers.has(id)) {
                clearTimeout(this.debounceTimers.get(id));
            }

            const timer = setTimeout(async () => {
                const result = await this.solve(geometry, options);
                resolve(result);
            }, delay);

            this.debounceTimers.set(id, timer);
        });
    },

    // ------------------------------------------------------------
    // PRECOMPUTE SWEEP (SWR, Gain, ERP)
    // ------------------------------------------------------------
    async precomputeSweep(geometry, centerFreq, span = 0.3) {
        const f1 = centerFreq - span;
        const f2 = centerFreq;
        const f3 = centerFreq + span;

        const g1 = { ...geometry, frequencyMHz: f1 };
        const g2 = { ...geometry, frequencyMHz: f2 };
        const g3 = { ...geometry, frequencyMHz: f3 };

        const [r1, r2, r3] = await Promise.all([
            this.solve(g1),
            this.solve(g2),
            this.solve(g3)
        ]);

        return {
            freq: [f1, f2, f3],
            swr: [r1.swr.swr[1], r2.swr.swr[1], r3.swr.swr[1]],
            gain: [r1.gain.gain[1], r2.gain.gain[1], r3.gain.gain[1]],
            erp: [r1.erp.erp[1], r2.erp.erp[1], r3.erp.erp[1]]
        };
    },

    // ------------------------------------------------------------
    // HASH GEOMETRY FOR CACHE KEY
    // ------------------------------------------------------------
    _hash(obj) {
        return JSON.stringify(obj);
    }
};
