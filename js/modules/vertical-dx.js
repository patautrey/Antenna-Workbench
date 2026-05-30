// /HF-Workbench/js/modules/vertical-dx.js
// Vertical DX Designer with BoostEngine + PlotEngine
// Focus: low takeoff angle, DX performance

import { BoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadVerticalDXDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="designer-wrapper">
            <h1>Vertical DX Designer</h1>

            <div class="designer-layout">
                <div class="designer-inputs">
                    <h2>DX Parameters</h2>

                    <label>
                        Frequency (MHz)
                        <input id="vdx-freq" type="number" value="14.1" step="0.1">
                    </label>

                    <label>
                        Vertical Height (m)
                        <input id="vdx-height" type="number" value="10" step="0.5">
                    </label>

                    <label>
                        Radial Count
                        <input id="vdx-radials" type="number" value="16" min="0" max="120">
                    </label>

                    <label>
                        Radial Length (m)
                        <input id="vdx-radial-length" type="number" value="0.25" step="0.25">
                    </label>

                    <label>
                        Ground Type
                        <select id="vdx-ground">
                            <option value="good">Good soil</option>
                            <option value="average" selected>Average soil</option>
                            <option value="poor">Poor soil</option>
                            <option value="saltwater">Saltwater (near sea)</option>
                        </select>
                    </label>

                    <button id="vdx-compute">Compute DX Vertical</button>
                </div>

                <div class="designer-plots">
                    <h2>Radiation Patterns</h2>
                    <canvas id="vdx-elev" width="400" height="400"></canvas>
                    <canvas id="vdx-az" width="400" height="400"></canvas>

                    <h2>Band Performance</h2>
                    <canvas id="vdx-swr" width="400" height="250"></canvas>
                    <canvas id="vdx-gain" width="400" height="250"></canvas>
                    <canvas id="vdx-erp" width="400" height="250"></canvas>

                    <div class="designer-metrics">
                        <h2>DX Metrics</h2>
                        <div id="vdx-metrics"></div>
                    </div>
                </div>
            </div>
        </section>
    `;

    const compute = async () => {
        const freq = parseFloat(document.getElementById("vdx-freq").value);
        const height = parseFloat(document.getElementById("vdx-height").value);
        const radials = parseInt(document.getElementById("vdx-radials").value);
        const radialLength = parseFloat(document.getElementById("vdx-radial-length").value);
        const ground = document.getElementById("vdx-ground").value;

        const geometry = {
            type: "vertical-dx",
            frequencyMHz: freq,
            heightMeters: height,
            radialCount: radials,
            radialLengthMeters: radialLength,
            groundModel: ground
        };

        const result = await BoostEngine.solve(geometry, {});

        PlotEngine.renderElevation("vdx-elev", result.elevation);
        PlotEngine.renderAzimuth("vdx-az", result.azimuth);
        PlotEngine.renderSWR("vdx-swr", result.swr);
        PlotEngine.renderGain("vdx-gain", result.gain);
        PlotEngine.renderERP("vdx-erp", result.erp);

        renderDXMetrics(result);
    };

    const renderDXMetrics = (result) => {
        const metricsDiv = document.getElementById("vdx-metrics");
        if (!metricsDiv) return;

        const takeoff = result.elevation?.takeoffAngleDeg ?? 18;
        const peakGain = result.elevation?.maxGainDb ?? 0;
        const azBw = result.azimuth?.beamwidthDeg ?? 360;

        metricsDiv.innerHTML = `
            <p><strong>Takeoff Angle:</strong> ${takeoff.toFixed(1)}°</p>
            <p><strong>Peak Gain (dBi):</strong> ${peakGain.toFixed(1)} dBi</p>
            <p><strong>Azimuth Beamwidth:</strong> ${azBw.toFixed(0)}°</p>
        `;
    };

    document.getElementById("vdx-compute").addEventListener("click", compute);

    // Auto-run once on load
    compute();
}
