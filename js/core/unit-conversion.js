/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Unit Conversion Engine
   ============================================================ */

console.log("unit-conversion.js loaded");

/* ------------------------------------------------------------
   Length Conversions
   ------------------------------------------------------------ */

export function metersToFeet(m) {
    return m * 3.28084;
}

export function feetToMeters(ft) {
    return ft / 3.28084;
}

export function cmToInches(cm) {
    return cm * 0.393701;
}

export function inchesToCm(in) {
    return in / 0.393701;
}

/* ------------------------------------------------------------
   Frequency / Wavelength
   ------------------------------------------------------------ */

export function mhzToWavelength(mhz) {
    // λ = 300 / MHz
    return 300 / mhz;
}

export function wavelengthToMhz(lambda) {
    // MHz = 300 / λ
    return 300 / lambda;
}

/* ------------------------------------------------------------
   Dual‑Unit Helpers
   ------------------------------------------------------------ */

export function formatMetersFeet(m) {
    const ft = metersToFeet(m);
    return `${m.toFixed(3)} m (${ft.toFixed(2)} ft)`;
}

export function formatCmInches(cm) {
    const inches = cmToInches(cm);
    return `${cm.toFixed(1)} cm (${inches.toFixed(2)} in)`;
}

export function formatWavelength(mhz) {
    const lambda = mhzToWavelength(mhz);
    return `${lambda.toFixed(3)} m wavelength`;
}
