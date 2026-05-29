/* ---------------------------------------------------------
   Antenna Workbench — Module Loader
--------------------------------------------------------- */

import initDoubletDesigner from "./modules/doublet-designer.js";
import initLoopDesigner from "./modules/loop-designer.js";
import initSkyloopDesigner from "./modules/skyloop-designer.js";
import initNVISDipoleDesigner from "./modules/nvis-dipole-designer.js";
import initVerticalNVISDesigner from "./modules/vertical-nvis-designer.js";
import initSterbaDesigner from "./modules/sterba-designer.js";
import initBobtailDesigner from "./modules/bobtail-designer.js";
import initPerformer from "./modules/performer.js";
import initDominator from "./modules/dominator.js";

function $(sel) { return document.querySelector(sel); }

function showTab(id) {
    document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
    $( "#" + id ).style.display = "block";
}

document.querySelectorAll("#tabs button").forEach(btn => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
});

showTab("doublet");

initDoubletDesigner($("#doublet"));
initLoopDesigner($("#loop"));
initSkyloopDesigner($("#skyloop"));
initNVISDipoleDesigner($("#nvisdipole"));
initVerticalNVISDesigner($("#verticalnvis"));
initSterbaDesigner($("#sterba"));
initBobtailDesigner($("#bobtail"));
initPerformer($("#performer"));
initDominator($("#dominator"));
