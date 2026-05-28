/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Beam / Yagi Lab
   ============================================================ */

import { wavelengthMeters } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("beam-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function beamLabUI() {
    return `
        <h2>Beam / Yagi Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="beam_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Number of Directors:</label><br>
            <input id="beam_dirs" type="number" value="1" step="1"><br><br>

            <button class="btn-primary" onclick="runBeamLab()">Analyze</button>
        </div>

        <div id="beam_results"></div>
    `;
}

/* ------------------------------------------------------------
   Yagi Geometry
   ------------------------------------------------------------ */

/**
 * Classic Yagi element lengths:
 * Reflector ≈ 0.53 λ
 * Driven    ≈ 0.50 λ
 * Director  ≈ 0.47 λ
 */
function yagiElementLengths(freqMhz) {
    const lambda = wavelengthMeters(freqMhz);

    return {
        reflector: 0.53 * lambda,
        driven:    0.50 * lambda,
        director:  0.47 * lambda
    };
}

/**
 * Element spacing:
 * Reflector–Driven ≈ 0.15 λ
 * Driven–Director ≈ 0.10 λ
 */
function yagiSpacing(freqMhz) {
    const lambda = wavelengthMeters(freqMhz);

    return {
        rd: 0.15 * lambda,
        dd: 0.10 * lambda
    };
}

/**
 * Gain approximation:
 * G ≈ 5.2 dBi + 2.6 * N_directors
 */
function yagiGain(numDirectors) {
    return 5.2 + 2.6 * numDirectors;
}

/**
 * Front‑to‑Back ratio approximation:
 * F/B ≈ 10 + 4 * N_directors
 */
function yagiFrontBack(numDirectors) {
    return 10 + 4 * numDirectors;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function beamPoster(freqMhz, numDirectors) {
    const lambda = wavelengthMeters(freqMhz);

    const spacing = yagiSpacing(freqMhz);
    const baseX = 100;
    const y = 300;

    let inner = `
        ${svgTitle("Yagi Beam Diagram")}
        ${svgLabel("Boom Direction →", 600, 80)}
    `;

    // Reflector
    inner += svgLine(baseX, y - 120, baseX, y + 120, "#1e3a5f", 6);
    inner += svgLabel("Reflector", baseX - 40, y + 150);

    // Driven
    const drivenX = baseX + spacing.rd * 80;
    inner += svgLine(drivenX, y - 110, drivenX, y + 110, "#ffb400", 6);
    inner += svgLabel("Driven", drivenX - 20, y + 150);

    // Directors
    let currentX = drivenX + spacing.dd * 80;
    for (let i = 0; i < numDirectors; i++) {
        inner += svgLine(currentX, y - 100, currentX, y + 100, "#cc0000", 6);
        inner += svgLabel(`Dir ${i + 1}`, currentX - 20, y + 150);
        currentX += spacing.dd * 80;
    }

    return svgWrapper(inner, 900, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runBeamLab = function () {
    const freq = parseFloat(document.getElementById("beam_freq").value);
    const dirs = parseInt(document.getElementById("beam_dirs").value);

    const lengths = yagiElementLengths(freq);
    const spacing = yagiSpacing(freq);
    const gain = yagiGain(dirs);
    const fb = yagiFrontBack(dirs);

    const poster = beamPoster(freq, dirs);

    const html = `
        <div class="card">
            <h3>Yagi Beam Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <strong>Reflector Length:</strong><br>
            ${formatLengthMetersFeet(lengths.reflector)}<br><br>

            <strong>Driven Element Length:</strong><br>
            ${formatLengthMetersFeet(lengths.driven)}<br><br>

            <strong>Director Length:</strong><br>
            ${formatLengthMetersFeet(lengths.director)}<br><br>

            <strong>Reflector–Driven Spacing:</strong><br>
            ${formatLengthMetersFeet(spacing.rd)}<br><br>

            <strong>Driven–Director Spacing:</strong><br>
            ${formatLengthMetersFeet(spacing.dd)}<br><br>

            <strong>Estimated Gain:</strong> ${gain.toFixed(1)} dBi<br>
            <strong>Estimated Front‑to‑Back:</strong> ${fb.toFixed(1)} dB<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("beam_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Yagi Notes</h3>
        <p>Yagis provide high gain and excellent directivity.</p>
        <p>More directors increase gain and improve F/B ratio.</p>
        <p>Element spacing is critical for pattern stability.</p>
        <p>Reflector is slightly longer; directors are slightly shorter.</p>
    `;
};
