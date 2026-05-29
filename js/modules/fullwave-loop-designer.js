/* ---------------------------------------------------------
   Antenna Workbench — Full-Wave Loop (SkyLoop) Designer
   Perimeter calculation, geometry factors, height analysis,
   feedpoint Z, and SWR envelope estimation
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
   GEOMETRY FACTORS
--------------------------------------------------------- */
const SHAPES = {
    square: { label: "Square", factor: 1.00 },
    delta: { label: "Delta (triangular)", factor: 1.05 },
    rectangle: { label: "Rectangle (3:1)", factor: 0.92 }
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(shapeKey) {
    switch (shapeKey) {
        case "square": return 120;
        case "delta": return 100;
        case "rectangle": return 140;
        default: return 120;
    }
}

/* ---------------------------------------------------------
   SWR ENVELOPE
--------------------------------------------------------- */
function estimateSWR(feedZ) {
    const z0 = 50;
    const mismatch = Math.abs(feedZ - z0) / z0;
    return 1 + mismatch * 2.0;
}

/* ---------------------------------------------------------
   HEIGHT REGION ANALYSIS
--------------------------------------------------------- */
function analyzeHeight(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.15)
        return "Low height (<0.15 λ): NVIS‑dominant, high-angle radiation.";
    if (frac < 0.25)
        return "Moderate height (0.15–0.25 λ): mixed angles, still NVIS‑leaning.";
    if (frac < 0.5)
        return "Good height (0.25–0.5 λ): balanced pattern, strong regional coverage.";
    if (frac < 0.75)
        return "High (0.5–0.75 λ): strong low‑angle DX potential.";
    return "Very high (>0.75 λ): multi‑lobed pattern, excellent DX but complex lobes.";
}

/* ---------------------------------------------------------
   LOOP PERIMETER CALCULATION
--------------------------------------------------------- */
function computeLoop(freqMHz, shapeKey) {
    const lambda = wavelength(freqMHz);
    const base = lambda; // full-wave loop
    const factor = SHAPES[shapeKey]?.factor || 1.0;

    return {
        lambda,
        perimeter: base * factor
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, shapeKey, L, feedZ, swr) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const shape = SHAPES[shapeKey];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Loop shape:</strong> ${shape.label}`);
    lines.push(`<strong>Loop perimeter:</strong> <span style="color:#4da3ff;">${round(L.perimeter, 2)} m</span>`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated SWR envelope:</strong> ${round(swr, 2)} : 1`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                SkyLoops are excellent multi-band performers when fed with balanced line and a tuner.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStr, heightStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#sky-freq").value;
    const heightStr = $(root, "#sky-height").value;
    const shapeKey = $(root, "#sky-shape").value;
    const summaryHost = $(root, "#sky-summary");

    const errors = validate(freqStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const L = computeLoop(freqMHz, shapeKey);
    const feedZ = estimateFeedZ(shapeKey);
    const swr = estimateSWR(feedZ);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, shapeKey, L, feedZ, swr)));

    log("fullwave-loop-designer", "Computed SkyLoop design", {
        freqMHz,
        heightM,
        shapeKey,
        L,
        feedZ,
        swr
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initFullWaveLoopDesigner(root) {
    const btn = $(root, "#sky-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#sky-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, and shape, then click <strong>Compute SkyLoop</strong>.";
    }

    log("fullwave-loop-designer", "Module initialized");
}
