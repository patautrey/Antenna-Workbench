/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Transmission Line Transformer Designer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("tlt-designer.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function tltDesignerUI() {
    return `
        <h2>Transmission Line Transformer Designer</h2>

        <div class="card">
            <label>Primary Impedance (Ω):</label><br>
            <input id="tlt_zp" type="number" value="50" step="1"><br><br>

            <label>Secondary Impedance (Ω):</label><br>
            <input id="tlt_zs" type="number" value="200" step="1"><br><br>

            <label>Frequency (MHz):</label><br>
            <input id="tlt_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Core Material (μr):</label><br>
            <input id="tlt_mu" type="number" value="150" step="10"><br><br>

            <button class="btn-primary" onclick="runTltDesigner()">Design Transformer</button>
        </div>

        <div id="tlt_results"></div>
    `;
}

/* ------------------------------------------------------------
   Transformer Math
   ------------------------------------------------------------ */

/**
 * Turns ratio:
 * n = sqrt(Zs / Zp)
 */
function turnsRatio(Zp, Zs) {
    return Math.sqrt(Zs / Zp);
}

/**
 * Transmission line length:
 * Use 1/4 wavelength for impedance transformation
 */
function lineLength(freq) {
    const lambda = 300 / freq;
    return lambda / 4;
}

/**
 * Core loss approximation:
 * Loss ≈ freq * μr * 0.0001
 */
function coreLoss(freq, mu) {
    return freq * mu * 0.0001;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function tltPoster(n) {
    const cx = 400;
    const cy = 300;

    const inner = `
        ${svgTitle("Transmission Line Transformer")}

        ${svgCircle(cx - 100, cy, 40, "none", "#1e3a5f", 4)}
        ${svgCircle(cx + 100, cy, 40, "none", "#1e3a5f", 4)}

        ${svgLabel("Primary", cx - 130, cy + 70)}
        ${svgLabel("Secondary", cx + 70, cy + 70)}

        ${svgLabel("Turns Ratio n = " + n.toFixed(2), cx - 60, cy - 80)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runTltDesigner = function () {
    const Zp = parseFloat(document.getElementById("tlt_zp").value);
    const Zs = parseFloat(document.getElementById("tlt_zs").value);
    const freq = parseFloat(document.getElementById("tlt_freq").value);
    const mu = parseFloat(document.getElementById("tlt_mu").value);

    const n = turnsRatio(Zp, Zs);
    const L = lineLength(freq);
    const loss = coreLoss(freq, mu);

    const poster = tltPoster(n);

    const html = `
        <div class="card">
            <h3>Transformer Design Summary</h3>

            <strong>Primary Impedance:</strong> ${Zp} Ω<br>
            <strong>Secondary Impedance:</strong> ${Zs} Ω<br>
            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Core μr:</strong> ${mu}<br><br>

            <strong>Turns Ratio:</strong> n = ${n.toFixed(2)}<br>
            <strong>Quarter-Wave Line Length:</strong> ${L.toFixed(2)} m<br>
            <strong>Estimated Core Loss:</strong> ${loss.toFixed(2)} W (approx)<br><br>

            <p>Transmission line transformers provide broadband impedance transformation.</p>
            <p>Turns ratio determines impedance ratio: Zs/Zp = n².</p>
            <p>Core material affects loss and low-frequency performance.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("tlt_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Transformer Notes</h3>
        <p>1:4 and 1:9 transformers are common for EFHW and OCF antennas.</p>
        <p>Transmission line transformers are broadband and low-loss.</p>
        <p>Core μr determines low-frequency behavior.</p>
        <p>Quarter-wave sections provide impedance transformation without coils.</p>
    `;
};
