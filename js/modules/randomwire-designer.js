/* ---------------------------------------------------------
   Antenna Workbench — Random Wire Designer
   Resonance prediction, good/bad lengths, counterpoise,
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
   GOOD / BAD LENGTH RULES
   Based on common EF random-wire guidelines.
--------------------------------------------------------- */
const BAD_LENGTHS = [
    0.25, 0.5, 1.0, 1.5, 2.0   // avoid exact multiples of 1/4 λ
];

function classifyLength(freqMHz, wireM) {
    const lambda = wavelength(freqMHz);
    const frac = wireM / lambda;

    for (const bad of BAD_LENGTHS) {
        if (Math.abs(frac - bad) < 0.03) {
            return {
                ok: false,
                reason: `Length is near ${bad} λ — high feedpoint impedance and tuning difficulty likely.`
            };
        }
    }

    return {
        ok: true,
        reason: "Length avoids major resonance traps — tuner-friendly."
    };
}

/* ---------------------------------------------------------
   COUNTERPOISE MODEL
--------------------------------------------------------- */
function estimateCounterpoise(freqMHz) {
    const lambda = wavelength(freqMHz);
    return lambda * 0.05; // 5% of λ is a common starting point
}

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz, wireM) {
    const lambda = wavelength(freqMHz);
    const frac = wireM / lambda;

    // Very approximate: random wires vary widely
    if (frac < 0.2) return 200;
    if (frac < 0.5) return 400;
    if (frac < 1.0) return 800;
    return 1200;
}

/* ---------------------------------------------------------
   SWR ENVELOPE
--------------------------------------------------------- */
function estimateSWR(feedZ) {
    const z0 = 50;
    const mismatch = Math.abs(feedZ - z0) / z0;
    return 1 + mismatch * 2.5;
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
function buildSummary(freqMHz, wireM, heightM, cpM, feedZ, swr, classInfo) {
    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz`);
    lines.push(`<strong>Wire length:</strong> ${round(wireM, 2)} m`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Counterpoise length (suggested):</strong> ${round(cpM, 2)} m`);
    lines.push(`<strong>Feedpoint impedance (est.):</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated SWR envelope:</strong> ${round(swr, 2)} : 1`);

    if (classInfo.ok) {
        lines.push(`<strong>Length classification:</strong> <span style="color:#4da3ff;">Good</span> — ${classInfo.reason}`);
    } else {
        lines.push(`<strong>Length classification:</strong> <span style="color:#ff4444;">Avoid</span> — ${classInfo.reason}`);
    }

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Random wires are highly tuner-dependent. Avoid exact 1/4 λ multiples.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStr, wireStr, heightStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Frequency");
    if (fErr) errors.push(fErr);

    const wErr = requirePositive(wireStr, "Wire length");
    if (wErr) errors.push(wErr);

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#rw-freq").value;
    const wireStr = $(root, "#rw-wire").value;
    const heightStr = $(root, "#rw-height").value;
    const summaryHost = $(root, "#rw-summary");

    const errors = validate(freqStr, wireStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const wireM = toNumber(wireStr);
    const heightM = toNumber(heightStr);

    const cpM = estimateCounterpoise(freqMHz);
    const feedZ = estimateFeedZ(freqMHz, wireM);
    const swr = estimateSWR(feedZ);
    const classInfo = classifyLength(freqMHz, wireM);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, wireM, heightM, cpM, feedZ, swr, classInfo)));

    log("randomwire-designer", "Computed random wire design", {
        freqMHz,
        wireM,
        heightM,
        cpM,
        feedZ,
        swr,
        classInfo
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initRandomWireDesigner(root) {
    const btn = $(root, "#rw-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#rw-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, wire length, and height, then click <strong>Compute Random Wire</strong>.";
    }

    log("randomwire-designer", "Module initialized");
}
