/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: NEC-like Pattern Synthesizer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("nec-synth.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function necSynthUI() {
    return `
        <h2>NEC-like Pattern Synthesizer</h2>

        <div class="card">
            <label>Antenna Type:</label><br>
            <select id="ns_type">
                <option value="dipole">Dipole</option>
                <option value="vertical">Vertical</option>
                <option value="yagi">Yagi (3-element)</option>
                <option value="loop">Loop</option>
            </select><br><br>

            <label>Frequency (MHz):</label><br>
            <input id="ns_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Height (meters):</label><br>
            <input id="ns_height" type="number" value="10" step="0.5"><br><br>

            <button class="btn-primary" onclick="runNecSynth()">Generate Pattern</button>
        </div>

        <div id="ns_results"></div>
    `;
}

/* ------------------------------------------------------------
   Synthetic Pattern Math
   ------------------------------------------------------------ */

/**
 * Elevation pattern approximations:
 * Dipole: sin(θ)
 * Vertical: cos(θ)
 * Loop: sin²(θ)
 * Yagi: sin(θ)*(1+0.6*cos(θ))
 */
function elevation(type, theta) {
    const t = theta * Math.PI / 180;

    if (type === "dipole") return Math.abs(Math.sin(t));
    if (type === "vertical") return Math.abs(Math.cos(t));
    if (type === "loop") return Math.pow(Math.sin(t), 2);
    if (type === "yagi") return Math.abs(Math.sin(t) * (1 + 0.6 * Math.cos(t)));

    return 0;
}

/**
 * Azimuth pattern approximations:
 * Dipole: figure-8 → cos(φ)
 * Vertical: omnidirectional
 * Loop: circular
 * Yagi: cardioid-like → (1 + 0.8*cos(φ))
 */
function azimuth(type, phi) {
    const p = phi * Math.PI / 180;

    if (type === "dipole") return Math.abs(Math.cos(p));
    if (type === "vertical") return 1;
    if (type === "loop") return 1;
    if (type === "yagi") return Math.abs(1 + 0.8 * Math.cos(p));

    return 0;
}

/**
 * Height effect:
 * TOA ≈ 90 - (height / λ) * 20
 */
function takeoffAngle(freq, height) {
    const lambda = 300 / freq;
    return Math.max(5, 90 - (height / lambda) * 20);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function patternPoster(points) {
    const cx = 400;
    const cy = 300;
    const scale = 150;

    let path = "";

    for (let i = 0; i < points.length; i++) {
        const angle = i * (Math.PI / 180);
        const r = points[i] * scale;

        const x = cx + r * Math.cos(angle);
        const y = cy - r * Math.sin(angle);

        if (i === 0) {
            path += `M ${x} ${y} `;
        } else {
            path += `L ${x} ${y} `;
        }
    }

    const inner = `
        ${svgTitle("Synthetic Radiation Pattern")}

        <path d="${path}" stroke="#1e3a5f" stroke-width="3" fill="none" />

        ${svgCircle(cx, cy, 5, "#cc0000")}
        ${svgLabel("Antenna", cx - 20, cy + 20)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runNecSynth = function () {
    const type = document.getElementById("ns_type").value;
    const freq = parseFloat(document.getElementById("ns_freq").value);
    const height = parseFloat(document.getElementById("ns_height").value);

    const TOA = takeoffAngle(freq, height);

    const points = [];
    for (let phi = 0; phi < 360; phi++) {
        const elev = elevation(type, TOA);
        const az = azimuth(type, phi);
        points.push(elev * az);
    }

    const poster = patternPoster(points);

    const html = `
        <div class="card">
            <h3>NEC-like Pattern Synthesis</h3>

            <strong>Antenna Type:</strong> ${type}<br>
            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Height:</strong> ${height} m<br><br>

            <strong>Estimated Takeoff Angle:</strong> ${TOA.toFixed(1)}°<br>
            <p>This synthetic pattern combines elevation and azimuth models to approximate NEC-like behavior.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("ns_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>NEC-like Notes</h3>
        <p>This is a synthetic model, not a full NEC solver.</p>
        <p>Elevation and azimuth patterns are combined multiplicatively.</p>
        <p>Height affects takeoff angle and low-angle gain.</p>
        <p>Yagi patterns include forward gain and rear rejection.</p>
    `;
};
