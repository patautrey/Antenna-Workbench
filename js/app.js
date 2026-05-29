// Antenna Workbench — Core Application Router
// Loads modules, handles navigation, and manages sidebar + content views.

import verticalDesigner from "./modules/vertical-designer.js";
import feedlineEngine from "./modules/feedline.js";
import postersEngine from "./modules/posters.js";
import propagationLab from "./modules/propagation.js";
import nvisDesigner from "./modules/nvis-designer.js";
import doubletDesigner from "./modules/doublet-designer.js";
import dxVerticalLab from "./modules/dx-vertical.js";

export default function initWorkbench() {

    const content = document.getElementById("content");
    const sidebar = document.getElementById("sidebar");
    const menuItems = document.querySelectorAll(".menu-item");

    const modules = {
        "vertical-designer": verticalDesigner,
        "feedline": feedlineEngine,
        "posters": postersEngine,
        "propagation": propagationLab,
        "nvis-designer": nvisDesigner,
        "doublet-designer": doubletDesigner,
        "dx-vertical": dxVerticalLab
    };

    function loadModule(id) {
        const mod = modules[id];
        if (!mod) {
            content.innerHTML = `<p>Module not found: ${id}</p>`;
            return;
        }

        mod(content);

        menuItems.forEach(item => item.classList.remove("active"));
        const active = document.querySelector(`[data-module="${id}"]`);
        if (active) active.classList.add("active");
    }

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const id = item.dataset.module;
            loadModule(id);
        });
    });

    loadModule("vertical-designer");
}
