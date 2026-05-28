/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Impedance Matching Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel, svgCircle } from "../core/poster-engine.js";

console.log("match-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function matchLabUI() {
    return `
        <h2>Impedance Matching Lab</h2>

        <div class="card">
            <label>Source Impedance (Ω):</label><br>
            <input id="match_zs" type="number" value="50"><br><br>

            <label>Load Impedance (Ω):</label><br>
            <input id="match_zl" type="number" value="200"><br><br>

            <label>Frequency (MHz):</label><br>
            <input id="match_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Network Type:</label><br>
            <select id="match_type">
                <option value="l">L‑Network</option>
                <option value="t">T‑Network</option>
                <option value="pi">Pi‑Network</option>
            </select><br><br>

            <button class="btn-primary" onclick="runMatchLab()">Analyze</button>
        </div>

        <div id="match_results"></div>
    `;
}

/* ------------------------------------------------------------
   Matching Math
   ------------------------------------------------------------ */

/**
 * L‑network formulas:
 * If ZL > ZS → step‑up network
 * If ZL < ZS → step‑down network
 */
function lNetwork(zs, zl, freqMhz) {
    const f = freqMhz * 1e6;
    const w = 2 * Math.PI * f;

    if (zl > zs) {
        // Step-up
        const Q = Math.sqrt(zl / zs - 1);
        const Xs = Q * zs;
        const Xp = zl / Q;
        return {
            series: Xs,
            shunt: Xp,
            mode: "Step‑Up"
        };
    } else {
        // Step-down
        const Q = Math.sqrt(zs / zl - 1);
        const Xs = zs / Q;
        const Xp = Q * zl;
        return {
            series: Xs,
            shunt: Xp,
            mode: "Step‑Down"
        };
    }
}

/**
 * T‑network approximation:
 * Very wide matching range, but higher loss.
 */
function tNetwork(zs, zl, freqMhz) {
    const f = freqMhz * 1e6;
    const w = 2 * Math.PI * f;

    const X1 = Math.sqrt(zs * zl);
    const X2 = X1;
    const X3 = Math.abs(zl - zs);

    return { X1, X2, X3 };
}

/**
 * Pi‑network approximation:
 * Common in tube transmitters.
 */
function piNetwork(zs, zl, freqMhz) {
    const f = freqMhz * 1e6;
    const w = 2 * Math.PI * f;

    const Q = 5; // typical loaded Q
    const Xc1 = zs / Q;
    const Xc2 = zl / Q;
    const Xl = Q * Math.sqrt(zs * zl);

    return { Xc1, Xl, Xc2 };
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function matchPoster(type) {
    let inner = `${svgTitle("Matching Network Diagram")}`;

    if (type === "l") {
        inner += `
            ${svgLine(200, 300, 350, 300, "#1e3a5f", 6)}
            ${svgCircle(350, 300, 20, "#ffb400")}
            ${svgLine(350, 300, 500, 300, "#1e3a5f", 6)}
            ${svgLabel("L‑Network", 360, 350)}
        `;
    }

    if (type === "t") {
        inner += `
            ${svgLine(200, 300, 300, 300, "#1e3a5f", 6)}
            ${svgCircle(300, 300, 20, "#ffb400")}
            ${svgCircle(400, 300, 20, "#ffb400")}
            ${svgCircle(500, 300, 20, "#ffb400")}
            ${svgLine(500, 300, 600, 300, "#1e3a5f", 6)}
            ${svgLabel("T‑Network", 360, 350)}
        `;
    }

    if (type === "pi") {
        inner += `
            ${svgLine(200, 300, 300, 300, "#1e3a5f", 6)}
            ${svgCircle(300, 300, 20, "#ffb400")}
            ${svgCircle(400, 250, 20, "#ffb400")}
            ${svgCircle(500, 300, 20, "#ffb400")}
            ${svgLine(500, 300, 600, 300, "#1e3a5f", 6)}
            ${svgLabel("Pi‑Network", 360, 350)}
        `;
    }

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runMatchLab = function () {
    const zs = parseFloat(document.getElementById("match_zs").value);
    const zl = parseFloat(document.getElementById("match_zl").value);
    const freq = parseFloat(document.getElementById("match_freq").value);
    const type = document.getElementById("match_type").value;

    let result;

    if (type === "l") result = lNetwork(zs, zl, freq);
    if (type === "t") result = tNetwork(zs, zl, freq);
    if (type === "pi") result = piNetwork(zs, zl, freq);

    const poster = matchPoster(type);

    const html = `
        <div class="card">
            <h3>Matching Network Analysis</h3>

            <strong>Source Impedance:</strong> ${zs} Ω<br>
            <strong>Load Impedance:</strong> ${zl} Ω<br>
            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <pre>${JSON.stringify(result, null, 2)}</pre>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("match_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Matching Notes</h3>
        <p>L‑networks are low‑loss and simple but limited in range.</p>
        <p>T‑networks match almost anything but have higher loss.</p>
        <p>Pi‑networks are common in tube transmitters and allow harmonic filtering.</p>
        <p>Impedance matching improves power transfer and reduces SWR.</p>
    `;
};
