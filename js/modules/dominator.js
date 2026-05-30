// /HF-Workbench/js/modules/dominator.js
// Dominator Array — multi-element phased vertical array
// BoostEngine + PlotEngine

import { BoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadDominatorArray() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="designer-wrapper">
            <h1>Dominator Array</h1>

            <div class="designer-layout">
                <div class="designer-inputs">
                    <h2>Array Parameters</h2>

                    <label>
                        Frequency (MHz)
                        <input id="dom-freq" type="number" value="14.1" step="0.1">
                    </label>

                    <label>
                        Elements
                        <input id="dom-elements" type="number" value="2" min="2" max="8">
                    </label>

                    <label>
                        Spacing (m)
                        <input id="dom-spacing" type="number" value="10" step="0.5">
                    </label>

                    <label>
                        Phase Shift (°)
                        <input id="dom-phase" type="number" value="90" step="5">
                    </label>

                    <label>
                        Height (m)
                        <input id="dom-height" type="number" value="10" step="0.25">
                    </label>

                    <button id="dom-compute">Compute Dominator</button>
                </div>

                <div class="designer-plots">
                    <h2>Radiation Patterns</h2>
                    <canvas id="dom-elev" width="400" height="400"></canvas>
                    <canvas id="dom-az" width="400" height="400"></canvas>

                    <h2>Band Performance</h2>
                    <canvas id="dom-swr" width="400" height="250"></canvas>
                    <canvas id="dom-gain" width="400" height="250"></canvas>
                    <canvas id="dom-erp" width="400" height="250"></canvas>

                    <div class="designer-metrics">
                        <h2>Array Metrics</h2>
                        <div id="dom-metrics"></div>
                    </div>
                </div>
            </div>
        </section>
    `;

    const compute = async () => {
        const freq = parseFloat(document.getElementById("dom-freq").value);
        const elements = parseInt(document.getElementById("dom-elements").value);
        const spacing = parseFloat(document.getElementById("dom-spacing").value);
        const phase = parseFloat(document.getElementById("dom-phase").value);
        const height = parseFloat(document.getElementById("dom-height").value);

        const geometry = {
            type: "dominator-array",
            frequencyMHz: freq,
            elements: elements,
            spacingMeters: spacing,
            phaseShiftDeg: phase,
            heightMeters: height
        };

        const result = await BoostEngine.solve(geometry, {});

        PlotEngine.renderElevation("dom-elev", result.elevation);
        PlotEngine.renderAzimuth("dom-az", result.azimuth);
        PlotEngine.renderSWR("dom-swr", result.swr);
        PlotEngine.renderGain("dom-gain", result.gain);
        PlotEngine.renderERP("dom-erp", result.erp);

        renderMetrics(result);
    };

    const renderMetrics = (result) => {
        const div = document.getElementById("dom-metrics");
        if (!div) return;

        const fwdGain = result.azimuth?.maxGainDb ?? 0;
        const fwdDir = result.azimuth?.maxGainDirectionDeg ?? 0;
        const bw = result.azimuth?.beamwidthDeg ?? 360;

        div.innerHTML = `
            <p><strong>Forward Gain:</strong> ${fwdGain.toFixed(1)} dBi</p>
            <p><strong>Forward Direction:</strong> ${fwdDir.toFixed(0)}°</p>
            <p><strong>Beamwidth:</strong> ${bw.toFixed(0)}°</p>
        `;
    };

    document.getElementById("dom-compute").addEventListener("click", compute);
    compute();
}
