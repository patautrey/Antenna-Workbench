/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: SWR & Transmission Line Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("swr-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function swrLabUI() {
    return `
        <h2>SWR & Transmission Line Lab</h2>

        <div class="card">
            <label>Load Impedance (Ω):</label><br>
            <input id="swr_zl" type="number" value="75"><br><br>

            <label>Line Impedance (Ω):</label><br>
            <input id="swr_z0" type="number" value="50"><br><br>

            <label>Frequency (MHz):</label><br>
            <input id="swr_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Line Length (meters):</label><br>
            <input id="swr_len" type="number" value="20" step="0.1"><br><br>

            <label>Line Loss (dB per 100m):</label><br>
            <input id="swr_loss" type="number" value="1.5" step="0.1"><br><br>

            <button class="btn-primary" onclick="runSwrLab()">Analyze</button>
        </div>

        <div id="swr_results"></div>
    `;
}

/* ------------------------------------------------------------
   SWR Math
   ------------------------------------------------------------ */

/**
 * Reflection coefficient:
 * Γ = (ZL - Z0) / (ZL + Z0)
 */
function reflectionCoefficient(zl, z0) {
    return (zl - z0) / (zl + z0);
}

/**
 * SWR:
 * SWR = (1 + |Γ|) / (1 - |Γ|)
 */
function swrFromGamma(gamma) {
    const g = Math.abs(gamma);
    return (1 + g) / (1 - g);
}

/**
 * Return loss:
 * RL = -20 log10(|Γ|)
 */
function returnLoss(gamma) {
    return -20 * Math.log10(Math.abs(gamma));
}

/**
 * Line loss:
 * Loss_dB = (length / 100m) * loss_per_100m
 */
function lineLoss(lengthMeters, lossPer100m) {
    return (lengthMeters / 100) * lossPer100m;
}

/* ------------------------------------------------------------
   Poster Generator (SWR Curve)
   ------------------------------------------------------------ */

function swrPoster(swr) {
    const baseY = 400;
    const height = Math.min(300, swr * 40);

    const inner = `
        ${svgTitle("SWR Visualization")}
        ${svgLine(200, baseY, 200, baseY - height, "#cc0000", 20)}
        ${svgLabel("SWR: " + swr.toFixed(2), 180, baseY - height - 20)}
    `;

    return svgWrapper(inner, 600, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runSwrLab = function () {
    const zl = parseFloat(document.getElementById("swr_zl").value);
    const z0 = parseFloat(document.getElementById("swr_z0").value);
    const freq = parseFloat(document.getElementById("swr_freq").value);
    const len = parseFloat(document.getElementById("swr_len").value);
    const loss100 = parseFloat(document.getElementById("swr_loss").value);

    const gamma = reflectionCoefficient(zl, z0);
    const swr = swrFromGamma(gamma);
    const rl = returnLoss(gamma);
    const loss = lineLoss(len, loss100);

    const poster = swrPoster(swr);

    const html = `
        <div class="card">
            <h3>SWR & Line Analysis</h3>

            <strong>Load Impedance:</strong> ${zl} Ω<br>
            <strong>Line Impedance:</strong> ${z0} Ω<br>
            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <strong>Reflection Coefficient (Γ):</strong> ${gamma.toFixed(3)}<br>
            <strong>SWR:</strong> ${swr.toFixed(2)}<br>
            <strong>Return Loss:</strong> ${rl.toFixed(1)} dB<br><br>

            <strong>Line Length:</strong> ${len} m<br>
            <strong>Line Loss:</strong> ${loss.toFixed(2)} dB<br>
        </div>

        <div class="card">
            <h3>SWR Visualization</h3>
            ${poster}
        </div>
    `;

    document.getElementById("swr_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>SWR Notes</h3>
        <p>SWR indicates mismatch between the line and the load.</p>
        <p>Return loss expresses mismatch in dB — higher is better.</p>
        <p>Line loss reduces power delivered to the antenna.</p>
        <p>Even with high SWR, low-loss feedline can preserve usable power.</p>
    `;
};
