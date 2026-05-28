/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Phased Array Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("array-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function arrayLabUI() {
    return `
        <h2>Phased Array Lab</h2>

        <div class="card">
            <label>Array Type:</label><br>
            <select id="arr_type">
                <option value="broadside">Broadside</option>
                <option value="endfire">End‑Fire</option>
            </select><br><br>

            <label>Element Spacing (meters):</label><br>
            <input id="arr_spacing" type="number" value="10" step="0.1"><br><br>

            <label>Frequency (MHz):</label><br>
            <input id="arr_freq" type="number" value="7.2" step="0.1"><br><br>

            <button class="btn-primary" onclick="runArrayLab()">Analyze</button>
        </div>

        <div id="array_results"></div>
    `;
}

/* ------------------------------------------------------------
   Array Math
   ------------------------------------------------------------ */

/**
 * Phase shift:
 * Broadside → 0°
 * End‑fire → ±90° depending on direction
 */
function phaseShift(type) {
    if (type === "broadside") return 0;
    return 90;
}

/**
 * Array factor:
 * AF(θ) = 2 * cos( (kd cosθ + φ) / 2 )
 */
function arrayFactor(freqMhz, spacing, phiDeg, thetaDeg) {
    const lambda = 300 / freqMhz;
    const k = (2 * Math.PI) / lambda;
    const phi = (phiDeg * Math.PI) / 180;
    const theta = (thetaDeg * Math.PI) / 180;

    return 2 * Math.cos((k * spacing * Math.cos(theta) + phi) / 2);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function arrayPoster(spacing) {
    const inner = `
        ${svgTitle("Two‑Element Phased Array")}
        ${svgLine(300, 300, 500, 300, "#1e3a5f", 6)}
        ${svgLabel("Spacing: " + spacing.toFixed(1) + " m", 20, 80)}
        ${svgLabel("Element 1", 260, 330)}
        ${svgLabel("Element 2", 520, 330)}
    `;
    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runArrayLab = function () {
    const type = document.getElementById("arr_type").value;
    const spacing = parseFloat(document.getElementById("arr_spacing").value);
    const freq = parseFloat(document.getElementById("arr_freq").value);

    const phi = phaseShift(type);

    // Compute array factor at key angles
    const angles = [0, 30, 60, 90, 120, 150, 180];
    let rows = "";

    for (const a of angles) {
        const af = arrayFactor(freq, spacing, phi, a);
        rows += `
            <tr>
                <td>${a}°</td>
                <td>${af.toFixed(2)}</td>
            </tr>
        `;
    }

    const poster = arrayPoster(spacing);

    const html = `
        <div class="card">
            <h3>Phased Array Analysis</h3>

            <strong>Array Type:</strong> ${type}<br>
            <strong>Spacing:</strong> ${spacing.toFixed(1)} m<br>
            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <strong>Phase Shift:</strong> ${phi}°<br><br>

            <table class="data-table">
                <tr>
                    <th>Angle</th>
                    <th>Array Factor</th>
                </tr>
                ${rows}
            </table>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("array_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Phased Array Notes</h3>
        <p>Broadside arrays radiate perpendicular to the line of elements.</p>
        <p>End‑fire arrays radiate along the line of elements.</p>
        <p>Spacing of 0.5–1.0 λ is typical for strong directivity.</p>
        <p>Phase shift determines the direction of maximum radiation.</p>
    `;
};
