// /HF-Workbench/js/modules/performer.js
// Full Performer Vertical Designer with automatic plots (Elevation, Azimuth, Gain, SWR, ERP)

import { computeBoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadPerformerDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="performer-wrapper">
            <h2>Performer Vertical Designer</h2>

            <div class="performer-layout">
                <!-- INPUT COLUMN -->
                <div class="performer-column performer-inputs">
                    <h3>Inputs</h3>

                    <div class="performer-field">
                        <label for="perf-frequency">Frequency (MHz)</label>
                        <input type="number" id="perf-frequency" min="1" max="60" step="0.1" value="14.2">
                    </div>

                    <div class="performer-field">
                        <label for="perf-height">Vertical Height (m)</label>
                        <input type="number" id="perf-height" min="1" max="30" step="0.1" value="10">
                    </div>

                    <div class="performer-field">
                        <label for="perf-radials">Radial Count</label>
                        <input type="number" id="perf-radials" min="0" max="120" step="1" value="32">
                    </div>

                    <div class="performer-field">
                        <label for="perf-radial-length">Radial Length (m)</label>
                        <input type="number" id="perf-radial-length" min="1" max="40" step="0.1" value="10">
                    </div>

                    <div class="performer-field">
                        <label for="perf-mount">Mount Type</label>
                        <select id="perf-mount">
                            <option value="ground">Ground Mounted</option>
                            <option value="elevated">Elevated (≥ 2m)</option>
                        </select>
                    </div>

                    <div class="performer-field">
                        <label for="perf-time">Time of Day</label>
                        <select id="perf-time">
                            <option value="day">Day</option>
                            <option value="night">Night</option>
                            <option value="dawn">Dawn</option>
                            <option value="dusk">Dusk</option>
                        </select>
                    </div>

                    <div class="performer-field performer-checkbox">
                        <label>
                            <input type="checkbox" id="perf-seaside">
                            Near Seaside (≤ 1λ from shoreline)
                        </label>
                    </div>

                    <fieldset class="performer-group">
                        <legend>Loading Coil</legend>
                        <div class="performer-field performer-checkbox">
                            <label>
                                <input type="checkbox" id="perf-coil-enabled">
                                Enable Loading Coil
                            </label>
                        </div>
                        <div class="performer-field">
                            <label for="perf-coil-position">Coil Position</label>
                            <select id="perf-coil-position">
                                <option value="base">Base</option>
                                <option value="mid">Mid</option>
                                <option value="top">Top</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="performer-group">
                        <legend>Capacitance Hat</legend>
                        <div class="performer-field performer-checkbox">
                            <label>
                                <input type="checkbox" id="perf-cap-enabled">
                                Enable Capacitance Hat
                            </label>
                        </div>
                        <div class="performer-field">
                            <label for="perf-cap-size">Hat Size</label>
                            <select id="perf-cap-size">
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </fieldset>

                    <button id="perf-compute" class="performer-button">Compute Performer Vertical</button>
                </div>

                <!-- RESULTS COLUMN -->
                <div class="performer-column performer-results">
                    <h3>Results</h3>
                    <table class="performer-results-table">
                        <thead>
                            <tr><th>Metric</th><th>Value</th></tr>
                        </thead>
                        <tbody id="perf-results-body">
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
                    <div id="plot-elevation" class="performer-plot"></div>
                    <div id="plot-azimuth" class="performer-plot"></div>
                    <div id="plot-gain" class="performer-plot"></div>
                    <div id="plot-swr" class="performer-plot"></div>
                    <div id="plot-erp" class="performer-plot"></div>
                </div>
            </div>
        </section>
    `;

    const btn = document.querySelector("#perf-compute");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const frequencyMHz = parseFloat(document.querySelector("#perf-frequency").value) || 14.2;
        const heightMeters = parseFloat(document.querySelector("#perf-height").value) || 10;
        const radialCount = parseInt(document.querySelector("#perf-radials").value) || 32;
        const radialLength = parseFloat(document.querySelector("#perf-radial-length").value) || 10;
        const mountType = document.querySelector("#perf-mount").value;

        const timeOfDay = document.querySelector("#perf-time").value;
        const seaside = document.querySelector("#perf-seaside").checked;

        const coilEnabled = document.querySelector("#perf-coil-enabled").checked;
        const coilPosition = document.querySelector("#perf-coil-position").value;

        const capEnabled = document.querySelector("#perf-cap-enabled").checked;
        const capSize = document.querySelector("#perf-cap-size").value;

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

        const tbody = document.querySelector("#perf-results-body");
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
            elevationGain: [...Array(91).keys()].map(a => Math.sin(a * Math.PI / 180) * 5.5),

            azimuthAngles: [...Array(361).keys()],
            azimuthGain: [...Array(361).keys()].map(a => 3 + Math.cos(a * Math.PI / 180) * 2.2),

            freqSweep: [frequencyMHz - 0.2, frequencyMHz, frequencyMHz + 0.2],
            gainSweep: [3, 4, 3],
            swrSweep: [1.9, 1.3, 2.0],
            erpSweep: [110, 140, 115]
        };

        PlotEngine.renderAll(antennaData, boost);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#performer") {
        loadPerformerDesigner();
    }
});
