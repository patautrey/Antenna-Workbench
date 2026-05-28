/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: NVIS Loop & Low‑Height Antenna Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";
import { wavelengthMeters } from "../core/vf-engine.js";

console.log("loop-nvis-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function loopNvisLabUI() {
    return `
        <h2>NVIS Loop & Low‑Height Antenna Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="nvis_freq" type="number" value="5.3" step="0.1"><br><br>

            <label>Antenna Height (meters):</label><br>
            <input id="nvis_height" type="number" value="3" step="0.1"><br><br>

            <label>Antenna Type:</label><br>
            <select id="nvis_type">
                <option value="dipole">Low Dipole</option>
                <option value="loop">Horizontal Loop</option>
            </select><br><br>

            <button class="btn-primary" onclick="runLoopNvisLab()">Analyze</button>
        </div>

        <div id="nvis_results"></div>
    `;
}

/* ------------------------------------------------------------
   NVIS Math
   ------------------------------------------------------------ */

/**
 * Takeoff angle approximation:
 * θ ≈ arctan( λ / (4h) )
 */
function takeoffAngle(freqMhz, heightMeters) {
    const lambda = wavelengthMeters(freqMhz);
    return (Math.atan(lambda / (4 * heightMeters)) * 180) / Math.PI;
}

/**
 * NVIS efficiency:
 * Dipole: η ≈ 0.8 * (h / (λ/4))
 * Loop:   η ≈ 0.9 * (h / (λ/6))
 */
function nvisEfficiency(freqMhz, heightMeters, type) {
    const lambda = wavelengthMeters(freqMhz);

    if (type === "dipole") {
        return Math.min(1, 0.8 * (heightMeters / (lambda / 4)));
    }

    if (type === "loop") {
        return Math.min(1, 0.9 * (heightMeters / (lambda / 6)));
    }

    return 0;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function nvisPoster(heightMeters) {
    const baseY = 350;
    const antY = baseY - heightMeters * 20;

    const inner = `
        ${svgTitle("NVIS Geometry")}

        ${svgLine(100, baseY, 700, baseY, "#444", 4)}
        ${svgLabel("Ground", 360, baseY + 30)}

        ${svgLine(200, antY, 600, antY, "#1e3a5f", 6)}
        ${svgLabel("Antenna", 360, antY - 20)}

        ${svgLine(400, antY, 400, baseY, "#888", 2)}
        ${svgLabel("Height: " + heightMeters.toFixed(1) + " m", 420, (antY + baseY) / 2)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runLoopNvisLab = function () {
    const freq = parseFloat(document.getElementById("nvis_freq").value);
    const height = parseFloat(document.getElementById("nvis_height").value);
    const type = document.getElementById("nvis_type").value;

    const angle = takeoffAngle(freq, height);
    const eta = nvisEfficiency(freq, height, type);

    const poster = nvisPoster(height);

    const html = `
        <div class="card">
            <h3>NVIS Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Antenna Height:</strong> ${height.toFixed(1)} m<br>
            <strong>Antenna Type:</strong> ${type}<br><br>

            <strong>Estimated Takeoff Angle:</strong><br>
            ${angle.toFixed(1)}° (ideal NVIS is 70–90°)<br><br>

            <strong>NVIS Efficiency:</strong><br>
            ${(eta * 100).toFixed(1)}%<br><br>

            <p>Loops generally outperform dipoles for NVIS at very low heights.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("nvis_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>NVIS Notes</h3>
        <p>NVIS requires high takeoff angles (70–90°).</p>
        <p>Lower antennas produce higher takeoff angles.</p>
        <p>Loops often provide smoother NVIS coverage than dipoles.</p>
        <p>Best NVIS bands: 80m, 60m, 40m depending on solar conditions.</p>
    `;
};
