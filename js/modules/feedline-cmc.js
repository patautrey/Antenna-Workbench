/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Feedline & CMC Engine
   ============================================================ */

import {
    coaxLossDb,
    mismatchLossDb,
    finalDeliveredPower,
    computeErp
} from "../core/feedline-engine.js";

import {
    requiredInductanceMhy,
    turnsForInductance,
    mix31,
    mix43
} from "../core/choke-engine.js";

import { formatLengthMetersFeet } from "../core/vf-engine.js";

console.log("feedline-cmc.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function feedlineCmcUI() {
    return `
        <h2>Feedline & CMC Engine</h2>

        <div class="card">
            <label>Input Power (W):</label><br>
            <input id="fc_power" type="number" value="100"><br><br>

            <label>Coax Type:</label><br>
            <select id="fc_coax">
                <option>RG-58</option>
                <option>RG-8X</option>
                <option>RG-213</option>
                <option>LMR-240</option>
                <option>LMR-400</option>
                <option>LMR-600</option>
            </select><br><br>

            <label>Coax Length (ft):</label><br>
            <input id="fc_length" type="number" value="50"><br><br>

            <label>SWR:</label><br>
            <input id="fc_swr" type="number" value="1.5" step="0.1"><br><br>

            <label>Antenna Gain (dBi):</label><br>
            <input id="fc_gain" type="number" value="2.1" step="0.1"><br><br>

            <label>CMC Target Impedance (Ω):</label><br>
            <input id="fc_z" type="number" value="500"><br><br>

            <label>CMC Frequency (MHz):</label><br>
            <input id="fc_freq" type="number" value="7.2" step="0.1"><br><br>

            <button class="btn-primary" onclick="runFeedlineCmc()">Calculate</button>
        </div>

        <div id="fc_results"></div>
    `;
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runFeedlineCmc = function () {
    const power = parseFloat(document.getElementById("fc_power").value);
    const coax = document.getElementById("fc_coax").value;
    const length = parseFloat(document.getElementById("fc_length").value);
    const swr = parseFloat(document.getElementById("fc_swr").value);
    const gain = parseFloat(document.getElementById("fc_gain").value);
    const targetZ = parseFloat(document.getElementById("fc_z").value);
    const freq = parseFloat(document.getElementById("fc_freq").value);

    // Feedline calculations
    const coaxDb = coaxLossDb(length, coax);
    const mismatchDb = mismatchLossDb(swr);
    const delivered = finalDeliveredPower(power, coaxDb, mismatchDb);
    const erp = computeErp(delivered, gain);

    // CMC calculations
    const mH = requiredInductanceMhy(freq, targetZ);
    const turns31 = turnsForInductance(mH, mix31);
    const turns43 = turnsForInductance(mH, mix43);

    const html = `
        <div class="card">
            <h3>Feedline Results</h3>

            <strong>Input Power:</strong> ${power} W<br>
            <strong>Coax Type:</strong> ${coax}<br>
            <strong>Length:</strong> ${length} ft<br><br>

            <strong>Coax Loss:</strong> ${coaxDb.toFixed(2)} dB<br>
            <strong>Mismatch Loss (SWR ${swr}):</strong> ${mismatchDb.toFixed(2)} dB<br><br>

            <strong>Power Delivered:</strong> ${delivered.toFixed(1)} W<br>
            <strong>ERP:</strong> ${erp.toFixed(1)} W ERP<br>
        </div>

        <div class="card">
            <h3>CMC Choke Recommendations</h3>

            <strong>Target Impedance:</strong> ${targetZ} Ω<br>
            <strong>Frequency:</strong> ${freq} MHz<br><br>

            <strong>Required Inductance:</strong> ${mH.toFixed(3)} mH<br><br>

            <strong>Mix 31 Turns:</strong> ${turns31.toFixed(1)} turns<br>
            <strong>Mix 43 Turns:</strong> ${turns43.toFixed(1)} turns<br>
        </div>
    `;

    document.getElementById("fc_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Feedline & CMC Notes</h3>
        <p>Coax loss increases with frequency — UHF is far more sensitive.</p>
        <p>Mismatch loss becomes significant above SWR ≈ 2:1.</p>
        <p>CMC chokes should target 500–5000 Ω for HF suppression.</p>
        <p>Mix 31 excels below 10 MHz; Mix 43 is strong from 10–30 MHz.</p>
    `;
};
