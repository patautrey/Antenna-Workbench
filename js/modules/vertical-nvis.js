// /HF-Workbench/js/modules/vertical-nvis.js
// Full Vertical NVIS Designer with automatic plots (Elevation, Azimuth, Gain, SWR, ERP)

import { computeBoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadVerticalNVISDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="vnvis-wrapper">
            <h2>Vertical NVIS Designer</h2>

            <div class="vnvis-layout">
                <!-- INPUT COLUMN -->
                <div class="vnvis-column vnvis-inputs">
                    <h3>Inputs</h3>

                    <div class="vnvis-field">
                        <label for="vnvis-frequency">Frequency (MHz)</label>
                        <input type="number" id="vnvis-frequency" min="1" max="60" step="0.1" value="5.3">
                    </div>

                    <div class="vnvis-field">
                        <label for="vnvis-height">Antenna Height (m)</label>
                        <input type="number" id="vnvis-height" min="0.5" max="20" step="0.1" value="2.5">
                    </div>

                    <div class="vnvis-field">
                        <label for="vnvis-time">Time of Day</label>
                        <select id="vnvis-time">
                            <option value="day">Day</option>
                            <option value="night">Night</option>
                            <option value="dawn">Dawn</option>
                            <option value="dusk">Dusk</option>
                        </select>
                    </div>

                    <div class="vnvis-field vnvis-checkbox">
                        <label>
                            <input type="checkbox" id="vnvis-seaside">
                            Near Seaside (≤ 1λ from shoreline)
                        </label>
                    </div>

                    <fieldset class="vnvis-group">
                        <legend>Loading Coil</legend>
                        <div class="vnvis-field vnvis-checkbox">
                            <label>
                                <input type="checkbox" id="vnvis-coil-enabled">
                                Enable Loading Coil
                            </label>
                        </div>
                        <div class="vnvis-field">
                            <label for="vnvis-coil-position">Coil Position</label>
                            <select id="vnvis-coil-position">
                                <option value="base">Base</option>
                                <option value="mid">Mid</option>
                                <option value="top">Top</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="vnvis-group">
                        <legend>Capacitance Hat</legend>
                        <div class="vnvis-field vnvis-checkbox">
                            <label>
                                <input type="checkbox" id="vnvis-cap-enabled">
                                Enable Capacitance Hat
                            </label>
                        </div>
                        <div class="vnvis-field">
                            <label for="vnvis-cap-size">Hat Size</label>
                            <select id="vnvis-cap-size">
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="vnvis-group">
                        <legend>Linear Loading</legend>
                        <div class="vnvis-field vnvis-checkbox">
                            <label>
                                <input type="checkbox" id="vnvis-lin-enabled">
                                Enable Linear Loading
                            </label>
                        </div>
                        <div class="vnvis-field">
                            <label for="vnvis-lin-style">Style</label>
                            <select id="vnvis-lin-style">
                                <option value="folded">Folded</option>
                                <option value="zigzag">Zig-zag</option>
                                <option value="ladder">Ladder</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="vnvis-group">
                        <legend>Foldover</legend>
                        <div class="vnvis-field vnvis-checkbox">
                            <label>
                                <input type="checkbox" id="vnvis-fold-enabled">
                                Enable Foldover
                            </label>
                        </div>
                        <div class="vnvis-field">
                            <label for="vnvis-fold-angle">Fold Angle (°)</label>
                            <input type="number" id="vnvis-fold-angle" min="0" max="90" step="1" value="0">
                        </div>
                    </fieldset>

                    <button id="vnvis-compute" class="vnvis-button">Compute Vertical NVIS Performance</button>
                </div>

                <!-- RESULTS COLUMN -->
                <div class="vnvis-column vnvis-results">
                    <h3>Results</h3>
                    <table class="vnvis-results-table">
                        <thead>
                            <tr><th>Metric</th><th>Value</th></tr>
                        </thead>
                        <tbody id="vnvis-results-body">
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
                    <div id="plot-elevation" class="vnvis-plot"></div>
                    <div id="plot-azimuth" class="vnvis-plot"></div>
                    <div id="plot-gain" class="vnvis-plot"></div>
                    <div id="plot-swr" class="vnvis-plot"></div>
                    <div id="plot-erp" class="vnvis-plot"></div>
                </div>
            </div>
        </section>
    `;

    const btn = document.querySelector("#vnvis-compute");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const frequencyMHz = parseFloat(document.querySelector("#vnvis-frequency").value) || 5.3;
        const heightMeters = parseFloat(document.querySelector("#vnvis-height").value) || 2.5;

        const timeOfDay = document.querySelector("#vnvis-time").value;
        const seaside = document.querySelector("#vnvis-seaside").checked;

        const coilEnabled = document.querySelector("#vnvis-coil-enabled").checked;
        const coilPosition = document.querySelector("#vnvis-coil-position").value;

        const capEnabled = document.querySelector("#vnvis-cap-enabled").checked;
        const capSize = document.querySelector("#vnvis-cap-size").value;

        const linEnabled = document.querySelector("#vnvis-lin-enabled").checked;
        const linStyle = document.querySelector("#vnvis-lin-style").value;

        const foldEnabled = document.querySelector("#vnvis-fold-enabled").checked;
        const foldAngle = foldEnabled
            ? parseFloat(document.querySelector("#vnvis-fold-angle").value) || 0
            : 0;

        const boost = computeBoostEngine({
            frequencyMHz,
            heightMeters,
            reflectorSpacingMeters: 0,
            directorSpacingMeters: 0,
            foldoverAngleDeg: foldAngle,
            loadingCoil: { enabled: coilEnabled, position: coilPosition },
            capHat: { enabled: capEnabled, size: capSize },
            linearLoading: { enabled: linEnabled, style: linStyle },
            environment: { timeOfDay, seaside }
        });

        const tbody = document.querySelector("#vnvis-results-body");
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
            elevationGain: [...Array(91).keys()].map(a => Math.sin(a * Math.PI / 180) * 8),

            azimuthAngles: [...Array(361).keys()],
            azimuthGain: [...Array(361).keys()].map(a => 2 + Math.cos(a * Math.PI / 180) * 1.5),

            freqSweep: [frequencyMHz - 0.2, frequencyMHz, frequencyMHz + 0.2],
            gainSweep: [1, 2, 1],
            swrSweep: [2.0, 1.3, 2.1],
            erpSweep: [60, 75, 62]
        };

        PlotEngine.renderAll(antennaData, boost);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#vertical-nvis") {
        loadVerticalNVISDesigner();
    }
});
