/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Phased Array Designer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("phased-array.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function phasedArrayUI() {
    return `
        <h2>Phased Array Designer</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="pa_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Element Spacing (meters):</label><br>
            <input id="pa_space" type="number" value="10" step="0.5"><br><br>

            <label>Phase Shift (degrees):</label><br>
            <input id="pa_phase" type="number" value="90" step="5"><br><br>

            <label>Number of Elements:</label><br>
            <input id="pa_n" type="number" value="2" step="1"><br><br>

            <button class="btn-primary" onclick="runPhasedArray()">Generate Array Pattern</button>
        </div>

        <div id="pa_results"></div>
    `;
}

/* ------------------------------------------------------------
   Array Math
   ------------------------------------------------------------ */

/**
 * Array factor for N elements:
 * AF(θ) = | Σ exp(j*(k*d*cosθ + φ*n)) |
 */
function arrayFactor(freq, d, phaseDeg, N) {
    const lambda = 300 / freq;
    const k = 2 * Math.PI / lambda;
    const phase = phaseDeg * Math.PI / 180;

    const points = [];

    for (let thetaDeg = 0; thetaDeg < 360; thetaDeg++) {
        const theta = thetaDeg * Math.PI / 180;

        let real = 0;
        let imag = 0;

        for (let n = 0; n < N; n++) {
            const arg = k * d * Math.cos(theta) * n + phase * n;
            real += Math.cos(arg);
            imag += Math.sin(arg);
        }

        const AF = Math.sqrt(real * real + imag * imag);
        points.push(AF);
    }

    return points;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function arrayPoster(points) {
    const cx = 400;
    const cy = 300;
    const scale = 120;

    let path = "";

    for (let i = 0; i < points.length; i++) {
        const angle = i * (Math.PI / 180);
        const r = points[i] * scale;

        const x = cx + r * Math.cos(angle);
        const y = cy - r * Math.sin(angle);

        if (i === 0) path += `M ${x} ${y} `;
        else path += `L ${x} ${y} `;
    }

    const inner = `
        ${svgTitle("Phased Array Pattern")}

        <path d="${path}" stroke="#1e3a5f" stroke-width="3" fill="none" />

        ${svgLabel("Array Factor", cx - 40, cy + 180)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runPhasedArray = function () {
    const freq = parseFloat(document.getElementById("pa_freq").value);
    const d = parseFloat(document.getElementById("pa_space").value);
    const phase = parseFloat(document.getElementById("pa_phase").value);
    const N = parseInt(document.getElementById("pa_n").value);

    const points = arrayFactor(freq, d, phase, N);
    const poster = arrayPoster(points);

    const html = `
        <div class="card">
            <h3>Phased Array Summary</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Element Spacing:</strong> ${d} m<br>
            <strong>Phase Shift:</strong> ${phase}°<br>
            <strong>Elements:</strong> ${N}<br><br>

            <p>Beam direction and null placement depend on spacing and phase shift.</p>
            <p>0° phase → broadside array.</p>
            <p>90° phase → endfire array.</p>
            <p>Spacing near 0.25λ gives strong forward gain.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("pa_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Phased Array Notes</h3>
        <p>Phased arrays steer beams by controlling phase between elements.</p>
        <p>Spacing controls beamwidth and sidelobes.</p>
        <p>Endfire arrays produce strong directional gain.</p>
        <p>Broadside arrays produce wide patterns with high forward gain.</p>
    `;
};
