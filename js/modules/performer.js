// /HF-Workbench/js/modules/performer.js
// Performer Vertical — high-efficiency single-element vertical
// BoostEngine + PlotEngine

import { BoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadPerformerVertical() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="designer-wrapper">
            <h1>Performer Vertical</h1>

            <div class="designer-layout">
                <div class="designer-inputs">
                    <h2>Performer Parameters</h2>

                    <label>
                        Frequency (MHz)
                        <input id="perf-freq" type="number" value="14.1" step="0.1">
                    </label>

                    <label>
                        Height (m)
                        <input id="perf-height" type="number" value="12" step="0.25">
                    </label>

                    <label>
                        Base Loading (µH)
                        <input id="perf-load" type="number" value="0" step="0.1">
                    </label>

                    <label>
                        Radials
                        <input id="perf-radials" type="number" value="32" min="0" max="120">
                    </label>

                    <label>
                        Ground Type
                        <select id="perf-ground">
                            <option value="good">Good soil</option>
                            <option value="average" selected>Average soil</option>
                            <option value="poor">Poor soil</option>
                            <option value="saltwater">Saltwater</option>
                        </select>
                    </label>

                    <button id="perf-compute">Compute Performer</button>
                </div>

                <div class="designer-plots">
                    <h2>Radiation Patterns</h2>
                    <canvas id="perf-elev" width="400" height="400"></canvas>
                    <canvas id="perf-az" width="400" height="400"></canvas>

                    <h2>Band Performance</h2>
                    <canvas id="perf-swr" width="400" height="250"></canvas>
                    <canvas id="perf-gain" width="400" height="250"></canvas>
                    <canvas id="perf-erp" width="400" height="250"></canvas>

                    <div class="designer-metrics">
                        <h2>Efficiency Metrics</h2>
                        <div id="perf-metrics"></div>
                    </div>
                </div>
            </div>
        </section>
    `;

    const compute = async () => {
        const freq = parseFloat(document.getElementById("perf-freq").value);
        const height = parseFloat(document.getElementById("perf-height").value);
        const load = parseFloat(document.getElementById("perf-load").value);
        const radials = parseInt(document.getElementById("perf-radials").value);
        const ground = document.getElementById("perf-ground").value;

        const geometry = {
            type: "performer-vertical",
            frequencyMHz: freq,
            heightMeters: height,
            baseLoadingMicroH: load,
            radialCount: radials,
            groundModel: ground
        };

        const result = await BoostEngine.solve(geometry, {});

        PlotEngine.renderElevation("perf-elev", result.elevation);
        PlotEngine.renderAzimuth("perf-az", result.azimuth);
        PlotEngine.renderSWR("perf-swr", result.swr);
        PlotEngine.renderGain("perf-gain", result.gain);
        PlotEngine.renderERP("perf-erp", result.erp);

        renderMetrics(result);
    };

    const renderMetrics = (result) => {
        const div = document.getElementById("perf-metrics");
        if (!div) return;

        const eff = result.efficiency ?? 0.0;
        const takeoff = result.elevation?.takeoffAngleDeg ?? 20;

        div.innerHTML = `
            <p><strong>Radiation Efficiency:</strong> ${(eff * 100).toFixed(1)}%</p>
            <p><strong>Takeoff Angle:</strong> ${takeoff.toFixed(1)}°</p>
        `;
    };

    document.getElementById("perf-compute").addEventListener("click", compute);
    compute();
}
