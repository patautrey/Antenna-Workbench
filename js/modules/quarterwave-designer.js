/* ---------------------------------------------------------
   Antenna Workbench — Quarter-Wave Vertical Designer
   Radiator length, ground system, feedpoint Z, efficiency,
   SWR envelope, and height analysis
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
    poor:      { label: "Poor (0–4 radials)", efficiency: 0.25, z: 45 },
    average:   { label: "Average (8–16 radials)", efficiency: 0.45, z: 36 },
    good:      { label: "Good (32+ radials)", efficiency: 0.65, z: 32 },
    elevated:  { label: "Elevated radials", efficiency: 0.75, z: 28 },
    screen:    { label: "Ground screen", efficiency: 0.85, z: 30 }
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz, groundKey) {
    const g = GROUND[groundKey] || GROUND.average;
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
function computeQuarterWave(freqMHz) {
    const lambda = wavelength(freqMHz);
    return {
        lambda,
        radiator: lambda / 4
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, groundKey, Q, feedZ, eff, swr) {
    const g = GROUND[groundKey];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz`);
    lines.push(`<strong>Radiator length:</strong> ${round(Q.radiator, 2)} m`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Ground system:</strong> ${g.label}`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Efficiency (est.):</strong> ${round(eff * 100, 1)}%`);
    lines.push(`<strong>Estimated SWR envelope:</strong> ${round(swr, 2)} : 1`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Quarter-wave verticals are simple, effective, and provide excellent low-angle radiation when paired with a good ground system.
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
    const freqStr = $(root, "#qv-freq").value;
    const heightStr = $(root, "#qv-height").value;
    const groundKey = $(root, "#qv-ground").value;
    const summaryHost = $(root, "#qv-summary");

    const errors = validate(freqStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const Q = computeQuarterWave(freqMHz);
    const feedZ = estimateFeedZ(freqMHz, groundKey);
    const eff = estimateEfficiency(groundKey);
    const swr = estimateSWR(feedZ);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, groundKey, Q, feedZ, eff, swr)));

    log("quarterwave-designer", "Computed quarter-wave vertical design", {
        freqMHz,
        heightM,
        groundKey,
        Q,
        feedZ,
        eff,
        swr
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initQuarterWaveDesigner(root) {
    const btn = $(root, "#qv-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#qv-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, and ground system, then click <strong>Compute Quarter‑Wave Vertical</strong>.";
    }

    log("quarterwave-designer", "Module initialized");
}
