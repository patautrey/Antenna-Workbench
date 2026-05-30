// /HF-Workbench/js/modules/doublet.js
// Doublet Designer module with ModelingEngine + PlotEngine

import { ModelingEngine } from "../modeling-engine.js";
import { PlotEngine } from "../plot-engine.js";

export function loadDoubletDesigner() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="designer-wrapper">
            <h1>Doublet Designer</h1>

            <div class="designer-layout">
                <div class="designer-inputs">
                    <h2>Inputs</h2>
                    <label>
                        Frequency (MHz)
                        <input id="dbl-freq" type="number" value="7.1" step="0.1">
                    </label>
                    <label>
                        Total Length (m)
                        <input id="dbl-length" type="number" value="40" step="0.5">
                    </label>
                    <label>
                        Height (m)
                        <input id="dbl-height" type="number" value="12" step="0.5">
                    </label>
                    <button id="dbl-compute">Compute Doublet</button>
                </div>

                <div class="designer-plots">
                    <h2>Radiation Patterns</h2>
                    <canvas id="dbl-elev" width="400" height="400"></canvas>
                    <canvas id="dbl-az" width="400" height="400"></canvas>

                    <h2>Band Performance</h2>
                    <canvas id="dbl-swr" width="400" height="250"></canvas>
                    <canvas id="dbl-gain" width="400" height="250"></canvas>
                    <canvas id="dbl-erp" width="400" height="250"></canvas>
                </div>
            </div>
        </section>
    `;

    const btn = document.getElementById("dbl-compute");
    btn.addEventListener("click", async () => {
        const freq = parseFloat(document.getElementById("dbl-freq").value);
        const length = parseFloat(document.getElementById("dbl-length").value);
        const height = parseFloat(document.getElementById("dbl-height").value);

        const geometry = {
            type: "dipole",
            frequencyMHz: freq,
            totalLengthMeters: length,
            heightMeters: height
        };

        const result = await ModelingEngine.solve(geometry, {});

        PlotEngine.renderElevation("dbl-elev", result.elevation);
        PlotEngine.renderAzimuth("dbl-az", result.azimuth);
        PlotEngine.renderSWR("dbl-swr", result.swr);
        PlotEngine.renderGain("dbl-gain", result.gain);
        PlotEngine.renderERP("dbl-erp", result.erp);
    });

    // Auto-compute once on load
    btn.click();
}
