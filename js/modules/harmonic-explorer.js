/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Multiband Harmonic Explorer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("harmonic-explorer.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function harmonicExplorerUI() {
    return `
        <h2>Multiband Harmonic Explorer</h2>

        <div class="card">
            <label>Fundamental Frequency (MHz):</label><br>
            <input id="he_f0" type="number" value="7.2" step="0.1"><br><br>

            <label>Antenna Length (meters):</label><br>
            <input id="he_len" type="number" value="20" step="0.5"><br><br>

            <label>Radiation Resistance at Fundamental (Ω):</label><br>
            <input id="he_rr" type="number" value="35" step="1"><br><br>

            <button class="btn-primary" onclick="runHarmonicExplorer()">Analyze Harmonics</button>
        </div>

        <div id="he_results"></div>
    `;
}

/* ------------------------------------------------------------
   Harmonic Math
   ------------------------------------------------------------ */

/**
 * Harmonic frequencies:
 * fn = n * f0
 */
function harmonicFreqs(f0, count = 6) {
    const arr = [];
    for (let n = 1; n <= count; n++) arr.push(f0 * n);
    return arr;
}

/**
 * Electrical length:
 * L/λ = (L * f) / 300
 */
function electricalLength(L, f) {
    return (L * f) / 300;
}

/**
 * Feedpoint impedance approximation:
 * Z ≈ Rr * (sin(π * L/λ))^2 + j * Rr * sin(2π * L/λ)
 */
function feedpointImpedance(Rr, L_over_lambda) {
    const R = Rr * Math.pow(Math.sin(Math.PI * L_over_lambda), 2);
    const X = Rr * Math.sin(2 * Math.PI * L_over_lambda);
    return { R, X };
}

/**
 * SWR:
 * SWR = (|Z| + 50) / (|Z| - 50)
 */
function swr(R, X) {
    const Z = Math.sqrt(R * R + X * X);
    const num = Z + 50;
    const den = Math.max(1, Math.abs(Z - 50));
    return num / den;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function harmonicPoster(freqs) {
    const cx = 400;
    const cy = 300;

    const maxF = freqs[freqs.length - 1];
    const scale = 300 / maxF;

    let ticks = "";
    freqs.forEach((f, i) => {
        const x = cx - 150 + f * scale;
        ticks += svgLine(x, cy - 20, x, cy + 20, "#1e3a5f", 3);
        ticks += svgLabel((i + 1) + "×", x - 10, cy + 40);
    });

    const inner = `
        ${svgTitle("Harmonic Resonance Map")}

        ${svgLine(cx - 150, cy, cx + 150, cy, "#444", 4)}
        ${ticks}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runHarmonicExplorer = function () {
    const f0 = parseFloat(document.getElementById("he_f0").value);
    const L = parseFloat(document.getElementById("he_len").value);
    const Rr = parseFloat(document.getElementById("he_rr").value);

    const freqs = harmonicFreqs(f0);
    const results = [];

    freqs.forEach(f => {
        const L_over_lambda = electricalLength(L, f);
        const { R, X } = feedpointImpedance(Rr, L_over_lambda);
        const S = swr(R, X);

        results.push({ f, L_over_lambda, R, X, S });
    });

    const poster = harmonicPoster(freqs);

    let table = `
        <table class="data-table">
            <tr>
                <th>Harmonic</th>
                <th>Freq (MHz)</th>
                <th>L/λ</th>
                <th>R (Ω)</th>
                <th>X (Ω)</th>
                <th>SWR</th>
            </tr>
    `;

    results.forEach((r, i) => {
        table += `
            <tr>
                <td>${i + 1}×</td>
                <td>${r.f.toFixed(2)}</td>
                <td>${r.L_over_lambda.toFixed(2)}</td>
                <td>${r.R.toFixed(1)}</td>
                <td>${r.X.toFixed(1)}</td>
                <td>${r.S.toFixed(2)}</td>
            </tr>
        `;
    });

    table += `</table>`;

    const html = `
        <div class="card">
            <h3>Harmonic Analysis</h3>

            <strong>Fundamental:</strong> ${f0} MHz<br>
            <strong>Antenna Length:</strong> ${L} m<br>
            <strong>Rr at Fundamental:</strong> ${Rr} Ω<br><br>

            ${table}

            <p>Harmonics determine multiband behavior.</p>
            <p>EFHW antennas resonate on all odd harmonics.</p>
            <p>OCF dipoles shift impedance dramatically across harmonics.</p>
            <p>Patterns become more complex at higher harmonics.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("he_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Harmonic Notes</h3>
        <p>Harmonics define multiband resonance behavior.</p>
        <p>Higher harmonics produce narrower lobes and more nulls.</p>
        <p>Feedpoint impedance varies wildly across harmonics.</p>
        <p>Harmonic resonance is the foundation of EFHW and OCF designs.</p>
    `;
};
