/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: NVIS Lab
   ============================================================ */

import { wavelengthMeters } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("nvis-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function nvisLabUI() {
    return `
        <h2>NVIS Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="nvis_freq" type="number" value="5.3" step="0.1"><br><br>

            <label>Antenna Height (meters):</label><br>
            <input id="nvis_height" type="number" value="6" step="0.1"><br><br>

            <button class="btn-primary" onclick="runNvisLab()">Analyze</button>
        </div>

        <div id="nvis_results"></div>
    `;
}

/* ------------------------------------------------------------
   NVIS Geometry
   ------------------------------------------------------------ */

/**
 * NVIS takeoff angle approximation:
 * θ ≈ arctan( (λ/4) / height )
 */
function nvisTakeoffAngle(freqMhz, heightMeters) {
    const lambda = wavelengthMeters(freqMhz);
    const quarter = lambda / 4;
    return Math.atan(quarter / heightMeters) * (180 / Math.PI);
}

/**
 * NVIS sweet‑spot band:
 * 2–10 MHz typical
 */
function nvisBandQuality(freqMhz) {
    if (freqMhz < 2) return "Too low — absorption dominates";
    if (freqMhz <= 10) return "Excellent NVIS band";
    if (freqMhz <= 14) return "Marginal NVIS — angle too low";
    return "Poor NVIS — DX angles dominate";
}

/* ------------------------------------------------------------
   Poster Generator (NVIS Geometry)
   ------------------------------------------------------------ */

function nvisPoster(freqMhz, heightMeters) {
    const lambda = wavelengthMeters(freqMhz);
    const quarter = lambda / 4;

    const inner = `
        ${svgTitle("NVIS Geometry")}

        ${svgLabel("Antenna Height", 40, 120)}
        ${svgLine(100, 140, 100, 440, "#1e3a5f", 6)}

        ${svgLabel("Ground", 60, 470)}
        ${svgLine(20, 460, 780, 460, "#444", 3)}

        ${svgLabel("Quarter‑wave Reference", 300, 120)}
        ${svgLine(350, 140, 350, 140 + quarter * 40, "#ffb400", 4)}

        ${svgLabel("High‑Angle NVIS Ray", 420, 200)}
        ${svgLine(100, 200, 700, 80, "#cc0000", 4)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runNvisLab = function () {
    const freq = parseFloat(document.getElementById("nvis_freq").value);
    const height = parseFloat(document.getElementById("nvis_height").value);

    const lambda = wavelengthMeters(freq);
    const angle = nvisTakeoffAngle(freq, height);
    const bandQuality = nvisBandQuality(freq);

    const poster = nvisPoster(freq, height);

    const html = `
        <div class="card">
            <h3>NVIS Analysis</h3>

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

    document.getElementById("nvis_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>NVIS Notes</h3>
        <p>NVIS requires high takeoff angles (60–90°).</p>
        <p>Best bands: 2–10 MHz depending on solar conditions.</p>
        <p>Lower antennas produce higher angles — ideal for NVIS.</p>
        <p>Quarter‑wave height is a key reference for NVIS geometry.</p>
    `;
};
