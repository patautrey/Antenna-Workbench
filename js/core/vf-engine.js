/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Velocity Factor & Electrical Length Engine
   ============================================================ */

console.log("vf-engine.js loaded");

/* ------------------------------------------------------------
   Electrical Length
   ------------------------------------------------------------ */

/**
 * Returns electrical length (in meters) for a given frequency.
 * λ = 300 / MHz
 */
export function wavelengthMeters(mhz) {
    return 300 / mhz;
}

/**
 * Returns electrical quarter-wave (in meters)
 */
export function quarterWave(mhz) {
    return wavelengthMeters(mhz) / 4;
}

/**
 * Returns electrical half-wave (in meters)
 */
export function halfWave(mhz) {
    return wavelengthMeters(mhz) / 2;
}

/* ------------------------------------------------------------
   Physical Length with Velocity Factor
   ------------------------------------------------------------ */

/**
 * Convert electrical length to physical length using VF.
 * physical = electrical * VF
 */
export function physicalLength(electricalMeters, vf) {
    return electricalMeters * vf;
}

/**
 * Coax trimming helper:
 * Given MHz + VF, return physical quarter-wave
 */
export function coaxQuarterWave(mhz, vf) {
    return quarterWave(mhz) * vf;
}

/**
 * Given MHz + VF, return physical half-wave
 */
export function coaxHalfWave(mhz, vf) {
    return halfWave(mhz) * vf;
}

/* ------------------------------------------------------------
   Formatting Helpers
   ------------------------------------------------------------ */

export function formatLengthMetersFeet(m) {
    const ft = m * 3.28084;
    return `${m.toFixed(3)} m (${ft.toFixed(2)} ft)`;
}

export function formatCoaxCut(mhz, vf) {
    const q = coaxQuarterWave(mhz, vf);
    const h = coaxHalfWave(mhz, vf);

    return `
        <div class="output-block">
            <strong>Quarter‑wave coax cut:</strong><br>
            ${formatLengthMetersFeet(q)}<br><br>

            <strong>Half‑wave coax cut:</strong><br>
            ${formatLengthMetersFeet(h)}
        </div>
    `;
}
