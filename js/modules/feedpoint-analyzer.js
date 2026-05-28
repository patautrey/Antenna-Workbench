/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Feedpoint Analyzer (R + jX Visualizer)
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("feedpoint-analyzer.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function feedpointAnalyzerUI() {
    return `
        <h2>Feedpoint Analyzer</h2>

        <div class="card">
            <label>Resonant Frequency (MHz):</label><br>
            <input id="fa_f0" type="number" value="14.2" step="0.1"><br><br>

            <label>Bandwidth (kHz):</label><br>
            <input id="fa_bw" type="number" value="300" step="10"><br><br>

            <label>Test Frequency (MHz):</label><br>
            <input id="fa_freq" type="number" value="14.0" step="0.05"><br><br>

            <button class="btn-primary" onclick="runFeedpointAnalyzer()">Analyze</button>
        </div>

        <div id="feedpoint_results"></div>
    `;
}

/* ------------------------------------------------------------
   Feedpoint Math
   ------------------------------------------------------------ */

/**
 * Reactance approximation:
 * X ≈ 2Q * (Δf / f0) * R0
 * Using R0 = 50 Ω baseline
 */
function reactance(f0, bwKhz, fTest) {
    const R0 = 50;
    const Q = f0 * 1000 / bwKhz;
    const df = fTest - f0;
    return 2 * Q * (df / f0) * R0;
}

/**
 * Resistance approximation:
 * R ≈ 50 Ω at resonance, rising slightly off-resonance
 */
function resistance(f0, fTest) {
    const delta = Math.abs(fTest - f0);
    return 50 + delta * 2;
}

/**
 * SWR from R + jX
 */
function swr(R, X) {
    const Z = Math.sqrt(R * R + X * X);
    const num = Z + 50;
    const den = Z - 50;
    return num / Math.max(1, Math.abs(den));
}

/* ------------------------------------------------------------
   Poster Generator (Smith-like)
   ------------------------------------------------------------ */

function feedpointPoster(R, X) {
    const cx = 400;
    const cy = 300;

    const scale = 1.5; // visual exaggeration
    const px = cx + X * scale;
    const py = cy - (R - 50) * scale;

    const inner = `
        ${svgTitle("Feedpoint R + jX")}

        ${svgCircle(cx, cy, 150, "none", "#1e3a5f", 2)}
        ${svgLabel("50 Ω Center", cx - 40, cy + 170)}

        ${svgCircle(px, py, 8, "#cc0000")}
        ${svgLabel("R=" + R.toFixed(1) + " Ω", px + 15, py - 10)}
        ${svgLabel("X=" + X.toFixed(1) + " Ω", px + 15, py + 10)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runFeedpointAnalyzer = function () {
    const f0 = parseFloat(document.getElementById("fa_f0").value);
    const bw = parseFloat(document.getElementById("fa_bw").value);
    const fTest = parseFloat(document.getElementById("fa_freq").value);

    const R = resistance(f0, fTest);
    const X = reactance(f0, bw, fTest);
    const SWR = swr(R, X);

    const poster = feedpointPoster(R, X);

    const html = `
        <div class="card">
            <h3>Feedpoint Analysis</h3>

            <strong>Resonant Frequency:</strong> ${f0} MHz<br>
            <strong>Bandwidth:</strong> ${bw} kHz<br>
            <strong>Test Frequency:</strong> ${fTest} MHz<br><br>

            <strong>Resistance (R):</strong> ${R.toFixed(1)} Ω<br>
            <strong>Reactance (X):</strong> ${X.toFixed(1)} Ω<br>
            <strong>SWR:</strong> ${SWR.toFixed(2)}<br><br>

            <p>Positive X = inductive. Negative X = capacitive.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("feedpoint_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Feedpoint Notes</h3>
        <p>Reactance crosses zero at resonance.</p>
        <p>Bandwidth determines how quickly X rises off-resonance.</p>
        <p>SWR is derived from the magnitude of the complex impedance.</p>
        <p>Inductive (X>0) means antenna is short; capacitive (X<0) means long.</p>
    `;
};
