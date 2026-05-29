/* ---------------------------------------------------------
   Antenna Workbench — Doublet Designer (with NVIS Reflector)
--------------------------------------------------------- */

import { wavelength, round } from "../utils.js";
import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";

import {
    computeNVISReflector,
    logNVISReflector
} from "../engines/nvis-reflector.js";

function $(root, sel) { return root.querySelector(sel); }

/* GEOMETRY */
function computeDoublet(freqMHz, heightM, totalLengthM) {
    const lambda = wavelength(freqMHz);
    const half = totalLengthM / 2;

    return {
        lambda,
        totalLengthM,
        halfLengthM: half,
        heightM
    };
}

/* FEEDPOINT Z */
function estimateFeedZ(freqMHz, totalLengthM) {
    const lambda = wavelength(freqMHz);
    const ratio = totalLengthM / lambda;

    if (ratio < 0.45) return 120;
    if (ratio < 0.55) return 70;
    if (ratio < 0.65) return 200;
    return 300;
}

/* GAIN */
function estimateGain(freqMHz, heightM) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.25) return 2.0;
    if (frac < 0.5) return 4.5;
    if (frac < 1.0) return 5.5;
    return 6.0;
}

/* TOA */
function estimateTOA(freqMHz, heightM) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.25) return 70;
    if (frac < 0.5) return 55;
    if (frac < 1.0) return 35;
    return 25;
}

/* SUMMARY */
function buildSummary(freqMHz, D, feedZ, gain, toa, R) {
    const band = findBand(freqMHz);
    const bandLabel = band
        ? `${band.name} (${band.low}–${band.high} MHz)`
        : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz,2)} MHz (${bandLabel})`);
    lines.push(`<strong>Total length:</strong> ${round(D.totalLengthM,2)} m`);
    lines.push(`<strong>Height:</strong> ${round(D.heightM,2)} m`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ,1)} Ω`);
    lines.push(`<strong>Estimated gain:</strong> ${round(gain,1)} dBi`);
    lines.push(`<strong>Estimated TOA:</strong> ${round(toa,1)}°`);

    if (R) {
        lines.push(`<hr>`);
        lines.push(`<strong>NVIS Reflector System:</strong>`);
        lines.push(R.summary);
        lines.push(`<p><strong>Adjusted NVIS gain:</strong> +${round(R.gainNVIS,1)} dB</p>`);
        lines.push(`<p><strong>DX reduction:</strong> -${round(R.dxLoss,1)} dB</p>`);
        lines.push(`<p><strong>TOA shift:</strong> +${round(R.toaDelta,1)}°</p>`);
    }

    return `
        <div class="poster-preview">
            ${lines.join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Doublets are versatile HF antennas. NVIS reflector systems enhance
                high-angle radiation for regional coverage.
            </p>
        </div>
    `;
}

/* VALIDATION */
function validate(freqStr, heightStr, lengthStr, reflEnabledStr, numStr, spacingStr, offsetStr, reflHeightStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Height");
    if (hErr) errors.push(hErr);

    const lErr = requirePositive(lengthStr, "Total length");
    if (lErr) errors.push(lErr);

    const reflEnabled = reflEnabledStr === "yes";

    if (reflEnabled) {
        const nErr = requirePositive(numStr, "Number of reflector wires");
        if (nErr) errors.push(nErr);

        const sErr = requirePositive(spacingStr, "Reflector spacing");
        if (sErr) errors.push(sErr);

        const oErr = requirePositive(offsetStr, "Reflector offset");
        if (oErr) errors.push(oErr);

        const h2Err = requirePositive(reflHeightStr, "Reflector height");
        if (h2Err) errors.push(h2Err);
    }

    return errors;
}

/* COMPUTE */
function handleCompute(root) {
    const freqStr = $(root, "#dbl-freq").value;
    const heightStr = $(root, "#dbl-height").value;
    const lengthStr = $(root, "#dbl-length").value;

    const reflEnabledStr = $(root, "#dbl-refl-enabled").value;
    const numStr = $(root, "#dbl-refl-num").value;
    const spacingStr = $(root, "#dbl-refl-spacing").value;
    const offsetStr = $(root, "#dbl-refl-offset").value;
    const reflHeightStr = $(root, "#dbl-refl-height").value;

    const summaryHost = $(root, "#dbl-summary");

    const errors = validate(freqStr, heightStr, lengthStr, reflEnabledStr, numStr, spacingStr, offsetStr, reflHeightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const totalLengthM = toNumber(lengthStr);

    const D = computeDoublet(freqMHz, heightM, totalLengthM);
    const feedZ = estimateFeedZ(freqMHz, totalLengthM);
    const gain = estimateGain(freqMHz, heightM);
    const toa = estimateTOA(freqMHz, heightM);

    let R = null;

    if (reflEnabledStr === "yes") {
        const numWires = toNumber(numStr);
        const spacingM = toNumber(spacingStr);
        const offsetM = toNumber(offsetStr);
        const reflHeightM = toNumber(reflHeightStr);

        R = computeNVISReflector(freqMHz, heightM, numWires, spacingM, offsetM, reflHeightM);
        logNVISReflector({ freqMHz, heightM, numWires }, R);
    }

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, D, feedZ, gain, toa, R)));

    log("doublet-designer", "Computed doublet with NVIS reflector", {
        freqMHz,
        heightM,
        totalLengthM,
        feedZ,
        gain,
        toa,
        reflector: R
    });
}

/* ENTRY */
export default function initDoubletDesigner(root) {
    const btn = $(root, "#dbl-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#dbl-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter frequency, height, length, and optional NVIS reflector parameters, then click <strong>Compute Doublet</strong>.";
    }

    log("doublet-designer", "Module initialized");
}
