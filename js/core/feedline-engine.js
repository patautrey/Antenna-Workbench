/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Feedline Loss & Power Engine
   ============================================================ */

console.log("feedline-engine.js loaded");

/* ------------------------------------------------------------
   Coax Loss Tables (dB per 100 ft)
   Values are typical mid‑band HF approximations
   ------------------------------------------------------------ */

const coaxLossDbPer100ft = {
    "RG-58": 1.5,
    "RG-8X": 1.1,
    "RG-213": 0.7,
    "LMR-240": 0.9,
    "LMR-400": 0.5,
    "LMR-600": 0.3
};

/* ------------------------------------------------------------
   Core Loss Functions
   ------------------------------------------------------------ */

/**
 * Returns coax loss in dB for a given length (ft) and coax type.
 */
export function coaxLossDb(lengthFt, type) {
    const lossPer100 = coaxLossDbPer100ft[type] || 1.0;
    return (lengthFt / 100) * lossPer100;
}

/**
 * Convert dB loss to power ratio.
 * P_out = P_in * 10^(-dB/10)
 */
export function dbToPowerRatio(db) {
    return Math.pow(10, -db / 10);
}

/**
 * Power delivered after coax loss.
 */
export function deliveredPower(inputWatts, lossDb) {
    return inputWatts * dbToPowerRatio(lossDb);
}

/* ------------------------------------------------------------
   SWR Mismatch Loss
   ------------------------------------------------------------ */

/**
 * Mismatch loss (dB) from SWR.
 * ML = -10 * log10( (1 - |Γ|^2) )
 * Γ = (SWR - 1) / (SWR + 1)
 */
export function mismatchLossDb(swr) {
    const gamma = (swr - 1) / (swr + 1);
    const ml = -10 * Math.log10(1 - gamma * gamma);
    return ml;
}

/* ------------------------------------------------------------
   Total System Loss
   ------------------------------------------------------------ */

export function totalSystemLossDb(coaxLoss, mismatchLoss) {
    return coaxLoss + mismatchLoss;
}

/**
 * Power delivered after coax + mismatch loss.
 */
export function finalDeliveredPower(inputWatts, coaxLoss, mismatchLoss) {
    const totalDb = totalSystemLossDb(coaxLoss, mismatchLoss);
    return deliveredPower(inputWatts, totalDb);
}

/* ------------------------------------------------------------
   ERP Calculation
   ------------------------------------------------------------ */

/**
 * ERP = P_delivered * antenna_gain_linear
 * antenna_gain_linear = 10^(gain_dBi / 10)
 */
export function computeErp(powerWatts, gainDbi) {
    const gainLinear = Math.pow(10, gainDbi / 10);
    return powerWatts * gainLinear;
}

/* ------------------------------------------------------------
   UI Output Block
   ------------------------------------------------------------ */

export function formatFeedlineReport({
    inputWatts,
    lengthFt,
    coaxType,
    swr,
    antennaGainDbi
}) {
    const coaxDb = coaxLossDb(lengthFt, coaxType);
    const mismatchDb = mismatchLossDb(swr);
    const totalDb = totalSystemLossDb(coaxDb, mismatchDb);

    const delivered = finalDeliveredPower(inputWatts, coaxDb, mismatchDb);
    const erp = computeErp(delivered, antennaGainDbi);

    return `
        <div class="output-block">
            <strong>Feedline Report</strong><br><br>

            <strong>Input Power:</strong> ${inputWatts.toFixed(1)} W<br>
            <strong>Coax Type:</strong> ${coaxType}<br>
            <strong>Length:</strong> ${lengthFt} ft<br><br>

            <strong>Coax Loss:</strong> ${coaxDb.toFixed(2)} dB<br>
            <strong>Mismatch Loss (SWR ${swr}):</strong> ${mismatchDb.toFixed(2)} dB<br>
            <strong>Total System Loss:</strong> ${totalDb.toFixed(2)} dB<br><br>

            <strong>Power Delivered to Antenna:</strong> ${delivered.toFixed(1)} W<br>
            <strong>Antenna Gain:</strong> ${antennaGainDbi.toFixed(1)} dBi<br>
            <strong>ERP:</strong> ${erp.toFixed(1)} W ERP
        </div>
    `;
}
