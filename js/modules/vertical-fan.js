/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Vertical Fan Designer
   ============================================================ */

import { quarterWave } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { generatePoster } from "../core/poster-engine.js";

console.log("vertical-fan.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function verticalFanUI() {
    return `
        <h2>Vertical Fan Designer</h2>

        <div class="card">
            <label>Frequencies (MHz, comma‑separated):</label><br>
            <input id="vf_bands" type="text" value="7.2,14.2,21.2,28.4"><br><br>

            <button class="btn-primary" onclick="runVerticalFan()">Calculate</button>
        </div>

        <div id="vf_results"></div>
    `;
}

/* ------------------------------------------------------------
   Mutual Coupling Approximation
   ------------------------------------------------------------ */

/**
 * Simple mutual coupling model:
 * Adjacent elements shift resonance by ~1–3%
 * depending on spacing and band.
 */
function couplingShift(freqMhz) {
    if (freqMhz < 10) return 0.02;   // 2% shift on low bands
    if (freqMhz < 20) return 0.015;  // 1.5% shift mid bands
    return 0.01;                     // 1% shift high bands
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function verticalFanPoster(elements) {
    // Use the tallest element for poster height
    const tallest = Math.max(...elements.map(e => e.length));

    return generatePoster("vertical", { heightMeters: tallest });
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runVerticalFan = function () {
    const bandString = document.getElementById("vf_bands").value;
    const freqs = bandString.split(",").map(f => parseFloat(f.trim())).filter(f => !isNaN(f));

    const elements = freqs.map(freq => {
        const q = quarterWave(freq);
        const shift = couplingShift(freq);
        const adjusted = q * (1 - shift);

        return {
            freq,
            length: adjusted,
            shiftPercent: shift * 100
        };
    });

    const poster = verticalFanPoster(elements);

    let rows = "";
    for (const e of elements) {
        rows += `
            <tr>
                <td>${e.freq} MHz</td>
                <td>${formatLengthMetersFeet(e.length)}</td>
                <td>${e.shiftPercent.toFixed(1)}%</td>
            </tr>
        `;
    }

    const html = `
        <div class="card">
            <h3>Vertical Fan Results</h3>

            <table class="data-table">
                <tr>
                    <th>Band</th>
                    <th>Adjusted Element Length</th>
                    <th>Coupling Shift</th>
                </tr>
                ${rows}
            </table>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("vf_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Vertical Fan Notes</h3>
        <p>Vertical fan antennas allow multi‑band operation with minimal hardware.</p>
        <p>Mutual coupling between elements shifts resonance slightly.</p>
        <p>Low‑band elements influence high‑band elements more than the reverse.</p>
        <p>Spacing of 10–30 cm between elements reduces interaction.</p>
    `;
};
