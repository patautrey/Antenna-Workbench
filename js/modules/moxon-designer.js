/* ---------------------------------------------------------
   Antenna Workbench — Moxon Rectangle Designer
   Geometry scaling, feedpoint Z, gain, F/B ratio,
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
    wire: { label: "Wire", factor: 1.00 },
    tubing: { label: "Tubing", factor: 0.97 }
};

/* ---------------------------------------------------------
   MOXON GEOMETRY (normalized)
   Dimensions are fractions of wavelength.
   A = element length
   B = element spacing
   C = tip gap
   D = tip length
--------------------------------------------------------- */
const MOXON = {
    A: 0.475,  // driven + reflector length
    B: 0.052,  // spacing
    C: 0.028,  // gap
    D: 0.058   // folded tip length
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz) {
    // Typical Moxon feedpoint Z ~ 45–55Ω
    return 50 + (freqMHz - 14.2) * 0.5; // small drift with frequency
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM) {
    const base = 5.5; // typical Moxon gain in dBi
    const heightFactor = Math.min(heightM / 10, 1.0) * 1.2; // up to +1.2 dB
    const freqFactor = (freqMHz - 14.2) * 0.05;
    return base + heightFactor + freqFactor;
}

/* ---------------------------------------------------------
   FRONT-TO-BACK RATIO
--------------------------------------------------------- */
function estimateFB(freqMHz) {
    return 20 + (freqMHz - 14.2) * 0.3; // typical 20–30 dB
}

/* ---------------------------------------------------------
   HEIGHT REGION ANALYSIS
--------------------------------------------------------- */
function analyzeHeight(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.25)
        return "Low height (<0.25 λ): pattern distorted, reduced F/B.";
    if (frac < 0.5)
        return "Moderate height (0.25–0.5 λ): good performance, moderate F/B.";
    if (frac < 0.75)
        return "High (0.5–0.75 λ): strong low‑angle radiation, excellent F/B.";
    return "Very high (>0.75 λ): maximum DX performance, clean pattern.";
}

/* ---------------------------------------------------------
   GEOMETRY CALCULATION
--------------------------------------------------------- */
function computeMoxon(freqMHz, materialKey) {
    const lambda = wavelength(freqMHz);
    const f = MATERIAL[materialKey]?.factor || 1.0;

    return {
        lambda,
        A: lambda * MOXON.A * f,
        B: lambda * MOXON.B * f,
        C: lambda * MOXON.C * f,
        D: lambda * MOXON.D * f
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, materialKey, M, feedZ, gain, fb) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const mat = MATERIAL[materialKey];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Material:</strong> ${mat.label}`);
    lines.push(`<strong>A (element length):</strong> ${round(M.A, 2)} m`);
    lines.push(`<strong>B (spacing):</strong> ${round(M.B, 2)} m`);
    lines.push(`<strong>C (tip gap):</strong> ${round(M.C, 2)} m`);
    lines.push(`<strong>D (tip length):</strong> ${round(M.D, 2)} m`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated F/B ratio:</strong> ${round(fb, 1)} dB`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Moxon rectangles offer excellent gain and F/B in a compact footprint.
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
    const freqStr = $(root, "#mox-freq").value;
    const heightStr = $(root, "#mox-height").value;
    const materialKey = $(root, "#mox-material").value;
    const summaryHost = $(root, "#mox-summary");

    const errors = validate(freqStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const M = computeMoxon(freqMHz, materialKey);
    const feedZ = estimateFeedZ(freqMHz);
    const gain = estimateGain(freqMHz, heightM);
    const fb = estimateFB(freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, materialKey, M, feedZ, gain, fb)));

    log("moxon-designer", "Computed Moxon design", {
        freqMHz,
        heightM,
        materialKey,
        M,
        feedZ,
        gain,
        fb
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initMoxonDesigner(root) {
    const btn = $(root, "#mox-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#mox-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, and material, then click <strong>Compute Moxon</strong>.";
    }

    log("moxon-designer", "Module initialized");
}
