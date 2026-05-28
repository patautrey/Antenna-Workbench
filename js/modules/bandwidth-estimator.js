/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Bandwidth Estimator
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("bandwidth-estimator.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function bandwidthEstimatorUI() {
    return `
        <h2>Antenna Bandwidth Estimator</h2>

        <div class="card">
            <label>Resonant Frequency (MHz):</label><br>
            <input id="bw_f0" type="number" value="7.2" step="0.1"><br><br>

            <label>Radiation Resistance (Ω):</label><br>
            <input id="bw_rr" type="number" value="35" step="1"><br><br>

            <label>Loss Resistance (Ω):</label><br>
            <input id="bw_rl" type="number" value="5" step="0.5"><br><br>

            <label>Target SWR Limit:</label><br>
            <input id="bw_swr" type="number" value="2" step="0.1"><br><br>

            <button class="btn-primary" onclick="runBandwidthEstimator()">Estimate Bandwidth</button>
        </div>

        <div id="bw_results"></div>
    `;
}

/* ------------------------------------------------------------
   Bandwidth Math
   ------------------------------------------------------------ */

/**
 * Q-factor:
 * Q = (Rr + Rloss) / Rr
 * (approximation for small antennas)
 */
function qFactor(Rr, Rloss) {
    return (Rr + Rloss) / Rr;
}

/**
 * Bandwidth:
 * BW = f0 / Q
 * (in MHz)
 */
function bandwidth(f0, Q) {
    return f0 / Q;
}

/**
 * SWR-based bandwidth:
 * Δf ≈ f0 * sqrt((SWR - 1) / Q)
 */
function swrBandwidth(f0, Q, swrLimit) {
    const ratio = (swrLimit - 1) / Q;
    return f0 * Math.sqrt(Math.max(0, ratio));
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function bwPoster(f0, BW) {
    const cx = 400;
    const cy = 300;

    const scale = 300 / BW;

    const inner = `
        ${svgTitle("Resonance Bandwidth")}

        ${svgLine(cx - 150, cy, cx + 150, cy, "#444", 4)}

        ${svgLine(cx - (BW * scale)/2, cy, cx + (BW * scale)/2, cy, "#1e3a5f", 12)}

        ${svgLabel("BW = " + BW.toFixed(3) + " MHz", cx - 60, cy + 40)}
        ${svgLabel("f0 = " + f0.toFixed(2) + " MHz", cx - 50, cy - 40)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runBandwidthEstimator = function () {
    const f0 = parseFloat(document.getElementById("bw_f0").value);
    const Rr = parseFloat(document.getElementById("bw_rr").value);
    const Rloss = parseFloat(document.getElementById("bw_rl").value);
    const swrLimit = parseFloat(document.getElementById("bw_swr").value);

    const Q = qFactor(Rr, Rloss);
    const BW = bandwidth(f0, Q);
    const SWRBW = swrBandwidth(f0, Q, swrLimit);

    const poster = bwPoster(f0, BW);

    const html = `
        <div class="card">
            <h3>Bandwidth Analysis</h3>

            <strong>Resonant Frequency:</strong> ${f0} MHz<br>
            <strong>Radiation Resistance:</strong> ${Rr} Ω<br>
            <strong>Loss Resistance:</strong> ${Rloss} Ω<br>
            <strong>Target SWR:</strong> ${swrLimit}<br><br>

            <strong>Q-Factor:</strong> ${Q.toFixed(2)}<br>
            <strong>Estimated Bandwidth:</strong> ${BW.toFixed(3)} MHz<br>
            <strong>SWR-Limited Bandwidth:</strong> ±${SWRBW.toFixed(3)} MHz<br><br>

            <p>Bandwidth decreases as Q increases.</p>
            <p>Short antennas have very narrow bandwidth.</p>
            <p>Loading coils and traps increase Q and reduce bandwidth.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("bw_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Bandwidth Notes</h3>
        <p>Bandwidth is inversely proportional to Q.</p>
        <p>Loss resistance broadens bandwidth but reduces efficiency.</p>
        <p>High-Q antennas (short, loaded, trapped) have razor-thin bandwidth.</p>
        <p>SWR-limited bandwidth is often narrower than theoretical bandwidth.</p>
    `;
};
