/* ---------------------------------------------------------
   Antenna Workbench — EFHW Designer Module
   49:1 EFHW resonant lengths, transformer behavior,
   wire VF, slope correction, and SWR estimation
--------------------------------------------------------- */

import { wavelength, round } from "../utils.js";
import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";

/* ---------------------------------------------------------
   DOM HELPERS (scoped)
--------------------------------------------------------- */
function $(root, sel) { return root.querySelector(sel); }
function $all(root, sel) { return Array.from(root.querySelectorAll(sel)); }

/* ---------------------------------------------------------
   VELOCITY FACTORS
--------------------------------------------------------- */
const VF = {
    bare: 0.98,
    insulated: 0.95,
    speaker: 0.93,
    enamel: 0.97
};

/* ---------------------------------------------------------
   TRANSFORMER MODELS (approximate)
--------------------------------------------------------- */
const TRANSFORMERS = {
    "49:1": { zRatio: 49, lossDb: 0.8 },
    "64:1": { zRatio: 64, lossDb: 1.2 },
    "81:1": { zRatio: 81, lossDb: 1.6 }
};

/* ---------------------------------------------------------
   LENGTH CALCULATION
--------------------------------------------------------- */
function computeLengths(freqMHz, vf) {
    const lambda = wavelength(freqMHz);
    const half = lambda / 2;
    const adjusted = half * vf;

    return {
        lambda,
        half,
        adjusted
    };
}

/* ---------------------------------------------------------
   SLOPE / HEIGHT CORRECTION
--------------------------------------------------------- */
function slopeCorrection(adjustedLength, endHeightM) {
    if (endHeightM >= 6) return adjustedLength; // minimal effect

    const factor = 1 + (6 - endHeightM) * 0.01; // 1% per meter below 6m
    return adjustedLength * factor;
}

/* ---------------------------------------------------------
   TRANSFORMER / SWR ESTIMATION
--------------------------------------------------------- */
function estimateSWR(freqMHz, transformerKey) {
    const t = TRANSFORMERS[transformerKey] || TRANSFORMERS["49:1"];

    // Very approximate SWR model
    const baseSWR = 1.2;
    const mismatch = (t.zRatio - 49) * 0.02; // deviation penalty
    const freqPenalty = Math.abs(freqMHz - 14.2) * 0.03; // off‑center penalty

    return baseSWR + mismatch + freqPenalty;
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, vfKey, endHeightM, transformerKey, L) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const swr = estimateSWR(freqMHz, transformerKey);
    const t = TRANSFORMERS[transformerKey];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Wire VF:</strong> ${vfKey} (${VF[vfKey]})`);
    lines.push(`<strong>End height:</strong> ${round(endHeightM, 2)} m`);
    lines.push(`<strong>Transformer:</strong> ${transformerKey} (loss ≈ ${t.lossDb} dB)`);
    lines.push(`<strong>Half‑wave length (free‑space):</strong> ${round(L.half, 2)} m`);
    lines.push(`<strong>Adjusted for VF:</strong> ${round(L.adjusted, 2)} m`);
    lines.push(`<strong>Adjusted for slope/height:</strong> <span style="color:#4da3ff;">${round(L.corrected, 2)} m</span>`);
    lines.push(`<strong>Estimated SWR:</strong> ${round(swr, 2)} : 1`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Note: EFHW tuning is highly sensitive to end height, wire routing, and transformer quality.
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

    const hErr = requirePositive(heightStr, "End height");
    if (hErr) errors.push(hErr);

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#efhw-freq").value;
    const vfKey = $(root, "#efhw-vf").value;
    const endHeightStr = $(root, "#efhw-height").value;
    const transformerKey = $(root, "#efhw-transformer").value;
    const summaryHost = $(root, "#efhw-summary");

    const errors = validate(freqStr, endHeightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const endHeightM = toNumber(endHeightStr);
    const vf = VF[vfKey] || 0.95;

    const L = computeLengths(freqMHz, vf);
    L.corrected = slopeCorrection(L.adjusted, endHeightM);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, vfKey, endHeightM, transformerKey, L)));

    log("efhw-designer", "Computed EFHW design", { freqMHz, endHeightM, vfKey, transformerKey, L });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initEFHWDesigner(root) {
    const btn = $(root, "#efhw-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#efhw-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency and height, then click <strong>Compute EFHW</strong>.";
    }

    log("efhw-designer", "Module initialized");
}
