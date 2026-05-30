// /HF-Workbench/js/modules/doublet.js
// Full Doublet Designer with automatic plots (Elevation, Azimuth, Gain, SWR, ERP)

import { computeBoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadDoubletDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="doublet-wrapper">
            <h2>Doublet / Multiband Dipole Designer</h2>

            <div class="doublet-layout">
                <!-- INPUT COLUMN -->
                <div class="doublet-column doublet-inputs">
                    <h3>Inputs</h3>

                    <div class="doublet-field">
                        <label for="dbl-frequency">Frequency (MHz)</label>
                        <input type="number" id="dbl-frequency" min="1" max="60" step="0.1" value="7.1">
                    </div>

                    <div class="doublet-field">
                        <label for="dbl-leg">Leg Length (m)</label>
                        <input type="number" id="dbl-leg" min="1" max="80" step="0.1" value="20">
                    </div>

                    <div class="doublet-field">
                        <label for="dbl-height">Feedpoint Height (m)</label>
                        <input type="number" id="dbl-height" min="1" max="40" step="0.1" value="10">
                    </div>

                    <div class="doublet-field">
                        <label for="dbl-time">Time of Day</label>
                        <select id="dbl-time">
                            <option value="day">Day</option>
                            <option value="night">Night</option>
                            <option value="dawn">Dawn</option>
                            <option value="dusk">Dusk</option>
                        </select>
                    </div>

                    <div class="doublet-field doublet-checkbox">
                        <label>
                            <input type="checkbox" id="dbl-seaside">
                            Near Seaside (≤ 1λ from shoreline)
                        </label>
                    </div>

                    <fieldset class="doublet-group">
                        <legend>Loading Coil</legend>
                        <div class="doublet-field doublet-checkbox">
                            <label>
                                <input type="checkbox" id="dbl-coil-enabled">
                                Enable Loading Coil
                            </label>
                        </div>
                        <div class="doublet-field">
                            <label for="dbl-coil-position">Coil Position</label>
                            <select id="dbl-coil-position">
                                <option value="base">Base</option>
                                <option value="mid">Mid</option>
                                <option value="top">Top</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="doublet-group">
                        <legend>Capacitance Hat</legend>
                        <div class="doublet-field doublet-checkbox">
                            <label>
                                <input type="checkbox" id="dbl-cap-enabled">
                                Enable Capacitance Hat
                            </label>
                        </div>
                        <div class="doublet-field">
                            <label for="dbl-cap-size">Hat Size</label>
                            <select id="dbl-cap-size">
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="doublet-group">
                        <legend>Linear Loading</legend>
                        <div class="doublet-field doublet-checkbox">
                            <label>
                                <input type="checkbox" id="dbl-lin-enabled">
                                Enable Linear Loading
                            </label>
                        </div>
                        <div class="doublet-field">
                            <label for="dbl-lin-style">Style</label>
                            <select id="dbl-lin-style">
                                <option value="folded">Folded</option>
                                <option value="zigzag">Zig-zag</option>
                                <option value="ladler">Ladder</option>
                            </select>
                        </div>
                    </fieldset>

                    <button id="dbl-compute" class="doublet-button">Compute Doublet Performance</button>
                </div>

                <!-- RESULTS COLUMN -->
                <div class="doublet-column doublet-results">
                    <h3>Results</h3>
                    <table class="doublet-results-table">
                        <thead>
                            <tr><th>Metric</th><th>Value</th></tr>
                        </thead>
                        <tbody id="dbl-results-body">
                            <tr><td>DX Boost</td><td>—</td></tr>
                            <tr><td>NVIS Boost</td><td>—</td></tr>
                            <tr><td>TOA Shift</td><td>—</td></tr>
                            <tr><td>Efficiency</td><td>—</td></tr>
                            <tr><td>F/B</td><td>—</td></tr>
                            <tr><td>F/S</td><td>—</td></tr>
                            <tr><td>Height Fraction</td><td>—</td></tr>
                            <tr><td>Effective Height Fraction</td><td>—</td></tr>
                        </tbody>
                    </table>

                    <h3>Plots</h3>
                    <div id="plot-elevation" class="doublet-plot"></div>
                    <div id="plot-azimuth" class="doublet-plot"></div>
                    <div id="plot-gain" class="doublet-plot"></div>
                    <div id="plot-swr" class="doublet-plot"></div>
                    <div id="plot-erp" class="doublet-plot"></div>
                </div>
            </div>
        </section>
    `;

    const btn = document.querySelector("#dbl-compute");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const frequencyMHz = parseFloat(document.querySelector("#dbl-frequency").value) || 7.1;
        const legLength = parseFloat(document.querySelector("#dbl-leg").value) || 20;
        const heightMeters = parseFloat(document.querySelector("#dbl-height").value) || 10;

        const timeOfDay = document.querySelector("#dbl-time").value;
        const seaside = document.querySelector("#dbl-seaside").checked;

        const coilEnabled = document.querySelector("#dbl-coil-enabled").checked;
        const coilPosition = document.querySelector("#dbl-coil-position").value;

        const capEnabled = document.querySelector("#dbl-cap-enabled").checked;
        const capSize = document.querySelector("#dbl-cap-size").value;

        const linEnabled = document.querySelector("#dbl-lin-enabled").checked;
        const linStyle = document.querySelector("#dbl-lin-style").value;

        const boost = computeBoostEngine({
            frequencyMHz,
            heightMeters,
            reflectorSpacingMeters: 0,
            directorSpacingMeters: 0,
            foldoverAngleDeg: 0,
            loadingCoil: { enabled: coilEnabled, position: coilPosition },
            capHat: { enabled: capEnabled, size: capSize },
            linearLoading: { enabled: linEnabled, style: linStyle },
            environment: { timeOfDay, seaside }
        });

        const tbody = document.querySelector("#dbl-results-body");
        tbody.innerHTML = `
            <tr><td>DX Boost</td><td>${boost.dxBoost.toFixed(1)} dB</td></tr>
            <tr><td>NVIS Boost</td><td>${boost.nvisBoost.toFixed(1)} dB</td></tr>
            <tr><td>TOA Shift</td><td>${boost.toaShiftDeg.toFixed(1)}°</td></tr>
            <tr><td>Efficiency</td><td>${boost.efficiency.toFixed(2)}</td></tr>
            <tr><td>F/B</td><td>${boost.fb.toFixed(1)} dB</td></tr>
            <tr><td>F/S</td><td>${boost.fs.toFixed(1)} dB</td></tr>
            <tr><td>Height Fraction</td><td>${boost.heightFraction.toFixed(3)} λ</td></tr>
            <tr><td>Effective Height Fraction</td><td>${boost.effectiveHeightFraction.toFixed(3)} λ</td></tr>
        `;

        // Dummy antennaData for now — real modeling comes later
        const antennaData = {
            elevationAngles: [...Array(91).keys()],
            elevationGain: [...Array(91).keys()].map(a => Math.sin(a * Math.PI / 180) * 6),

            azimuthAngles: [...Array(361).keys()],
            azimuthGain: [...Array(361).keys()].map(a => 2 + Math.cos(a * Math.PI / 180) * 1.8),

            freqSweep: [frequencyMHz - 0.2, frequencyMHz, frequencyMHz + 0.2],
            gainSweep: [2, 3, 2],
            swrSweep: [2.2, 1.4, 2.3],
            erpSweep: [70, 90, 75]
        };

        PlotEngine.renderAll(antennaData, boost);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#doublet") {
        loadDoubletDesigner();
    }
});
