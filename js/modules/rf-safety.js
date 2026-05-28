/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: RF Safety Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgCircle, svgLabel } from "../core/poster-engine.js";

console.log("rf-safety.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function rfSafetyUI() {
    return `
        <h2>RF Safety Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="rf_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Power (W):</label><br>
            <input id="rf_power" type="number" value="100"><br><br>

            <label>Antenna Gain (dBi):</label><br>
            <input id="rf_gain" type="number" value="2.1" step="0.1"><br><br>

            <label>Environment:</label><br>
            <select id="rf_env">
                <option value="controlled">Controlled (Ham Operator)</option>
                <option value="uncontrolled">Uncontrolled (Public)</option>
            </select><br><br>

            <button class="btn-primary" onclick="runRfSafety()">Analyze</button>
        </div>

        <div id="rf_results"></div>
    `;
}

/* ------------------------------------------------------------
   RF Safety Math
   ------------------------------------------------------------ */

/**
 * MPE limits (FCC)
 * Controlled:   S = f / 300   (mW/cm²)
 * Uncontrolled: S = f / 1500 (mW/cm²)
 */
function mpeLimit(freqMhz, env) {
    if (env === "controlled") return freqMhz / 300;
    return freqMhz / 1500;
}

/**
 * Power density:
 * S = (P * G) / (4πR²)
 * Solve for R:
 * R = sqrt( (P * G) / (4πS) )
 */
function safeDistance(powerW, gainDbi, mpe) {
    const G = Math.pow(10, gainDbi / 10);
    const S = mpe / 1000; // convert mW/cm² → W/m²
    return Math.sqrt((powerW * G) / (4 * Math.PI * S));
}

/**
 * Near-field boundary:
 * R_nf = 2D² / λ
 * Assume D = 1 m (typical HF antenna element)
 */
function nearFieldBoundary(freqMhz) {
    const lambda = 300 / freqMhz;
    const D = 1;
    return (2 * D * D) / lambda;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function rfPoster(distanceMeters) {
    const radiusPx = Math.min(300, distanceMeters * 40);

    const inner = `
        ${svgTitle("RF Safety Bubble")}
        ${svgCircle(400, 300, radiusPx, "none")}
        ${svgLabel("Safe Distance: " + distanceMeters.toFixed(1) + " m", 20, 80)}
    `;

    return svgWrapper(inner, 800, 600);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runRfSafety = function () {
    const freq = parseFloat(document.getElementById("rf_freq").value);
    const power = parseFloat(document.getElementById("rf_power").value);
    const gain = parseFloat(document.getElementById("rf_gain").value);
    const env = document.getElementById("rf_env").value;

    const mpe = mpeLimit(freq, env);
    const R = safeDistance(power, gain, mpe);
    const Rnf = nearFieldBoundary(freq);

    const poster = rfPoster(R);

    const html = `
        <div class="card">
            <h3>RF Safety Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Power:</strong> ${power} W<br>
            <strong>Antenna Gain:</strong> ${gain} dBi<br>
            <strong>Environment:</strong> ${env}<br><br>

            <strong>MPE Limit:</strong> ${mpe.toFixed(3)} mW/cm²<br><br>

            <strong>Safe Distance:</strong><br>
            ${R.toFixed(1)} meters<br><br>

            <strong>Near‑Field Boundary:</strong><br>
            ${Rnf.toFixed(1)} meters<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("rf_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>RF Safety Notes</h3>
        <p>RF exposure limits depend on frequency and environment.</p>
        <p>Higher gain antennas increase power density in the main lobe.</p>
        <p>Near‑field regions require special caution.</p>
        <p>Always evaluate both controlled and uncontrolled exposure zones.</p>
    `;
};
