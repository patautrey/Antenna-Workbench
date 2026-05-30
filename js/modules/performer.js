/* ---------------------------------------------------------
   Antenna Workbench — Performer Vertical
   High-efficiency single-element vertical + boost controls
--------------------------------------------------------- */

import { wavelength } from "../utils.js";
import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../boost-engine.js";

function $(root, sel) { return root.querySelector(sel); }

function computePerformer(freqMHz, heightM, baseLoadingUh, radialCount, groundType) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    let baseGain = 2.0; // slightly better than plain 1/4λ

    if (groundType === "good") baseGain += 0.8;
    if (groundType === "poor") baseGain -= 0.8;
    if (groundType === "saltwater") baseGain += 2.0;

    // loading penalty if heavily loaded
    const loadingPenalty = Math.log10(Math.max(1, baseLoadingUh)) * 0.7;
    baseGain -= loadingPenalty;

    const radialFactor = Math.log10(Math.max(1, radialCount)) * 1.3;
    baseGain += radialFactor;

    const toa = Math.max(5, 20 - (frac - 0.25) * 35);

    return { lambda, frac, baseGain, toa, loadingPenalty };
}

/* ---------------------------------------------------------
   EXPORT DEFAULT
--------------------------------------------------------- */
export default function initPerformer(root) {
    if (!root) return;

    root.innerHTML = `
        <section class="tool">
            <h2>Performer Vertical</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="perf-freq" type="number" step="0.01" value="14.1">
                </label>

                <label>Height (m)
                    <input id="perf-height" type="number" step="0.01" value="12">
                </label>

                <label>Base Loading (µH)
                    <input id="perf-load" type="number" step="0.1" value="0">
                </label>

                <label>Radial Count
                    <input id="perf-radials" type="number" value="32">
                </label>
            </div>

            <label>Ground Type
                <select id="perf-ground">
                    <option value="good">Good soil</option>
                    <option value="average" selected>Average soil</option>
                    <option value="poor">Poor soil</option>
                    <option value="saltwater">Saltwater</option>
                </select>
            </label>

            <h3 style="margin-top:1rem;">Boost Controls</h3>
            <div class="field-grid">
                <label><input id="perf-boost-groundscreen" type="checkbox"> Ground screen</label>
                <label><input id="perf-boost-elevated" type="checkbox"> Elevated radials</label>
                <label><input id="perf-boost-saltwater" type="checkbox"> Saltwater enhancement</label>
                <label><input id="perf-boost-dxturbo" type="checkbox"> 0.70λ DX Turbo</label>
            </div>

            <button id="perf-compute" style="margin-top:1rem;">Compute Performer</button>

            <div id="perf-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = $("#perf-freq");
    const heightInput = $("#perf-height");
    const loadInput = $("#perf-load");
    const radialsInput = $("#perf-radials");
    const groundSelect = $("#perf-ground");

    const boostGroundScreen = $("#perf-boost-groundscreen");
    const boostElevated = $("#perf-boost-elevated");
    const boostSaltwater = $("#perf-boost-saltwater");
    const boostDxTurbo = $("#perf-boost-dxturbo");

    const summaryDiv = $("#perf-summary");
    const button = $("#perf-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const baseLoad = toNumber(loadInput.value);
        const radials = toNumber(radialsInput.value);
        const ground = groundSelect.value;

        requireFrequency(freq, errors);
        requirePositive(height, "Height", errors);
        requirePositive(radials, "Radial count", errors);
        if (baseLoad < 0) errors.push("Base loading must be ≥ 0 µH.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const base = computePerformer(freq, height, baseLoad, radials, ground);

        const boost = BoostEngine.computeBoost({
            groundScreen: boostGroundScreen.checked,
            elevatedRadials: boostElevated.checked,
            saltwater: boostSaltwater.checked,
            dxTurbo: boostDxTurbo.checked
        });

        const totalGain = base.baseGain + boost.totalBoost;

        log("Performer Vertical", {
            freq,
            height,
            baseLoad,
            radials,
            ground,
            base,
            boost
        });

        const boostLines = boost.details.length
            ? boost.details.map(d => `+${d.boost.toFixed(1)} dB from ${d.label}`).join("<br>")
            : "No boost options enabled.";

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Height:</strong> ${height.toFixed(1)} m (${(base.frac * 100).toFixed(1)}% of λ)</p>
            <p><strong>Base loading:</strong> ${baseLoad.toFixed(2)} µH (penalty ≈ ${base.loadingPenalty.toFixed(1)} dB)</p>
            <p><strong>Radials:</strong> ${radials}</p>
            <p><strong>Ground type:</strong> ${ground}</p>
            <p><strong>Base estimated gain:</strong> ${base.baseGain.toFixed(1)} dBi</p>
            <p><strong>Total boost:</strong> +${boost.totalBoost.toFixed(1)} dB</p>
            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>
            <p><strong>Estimated DX gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated TOA:</strong> ${base.toa.toFixed(0)}°</p>
        `);
    });
}
