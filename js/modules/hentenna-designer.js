/* ---------------------------------------------------------
   Antenna Workbench — Hentenna Designer
   Classic Japanese rectangular loop: geometry, gain, feed Z,
   polarization mode, TOA, and height analysis
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
   GEOMETRY CONSTANTS
--------------------------------------------------------- */
// Classic Hentenna proportions:
// Height ≈ 0.5 λ
// Width  ≈ 0.25 λ
// Feedpoint offset ≈ 0.15 λ from bottom for 50 Ω match

const HENTENNA = {
    heightFactor: 0.50,
    widthFactor:  0.25,
    feedOffset:   0.15
};

/* ---------------------------------------------------------
   FEEDPOINT IMPEDANCE MODEL
--------------------------------------------------------- */
function estimateFeedZ(freqMHz, polarization) {
    // Horizontal polarization tends to be slightly higher Z
    return polarization === "horizontal" ? 65 : 50;
}

/* ---------------------------------------------------------
   GAIN MODEL
--------------------------------------------------------- */
function estimateGain(freqMHz, heightM, polarization) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    let base = 3.5; // typical Hentenna gain

    if (frac > 0.25 && frac < 0.6) base += 0.8;
    if (polarization === "horizontal") base += 0.4;

    const freqFactor = (freqMHz - 14.0) * 0.02;
    return base + freqFactor;
}

/* ---------------------------------------------------------
   TAKEOFF ANGLE MODEL
--------------------------------------------------------- */
function estimateTOA(heightM, freqMHz, polarization) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    let toa;
    if (frac < 0.25) toa = 32;
    else if (frac < 0.5) toa = 24;
    else toa = 18;

    if (polarization === "horizontal") toa -= 2;

    return toa;
}

/* ---------------------------------------------------------
   HEIGHT REGION ANALYSIS
--------------------------------------------------------- */
function analyzeHeight(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const f = heightM / lambda;

    if (f < 0.25)
        return "Low height (<0.25 λ): higher TOA, NVIS‑leaning.";
    if (f < 0.5)
        return "Moderate height (0.25–0.5 λ): balanced performance.";
    if (f < 1.0)
        return "High (0.5–1.0 λ): strong low-angle DX.";
    return "Very high (>1.0 λ): excellent DX performance.";
}

/* ---------------------------------------------------------
   GEOMETRY CALCULATION
--------------------------------------------------------- */
function computeHentenna(freqMHz) {
    const lambda = wavelength(freqMHz);

    const height = lambda * HENTENNA.heightFactor;
    const width  = lambda * HENTENNA.widthFactor;
    const feedY  = lambda * HENTENNA.feedOffset;

    return {
        lambda,
        height,
        width,
        feedY
    };
}

/* ---------------------------------------------------------
   SUMMARY BUILDER
--------------------------------------------------------- */
function buildSummary(freqMHz, heightM, polarization, H, feedZ, gain, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band
        ? `${band.name} (${band.low}–${band.high} MHz)`
        : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz,2)} MHz (${bandLabel})`);
    lines.push(`<strong>Polarization:</strong> ${polarization}`);
    lines.push(`<strong>Height above ground:</strong> ${round(heightM,2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(heightM,freqMHz)}`);
    lines.push(`<strong>Loop height:</strong> ${round(H.height,2)} m (~${round(HENTENNA.heightFactor,3)} λ)`);
    lines.push(`<strong>Loop width:</strong> ${round(H.width,2)} m (~${round(HENTENNA.widthFactor,3)} λ)`);
    lines.push(`<strong>Feedpoint offset from bottom:</strong> ${round(H.feedY,2)} m (~${round(HENTENNA.feedOffset,3)} λ)`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ,1)} Ω`);
    lines.push(`<strong>Estimated gain:</strong> ${round(gain,1)} dBi`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa,1)}°`);

    return `
        <div class="poster-preview">
            ${lines.map(l=>`<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                The Hentenna is a simple, elegant rectangular loop with excellent low-angle performance
                and a clean feedpoint match. Popular for HF and VHF DX.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(freqStr, heightStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr,"Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr,"Height above ground");
    if (hErr) errors.push(hErr);

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE HANDLER
--------------------------------------------------------- */
function handleCompute(root) {
    const freqStr = $(root,"#hent-freq").value;
    const heightStr = $(root,"#hent-height").value;
    const polStr = $(root,"#hent-pol").value;
    const summaryHost = $(root,"#hent-summary");

    const errors = validate(freqStr,heightStr);
    if (errors.length>0) {
        summaryHost.innerHTML="";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const polarization = polStr;

    const H = computeHentenna(freqMHz);
    const feedZ = estimateFeedZ(freqMHz, polarization);
    const gain = estimateGain(freqMHz, heightM, polarization);
    const toa = estimateTOA(heightM, freqMHz, polarization);

    summaryHost.innerHTML="";
    summaryHost.appendChild(
        infoBox(buildSummary(freqMHz,heightM,polarization,H,feedZ,gain,toa))
    );

    log("hentenna-designer","Computed Hentenna design",{
        freqMHz,heightM,polarization,H,feedZ,gain,toa
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
--------------------------------------------------------- */
export default function initHentennaDesigner(root) {
    const btn = $(root,"#hent-compute");
    if (btn) btn.addEventListener("click",()=>handleCompute(root));

    const summaryHost = $(root,"#hent-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter frequency, height, and polarization, then click <strong>Compute Hentenna</strong>.";
    }

    log("hentenna-designer","Module initialized");
}
