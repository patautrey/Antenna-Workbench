/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Magnetic Loop Lab
   ============================================================ */

import { wavelengthMeters } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { svgWrapper, svgTitle, svgCircle, svgLabel } from "../core/poster-engine.js";

console.log("loop-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function loopLabUI() {
    return `
        <h2>Magnetic Loop Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="loop_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Loop Diameter (meters):</label><br>
            <input id="loop_diam" type="number" value="1.0" step="0.05"><br><br>

            <label>Power (W):</label><br>
            <input id="loop_power" type="number" value="20"><br><br>

            <button class="btn-primary" onclick="runLoopLab()">Analyze</button>
        </div>

        <div id="loop_results"></div>
    `;
}

/* ------------------------------------------------------------
   Magnetic Loop Math
   ------------------------------------------------------------ */

/**
 * Loop circumference
 */
function loopCircumference(diamMeters) {
    return Math.PI * diamMeters;
}

/**
 * Required tuning capacitance:
 * C = 1 / ( (2πf)^2 * L )
 * But for small loops, approximate:
 * C ≈ 1 / ( (2πf)^2 * μ0 * A / circumference )
 */
function loopCapacitance(freqMhz, diamMeters) {
    const f = freqMhz * 1e6;
    const A = Math.PI * Math.pow(diamMeters / 2, 2);
    const circ = loopCircumference(diamMeters);
    const mu0 = 4 * Math.PI * 1e-7;

    const L = mu0 * A / circ;
    const C = 1 / (Math.pow(2 * Math.PI * f, 2) * L);

    return C * 1e12; // pF
}

/**
 * Voltage stress:
 * V ≈ sqrt(P * X)
 * X = 2π f L
 */
function loopVoltage(freqMhz, diamMeters, powerW) {
    const f = freqMhz * 1e6;
    const A = Math.PI * Math.pow(diamMeters / 2, 2);
    const circ = loopCircumference(diamMeters);
    const mu0 = 4 * Math.PI * 1e-7;

    const L = mu0 * A / circ;
    const X = 2 * Math.PI * f * L;

    return Math.sqrt(powerW * X);
}

/**
 * Efficiency approximation:
 * η ≈ R_rad / (R_rad + R_loss)
 * Very rough estimate.
 */
function loopEfficiency(freqMhz, diamMeters) {
    const lambda = wavelengthMeters(freqMhz);
    const circ = loopCircumference(diamMeters);

    const Rrad = 31200 * Math.pow(circ / lambda, 4);
    const Rloss = 1.0; // typical copper loop loss

    return Rrad / (Rrad + Rloss);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function loopPoster(diamMeters) {
    const radiusPx = 200;

    const inner = `
        ${svgTitle("Magnetic Loop Diagram")}
        ${svgCircle(400, 300, radiusPx, "none")}
        ${svgLabel("Loop Diameter: " + diamMeters.toFixed(2) + " m", 20, 80)}
    `;

    return svgWrapper(inner, 800, 600);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runLoopLab = function () {
    const freq = parseFloat(document.getElementById("loop_freq").value);
    const diam = parseFloat(document.getElementById("loop_diam").value);
    const power = parseFloat(document.getElementById("loop_power").value);

    const circ = loopCircumference(diam);
    const cap = loopCapacitance(freq, diam);
    const volt = loopVoltage(freq, diam, power);
    const eff = loopEfficiency(freq, diam);

    const poster = loopPoster(diam);

    const html = `
        <div class="card">
            <h3>Magnetic Loop Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <strong>Loop Diameter:</strong><br>
            ${formatLengthMetersFeet(diam)}<br><br>

            <strong>Circumference:</strong><br>
            ${formatLengthMetersFeet(circ)}<br><br>

            <strong>Required Tuning Capacitance:</strong><br>
            ${cap.toFixed(1)} pF<br><br>

            <strong>Voltage Stress:</strong><br>
            ${volt.toFixed(0)} V RMS<br><br>

            <strong>Estimated Efficiency:</strong><br>
            ${(eff * 100).toFixed(1)}%<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("loop_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Magnetic Loop Notes</h3>
        <p>Small loops offer high efficiency when built with low‑loss conductors.</p>
        <p>Voltage across the tuning capacitor can exceed 1–3 kV even at low power.</p>
        <p>Efficiency improves dramatically as loop diameter increases.</p>
        <p>Loops are excellent for HOA, balcony, and stealth HF operation.</p>
    `;
};
