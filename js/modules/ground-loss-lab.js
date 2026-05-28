/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Ground Loss & Soil Conductivity Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";
import { wavelengthMeters } from "../core/vf-engine.js";

console.log("ground-loss-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function groundLossLabUI() {
    return `
        <h2>Ground Loss & Soil Conductivity Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="gl_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Soil Conductivity (mS/m):</label><br>
            <select id="gl_cond">
                <option value="1">Very Poor (1 mS/m)</option>
                <option value="5">Poor (5 mS/m)</option>
                <option value="15">Average (15 mS/m)</option>
                <option value="30">Good (30 mS/m)</option>
                <option value="50">Excellent (50 mS/m)</option>
            </select><br><br>

            <label>Radial System:</label><br>
            <select id="gl_radials">
                <option value="0">No Radials</option>
                <option value="4">4 Radials</option>
                <option value="16">16 Radials</option>
                <option value="32">32 Radials</option>
                <option value="64">64 Radials</option>
            </select><br><br>

            <button class="btn-primary" onclick="runGroundLossLab()">Analyze</button>
        </div>

        <div id="groundloss_results"></div>
    `;
}

/* ------------------------------------------------------------
   Ground Loss Math
   ------------------------------------------------------------ */

/**
 * Ground loss approximation:
 * Rg ≈ 160 / sqrt(σ)   (σ in mS/m)
 */
function groundLoss(conductivity) {
    return 160 / Math.sqrt(conductivity);
}

/**
 * Radial improvement factor:
 * More radials → lower ground loss.
 */
function radialReduction(radials) {
    if (radials === 0) return 1.0;
    if (radials === 4) return 0.7;
    if (radials === 16) return 0.45;
    if (radials === 32) return 0.30;
    if (radials === 64) return 0.20;
    return 1.0;
}

/**
 * Radiation resistance of a quarter‑wave vertical:
 * Rr ≈ 36 Ω
 */
function radiationResistance() {
    return 36;
}

/**
 * Efficiency:
 * η = Rr / (Rr + Rg)
 */
function efficiency(Rr, Rg) {
    return Rr / (Rr + Rg);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function groundPoster(conductivity, radials) {
    const inner = `
        ${svgTitle("Ground Loss Model")}

        ${svgLabel("Soil Conductivity: " + conductivity + " mS/m", 20, 80)}
        ${svgLabel("Radials: " + radials, 20, 120)}

        ${svgLine(100, 350, 700, 350, "#8b4513", 20)}
        ${svgLabel("Soil Layer", 350, 390)}

        ${svgCircle(400, 200, 40, "#1e3a5f")}
        ${svgLabel("Vertical", 360, 260)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runGroundLossLab = function () {
    const freq = parseFloat(document.getElementById("gl_freq").value);
    const cond = parseFloat(document.getElementById("gl_cond").value);
    const radials = parseInt(document.getElementById("gl_radials").value);

    const Rr = radiationResistance();
    const Rg_raw = groundLoss(cond);
    const Rg = Rg_raw * radialReduction(radials);

    const eta = efficiency(Rr, Rg);

    const poster = groundPoster(cond, radials);

    const html = `
        <div class="card">
            <h3>Ground Loss Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <strong>Soil Conductivity:</strong> ${cond} mS/m<br>
            <strong>Radials:</strong> ${radials}<br><br>

            <strong>Radiation Resistance:</strong> ${Rr.toFixed(1)} Ω<br>
            <strong>Ground Loss Resistance:</strong> ${Rg.toFixed(1)} Ω<br><br>

            <strong>Estimated Efficiency:</strong><br>
            ${(eta * 100).toFixed(1)}%<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("groundloss_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Ground Loss Notes</h3>
        <p>Soil conductivity dramatically affects vertical antenna performance.</p>
        <p>Radials reduce ground loss by providing a low‑resistance return path.</p>
        <p>Poor soil can have >100 Ω of loss without radials.</p>
        <p>Efficiency improves rapidly with the first few radials.</p>
    `;
};
