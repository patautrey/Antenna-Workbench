/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Height Optimizer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("height-optimizer.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function heightOptimizerUI() {
    return `
        <h2>Antenna Height Optimizer</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="ho_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Antenna Type:</label><br>
            <select id="ho_type">
                <option value="dipole">Dipole</option>
                <option value="vertical">Vertical</option>
                <option value="loop">Loop</option>
            </select><br><br>

            <label>Height (meters):</label><br>
            <input id="ho_height" type="number" value="10" step="0.5"><br><br>

            <button class="btn-primary" onclick="runHeightOptimizer()">Analyze</button>
        </div>

        <div id="height_results"></div>
    `;
}

/* ------------------------------------------------------------
   Height Math
   ------------------------------------------------------------ */

/**
 * Takeoff angle approximation:
 * TOA ≈ 90 - (height / λ) * 25
 */
function takeoffAngle(freqMhz, heightMeters) {
    const lambda = 300 / freqMhz;
    return Math.max(5, 90 - (heightMeters / lambda) * 25);
}

/**
 * Height gain factor:
 * G ≈ 1 + (height / λ) * 0.6
 */
function heightGain(freqMhz, heightMeters) {
    const lambda = 300 / freqMhz;
    return 1 + (heightMeters / lambda) * 0.6;
}

/**
 * NVIS score:
 * High when TOA > 60°
 */
function nvisScore(TOA) {
    return Math.max(0, (TOA - 60) / 30);
}

/**
 * DX score:
 * High when TOA < 20°
 */
function dxScore(TOA) {
    return Math.max(0, (20 - TOA) / 20);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function heightPoster(heightMeters) {
    const inner = `
        ${svgTitle("Height Geometry")}

        ${svgLine(100, 350, 700, 350, "#444", 4)}
        ${svgLabel("Ground", 360, 380)}

        ${svgLine(400, 350, 400, 350 - heightMeters * 10, "#1e3a5f", 6)}
        ${svgCircle(400, 350 - heightMeters * 10, 10, "#cc0000")}
        ${svgLabel(heightMeters + " m", 420, 350 - heightMeters * 10)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runHeightOptimizer = function () {
    const freq = parseFloat(document.getElementById("ho_freq").value);
    const type = document.getElementById("ho_type").value;
    const height = parseFloat(document.getElementById("ho_height").value);

    const TOA = takeoffAngle(freq, height);
    const G = heightGain(freq, height);
    const NVIS = nvisScore(TOA);
    const DX = dxScore(TOA);

    const poster = heightPoster(height);

    const html = `
        <div class="card">
            <h3>Antenna Height Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Antenna Type:</strong> ${type}<br>
            <strong>Height:</strong> ${height} m<br><br>

            <strong>Estimated Takeoff Angle:</strong> ${TOA.toFixed(1)}°<br>
            <strong>Height Gain Factor:</strong> ${G.toFixed(2)}×<br><br>

            <strong>NVIS Score:</strong> ${(NVIS * 100).toFixed(0)}%<br>
            <strong>DX Score:</strong> ${(DX * 100).toFixed(0)}%<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("height_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Height Notes</h3>
        <p>Higher antennas reduce takeoff angle and improve DX performance.</p>
        <p>Lower antennas increase takeoff angle and improve NVIS performance.</p>
        <p>Height in wavelengths is more important than height in meters.</p>
        <p>Dipoles benefit strongly from height; verticals less so.</p>
    `;
};
