/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Ground System Lab
   ============================================================ */

import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("ground-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function groundLabUI() {
    return `
        <h2>Ground System Lab</h2>

        <div class="card">
            <label>Number of Radials:</label><br>
            <input id="gr_radials" type="number" value="16" step="1"><br><br>

            <label>Radial Length (meters):</label><br>
            <input id="gr_length" type="number" value="8" step="0.1"><br><br>

            <label>Soil Type:</label><br>
            <select id="gr_soil">
                <option value="0.5">Poor (0.5 mS/m)</option>
                <option value="2">Fair (2 mS/m)</option>
                <option value="5">Good (5 mS/m)</option>
                <option value="15">Excellent (15 mS/m)</option>
            </select><br><br>

            <button class="btn-primary" onclick="runGroundLab()">Analyze</button>
        </div>

        <div id="ground_results"></div>
    `;
}

/* ------------------------------------------------------------
   Ground System Math
   ------------------------------------------------------------ */

/**
 * Radial efficiency approximation:
 * η ≈ 1 - exp( -N * L / K )
 * K depends on soil conductivity.
 */
function radialEfficiency(numRadials, lengthMeters, soilCond) {
    const K = 40 / soilCond; // empirical scaling
    return 1 - Math.exp(-(numRadials * lengthMeters) / K);
}

/**
 * Ground loss approximation:
 * Rg ≈ 5 / (η + 0.2)
 */
function groundLoss(eta) {
    return 5 / (eta + 0.2);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function groundPoster(numRadials, lengthMeters) {
    const radiusPx = 200;

    let inner = `
        ${svgTitle("Ground Radial System")}
        ${svgCircle(400, 300, 20, "#1e3a5f")}
        ${svgLabel("Feedpoint", 370, 330)}
    `;

    for (let i = 0; i < numRadials; i++) {
        const angle = (i / numRadials) * 2 * Math.PI;
        const x2 = 400 + radiusPx * Math.cos(angle);
        const y2 = 300 + radiusPx * Math.sin(angle);
        inner += svgLine(400, 300, x2, y2, "#888", 3);
    }

    inner += svgLabel(`Radial Length: ${lengthMeters.toFixed(1)} m`, 20, 80);

    return svgWrapper(inner, 800, 600);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runGroundLab = function () {
    const N = parseInt(document.getElementById("gr_radials").value);
    const L = parseFloat(document.getElementById("gr_length").value);
    const soil = parseFloat(document.getElementById("gr_soil").value);

    const eta = radialEfficiency(N, L, soil);
    const Rg = groundLoss(eta);

    const poster = groundPoster(N, L);

    const html = `
        <div class="card">
            <h3>Ground System Analysis</h3>

            <strong>Radials:</strong> ${N}<br><br>

            <strong>Radial Length:</strong><br>
            ${formatLengthMetersFeet(L)}<br><br>

            <strong>Soil Conductivity:</strong> ${soil} mS/m<br><br>

            <strong>Estimated Efficiency:</strong><br>
            ${(eta * 100).toFixed(1)}%<br><br>

            <strong>Estimated Ground Loss:</strong><br>
            ${Rg.toFixed(2)} Ω<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("ground_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Ground System Notes</h3>
        <p>More radials reduce ground loss dramatically.</p>
        <p>Longer radials improve efficiency, especially on lower bands.</p>
        <p>Soil conductivity has a major impact on vertical performance.</p>
        <p>Elevated radials require fewer wires but must be tuned.</p>
    `;
};
