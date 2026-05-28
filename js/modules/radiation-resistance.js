/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Radiation Resistance Explorer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("radiation-resistance.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function radiationResistanceUI() {
    return `
        <h2>Radiation Resistance Explorer</h2>

        <div class="card">
            <label>Antenna Type:</label><br>
            <select id="rr_type">
                <option value="dipole">Dipole</option>
                <option value="vertical">Vertical</option>
                <option value="short">Short Antenna</option>
                <option value="loop">Small Loop</option>
            </select><br><br>

            <label>Frequency (MHz):</label><br>
            <input id="rr_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Physical Length (meters):</label><br>
            <input id="rr_len" type="number" value="20" step="0.5"><br><br>

            <button class="btn-primary" onclick="runRadiationResistance()">Analyze</button>
        </div>

        <div id="rr_results"></div>
    `;
}

/* ------------------------------------------------------------
   Radiation Resistance Math
   ------------------------------------------------------------ */

/**
 * Dipole radiation resistance:
 * Rr ≈ 73 Ω at resonance
 * Scales with (L/λ)^2 for short dipoles
 */
function dipoleRr(freq, length) {
    const lambda = 300 / freq;
    const ratio = length / lambda;

    if (ratio >= 0.45 && ratio <= 0.55) return 73; // resonant dipole

    return 80 * Math.pow(ratio, 2); // short dipole approximation
}

/**
 * Vertical radiation resistance:
 * Rr ≈ 36 Ω at λ/4
 * Scales with (L/λ)^2 for short verticals
 */
function verticalRr(freq, length) {
    const lambda = 300 / freq;
    const ratio = length / lambda;

    if (ratio >= 0.23 && ratio <= 0.27) return 36;

    return 40 * Math.pow(ratio, 2);
}

/**
 * Short antenna:
 * Rr ≈ 80π² (L/λ)²
 */
function shortAntennaRr(freq, length) {
    const lambda = 300 / freq;
    const ratio = length / lambda;
    return 80 * Math.PI * Math.PI * Math.pow(ratio, 2);
}

/**
 * Small loop:
 * Rr ≈ 31200 * (A/λ²)²
 * A = area = (L/4)² for square loop approximation
 */
function loopRr(freq, length) {
    const lambda = 300 / freq;
    const side = length / 4;
    const A = side * side;
    return 31200 * Math.pow(A / (lambda * lambda), 2);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function rrPoster(Rr) {
    const cx = 400;
    const cy = 300;

    const barWidth = 300;
    const scaled = Math.min(barWidth, Rr * 3);

    const inner = `
        ${svgTitle("Radiation Resistance")}

        ${svgLine(cx - barWidth/2, cy, cx + barWidth/2, cy, "#444", 20)}
        ${svgLine(cx - barWidth/2, cy, cx - barWidth/2 + scaled, cy, "#1e3a5f", 20)}

        ${svgLabel(Rr.toFixed(1) + " Ω", cx - 20, cy - 25)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runRadiationResistance = function () {
    const type = document.getElementById("rr_type").value;
    const freq = parseFloat(document.getElementById("rr_freq").value);
    const length = parseFloat(document.getElementById("rr_len").value);

    let Rr = 0;

    if (type === "dipole") Rr = dipoleRr(freq, length);
    if (type === "vertical") Rr = verticalRr(freq, length);
    if (type === "short") Rr = shortAntennaRr(freq, length);
    if (type === "loop") Rr = loopRr(freq, length);

    const poster = rrPoster(Rr);

    const html = `
        <div class="card">
            <h3>Radiation Resistance Analysis</h3>

            <strong>Antenna Type:</strong> ${type}<br>
            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Length:</strong> ${length} m<br><br>

            <strong>Radiation Resistance:</strong> ${Rr.toFixed(2)} Ω<br><br>

            <p>Radiation resistance determines how effectively an antenna converts RF current into radiated energy.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("rr_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Radiation Resistance Notes</h3>
        <p>Short antennas have very low radiation resistance.</p>
        <p>Low Rr leads to poor efficiency unless loss resistance is extremely low.</p>
        <p>Dipoles and verticals reach peak Rr near resonance.</p>
        <p>Loops scale with area, not length.</p>
    `;
};
