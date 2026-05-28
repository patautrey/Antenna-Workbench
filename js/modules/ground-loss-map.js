/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Ground Loss Mapping Engine
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("ground-loss-map.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function groundLossMapUI() {
    return `
        <h2>Ground Loss Mapping Engine</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="glm_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Ground Conductivity (mS/m):</label><br>
            <input id="glm_cond" type="number" value="5" step="0.5"><br><br>

            <label>Dielectric Constant (εr):</label><br>
            <input id="glm_er" type="number" value="13" step="1"><br><br>

            <label>Antenna Height (meters):</label><br>
            <input id="glm_h" type="number" value="10" step="0.5"><br><br>

            <button class="btn-primary" onclick="runGroundLossMap()">Analyze Ground Loss</button>
        </div>

        <div id="glm_results"></div>
    `;
}

/* ------------------------------------------------------------
   Ground Loss Math
   ------------------------------------------------------------ */

/**
 * Near-field ground loss approximation:
 * Loss_nf ≈ (1 / cond) * (1 / height)
 */
function nearFieldLoss(cond, h) {
    return (1 / cond) * (1 / h);
}

/**
 * Far-field reflection loss:
 * Loss_ff ≈ exp(-sqrt(freq / cond))
 */
function farFieldLoss(freq, cond) {
    return Math.exp(-Math.sqrt(freq / cond));
}

/**
 * Total ground loss (normalized):
 * Loss_total = Loss_nf + Loss_ff
 */
function totalGroundLoss(freq, cond, h) {
    return nearFieldLoss(cond, h) + farFieldLoss(freq, cond);
}

/**
 * Efficiency impact:
 * Eff = 1 / (1 + Loss_total)
 */
function groundEfficiency(L) {
    return 1 / (1 + L);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function groundLossPoster(L) {
    const cx = 400;
    const cy = 300;

    const barWidth = 300;
    const scaled = Math.min(barWidth, L * 40);

    const inner = `
        ${svgTitle("Ground Loss")}

        ${svgLine(cx - barWidth/2, cy, cx + barWidth/2, cy, "#444", 20)}
        ${svgLine(cx - barWidth/2, cy, cx - barWidth/2 + scaled, cy, "#8b4513", 20)}

        ${svgLabel("Loss", cx - 20, cy - 30)}
        ${svgLabel(L.toFixed(2), cx - 20, cy + 40)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runGroundLossMap = function () {
    const freq = parseFloat(document.getElementById("glm_freq").value);
    const cond = parseFloat(document.getElementById("glm_cond").value);
    const er = parseFloat(document.getElementById("glm_er").value);
    const h = parseFloat(document.getElementById("glm_h").value);

    const Lnf = nearFieldLoss(cond, h);
    const Lff = farFieldLoss(freq, cond);
    const Ltot = totalGroundLoss(freq, cond, h);
    const eta = groundEfficiency(Ltot);

    const poster = groundLossPoster(Ltot);

    const html = `
        <div class="card">
            <h3>Ground Loss Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Conductivity:</strong> ${cond} mS/m<br>
            <strong>Dielectric Constant:</strong> ${er}<br>
            <strong>Antenna Height:</strong> ${h} m<br><br>

            <strong>Near-Field Loss:</strong> ${Lnf.toFixed(3)}<br>
            <strong>Far-Field Loss:</strong> ${Lff.toFixed(3)}<br>
            <strong>Total Ground Loss:</strong> ${Ltot.toFixed(3)}<br>
            <strong>Ground Efficiency:</strong> ${(eta * 100).toFixed(1)}%<br><br>

            <p>Ground loss affects both near-field absorption and far-field reflection.</p>
            <p>Low conductivity soils (dry sand, rocky soil) increase loss dramatically.</p>
            <p>High conductivity soils (wet clay, saltwater) improve low-angle DX performance.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("glm_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Ground Loss Notes</h3>
        <p>Ground loss is a major factor in real-world HF performance.</p>
        <p>Near-field loss dominates for low antennas.</p>
        <p>Far-field loss affects DX takeoff angles.</p>
        <p>Conductivity and dielectric constant vary dramatically by region.</p>
    `;
};
