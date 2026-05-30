// ------------------------------------------------------------
// HF Workbench — Full Loader (No Patching Version)
// ------------------------------------------------------------

function loadRoute() {
    const hash = window.location.hash || "#home";
    const root = document.querySelector("#content");

    switch (hash) {

        // ------------------------------------------------------------
        // DOUBLEt DESIGNER — FULL UI + MODULE INIT
        // ------------------------------------------------------------
        case "#doublet": {
            root.innerHTML = `
                <section class="tool">
                    <h2>Doublet Designer</h2>

                    <label>Frequency (MHz)
                        <input id="dbl-freq" type="number" step="0.01">
                    </label>

                    <label>Height (m)
                        <input id="dbl-height" type="number" step="0.01">
                    </label>

                    <label>Total Length (m)
                        <input id="dbl-length" type="number" step="0.01">
                    </label>

                    <label>NVIS Reflector?
                        <select id="dbl-refl-enabled">
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                        </select>
                    </label>

                    <div class="refl-block">
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

        // ------------------------------------------------------------
        // HOME SCREEN
        // ------------------------------------------------------------
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

// ------------------------------------------------------------
// DROPDOWN WIRING
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// INITIALIZE
// ------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
    wireDropdowns();
    loadRoute();
});

window.addEventListener("hashchange", loadRoute);
