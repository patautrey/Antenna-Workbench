/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Coupling & Interaction Simulator
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("coupling-simulator.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function couplingSimulatorUI() {
    return `
        <h2>Antenna Coupling & Interaction Simulator</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="cs_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Antenna Spacing (meters):</label><br>
            <input id="cs_space" type="number" value="10" step="0.5"><br><br>

            <label>Antenna Type:</label><br>
            <select id="cs_type">
                <option value="dipole">Dipole</option>
                <option value="vertical">Vertical</option>
                <option value="loop">Loop</option>
            </select><br><br>

            <label>Feedpoint Resistance (Ω):</label><br>
            <input id="cs_rr" type="number" value="50" step="1"><br><br>

            <button class="btn-primary" onclick="runCouplingSimulator()">Analyze Interaction</button>
        </div>

        <div id="cs_results"></div>
    `;
}

/* ------------------------------------------------------------
   Coupling Math
   ------------------------------------------------------------ */

/**
 * Mutual impedance approximation:
 * Zm ≈ (Rr / d) * exp(-d/λ)
 */
function mutualImpedance(freq, Rr, d) {
    const lambda = 300 / freq;
    return (Rr / d) * Math.exp(-d / lambda);
}

/**
 * Coupling coefficient:
 * k = Zm / (Rr + Zm)
 */
function couplingCoefficient(Zm, Rr) {
    return Zm / (Rr + Zm);
}

/**
 * Detuning:
 * Δf ≈ k * f0 * 0.02
 */
function detuning(freq, k) {
    return k * freq * 0.02;
}

/**
 * Pattern distortion:
 * PD ≈ k * 100%
 */
function patternDistortion(k) {
    return k * 100;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function couplingPoster(d) {
    const cx = 400;
    const cy = 300;

    const inner = `
        ${svgTitle("Antenna Coupling")}

        ${svgCircle(cx - d * 10, cy, 20, "none", "#1e3a5f", 4)}
        ${svgCircle(cx + d * 10, cy, 20, "none", "#1e3a5f", 4)}

        ${svgLabel("Antenna 1", cx - d * 10 - 30, cy + 50)}
        ${svgLabel("Antenna 2", cx + d * 10 - 30, cy + 50)}

        ${svgLine(cx - d * 10 + 20, cy, cx + d * 10 - 20, cy, "#cc0000", 4)}
        ${svgLabel("Spacing: " + d + " m", cx - 40, cy - 40)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runCouplingSimulator = function () {
    const freq = parseFloat(document.getElementById("cs_freq").value);
    const d = parseFloat(document.getElementById("cs_space").value);
    const type = document.getElementById("cs_type").value;
    const Rr = parseFloat(document.getElementById("cs_rr").value);

    const Zm = mutualImpedance(freq, Rr, d);
    const k = couplingCoefficient(Zm, Rr);
    const df = detuning(freq, k);
    const PD = patternDistortion(k);

    const poster = couplingPoster(d);

    const html = `
        <div class="card">
            <h3>Coupling Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Antenna Type:</strong> ${type}<br>
            <strong>Spacing:</strong> ${d} m<br>
            <strong>Feedpoint Resistance:</strong> ${Rr} Ω<br><br>

            <strong>Mutual Impedance:</strong> ${Zm.toFixed(2)} Ω<br>
            <strong>Coupling Coefficient:</strong> ${k.toFixed(3)}<br>
            <strong>Detuning:</strong> ±${df.toFixed(3)} MHz<br>
            <strong>Pattern Distortion:</strong> ${PD.toFixed(1)}%<br><br>

            <p>Coupling increases dramatically when antennas are closer than 0.2λ.</p>
            <p>Mutual impedance causes detuning and pattern distortion.</p>
            <p>Verticals couple more strongly than dipoles.</p>
            <p>Loops have the least coupling due to magnetic field dominance.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("cs_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Coupling Notes</h3>
        <p>Antennas interact through mutual impedance.</p>
        <p>Close spacing increases coupling and detuning.</p>
        <p>Coupling can distort patterns and shift nulls.</p>
        <p>Spacing antennas at least 0.25λ apart reduces interaction.</p>
    `;
};
