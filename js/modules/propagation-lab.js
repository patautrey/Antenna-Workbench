/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Propagation Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("propagation-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function propagationLabUI() {
    return `
        <h2>Propagation Lab</h2>

        <div class="card">
            <label>Solar Flux Index (SFI):</label><br>
            <input id="prop_sfi" type="number" value="150"><br><br>

            <label>Kp Index:</label><br>
            <input id="prop_kp" type="number" value="2" step="1"><br><br>

            <label>A Index:</label><br>
            <input id="prop_a" type="number" value="8" step="1"><br><br>

            <label>Time of Day:</label><br>
            <select id="prop_time">
                <option value="day">Day</option>
                <option value="night">Night</option>
            </select><br><br>

            <button class="btn-primary" onclick="runPropagationLab()">Analyze</button>
        </div>

        <div id="prop_results"></div>
    `;
}

/* ------------------------------------------------------------
   Propagation Math
   ------------------------------------------------------------ */

/**
 * MUF approximation:
 * MUF ≈ 3 × foF2
 * foF2 ≈ 0.9 + (SFI / 150)
 */
function computeMuf(sfi) {
    const foF2 = 0.9 + (sfi / 150);
    return 3 * foF2;
}

/**
 * LUF approximation:
 * LUF ≈ 2 + (Kp / 2)
 */
function computeLuf(kp) {
    return 2 + kp / 2;
}

/**
 * Band quality scoring:
 * 0 = poor, 1 = marginal, 2 = good, 3 = excellent
 */
function bandQuality(freqMhz, muf, luf) {
    if (freqMhz > muf) return "Poor (above MUF)";
    if (freqMhz < luf) return "Poor (below LUF)";
    if (freqMhz < muf * 0.7) return "Excellent";
    return "Good";
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function propagationPoster(muf, luf) {
    const inner = `
        ${svgTitle("Ionospheric Propagation Diagram")}

        ${svgLabel("MUF: " + muf.toFixed(1) + " MHz", 20, 80)}
        ${svgLabel("LUF: " + luf.toFixed(1) + " MHz", 20, 120)}

        ${svgCircle(400, 350, 150, "none")}
        ${svgLabel("F2 Layer", 360, 360)}

        ${svgLine(200, 450, 600, 450, "#444", 4)}
        ${svgLabel("Earth", 380, 480)}
    `;

    return svgWrapper(inner, 800, 600);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runPropagationLab = function () {
    const sfi = parseFloat(document.getElementById("prop_sfi").value);
    const kp = parseFloat(document.getElementById("prop_kp").value);
    const a = parseFloat(document.getElementById("prop_a").value);
    const time = document.getElementById("prop_time").value;

    const muf = computeMuf(sfi);
    const luf = computeLuf(kp);

    const poster = propagationPoster(muf, luf);

    // Evaluate common HF bands
    const bands = [1.8, 3.5, 5.3, 7, 10, 14, 18, 21, 24, 28];
    let rows = "";

    for (const f of bands) {
        const q = bandQuality(f, muf, luf);
        rows += `
            <tr>
                <td>${f} MHz</td>
                <td>${q}</td>
            </tr>
        `;
    }

    const html = `
        <div class="card">
            <h3>Propagation Analysis</h3>

            <strong>SFI:</strong> ${sfi}<br>
            <strong>Kp:</strong> ${kp}<br>
            <strong>A:</strong> ${a}<br>
            <strong>Time:</strong> ${time}<br><br>

            <strong>MUF:</strong> ${muf.toFixed(1)} MHz<br>
            <strong>LUF:</strong> ${luf.toFixed(1)} MHz<br><br>

            <table class="data-table">
                <tr>
                    <th>Band</th>
                    <th>Quality</th>
                </tr>
                ${rows}
            </table>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("prop_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Propagation Notes</h3>
        <p>MUF rises with solar flux and peaks during the day.</p>
        <p>LUF rises with geomagnetic disturbance (Kp index).</p>
        <p>Daytime favors high bands; nighttime favors low bands.</p>
        <p>Solar storms can collapse MUF and raise noise dramatically.</p>
    `;
};
