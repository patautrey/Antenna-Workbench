/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Tilt & Sloper Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";
import { wavelengthMeters } from "../core/vf-engine.js";

console.log("tilt-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function tiltLabUI() {
    return `
        <h2>Antenna Tilt & Sloper Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="tilt_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Antenna Length (meters):</label><br>
            <input id="tilt_len" type="number" value="20" step="0.1"><br><br>

            <label>Tilt Angle (degrees):</label><br>
            <input id="tilt_angle" type="number" value="45" step="1"><br><br>

            <button class="btn-primary" onclick="runTiltLab()">Analyze</button>
        </div>

        <div id="tilt_results"></div>
    `;
}

/* ------------------------------------------------------------
   Tilt / Sloper Math
   ------------------------------------------------------------ */

/**
 * Impedance shift approximation:
 * Z ≈ 50 + (angle / 90) * 30
 */
function sloperImpedance(angleDeg) {
    return 50 + (angleDeg / 90) * 30;
}

/**
 * Pattern skew:
 * Forward gain increases slightly with tilt.
 * G ≈ 2 + (angle / 90) * 2
 */
function sloperGain(angleDeg) {
    return 2 + (angleDeg / 90) * 2;
}

/**
 * Takeoff angle shift:
 * θ ≈ 30° - (angle / 3)
 */
function takeoffAngle(angleDeg) {
    return 30 - angleDeg / 3;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function tiltPoster(lengthMeters, angleDeg) {
    const baseX = 150;
    const baseY = 350;

    const rad = (angleDeg * Math.PI) / 180;
    const endX = baseX + lengthMeters * 10 * Math.cos(rad);
    const endY = baseY - lengthMeters * 10 * Math.sin(rad);

    const inner = `
        ${svgTitle("Sloper Geometry")}

        ${svgLine(baseX, baseY, endX, endY, "#1e3a5f", 6)}
        ${svgLabel("Tilt: " + angleDeg + "°", 20, 80)}

        ${svgLine(100, baseY, 700, baseY, "#444", 4)}
        ${svgLabel("Ground", 360, baseY + 30)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runTiltLab = function () {
    const freq = parseFloat(document.getElementById("tilt_freq").value);
    const len = parseFloat(document.getElementById("tilt_len").value);
    const angle = parseFloat(document.getElementById("tilt_angle").value);

    const Z = sloperImpedance(angle);
    const G = sloperGain(angle);
    const TOA = takeoffAngle(angle);

    const poster = tiltPoster(len, angle);

    const html = `
        <div class="card">
            <h3>Tilt / Sloper Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Length:</strong> ${len.toFixed(1)} m<br>
            <strong>Tilt Angle:</strong> ${angle}°<br><br>

            <strong>Estimated Feedpoint Impedance:</strong> ${Z.toFixed(1)} Ω<br>
            <strong>Estimated Forward Gain:</strong> ${G.toFixed(1)} dBi<br>
            <strong>Estimated Takeoff Angle:</strong> ${TOA.toFixed(1)}°<br><br>

            <p>Slopers often show directional bias toward the lower end.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("tilt_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Tilt & Sloper Notes</h3>
        <p>Tilting a dipole creates a directional sloper effect.</p>
        <p>Impedance rises as the tilt angle increases.</p>
        <p>Takeoff angle decreases with more tilt, improving DX potential.</p>
        <p>Slopers often favor the direction of the lower end.</p>
    `;
};
