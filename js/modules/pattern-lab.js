/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Radiation Pattern Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLabel } from "../core/poster-engine.js";

console.log("pattern-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function patternLabUI() {
    return `
        <h2>Radiation Pattern Lab</h2>

        <div class="card">
            <label>Antenna Type:</label><br>
            <select id="pat_type">
                <option value="dipole">Dipole</option>
                <option value="vertical">Vertical</option>
                <option value="yagi">Yagi (3‑element)</option>
            </select><br><br>

            <label>Elevation Angle (degrees):</label><br>
            <input id="pat_el" type="number" value="30" step="1"><br><br>

            <button class="btn-primary" onclick="runPatternLab()">Analyze</button>
        </div>

        <div id="pattern_results"></div>
    `;
}

/* ------------------------------------------------------------
   Pattern Math
   ------------------------------------------------------------ */

/**
 * Dipole pattern:
 * E(θ) = sin(θ)
 */
function dipolePattern(theta) {
    return Math.abs(Math.sin(theta));
}

/**
 * Vertical pattern:
 * E(θ) = cos(θ)
 */
function verticalPattern(theta) {
    return Math.abs(Math.cos(theta));
}

/**
 * Yagi pattern (very simplified):
 * E(θ) = sin(θ) * (1 + 0.8*cos(θ))
 */
function yagiPattern(theta) {
    return Math.abs(Math.sin(theta) * (1 + 0.8 * Math.cos(theta)));
}

/* ------------------------------------------------------------
   Poster Generator (Polar Plot)
   ------------------------------------------------------------ */

function patternPoster(type) {
    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    let points = "";

    for (let deg = 0; deg < 360; deg++) {
        const theta = (deg * Math.PI) / 180;

        let mag = 0;
        if (type === "dipole") mag = dipolePattern(theta);
        if (type === "vertical") mag = verticalPattern(theta);
        if (type === "yagi") mag = yagiPattern(theta);

        const r = radius * mag;
        const x = centerX + r * Math.cos(theta);
        const y = centerY + r * Math.sin(theta);

        points += `${x},${y} `;
    }

    const inner = `
        ${svgTitle("Radiation Pattern (" + type + ")")}
        <polyline points="${points}" stroke="#1e3a5f" stroke-width="3" fill="none"></polyline>
        ${svgLabel("0°", 700, 310)}
        ${svgLabel("90°", 390, 80)}
        ${svgLabel("180°", 80, 310)}
        ${svgLabel("270°", 390, 520)}
    `;

    return svgWrapper(inner, 800, 600);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runPatternLab = function () {
    const type = document.getElementById("pat_type").value;
    const el = parseFloat(document.getElementById("pat_el").value);

    const poster = patternPoster(type);

    const html = `
        <div class="card">
            <h3>Radiation Pattern Analysis</h3>

            <strong>Antenna Type:</strong> ${type}<br>
            <strong>Elevation Angle:</strong> ${el}°<br><br>

            <p>This is a simplified 2D azimuth pattern at the selected elevation angle.</p>
        </div>

        <div class="card">
            <h3>Pattern Plot</h3>
            ${poster}
        </div>
    `;

    document.getElementById("pattern_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Pattern Notes</h3>
        <p>Dipoles have a figure‑8 pattern broadside to the wire.</p>
        <p>Verticals have omnidirectional azimuth patterns.</p>
        <p>Yagis have strong forward gain and deep rear nulls.</p>
        <p>Elevation angle dramatically affects real‑world performance.</p>
    `;
};
