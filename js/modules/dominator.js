// /HF-Workbench/js/modules/dominator.js
// Full Dominator Array Designer with automatic plots (Elevation, Azimuth, Gain, SWR, ERP)

import { computeBoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadDominatorDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="dom-wrapper">
            <h2>Dominator Vertical Array Designer</h2>

            <div class="dom-layout">
                <!-- INPUT COLUMN -->
                <div class="dom-column dom-inputs">
                    <h3>Inputs</h3>

                    <div class="dom-field">
                        <label for="dom-frequency">Frequency (MHz)</label>
                        <input type="number" id="dom-frequency" min="1" max="60" step="0.1" value="14.2">
                    </div>

                    <div class="dom-field">
                        <label for="dom-height">Element Height (m)</label>
                        <input type="number" id="dom-height" min="1" max="30" step="0.1" value="10">
                    </div>

                    <div class="dom-field">
                        <label for="dom-elements">Number of Elements</label>
                        <input type="number" id="dom-elements" min="1" max="8" step="1" value="3">
                    </div>

                    <div class="dom-field">
                        <label for="dom-spacing">Element Spacing (m)</label>
                        <input type="number" id="dom-spacing" min="0" max="40" step="0.1" value="5">
                    </div>

                    <div class="dom-field">
                        <label for="dom-phasing">Phasing</label>
                        <select id="dom-phasing">
                            <option value="broadside">Broadside</option>
                            <option value="endfire">Endfire</option>
                            <option value="cardioid">Cardioid</option>
                            <option value="supergain">Supergain</option>
                        </select>
                    </div>

                    <div class="dom-field">
                        <label for="dom-time">Time of Day</label>
                        <select id="dom-time">
                            <option value="day">Day</option>
                            <option value="night">Night</option>
                            <option value="dawn">Dawn</option>
                            <option value="dusk">Dusk</option>
                        </select>
                    </div>

                    <div class="dom-field dom-checkbox">
                        <label>
                            <input type="checkbox" id="dom-seaside">
                            Near Seaside (≤ 1λ from shoreline)
                        </label>
                    </div>

                    <fieldset class="dom-group">
                        <legend>Loading Coil</legend>
                        <div class="dom-field dom-checkbox">
                            <label>
                                <input type="checkbox" id="dom-coil-enabled">
                                Enable Loading Coil
                            </label>
                        </div>
                        <div class="dom-field">
                            <label for="dom-coil-position">Coil Position</label>
                            <select id="dom-coil-position">
                                <option value="base">Base</option>
                                <option value="mid">Mid</option>
                                <option value="top">Top</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="dom-group">
                        <legend>Capacitance Hat</legend>
                        <div class="dom-field dom-checkbox">
                            <label>
                                <input type="checkbox" id="dom-cap-enabled">
                                Enable Capacitance Hat
                            </label>
                        </div>
                        <div class="dom-field">
                            <label for="dom-cap-size">Hat Size</label>
                            <select id="dom-cap-size">
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </fieldset>

                    <button id="dom-compute" class="dom-button">Compute Dominator Array</button>
                </div>

                <!-- RESULTS COLUMN -->
                <div class="dom-column dom-results">
                    <h3>Results</h3>
                    <table class="dom-results-table">
                        <thead>
                            <tr><th>Metric</th><th>Value</th></tr>
                        </thead>
                        <tbody id="dom-results-body">
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
                    <div id="plot-elevation" class="dom-plot"></div>
                    <div id="plot-azimuth" class="dom-plot"></div>
                    <div id="plot-gain" class="dom-plot"></div>
                    <div id="plot-swr" class="dom-plot"></div>
                    <div id="plot-erp" class="dom-plot"></div>
                </div>
            </div>
        </section>
    `;

    const btn = document.querySelector("#dom-compute");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const frequencyMHz = parseFloat(document.querySelector("#dom-frequency").value) || 14.2;
        const heightMeters = parseFloat(document.querySelector("#dom-height").value) || 10;
        const elements = parseInt(document.querySelector("#dom-elements").value) || 3;
        const spacing = parseFloat(document.querySelector("#dom-spacing").value) || 5;
        const phasing = document.querySelector("#dom-phasing").value;

        const timeOfDay = document.querySelector("#dom-time").value;
        const seaside = document.querySelector("#dom-seaside").checked;

        const coilEnabled = document.querySelector("#dom-coil-enabled").checked;
        const coilPosition = document.querySelector("#dom-coil-position").value;

        const capEnabled = document.querySelector("#dom-cap-enabled").checked;
        const capSize = document.querySelector("#dom-cap-size").value;

        const boost = computeBoostEngine({
            frequencyMHz,
            heightMeters,
            reflectorSpacingMeters: spacing,
            directorSpacingMeters: spacing,
            foldoverAngleDeg: 0,
            loadingCoil: { enabled: coilEnabled, position: coilPosition },
            capHat: { enabled: capEnabled, size: capSize },
            linearLoading: { enabled: false, style: "folded" },
            environment: { timeOfDay, seaside }
        });

        const tbody = document.querySelector("#dom-results-body");
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
            elevationGain: [...Array(91).keys()].map(a => Math.sin(a * Math.PI / 180) * (5 + elements * 0.5)),

            azimuthAngles: [...Array(361).keys()],
            azimuthGain: [...Array(361).keys()].map(a => 3 + Math.cos(a * Math.PI / 180) * (2 + elements * 0.3)),

            freqSweep: [frequencyMHz - 0.2, frequencyMHz, frequencyMHz + 0.2],
            gainSweep: [3, 4 + elements * 0.5, 3],
            swrSweep: [2.0, 1.4, 2.1],
            erpSweep: [100, 140 + elements * 10, 110]
        };

        PlotEngine.renderAll(antennaData, boost);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#dominator") {
        loadDominatorDesigner();
    }
});
