// /HF-Workbench/js/modules/verticals.js
// Verticals Designer module with ModelingEngine + PlotEngine

import { ModelingEngine } from "../modeling-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadVerticalsDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="designer-wrapper">
            <h1>Verticals Designer</h1>

            <div class="designer-layout">
                <div class="designer-inputs">
                    <h2>Inputs</h2>

                    <label>
                        Frequency (MHz)
                        <input id="vert-freq" type="number" value="7.1" step="0.1">
                    </label>

                    <label>
                        Height (m)
                        <input id="vert-height" type="number" value="10" step="0.5">
                    </label>

                    <label>
                        Number of Elements
                        <input id="vert-elements" type="number" value="1" min="1" max="8">
                    </label>

                    <label>
                        Spacing (m)
                        <input id="vert-spacing" type="number" value="5" step="0.5">
                    </label>

                    <button id="vert-compute">Compute Vertical</button>
                </div>

                <div class="designer-plots">
                    <h2>Radiation Patterns</h2>
                    <canvas id="vert-elev" width="400" height="400"></canvas>
                    <canvas id="vert-az" width="400" height="400"></canvas>

                    <h2>Band Performance</h2>
                    <canvas id="vert-swr" width="400" height="250"></canvas>
                    <canvas id="vert-gain" width="400" height="250"></canvas>
                    <canvas id="vert-erp" width="400" height="250"></canvas>
                </div>
            </div>
        </section>
    `;

    const btn = document.getElementById("vert-compute");

    btn.addEventListener("click", async () => {
        const freq = parseFloat(document.getElementById("vert-freq").value);
        const height = parseFloat(document.getElementById("vert-height").value);
        const elements = parseInt(document.getElementById("vert-elements").value);
        const spacing = parseFloat(document.getElementById("vert-spacing").value);

        const geometry = {
            type: "vertical",
            frequencyMHz: freq,
            heightMeters: height,
            elements: elements,
            spacingMeters: spacing
        };

        const result = await ModelingEngine.solve(geometry, {});

        PlotEngine.renderElevation("vert-elev", result.elevation);
        PlotEngine.renderAzimuth("vert-az", result.azimuth);
        PlotEngine.renderSWR("vert-swr", result.swr);
        PlotEngine.renderGain("vert-gain", result.gain);
        PlotEngine.renderERP("vert-erp", result.erp);
    });

    // Auto-run once on load
    btn.click();
}
