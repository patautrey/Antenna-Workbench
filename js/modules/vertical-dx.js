// /HF-Workbench/js/modules/vertical-dx.js
// Full Vertical DX Designer with automatic plots (Elevation, Azimuth, Gain, SWR, ERP)

import { computeBoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadVerticalDXDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="vdx-wrapper">
            <h2>Vertical DX Designer</h2>

            <div class="vdx-layout">
                <!-- INPUT COLUMN -->
                <div class="vdx-column vdx-inputs">
                    <h3>Inputs</h3>

                    <div class="vdx-field">
                        <label for="vdx-frequency">Frequency (MHz)</label>
                        <input type="number" id="vdx-frequency" min="1" max="60" step="0.1" value="7.1">
                    </div>

                    <div class="vdx-field">
                        <label for="vdx-height">Antenna Height (m)</label>
                        <input type="number" id="vdx-height" min="1" max="50" step="0.1" value="10">
                    </div>

                    <div class="vdx-field">
                        <label for="vdx-time">Time of Day</label>
                        <select id="vdx-time">
                            <option value="day">Day</option>
                            <option value="night">Night</option>
                            <option value="dawn">Dawn</option>
                            <option value="dusk">Dusk</option>
                        </select>
                    </div>

                    <div class="vdx-field vdx-checkbox">
                        <label>
                            <input type="checkbox" id="vdx-seaside">
                            Near Seaside (≤ 1λ from shoreline)
                        </label>
                    </div>

                    <fieldset class="vdx-group">
                        <legend>Loading Coil</legend>
                        <div class="vdx-field vdx-checkbox">
                            <label>
                                <input type="checkbox" id="vdx-coil-enabled">
                                Enable Loading Coil
                            </label>
                        </div>
                        <div class="vdx-field">
                            <label for="vdx-coil-position">Coil Position</label>
                            <select id="vdx-coil-position">
                                <option value="base">Base</option>
                                <option value="mid">Mid</option>
                                <option value="top">Top</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="vdx-group">
                        <legend>Capacitance Hat</legend>
                        <div class="vdx-field vdx-checkbox">
                            <label>
                                <input type="checkbox" id="vdx-cap-enabled">
                                Enable Capacitance Hat
                            </label>
                        </div>
                        <div class="vdx-field">
                            <label for="vdx-cap-size">Hat Size</label>
                            <select id="vdx-cap-size">
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="vdx-group">
                        <legend>Linear Loading</legend>
                        <div class="vdx-field vdx-checkbox">
                            <label>
                                <input type="checkbox" id="vdx-lin-enabled">
                                Enable Linear Loading
                            </label>
                        </div>
                        <div class="vdx-field">
                            <label for="vdx-lin-style">Style</label>
                            <select id="vdx-lin-style">
                                <option value="folded">Folded</option>
                                <option value="zigzag">Zig-zag</option>
                                <option value="ladder">Ladder</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset class="vdx-group">
                        <legend>Foldover</legend>
                        <div class="vdx-field vdx-checkbox">
                            <label>
                                <input type="checkbox" id="vdx-fold-enabled">
                                Enable Foldover
                            </label>
                        </div>
                        <div class="vdx-field">
                            <label for="vdx-fold-angle">Fold Angle (°)</label>
                            <input type="number" id="vdx-fold-angle" min="0" max="90" step="1" value="0">
                        </div>
                    </fieldset>

                    <fieldset class="vdx-group">
                        <legend>Array Geometry</legend>
                        <div class="vdx-field">
                            <label for="vdx-reflector-spacing">Reflector Spacing (m)</label>
                            <input type="number" id="vdx-reflector-spacing" min="0" max="50" step="0.1" value="0">
                        </div>
                        <div class="vdx-field">
                            <label for="vdx-director-spacing">Director Spacing (m)</label>
                            <input type="number" id="vdx-director-spacing" min="0" max="50" step="0.1" value="0">
                        </div>
                    </fieldset>

                    <button id="vdx-compute" class="vdx-button">Compute Vertical DX Performance</button>
                </div>

                <!-- RESULTS COLUMN -->
                <div class="vdx-column vdx-results">
                    <h3>Results</h3>
                    <table class="vdx-results-table">
                        <thead>
                            <tr><th>Metric</th><th>Value</th></tr>
                        </thead>
                        <tbody id="vdx-results-body">
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
                    <div id="plot-elevation" class="vdx-plot"></div>
                    <div id="plot-azimuth" class="vdx-plot"></div>
                    <div id="plot-gain" class="vdx-plot"></div>
                    <div id="plot-swr" class="vdx-plot"></div>
                    <div id="plot-erp" class="vdx-plot"></div>
                </div>
            </div>
        </section>
    `;

    const btn = document.querySelector("#vdx-compute");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const frequencyMHz = parseFloat(document.querySelector("#vdx-frequency").value) || 7.1;
        const heightMeters = parseFloat(document.querySelector("#vdx-height").value) || 10;

        const timeOfDay = document.querySelector("#vdx-time").value;
        const seaside = document.querySelector("#vdx-seaside").checked;

        const coilEnabled = document.querySelector("#vdx-coil-enabled").checked;
        const coilPosition = document.querySelector("#vdx-coil-position").value;

        const capEnabled = document.querySelector("#vdx-cap-enabled").checked;
        const capSize = document.querySelector("#vdx-cap-size").value;

        const linEnabled = document.querySelector("#vdx-lin-enabled").checked;
        const linStyle = document.querySelector("#vdx-lin-style").value;

        const foldEnabled = document.querySelector("#vdx-fold-enabled").checked;
        const foldAngle = foldEnabled
            ? parseFloat(document.querySelector("#vdx-fold-angle").value) || 0
            : 0;

        const reflectorSpacingMeters =
            parseFloat(document.querySelector("#vdx-reflector-spacing").value) || 0;
        const directorSpacingMeters =
            parseFloat(document.querySelector("#vdx-director-spacing").value) || 0;

        const boost = computeBoostEngine({
            frequencyMHz,
            heightMeters,
            reflectorSpacingMeters,
            directorSpacingMeters,
            foldoverAngleDeg: foldAngle,
            loadingCoil: { enabled: coilEnabled, position: coilPosition },
            capHat: { enabled: capEnabled, size: capSize },
            linearLoading: { enabled: linEnabled, style: linStyle },
            environment: { timeOfDay, seaside }
        });

        const tbody = document.querySelector("#vdx-results-body");
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
            elevationGain: [...Array(91).keys()].map(a => Math.sin(a * Math.PI / 180) * 5),

            azimuthAngles: [...Array(361).keys()],
            azimuthGain: [...Array(361).keys()].map(a => 3 + Math.cos(a * Math.PI / 180) * 2),

            freqSweep: [frequencyMHz - 0.2, frequencyMHz, frequencyMHz + 0.2],
            gainSweep: [2, 3, 2],
            swrSweep: [1.8, 1.2, 1.9],
            erpSweep: [80, 100, 85]
        };

        PlotEngine.renderAll(antennaData, boost);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#vertical-dx") {
        loadVerticalDXDesigner();
    }
});
