// /HF-Workbench/js/modules/skyloop.js
// Skyloop Designer with BoostEngine + PlotEngine

import { BoostEngine } from "../boost-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadSkyloopDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="designer-wrapper">
            <h1>Skyloop Designer</h1>

            <div class="designer-layout">
                <div class="designer-inputs">
                    <h2>Inputs</h2>

                    <label>
                        Frequency (MHz)
                        <input id="sky-freq" type="number" value="3.9" step="0.05">
                    </label>

                    <label>
                        Perimeter (m)
                        <input id="sky-perim" type="number" value="260" step="1">
                    </label>

                    <label>
                        Height (m)
                        <input id="sky-height" type="number" value="12" step="0.5">
                    </label>

                    <button id="sky-compute">Compute Skyloop</button>
                </div>

                <div class="designer-plots">
                    <h2>Radiation Patterns</h2>
                    <canvas id="sky-elev" width="400" height="400"></canvas>
                    <canvas id="sky-az" width="400" height="400"></canvas>

                    <h2>Band Performance</h2>
                    <canvas id="sky-swr" width="400" height="250"></canvas>
                    <canvas id="sky-gain" width="400" height="250"></canvas>
                    <canvas id="sky-erp" width="400" height="250"></canvas>
                </div>
            </div>
        </section>
    `;

    const compute = async () => {
        const freq = parseFloat(document.getElementById("sky-freq").value);
        const perim = parseFloat(document.getElementById("sky-perim").value);
        const height = parseFloat(document.getElementById("sky-height").value);

        const radius = perim / (2 * Math.PI);

        const geometry = {
            type: "skyloop",
            frequencyMHz: freq,
            perimeterMeters: perim,
            radiusMeters: radius,
            heightMeters: height
        };

        const result = await BoostEngine.solve(geometry, {});

        PlotEngine.renderElevation("sky-elev", result.elevation);
        PlotEngine.renderAzimuth("sky-az", result.azimuth);
        PlotEngine.renderSWR("sky-swr", result.swr);
        PlotEngine.renderGain("sky-gain", result.gain);
        PlotEngine.renderERP("sky-erp", result.erp);
    };

    document.getElementById("sky-compute").addEventListener("click", compute);

    // Auto-run once on load
    compute();
}
