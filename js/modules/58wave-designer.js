/* ---------------------------------------------------------
   Antenna Workbench — 5/8-Wave Vertical Designer
   Radiator length, matching network, ground system,
   feedpoint Z, efficiency, SWR, and height analysis
--------------------------------------------------------- */

import { wavelength, round } from "../utils.js";
import { requirePositive, requireFrequency, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { log } from "../log.js";

/* ---------------------------------------------------------
   DOM HELPERS
--------------------------------------------------------- */
function $(root, sel) { return root.querySelector(sel); }

/* ---------------------------------------------------------
   GROUND SYSTEM MODELS
--------------------------------------------------------- */
const GROUND = {
    poor:      { label: "Poor (0–4 radials)", efficiency: 0.20, z: 55 },
    average:   { label: "Average (8–16 radials)", efficiency: 0.40, z: 45 },
    good:      { label: "Good (32+ radials)", efficiency: 0.60, z: 38 },
    elevated:  { label: "Elevated radials", efficiency: 0.70, z: 32 },
    screen:    { label: "Ground screen", efficiency: 0.80, z: 35 }
};

/* ---------------------------------------------------------
   MATCHING NETWORK MODEL
--------------------------------------------------------- */
function estimateMatching(freqMHz) {
    // Series coil inductance estimate for 5/8-wave vertical
    const L = 200 / freqMHz; // µH (very approximate)
    return L;
}

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz, groundKey) {
    const g = GROUND[groundKey] || GROUND.average;
    // 5/8-wave verticals have low feedpoint Z
    return g.z;
}

/* ---------------------------------------------------------
   EFFICIENCY MODEL
--------------------------------------------------------- */
function estimateEfficiency(groundKey) {
    const g = GROUND[groundKey] || GROUND.average;
    return g.efficiency;
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

    if (frac < 0.1)
        return "Very low (<0.1 λ): pattern distorted, high-angle radiation.";
    if (frac < 0.25)
        return "Low (0.1–0.25 λ): moderate performance, higher TOA.";
    if (frac < 0.5)
        return "Good (0.25–0.5 λ): strong low-angle radiation.";
    return "High (>0.5 λ): excellent low-angle DX performance.";
}

/* ---------------------------------------------------------
   GEOMETRY CALCULATION
--------------------------------------------------------- */
function compute58Wave(freqMHz) {
    const lambda = wavelength(freqMHz);
    return {
        lambda,
        radiator: lambda * 0.625 // 5/8-wave
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, groundKey, V, feedZ, eff, swr, Lmatch) {
    const g = GROUND[groundKey];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz`);
    lines.push(`<strong>Radiator length (5/8 λ):</strong> ${round(V.radiator, 2)} m`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Ground system:</strong> ${g.label}`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Efficiency (est.):</strong> ${round(eff * 100, 1)}%`);
    lines.push(`<strong>Matching coil inductance (est.):</strong> ${round(Lmatch, 2)} µH`);
    lines.push(`<strong>Estimated SWR envelope:</strong> ${round(swr, 2)} : 1`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                5/8-wave verticals offer excellent low-angle DX performance with a proper matching network.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStr, heightStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#58-freq").value;
    const heightStr = $(root, "#58-height").value;
    const groundKey = $(root, "#58-ground").value;
    const summaryHost = $(root, "#58-summary");

    const errors = validate(freqStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const V = compute58Wave(freqMHz);
    const feedZ = estimateFeedZ(freqMHz, groundKey);
    const eff = estimateEfficiency(groundKey);
    const swr = estimateSWR(feedZ);
    const Lmatch = estimateMatching(freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, groundKey, V, feedZ, eff, swr, Lmatch)));

    log("58wave-designer", "Computed 5/8-wave vertical design", {
        freqMHz,
        heightM,
        groundKey,
        V,
        feedZ,
        eff,
        swr,
        Lmatch
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function init58WaveDesigner(root) {
    const btn = $(root, "#58-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#58-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, and ground system, then click <strong>Compute 5/8‑Wave Vertical</strong>.";
    }

    log("58wave-designer", "Module initialized");
}
