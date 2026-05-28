/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Doublet Lab
   ============================================================ */

import { wavelengthMeters } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { generatePoster } from "../core/poster-engine.js";

console.log("doublet-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function doubletLabUI() {
    return `
        <h2>Doublet Lab</h2>

        <div class="card">
            <label>Design Frequency (MHz):</label><br>
            <input id="dbl_freq" type="number" value="3.55" step="0.01"><br><br>

            <label>Bent‑Leg Angle (degrees):</label><br>
            <input id="dbl_angle" type="number" value="180" step="1"><br><br>

            <button class="btn-primary" onclick="runDoubletLab()">Analyze</button>
        </div>

        <div id="dbl_results"></div>
    `;
}

/* ------------------------------------------------------------
   Doublet Geometry
   ------------------------------------------------------------ */

/**
 * Classic doublet:
 * Total length ≈ 1/2 λ
 * Each leg ≈ 1/4 λ
 */
function doubletLegLength(freqMhz) {
    const lambda = wavelengthMeters(freqMhz);
    return lambda / 4;
}

/**
 * Bent‑leg effective length reduction:
 * L_eff = L * cos(angle/2)
 */
function bentLegEffectiveLength(legLength, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return legLength * Math.cos(rad / 2);
}

/**
 * Feedpoint impedance ranges (broad approximations)
 */
function doubletImpedance(freqMhz) {
    if (freqMhz < 5) return "High Z (150–600 Ω typical)";
    if (freqMhz < 10) return "Medium‑High Z (100–400 Ω)";
    if (freqMhz < 20) return "Medium Z (80–300 Ω)";
    return "Variable Z (60–300 Ω)";
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function doubletPoster(totalLengthMeters) {
    return generatePoster("dipole", { totalLengthMeters });
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runDoubletLab = function () {
    const freq = parseFloat(document.getElementById("dbl_freq").value);
    const angle = parseFloat(document.getElementById("dbl_angle").value);

    const leg = doubletLegLength(freq);
    const total = leg * 2;

    const effectiveLeg = bentLegEffectiveLength(leg, angle);
    const effectiveTotal = effectiveLeg * 2;

    const z = doubletImpedance(freq);

    const poster = doubletPoster(total);

    const html = `
        <div class="card">
            <h3>Doublet Geometry</h3>

            <strong>Design Frequency:</strong> ${freq} MHz<br><br>

            <strong>Leg Length (straight):</strong><br>
            ${formatLengthMetersFeet(leg)}<br><br>

            <strong>Total Length (straight):</strong><br>
            ${formatLengthMetersFeet(total)}<br><br>

            <strong>Bent‑Leg Angle:</strong> ${angle}°<br><br>

            <strong>Effective Leg Length:</strong><br>
            ${formatLengthMetersFeet(effectiveLeg)}<br><br>

            <strong>Effective Total Length:</strong><br>
            ${formatLengthMetersFeet(effectiveTotal)}<br><br>

            <strong>Feedpoint Impedance:</strong> ${z}<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("dbl_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Doublet Notes</h3>
        <p>A doublet is a multi‑band workhorse when fed with balanced line.</p>
        <p>Bent legs reduce effective electrical length but maintain pattern stability.</p>
        <p>Expect high impedance on lower bands — a wide‑range tuner is required.</p>
        <p>Best performance when legs are ≥ 1/4 λ at the lowest band.</p>
    `;
};
