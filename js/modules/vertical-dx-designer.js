/* ---------------------------------------------------------
   Antenna Workbench — Vertical DX Designer
   1/4-wave vertical with radials + always-visible boost controls
--------------------------------------------------------- */

import { wavelength } from "../utils.js";
import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../boost-engine.js";

function $(root, sel) { return root.querySelector(sel); }

/* BASE MODEL */
function computeVerticalDX(freqMHz, heightM, radialCount, radialLengthM, groundType) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    let baseGain = 1.5; // baseline 1/4λ vertical

    if (groundType === "good") baseGain += 0.8;
    if (groundType === "poor") baseGain -= 0.8;
    if (groundType === "saltwater") baseGain += 2.0;

    const radialFactor = Math.log10(Math.max(1, radialCount)) * 1.2;
    const lengthFactor = Math.min(1, radialLengthM / (lambda / 4));
    baseGain += radialFactor * lengthFactor;

    const toa = Math.max(5, 25 - (frac - 0.25) * 40);

    return { lambda, frac, baseGain, toa };
}

/* ---------------------------------------------------------
   EXPORT DEFAULT — REQUIRED BY YOUR LOADER
--------------------------------------------------------- */
export default function initVerticalDX(root) {
    if (!root) return;

    root.innerHTML = `
        <section class="tool">
            <h2>Vertical DX Designer</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="vdx-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Height (m)
                    <input id="vdx-height" type="number" step="0.01" value="10">
                </label>

                <label>Radial Count
                    <input id="vdx-radials" type="number" value="8">
                </label>

                <label>Radial Length (m)
                    <input id="vdx-radial-length" type="number" step="0.01" value="5">
                </label>
            </div>

            <label>Ground Type
                <select id="vdx-ground">
                    <option value="good">Good soil</option>
                    <option value="average" selected>Average soil</option>
                    <option value="poor">Poor soil</option>
                    <option value="saltwater">Saltwater</option>
                </select>
            </label>

            <h3 style="margin-top:1rem;">Boost Controls</h3>
            <div class="field-grid">
                <label><input id="vdx-boost-groundscreen" type="checkbox"> Ground screen</label>
                <label><input id="vdx-boost-elevated" type="checkbox"> Elevated radials</label>
                <label><input id="vdx-boost-saltwater" type="checkbox"> Saltwater enhancement</label>
                <label><input id="vdx-boost-dxturbo" type="checkbox"> 0.70λ DX Turbo</label>
            </div>

            <button id="vdx-compute" style="margin-top:1rem;">Compute Vertical DX</button>

            <div id="vdx-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = $("#vdx-freq");
    const heightInput = $("#vdx-height");
    const radialsInput = $("#vdx-radials");
    const radialLenInput = $("#vdx-radial-length");
    const groundSelect = $("#vdx-ground");

    const boostGroundScreen = $("#vdx-boost-groundscreen");
    const boostElevated = $("#vdx-boost-elevated");
    const boostSaltwater = $("#vdx-boost-saltwater");
    const boostDxTurbo = $("#vdx-boost-dxturbo");

    const summaryDiv = $("#vdx-summary");
    const button = $("#vdx-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const radials = toNumber(radialsInput.value);
        const radialLen = toNumber(radialLenInput.value);
        const ground = groundSelect.value;

        requireFrequency(freq, errors);
        requirePositive(height, "Height", errors);
        requirePositive(radials, "Radial count", errors);
        requirePositive(radialLen, "Radial length", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const base = computeVerticalDX(freq, height, radials, radialLen, ground);

        const boost = BoostEngine.computeBoost({
            groundScreen: boostGroundScreen.checked,
            elevatedRadials: boostElevated.checked,
            saltwater: boostSaltwater.checked,
            dxTurbo: boostDxTurbo.checked
        });

        const totalGain = base.baseGain + boost.totalBoost;

        const boostLines = boost.details.length
            ? boost.details.map(d => `+${d.boost.toFixed(1)} dB from ${d.label}`).join("<br>")
            : "No boost options enabled.";

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Height:</strong> ${height.toFixed(1)} m (${(base.frac * 100).toFixed(1)}% of λ)</p>
            <p><strong>Radials:</strong> ${radials} × ${radialLen.toFixed(1)} m</p>
            <p><strong>Ground type:</strong> ${ground}</p>
            <p><strong>Base estimated gain:</strong> ${base.baseGain.toFixed(1)} dBi</p>
            <p><strong>Total boost:</strong> +${boost.totalBoost.toFixed(1)} dB</p>
            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>
            <p><strong>Estimated DX gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated TOA:</strong> ${base.toa.toFixed(0)}°</p>
        `);
    });
}
