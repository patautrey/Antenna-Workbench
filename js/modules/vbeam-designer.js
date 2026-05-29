/* ---------------------------------------------------------
   Antenna Workbench — V-Beam Antenna Designer
   Geometry, leg length, V-angle, termination, gain,
   beamwidth, feedpoint Z, TOA, and height analysis
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
    // V-beam termination slightly lower than rhombic
    return 400 + Math.min(250, legM * 0.35);
}

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz, angleDeg, terminated) {
    const base = 500 - (angleDeg * 1.8);
    return terminated ? base * 0.9 : base * 1.15;
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM, legM, angleDeg, terminated) {
    const base = terminated ? 6.0 : 6.5;
    const lengthBoost = Math.min(legM / 120, 2.5);
    const angleBoost = (angleDeg - 30) * 0.03; // wider V = broader beam, slightly less gain
    const heightFactor = Math.min(heightM / 18, 1.0) * 1.8;
    const freqFactor = (freqMHz - 14.2) * 0.02;
    return base + lengthBoost + heightFactor + freqFactor - angleBoost;
}

/* ---------------------------------------------------------
   BEAMWIDTH MODEL
--------------------------------------------------------- */
function estimateBeamwidth(legM, angleDeg) {
    return Math.max(25, 90 - legM * 0.08 + (angleDeg - 40) * 0.2);
}

/* ---------------------------------------------------------
   TAKEOFF ANGLE MODEL
--------------------------------------------------------- */
function estimateTOA(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.5) return 24;
    if (frac < 1.0) return 17;
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
function computeVBeam(freqMHz, legM, angleDeg) {
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
function buildSummary(freqMHz, heightM, terminated, V, feedZ, termZ, gain, bw, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const termLabel = terminated ? "Terminated (unidirectional)" : "Unterminated (bi-directional)";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Configuration:</strong> V-Beam — ${termLabel}`);
    lines.push(`<strong>Leg length:</strong> ${round(V.leg, 2)} m`);
    lines.push(`<strong>Included V-angle:</strong> ${round(V.angle, 1)}°`);
    lines.push(`<strong>Half-span:</strong> ${round(V.halfSpan, 2)} m`);
    lines.push(`<strong>Forward offset:</strong> ${round(V.forwardOffset, 2)} m`);
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
                V-Beams offer strong long-haul DX performance with simpler supports than rhombics,
                producing a clean, narrow beam with excellent low-angle response.
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

    const aErr = requirePositive(angleStr, "Included V-angle");
    if (aErr) errors.push(aErr);

    const angle = Number(angleStr);
    if (angle < 20 || angle > 120) errors.push("V-angle must be between 20° and 120°.");

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root, "#vbeam-freq").value;
    const heightStr = $(root, "#vbeam-height").value;
    const legStr = $(root, "#vbeam-leg").value;
    const angleStr = $(root, "#vbeam-angle").value;
    const terminatedStr = $(root, "#vbeam-terminated").value;
    const summaryHost = $(root, "#vbeam-summary");

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

    const V = computeVBeam(freqMHz, legM, angleDeg);
    const feedZ = estimateFeedZ(freqMHz, angleDeg, terminated);
    const termZ = estimateTermination(freqMHz, legM, terminated);
    const gain = estimateGain(freqMHz, heightM, legM, angleDeg, terminated);
    const bw = estimateBeamwidth(legM, angleDeg);
    const toa = estimateTOA(heightM, freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, heightM, terminated, V, feedZ, termZ, gain, bw, toa)));

    log("vbeam-designer", "Computed V-Beam design", {
        freqMHz,
        heightM,
        V,
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
export default function initVBeamDesigner(root) {
    const btn = $(root, "#vbeam-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#vbeam-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter frequency, height, leg length, V-angle, and termination, then click <strong>Compute V-Beam</strong>.";
    }

    log("vbeam-designer", "Module initialized");
}
