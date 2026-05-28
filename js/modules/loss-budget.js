/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Loss Budget Calculator
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("loss-budget.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function lossBudgetUI() {
    return `
        <h2>Antenna Loss Budget Calculator</h2>

        <div class="card">
            <label>Input Power (W):</label><br>
            <input id="lb_pwr" type="number" value="100" step="5"><br><br>

            <label>Feedline Loss (dB):</label><br>
            <input id="lb_feed" type="number" value="1.0" step="0.1"><br><br>

            <label>Ground Loss (Ω):</label><br>
            <input id="lb_ground" type="number" value="5" step="0.5"><br><br>

            <label>Coil Loss (Ω):</label><br>
            <input id="lb_coil" type="number" value="2" step="0.5"><br><br>

            <label>Trap Loss (Ω):</label><br>
            <input id="lb_trap" type="number" value="1" step="0.5"><br><br>

            <label>Matching Network Loss (dB):</label><br>
            <input id="lb_match" type="number" value="0.5" step="0.1"><br><br>

            <label>Radiation Resistance (Ω):</label><br>
            <input id="lb_rr" type="number" value="35" step="1"><br><br>

            <button class="btn-primary" onclick="runLossBudget()">Calculate</button>
        </div>

        <div id="lb_results"></div>
    `;
}

/* ------------------------------------------------------------
   Loss Math
   ------------------------------------------------------------ */

/**
 * Convert dB loss to linear power ratio
 */
function dbToRatio(db) {
    return Math.pow(10, -db / 10);
}

/**
 * Feedline loss:
 * Pout = Pin * ratio
 */
function feedlineLoss(Pin, dB) {
    return Pin * dbToRatio(dB);
}

/**
 * Resistive losses:
 * P = I^2 * R
 * But we approximate using power division:
 * Prad = Pin * (Rr / (Rr + Rloss))
 */
function resistiveLoss(Pin, Rr, Rloss) {
    const eta = Rr / (Rr + Rloss);
    const Prad = Pin * eta;
    const Ploss = Pin - Prad;
    return { Prad, Ploss };
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function lossPoster(feedLoss, groundLoss, coilLoss, trapLoss, matchLoss, radiated) {
    const cx = 400;
    const cy = 300;

    const total = feedLoss + groundLoss + coilLoss + trapLoss + matchLoss + radiated;
    const scale = 300 / total;

    const bars = [
        { label: "Feedline", value: feedLoss, color: "#1e3a5f" },
        { label: "Ground", value: groundLoss, color: "#8b4513" },
        { label: "Coil", value: coilLoss, color: "#cc0000" },
        { label: "Trap", value: trapLoss, color: "#ff8800" },
        { label: "Match", value: matchLoss, color: "#555" },
        { label: "Radiated", value: radiated, color: "#1e8f3f" }
    ];

    let x = cx - 150;
    let rects = "";

    bars.forEach(b => {
        const w = b.value * scale;
        rects += `<rect x="${x}" y="${cy - 20}" width="${w}" height="40" fill="${b.color}" />`;
        rects += svgLabel(b.label, x + w / 2 - 20, cy + 40);
        x += w;
    });

    const inner = `
        ${svgTitle("RF Power Flow")}

        ${rects}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runLossBudget = function () {
    const Pin = parseFloat(document.getElementById("lb_pwr").value);
    const feedDb = parseFloat(document.getElementById("lb_feed").value);
    const groundR = parseFloat(document.getElementById("lb_ground").value);
    const coilR = parseFloat(document.getElementById("lb_coil").value);
    const trapR = parseFloat(document.getElementById("lb_trap").value);
    const matchDb = parseFloat(document.getElementById("lb_match").value);
    const Rr = parseFloat(document.getElementById("lb_rr").value);

    // Feedline loss
    const P_after_feed = feedlineLoss(Pin, feedDb);
    const feedLoss = Pin - P_after_feed;

    // Matching network loss
    const P_after_match = feedlineLoss(P_after_feed, matchDb);
    const matchLoss = P_after_feed - P_after_match;

    // Resistive losses
    const Rloss = groundR + coilR + trapR;
    const { Prad, Ploss } = resistiveLoss(P_after_match, Rr, Rloss);

    const groundLoss = (groundR / Rloss) * Ploss;
    const coilLoss = (coilR / Rloss) * Ploss;
    const trapLoss = (trapR / Rloss) * Ploss;

    const poster = lossPoster(feedLoss, groundLoss, coilLoss, trapLoss, matchLoss, Prad);

    const html = `
        <div class="card">
            <h3>Loss Budget Summary</h3>

            <strong>Input Power:</strong> ${Pin} W<br><br>

            <strong>Feedline Loss:</strong> ${feedLoss.toFixed(1)} W<br>
            <strong>Matching Loss:</strong> ${matchLoss.toFixed(1)} W<br>
            <strong>Ground Loss:</strong> ${groundLoss.toFixed(1)} W<br>
            <strong>Coil Loss:</strong> ${coilLoss.toFixed(1)} W<br>
            <strong>Trap Loss:</strong> ${trapLoss.toFixed(1)} W<br><br>

            <strong>Radiated Power:</strong> ${Prad.toFixed(1)} W<br>
            <strong>Total Efficiency:</strong> ${(Prad / Pin * 100).toFixed(1)}%<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("lb_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Loss Notes</h3>
        <p>Every component contributes to total system loss.</p>
        <p>Feedline and matching losses are in dB.</p>
        <p>Ground, coil, and trap losses are resistive.</p>
        <p>Radiated power is what actually leaves the antenna.</p>
    `;
};
