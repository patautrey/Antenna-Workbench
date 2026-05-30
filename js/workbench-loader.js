// /HF-Workbench/js/workbench-loader.js
// Loader + Router matching your current HTML structure

// ------------------------------------------------------------
// ROUTER
// ------------------------------------------------------------
function loadRoute() {
    const hash = window.location.hash || "#home";

    switch (hash) {

        case "#doublet":
            import("./modules/doublet.js").then(m => m.loadDoubletDesigner());
            break;

        case "#loop":
            import("./modules/loop.js").then(m => m.loadLoopDesigner());
            break;

        case "#skyloop":
            import("./modules/skyloop.js").then(m => m.loadSkyloopDesigner());
            break;

        case "#vertical-dx":
        case "#vertical-nvis":
        case "#performer":
        case "#dominator":
        case "#verticals":
            import("./modules/verticals.js").then(m => m.loadVerticalsDesigner());
            break;

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
// DROPDOWN WIRING (matches your HTML exactly)
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
