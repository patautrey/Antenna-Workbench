/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Ground Interaction Simulator
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("ground-interaction.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function groundInteractionUI() {
    return `
        <h2>Ground Interaction Simulator</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="gi_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Ground Conductivity (mS/m):</label><br>
            <input id="gi_cond" type="number" value="5" step="0.5"><br><br>

            <label>Dielectric Constant (εr):</label><br>
            <input id="gi_er" type="number" value="13" step="1"><br><br>

            <label>Takeoff Angle (degrees):</label><br>
            <input id="gi_toa" type="number" value="20" step="1"><br><br>

            <button class="btn-primary" onclick="runGroundInteraction()">Analyze</button>
        </div>

        <div id="gi_results"></div>
    `;
}

/* ------------------------------------------------------------
   Ground Interaction Math
   ------------------------------------------------------------ */

/**
 * Reflection coefficient magnitude approximation:
 * |Γ| ≈ exp(-sqrt(f / cond)) * (1 - cos(TOA))
 */
function reflectionCoefficient(freq, cond, toa) {
    const loss = Math.exp(-Math.sqrt(freq / cond));
    const angleFactor = 1 - Math.cos(toa * Math.PI / 180);
    return Math.min(1, loss * angleFactor);
}

/**
 * Brewster angle approximation:
 * θB ≈ arctan(sqrt(εr))
 */
function brewsterAngle(er) {
    return Math.atan(Math.sqrt(er)) * 180 / Math.PI;
}

/**
 * Low-angle enhancement:
 * LE ≈ (1 - |Γ|) * 100%
 */
function lowAngleEnhancement(Gamma) {
    return (1 - Gamma) * 100;
}

/**
 * High-angle suppression:
 * HS ≈ |Γ| * 100%
 */
function highAngleSuppression(Gamma) {
    return Gamma * 100;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function groundPoster(toa) {
    const cx = 400;
    const cy = 350;

    const rayLen = 200;
    const rad = toa * Math.PI / 180;

    const x2 = cx + rayLen * Math.cos(rad);
    const y2 = cy - rayLen * Math.sin(rad);

    const xr = cx + rayLen * Math.cos(rad);
    const yr = cy + rayLen * Math.sin(rad);

    const inner = `
        ${svgTitle("Ground Interaction")}

        ${svgLine(100, cy, 700, cy, "#444", 4)}
        ${svgLabel("Ground", 360, cy + 30)}

        ${svgLine(cx, cy, x2, y2, "#1e3a5f", 6)}
        ${svgLabel("Incident Ray", x2 - 80, y2 - 10)}

        ${svgLine(cx, cy, xr, yr, "#cc0000", 6)}
        ${svgLabel("Reflected Ray", xr - 80, yr + 20)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runGroundInteraction = function () {
    const freq = parseFloat(document.getElementById("gi_freq").value);
    const cond = parseFloat(document.getElementById("gi_cond").value);
    const er = parseFloat(document.getElementById("gi_er").value);
    const toa = parseFloat(document.getElementById("gi_toa").value);

    const Gamma = reflectionCoefficient(freq, cond, toa);
    const thetaB = brewsterAngle(er);
    const LE = lowAngleEnhancement(Gamma);
    const HS = highAngleSuppression(Gamma);

    const poster = groundPoster(toa);

    const html = `
        <div class="card">
            <h3>Ground Interaction Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Conductivity:</strong> ${cond} mS/m<br>
            <strong>Dielectric Constant:</strong> ${er}<br>
            <strong>Takeoff Angle:</strong> ${toa}°<br><br>

            <strong>Reflection Coefficient |Γ|:</strong> ${Gamma.toFixed(3)}<br>
            <strong>Brewster Angle:</strong> ${thetaB.toFixed(1)}°<br><br>

            <strong>Low-Angle Enhancement:</strong> ${LE.toFixed(1)}%<br>
            <strong>High-Angle Suppression:</strong> ${HS.toFixed(1)}%<br><br>

            <p>Ground properties strongly affect DX and NVIS performance.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("gi_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Ground Notes</h3>
        <p>High conductivity improves low-angle DX performance.</p>
        <p>Low conductivity increases absorption and reduces reflection.</p>
        <p>Brewster angle is where reflection goes to zero for vertical polarization.</p>
        <p>Ground is a major factor in real-world HF performance.</p>
    `;
};
