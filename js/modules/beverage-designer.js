/* ---------------------------------------------------------
   Antenna Workbench — Beverage Antenna Designer
   Longwire receive antenna: length, height, term, gain,
   beamwidth, TOA, and basic pattern notes
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
function estimateTermination(freqMHz, lengthM, terminated) {
    if (!terminated) return 0;
    // Typical Beverage termination ~400–800 Ω
    return 450 + Math.min(300, lengthM * 0.4);
}

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz, lengthM, heightM) {
    // Very rough receive-only model, typically a few hundred ohms
    const base = 450;
    const lengthFactor = Math.min(lengthM / 300, 1.0) * 80;
    const heightFactor = Math.min(heightM / 3, 1.0) * -40;
    return base + lengthFactor + heightFactor;
}

/* ---------------------------------------------------------
   GAIN / SNR MODEL (RELATIVE)
--------------------------------------------------------- */
function estimateGain(freqMHz, lengthM) {
    // Beverage is about SNR, not absolute gain; treat as relative "effective gain"
    const base = -10; // dBi-ish receive reference
    const lengthBoost = Math.min(lengthM / 200, 2.0) * 3.0;
    const freqFactor = (freqMHz - 3.5) * -0.5; // better relatively at lower HF
    return base + lengthBoost + freqFactor;
}

/* ---------------------------------------------------------
   BEAMWIDTH MODEL
--------------------------------------------------------- */
function estimateBeamwidth(lengthM) {
    // Longer Beverage = narrower beam
    return Math.max(40, 120 - lengthM * 0.1);
}

/* ---------------------------------------------------------
   TAKEOFF ANGLE MODEL
--------------------------------------------------------- */
function estimateTOA(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.05) return 35;
    if (frac < 0.1) return 30;
    return 25;
}

/* ---------------------------------------------------------
   HEIGHT REGION ANALYSIS
--------------------------------------------------------- */
function analyzeHeight(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.05)
        return "Very low (<0.05 λ): classic Beverage height, strong low-angle reception.";
    if (frac < 0.1)
        return "Low (0.05–0.1 λ): good Beverage performance.";
    return "High (>0.1 λ): less ideal; pattern begins to change.";
}

/* ---------------------------------------------------------
   GEOMETRY CALCULATION
--------------------------------------------------------- */
function computeBeverage(freqMHz, lengthM, azimuthDeg) {
    const lambda = wavelength(freqMHz);

    return {
        lambda,
        length: lengthM,
        azimuth: azimuthDeg
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, terminated, B, feedZ, termZ, gain, bw, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const termLabel = terminated ? "Terminated (unidirectional)" : "Unterminated (bi-directional)";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Configuration:</strong> Beverage — ${termLabel}`);
    lines.push(`<strong>Wire length:</strong> ${round(B.length, 1)} m`);
    lines.push(`<strong>Azimuth (wire direction):</strong> ${round(B.azimuth, 1)}°`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Feedpoint impedance (est.):</strong> ${round(feedZ, 1)} Ω`);
    if (terminated) {
        lines.push(`<strong>Termination resistor (est.):</strong> ${round(termZ, 1)} Ω`);
    } else {
        lines.push(`<strong>Termination resistor:</strong> none (unterminated)`);
    }
    lines.push(`<strong>Relative effective gain (receive):</strong> ${round(gain, 1)} dB`);
    lines.push(`<strong>Estimated beamwidth:</strong> ${round(bw, 1)}°`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa, 1)}°`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Beverage antennas are long, low receive antennas optimized for low-angle, low-noise HF reception,
                especially on the low bands (160–40 m).
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStr, heightStr, lengthStr, azimuthStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    const lErr = requirePositive(lengthStr, "Wire length");
    if (lErr) errors.push(lErr);

    const aErr = requirePositive(azimuthStr, "Azimuth");
    if (aErr) errors.push(aErr);

    const az = Number(azimuthStr);
    if (az < 0 || az >= 360) errors.push("Azimuth must be between 0° and 359°.");

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#bev-freq").value;
    const heightStr = $(root, "#bev-height").value;
    const lengthStr = $(root, "#bev-length").value;
    const azimuthStr = $(root, "#bev-azimuth").value;
    const terminatedStr = $(root, "#bev-terminated").value;
    const summaryHost = $(root, "#bev-summary");

    const errors = validate(freqStr, heightStr, lengthStr, azimuthStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const lengthM = toNumber(lengthStr);
    const azimuthDeg = toNumber(azimuthStr);
    const terminated = terminatedStr === "yes";

    const B = computeBeverage(freqMHz, lengthM, azimuthDeg);
    const feedZ = estimateFeedZ(freqMHz, lengthM, heightM);
    const termZ = estimateTermination(freqMHz, lengthM, terminated);
    const gain = estimateGain(freqMHz, lengthM);
    const bw = estimateBeamwidth(lengthM);
    const toa = estimateTOA(heightM, freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, terminated, B, feedZ, termZ, gain, bw, toa)));

    log("beverage-designer", "Computed Beverage design", {
        freqMHz,
        heightM,
        lengthM,
        azimuthDeg,
        terminated,
        B,
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
export default function initBeverageDesigner(root) {
    const btn = $(root, "#bev-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#bev-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter frequency, height, length, azimuth, and termination, then click <strong>Compute Beverage</strong>.";
    }

    log("beverage-designer", "Module initialized");
}
