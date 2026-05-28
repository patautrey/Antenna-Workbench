/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Thermal Dissipation & Power Handling Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("power-handling.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function powerHandlingUI() {
    return `
        <h2>Antenna Thermal Dissipation & Power Handling Lab</h2>

        <div class="card">
            <label>Transmit Power (W):</label><br>
            <input id="ph_pwr" type="number" value="100" step="10"><br><br>

            <label>Duty Cycle (0–1):</label><br>
            <input id="ph_duty" type="number" value="0.5" step="0.1"><br><br>

            <label>Conductor Diameter (mm):</label><br>
            <input id="ph_diam" type="number" value="1.5" step="0.1"><br><br>

            <label>Coil Loss Resistance (Ω):</label><br>
            <input id="ph_coil" type="number" value="1" step="0.1"><br><br>

            <label>Trap Loss Resistance (Ω):</label><br>
            <input id="ph_trap" type="number" value="0.5" step="0.1"><br><br>

            <label>Current Max (A):</label><br>
            <input id="ph_I" type="number" value="4" step="0.1"><br><br>

            <button class="btn-primary" onclick="runPowerHandling()">Analyze Power Handling</button>
        </div>

        <div id="ph_results"></div>
    `;
}

/* ------------------------------------------------------------
   Thermal Physics
   ------------------------------------------------------------ */

/**
 * Skin-effect AC resistance:
 * R_ac ≈ k / diameter
 * (k is a constant chosen for HF copper wire)
 */
function acResistance(diamMm) {
    const k = 0.02; // HF copper constant
    return k / diamMm;
}

/**
 * Heating power:
 * P_heat = I^2 * R
 */
function heatingPower(I, R) {
    return I * I * R;
}

/**
 * Temperature rise:
 * ΔT ≈ P_heat * duty * 0.5
 * (very simplified thermal model)
 */
function tempRise(Pheat, duty) {
    return Pheat * duty * 0.5;
}

/**
 * Safe power:
 * P_safe ≈ P_input * (50 / ΔT)
 */
function safePower(Pin, dT) {
    return Pin * (50 / Math.max(1, dT));
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function powerPoster(dT) {
    const cx = 400;
    const cy = 300;

    const barWidth = 300;
    const scaled = Math.min(barWidth, dT * 5);

    const inner = `
        ${svgTitle("Thermal Load")}

        ${svgLine(cx - barWidth/2, cy, cx + barWidth/2, cy, "#444", 20)}
        ${svgLine(cx - barWidth/2, cy, cx - barWidth/2 + scaled, cy, "#cc0000", 20)}

        ${svgLabel("ΔT = " + dT.toFixed(1) + "°C", cx - 40, cy - 30)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runPowerHandling = function () {
    const Pin = parseFloat(document.getElementById("ph_pwr").value);
    const duty = parseFloat(document.getElementById("ph_duty").value);
    const diam = parseFloat(document.getElementById("ph_diam").value);
    const Rcoil = parseFloat(document.getElementById("ph_coil").value);
    const Rtrap = parseFloat(document.getElementById("ph_trap").value);
    const I = parseFloat(document.getElementById("ph_I").value);

    const Rac = acResistance(diam);
    const Rtotal = Rac + Rcoil + Rtrap;

    const Pheat = heatingPower(I, Rtotal);
    const dT = tempRise(Pheat, duty);
    const Psafe = safePower(Pin, dT);

    const poster = powerPoster(dT);

    const html = `
        <div class="card">
            <h3>Thermal Power Handling Summary</h3>

            <strong>Input Power:</strong> ${Pin} W<br>
            <strong>Duty Cycle:</strong> ${duty}<br><br>

            <strong>AC Resistance:</strong> ${Rac.toFixed(3)} Ω<br>
            <strong>Coil Loss:</strong> ${Rcoil} Ω<br>
            <strong>Trap Loss:</strong> ${Rtrap} Ω<br>
            <strong>Total R:</strong> ${Rtotal.toFixed(3)} Ω<br><br>

            <strong>Heating Power:</strong> ${Pheat.toFixed(2)} W<br>
            <strong>Temperature Rise:</strong> ${dT.toFixed(1)} °C<br>
            <strong>Estimated Safe Power:</strong> ${Psafe.toFixed(1)} W<br><br>

            <p>Thermal limits depend on duty cycle, conductor size, and loss components.</p>
            <p>Coils and traps are usually the first components to overheat.</p>
            <p>High duty modes (FT8, RTTY) stress antennas far more than SSB/CW.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("ph_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Thermal Notes</h3>
        <p>Skin effect increases resistance at HF.</p>
        <p>Coils and traps concentrate current and heat.</p>
        <p>Duty cycle is the #1 factor in overheating.</p>
        <p>Safe power decreases rapidly as temperature rises.</p>
    `;
};
