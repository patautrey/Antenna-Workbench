/* ---------------------------------------------------------
   Antenna Workbench — Curtain Array Designer
   2/4/8-element HF broadcast-style curtain arrays
   Geometry, spacing, gain, F/B, F/S, TOA, feedpoint Z
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
   CONFIGURATIONS
--------------------------------------------------------- */
const CONFIG = {
    "2": { label: "2-element",  gain: 3.0, fb: 10, fs: 6 },
    "4": { label: "4-element",  gain: 6.0, fb: 18, fs: 12 },
    "8": { label: "8-element",  gain: 9.0, fb: 24, fs: 18 }
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(num) {
    if (num === 2) return 60;
    if (num === 4) return 50;
    return 40;
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM, num) {
    const base = CONFIG[num].gain;
    const heightFactor = Math.min(heightM / 20, 1.0) * 2.0;
    const freqFactor = (freqMHz - 14.2) * 0.03;
    return base + heightFactor + freqFactor;
}

/* ---------------------------------------------------------
   FRONT-TO-BACK & FRONT-TO-SIDE
--------------------------------------------------------- */
function estimateFB(freqMHz, num) {
    return CONFIG[num].fb + (freqMHz - 14.2) * 0.15;
}

function estimateFS(freqMHz, num) {
    return CONFIG[num].fs + (freqMHz - 14.2) * 0.12;
}

/* ---------------------------------------------------------
   TAKEOFF ANGLE MODEL
--------------------------------------------------------- */
function estimateTOA(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.5) return 22;
    if (frac < 1.0) return 16;
    return 12;
}

/* ---------------------------------------------------------
   HEIGHT REGION ANALYSIS
--------------------------------------------------------- */
function analyzeHeight(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.5)
        return "Low height (<0.5 λ): reduced gain, higher TOA.";
    if (frac < 1.0)
        return "Moderate height (0.5–1.0 λ): good performance.";
    if (frac < 1.5)
        return "High (1.0–1.5 λ): strong low-angle DX.";
    return "Very high (>1.5 λ): excellent DX performance.";
}

/* ---------------------------------------------------------
   GEOMETRY CALCULATION
--------------------------------------------------------- */
function computeCurtain(freqMHz, num) {
    const lambda = wavelength(freqMHz);

    const verticalSpacing = lambda / 2;
    const horizontalSpacing = lambda / 2;

    const elements = [];

    const rows = num === 2 ? 1 : num === 4 ? 2 : 2;
    const cols = num === 2 ? 2 : num === 4 ? 2 : 4;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            elements.push({
                type: `Element ${r * cols + c + 1}`,
                x: c * horizontalSpacing,
                y: r * verticalSpacing
            });
        }
    }

    return {
        lambda,
        elements,
        verticalSpacing,
        horizontalSpacing
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, num, C, feedZ, gain, fb, fs, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Configuration:</strong> ${CONFIG[num].label}`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Vertical spacing:</strong> ${round(C.verticalSpacing, 2)} m`);
    lines.push(`<strong>Horizontal spacing:</strong> ${round(C.horizontalSpacing, 2)} m`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated F/B ratio:</strong> ${round(fb, 1)} dB`);
    lines.push(`<strong>Estimated F/S ratio:</strong> ${round(fs, 1)} dB`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa, 1)}°`);
    lines.push(`<hr>`);

    for (const el of C.elements) {
        lines.push(`<strong>${el.type}:</strong> X=${round(el.x, 2)} m, Y=${round(el.y, 2)} m`);
    }

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Curtain arrays provide massive gain and deep nulls, ideal for long-haul HF broadcast and high-performance DX.
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

    const n = Number(numStr);
    if (![2, 4, 8].includes(n)) errors.push("Number of elements must be 2, 4, or 8.");

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#curtain-freq").value;
    const heightStr = $(root, "#curtain-height").value;
    const numStr = $(root, "#curtain-elements").value;
    const summaryHost = $(root, "#curtain-summary");

    const errors = validate(freqStr, heightStr, numStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const num = toNumber(numStr);

    const C = computeCurtain(freqMHz, num);
    const feedZ = estimateFeedZ(num);
    const gain = estimateGain(freqMHz, heightM, num);
    const fb = estimateFB(freqMHz, num);
    const fs = estimateFS(freqMHz, num);
    const toa = estimateTOA(heightM, freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, num, C, feedZ, gain, fb, fs, toa)));

    log("curtainarray-designer", "Computed curtain array design", {
        freqMHz,
        heightM,
        num,
        C,
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
export default function initCurtainArrayDesigner(root) {
    const btn = $(root, "#curtain-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#curtain-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, and configuration, then click <strong>Compute Curtain Array</strong>.";
    }

    log("curtainarray-designer", "Module initialized");
}
