/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Vertical Designer
   ============================================================ */

import { quarterWave, halfWave, coaxQuarterWave } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { generatePoster } from "../core/poster-engine.js";

console.log("vertical-designer.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function verticalDesignerUI() {
    return `
        <h2>Vertical Designer</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="vd_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Velocity Factor (0.50 – 0.99):</label><br>
            <input id="vd_vf" type="number" value="0.95" step="0.01"><br><br>

            <button class="btn-primary" onclick="runVerticalDesigner()">Calculate</button>
        </div>

        <div id="vd_results"></div>
    `;
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runVerticalDesigner = function () {
    const freq = parseFloat(document.getElementById("vd_freq").value);
    const vf = parseFloat(document.getElementById("vd_vf").value);

    const q = quarterWave(freq);
    const h = halfWave(freq);
    const coaxQ = coaxQuarterWave(freq, vf);

    const poster = generatePoster("vertical", { heightMeters: q });

    const html = `
        <div class="card">
            <h3>Results</h3>

            <strong>Quarter‑wave:</strong><br>
            ${formatLengthMetersFeet(q)}<br><br>

            <strong>Half‑wave:</strong><br>
            ${formatLengthMetersFeet(h)}<br><br>

            <strong>Coax Quarter‑wave (VF ${vf}):</strong><br>
            ${formatLengthMetersFeet(coaxQ)}<br><br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("vd_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Vertical Designer Notes</h3>
        <p>Quarter‑wave verticals provide low-angle radiation ideal for DX.</p>
        <p>Radials improve efficiency dramatically — even 4–8 helps.</p>
        <p>Coax VF affects physical trimming length for matching stubs.</p>
    `;
};
