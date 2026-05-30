// /HF-Workbench/js/modules/loop.js
// Full Small Loop Designer with automatic plots (Elevation, Azimuth, Gain, SWR, ERP)

import { computeBoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadLoopDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="loop-wrapper">
            <h2>Small Transmitting Loop Designer</h2>

            <div class="loop-layout">
                <!-- INPUT COLUMN -->
                <div class="loop-column loop-inputs">
                    <h3>Inputs</h3>

                    <div class="loop-field">
                        <label for="loop-frequency">Frequency (MHz)</label>
                        <input type="number" id="loop-frequency" min="1" max="60" step="0.1" value="14.2">
                    </div>

                    <div class="loop-field">
                        <label for="loop-diameter">Loop Diameter (m)</label>
                        <input type="number" id="loop-diameter" min="0.2" max="5" step="0.01" value="1">
                    </div>

                    <div class="loop-field">
                        <label for="loop-height">Loop Height (m)</label>
                        <input type="number" id="loop-height" min="0.5" max="20" step="0.1" value="2">
                    </div>

                    <div class="loop-field">
                        <label for="loop-time">Time of Day</label>
                        <select id="loop-time">
                            <option value="day">Day</option>
                            <option value="night">Night</option>
                            <option value="dawn">Dawn</option>
                            <option value="dusk">Dusk</option>
                        </select>
                    </div>

                    <div class="loop-field loop-checkbox">
                        <label>
                            <input type="checkbox" id="loop-seaside">
                            Near Seaside (≤ 1λ from shoreline)
                        </label>
                    </div>

                    <fieldset class="loop-group">
                        <legend>Loading Coil</legend>
                        <div class="loop-field loop-checkbox">
                            <label>
                                <input type="checkbox" id="loop-coil-enabled">
                                Enable Loading Coil
                            </label>
                        </div>
                        <div class="loop-field">
                            <label for="loop-coil-position">Coil Position</label>
                            <select id="loop-coil-position">
                                <option value="base">Base</option>
                                <option value="mid">Mid</option>
                                <option value="top">Top</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="loop-group">
                        <legend>Capacitance Hat</legend>
                        <div class="loop-field loop-checkbox">
                            <label>
                                <input type="checkbox" id="loop-cap-enabled">
                                Enable Capacitance Hat
                            </label>
                        </div>
                        <div class="loop-field">
                            <label for="loop-cap-size">Hat Size</label>
                            <select id="loop-cap-size">
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </fieldset>

                    <button id="loop-compute" class="loop-button">Compute Loop Performance</button>
                </div>

                <!-- RESULTS COLUMN -->
                <div class="loop-column loop-results">
                    <h3>Results</h3>
                    <table class="loop-results-table">
                        <thead>
                            <tr><th>Metric</th><th>Value</th></tr>
                        </thead>
                        <tbody id="loop-results-body">
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
                    <div id="plot-elevation" class="loop-plot"></div>
                    <div id="plot-azimuth" class="loop-plot"></div>
                    <div id="plot-gain" class="loop-plot"></div>
                    <div id="plot-swr" class="loop-plot"></div>
                    <div id="plot-erp" class="loop-plot"></div>
                </div>
            </div>
        </section>
    `;

    const btn = document.querySelector("#loop-compute");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const frequencyMHz = parseFloat(document.querySelector("#loop-frequency").value) || 14.2;
        const diameter = parseFloat(document.querySelector("#loop-diameter").value) || 1;
        const heightMeters = parseFloat(document.querySelector("#loop-height").value) || 2;

        const timeOfDay = document.querySelector("#loop-time").value;
        const seaside = document.querySelector("#loop-seaside").checked;

        const coilEnabled = document.querySelector("#loop-coil-enabled").checked;
        const coilPosition = document.querySelector("#loop-coil-position").value;

        const capEnabled = document.querySelector("#loop-cap-enabled").checked;
        const capSize = document.querySelector("#loop-cap-size").value;

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

        const tbody = document.querySelector("#loop-results-body");
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
            elevationGain: [...Array(91).keys()].map(a => Math.sin(a * Math.PI / 180) * 4),

            azimuthAngles: [...Array(361).keys()],
            azimuthGain: [...Array(361).keys()].map(a => 1 + Math.cos(a * Math.PI / 180) * 1.2),

            freqSweep: [frequencyMHz - 0.2, frequencyMHz, frequencyMHz + 0.2],
            gainSweep: [1, 2, 1],
            swrSweep: [2.5, 1.6, 2.7],
            erpSweep: [40, 55, 42]
        };

        PlotEngine.renderAll(antennaData, boost);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#loop") {
        loadLoopDesigner();
    }
});
