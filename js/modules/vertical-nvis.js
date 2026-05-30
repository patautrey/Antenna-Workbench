// /HF-Workbench/js/modules/vertical-nvis.js
// Vertical NVIS Designer with BoostEngine + PlotEngine
// Focus: high takeoff angle, regional coverage, emergency comms

import { BoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadVerticalNVISDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="designer-wrapper">
            <h1>Vertical NVIS Designer</h1>

            <div class="designer-layout">
                <div class="designer-inputs">
                    <h2>NVIS Parameters</h2>

                    <label>
                        Frequency (MHz)
                        <input id="vnvis-freq" type="number" value="5.3" step="0.05">
                    </label>

                    <label>
                        Vertical Height (m)
                        <input id="vnvis-height" type="number" value="3" step="0.25">
                    </label>

                    <label>
                        Top Loading (m)
                        <input id="vnvis-topload" type="number" value="2" step="0.25">
                    </label>

                    <label>
                        Ground Type
                        <select id="vnvis-ground">
                            <option value="good">Good soil</option>
                            <option value="average" selected>Average soil</option>
                            <option value="poor">Poor soil</option>
                            <option value="saltwater">Saltwater</option>
                        </select>
                    </label>

                    <button id="vnvis-compute">Compute NVIS Vertical</button>
                </div>

                <div class="designer-plots">
                    <h2>Radiation Patterns</h2>
                    <canvas id="vnvis-elev" width="400" height="400"></canvas>
                    <canvas id="vnvis-az" width="400" height="400"></canvas>

                    <h2>Band Performance</h2>
                    <canvas id="vnvis-swr" width="400" height="250"></canvas>
                    <canvas id="vnvis-gain" width="400" height="250"></canvas>
                    <canvas id="vnvis-erp" width="400" height="250"></canvas>

                    <div class="designer-metrics">
                        <h2>NVIS Metrics</h2>
                        <div id="vnvis-metrics"></div>
                    </div>
                </div>
            </div>
        </section>
    `;

    const compute = async () => {
        const freq = parseFloat(document.getElementById("vnvis-freq").value);
        const height = parseFloat(document.getElementById("vnvis-height").value);
        const topload = parseFloat(document.getElementById("vnvis-topload").value);
        const ground = document.getElementById("vnvis-ground").value;

        const geometry = {
            type: "vertical-nvis",
            frequencyMHz: freq,
            heightMeters: height,
            topLoadMeters: topload,
            groundModel: ground
        };

        const result = await BoostEngine.solve(geometry, {});

        PlotEngine.renderElevation("vnvis-elev", result.elevation);
        PlotEngine.renderAzimuth("vnvis-az", result.azimuth);
        PlotEngine.renderSWR("vnvis-swr", result.swr);
        PlotEngine.renderGain("vnvis-gain", result.gain);
        PlotEngine.renderERP("vnvis-erp", result.erp);

        renderNVISMetrics(result);
    };

    const renderNVISMetrics = (result) => {
        const metricsDiv = document.getElementById("vnvis-metrics");
        if (!metricsDiv) return;

        const takeoff = result.elevation?.takeoffAngleDeg ?? 75;
        const peakGain = result.elevation?.maxGainDb ?? 0;
        const coverage = 0.5 * (90 - takeoff); // simple NVIS footprint estimate

        metricsDiv.innerHTML = `
            <p><strong>Takeoff Angle:</strong> ${takeoff.toFixed(1)}°</p>
            <p><strong>Peak Gain (dBi):</strong> ${peakGain.toFixed(1)} dBi</p>
            <p><strong>Estimated NVIS Radius:</strong> ${coverage.toFixed(0)} miles</p>
        `;
    };

    document.getElementById("vnvis-compute").addEventListener("click", compute);

    compute();
}
