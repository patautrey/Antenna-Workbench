/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna System Gain Calculator
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("system-gain.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function systemGainUI() {
    return `
        <h2>Antenna System Gain Calculator</h2>

        <div class="card">
            <label>Input Power (W):</label><br>
            <input id="sg_pwr" type="number" value="100" step="5"><br><br>

            <label>Antenna Gain (dBi):</label><br>
            <input id="sg_gain" type="number" value="2.1" step="0.1"><br><br>

            <label>Feedline Loss (dB):</label><br>
            <input id="sg_feed" type="number" value="1.0" step="0.1"><br><br>

            <label>Mismatch Loss (dB):</label><br>
            <input id="sg_mismatch" type="number" value="0.5" step="0.1"><br><br>

            <label>Ground Loss (dB):</label><br>
            <input id="sg_ground" type="number" value="1.5" step="0.1"><br><br>

            <label>Height Gain (dB):</label><br>
            <input id="sg_height" type="number" value="1.0" step="0.1"><br><br>

            <button class="btn-primary" onclick="runSystemGain()">Calculate System Gain</button>
        </div>

        <div id="sg_results"></div>
    `;
}

/* ------------------------------------------------------------
   Gain Math
   ------------------------------------------------------------ */

/**
 * Convert dB to linear ratio
 */
function dbToRatio(db) {
    return Math.pow(10, db / 10);
}

/**
 * Convert linear ratio to dB
 */
function ratioToDb(r) {
    return 10 * Math.log10(r);
}

/**
 * Apply loss:
 * Pout = Pin * 10^(-loss/10)
 */
function applyLoss(Pin, lossDb) {
    return Pin * Math.pow(10, -lossDb / 10);
}

/**
 * EIRP:
 * EIRP = Pout * Gain_linear
 */
function eirp(P, gainDb) {
    return P * dbToRatio(gainDb);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function gainPoster(gainDb) {
    const cx = 400;
    const cy = 300;

    const barWidth = 300;
    const scaled = barWidth * (gainDb / 10);

    const inner = `
        ${svgTitle("System Gain Budget")}

        ${svgLine(cx - barWidth/2, cy, cx + barWidth/2, cy, "#444", 20)}
        ${svgLine(cx - barWidth/2, cy, cx - barWidth/2 + scaled, cy, "#1e3a5f", 20)}

        ${svgLabel(gainDb.toFixed(2) + " dB", cx - 20, cy - 30)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runSystemGain = function () {
    const Pin = parseFloat(document.getElementById("sg_pwr").value);
    const Gant = parseFloat(document.getElementById("sg_gain").value);
    const Lfeed = parseFloat(document.getElementById("sg_feed").value);
    const Lmis = parseFloat(document.getElementById("sg_mismatch").value);
    const Lground = parseFloat(document.getElementById("sg_ground").value);
    const Gheight = parseFloat(document.getElementById("sg_height").value);

    // Apply losses
    const P_after_feed = applyLoss(Pin, Lfeed);
    const P_after_mismatch = applyLoss(P_after_feed, Lmis);
    const P_after_ground = applyLoss(P_after_mismatch, Lground);

    // Total antenna gain
    const Gtotal = Gant + Gheight;

    // EIRP
    const E = eirp(P_after_ground, Gtotal);

    // Net system gain (relative to input power)
    const netGainDb = ratioToDb(E / Pin);

    const poster = gainPoster(netGainDb);

    const html = `
        <div class="card">
            <h3>System Gain Summary</h3>

            <strong>Input Power:</strong> ${Pin} W<br><br>

            <strong>Feedline Loss:</strong> ${Lfeed} dB<br>
            <strong>Mismatch Loss:</strong> ${Lmis} dB<br>
            <strong>Ground Loss:</strong> ${Lground} dB<br><br>

            <strong>Antenna Gain:</strong> ${Gant} dBi<br>
            <strong>Height Gain:</strong> ${Gheight} dB<br>
            <strong>Total Antenna Gain:</strong> ${Gtotal.toFixed(2)} dB<br><br>

            <strong>EIRP:</strong> ${E.toFixed(1)} W<br>
            <strong>Net System Gain:</strong> ${netGainDb.toFixed(2)} dB<br><br>

            <p>System gain includes antenna gain, height gain, and all system losses.</p>
            <p>EIRP represents the effective radiated power in the direction of maximum gain.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("sg_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>System Gain Notes</h3>
        <p>Feedline loss often dominates system loss.</p>
        <p>Height gain improves low-angle radiation for DX.</p>
        <p>Mismatch loss reduces delivered power before radiation.</p>
        <p>EIRP is the true measure of system performance.</p>
    `;
};
