/* ---------------------------------------------------------
   Antenna Workbench — Extended Double Zepp (EDZ) Designer
   1.28 λ geometry, gain, TOA, feedpoint Z, and SWR estimation
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
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz) {
    // EDZ feedpoint Z is typically high (200–400Ω)
    return 280 + (freqMHz - 14.2) * 3.0;
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM) {
    const base = 5.0; // EDZ has strong broadside gain
    const heightFactor = Math.min(heightM / 12, 1.0) * 1.5;
    const freqFactor = (freqMHz - 14.2) * 0.05;
    return base + heightFactor + freqFactor;
}

/* ---------------------------------------------------------
   TAKEOFF ANGLE MODEL
--------------------------------------------------------- */
function estimateTOA(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.25) return 32;
    if (frac < 0.5) return 26;
    if (frac < 0.75) return 20;
    return 16;
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
function computeEDZ(freqMHz) {
    const lambda = wavelength(freqMHz);

    const total = lambda * 1.28; // EDZ total length
    const leg = total / 2;

    return {
        lambda,
        total,
        leg
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, E, feedZ, gain, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Total EDZ length:</strong> ${round(E.total, 2)} m`);
    lines.push(`<strong>Each leg length:</strong> ${round(E.leg, 2)} m`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa, 1)}°`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                EDZ antennas offer excellent broadside gain and strong DX performance.
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
    const freqStr = $(root, "#edz-freq").value;
    const heightStr = $(root, "#edz-height").value;
    const summaryHost = $(root, "#edz-summary");

    const errors = validate(freqStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const E = computeEDZ(freqMHz);
    const feedZ = estimateFeedZ(freqMHz);
    const gain = estimateGain(freqMHz, heightM);
    const toa = estimateTOA(heightM, freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, E, feedZ, gain, toa)));

    log("edz-designer", "Computed EDZ design", {
        freqMHz,
        heightM,
        E,
        feedZ,
        gain,
        toa
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initEDZDesigner(root) {
    const btn = $(root, "#edz-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#edz-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency and height, then click <strong>Compute EDZ</strong>.";
    }

    log("edz-designer", "Module initialized");
}
