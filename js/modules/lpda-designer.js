/* ---------------------------------------------------------
   Antenna Workbench — Log-Periodic Dipole Array (LPDA) Designer
   Tau, sigma, element lengths, spacing, boom length,
   gain, F/B, feedpoint Z, and height analysis
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
   DEFAULT LPDA PARAMETERS
--------------------------------------------------------- */
const DEFAULTS = {
    tau: 0.90,   // element length scaling
    sigma: 0.18  // spacing factor
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(tau, sigma) {
    // Typical LPDA feedpoint Z ~ 50–200Ω depending on tau/sigma
    return 120 * (1 - tau) + 50 * sigma;
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM, numElements) {
    const base = 4.0; // baseline
    const elementBoost = numElements * 0.35;
    const heightFactor = Math.min(heightM / 12, 1.0) * 1.0;
    const freqFactor = (freqMHz - 14.2) * 0.03;
    return base + elementBoost + heightFactor + freqFactor;
}

/* ---------------------------------------------------------
   FRONT-TO-BACK RATIO
--------------------------------------------------------- */
function estimateFB(freqMHz, numElements) {
    const base = 10 + numElements * 1.5;
    const freqFactor = (freqMHz - 14.2) * 0.15;
    return base + freqFactor;
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
function computeLPDA(freqMHz, numElements, tau, sigma) {
    const lambda = wavelength(freqMHz);

    const elements = [];
    let length = lambda * 0.48; // starting element length
    let position = 0;

    for (let i = 0; i < numElements; i++) {
        elements.push({
            type: `Element ${i + 1}`,
            length,
            position
        });

        length *= tau;
        position += sigma * length;
    }

    return {
        lambda,
        elements,
        boomLength: position
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, numElements, tau, sigma, L, feedZ, gain, fb) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Number of elements:</strong> ${numElements}`);
    lines.push(`<strong>Tau (τ):</strong> ${tau}`);
    lines.push(`<strong>Sigma (σ):</strong> ${sigma}`);
    lines.push(`<strong>Boom length:</strong> ${round(L.boomLength, 2)} m`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated F/B ratio:</strong> ${round(fb, 1)} dB`);
    lines.push(`<hr>`);

    for (const el of L.elements) {
        lines.push(`<strong>${el.type}:</strong> ${round(el.length, 2)} m @ ${round(el.position, 2)} m`);
    }

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                LPDAs provide wideband directional performance with smooth impedance and gain across the operating range.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStr, heightStr, numStr, tauStr, sigmaStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Height above ground");
    if (hErr) errors.push(hErr);

    const nErr = requirePositive(numStr, "Number of elements");
    if (nErr) errors.push(nErr);

    const n = Number(numStr);
    if (n < 3 || n > 12) errors.push("Number of elements must be between 3 and 12.");

    const tau = Number(tauStr);
    if (tau <= 0.7 || tau >= 0.98) errors.push("Tau must be between 0.70 and 0.98.");

    const sigma = Number(sigmaStr);
    if (sigma <= 0.05 || sigma >= 0.35) errors.push("Sigma must be between 0.05 and 0.35.");

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#lpda-freq").value;
    const heightStr = $(root, "#lpda-height").value;
    const numStr = $(root, "#lpda-elements").value;
    const tauStr = $(root, "#lpda-tau").value;
    const sigmaStr = $(root, "#lpda-sigma").value;
    const summaryHost = $(root, "#lpda-summary");

    const errors = validate(freqStr, heightStr, numStr, tauStr, sigmaStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const numElements = toNumber(numStr);
    const tau = toNumber(tauStr);
    const sigma = toNumber(sigmaStr);

    const L = computeLPDA(freqMHz, numElements, tau, sigma);
    const feedZ = estimateFeedZ(tau, sigma);
    const gain = estimateGain(freqMHz, heightM, numElements);
    const fb = estimateFB(freqMHz, numElements);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, numElements, tau, sigma, L, feedZ, gain, fb)));

    log("lpda-designer", "Computed LPDA design", {
        freqMHz,
        heightM,
        numElements,
        tau,
        sigma,
        L,
        feedZ,
        gain,
        fb
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initLPDADesigner(root) {
    const btn = $(root, "#lpda-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#lpda-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Enter frequency, height, tau, sigma, and number of elements, then click <strong>Compute LPDA</strong>.";
    }

    log("lpda-designer", "Module initialized");
}
