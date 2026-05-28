/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: EFHW Lab
   ============================================================ */

import { wavelengthMeters } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { generatePoster } from "../core/poster-engine.js";

console.log("efhw-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function efhwLabUI() {
    return `
        <h2>End‑Fed Half‑Wave (EFHW) Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="efhw_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Transformer Ratio:</label><br>
            <select id="efhw_ratio">
                <option value="49">49:1</option>
                <option value="64">64:1</option>
                <option value="81">81:1</option>
            </select><br><br>

            <button class="btn-primary" onclick="runEfwhLab()">Analyze</button>
        </div>

        <div id="efhw_results"></div>
    `;
}

/* ------------------------------------------------------------
   EFHW Geometry
   ------------------------------------------------------------ */

/**
 * EFHW wire length:
 * L ≈ λ/2 * shortening_factor
 * Typical shortening factor: 0.95 (end effects)
 */
function efhwWireLength(freqMhz) {
    const lambda = wavelengthMeters(freqMhz);
    return (lambda / 2) * 0.95;
}

/**
 * Feedpoint impedance approximations:
 * EFHW feedpoints are typically 2000–4000 Ω
 */
function efhwFeedpointImpedance() {
    return "2000–4000 Ω typical";
}

/**
 * Recommended transformer core mixes
 */
function recommendedMix(ratio) {
    if (ratio === 49) return "Mix 43 or Mix 52 (most common)";
    if (ratio === 64) return "Mix 43 (higher ratio for higher Z)";
    if (ratio === 81) return "Mix 52 (high‑Z, high‑voltage)";
    return "Unknown ratio";
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function efhwPoster(totalLengthMeters) {
    return generatePoster("dipole", { totalLengthMeters });
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runEfwhLab = function () {
    const freq = parseFloat(document.getElementById("efhw_freq").value);
    const ratio = parseInt(document.getElementById("efhw_ratio").value);

    const wire = efhwWireLength(freq);
    const z = efhwFeedpointImpedance();
    const mix = recommendedMix(ratio);

    const poster = efhwPoster(wire);

    const html = `
        <div class="card">
            <h3>EFHW Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <strong>Wire Length (half‑wave, shortened):</strong><br>
            ${formatLengthMetersFeet(wire)}<br><br>

            <strong>Feedpoint Impedance:</strong> ${z}<br><br>

            <strong>Transformer Ratio:</strong> ${ratio}:1<br>
            <strong>Recommended Core Mix:</strong> ${mix}<br><br>

            <strong>Voltage Note:</strong><br>
            EFHW feedpoints can exceed 2–3 kV at 100 W.<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("efhw_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>EFHW Notes</h3>
        <p>EFHW antennas provide multi‑band operation with minimal hardware.</p>
        <p>High feedpoint voltage requires careful transformer design.</p>
        <p>49:1 is the most common ratio for HF EFHW antennas.</p>
        <p>Wire length is approximately 0.48 λ due to end effects.</p>
    `;
};
