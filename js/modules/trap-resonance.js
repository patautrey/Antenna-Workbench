/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Trap Resonance Analyzer
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("trap-resonance.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function trapResonanceUI() {
    return `
        <h2>Trap Resonance Analyzer</h2>

        <div class="card">
            <label>Inductance (μH):</label><br>
            <input id="tr_L" type="number" value="8" step="0.1"><br><br>

            <label>Capacitance (pF):</label><br>
            <input id="tr_C" type="number" value="100" step="1"><br><br>

            <label>Operating Frequency (MHz):</label><br>
            <input id="tr_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Trap Loss Resistance (Ω):</label><br>
            <input id="tr_R" type="number" value="1" step="0.1"><br><br>

            <button class="btn-primary" onclick="runTrapResonance()">Analyze Trap</button>
        </div>

        <div id="tr_results"></div>
    `;
}

/* ------------------------------------------------------------
   Trap Math
   ------------------------------------------------------------ */

/**
 * Resonant frequency:
 * f0 = 1 / (2π√(LC))
 * L in μH, C in pF
 */
function trapResonantFreq(LuH, CpF) {
    const L = LuH * 1e-6;
    const C = CpF * 1e-12;
    return 1 / (2 * Math.PI * Math.sqrt(L * C)) / 1e6; // MHz
}

/**
 * Reactance:
 * Xl = 2πfL
 * Xc = 1/(2πfC)
 */
function trapReactance(freq, LuH, CpF) {
    const L = LuH * 1e-6;
    const C = CpF * 1e-12;
    const w = 2 * Math.PI * freq * 1e6;

    const Xl = w * L;
    const Xc = 1 / (w * C);

    return Xl - Xc; // net reactance
}

/**
 * Trap Q:
 * Q = X / Rloss
 */
function trapQ(X, Rloss) {
    return Math.abs(X) / Rloss;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function trapPoster(f0, X) {
    const cx = 400;
    const cy = 300;

    const scale = 200 / Math.max(1, Math.abs(X));

    const inner = `
        ${svgTitle("Trap Resonance")}

        ${svgLine(cx - 150, cy, cx + 150, cy, "#444", 4)}
        ${svgLine(cx, cy - 100, cx, cy + 100, "#444", 2)}

        ${svgLabel("f0 = " + f0.toFixed(2) + " MHz", cx - 60, cy - 120)}
        ${svgLabel("X = " + X.toFixed(1) + " Ω", cx - 40, cy + 140)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runTrapResonance = function () {
    const L = parseFloat(document.getElementById("tr_L").value);
    const C = parseFloat(document.getElementById("tr_C").value);
    const freq = parseFloat(document.getElementById("tr_freq").value);
    const Rloss = parseFloat(document.getElementById("tr_R").value);

    const f0 = trapResonantFreq(L, C);
    const X = trapReactance(freq, L, C);
    const Q = trapQ(X, Rloss);

    const poster = trapPoster(f0, X);

    const html = `
        <div class="card">
            <h3>Trap Resonance Analysis</h3>

            <strong>Inductance:</strong> ${L} μH<br>
            <strong>Capacitance:</strong> ${C} pF<br>
            <strong>Operating Frequency:</strong> ${freq} MHz<br>
            <strong>Loss Resistance:</strong> ${Rloss} Ω<br><br>

            <strong>Resonant Frequency:</strong> ${f0.toFixed(2)} MHz<br>
            <strong>Net Reactance:</strong> ${X.toFixed(1)} Ω<br>
            <strong>Trap Q:</strong> ${Q.toFixed(1)}<br><br>

            <p>Below resonance, the trap behaves inductively.</p>
            <p>Above resonance, the trap behaves capacitively.</p>
            <p>At resonance, the trap presents high impedance and isolates segments.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("tr_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Trap Notes</h3>
        <p>Traps isolate antenna segments at their resonant frequency.</p>
        <p>Trap Q affects efficiency and bandwidth.</p>
        <p>Loss resistance reduces trap effectiveness.</p>
        <p>Trap reactance determines how the antenna behaves above/below resonance.</p>
    `;
};
