/* ---------------------------------------------------------
   Antenna Workbench — Doublet Designer Module
   Multi-band doublet lengths, feedline modeling,
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
   FEEDLINE MODELS
--------------------------------------------------------- */
const FEEDLINES = {
    "450": { z0: 450, lossDb: 0.2 },
    "300": { z0: 300, lossDb: 0.35 },
    "600": { z0: 600, lossDb: 0.15 },
    "open": { z0: 550, lossDb: 0.1 }
};

/* ---------------------------------------------------------
   LENGTH CALCULATION
--------------------------------------------------------- */
function computeDoubletLengths(freqMHz) {
    const lambda = wavelength(freqMHz);

    return {
        lambda,
        half: lambda / 2,
        full: lambda,
        multi: lambda * 0.48 // common multi-band compromise
    };
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
   SWR ENVELOPE ESTIMATION
--------------------------------------------------------- */
function estimateSWREnvelope(freqMHz, feedKey) {
    const f = FEEDLINES[feedKey] || FEEDLINES["450"];

    // Very approximate SWR envelope
    const base = 1.5;
    const mismatch = Math.abs(f.z0 - 450) * 0.002;
    const freqPenalty = Math.abs(freqMHz - 14.2) * 0.03;

    return base + mismatch + freqPenalty;
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, feedKey, L) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const feed = FEEDLINES[feedKey];
    const swr = estimateSWREnvelope(freqMHz, feedKey);
    const heightRegion = analyzeHeight(heightM, freqMHz);

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${heightRegion}`);
    lines.push(`<strong>Feedline:</strong> ${feedKey} Ω (loss ≈ ${feed.lossDb} dB / 100 ft)`);
    lines.push(`<strong>Half‑wave length:</strong> ${round(L.half, 2)} m`);
    lines.push(`<strong>Full‑wave length:</strong> ${round(L.full, 2)} m`);
    lines.push(`<strong>Multi‑band compromise length:</strong> <span style="color:#4da3ff;">${round(L.multi, 2)} m</span>`);
    lines.push(`<strong>Estimated SWR envelope:</strong> ${round(swr, 2)} : 1`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Note: Doublets are extremely flexible. Feedline length, height, and tuner quality
                strongly influence multi‑band performance.
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
    const freqStr = $(root, "#dblt-freq").value;
    const heightStr = $(root, "#dblt-height").value;
    const feedKey = $(root, "#dblt-feedline").value;
    const summaryHost = $(root, "#dblt-summary");

    const errors = validate(freqStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const L = computeDoubletLengths(freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, feedKey, L)));

    log("doublet-designer", "Computed doublet design", { freqMHz, heightM, feedKey, L });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initDoubletDesigner(root) {
    const btn = $(root, "#dblt-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#dblt-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency and height, then click <strong>Compute Doublet</strong>.";
    }

    log("doublet-designer", "Module initialized");
}
