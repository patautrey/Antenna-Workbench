/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: MUF/LUF Explorer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("muf-luf-explorer.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function mufLufExplorerUI() {
    return `
        <h2>Ionospheric MUF/LUF Explorer</h2>

        <div class="card">
            <label>Solar Flux Index (SFI):</label><br>
            <input id="ml_sfi" type="number" value="120" step="5"><br><br>

            <label>Path Distance (km):</label><br>
            <input id="ml_dist" type="number" value="3000" step="100"><br><br>

            <label>Time of Day:</label><br>
            <select id="ml_time">
                <option value="day">Day</option>
                <option value="night">Night</option>
            </select><br><br>

            <label>D-Layer Absorption Factor (0–1):</label><br>
            <input id="ml_dlayer" type="number" value="0.4" step="0.05"><br><br>

            <button class="btn-primary" onclick="runMufLuf()">Analyze Ionosphere</button>
        </div>

        <div id="ml_results"></div>
    `;
}

/* ------------------------------------------------------------
   Ionospheric Math
   ------------------------------------------------------------ */

/**
 * Critical frequency foF2 approximation:
 * foF2 ≈ 0.9 + 0.015 * SFI
 */
function criticalFreq(SFI, time) {
    let base = 0.9 + 0.015 * SFI;
    if (time === "night") base *= 0.6;
    return base; // MHz
}

/**
 * MUF for a given hop distance:
 * MUF = foF2 / cos(incidence)
 * incidence ≈ distance / 4000 km
 */
function muf(foF2, dist) {
    const inc = Math.min(0.9, dist / 4000);
    return foF2 / Math.cos(inc * Math.PI / 2);
}

/**
 * LUF approximation:
 * LUF ≈ 3 + 20 * Dlayer
 */
function luf(Dlayer, time) {
    let base = 3 + 20 * Dlayer;
    if (time === "night") base *= 0.5;
    return base;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function mufLufPoster(MUF, LUF) {
    const cx = 400;
    const cy = 300;

    const maxF = Math.max(MUF, LUF, 30);
    const scale = 300 / maxF;

    const MUF_x = cx - 150 + MUF * scale;
    const LUF_x = cx - 150 + LUF * scale;

    const inner = `
        ${svgTitle("MUF / LUF Spectrum")}

        ${svgLine(cx - 150, cy, cx + 150, cy, "#444", 6)}

        ${svgLine(LUF_x, cy - 40, LUF_x, cy + 40, "#cc0000", 4)}
        ${svgLabel("LUF " + LUF.toFixed(1) + " MHz", LUF_x - 40, cy + 60)}

        ${svgLine(MUF_x, cy - 40, MUF_x, cy + 40, "#1e3a5f", 4)}
        ${svgLabel("MUF " + MUF.toFixed(1) + " MHz", MUF_x - 40, cy - 60)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runMufLuf = function () {
    const SFI = parseFloat(document.getElementById("ml_sfi").value);
    const dist = parseFloat(document.getElementById("ml_dist").value);
    const time = document.getElementById("ml_time").value;
    const Dlayer = parseFloat(document.getElementById("ml_dlayer").value);

    const foF2 = criticalFreq(SFI, time);
    const MUF = muf(foF2, dist);
    const LUF = luf(Dlayer, time);

    const poster = mufLufPoster(MUF, LUF);

    const html = `
        <div class="card">
            <h3>Ionospheric Analysis</h3>

            <strong>SFI:</strong> ${SFI}<br>
            <strong>Path Distance:</strong> ${dist} km<br>
            <strong>Time:</strong> ${time}<br>
            <strong>D-Layer Absorption:</strong> ${Dlayer}<br><br>

            <strong>Critical Frequency foF2:</strong> ${foF2.toFixed(2)} MHz<br>
            <strong>MUF:</strong> ${MUF.toFixed(2)} MHz<br>
            <strong>LUF:</strong> ${LUF.toFixed(2)} MHz<br><br>

            <p>MUF determines the highest usable band for long-distance communication.</p>
            <p>LUF determines the lowest usable band before absorption kills the signal.</p>
            <p>The usable window is between LUF and MUF.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("ml_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Ionosphere Notes</h3>
        <p>Higher SFI raises MUF and opens higher bands.</p>
        <p>D-layer absorption dominates during the day.</p>
        <p>Nighttime reduces LUF and improves low-band performance.</p>
        <p>Longer paths require higher MUF due to steeper incidence angles.</p>
    `;
};
