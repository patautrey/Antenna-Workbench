/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Roll‑Up Duct Tape J‑Pole Designer
   ============================================================ */

import { wavelengthMeters } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { generatePoster } from "../core/poster-engine.js";

console.log("jpole-duct-tape.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function jpoleUI() {
    return `
        <h2>Roll‑Up Duct Tape J‑Pole</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="jp_freq" type="number" value="146.52" step="0.01"><br><br>

            <button class="btn-primary" onclick="runJpole()">Calculate</button>
        </div>

        <div id="jp_results"></div>
    `;
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runJpole = function () {
    const freq = parseFloat(document.getElementById("jp_freq").value);

    const lambda = wavelengthMeters(freq);

    // J‑Pole geometry (classic 2m/70cm roll‑up)
    const longElement = 0.75 * lambda;     // ~3/4 λ radiator
    const shortElement = 0.25 * lambda;    // ~1/4 λ matching stub
    const spacing = 0.02 * lambda;         // ~2% λ spacing
    const feedpoint = 0.05 * lambda;       // ~5% λ from bottom

    const poster = generatePoster("vertical", { heightMeters: longElement });

    const html = `
        <div class="card">
            <h3>J‑Pole Geometry</h3>

            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <strong>Radiator (3/4 λ):</strong><br>
            ${formatLengthMetersFeet(longElement)}<br><br>

            <strong>Matching Stub (1/4 λ):</strong><br>
            ${formatLengthMetersFeet(shortElement)}<br><br>

            <strong>Element Spacing:</strong><br>
            ${formatLengthMetersFeet(spacing)}<br><br>

            <strong>Feedpoint Height:</strong><br>
            ${formatLengthMetersFeet(feedpoint)}<br><br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("jp_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Duct Tape J‑Pole Notes</h3>
        <p>This roll‑up design is ideal for SOTA, POTA, and emergency go‑kits.</p>
        <p>The radiator is 3/4 λ, giving a low‑angle pattern with a bit of gain.</p>
        <p>The matching stub provides a natural 50‑ohm match when fed ~5% λ up.</p>
        <p>Spacing is not critical — 1–3 cm works fine for 2m.</p>
    `;
};
