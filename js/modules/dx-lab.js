/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: DX Lab
   ============================================================ */

import { wavelengthMeters } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("dx-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function dxLabUI() {
    return `
        <h2>DX Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="dx_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Antenna Height (meters):</label><br>
            <input id="dx_height" type="number" value="10" step="0.1"><br><br>

            <button class="btn-primary" onclick="runDxLab()">Analyze</button>
        </div>

        <div id="dx_results"></div>
    `;
}

/* ------------------------------------------------------------
   DX Geometry
   ------------------------------------------------------------ */

/**
 * DX takeoff angle approximation:
 * θ ≈ arctan( height / (λ * 1.5) )
 * Lower angles = better DX
 */
function dxTakeoffAngle(freqMhz, heightMeters) {
    const lambda = wavelengthMeters(freqMhz);
    return Math.atan(heightMeters / (lambda * 1.5)) * (180 / Math.PI);
}

/**
 * DX band quality:
 * 14–30 MHz is prime DX territory
 */
function dxBandQuality(freqMhz) {
    if (freqMhz < 10) return "Low band — DX possible but conditions vary";
    if (freqMhz <= 30) return "Excellent DX band";
    return "Above HF — not applicable";
}

/* ------------------------------------------------------------
   Poster Generator (DX Geometry)
   ------------------------------------------------------------ */

function dxPoster(freqMhz, heightMeters) {
    const lambda = wavelengthMeters(freqMhz);

    const inner = `
        ${svgTitle("DX Geometry")}

        ${svgLabel("Antenna Height", 40, 120)}
        ${svgLine(100, 140, 100, 440, "#1e3a5f", 6)}

        ${svgLabel("Ground", 60, 470)}
        ${svgLine(20, 460, 780, 460, "#444", 3)}

        ${svgLabel("Low‑Angle DX Ray", 420, 380)}
        ${svgLine(100, 380, 700, 300, "#cc0000", 4)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runDxLab = function () {
    const freq = parseFloat(document.getElementById("dx_freq").value);
    const height = parseFloat(document.getElementById("dx_height").value);

    const lambda = wavelengthMeters(freq);
    const angle = dxTakeoffAngle(freq, height);
    const bandQuality = dxBandQuality(freq);

    const poster = dxPoster(freq, height);

    const html = `
        <div class="card">
            <h3>DX Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Wavelength:</strong> ${lambda.toFixed(2)} m<br><br>

            <strong>Antenna Height:</strong><br>
            ${formatLengthMetersFeet(height)}<br><br>

            <strong>Estimated Takeoff Angle:</strong> ${angle.toFixed(1)}°<br><br>

            <strong>Band Quality:</strong> ${bandQuality}<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("dx_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>DX Notes</h3>
        <p>DX requires low takeoff angles (5–20°).</p>
        <p>Higher antennas produce lower angles — ideal for long‑distance work.</p>
        <p>Best DX bands: 14–30 MHz depending on solar cycle.</p>
        <p>Ground conductivity strongly affects low‑angle performance.</p>
    `;
};
