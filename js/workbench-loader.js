// /HF-Workbench/js/workbench-loader.js
// Master loader + router for HF Workbench

// ------------------------------------------------------------
// ROUTER
// ------------------------------------------------------------
function loadRoute() {
    const hash = window.location.hash || "#home";

    switch (hash) {

        case "#doublet":
            import("./modules/doublet.js").then(mod => mod.loadDoubletDesigner());
            break;

        case "#loop":
            import("./modules/loop.js").then(mod => mod.loadLoopDesigner());
            break;

        case "#skyloop":
            import("./modules/skyloop.js").then(mod => mod.loadSkyloopDesigner());
            break;

        case "#verticals":
            import("./modules/verticals.js").then(mod => mod.loadVerticalsDesigner());
            break;

        // Home screen
        case "#home":
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
// MENU WIRING
// ------------------------------------------------------------
function wireMenus() {
    const helpBtn = document.getElementById("menu-help");
    const vertBtn = document.getElementById("menu-verticals");

    const helpMenu = document.getElementById("dropdown-help");
    const vertMenu = document.getElementById("dropdown-verticals");

    helpBtn.addEventListener("click", () => {
        helpMenu.classList.toggle("open");
        vertMenu.classList.remove("open");
    });

    vertBtn.addEventListener("click", () => {
        vertMenu.classList.toggle("open");
        helpMenu.classList.remove("open");
    });

    // Close menus when clicking outside
    document.addEventListener("click", e => {
        if (!helpBtn.contains(e.target) && !helpMenu.contains(e.target)) {
            helpMenu.classList.remove("open");
        }
        if (!vertBtn.contains(e.target) && !vertMenu.contains(e.target)) {
            vertMenu.classList.remove("open");
        }
    });
}

// ------------------------------------------------------------
// INITIALIZE
// ------------------------------------------------------------
window.addEventListener("hashchange", loadRoute);
window.addEventListener("DOMContentLoaded", () => {
    wireMenus();
    loadRoute();
});
