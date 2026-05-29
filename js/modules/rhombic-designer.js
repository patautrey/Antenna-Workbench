/* ---------------------------------------------------------
   Antenna Workbench — Rhombic Antenna Designer
   Geometry, leg length, angle, termination, gain, beamwidth,
   feedpoint Z, TOA, and height analysis
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
   TERMINATION MODEL
--------------------------------------------------------- */
function estimateTermination(freqMHz, legM) {
    // Typical rhombic termination ~600–900Ω
    return 600 + (legM * 0.5);
}

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz, angleDeg) {
    // Feedpoint Z varies with included angle
    return 600 - (angleDeg * 2.5);
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM, legM) {
    const base = 7.0; // baseline
    const lengthBoost = Math.min(legM / 100, 3.0); // long legs = big gain
    const heightFactor = Math.min(heightM / 20, 1.0) * 2.0;
    const freqFactor = (freqMHz - 14.2) * 0.02;
    return base + lengthBoost + heightFactor + freqFactor;
}

/* ---------------------------------------------------------
   BEAMWIDTH MODEL
--------------------------------------------------------- */
function estimateBeamwidth(legM) {
    return Math.max(15, 60 - legM * 0.1);
}

/* ---------------------------------------------------------
   TAKEOFF ANGLE MODEL
--------------------------------------------------------- */
function estimateTOA(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.5) return 24;
    if (frac < 1.0) return 18;
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
function computeRhombic(freqMHz, legM, angleDeg) {
    const lambda = wavelength(freqMHz);

    const halfSpan = legM * Math.sin(angleDeg * Math.PI / 180);
    const forwardOffset = legM * Math.cos(angleDeg * Math.PI / 180);

    return {
        lambda,
        leg: legM,
        angle: angleDeg,
        halfSpan,
        forwardOffset
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, R, feedZ, termZ, gain, bw, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Leg length:</strong> ${round(R.leg, 2)} m`);
    lines.push(`<strong>Included angle:</strong> ${round(R.angle, 1)}°`);
    lines.push(`<strong>Half-span:</strong> ${round(R.halfSpan, 2)} m`);
    lines.push(`<strong>Forward offset:</strong> ${round(R.forwardOffset, 2)} m`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Termination resistor:</strong> ${round(termZ, 1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated beamwidth:</strong> ${round(bw, 1)}°`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa, 1)}°`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Rhombic antennas deliver exceptional long-haul DX performance with narrow beams and high gain.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStr, heightStr, legStr, angleStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    const lErr = requirePositive(legStr, "Leg length");
    if (lErr) errors.push(lErr);

    const aErr = requirePositive(angleStr, "Included angle");
    if (aErr) errors.push(aErr);

    const angle = Number(angleStr);
    if (angle < 20 || angle > 80) errors.push("Included angle must be between 20° and 80°.");

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#rhombic-freq").value;
    const heightStr = $(root, "#rhombic-height").value;
    const legStr = $(root, "#rhombic-leg").value;
    const angleStr = $(root, "#rhombic-angle").value;
    const summaryHost = $(root, "#rhombic-summary");

    const errors = validate(freqStr, heightStr, legStr, angleStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const legM = toNumber(legStr);
    const angleDeg = toNumber(angleStr);

    const R = computeRhombic(freqMHz, legM, angleDeg);
    const feedZ = estimateFeedZ(freqMHz, angleDeg);
    const termZ = estimateTermination(freqMHz, legM);
    const gain = estimateGain(freqMHz, heightM, legM);
    const bw = estimateBeamwidth(legM);
    const toa = estimateTOA(heightM, freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, R, feedZ, termZ, gain, bw, toa)));

    log("rhombic-designer", "Computed rhombic design", {
        freqMHz,
        heightM,
        R,
        feedZ,
        termZ,
        gain,
        bw,
        toa
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initRhombicDesigner(root) {
    const btn = $(root, "#rhombic-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#rhombic-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, leg length, and angle, then click <strong>Compute Rhombic</strong>.";
    }

    log("rhombic-designer", "Module initialized");
}
