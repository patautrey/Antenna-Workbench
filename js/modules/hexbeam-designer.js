/* ---------------------------------------------------------
   Antenna Workbench — Hexbeam Designer
   Geometry, element lengths, hub radius, gain, F/B,
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
    tubing: { label: "Tubing", factor: 0.97 }
};

/* ---------------------------------------------------------
   HEXBEAM GEOMETRY CONSTANTS
   Based on classic broadband hexbeam proportions.
--------------------------------------------------------- */
const HEX = {
    driven:   0.47,  // driven element ~0.47 λ
    reflector:0.50,  // reflector ~0.50 λ
    radius:   0.28   // hub radius ~0.28 λ
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz) {
    // Typical hexbeam feedpoint Z ~ 22–28Ω
    return 25 + (freqMHz - 14.2) * 0.3;
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM) {
    const base = 5.8; // typical hexbeam gain in dBi
    const heightFactor = Math.min(heightM / 12, 1.0) * 1.0;
    const freqFactor = (freqMHz - 14.2) * 0.04;
    return base + heightFactor + freqFactor;
}

/* ---------------------------------------------------------
   FRONT-TO-BACK RATIO
--------------------------------------------------------- */
function estimateFB(freqMHz) {
    return 20 + (freqMHz - 14.2) * 0.25; // typical 20–25 dB
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
function computeHex(freqMHz, materialKey) {
    const lambda = wavelength(freqMHz);
    const f = MATERIAL[materialKey]?.factor || 1.0;

    return {
        lambda,
        driven:    lambda * HEX.driven    * f,
        reflector: lambda * HEX.reflector * f,
        radius:    lambda * HEX.radius    * f
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, materialKey, H, feedZ, gain, fb) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";
    const mat = MATERIAL[materialKey];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Material:</strong> ${mat.label}`);
    lines.push(`<strong>Driven element length:</strong> ${round(H.driven, 2)} m`);
    lines.push(`<strong>Reflector length:</strong> ${round(H.reflector, 2)} m`);
    lines.push(`<strong>Hub radius:</strong> ${round(H.radius, 2)} m`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated F/B ratio:</strong> ${round(fb, 1)} dB`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Hexbeams offer excellent gain, light weight, and broad bandwidth in a compact footprint.
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
    const freqStr = $(root, "#hex-freq").value;
    const heightStr = $(root, "#hex-height").value;
    const materialKey = $(root, "#hex-material").value;
    const summaryHost = $(root, "#hex-summary");

    const errors = validate(freqStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const H = computeHex(freqMHz, materialKey);
    const feedZ = estimateFeedZ(freqMHz);
    const gain = estimateGain(freqMHz, heightM);
    const fb = estimateFB(freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, materialKey, H, feedZ, gain, fb)));

    log("hexbeam-designer", "Computed hexbeam design", {
        freqMHz,
        heightM,
        materialKey,
        H,
        feedZ,
        gain,
        fb
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initHexbeamDesigner(root) {
    const btn = $(root, "#hex-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#hex-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, and material, then click <strong>Compute Hexbeam</strong>.";
    }

    log("hexbeam-designer", "Module initialized");
}
