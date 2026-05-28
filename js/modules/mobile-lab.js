/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Mobile HF Antenna Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";
import { wavelengthMeters } from "../core/vf-engine.js";

console.log("mobile-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function mobileLabUI() {
    return `
        <h2>Mobile HF Antenna Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="mob_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Antenna Length (meters):</label><br>
            <input id="mob_len" type="number" value="2.5" step="0.1"><br><br>

            <label>Loading Coil Q:</label><br>
            <input id="mob_q" type="number" value="150" step="1"><br><br>

            <label>Vehicle Ground Loss (Ω):</label><br>
            <input id="mob_ground" type="number" value="8" step="0.1"><br><br>

            <button class="btn-primary" onclick="runMobileLab()">Analyze</button>
        </div>

        <div id="mobile_results"></div>
    `;
}

/* ------------------------------------------------------------
   Mobile HF Math
   ------------------------------------------------------------ */

/**
 * Radiation resistance of a short vertical:
 * Rr ≈ 160 * (h/λ)^2
 */
function radiationResistance(freqMhz, lengthMeters) {
    const lambda = wavelengthMeters(freqMhz);
    return 160 * Math.pow(lengthMeters / lambda, 2);
}

/**
 * Coil loss:
 * Rcoil ≈ X / Q
 * X = 2πfL, but we approximate with:
 * X ≈ 200 Ω for typical HF mobile coil
 */
function coilLoss(q) {
    const X = 200;
    return X / q;
}

/**
 * Total efficiency:
 * η = Rr / (Rr + Rloss)
 */
function efficiency(Rr, Rloss) {
    return Rr / (Rr + Rloss);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function mobilePoster(lengthMeters) {
    const baseY = 350;
    const topY = baseY - lengthMeters * 40;

    const inner = `
        ${svgTitle("Mobile HF Antenna")}

        ${svgLine(400, baseY, 400, topY, "#1e3a5f", 6)}
        ${svgCircle(400, baseY, 25, "#444")}
        ${svgLabel("Vehicle Body", 350, baseY + 40)}

        ${svgLabel("Whip Length: " + lengthMeters.toFixed(1) + " m", 20, 80)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runMobileLab = function () {
    const freq = parseFloat(document.getElementById("mob_freq").value);
    const len = parseFloat(document.getElementById("mob_len").value);
    const q = parseFloat(document.getElementById("mob_q").value);
    const ground = parseFloat(document.getElementById("mob_ground").value);

    const Rr = radiationResistance(freq, len);
    const Rcoil = coilLoss(q);
    const Rloss = Rcoil + ground;

    const eta = efficiency(Rr, Rloss);

    const poster = mobilePoster(len);

    const html = `
        <div class="card">
            <h3>Mobile HF Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Antenna Length:</strong> ${len.toFixed(1)} m<br>
            <strong>Coil Q:</strong> ${q}<br>
            <strong>Vehicle Ground Loss:</strong> ${ground} Ω<br><br>

            <strong>Radiation Resistance:</strong> ${Rr.toFixed(2)} Ω<br>
            <strong>Coil Loss:</strong> ${Rcoil.toFixed(2)} Ω<br>
            <strong>Total Loss:</strong> ${Rloss.toFixed(2)} Ω<br><br>

            <strong>Estimated Efficiency:</strong><br>
            ${(eta * 100).toFixed(1)}%<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("mobile_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Mobile HF Notes</h3>
        <p>Mobile HF antennas are extremely short compared to λ.</p>
        <p>Radiation resistance is tiny — often < 1 Ω on 40m.</p>
        <p>Coil Q and vehicle ground loss dominate efficiency.</p>
        <p>Even 10% efficiency is excellent for mobile HF.</p>
    `;
};
