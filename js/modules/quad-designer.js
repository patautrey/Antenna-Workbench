/* ---------------------------------------------------------
   Antenna Workbench — Cubical Quad Designer
   Loop geometry, spacing, gain, F/B, feedpoint Z,
   and height analysis
--------------------------------------------------------- */

import { wavelength, round } from "../utils.js";
import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";

/* ---------------------------------------------------------
   DOM HELPERS
--------------------------------------------------------- */
function $(root, sel) { return root.querySelector(sel); }

/* ---------------------------------------------------------
   MATERIAL CORRECTION
--------------------------------------------------------- */
const MATERIAL = {
    wire:   { label: "Wire",   factor: 1.00 },
    tubing: { label: "Tubing", factor: 0.97 }
};

/* ---------------------------------------------------------
   QUAD GEOMETRY CONSTANTS
--------------------------------------------------------- */
const QUAD = {
    driven:    1.02,  // circumference ~1.02 λ
    reflector: 1.08,  // reflector slightly longer
    director:  0.98,  // directors slightly shorter
    spacing:   0.20   // λ between loops
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(numElements) {
    if (numElements <= 2) return 110;
    if (numElements === 3) return 95;
    if (numElements === 4) return 85;
    return 75;
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM, numElements) {
    const base = 5.0; // 2-element quad baseline
    const elementBoost = (numElements - 2) * 1.1;
    const heightFactor = Math.min(heightM / 12, 1.0) * 1.1;
    const freqFactor = (freqMHz - 14.2) * 0.03;
    return base + elementBoost + heightFactor + freqFactor;
}

/* ---------------------------------------------------------
   FRONT-TO-BACK RATIO
--------------------------------------------------------- */
function estimateFB(freqMHz, numElements) {
    const base = 14 + (numElements - 2) * 3;
    const freqFactor = (freqMHz - 14.2) * 0.15;
    return base + freqFactor;
}

/* ---------------------------------------------------------
   HEIGHT REGION ANALYSIS
--------------------------------------------------------- */
function analyzeHeight(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.25)
        return "Low height (<0.25 λ): reduced gain, higher TOA.";
    if (frac < 0.5)
        return "Moderate height (0.25–0.5 λ): good performance.";
    if (frac < 0.75)
        return "High (0.5–0.75 λ): strong low-angle DX.";
    return "Very high (>0.75 λ): excellent DX performance.";
}

/* ---------------------------------------------------------
   GEOMETRY CALCULATION
--------------------------------------------------------- */
function computeQuad(freqMHz, numElements, materialKey) {
    const lambda = wavelength(freqMHz);
    const f = MATERIAL[materialKey]?.factor || 1.0;

    const loops = [];

    // Reflector
    loops.push({
        type: "Reflector",
        circumference: lambda * QUAD.reflector * f,
        position: 0
    });

    // Driven
    loops.push({
        type: "Driven",
        circumference: lambda * QUAD.driven * f,
        position: lambda * QUAD.spacing
    });

    // Directors
    for (let i = 0; i < numElements - 2; i++) {
        loops.push({
            type: `Director ${i + 1}`,
            circumference: lambda * QUAD.director * f,
            position: lambda * QUAD.spacing * (i + 2)
        });
    }

    return {
        lambda,
        loops,
        boomLength: lambda * QUAD.spacing * (numElements - 1)
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
---------------------------------------------------------
*/
function buildSummary(freqMHz, heightM, numElements, materialKey, Q, feedZ, gain, fb) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";
    const mat = MATERIAL[materialKey];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Number of elements:</strong> ${numElements}`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Material:</strong> ${mat.label}`);
    lines.push(`<strong>Boom length:</strong> ${round(Q.boomLength, 2)} m`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated F/B ratio:</strong> ${round(fb, 1)} dB`);
    lines.push(`<hr>`);

    for (const loop of Q.loops) {
        lines.push(`<strong>${loop.type}:</strong> ${round(loop.circumference, 2)} m @ ${round(loop.position, 2)} m`);
    }

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Cubical quads offer excellent gain and low-angle performance with reduced noise compared to Yagis.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
---------------------------------------------------------
*/
function validate(freqStr, heightStr, numStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    const nErr = requirePositive(numStr, "Number of elements");
    if (nErr) errors.push(nErr);

    const n = Number(numStr);
    if (n < 2 || n > 6) errors.push("Number of elements must be between 2 and 6.");

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
---------------------------------------------------------
*/
function handleCompute(root) {
    const freqStr = $(root, "#quad-freq").value;
    const heightStr = $(root, "#quad-height").value;
    const numStr = $(root, "#quad-elements").value;
    const materialKey = $(root, "#quad-material").value;
    const summaryHost = $(root, "#quad-summary");

    const errors = validate(freqStr, heightStr, numStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const numElements = toNumber(numStr);

    const Q = computeQuad(freqMHz, numElements, materialKey);
    const feedZ = estimateFeedZ(numElements);
    const gain = estimateGain(freqMHz, heightM, numElements);
    const fb = estimateFB(freqMHz, numElements);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, numElements, materialKey, Q, feedZ, gain, fb)));

    log("quad-designer", "Computed cubical quad design", {
        freqMHz,
        heightM,
        numElements,
        materialKey,
        Q,
        feedZ,
        gain,
        fb
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
---------------------------------------------------------
*/
export default function initQuadDesigner(root) {
    const btn = $(root, "#quad-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#quad-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, material, and number of elements, then click <strong>Compute Quad</strong>.";
    }

    log("quad-designer", "Module initialized");
}
