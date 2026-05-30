// HF Workbench — Loader

function loadRoute() {
    const hash = window.location.hash || "#home";
    const root = document.querySelector("#content");

    switch (hash) {

        case "#doublet": {
            root.innerHTML = `
                <section class="tool">
                    <h2>Doublet Designer</h2>

                    <div class="field-grid">
                        <label>Frequency (MHz)
                            <input id="dbl-freq" type="number" step="0.01">
                        </label>

                        <label>Height (m)
                            <input id="dbl-height" type="number" step="0.01">
                        </label>

                        <label>Total Length (m)
                            <input id="dbl-length" type="number" step="0.01">
                        </label>
                    </div>

                    <h3>NVIS Reflector (Optional)</h3>

                    <label>NVIS Reflector?
                        <select id="dbl-refl-enabled">
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                        </select>
                    </label>

                    <div class="field-grid">
                        <label>Reflector Wires
                            <input id="dbl-refl-num" type="number">
                        </label>

                        <label>Spacing (m)
                            <input id="dbl-refl-spacing" type="number" step="0.01">
                        </label>

                        <label>Offset (m)
                            <input id="dbl-refl-offset" type="number" step="0.01">
                        </label>

                        <label>Reflector Height (m)
                            <input id="dbl-refl-height" type="number" step="0.01">
                        </label>
                    </div>

                    <button id="dbl-compute">Compute Doublet</button>

                    <div id="dbl-summary" class="summary"></div>
                </section>
            `;

            import("./modules/doublet-designer.js").then(m => m.default(root));
            break;
        }

        case "#loop": {
            root.innerHTML = `
                <section class="tool">
                    <h2>Horizontal Loop Designer</h2>

                    <div class="field-grid">
                        <label>Frequency (MHz)
                            <input id="loop-freq" type="number" step="0.01">
                        </label>

                        <label>Height (m)
                            <input id="loop-height" type="number" step="0.01">
                        </label>

                        <label>Perimeter (m)
                            <input id="loop-perimeter" type="number" step="0.01">
                        </label>
                    </div>

                    <h3>NVIS Reflector (Optional)</h3>

                    <label>NVIS Reflector?
                        <select id="loop-refl-enabled">
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                        </select>
                    </label>

                    <div class="field-grid">
                        <label>Reflector Wires
                            <input id="loop-refl-num" type="number">
                        </label>

                        <label>Spacing (m)
                            <input id="loop-refl-spacing" type="number" step="0.01">
                        </label>

                        <label>Offset (m)
                            <input id="loop-refl-offset" type="number" step="0.01">
                        </label>

                        <label>Reflector Height (m)
                            <input id="loop-refl-height" type="number" step="0.01">
                        </label>
                    </div>

                    <button id="loop-compute">Compute Loop</button>

                    <div id="loop-summary" class="summary"></div>
                </section>
            `;

            import("./modules/loop-designer.js").then(m => m.default(root));
            break;
        }

        case "#skyloop": {
            root.innerHTML = `
                <section class="tool">
                    <h2>Skyloop Designer</h2>

                    <div class="field-grid">
                        <label>Frequency (MHz)
                            <input id="loop-freq" type="number" step="0.01">
                        </label>

                        <label>Height (m)
                            <input id="loop-height" type="number" step="0.01">
                        </label>

                        <label>Perimeter (m)
                            <input id="loop-perimeter" type="number" step="0.01">
                        </label>
                    </div>

                    <h3>NVIS Reflector (Optional)</h3>

                    <label>NVIS Reflector?
                        <select id="loop-refl-enabled">
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                        </select>
                    </label>

                    <div class="field-grid">
                        <label>Reflector Wires
                            <input id="loop-refl-num" type="number">
                        </label>

                        <label>Spacing (m)
                            <input id="loop-refl-spacing" type="number" step="0.01">
                        </label>

                        <label>Offset (m)
                            <input id="loop-refl-offset" type="number" step="0.01">
                        </label>

                        <label>Reflector Height (m)
                            <input id="loop-refl-height" type="number" step="0.01">
                        </label>
                    </div>

                    <button id="loop-compute">Compute Skyloop</button>

                    <div id="loop-summary" class="summary"></div>
                </section>
            `;

            import("./modules/loop-designer.js").then(m => m.default(root));
            break;
        }

        case "#vertical-dx": {
            root.innerHTML = `
                <section class="tool">
                    <h2>Vertical DX Designer</h2>

                    <div class="field-grid">
                        <label>Frequency (MHz)
                            <input id="vdx-freq" type="number" step="0.01">
                        </label>

                        <label>Height (m)
                            <input id="vdx-height" type="number" step="0.01">
                        </label>

                        <label>Radial Count
                            <input id="vdx-radials" type="number">
                        </label>

                        <label>Radial Length (m)
                            <input id="vdx-radial-length" type="number" step="0.01">
                        </label>
                    </div>

                    <label>Ground Type
                        <select id="vdx-ground">
                            <option value="good">Good Soil</option>
                            <option value="average">Average Soil</option>
                            <option value="poor">Poor Soil</option>
                        </select>
                    </label>

                    <button id="vdx-compute">Compute Vertical DX</button>

                    <div id="vdx-summary" class="summary"></div>
                </section>
            `;

            import("./modules/vertical-dx-designer.js").then(m => m.default(root));
            break;
        }

        case "#vertical-nvis": {
            root.innerHTML = `
                <section class="tool">
                    <h2>Vertical NVIS Designer</h2>

                    <div class="field-grid">
                        <label>Frequency (MHz)
                            <input id="vnvis-freq" type="number" step="0.01">
                        </label>

                        <label>Height (m)
                            <input id="vnvis-height" type="number" step="0.01">
                        </label>

                        <label>Top Hat Length (m)
                            <input id="vnvis-top-hat" type="number" step="0.01">
                        </label>

                        <label>Ground Loss (Ω)
                            <input id="vnvis-ground-loss" type="number" step="0.1">
                        </label>
                    </div>

                    <div class="field-grid">
                        <label>Radial Count
                            <input id="vnvis-radials" type="number">
                        </label>

                        <label>Radial Length (m)
                            <input id="vnvis-radial-length" type="number" step="0.01">
                        </label>
                    </div>

                    <button id="vnvis-compute">Compute Vertical NVIS</button>

                    <div id="vnvis-summary" class="summary"></div>
                </section>
            `;

            import("./modules/vertical-nvis-designer.js").then(m => m.default(root));
            break;
        }

        case "#performer": {
            root.innerHTML = `
                <section class="tool">
                    <h2>Performer Vertical</h2>

                    <div class="field-grid">
                        <label>Frequency (MHz)
                            <input id="perf-freq" type="number" step="0.01">
                        </label>

                        <label>Height (m)
                            <input id="perf-height" type="number" step="0.01">
                        </label>

                        <label>Radial Count
                            <input id="perf-radials" type="number">
                        </label>

                        <label>Radial Length (m)
                            <input id="perf-radial-length" type="number" step="0.01">
                        </label>
                    </div>

                    <button id="perf-compute">Compute Performer</button>

                    <div id="perf-summary" class="summary"></div>
                </section>
            `;

            import("./modules/performer.js").then(m => m.default(root));
            break;
        }

        case "#dominator": {
            import("./modules/dominator.js").then(m => m.loadDominatorArray());
            break;
        }

        default: {
            root.innerHTML = `
                <section class="home">
                    <h1>HF Workbench</h1>
                    <p>Select a tool from the menu.</p>
                </section>
            `;
            break;
        }
    }
}

function wireDropdowns() {
    const dropdownButtons = document.querySelectorAll(".dropdown-btn");

    dropdownButtons.forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const content = btn.nextElementSibling;

            document.querySelectorAll(".dropdown-content").forEach(dc => {
                if (dc !== content) dc.classList.remove("open");
            });

            content.classList.toggle("open");
        });
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-content").forEach(dc => dc.classList.remove("open"));
    });
}

window.addEventListener("DOMContentLoaded", () => {
    wireDropdowns();
    loadRoute();
});

window.addEventListener("hashchange", loadRoute);
