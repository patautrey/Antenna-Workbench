/* ---------------------------------------------------------
   Antenna Workbench — Rybakov Vertical Designer
   Radiator length, transformer ratio, counterpoise,
   feedpoint Z, SWR envelope, and height analysis
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
   TRANSFORMER MODELS
--------------------------------------------------------- */
const TRANSFORMERS = {
    "4:1":  { zRatio: 4,  lossDb: 0.4 },
    "9:1":  { zRatio: 9,  lossDb: 0.7 },
    "16:1": { zRatio: 16, lossDb: 1.0 }
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz, radiatorM) {
    const lambda = wavelength(freqMHz);
    const frac = radiatorM / lambda;

    // Very approximate Rybakov impedance behavior
    if (frac < 0.15) return 150;
    if (frac < 0.25) return 300;
    if (frac < 0.5)  return 600;
    return 900;
}

/* ---------------------------------------------------------
   COUNTERPOISE MODEL
--------------------------------------------------------- */
function estimateCounterpoise(freqMHz) {
    const lambda = wavelength(freqMHz);
    return lambda * 0.05; // 5% of λ is a common starting point
}

/* ---------------------------------------------------------
   SWR ENVELOPE
--------------------------------------------------------- */
function estimateSWR(feedZ, transformerKey) {
    const t = TRANSFORMERS[transformerKey];
    const z0 = 50 * t.zRatio;
    const mismatch = Math.abs(feedZ - z0) / z0;
    return 1 + mismatch * 2.0;
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
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, radiatorM, heightM, transformerKey, cpM, feedZ, swr) {
    const t = TRANSFORMERS[transformerKey];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz`);
    lines.push(`<strong>Radiator length:</strong> ${round(radiatorM, 2)} m`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Transformer:</strong> ${transformerKey} (loss ≈ ${t.lossDb} dB)`);
    lines.push(`<strong>Counterpoise length (suggested):</strong> ${round(cpM, 2)} m`);
    lines.push(`<strong>Feedpoint impedance (est.):</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated SWR envelope:</strong> ${round(swr, 2)} : 1`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Rybakov verticals are simple, effective multi-band antennas when paired with a good transformer and tuner.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStr, radiatorStr, heightStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Frequency");
    if (fErr) errors.push(fErr);

    const rErr = requirePositive(radiatorStr, "Radiator length");
    if (rErr) errors.push(rErr);

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#ryb-freq").value;
    const radiatorStr = $(root, "#ryb-radiator").value;
    const heightStr = $(root, "#ryb-height").value;
    const transformerKey = $(root, "#ryb-transformer").value;
    const summaryHost = $(root, "#ryb-summary");

    const errors = validate(freqStr, radiatorStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const radiatorM = toNumber(radiatorStr);
    const heightM = toNumber(heightStr);

    const cpM = estimateCounterpoise(freqMHz);
    const feedZ = estimateFeedZ(freqMHz, radiatorM);
    const swr = estimateSWR(feedZ, transformerKey);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, radiatorM, heightM, transformerKey, cpM, feedZ, swr)));

    log("rybakov-designer", "Computed Rybakov design", {
        freqMHz,
        radiatorM,
        heightM,
        transformerKey,
        cpM,
        feedZ,
        swr
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initRybakovDesigner(root) {
    const btn = $(root, "#ryb-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#ryb-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, radiator length, height, and transformer ratio, then click <strong>Compute Rybakov</strong>.";
    }

    log("rybakov-designer", "Module initialized");
}
