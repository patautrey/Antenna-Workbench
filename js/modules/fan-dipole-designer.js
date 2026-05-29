/* ---------------------------------------------------------
   Antenna Workbench — Fan Dipole Designer Module
   Multi-leg fan dipole lengths, interaction detuning,
   height analysis, and SWR envelope estimation
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
function $all(root, sel) { return Array.from(root.querySelectorAll(sel)); }

/* ---------------------------------------------------------
   DETUNING MODEL
   When multiple legs are present, each leg is shortened slightly.
--------------------------------------------------------- */
function detuneLength(baseLength, legCount) {
    if (legCount <= 1) return baseLength;
    const factor = 1 - (legCount - 1) * 0.015; // 1.5% per additional leg
    return baseLength * factor;
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
   FEEDPOINT IMPEDANCE ESTIMATION
--------------------------------------------------------- */
function estimateFeedpointZ(legCount) {
    // More legs → slightly lower feedpoint Z
    return 72 - (legCount - 1) * 4; // 72Ω baseline for a single dipole
}

/* ---------------------------------------------------------
   SWR ENVELOPE
--------------------------------------------------------- */
function estimateSWR(freqMHz, feedZ) {
    const z0 = 50;
    const mismatch = Math.abs(feedZ - z0) / z0;
    const base = 1 + mismatch * 2;
    const freqPenalty = Math.abs(freqMHz - 14.2) * 0.02;
    return base + freqPenalty;
}

/* ---------------------------------------------------------
   LENGTH CALCULATION FOR EACH LEG
--------------------------------------------------------- */
function computeLegLengths(freqList) {
    return freqList.map(freq => {
        const lambda = wavelength(freq);
        const half = lambda / 2;
        return { freq, half };
    });
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(heightM, legs, detuned, feedZ, swr) {
    const lines = [];

    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, legs[0].freq)}`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated SWR envelope:</strong> ${round(swr, 2)} : 1`);
    lines.push(`<strong>Leg count:</strong> ${legs.length}`);

    lines.push("<hr>");

    legs.forEach((leg, i) => {
        lines.push(`<strong>Leg ${i + 1}:</strong> ${round(leg.freq, 2)} MHz → ${round(detuned[i], 2)} m`);
    });

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Note: Fan dipoles require careful spacing between legs to avoid excessive coupling.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStrList, heightStr) {
    const errors = [];

    freqStrList.forEach((f, i) => {
        const err = requireFrequency(f, `Leg ${i + 1} frequency`);
        if (err) errors.push(err);
    });

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqInputs = $all(root, ".fan-leg-freq");
    const heightStr = $(root, "#fan-height").value;
    const summaryHost = $(root, "#fan-summary");

    const freqStrList = freqInputs.map(i => i.value);

    const errors = validate(freqStrList, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqList = freqStrList.map(toNumber);
    const heightM = toNumber(heightStr);

    const legs = computeLegLengths(freqList);
    const legCount = legs.length;

    const detuned = legs.map(l => detuneLength(l.half, legCount));

    const feedZ = estimateFeedpointZ(legCount);
    const swr = estimateSWR(freqList[0], feedZ);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(heightM, legs, detuned, feedZ, swr)));

    log("fan-dipole-designer", "Computed fan dipole design", {
        freqList,
        heightM,
        legs,
        detuned,
        feedZ,
        swr
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initFanDipoleDesigner(root) {
    const btn = $(root, "#fan-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#fan-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter leg frequencies and height, then click <strong>Compute Fan Dipole</strong>.";
    }

    log("fan-dipole-designer", "Module initialized");
}
