/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Balun & Unun Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("balun-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function balunLabUI() {
    return `
        <h2>Balun & Unun Lab</h2>

        <div class="card">
            <label>Transformer Ratio:</label><br>
            <select id="bal_ratio">
                <option value="1">1:1 Current Balun</option>
                <option value="4">4:1 Balun</option>
                <option value="9">9:1 Unun</option>
                <option value="49">49:1 EFHW</option>
                <option value="64">64:1 EFHW</option>
            </select><br><br>

            <label>Frequency (MHz):</label><br>
            <input id="bal_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Power (W):</label><br>
            <input id="bal_power" type="number" value="100"><br><br>

            <button class="btn-primary" onclick="runBalunLab()">Analyze</button>
        </div>

        <div id="balun_results"></div>
    `;
}

/* ------------------------------------------------------------
   Balun / Unun Math
   ------------------------------------------------------------ */

/**
 * Recommended core mix by ratio
 */
function coreMix(ratio) {
    switch (ratio) {
        case 1:  return "Mix 31 or Mix 43 (CMC suppression)";
        case 4:  return "Mix 43 (balanced antennas)";
        case 9:  return "Mix 43 or Mix 52 (random wire)";
        case 49: return "Mix 43 or Mix 52 (EFHW)";
        case 64: return "Mix 52 (high‑Z EFHW)";
        default: return "Unknown";
    }
}

/**
 * Estimated power handling
 */
function powerHandling(ratio, power) {
    if (ratio === 1) return power <= 1000 ? "Safe" : "Core heating risk";
    if (ratio === 4) return power <= 500 ? "Safe" : "High‑power caution";
    if (ratio === 9) return power <= 300 ? "Safe" : "High‑voltage caution";
    if (ratio === 49 || ratio === 64) return power <= 200 ? "Safe" : "High‑voltage danger";
    return "Unknown";
}

/**
 * Estimated feedpoint voltage
 * V ≈ sqrt(P * Z)
 */
function feedpointVoltage(ratio, power) {
    const Z = ratio * 50;
    return Math.sqrt(power * Z);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function balunPoster(ratio) {
    const inner = `
        ${svgTitle("Balun / Unun Diagram")}
        ${svgCircle(400, 300, 40, "#1e3a5f")}
        ${svgLabel(ratio + ":1", 380, 310)}
        ${svgLine(200, 300, 360, 300, "#444", 6)}
        ${svgLine(440, 300, 600, 300, "#444", 6)}
        ${svgLabel("Input", 160, 310)}
        ${svgLabel("Output", 610, 310)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runBalunLab = function () {
    const ratio = parseInt(document.getElementById("bal_ratio").value);
    const freq = parseFloat(document.getElementById("bal_freq").value);
    const power = parseFloat(document.getElementById("bal_power").value);

    const mix = coreMix(ratio);
    const rating = powerHandling(ratio, power);
    const voltage = feedpointVoltage(ratio, power);

    const poster = balunPoster(ratio);

    const html = `
        <div class="card">
            <h3>Balun / Unun Analysis</h3>

            <strong>Transformer Ratio:</strong> ${ratio}:1<br><br>

            <strong>Recommended Core Mix:</strong> ${mix}<br><br>

            <strong>Power Handling:</strong> ${rating}<br><br>

            <strong>Estimated Feedpoint Voltage:</strong><br>
            ${voltage.toFixed(0)} V RMS<br><br>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Power:</strong> ${power} W<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("balun_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Balun & Unun Notes</h3>
        <p>1:1 current baluns suppress CMC and balance dipoles.</p>
        <p>4:1 baluns match 200‑Ω loads to 50‑Ω feedline.</p>
        <p>9:1 ununs are ideal for random‑wire antennas.</p>
        <p>49:1 and 64:1 transformers feed EFHW antennas at high voltage.</p>
        <p>Core mix selection determines bandwidth and heating.</p>
    `;
};
