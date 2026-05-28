/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: GMRS J‑Pole Variant
   ============================================================ */

import { wavelengthMeters } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { generatePoster } from "../core/poster-engine.js";

console.log("jpole-gmrs.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function jpoleGmrsUI() {
    return `
        <h2>GMRS J‑Pole Variant</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="gmrs_freq" type="number" value="462.675" step="0.005"><br><br>

            <button class="btn-primary" onclick="runGmrsJpole()">Calculate</button>
        </div>

        <div id="gmrs_results"></div>
    `;
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runGmrsJpole = function () {
    const freq = parseFloat(document.getElementById("gmrs_freq").value);

    const lambda = wavelengthMeters(freq);

    // GMRS J‑Pole geometry (ultra‑compact)
    const longElement = 0.75 * lambda;     // radiator
    const shortElement = 0.25 * lambda;    // matching stub
    const spacing = 0.015 * lambda;        // tighter spacing for UHF
    const feedpoint = 0.04 * lambda;       // feedpoint slightly lower for UHF

    const poster = generatePoster("vertical", { heightMeters: longElement });

    const html = `
        <div class="card">
            <h3>GMRS J‑Pole Geometry</h3>

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

    document.getElementById("gmrs_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>GMRS J‑Pole Notes</h3>
        <p>GMRS operates at UHF, so the J‑Pole becomes extremely compact.</p>
        <p>Spacing is tighter than VHF — typically 0.5 to 1.5 cm.</p>
        <p>Feedpoint height is more sensitive at UHF; small adjustments matter.</p>
        <p>Great for backpack kits, vehicle windows, and rapid‑deploy field use.</p>
    `;
};
