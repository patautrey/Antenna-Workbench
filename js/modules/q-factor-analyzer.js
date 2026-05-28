/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Q-Factor Analyzer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("q-factor-analyzer.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function qFactorAnalyzerUI() {
    return `
        <h2>Antenna Q-Factor Analyzer</h2>

        <div class="card">
            <label>Resonant Frequency (MHz):</label><br>
            <input id="q_f0" type="number" value="7.2" step="0.1"><br><br>

            <label>Bandwidth (kHz):</label><br>
            <input id="q_bw" type="number" value="150" step="10"><br><br>

            <label>Radiation Resistance (Ω):</label><br>
            <input id="q_rr" type="number" value="35" step="1"><br><br>

            <label>Loss Resistance (Ω):</label><br>
            <input id="q_rl" type="number" value="5" step="0.5"><br><br>

            <button class="btn-primary" onclick="runQFactorAnalyzer()">Analyze</button>
        </div>

        <div id="q_results"></div>
    `;
}

/* ------------------------------------------------------------
   Q-Factor Math
   ------------------------------------------------------------ */

/**
 * Q from bandwidth:
 * Q = f0 / BW
 */
function qFromBandwidth(f0, bwKhz) {
    return (f0 * 1000) / bwKhz;
}

/**
 * Efficiency:
 * η = Rr / (Rr + Rloss)
 */
function efficiency(Rr, Rloss) {
    return Rr / (Rr + Rloss);
}

/**
 * Bandwidth from Q:
 * BW = f0 / Q
 */
function bandwidthFromQ(f0, Q) {
    return (f0 * 1000) / Q;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function qPoster(Q) {
    const cx = 400;
    const cy = 300;

    const baseWidth = 300;
    const width = Math.max(20, baseWidth / (Q / 10));

    const inner = `
        ${svgTitle("Resonance Sharpness")}

        ${svgLine(cx - baseWidth/2, cy, cx + baseWidth/2, cy, "#444", 4)}
        ${svgLine(cx - width/2, cy, cx + width/2, cy, "#1e3a5f", 12)}

        ${svgLabel("High Q → Narrow Bandwidth", cx - 120, cy - 40)}
        ${svgLabel("Q = " + Q.toFixed(1), cx - 20, cy + 30)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runQFactorAnalyzer = function () {
    const f0 = parseFloat(document.getElementById("q_f0").value);
    const bw = parseFloat(document.getElementById("q_bw").value);
    const Rr = parseFloat(document.getElementById("q_rr").value);
    const Rloss = parseFloat(document.getElementById("q_rl").value);

    const Q = qFromBandwidth(f0, bw);
    const eta = efficiency(Rr, Rloss);
    const bwFromQ = bandwidthFromQ(f0, Q);

    const poster = qPoster(Q);

    const html = `
        <div class="card">
            <h3>Q-Factor Analysis</h3>

            <strong>Resonant Frequency:</strong> ${f0} MHz<br>
            <strong>Bandwidth:</strong> ${bw} kHz<br>
            <strong>Radiation Resistance:</strong> ${Rr} Ω<br>
            <strong>Loss Resistance:</strong> ${Rloss} Ω<br><br>

            <strong>Q-Factor:</strong> ${Q.toFixed(1)}<br>
            <strong>Efficiency:</strong> ${(eta * 100).toFixed(1)}%<br>
            <strong>Bandwidth from Q:</strong> ${bwFromQ.toFixed(1)} kHz<br><br>

            <p>High Q means narrow bandwidth and sharp tuning.</p>
            <p>Low Q means broader bandwidth and easier matching.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("q_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Q-Factor Notes</h3>
        <p>Loaded antennas (coils, traps) have higher Q and narrower bandwidth.</p>
        <p>Short antennas have very high Q due to low radiation resistance.</p>
        <p>Efficiency and Q are linked through Rr and Rloss.</p>
        <p>Q determines how “touchy” the antenna is to frequency changes.</p>
    `;
};
