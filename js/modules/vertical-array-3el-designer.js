/* ---------------------------------------------------------
   Antenna Workbench — 3-Element Vertical Array Designer
   Spacing, phasing, gain, F/B, F/S, TOA, and feedpoint Z
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
   PHASING OPTIONS
--------------------------------------------------------- */
const PHASE = {
    "0":   { label: "0° (broadside)", gain: 0.0, fb: 0.0, fs: 0.0 },
    "90":  { label: "90° (end-fire)", gain: 4.0, fb: 18.0, fs: 12.0 },
    "180": { label: "180° (reversed end-fire)", gain: 4.0, fb: 18.0, fs: 12.0 }
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz, phaseKey) {
    const base = 32; // typical for 3-element phased verticals
    if (phaseKey === "90") return base * 0.9;
    if (phaseKey === "180") return base * 0.9;
    return base;
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM, phaseKey) {
    const base = 3.0; // baseline for 3 verticals
    const heightFactor = Math.min(heightM / 10, 1.0) * 1.2;
    const freqFactor = (freqMHz - 14.2) * 0.04;
    const phaseBoost = PHASE[phaseKey].gain;
    return base + heightFactor + freqFactor + phaseBoost;
}

/* ---------------------------------------------------------
   FRONT-TO-BACK & FRONT-TO-SIDE
--------------------------------------------------------- */
function estimateFB(freqMHz, phaseKey) {
    const base = PHASE[phaseKey].fb;
    const freqFactor = (freqMHz - 14.2) * 0.2;
    return base + freqFactor;
}

function estimateFS(freqMHz, phaseKey) {
    const base = PHASE[phaseKey].fs;
    const freqFactor = (freqMHz - 14.2) * 0.15;
    return base + freqFactor;
}

/* ---------------------------------------------------------
   TAKEOFF ANGLE MODEL
--------------------------------------------------------- */
function estimateTOA(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.25) return 26;
    if (frac < 0.5) return 20;
    if (frac < 0.75) return 16;
    return 14;
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
function computeArray(freqMHz) {
    const lambda = wavelength(freqMHz);

    return {
        lambda,
        verticalHeight: lambda / 4,
        spacing: lambda / 4,      // classic 1/4 λ spacing
        phasingLine: lambda / 4   // for 90° phasing
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, phaseKey, A, feedZ, gain, fb, fs, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const phase = PHASE[phaseKey];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Phasing:</strong> ${phase.label}`);
    lines.push(`<strong>Vertical radiator height:</strong> ${round(A.verticalHeight, 2)} m`);
    lines.push(`<strong>Element spacing:</strong> ${round(A.spacing, 2)} m`);
    lines.push(`<strong>Phasing line length:</strong> ${round(A.phasingLine, 2)} m`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated F/B ratio:</strong> ${round(fb, 1)} dB`);
    lines.push(`<strong>Estimated F/S ratio:</strong> ${round(fs, 1)} dB`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa, 1)}°`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Three-element vertical arrays provide exceptional low-angle DX performance
                with strong directional control and excellent F/B and F/S ratios.
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
    const freqStr = $(root, "#va3-freq").value;
    const heightStr = $(root, "#va3-height").value;
    const phaseKey = $(root, "#va3-phase").value;
    const summaryHost = $(root, "#va3-summary");

    const errors = validate(freqStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const A = computeArray(freqMHz);
    const feedZ = estimateFeedZ(freqMHz, phaseKey);
    const gain = estimateGain(freqMHz, heightM, phaseKey);
    const fb = estimateFB(freqMHz, phaseKey);
    const fs = estimateFS(freqMHz, phaseKey);
    const toa = estimateTOA(heightM, freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, phaseKey, A, feedZ, gain, fb, fs, toa)));

    log("vertical-array-3el-designer", "Computed 3-element vertical array design", {
        freqMHz,
        heightM,
        phaseKey,
        A,
        feedZ,
        gain,
        fb,
        fs,
        toa
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initVerticalArray3elDesigner(root) {
    const btn = $(root, "#va3-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#va3-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, and phasing, then click <strong>Compute 3‑Element Array</strong>.";
    }

    log("vertical-array-3el-designer", "Module initialized");
}
