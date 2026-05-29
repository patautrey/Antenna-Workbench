/* ---------------------------------------------------------
   Antenna Workbench — Bobtail Curtain Designer
   Three-vertical array geometry, spacing, phasing,
   gain, TOA, and feedpoint Z estimation
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
    // Bobtail curtains typically present a low feedpoint Z
    return 35 + (freqMHz - 7.1) * 0.8; // crude but useful
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM) {
    const base = 5.0; // typical bobtail gain in dBi
    const heightFactor = Math.min(heightM / 12, 1.0) * 1.5; // up to +1.5 dB
    const freqFactor = (freqMHz - 7.1) * 0.05;
    return base + heightFactor + freqFactor;
}

/* ---------------------------------------------------------
   TAKEOFF ANGLE MODEL
--------------------------------------------------------- */
function estimateTOA(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.25) return 28;
    if (frac < 0.5) return 22;
    if (frac < 0.75) return 18;
    return 15;
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
function computeBobtail(freqMHz) {
    const lambda = wavelength(freqMHz);

    return {
        lambda,
        verticalHeight: lambda / 4,
        spacing: lambda / 2,
        phasingLine: lambda / 4
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, B, feedZ, gain, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Vertical radiator height:</strong> ${round(B.verticalHeight, 2)} m`);
    lines.push(`<strong>Spacing between verticals:</strong> ${round(B.spacing, 2)} m`);
    lines.push(`<strong>Phasing line length:</strong> ${round(B.phasingLine, 2)} m`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa, 1)}°`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Bobtail curtains excel at low-angle DX and strong forward gain.
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
    const freqStr = $(root, "#bob-freq").value;
    const heightStr = $(root, "#bob-height").value;
    const summaryHost = $(root, "#bob-summary");

    const errors = validate(freqStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const B = computeBobtail(freqMHz);
    const feedZ = estimateFeedZ(freqMHz);
    const gain = estimateGain(freqMHz, heightM);
    const toa = estimateTOA(heightM, freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, B, feedZ, gain, toa)));

    log("bobtail-designer", "Computed bobtail curtain design", {
        freqMHz,
        heightM,
        B,
        feedZ,
        gain,
        toa
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initBobtailDesigner(root) {
    const btn = $(root, "#bob-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#bob-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency and height, then click <strong>Compute Bobtail</strong>.";
    }

    log("bobtail-designer", "Module initialized");
}
