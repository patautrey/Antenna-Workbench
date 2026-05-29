/* ---------------------------------------------------------
   Antenna Workbench — Half-Rhombic Antenna Designer
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
function estimateTermination(freqMHz, legM, terminated) {
    if (!terminated) return 0;
    // Typical half-rhombic termination somewhat lower than full rhombic
    return 450 + (legM * 0.4);
}

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz, angleDeg, terminated) {
    // Feedpoint Z varies with included angle and termination
    const base = 500 - (angleDeg * 2.0);
    return terminated ? base * 0.9 : base * 1.1;
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM, legM, terminated) {
    // Half-rhombic: less aperture than full rhombic, but still strong DX
    const base = terminated ? 5.5 : 6.0;
    const lengthBoost = Math.min(legM / 80, 2.5);
    const heightFactor = Math.min(heightM / 18, 1.0) * 1.8;
    const freqFactor = (freqMHz - 14.2) * 0.02;
    return base + lengthBoost + heightFactor + freqFactor;
}

/* ---------------------------------------------------------
   BEAMWIDTH MODEL
--------------------------------------------------------- */
function estimateBeamwidth(legM) {
    // Half-rhombic has wider beam than full rhombic
    return Math.max(20, 75 - legM * 0.12);
}

/* ---------------------------------------------------------
   TAKEOFF ANGLE MODEL
--------------------------------------------------------- */
function estimateTOA(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.5) return 26;
    if (frac < 1.0) return 19;
    return 13;
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
   Half-rhombic: one long sloping leg, reflection from ground
--------------------------------------------------------- */
function computeHalfRhombic(freqMHz, legM, angleDeg) {
    const lambda = wavelength(freqMHz);

    const span = legM * Math.sin(angleDeg * Math.PI / 180);
    const forwardOffset = legM * Math.cos(angleDeg * Math.PI / 180);

    return {
        lambda,
        leg: legM,
        angle: angleDeg,
        span,
        forwardOffset
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, terminated, H, feedZ, termZ, gain, bw, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const termLabel = terminated ? "Terminated (unidirectional)" : "Unterminated (bi-directional)";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Configuration:</strong> Half-rhombic — ${termLabel}`);
    lines.push(`<strong>Leg length:</strong> ${round(H.leg, 2)} m`);
    lines.push(`<strong>Included angle:</strong> ${round(H.angle, 1)}°`);
    lines.push(`<strong>Span (horizontal projection):</strong> ${round(H.span, 2)} m`);
    lines.push(`<strong>Forward offset:</strong> ${round(H.forwardOffset, 2)} m`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM, 2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM, freqMHz)}`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ, 1)} Ω`);
    if (terminated) {
        lines.push(`<strong>Termination resistor:</strong> ${round(termZ, 1)} Ω`);
    } else {
        lines.push(`<strong>Termination resistor:</strong> none (unterminated)`);
    }
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain, 1)} dBi`);
    lines.push(`<strong>Estimated beamwidth:</strong> ${round(bw, 1)}°`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa, 1)}°`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Half-rhombic antennas offer strong long-haul DX performance with simpler supports than a full rhombic,
                trading a bit of gain for easier deployment and wider beamwidth.
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
    if (angle < 15 || angle > 80) errors.push("Included angle must be between 15° and 80°.");

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#halfrhombic-freq").value;
    const heightStr = $(root, "#halfrhombic-height").value;
    const legStr = $(root, "#halfrhombic-leg").value;
    const angleStr = $(root, "#halfrhombic-angle").value;
    const terminatedStr = $(root, "#halfrhombic-terminated").value;
    const summaryHost = $(root, "#halfrhombic-summary");

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
    const terminated = terminatedStr === "yes";

    const H = computeHalfRhombic(freqMHz, legM, angleDeg);
    const feedZ = estimateFeedZ(freqMHz, angleDeg, terminated);
    const termZ = estimateTermination(freqMHz, legM, terminated);
    const gain = estimateGain(freqMHz, heightM, legM, terminated);
    const bw = estimateBeamwidth(legM);
    const toa = estimateTOA(heightM, freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, terminated, H, feedZ, termZ, gain, bw, toa)));

    log("half-rhombic-designer", "Computed half-rhombic design", {
        freqMHz,
        heightM,
        H,
        terminated,
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
export default function initHalfRhombicDesigner(root) {
    const btn = $(root, "#halfrhombic-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#halfrhombic-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter frequency, height, leg length, angle, and termination, then click <strong>Compute Half‑Rhombic</strong>.";
    }

    log("half-rhombic-designer", "Module initialized");
}
