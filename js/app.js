/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Core Application Controller
   ============================================================ */

console.log("KG5IEF Antenna‑Workbench: app.js loaded");

/* ------------------------------------------------------------
   DOM references
   ------------------------------------------------------------ */

const contentPanel = document.getElementById("content");
const sidebarPanel = document.getElementById("sidebar");

/* ------------------------------------------------------------
   Module Loader
   ------------------------------------------------------------ */

function loadModule(moduleName) {
    contentPanel.innerHTML = `
        <h2>${moduleName}</h2>
        <p>Loading module...</p>
    `;

    sidebarPanel.innerHTML = `
        <h3>${moduleName} — Info</h3>
        <p>This panel will display engineering notes, calculations, and module‑specific data.</p>
    `;

    // Future: dynamic module imports
    // Example:
    // import(`/js/modules/${moduleName}.js`).then(...)
}

/* ------------------------------------------------------------
   Sidebar Helper
   ------------------------------------------------------------ */

function updateSidebar(html) {
    sidebarPanel.innerHTML = html;
}

/* ------------------------------------------------------------
   Content Helper
   ------------------------------------------------------------ */

function updateContent(html) {
    contentPanel.innerHTML = html;
}

/* ------------------------------------------------------------
   Poster Renderer Hook (future)
   ------------------------------------------------------------ */

function renderPoster(svgString) {
    updateContent(`
        <h2>Poster Preview</h2>
        <div class="card">
            ${svgString}
        </div>
    `);
}

/* ------------------------------------------------------------
   Initialization
   ------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
    console.log("KG5IEF Antenna‑Workbench initialized");
});
