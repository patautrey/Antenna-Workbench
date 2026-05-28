/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Efficiency Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("efficiency-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function efficiencyLabUI() {
    return `
        <h2>Antenna Efficiency Lab</h2>

        <div class="card">
            <label>Radiation Resistance (Ω):</label><br>
            <input id="eff_rr" type="number" value="35" step="1"><br><br>

            <label>Loss Resistance (Ω):</label><br>
            <input id="eff_rl" type="number" value="5" step="0.5"><br><br>

            <label>Input Power (W):</label><br>
            <input id="eff_pwr" type="number" value="100" step="5"><br><br>

            <button class="btn-primary" onclick="runEfficiencyLab()">Analyze</button>
        </div>

        <div id="efficiency_results"></div>
    `;
}

/* ------------------------------------------------------------
   Efficiency Math
   ------------------------------------------------------------ */

/**
 * Efficiency:
 * η = Rr / (Rr + Rloss)
 */
function efficiency(Rr, Rloss) {
    return Rr / (Rr + Rloss);
}

/**
 * Radiated power:
 * Prad = Pin * η
 */
function radiatedPower(Pin, eta) {
    return Pin * eta;
}

/**
 * Heat loss:
 * Ploss = Pin - Prad
 */
function heatLoss(Pin, Prad) {
    return Pin - Prad;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function efficiencyPoster(eta) {
    const cx = 400;
    const cy = 300;

    const barWidth = 300;
    const effWidth = barWidth * eta;
    const lossWidth = barWidth - effWidth;

    const inner = `
        ${svgTitle("Antenna Efficiency")}

        ${svgLine(cx - barWidth/2, cy, cx + barWidth/2, cy, "#444", 20)}
        ${svgLine(cx - barWidth/2, cy, cx - barWidth/2 + effWidth, cy, "#1e8f3f", 20)}
        ${svgLine(cx - barWidth/2 + effWidth, cy, cx + barWidth/2, cy, "#cc0000", 20)}

        ${svgLabel("Radiated", cx - barWidth/2 + effWidth/2 - 20, cy - 25)}
        ${svgLabel("Lost as Heat", cx + lossWidth/2 - 20, cy - 25)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runEfficiencyLab = function () {
    const Rr = parseFloat(document.getElementById("eff_rr").value);
    const Rloss = parseFloat(document.getElementById("eff_rl").value);
    const Pin = parseFloat(document.getElementById("eff_pwr").value);

    const eta = efficiency(Rr, Rloss);
    const Prad = radiatedPower(Pin, eta);
    const Ploss = heatLoss(Pin, Prad);

    const poster = efficiencyPoster(eta);

    const html = `
        <div class="card">
            <h3>Antenna Efficiency Analysis</h3>

            <strong>Radiation Resistance:</strong> ${Rr} Ω<br>
            <strong>Loss Resistance:</strong> ${Rloss} Ω<br>
            <strong>Input Power:</strong> ${Pin} W<br><br>

            <strong>Efficiency:</strong> ${(eta * 100).toFixed(1)}%<br>
            <strong>Radiated Power:</strong> ${Prad.toFixed(1)} W<br>
            <strong>Heat Loss:</strong> ${Ploss.toFixed(1)} W<br><br>

            <p>Efficiency is determined by the ratio of radiation resistance to total resistance.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("efficiency_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Efficiency Notes</h3>
        <p>Low-band antennas often have low radiation resistance.</p>
        <p>Loss resistance includes wire loss, ground loss, and loading coil loss.</p>
        <p>Efficiency improves dramatically when radiation resistance increases.</p>
        <p>Small antennas tend to be inefficient due to low Rr.</p>
    `;
};
