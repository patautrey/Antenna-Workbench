/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Current Distribution Visualizer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("current-distribution.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function currentDistributionUI() {
    return `
        <h2>Antenna Current Distribution</h2>

        <div class="card">
            <label>Antenna Type:</label><br>
            <select id="cd_type">
                <option value="dipole">Dipole</option>
                <option value="vertical">Vertical</option>
                <option value="loop">Loop</option>
            </select><br><br>

            <label>Frequency (MHz):</label><br>
            <input id="cd_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Length (meters):</label><br>
            <input id="cd_len" type="number" value="20" step="0.5"><br><br>

            <button class="btn-primary" onclick="runCurrentDistribution()">Analyze</button>
        </div>

        <div id="cd_results"></div>
    `;
}

/* ------------------------------------------------------------
   Current Distribution Math
   ------------------------------------------------------------ */

/**
 * Dipole current distribution:
 * I(x) = I0 * cos(π * x / L)
 */
function dipoleCurrent(x, L) {
    return Math.abs(Math.cos(Math.PI * x / L));
}

/**
 * Vertical current distribution:
 * I(x) = I0 * sin(π * (1 - x/L))
 */
function verticalCurrent(x, L) {
    return Math.abs(Math.sin(Math.PI * (1 - x / L)));
}

/**
 * Loop current distribution:
 * Approximate uniform current
 */
function loopCurrent() {
    return 1;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function currentPoster(points) {
    const cx = 100;
    const cy = 300;
    const scaleX = 600 / (points.length - 1);
    const scaleY = 150;

    let path = "";
    for (let i = 0; i < points.length; i++) {
        const x = cx + i * scaleX;
        const y = cy - points[i] * scaleY;
        if (i === 0) {
            path += `M ${x} ${y} `;
        } else {
            path += `L ${x} ${y} `;
        }
    }

    const inner = `
        ${svgTitle("Current Distribution")}

        <path d="${path}" stroke="#1e3a5f" stroke-width="4" fill="none" />

        ${svgLine(cx, cy, cx + 600, cy, "#444", 2)}
        ${svgLabel("Antenna Length", cx + 250, cy + 30)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runCurrentDistribution = function () {
    const type = document.getElementById("cd_type").value;
    const freq = parseFloat(document.getElementById("cd_freq").value);
    const L = parseFloat(document.getElementById("cd_len").value);

    const N = 50;
    const dx = L / (N - 1);
    const points = [];

    for (let i = 0; i < N; i++) {
        const x = i * dx;

        if (type === "dipole") points.push(dipoleCurrent(x, L));
        if (type === "vertical") points.push(verticalCurrent(x, L));
        if (type === "loop") points.push(loopCurrent());
    }

    const poster = currentPoster(points);

    const html = `
        <div class="card">
            <h3>Current Distribution Analysis</h3>

            <strong>Antenna Type:</strong> ${type}<br>
            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Length:</strong> ${L} m<br><br>

            <p>This plot shows the relative current magnitude along the antenna element.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("cd_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Current Notes</h3>
        <p>Dipoles have maximum current at the center and zero at the ends.</p>
        <p>Verticals have maximum current at the base and taper toward the top.</p>
        <p>Loops approximate uniform current around the perimeter.</p>
        <p>Current distribution determines radiation resistance and efficiency.</p>
    `;
};
