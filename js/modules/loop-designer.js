/* ---------------------------------------------------------
   Antenna Workbench — Horizontal Loop / Skyloop Designer
   With optional multi-wire NVIS reflector system
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
function computeLoop(freqMHz, perimeterM, heightM) {
    const lambda = wavelength(freqMHz);
    const side = perimeterM / 4;

    return {
        lambda,
        perimeterM,
        side,
        heightM
    };
}

/* FEEDPOINT Z */
function estimateFeedZ(freqMHz, perimeterM) {
    const lambda = wavelength(freqMHz);
    const ratio = perimeterM / lambda;

    if (ratio < 0.9) return 150;
    if (ratio < 1.2) return 100;
    if (ratio < 1.5) return 200;
    return 300;
}

/* GAIN */
function estimateGain(freqMHz, heightM) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.25) return 1.5;
    if (frac < 0.5) return 3.0;
    if (frac < 1.0) return 4.5;
    return 5.0;
}

/* TOA */
function estimateTOA(freqMHz, heightM) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.25) return 75;
    if (frac < 0.5) return 60;
    if (frac < 1.0) return 40;
    return 30;
}

/* SUMMARY */
function buildSummary(freqMHz, L, feedZ, gain, toa, R) {
    const band = findBand(freqMHz);
    const bandLabel = band
        ? `${band.name} (${band.low}–${band.high} MHz)`
        : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz,2)} MHz (${bandLabel})`);
    lines.push(`<strong>Perimeter:</strong> ${round(L.perimeterM,2)} m`);
    lines.push(`<strong>Side length:</strong> ${round(L.side,2)} m`);
    lines.push(`<strong>Height:</strong> ${round(L.heightM,2)} m`);
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
                Horizontal loops are naturally quiet and NVIS-friendly. Multi-wire reflectors
                enhance high-angle radiation for regional coverage.
            </p>
        </div>
    `;
}

/* VALIDATION */
function validate(freqStr, heightStr, perStr, reflEnabledStr, numStr, spacingStr, offsetStr, reflHeightStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Height");
    if (hErr) errors.push(hErr);

    const pErr = requirePositive(perStr, "Perimeter");
    if (pErr) errors.push(pErr);

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
    const freqStr = $(root, "#loop-freq").value;
    const heightStr = $(root, "#loop-height").value;
    const perStr = $(root, "#loop-perimeter").value;

    const reflEnabledStr = $(root, "#loop-refl-enabled").value;
    const numStr = $(root, "#loop-refl-num").value;
    const spacingStr = $(root, "#loop-refl-spacing").value;
    const offsetStr = $(root, "#loop-refl-offset").value;
    const reflHeightStr = $(root, "#loop-refl-height").value;

    const summaryHost = $(root, "#loop-summary");

    const errors = validate(freqStr, heightStr, perStr, reflEnabledStr, numStr, spacingStr, offsetStr, reflHeightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const perimeterM = toNumber(perStr);

    const L = computeLoop(freqMHz, perimeterM, heightM);
    const feedZ = estimateFeedZ(freqMHz, perimeterM);
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
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, L, feedZ, gain, toa, R)));

    log("loop-designer", "Computed loop with NVIS reflector", {
        freqMHz,
        heightM,
        perimeterM,
        feedZ,
        gain,
        toa,
        reflector: R
    });
}

/* ENTRY */
export default function initLoopDesigner(root) {
    const btn = $(root, "#loop-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#loop-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter frequency, height, perimeter, and optional NVIS reflector parameters, then click <strong>Compute Loop</strong>.";
    }

    log("loop-designer", "Module initialized");
}
