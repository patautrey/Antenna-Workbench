/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Stacking & Phasing Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("stacking-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function stackingLabUI() {
    return `
        <h2>Antenna Stacking & Phasing Lab</h2>

        <div class="card">
            <label>Stacking Type:</label><br>
            <select id="stk_type">
                <option value="vertical">Vertical Stack</option>
                <option value="horizontal">Horizontal Stack</option>
            </select><br><br>

            <label>Spacing (meters):</label><br>
            <input id="stk_spacing" type="number" value="10" step="0.1"><br><br>

            <label>Frequency (MHz):</label><br>
            <input id="stk_freq" type="number" value="14.2" step="0.1"><br><br>

            <button class="btn-primary" onclick="runStackingLab()">Analyze</button>
        </div>

        <div id="stacking_results"></div>
    `;
}

/* ------------------------------------------------------------
   Stacking Math
   ------------------------------------------------------------ */

/**
 * Stacking gain approximation:
 * G_stack ≈ 10 * log10( 1 + (λ / spacing) )
 */
function stackingGain(freqMhz, spacingMeters) {
    const lambda = 300 / freqMhz;
    return 10 * Math.log10(1 + lambda / spacingMeters);
}

/**
 * Phase line length:
 * For in-phase stacking:
 * L = (λ / 2) * VF
 * Assume VF = 0.66 for coax
 */
function phaseLineLength(freqMhz) {
    const lambda = 300 / freqMhz;
    return (lambda / 2) * 0.66;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function stackingPoster(type, spacingMeters) {
    const baseY = 200;
    const offset = spacingMeters * 20;

    let inner = `
        ${svgTitle("Stacked Antenna Diagram")}
        ${svgLabel("Spacing: " + spacingMeters.toFixed(1) + " m", 20, 80)}
    `;

    if (type === "vertical") {
        inner += svgLine(400, baseY, 400, baseY + 100, "#1e3a5f", 6);
        inner += svgLine(400, baseY + offset, 400, baseY + offset + 100, "#1e3a5f", 6);
        inner += svgLabel("Top Antenna", 350, baseY - 10);
        inner += svgLabel("Bottom Antenna", 330, baseY + offset - 10);
    } else {
        inner += svgLine(300, baseY, 400, baseY, "#1e3a5f", 6);
        inner += svgLine(300 + offset, baseY, 400 + offset, baseY, "#1e3a5f", 6);
        inner += svgLabel("Left Antenna", 260, baseY - 10);
        inner += svgLabel("Right Antenna", 260 + offset, baseY - 10);
    }

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runStackingLab = function () {
    const type = document.getElementById("stk_type").value;
    const spacing = parseFloat(document.getElementById("stk_spacing").value);
    const freq = parseFloat(document.getElementById("stk_freq").value);

    const gain = stackingGain(freq, spacing);
    const phaseLen = phaseLineLength(freq);

    const poster = stackingPoster(type, spacing);

    const html = `
        <div class="card">
            <h3>Stacking Analysis</h3>

            <strong>Type:</strong> ${type}<br>
            <strong>Spacing:</strong> ${spacing.toFixed(1)} m<br>
            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <strong>Estimated Stacking Gain:</strong><br>
            ${gain.toFixed(2)} dB<br><br>

            <strong>Phase Line Length (in-phase):</strong><br>
            ${phaseLen.toFixed(2)} m (VF=0.66)<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("stacking_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Stacking Notes</h3>
        <p>Vertical stacking lowers takeoff angle and increases gain.</p>
        <p>Horizontal stacking narrows the azimuth beamwidth.</p>
        <p>Spacing of 0.7–1.2 λ is typical for strong stacking gain.</p>
        <p>Phase lines ensure the antennas radiate in-phase.</p>
    `;
};
