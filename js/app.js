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

import { diagnosticModuleUI } from "./modules/diagnostic-module.js";

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
    "workbench-exporter": workbenchExporterUI,

    "diagnostic-module": diagnosticModuleUI
};

// Expose registry globally for diagnostics
window.modules = modules;

/* ------------------------------------------------------------
   MODULE LOADER (GLOBAL)
   ------------------------------------------------------------ */

window.loadModule = function (moduleName) {
    const mod = modules[moduleName];

    if (!mod) {
        contentPanel.innerHTML = `
            <h2>${moduleName}</h2>
            <div class="card"><p>Module not found.</p></div>
        `;
        sidebarPanel.innerHTML = `
            <h3>Error</h3>
            <p>No module registered under this name.</p>
        `;
        return;
    }

    try {
        const html = mod();
        contentPanel.innerHTML = html;

        sidebarPanel.innerHTML = `
            <h3>${moduleName} — Info</h3>
            <p>Module loaded successfully.</p>
        `;
    } catch (err) {
        console.error("Module load error:", moduleName, err);

        contentPanel.innerHTML = `
            <h2>${moduleName}</h2>
            <div class="card">
                <p>Error rendering module UI.</p>
                <pre>${err.message}</pre>
            </div>
        `;

        sidebarPanel.innerHTML = `
            <h3>${moduleName} — Error</h3>
            <p>Check console for details.</p>
        `;
    }
};

/* ------------------------------------------------------------
   Sidebar Helper
   ------------------------------------------------------------ */

window.updateSidebar = function (html) {
    sidebarPanel.innerHTML = html;
};

/* ------------------------------------------------------------
   Content Helper
   ------------------------------------------------------------ */

window.updateContent = function (html) {
    contentPanel.innerHTML = html;
};

/* ------------------------------------------------------------
   Poster Renderer Hook
   ------------------------------------------------------------ */

window.renderPoster = function (svgString) {
    contentPanel.innerHTML = `
        <h2>Poster Preview</h2>
        <div class="card">${svgString}</div>
    `;
};

/* ------------------------------------------------------------
   Initialization
   ------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
    console.log("KG5IEF Antenna‑Workbench initialized");
});
