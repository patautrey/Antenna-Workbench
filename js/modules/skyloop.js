// /HF-Workbench/js/modules/skyloop.js
// Full Skyloop Designer with automatic plots (Elevation, Azimuth, Gain, SWR, ERP)

import { computeBoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadSkyloopDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="skyloop-wrapper">
            <h2>Skyloop / Full-Wave Loop Designer</h2>

            <div class="skyloop-layout">
                <!-- INPUT COLUMN -->
                <div class="skyloop-column skyloop-inputs">
                    <h3>Inputs</h3>

                    <div class="skyloop-field">
                        <label for="sky-frequency">Frequency (MHz)</label>
                        <input type="number" id="sky-frequency" min="1" max="60" step="0.1" value="3.9">
                    </div>

                    <div class="skyloop-field">
                        <label for="sky-perimeter">Loop Perimeter (m)</label>
                        <input type="number" id="sky-perimeter" min="20" max="400" step="1" value="80">
                    </div>

                    <div class="skyloop-field">
                        <label for="sky-height">Average Height (m)</label>
                        <input type="number" id="sky-height" min="2" max="40" step="0.1" value="10">
                    </div>

                    <div class="skyloop-field">
                        <label for="sky-time">Time of Day</label>
                        <select id="sky-time">
                            <option value="day">Day</option>
                            <option value="night">Night</option>
                            <option value="dawn">Dawn</option>
                            <option value="dusk">Dusk</option>
                        </select>
                    </div>

                    <div class="skyloop-field skyloop-checkbox">
                        <label>
                            <input type="checkbox" id="sky-seaside">
                            Near Seaside (≤ 1λ from shoreline)
                        </label>
                    </div>

                    <fieldset class="skyloop-group">
                        <legend>Loading Coil</legend>
                        <div class="skyloop-field skyloop-checkbox">
                            <label>
                                <input type="checkbox" id="sky-coil-enabled">
                                Enable Loading Coil
                            </label>
                        </div>
                        <div class="skyloop-field">
                            <label for="sky-coil-position">Coil Position</label>
                            <select id="sky-coil-position">
                                <option value="base">Base</option>
                                <option value="mid">Mid</option>
                                <option value="top">Top</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="skyloop-group">
                        <legend>Capacitance Hat</legend>
                        <div class="skyloop-field skyloop-checkbox">
                            <label>
                                <input type="checkbox" id="sky-cap-enabled">
                                Enable Capacitance Hat
                            </label>
                        </div>
                        <div class="skyloop-field">
                            <label for="sky-cap-size">Hat Size</label>
                            <select id="sky-cap-size">
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </fieldset>

                    <button id="sky-compute" class="skyloop-button">Compute Skyloop Performance</button>
                </div>

                <!-- RESULTS COLUMN -->
                <div class="skyloop-column skyloop-results">
                    <h3>Results</h3>
                    <table class="skyloop-results-table">
                        <thead>
                            <tr><th>Metric</th><th>Value</th></tr>
                        </thead>
                        <tbody id="sky-results-body">
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
                    <div id="plot-elevation" class="skyloop-plot"></div>
                    <div id="plot-azimuth" class="skyloop-plot"></div>
                    <div id="plot-gain" class="skyloop-plot"></div>
                    <div id="plot-swr" class="skyloop-plot"></div>
                    <div id="plot-erp" class="skyloop-plot"></div>
                </div>
            </div>
        </section>
    `;

    const btn = document.querySelector("#sky-compute");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const frequencyMHz = parseFloat(document.querySelector("#sky-frequency").value) || 3.9;
        const perimeter = parseFloat(document.querySelector("#sky-perimeter").value) || 80;
        const heightMeters = parseFloat(document.querySelector("#sky-height").value) || 10;

        const timeOfDay = document.querySelector("#sky-time").value;
        const seaside = document.querySelector("#sky-seaside").checked;

        const coilEnabled = document.querySelector("#sky-coil-enabled").checked;
        const coilPosition = document.querySelector("#sky-coil-position").value;

        const capEnabled = document.querySelector("#sky-cap-enabled").checked;
        const capSize = document.querySelector("#sky-cap-size").value;

        const boost = computeBoostEngine({
            frequencyMHz,
            heightMeters,
            reflectorSpacingMeters: 0,
            directorSpacingMeters: 0,
            foldoverAngleDeg: 0,
            loadingCoil: { enabled: coilEnabled, position: coilPosition },
            capHat: { enabled: capEnabled, size: capSize },
            linearLoading: { enabled: false, style: "folded" },
            environment: { timeOfDay, seaside }
        });

        const tbody = document.querySelector("#sky-results-body");
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
            elevationGain: [...Array(91).keys()].map(a => Math.sin(a * Math.PI / 180) * 7),

            azimuthAngles: [...Array(361).keys()],
            azimuthGain: [...Array(361).keys()].map(a => 3 + Math.cos(a * Math.PI / 180) * 2),

            freqSweep: [frequencyMHz - 0.2, frequencyMHz, frequencyMHz + 0.2],
            gainSweep: [3, 4, 3],
            swrSweep: [2.0, 1.4, 2.1],
            erpSweep: [90, 120, 95]
        };

        PlotEngine.renderAll(antennaData, boost);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#skyloop") {
        loadSkyloopDesigner();
    }
});
