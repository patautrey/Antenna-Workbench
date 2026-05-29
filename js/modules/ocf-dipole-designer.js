/* ---------------------------------------------------------
   Antenna Workbench — OCF Dipole Designer Module
   Off-center-fed dipole lengths, split ratios, feedpoint Z,
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
   COMMON SPLIT RATIOS
--------------------------------------------------------- */
const SPLITS = {
    "33_67": { a: 0.33, b: 0.67, label: "33% / 67% (classic 80/20 OCF)" },
    "20_80": { a: 0.20, b: 0.80, label: "20% / 80% (40/20 OCF)" },
    "28_72": { a: 0.28, b: 0.72, label: "28% / 72% (40/15/10 OCF)" },
    "custom": { a: null, b: null, label: "Custom split" }
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(splitA) {
    // Classic OCF feedpoint Z ranges 150–300Ω depending on split
    return 150 + (splitA - 0.2) * 600; // crude but useful
}

/* ---------------------------------------------------------
   SWR ENVELOPE
--------------------------------------------------------- */
function estimateSWR(feedZ) {
    const z0 = 50;
    const mismatch = Math.abs(feedZ - z0) / z0;
    return 1 + mismatch * 2.2;
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
   LENGTH CALCULATION
--------------------------------------------------------- */
function computeOCFLengths(freqMHz, splitA, splitB) {
    const lambda = wavelength(freqMHz);
    const half = lambda / 2;

    return {
        lambda,
        half,
        legA: half * splitA,
        legB: half * splitB
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, splitLabel, L, feedZ, swr) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Split ratio:</strong> ${splitLabel}`);
    lines.push(`<strong>Leg A length:</strong> ${round(L.legA, 2)} m`);
    lines.push(`<strong>Leg B length:</strong> ${round(L.legB, 2)} m`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated SWR envelope:</strong> ${round(swr, 2)} : 1`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Note: OCF dipoles often require a good 1:4 or 1:6 balun and careful
                common‑mode current management.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStr, heightStr, splitA, splitB, isCustom) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    if (isCustom) {
        if (splitA <= 0 || splitA >= 1) errors.push("Custom split A must be between 0 and 1.");
        if (splitB <= 0 || splitB >= 1) errors.push("Custom split B must be between 0 and 1.");
        if (Math.abs((splitA + splitB) - 1) > 0.01)
            errors.push("Custom splits must sum to 1.0.");
    }

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#ocf-freq").value;
    const heightStr = $(root, "#ocf-height").value;
    const splitKey = $(root, "#ocf-split").value;
    const summaryHost = $(root, "#ocf-summary");

    let splitA, splitB, splitLabel;

    if (splitKey === "custom") {
        splitA = toNumber($(root, "#ocf-splitA").value);
        splitB = toNumber($(root, "#ocf-splitB").value);
        splitLabel = `Custom (${round(splitA * 100, 1)}% / ${round(splitB * 100, 1)}%)`;
    } else {
        splitA = SPLITS[splitKey].a;
        splitB = SPLITS[splitKey].b;
        splitLabel = SPLITS[splitKey].label;
    }

    const errors = validate(freqStr, heightStr, splitA, splitB, splitKey === "custom");
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const L = computeOCFLengths(freqMHz, splitA, splitB);
    const feedZ = estimateFeedZ(splitA);
    const swr = estimateSWR(feedZ);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, splitLabel, L, feedZ, swr)));

    log("ocf-dipole-designer", "Computed OCF dipole design", {
        freqMHz,
        heightM,
        splitA,
        splitB,
        feedZ,
        swr
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initOCFDipoleDesigner(root) {
    const btn = $(root, "#ocf-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#ocf-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, and split ratio, then click <strong>Compute OCF Dipole</strong>.";
    }

    log("ocf-dipole-designer", "Module initialized");
}
