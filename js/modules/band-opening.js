/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: HF Band Opening Predictor
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("band-opening.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function bandOpeningUI() {
    return `
        <h2>HF Band Opening Predictor</h2>

        <div class="card">
            <label>Solar Flux Index (SFI):</label><br>
            <input id="bo_sfi" type="number" value="120" step="5"><br><br>

            <label>Time of Day:</label><br>
            <select id="bo_time">
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="greyline">Greyline</option>
            </select><br><br>

            <label>Path Distance (km):</label><br>
            <input id="bo_dist" type="number" value="3000" step="100"><br><br>

            <label>D-Layer Absorption (0–1):</label><br>
            <input id="bo_dlayer" type="number" value="0.4" step="0.05"><br><br>

            <button class="btn-primary" onclick="runBandOpening()">Predict Open Bands</button>
        </div>

        <div id="bo_results"></div>
    `;
}

/* ------------------------------------------------------------
   Band Opening Math
   ------------------------------------------------------------ */

/**
 * Critical frequency foF2:
 * foF2 ≈ 0.9 + 0.015 * SFI
 */
function foF2(SFI, time) {
    let f = 0.9 + 0.015 * SFI;
    if (time === "night") f *= 0.6;
    if (time === "greyline") f *= 1.2;
    return f;
}

/**
 * MUF:
 * MUF = foF2 / cos(incidence)
 */
function MUF(foF2, dist) {
    const inc = Math.min(0.9, dist / 4000);
    return foF2 / Math.cos(inc * Math.PI / 2);
}

/**
 * LUF:
 * LUF ≈ 3 + 20 * Dlayer
 */
function LUF(Dlayer, time) {
    let L = 3 + 20 * Dlayer;
    if (time === "night") L *= 0.5;
    if (time === "greyline") L *= 0.7;
    return L;
}

/**
 * Band center frequencies
 */
const bands = [
    { name: "160m", f: 1.8 },
    { name: "80m", f: 3.5 },
    { name: "60m", f: 5.3 },
    { name: "40m", f: 7.1 },
    { name: "30m", f: 10.1 },
    { name: "20m", f: 14.2 },
    { name: "17m", f: 18.1 },
    { name: "15m", f: 21.2 },
    { name: "12m", f: 24.9 },
    { name: "10m", f: 28.4 }
];

/**
 * Band opening probability:
 * If LUF < f < MUF → open
 * Probability = 1 - |f - midpoint| / range
 */
function bandProbability(f, LUF, MUF) {
    if (f < LUF || f > MUF) return 0;
    const mid = (LUF + MUF) / 2;
    const range = (MUF - LUF) / 2;
    return Math.max(0, 1 - Math.abs(f - mid) / range);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function bandPoster(results) {
    const cx = 400;
    const cy = 300;

    let bars = "";
    let y = cy - 120;

    results.forEach(r => {
        const w = r.p * 300;
        bars += `
            <rect x="${cx - 150}" y="${y}" width="${w}" height="20" fill="#1e8f3f" />
            ${svgLabel(r.name + " (" + (r.p * 100).toFixed(0) + "%)", cx - 140, y + 15)}
        `;
        y += 30;
    });

    const inner = `
        ${svgTitle("Band Opening Probability")}
        ${bars}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runBandOpening = function () {
    const SFI = parseFloat(document.getElementById("bo_sfi").value);
    const time = document.getElementById("bo_time").value;
    const dist = parseFloat(document.getElementById("bo_dist").value);
    const Dlayer = parseFloat(document.getElementById("bo_dlayer").value);

    const fcrit = foF2(SFI, time);
    const muf = MUF(fcrit, dist);
    const luf = LUF(Dlayer, time);

    const results = bands.map(b => ({
        name: b.name,
        f: b.f,
        p: bandProbability(b.f, luf, muf)
    }));

    const poster = bandPoster(results);

    let table = `
        <table class="data-table">
            <tr><th>Band</th><th>Freq (MHz)</th><th>Probability</th></tr>
    `;

    results.forEach(r => {
        table += `
            <tr>
                <td>${r.name}</td>
                <td>${r.f.toFixed(1)}</td>
                <td>${(r.p * 100).toFixed(0)}%</td>
            </tr>
        `;
    });

    table += `</table>`;

    const html = `
        <div class="card">
            <h3>Band Opening Prediction</h3>

            <strong>SFI:</strong> ${SFI}<br>
            <strong>Time:</strong> ${time}<br>
            <strong>Path Distance:</strong> ${dist} km<br>
            <strong>D-Layer Absorption:</strong> ${Dlayer}<br><br>

            <strong>Critical Frequency:</strong> ${fcrit.toFixed(2)} MHz<br>
            <strong>MUF:</strong> ${muf.toFixed(2)} MHz<br>
            <strong>LUF:</strong> ${luf.toFixed(2)} MHz<br><br>

            ${table}

            <p>Bands between LUF and MUF are potentially open.</p>
            <p>Greyline boosts MUF and lowers LUF simultaneously.</p>
            <p>High SFI lifts MUF and opens higher bands.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("bo_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Band Opening Notes</h3>
        <p>LUF rises with D-layer absorption.</p>
        <p>MUF rises with solar flux.</p>
        <p>Greyline is the most powerful propagation enhancer.</p>
        <p>Longer paths require higher MUF.</p>
    `;
};
