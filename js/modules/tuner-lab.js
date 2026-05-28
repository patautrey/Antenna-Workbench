/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Tuner Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("tuner-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function tunerLabUI() {
    return `
        <h2>Antenna Tuner Lab</h2>

        <div class="card">
            <label>Load Impedance (Ω):</label><br>
            <input id="tun_zl" type="number" value="200"><br><br>

            <label>Line Impedance (Ω):</label><br>
            <input id="tun_z0" type="number" value="50"><br><br>

            <label>Tuner Type:</label><br>
            <select id="tun_type">
                <option value="l">L‑Network</option>
                <option value="t">T‑Network</option>
                <option value="pi">Pi‑Network</option>
            </select><br><br>

            <label>Tuner Loss (dB):</label><br>
            <input id="tun_loss" type="number" value="0.5" step="0.1"><br><br>

            <label>Power (W):</label><br>
            <input id="tun_power" type="number" value="100"><br><br>

            <button class="btn-primary" onclick="runTunerLab()">Analyze</button>
        </div>

        <div id="tuner_results"></div>
    `;
}

/* ------------------------------------------------------------
   Tuner Math
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
 * Tuner efficiency:
 * η = 10^(-Loss_dB / 10)
 */
function tunerEfficiency(lossDb) {
    return Math.pow(10, -lossDb / 10);
}

/**
 * Power delivered:
 * P_out = P_in * η
 */
function deliveredPower(powerIn, eta) {
    return powerIn * eta;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function tunerPoster(type) {
    let inner = `${svgTitle("Antenna Tuner Diagram")}`;

    if (type === "l") {
        inner += `
            ${svgLine(200, 300, 350, 300, "#1e3a5f", 6)}
            ${svgCircle(350, 300, 20, "#ffb400")}
            ${svgLine(350, 300, 500, 300, "#1e3a5f", 6)}
            ${svgLabel("L‑Network", 360, 350)}
        `;
    }

    if (type === "t") {
        inner += `
            ${svgLine(200, 300, 300, 300, "#1e3a5f", 6)}
            ${svgCircle(300, 300, 20, "#ffb400")}
            ${svgCircle(400, 300, 20, "#ffb400")}
            ${svgCircle(500, 300, 20, "#ffb400")}
            ${svgLine(500, 300, 600, 300, "#1e3a5f", 6)}
            ${svgLabel("T‑Network", 360, 350)}
        `;
    }

    if (type === "pi") {
        inner += `
            ${svgLine(200, 300, 300, 300, "#1e3a5f", 6)}
            ${svgCircle(300, 300, 20, "#ffb400")}
            ${svgCircle(400, 250, 20, "#ffb400")}
            ${svgCircle(500, 300, 20, "#ffb400")}
            ${svgLine(500, 300, 600, 300, "#1e3a5f", 6)}
            ${svgLabel("Pi‑Network", 360, 350)}
        `;
    }

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runTunerLab = function () {
    const zl = parseFloat(document.getElementById("tun_zl").value);
    const z0 = parseFloat(document.getElementById("tun_z0").value);
    const type = document.getElementById("tun_type").value;
    const lossDb = parseFloat(document.getElementById("tun_loss").value);
    const power = parseFloat(document.getElementById("tun_power").value);

    const gamma = reflectionCoefficient(zl, z0);
    const swr = swrFromGamma(gamma);
    const eta = tunerEfficiency(lossDb);
    const pout = deliveredPower(power, eta);

    const poster = tunerPoster(type);

    const html = `
        <div class="card">
            <h3>Tuner Analysis</h3>

            <strong>Load Impedance:</strong> ${zl} Ω<br>
            <strong>Line Impedance:</strong> ${z0} Ω<br>
            <strong>Tuner Type:</strong> ${type}<br><br>

            <strong>Input SWR:</strong> ${swr.toFixed(2)}<br>
            <strong>Tuner Loss:</strong> ${lossDb.toFixed(1)} dB<br>
            <strong>Tuner Efficiency:</strong> ${(eta * 100).toFixed(1)}%<br><br>

            <strong>Input Power:</strong> ${power} W<br>
            <strong>Delivered Power:</strong> ${pout.toFixed(1)} W<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("tuner_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Tuner Notes</h3>
        <p>Tuners do not eliminate SWR — they hide it from the radio.</p>
        <p>Tuner loss can be significant at high mismatch ratios.</p>
        <p>T‑networks have wide matching range but higher loss.</p>
        <p>L‑networks are most efficient but limited in range.</p>
    `;
};
