/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Failure Mode & Stress Analyzer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("failure-mode.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function failureModeUI() {
    return `
        <h2>Antenna Failure Mode & Stress Analyzer</h2>

        <div class="card">
            <label>Antenna Length (meters):</label><br>
            <input id="fm_len" type="number" value="20" step="0.5"><br><br>

            <label>Wire Diameter (mm):</label><br>
            <input id="fm_diam" type="number" value="1.5" step="0.1"><br><br>

            <label>Wind Speed (mph):</label><br>
            <input id="fm_wind" type="number" value="40" step="5"><br><br>

            <label>Ice Thickness (mm):</label><br>
            <input id="fm_ice" type="number" value="0" step="1"><br><br>

            <label>Tension at Supports (lbs):</label><br>
            <input id="fm_tension" type="number" value="50" step="5"><br><br>

            <button class="btn-primary" onclick="runFailureMode()">Analyze Failure Modes</button>
        </div>

        <div id="fm_results"></div>
    `;
}

/* ------------------------------------------------------------
   Stress Physics
   ------------------------------------------------------------ */

/**
 * Wind load:
 * F_wind ≈ 0.004 * wind^2 * length
 */
function windLoad(wind, L) {
    return 0.004 * wind * wind * L;
}

/**
 * Ice load:
 * F_ice ≈ 0.9 * ice_mm * length
 */
function iceLoad(ice, L) {
    return 0.9 * ice * L;
}

/**
 * Wire tensile strength:
 * TS ≈ 500 * diameter_mm^2 (approx for copper/bronze)
 */
function tensileStrength(diam) {
    return 500 * diam * diam;
}

/**
 * Stress ratio:
 * SR = (F_total + tension) / TS
 */
function stressRatio(Fwind, Fice, tension, TS) {
    return (Fwind + Fice + tension) / TS;
}

/**
 * Failure probability:
 * P_fail ≈ SR^3 (cubic growth)
 */
function failureProbability(SR) {
    return Math.min(1, Math.pow(SR, 3));
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function failurePoster(SR) {
    const cx = 400;
    const cy = 300;

    const barWidth = 300;
    const scaled = Math.min(barWidth, SR * 300);

    const inner = `
        ${svgTitle("Stress Ratio")}

        ${svgLine(cx - barWidth/2, cy, cx + barWidth/2, cy, "#444", 20)}
        ${svgLine(cx - barWidth/2, cy, cx - barWidth/2 + scaled, cy, "#cc0000", 20)}

        ${svgLabel("SR = " + SR.toFixed(2), cx - 20, cy - 30)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runFailureMode = function () {
    const L = parseFloat(document.getElementById("fm_len").value);
    const diam = parseFloat(document.getElementById("fm_diam").value);
    const wind = parseFloat(document.getElementById("fm_wind").value);
    const ice = parseFloat(document.getElementById("fm_ice").value);
    const tension = parseFloat(document.getElementById("fm_tension").value);

    const Fwind = windLoad(wind, L);
    const Fice = iceLoad(ice, L);
    const TS = tensileStrength(diam);
    const SR = stressRatio(Fwind, Fice, tension, TS);
    const Pfail = failureProbability(SR);

    const poster = failurePoster(SR);

    const html = `
        <div class="card">
            <h3>Failure Mode Analysis</h3>

            <strong>Antenna Length:</strong> ${L} m<br>
            <strong>Wire Diameter:</strong> ${diam} mm<br><br>

            <strong>Wind Load:</strong> ${Fwind.toFixed(1)} lbs<br>
            <strong>Ice Load:</strong> ${Fice.toFixed(1)} lbs<br>
            <strong>Tension:</strong> ${tension} lbs<br><br>

            <strong>Tensile Strength:</strong> ${TS.toFixed(1)} lbs<br>
            <strong>Stress Ratio:</strong> ${SR.toFixed(2)}<br>
            <strong>Failure Probability:</strong> ${(Pfail * 100).toFixed(1)}%<br><br>

            <p>Stress ratio above 1.0 indicates likely failure.</p>
            <p>Wind load grows with the square of wind speed.</p>
            <p>Ice loading dramatically increases weight and tension.</p>
            <p>Thin wire antennas are highly vulnerable to storms.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("fm_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Failure Mode Notes</h3>
        <p>Wind and ice are the primary mechanical failure drivers.</p>
        <p>Stress ratio grows rapidly as loads increase.</p>
        <p>Support tension is often underestimated.</p>
        <p>Fatigue failure occurs even below breaking strength.</p>
    `;
};
