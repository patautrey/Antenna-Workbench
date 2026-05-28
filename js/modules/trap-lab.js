/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Trap Antenna Lab
   ============================================================ */

import { wavelengthMeters } from "../core/vf-engine.js";
import { formatLengthMetersFeet } from "../core/vf-engine.js";
import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("trap-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function trapLabUI() {
    return `
        <h2>Trap Antenna Lab</h2>

        <div class="card">
            <label>Trap Frequency (MHz):</label><br>
            <input id="trap_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Inductance (µH):</label><br>
            <input id="trap_L" type="number" value="8" step="0.1"><br><br>

            <label>Trap Position (meters from feedpoint):</label><br>
            <input id="trap_pos" type="number" value="10" step="0.1"><br><br>

            <button class="btn-primary" onclick="runTrapLab()">Analyze</button>
        </div>

        <div id="trap_results"></div>
    `;
}

/* ------------------------------------------------------------
   Trap Math
   ------------------------------------------------------------ */

/**
 * Trap capacitance:
 * C = 1 / ( (2πf)^2 * L )
 */
function trapCapacitance(freqMhz, inductanceUhy) {
    const f = freqMhz * 1e6;
    const L = inductanceUhy * 1e-6;
    const C = 1 / (Math.pow(2 * Math.PI * f, 2) * L);
    return C * 1e12; // pF
}

/**
 * Trap Q approximation:
 * Q ≈ (2π f L) / R_loss
 * Assume R_loss ≈ 0.5 Ω for typical trap
 */
function trapQ(freqMhz, inductanceUhy) {
    const f = freqMhz * 1e6;
    const L = inductanceUhy * 1e-6;
    const Rloss = 0.5;
    return (2 * Math.PI * f * L) / Rloss;
}

/**
 * Trap loss:
 * Loss_dB ≈ 1 / Q
 */
function trapLossDb(Q) {
    return 1 / Q;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function trapPoster(positionMeters) {
    const px = 100 + positionMeters * 20;

    const inner = `
        ${svgTitle("Trap Antenna Diagram")}
        ${svgLine(100, 300, 700, 300, "#1e3a5f", 6)}
        ${svgCircle(px, 300, 12, "#ffb400")}
        ${svgLabel("Trap", px - 20, 330)}
        ${svgLabel("Position: " + positionMeters.toFixed(1) + " m", 20, 80)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runTrapLab = function () {
    const freq = parseFloat(document.getElementById("trap_freq").value);
    const L = parseFloat(document.getElementById("trap_L").value);
    const pos = parseFloat(document.getElementById("trap_pos").value);

    const C = trapCapacitance(freq, L);
    const Q = trapQ(freq, L);
    const loss = trapLossDb(Q);

    const poster = trapPoster(pos);

    const html = `
        <div class="card">
            <h3>Trap Analysis</h3>

            <strong>Trap Frequency:</strong> ${freq} MHz<br><br>

            <strong>Inductance:</strong> ${L} µH<br>
            <strong>Capacitance:</strong> ${C.toFixed(1)} pF<br><br>

            <strong>Trap Q:</strong> ${Q.toFixed(0)}<br>
            <strong>Estimated Loss:</strong> ${loss.toFixed(4)} dB<br><br>

            <strong>Trap Position:</strong><br>
            ${formatLengthMetersFeet(pos)}<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("trap_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Trap Notes</h3>
        <p>Traps allow multi‑band operation by isolating outer wire sections.</p>
        <p>Higher Q traps reduce loss but require better components.</p>
        <p>Trap placement determines which bands are supported.</p>
        <p>Trap resonance must be above the lower band and below the upper band.</p>
    `;
};
