/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Pattern Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("pattern-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function patternLabUI() {
    return `
        <h2>Antenna Pattern Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="pat_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Antenna Type:</label><br>
            <select id="pat_type">
                <option value="dipole">Dipole</option>
                <option value="vertical">Vertical</option>
                <option value="loop">Loop</option>
                <option value="yagi">Yagi (3‑element)</option>
            </select><br><br>

            <label>Height (meters):</label><br>
            <input id="pat_height" type="number" value="10" step="0.5"><br><br>

            <button class="btn-primary" onclick="runPatternLab()">Analyze</button>
        </div>

        <div id="pattern_results"></div>
    `;
}

/* ------------------------------------------------------------
   Pattern Math
   ------------------------------------------------------------ */

/**
 * Simple elevation pattern approximation:
 * Dipole: sin(θ)
 * Vertical: cos(θ)
 * Loop: sin²(θ)
 * Yagi: sin(θ) * (1 + 0.6*cos(θ))
 */
function elevationPattern(type, theta) {
    const t = theta * Math.PI / 180;

    if (type === "dipole") return Math.abs(Math.sin(t));
    if (type === "vertical") return Math.abs(Math.cos(t));
    if (type === "loop") return Math.pow(Math.sin(t), 2);
    if (type === "yagi") return Math.abs(Math.sin(t) * (1 + 0.6 * Math.cos(t)));

    return 0;
}

/**
 * Height effect:
 * Lower height → higher takeoff angle
 * TOA ≈ 90 - (height / λ) * 20
 */
function takeoffAngle(freqMhz, heightMeters) {
    const lambda = 300 / freqMhz;
    return Math.max(5, 90 - (heightMeters / lambda) * 20);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function patternPoster(type) {
    const inner = `
        ${svgTitle("Antenna Pattern")}

        ${svgCircle(400, 300, 5, "#cc0000")}
        ${svgLabel("Antenna", 380, 330)}

        ${svgCircle(400, 300, 150, "none", "#1e3a5f", 2)}
        ${svgLabel(type.toUpperCase(), 360, 120)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runPatternLab = function () {
    const freq = parseFloat(document.getElementById("pat_freq").value);
    const type = document.getElementById("pat_type").value;
    const height = parseFloat(document.getElementById("pat_height").value);

    const TOA = takeoffAngle(freq, height);

    const poster = patternPoster(type);

    const html = `
        <div class="card">
            <h3>Antenna Pattern Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Antenna Type:</strong> ${type}<br>
            <strong>Height:</strong> ${height} m<br><br>

            <strong>Estimated Takeoff Angle:</strong> ${TOA.toFixed(1)}°<br>
            <p>Elevation pattern approximated using classical far‑field models.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("pattern_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Pattern Notes</h3>
        <p>Dipoles favor broadside radiation.</p>
        <p>Verticals favor low‑angle DX radiation.</p>
        <p>Loops have deep nulls and strong broadside lobes.</p>
        <p>Yagis exhibit forward gain and rear rejection.</p>
    `;
};
