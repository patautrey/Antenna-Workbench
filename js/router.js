/* ---------------------------------------------------------
   Antenna Workbench — Router
   Handles module switching, sidebar activation, and content loading
--------------------------------------------------------- */

import { $ } from "./dom.js";
import { log } from "./log.js";

const modules = {};
let currentModule = null;

/* ---------------------------------------------------------
   REGISTER A MODULE
--------------------------------------------------------- */
export function registerModule(id, loaderFn) {
    modules[id] = loaderFn;
}

/* ---------------------------------------------------------
   ACTIVATE SIDEBAR ITEM
--------------------------------------------------------- */
function activateSidebar(id) {
    const items = document.querySelectorAll(".menu-item");
    items.forEach(item => item.classList.remove("active"));

    const active = document.querySelector(`.menu-item[data-module='${id}']`);
    if (active) active.classList.add("active");
}

/* ---------------------------------------------------------
   LOAD A MODULE
--------------------------------------------------------- */
export function loadModule(id) {
    if (!modules[id]) {
        console.error(`Router: Module "${id}" not found`);
        return;
    }

    log("router", `Loading module: ${id}`);

    const content = $("#content");
    content.innerHTML = "<p>Loading…</p>";

    activateSidebar(id);

    currentModule = id;

    // Load module content
    try {
        modules[id](content);
    } catch (err) {
        console.error(`Router: Error loading module "${id}"`, err);
        content.innerHTML = `<p>Error loading module: ${id}</p>`;
    }
}

/* ---------------------------------------------------------
   GET CURRENT MODULE
--------------------------------------------------------- */
export function getCurrentModule() {
    return currentModule;
}

/* ---------------------------------------------------------
   INITIALIZE ROUTER
--------------------------------------------------------- */
export function initRouter(defaultModule = null) {
    // Sidebar click handling
    document.addEventListener("click", e => {
        const item = e.target.closest(".menu-item");
        if (!item) return;

        const id = item.dataset.module;
        if (id) loadModule(id);
    });

    // Load default module
    if (defaultModule && modules[defaultModule]) {
        loadModule(defaultModule);
    }
}
