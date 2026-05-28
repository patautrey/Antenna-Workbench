/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Radial Field Optimizer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("radials-optimizer.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function radialsOptimizerUI() {
    return `
        <h2>Radial Field Optimizer</h2>

        <div class="card">
            <label>Number of Radials (1–120):</label><br>
            <input id="ro_radials" type="number" value="32" step="1"><br><br>

            <label>Radial Length (meters):</label><br>
            <input id="ro_length" type="number" value="8" step="0.1"><br><br>

            <label>Mounting Type:</label><br>
            <select id="ro_mount">
                <option value="ground">Ground‑Mounted</option>
                <option value="elevated">Elevated (Tuned)</option>
            </select><br><br>

            <button class="btn-primary" onclick="runRadialsOptimizer()">Analyze</button>
        </div>

        <div id="ro_results"></div>
    `;
}

/* ------------------------------------------------------------
   Radial Optimization Math
   ------------------------------------------------------------ */

/**
 * Ground-mounted radial efficiency model:
 * η = 1 - exp( -N * L / K )
 * K ≈ 40 for average soil
 */
function efficiencyGround(N, L) {
    const K = 40;
    return 1 - Math.exp(-(N * L) / K);
}

/**
 * Elevated radials:
 * Tuned radials behave like resonant counterpoises.
 * Efficiency saturates quickly.
 */
function efficiencyElevated(N) {
    if (N >= 4) return 0.95;
    if (N === 3) return 0.90;
    if (N === 2) return 0.80;
    return 0.60;
}

/**
 * Cost model:
 * Cost = N * L * $0.30 per meter (wire cost)
 */
function costModel(N, L) {
    return N * L * 0.30;
}

/* ------------------------------------------------------------
   Poster Generator (Efficiency Curve)
   ------------------------------------------------------------ */

function radialsPoster(N, L, mount) {
    const points = [];
    for (let i = 1; i <= N; i++) {
        const eta = mount === "ground" ? efficiencyGround(i, L) : efficiencyElevated(i);
        const x = 100 + i * 5;
        const y = 400 - eta * 300;
        points.push({ x, y });
    }

    let poly = "";
    for (const p of points) {
        poly += `${p.x},${p.y} `;
    }

    const inner = `
        ${svgTitle("Radial Efficiency Curve")}
        <polyline points="${poly}" stroke="#1e3a5f" stroke-width="4" fill="none"></polyline>
        ${svgLabel("Radials →", 650, 450)}
        ${svgLabel("Efficiency ↑", 40, 100)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runRadialsOptimizer = function () {
    const N = parseInt(document.getElementById("ro_radials").value);
    const L = parseFloat(document.getElementById("ro_length").value);
    const mount = document.getElementById("ro_mount").value;

    const eta = mount === "ground" ? efficiencyGround(N, L) : efficiencyElevated(N);
    const cost = costModel(N, L);

    const poster = radialsPoster(N, L, mount);

    const html = `
        <div class="card">
            <h3>Radial Optimization</h3>

            <strong>Radials:</strong> ${N}<br>
            <strong>Length:</strong> ${L.toFixed(1)} m<br>
            <strong>Mounting:</strong> ${mount}<br><br>

            <strong>Estimated Efficiency:</strong><br>
            ${(eta * 100).toFixed(1)}%<br><br>

            <strong>Estimated Wire Cost:</strong><br>
            $${cost.toFixed(2)}<br>
        </div>

        <div class="card">
            <h3>Efficiency Curve</h3>
            ${poster}
        </div>
    `;

    document.getElementById("ro_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Radial Optimization Notes</h3>
        <p>Ground-mounted radials show diminishing returns after ~32 wires.</p>
        <p>Elevated radials require far fewer wires but must be resonant.</p>
        <p>Efficiency increases rapidly with the first few radials.</p>
        <p>Cost grows linearly, but performance saturates — optimize wisely.</p>
    `;
};
