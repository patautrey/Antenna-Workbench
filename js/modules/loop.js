// /HF-Workbench/js/modules/loop.js
// Loop Designer module with ModelingEngine + PlotEngine

import { ModelingEngine } from "../modeling-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadLoopDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="designer-wrapper">
            <h1>Loop Designer</h1>

            <div class="designer-layout">
                <div class="designer-inputs">
                    <h2>Inputs</h2>

                    <label>
                        Frequency (MHz)
                        <input id="loop-freq" type="number" value="7.1" step="0.1">
                    </label>

                    <label>
                        Perimeter (m)
                        <input id="loop-perim" type="number" value="80" step="0.5">
                    </label>

                    <label>
                        Height (m)
                        <input id="loop-height" type="number" value="12" step="0.5">
                    </label>

                    <button id="loop-compute">Compute Loop</button>
                </div>

                <div class="designer-plots">
                    <h2>Radiation Patterns</h2>
                    <canvas id="loop-elev" width="400" height="400"></canvas>
                    <canvas id="loop-az" width="400" height="400"></canvas>

                    <h2>Band Performance</h2>
                    <canvas id="loop-swr" width="400" height="250"></canvas>
                    <canvas id="loop-gain" width="400" height="250"></canvas>
                    <canvas id="loop-erp" width="400" height="250"></canvas>
                </div>
            </div>
        </section>
    `;

    const btn = document.getElementById("loop-compute");

    btn.addEventListener("click", async () => {
        const freq = parseFloat(document.getElementById("loop-freq").value);
        const perim = parseFloat(document.getElementById("loop-perim").value);
        const height = parseFloat(document.getElementById("loop-height").value);

        const radius = perim / (2 * Math.PI);

        const geometry = {
            type: "loop",
            frequencyMHz: freq,
            perimeterMeters: perim,
            radiusMeters: radius,
            heightMeters: height
        };

        const result = await ModelingEngine.solve(geometry, {});

        PlotEngine.renderElevation("loop-elev", result.elevation);
        PlotEngine.renderAzimuth("loop-az", result.azimuth);
        PlotEngine.renderSWR("loop-swr", result.swr);
        PlotEngine.renderGain("loop-gain", result.gain);
        PlotEngine.renderERP("loop-erp", result.erp);
    });

    // Auto-run once on load
    btn.click();
}
