/* ---------------------------------------------------------
   Antenna Workbench — J-Pole Designer
   Radiator length, matching stub, tap point, feedpoint Z,
   gain, TOA, and height analysis
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
function estimateFeedZ(tapCm) {
    // J-pole feedpoint Z varies strongly with tap position
    return 20 + tapCm * 1.2; // crude but useful
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM) {
    const base = 2.1; // typical J-pole gain in dBi
    const heightFactor = Math.min(heightM / 10, 1.0) * 0.8;
    const freqFactor = (freqMHz - 14.2) * 0.03;
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
function computeJPole(freqMHz) {
    const lambda = wavelength(freqMHz);

    const radiator = lambda / 2;     // half-wave radiator
    const stub = lambda / 4;         // quarter-wave matching stub

    return {
        lambda,
        radiator,
        stub
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, tapCm, J, feedZ, gain, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Radiator length:</strong> ${round(J.radiator, 2)} m`);
    lines.push(`<strong>Matching stub length:</strong> ${round(J.stub, 2)} m`);
    lines.push(`<strong>Feedpoint tap position:</strong> ${round(tapCm, 1)} cm`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa, 1)}°`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                J-poles are simple, effective antennas with a clean low-angle pattern.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStr, heightStr, tapStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    const tErr = requirePositive(tapStr, "Tap position (cm)");
    if (tErr) errors.push(tErr);

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#jpole-freq").value;
    const heightStr = $(root, "#jpole-height").value;
    const tapStr = $(root, "#jpole-tap").value;
    const summaryHost = $(root, "#jpole-summary");

    const errors = validate(freqStr, heightStr, tapStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const tapCm = toNumber(tapStr);

    const J = computeJPole(freqMHz);
    const feedZ = estimateFeedZ(tapCm);
    const gain = estimateGain(freqMHz, heightM);
    const toa = estimateTOA(heightM, freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, tapCm, J, feedZ, gain, toa)));

    log("jpole-designer", "Computed J-pole design", {
        freqMHz,
        heightM,
        tapCm,
        J,
        feedZ,
        gain,
        toa
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initJPoleDesigner(root) {
    const btn = $(root, "#jpole-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#jpole-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, and tap position, then click <strong>Compute J‑Pole</strong>.";
    }

    log("jpole-designer", "Module initialized");
}
