/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Loading Coil Designer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("loading-coil.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function loadingCoilUI() {
    return `
        <h2>Loading Coil Designer</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="lc_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Antenna Length (meters):</label><br>
            <input id="lc_len" type="number" value="6" step="0.1"><br><br>

            <label>Target Electrical Length (meters):</label><br>
            <input id="lc_target" type="number" value="20" step="0.1"><br><br>

            <label>Coil Diameter (cm):</label><br>
            <input id="lc_diam" type="number" value="5" step="0.1"><br><br>

            <label>Wire Diameter (mm):</label><br>
            <input id="lc_wire" type="number" value="1.5" step="0.1"><br><br>

            <button class="btn-primary" onclick="runLoadingCoil()">Design Coil</button>
        </div>

        <div id="lc_results"></div>
    `;
}

/* ------------------------------------------------------------
   Coil Math
   ------------------------------------------------------------ */

/**
 * Required inductive reactance:
 * Xl = 2πfL
 * Needed to make up missing electrical length.
 */
function requiredInductance(freq, Lshort, Ltarget) {
    const lambda = 300 / freq;
    const missing = Ltarget - Lshort;
    const electricalMissing = missing / lambda;

    // Approximate inductance needed:
    return electricalMissing * (1 / (2 * Math.PI * freq * 1e6)) * 1e6; // μH
}

/**
 * Wheeler's formula for air-core coils:
 * L(μH) = (r^2 * N^2) / (9r + 10l)
 * r in inches, l in inches
 */
function coilTurns(LuH, diameterCm, wireMm) {
    const r = (diameterCm / 2) / 2.54; // inches
    const wireIn = wireMm / 25.4;
    const l = wireIn * 10; // assume 10 wire diameters long

    const N = Math.sqrt((LuH * (9 * r + 10 * l)) / (r * r));
    return Math.max(1, N);
}

/**
 * Coil Q approximation:
 * Q ≈ Xl / Rloss
 */
function coilQ(freq, L, wireMm) {
    const Xl = 2 * Math.PI * freq * 1e6 * (L * 1e-6);
    const Rloss = wireMm * 0.02; // crude approximation
    return Xl / Rloss;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function coilPoster(N, diameterCm) {
    const cx = 400;
    const cy = 300;

    const inner = `
        ${svgTitle("Loading Coil Geometry")}

        ${svgCircle(cx, cy, diameterCm * 2, "none", "#1e3a5f", 3)}
        ${svgLabel("Diameter: " + diameterCm + " cm", cx - 60, cy + diameterCm * 2 + 20)}

        ${svgLabel("Turns: " + N.toFixed(1), cx - 40, cy - diameterCm * 2 - 20)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runLoadingCoil = function () {
    const freq = parseFloat(document.getElementById("lc_freq").value);
    const Lshort = parseFloat(document.getElementById("lc_len").value);
    const Ltarget = parseFloat(document.getElementById("lc_target").value);
    const diam = parseFloat(document.getElementById("lc_diam").value);
    const wire = parseFloat(document.getElementById("lc_wire").value);

    const Lreq = requiredInductance(freq, Lshort, Ltarget);
    const N = coilTurns(Lreq, diam, wire);
    const Q = coilQ(freq, Lreq, wire);

    const poster = coilPoster(N, diam);

    const html = `
        <div class="card">
            <h3>Loading Coil Design</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Short Antenna Length:</strong> ${Lshort} m<br>
            <strong>Target Electrical Length:</strong> ${Ltarget} m<br><br>

            <strong>Required Inductance:</strong> ${Lreq.toFixed(2)} μH<br>
            <strong>Turns Required:</strong> ${N.toFixed(1)}<br>
            <strong>Estimated Coil Q:</strong> ${Q.toFixed(0)}<br><br>

            <p>This coil compensates for missing electrical length and restores resonance.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("lc_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Loading Coil Notes</h3>
        <p>Loading coils increase Q and reduce bandwidth.</p>
        <p>Higher Q means sharper tuning and more loss sensitivity.</p>
        <p>Coil diameter and wire size strongly affect inductance and Q.</p>
        <p>Mid-element loading is more efficient than base loading.</p>
    `;
};
