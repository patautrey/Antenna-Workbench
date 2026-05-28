/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Optimization AI (Meta-Module)
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("antenna-optimizer-ai.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function antennaOptimizerAIUI() {
    return `
        <h2>HF Antenna Optimization AI</h2>

        <div class="card">
            <label>Target Bands (comma-separated MHz):</label><br>
            <input id="ao_bands" type="text" value="7.1,14.2,28.4"><br><br>

            <label>Max Height (meters):</label><br>
            <input id="ao_height" type="number" value="12" step="0.5"><br><br>

            <label>Max Length (meters):</label><br>
            <input id="ao_length" type="number" value="40" step="1"><br><br>

            <label>Target Feedpoint Impedance (Ω):</label><br>
            <input id="ao_z" type="number" value="50" step="1"><br><br>

            <label>Transmit Power (W):</label><br>
            <input id="ao_pwr" type="number" value="100" step="10"><br><br>

            <button class="btn-primary" onclick="runAntennaOptimizer()">Optimize Antenna</button>
        </div>

        <div id="ao_results"></div>
    `;
}

/* ------------------------------------------------------------
   Optimization Engine
   ------------------------------------------------------------ */

/**
 * Score function:
 * Combines:
 * - impedance match
 * - efficiency
 * - height gain
 * - harmonic alignment
 * - thermal safety
 */
function scoreAntenna(params, targets) {
    const { length, height } = params;
    const { bands, Ztarget, power } = targets;

    let score = 0;

    // Impedance match score
    bands.forEach(f => {
        const lambda = 300 / f;
        const L_over_lambda = length / lambda;
        const R = 50 * Math.pow(Math.sin(Math.PI * L_over_lambda), 2);
        const X = 50 * Math.sin(2 * Math.PI * L_over_lambda);
        const Z = Math.sqrt(R * R + X * X);
        const mismatch = Math.abs(Z - Ztarget);
        score -= mismatch * 0.5;
    });

    // Height gain
    score += height * 2;

    // Harmonic alignment
    bands.forEach((f, i) => {
        if (i > 0) {
            const ratio = f / bands[0];
            const harmonicError = Math.abs(ratio - Math.round(ratio));
            score -= harmonicError * 20;
        }
    });

    // Thermal safety (simple model)
    const thermalStress = power / (length * 2);
    score -= thermalStress * 5;

    return score;
}

/**
 * Optimization loop:
 * Simple hill-climb search
 */
function optimize(bands, Ztarget, maxHeight, maxLength, power) {
    let best = {
        length: maxLength * 0.7,
        height: maxHeight * 0.7
    };

    let bestScore = -Infinity;

    for (let L = maxLength * 0.3; L <= maxLength; L += 0.5) {
        for (let H = maxHeight * 0.3; H <= maxHeight; H += 0.5) {
            const s = scoreAntenna({ length: L, height: H }, {
                bands,
                Ztarget,
                power
            });

            if (s > bestScore) {
                bestScore = s;
                best = { length: L, height: H };
            }
        }
    }

    return { best, bestScore };
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function optimizerPoster(L, H) {
    const cx = 400;
    const cy = 300;

    const inner = `
        ${svgTitle("Optimized Geometry")}

        ${svgLine(cx - L * 3, cy, cx + L * 3, cy, "#1e3a5f", 6)}
        ${svgLabel("Length: " + L.toFixed(1) + " m", cx - 40, cy + 40)}

        ${svgLine(cx, cy, cx, cy - H * 5, "#444", 4)}
        ${svgLabel("Height: " + H.toFixed(1) + " m", cx + 20, cy - H * 5)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runAntennaOptimizer = function () {
    const bands = document.getElementById("ao_bands").value
        .split(",")
        .map(x => parseFloat(x.trim()));

    const maxHeight = parseFloat(document.getElementById("ao_height").value);
    const maxLength = parseFloat(document.getElementById("ao_length").value);
    const Ztarget = parseFloat(document.getElementById("ao_z").value);
    const power = parseFloat(document.getElementById("ao_pwr").value);

    const { best, bestScore } = optimize(bands, Ztarget, maxHeight, maxLength, power);

    const poster = optimizerPoster(best.length, best.height);

    const html = `
        <div class="card">
            <h3>Optimized Antenna Design</h3>

            <strong>Target Bands:</strong> ${bands.join(", ")} MHz<br>
            <strong>Target Z:</strong> ${Ztarget} Ω<br>
            <strong>Power:</strong> ${power} W<br><br>

            <strong>Optimal Length:</strong> ${best.length.toFixed(1)} m<br>
            <strong>Optimal Height:</strong> ${best.height.toFixed(1)} m<br>
            <strong>Optimization Score:</strong> ${bestScore.toFixed(1)}<br><br>

            <p>This geometry balances impedance match, efficiency, harmonic alignment, and thermal safety.</p>
            <p>Use this as a starting point for real-world tuning.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("ao_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Optimizer Notes</h3>
        <p>This AI uses a multi-factor scoring model.</p>
        <p>It balances electrical, mechanical, and thermal constraints.</p>
        <p>Harmonic alignment is key for multiband performance.</p>
        <p>Use the optimized geometry as a baseline for fine tuning.</p>
    `;
};
