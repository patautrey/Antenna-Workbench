/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Coax Lab
   ============================================================ */

import { wavelengthMeters } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("coax-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function coaxLabUI() {
    return `
        <h2>Coax Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="coax_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Velocity Factor (0.50–0.99):</label><br>
            <input id="coax_vf" type="number" value="0.66" step="0.01"><br><br>

            <label>Coax Impedance (Ω):</label><br>
            <input id="coax_z" type="number" value="50"><br><br>

            <button class="btn-primary" onclick="runCoaxLab()">Analyze</button>
        </div>

        <div id="coax_results"></div>
    `;
}

/* ------------------------------------------------------------
   Coax Math
   ------------------------------------------------------------ */

/**
 * Electrical length:
 * L_elec = L_phys * VF
 */
function electricalLength(physMeters, vf) {
    return physMeters * vf;
}

/**
 * Quarter‑wave stub:
 * L_phys = (λ/4) * VF
 */
function quarterWaveStub(freqMhz, vf) {
    const lambda = wavelengthMeters(freqMhz);
    return (lambda / 4) * vf;
}

/**
 * Half‑wave stub:
 * L_phys = (λ/2) * VF
 */
function halfWaveStub(freqMhz, vf) {
    const lambda = wavelengthMeters(freqMhz);
    return (lambda / 2) * vf;
}

/**
 * Impedance transformation:
 * Z_in = Z0^2 / Z_load  (for 1/4‑wave stub)
 */
function quarterWaveTransform(z0, zLoad) {
    return (z0 * z0) / zLoad;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function coaxPoster(lengthMeters) {
    const px = lengthMeters * 40 + 200;

    const inner = `
        ${svgTitle("Coax Stub Diagram")}
        ${svgLabel("Coax Length: " + lengthMeters.toFixed(2) + " m", 20, 80)}
        ${svgLine(100, 300, px, 300, "#1e3a5f", 8)}
        ${svgLabel("Stub End", px - 40, 330)}
    `;

    return svgWrapper(inner, px + 100, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runCoaxLab = function () {
    const freq = parseFloat(document.getElementById("coax_freq").value);
    const vf = parseFloat(document.getElementById("coax_vf").value);
    const z0 = parseFloat(document.getElementById("coax_z").value);

    const q = quarterWaveStub(freq, vf);
    const h = halfWaveStub(freq, vf);

    // Example transformation: 50‑ohm line transforming 200‑ohm load
    const zTrans = quarterWaveTransform(z0, 200);

    const poster = coaxPoster(q);

    const html = `
        <div class="card">
            <h3>Coax Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <strong>Quarter‑Wave Stub (physical):</strong><br>
            ${formatLengthMetersFeet(q)}<br><br>

            <strong>Half‑Wave Stub (physical):</strong><br>
            ${formatLengthMetersFeet(h)}<br><br>

            <strong>Example Impedance Transform:</strong><br>
            50‑Ω line into 200‑Ω load → ${zTrans.toFixed(1)} Ω<br><br>

            <strong>Velocity Factor:</strong> ${vf}<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("coax_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Coax Notes</h3>
        <p>Velocity factor determines the physical length of resonant stubs.</p>
        <p>Quarter‑wave stubs invert impedance: Z_in = Z0² / Z_load.</p>
        <p>Half‑wave stubs repeat impedance: Z_in ≈ Z_load.</p>
        <p>Coax delay lines are powerful tools for matching and phasing.</p>
    `;
};
