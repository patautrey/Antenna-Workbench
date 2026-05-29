/* ---------------------------------------------------------
   Antenna Workbench — Yagi-Uda Designer (2–6 elements)
   Driven, reflector, directors, boom spacing, gain, F/B,
   feedpoint Z, and height analysis
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
    tubing: { label: "Tubing", factor: 0.96 }
};

/* ---------------------------------------------------------
   YAGI GEOMETRY CONSTANTS
   Based on typical broadband Yagi proportions.
--------------------------------------------------------- */
const YAGI = {
    driven:    0.47,  // λ
    reflector: 0.50,  // λ
    director:  0.45,  // λ (directors slightly shorter)
    spacing:   0.20   // λ between elements
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(numElements) {
    // Typical feedpoint Z decreases with more directors
    if (numElements <= 2) return 28;
    if (numElements === 3) return 25;
    if (numElements === 4) return 22;
    if (numElements === 5) return 20;
    return 18;
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM, numElements) {
    const base = 4.5; // 2-element Yagi baseline
    const elementBoost = (numElements - 2) * 1.2; // ~1.2 dB per director
    const heightFactor = Math.min(heightM / 12, 1.0) * 1.2;
    const freqFactor = (freqMHz - 14.2) * 0.04;
    return base + elementBoost + heightFactor + freqFactor;
}

/* ---------------------------------------------------------
   FRONT-TO-BACK RATIO
--------------------------------------------------------- */
function estimateFB(freqMHz, numElements) {
    const base = 12 + (numElements - 2) * 3; // more directors = better F/B
    const freqFactor = (freqMHz - 14.2) * 0.2;
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
function computeYagi(freqMHz, numElements, materialKey) {
    const lambda = wavelength(freqMHz);
    const f = MATERIAL[materialKey]?.factor || 1.0;

    const elements = [];

    // Reflector
    elements.push({
        type: "Reflector",
        length: lambda * YAGI.reflector * f,
        position: 0
    });

    // Driven
    elements.push({
        type: "Driven",
        length: lambda * YAGI.driven * f,
        position: lambda * YAGI.spacing
    });

    // Directors
    for (let i = 0; i < numElements - 2; i++) {
        elements.push({
            type: `Director ${i + 1}`,
            length: lambda * YAGI.director * f,
            position: lambda * YAGI.spacing * (i + 2)
        });
    }

    return {
        lambda,
        elements
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, numElements, materialKey, Y, feedZ, gain, fb) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";
    const mat = MATERIAL[materialKey];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Number of elements:</strong> ${numElements}`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Material:</strong> ${mat.label}`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated F/B ratio:</strong> ${round(fb, 1)} dB`);

    lines.push(`<hr>`);

    for (const el of Y.elements) {
        lines.push(`<strong>${el.type}:</strong> ${round(el.length, 2)} m @ ${round(el.position, 2)} m`);
    }

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Yagi-Uda arrays offer excellent gain and directivity, scaling smoothly from 2 to 6 elements.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
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
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#yagi-freq").value;
    const heightStr = $(root, "#yagi-height").value;
    const numStr = $(root, "#yagi-elements").value;
    const materialKey = $(root, "#yagi-material").value;
    const summaryHost = $(root, "#yagi-summary");

    const errors = validate(freqStr, heightStr, numStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const numElements = toNumber(numStr);

    const Y = computeYagi(freqMHz, numElements, materialKey);
    const feedZ = estimateFeedZ(numElements);
    const gain = estimateGain(freqMHz, heightM, numElements);
    const fb = estimateFB(freqMHz, numElements);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, numElements, materialKey, Y, feedZ, gain, fb)));

    log("yagi-designer", "Computed Yagi-Uda design", {
        freqMHz,
        heightM,
        numElements,
        materialKey,
        Y,
        feedZ,
        gain,
        fb
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initYagiDesigner(root) {
    const btn = $(root, "#yagi-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#yagi-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, material, and number of elements, then click <strong>Compute Yagi</strong>.";
    }

    log("yagi-designer", "Module initialized");
}
