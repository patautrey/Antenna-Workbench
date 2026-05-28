/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Beam Optimizer Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";
import { wavelengthMeters } from "../core/vf-engine.js";

console.log("beam-optimizer.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function beamOptimizerUI() {
    return `
        <h2>Beam Optimizer Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="beam_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Number of Elements:</label><br>
            <input id="beam_elements" type="number" value="3" step="1"><br><br>

            <label>Boom Length (meters):</label><br>
            <input id="beam_boom" type="number" value="5" step="0.1"><br><br>

            <button class="btn-primary" onclick="runBeamOptimizer()">Analyze</button>
        </div>

        <div id="beam_results"></div>
    `;
}

/* ------------------------------------------------------------
   Beam Math
   ------------------------------------------------------------ */

/**
 * Gain approximation:
 * G(dBi) ≈ 4.2 + 10 log10(N)
 */
function beamGain(elements) {
    return 4.2 + 10 * Math.log10(elements);
}

/**
 * Front-to-back ratio:
 * F/B ≈ 12 + 6 log10(boom / λ)
 */
function frontToBack(freqMhz, boomMeters) {
    const lambda = wavelengthMeters(freqMhz);
    return 12 + 6 * Math.log10(boomMeters / lambda);
}

/**
 * Optimal spacing:
 * spacing ≈ boom / (N - 1)
 */
function elementSpacing(boomMeters, elements) {
    if (elements <= 1) return 0;
    return boomMeters / (elements - 1);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function beamPoster(elements, spacing) {
    const baseY = 300;
    const startX = 150;

    let inner = `${svgTitle("Yagi Beam Geometry")}`;

    for (let i = 0; i < elements; i++) {
        const x = startX + i * spacing * 40;
        inner += svgLine(x, baseY - 80, x, baseY + 80, "#1e3a5f", 6);
        inner += svgLabel(`Elem ${i + 1}`, x - 20, baseY + 110);
    }

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runBeamOptimizer = function () {
    const freq = parseFloat(document.getElementById("beam_freq").value);
    const elements = parseInt(document.getElementById("beam_elements").value);
    const boom = parseFloat(document.getElementById("beam_boom").value);

    const gain = beamGain(elements);
    const fb = frontToBack(freq, boom);
    const spacing = elementSpacing(boom, elements);

    const poster = beamPoster(elements, spacing);

    const html = `
        <div class="card">
            <h3>Beam Optimization</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Elements:</strong> ${elements}<br>
            <strong>Boom Length:</strong> ${boom.toFixed(1)} m<br><br>

            <strong>Estimated Gain:</strong> ${gain.toFixed(1)} dBi<br>
            <strong>Front-to-Back Ratio:</strong> ${fb.toFixed(1)} dB<br>
            <strong>Element Spacing:</strong> ${spacing.toFixed(2)} m<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("beam_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Beam Optimization Notes</h3>
        <p>Longer booms increase gain and improve F/B ratio.</p>
        <p>More elements increase gain but add complexity.</p>
        <p>Typical spacing is 0.1–0.2 λ between elements.</p>
        <p>Director lengths and spacing shape the forward lobe.</p>
    `;
};
