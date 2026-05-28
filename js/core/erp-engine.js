/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   ERP / EIRP Engine
   ============================================================ */

console.log("erp-engine.js loaded");

/* ------------------------------------------------------------
   Gain Conversions
   ------------------------------------------------------------ */

/**
 * Convert dBi to dBd.
 * dBd = dBi - 2.15
 */
export function dBiToDbd(dBi) {
    return dBi - 2.15;
}

/**
 * Convert dBd to dBi.
 * dBi = dBd + 2.15
 */
export function dBdToDbi(dBd) {
    return dBd + 2.15;
}

/* ------------------------------------------------------------
   Linear Gain Conversion
   ------------------------------------------------------------ */

/**
 * Convert gain in dB to linear ratio.
 * G_linear = 10^(G_dB / 10)
 */
export function dbToLinear(db) {
    return Math.pow(10, db / 10);
}

/* ------------------------------------------------------------
   ERP / EIRP Calculations
   ------------------------------------------------------------ */

/**
 * ERP = P * G_linear(dBd)
 */
export function computeErp(powerWatts, gainDbd) {
    const gainLinear = dbToLinear(gainDbd);
    return powerWatts * gainLinear;
}

/**
 * EIRP = P * G_linear(dBi)
 */
export function computeEirp(powerWatts, gainDbi) {
    const gainLinear = dbToLinear(gainDbi);
    return powerWatts * gainLinear;
}

/* ------------------------------------------------------------
   UI Output Block
   ------------------------------------------------------------ */

export function formatErpReport({
    powerWatts,
    gainDbi
}) {
    const gainDbd = dBiToDbd(gainDbi);

    const erp = computeErp(powerWatts, gainDbd);
    const eirp = computeEirp(powerWatts, gainDbi);

    return `
        <div class="output-block">
            <strong>ERP / EIRP Report</strong><br><br>

            <strong>Input Power:</strong> ${powerWatts.toFixed(1)} W<br>
            <strong>Antenna Gain:</strong> ${gainDbi.toFixed(2)} dBi (${gainDbd.toFixed(2)} dBd)<br><br>

            <strong>ERP:</strong> ${erp.toFixed(1)} W ERP<br>
            <strong>EIRP:</strong> ${eirp.toFixed(1)} W EIRP
        </div>
    `;
}
