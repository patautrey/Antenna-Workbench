// /HF-Workbench/js/workbench-loader.js
// Master loader + router for HF Workbench
// Matches your current HTML and your actual module filenames

// ------------------------------------------------------------
// ROUTER
// ------------------------------------------------------------
function loadRoute() {
    const hash = window.location.hash || "#home";

    switch (hash) {

        // Core modules (match your actual filenames)
        case "#doublet":
            import("./modules/doublet-designer.js").then(m => m.loadDoubletDesigner());
            break;

        case "#loop":
            import("./modules/loop-designer.js").then(m => m.loadLoopDesigner());
            break;

        case "#skyloop":
            import("./modules/skyloop-designer.js").then(m => m.loadSkyloopDesigner());
            break;

        // Vertical family (match your actual filenames)
        case "#vertical-dx":
            import("./modules/vertical-dx.js").then(m => m.loadVerticalDXDesigner());
            break;

        case "#vertical-nvis":
            import("./modules/vertical-nvis-designer.js").then(m => m.loadVerticalNVISDesigner());
            break;

        case "#performer":
            import("./modules/performer.js").then(m => m.loadPerformerVertical());
            break;

        case "#dominator":
            import("./modules/dominator.js").then(m => m.loadDominatorArray());
            break;

        // Default home screen
        default:
            document.querySelector("#content").innerHTML = `
                <section class="home">
                    <h1>HF Workbench</h1>
                    <p>Select a tool from the menu.</p>
                </section>
            `;
            break;
    }
}

// ------------------------------------------------------------
// DROPDOWN WIRING — matches your HTML exactly
// ------------------------------------------------------------
function wireDropdowns() {
    const dropdownButtons = document.querySelectorAll(".dropdown-btn");

    dropdownButtons.forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();

            const content = btn.nextElementSibling;

            // Close all other dropdowns
            document.querySelectorAll(".dropdown-content").forEach(dc => {
                if (dc !== content) dc.classList.remove("open");
            });

            // Toggle this one
            content.classList.toggle("open");
        });
    });

    // Close dropdowns when clicking outside
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
