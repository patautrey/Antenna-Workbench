/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Core Application Controller (FULL MODULE LOADER)
   ============================================================ */

console.log("KG5IEF Antenna‑Workbench: app.js loaded");

/* ------------------------------------------------------------
   IMPORT ALL MODULES
   ------------------------------------------------------------ */

import { verticalDesignerUI } from "./modules/vertical-designer.js";
import { nvisLabUI } from "./modules/nvis-lab.js";
import { dxLabUI } from "./modules/dx-lab.js";
import { feedlineUI } from "./modules/feedline.js";
import { postersUI } from "./modules/posters.js";

import { couplingSimulatorUI } from "./modules/coupling-simulator.js";
import { harmonicExplorerUI } from "./modules/harmonic-explorer.js";
import { systemGainUI } from "./modules/system-gain.js";
import { phasedArrayUI } from "./modules/phased-array.js";
import { groundLossMapUI } from "./modules/ground-loss-map.js";
import { mufLufExplorerUI } from "./modules/muf-luf-explorer.js";
import { noiseSnrLabUI } from "./modules/noise-snr-lab.js";
import { linkBudgetUI } from "./modules/link-budget.js";
import { powerHandlingUI } from "./modules/power-handling.js";
import { failureModeUI } from "./modules/failure-mode.js";
import { bandOpeningUI } from "./modules/band-opening.js";
import { antennaOptimizerAIUI } from "./modules/antenna-optimizer-ai.js";
import { workbenchExporterUI } from "./modules/workbench-exporter.js";

/* ------------------------------------------------------------
   DOM references
   ------------------------------------------------------------ */

const contentPanel = document.getElementById("content");
const sidebarPanel = document.getElementById("sidebar");

/* ------------------------------------------------------------
   MODULE REGISTRY
   ------------------------------------------------------------ */

const modules = {
    "vertical-designer": verticalDesignerUI,
    "nvis-lab": nvisLabUI,
    "dx-lab": dxLabUI,
    "feedline": feedlineUI,
    "posters": postersUI,

    "coupling-simulator": couplingSimulatorUI,
    "harmonic-explorer": harmonicExplorerUI,
    "system-gain": systemGainUI,
    "phased-array": phasedArrayUI,
    "ground-loss-map": groundLossMapUI,
    "muf-luf-explorer": mufLufExplorerUI,
    "noise-snr-lab": noiseSnrLabUI,
    "link-budget": linkBudgetUI,
    "power-handling": powerHandlingUI,
    "failure-mode": failureModeUI,
    "band-opening": bandOpeningUI,
    "antenna-optimizer-ai": antennaOptimizerAIUI,
    "workbench-exporter": workbenchExporterUI
};

/* ------------------------------------------------------------
   MODULE LOADER
   ------------------------------------------------------------ */

function loadModule(moduleName) {
    const mod = modules[moduleName];

    if (!mod) {
        contentPanel.innerHTML = `<h2>${moduleName}</h2><p>Module not found.</p>`;
        sidebarPanel.innerHTML = `<h3>Error</h3><p>No module registered under this name.</p>`;
        return;
    }

    // Load UI
    contentPanel.innerHTML = mod();

    // Reset sidebar
    sidebarPanel.innerHTML = `
        <h3>${moduleName} — Info</h3>
        <p>Module loaded successfully.</p>
    `;
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
   Poster Renderer Hook
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
