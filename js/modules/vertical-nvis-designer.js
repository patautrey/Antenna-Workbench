/* ---------------------------------------------------------
   Antenna Workbench — Vertical NVIS Designer
   Single vertical with reflector grid for NVIS enhancement
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
function computeVerticalNVIS(freqMHz, heightM) {
    const lambda = wavelength(freqMHz);
    const vertLen = lambda * 0.25;

    return {
        lambda,
        vertLen,
        heightM
    };
}

/* FEEDPOINT Z */
function estimateFeedZ(freqMHz, groundQuality) {
    if (groundQuality === "poor") return 45;
    if (groundQuality === "average") return 35;
    return 25;
}

/* GAIN */
function estimateGain(freqMHz, heightM, groundQuality) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    let base = 1.5;

    if (frac < 0.1) base += 1.0;
    if (groundQuality === "good") base += 0.5;

    return base;
}

/* TOA */
function estimateTOA(freqMHz, heightM) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.1) return 80;
    if (frac < 0.2) return 70;
    return 60;
}

/* SUMMARY */
function buildSummary(freqMHz, V, feedZ, gain, toa, R) {
    const band = findBand(freqMHz);
    const bandLabel = band
        ? `${band.name} (${band.low}–${band.high} MHz)`
        : "Non‑standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz,2)} MHz (${bandLabel})`);
    lines.push(`<strong>Vertical length:</strong> ${round(V.vertLen,2)} m (~0.25 λ)`);
    lines.push(`<strong>Base height:</strong> ${round(V.heightM,2)} m`);
    lines.push(`<strong>Feedpoint impedance:</strong> ${round(feedZ,1)} Ω`);
    lines.push(`<strong>Estimated NVIS gain:</strong> ${round(gain,1)} dBi`);
    lines.push(`<strong>Estimated TOA:</strong> ${round(toa,1)}°`);

    if (R) {
        lines.push(`<hr>`);
        lines.push(`<strong>Reflector Grid:</strong>`);
        lines.push(R.summary);
        lines.push(`<p><strong>Adjusted NVIS gain:</strong> +${round(R.gainNVIS,1)} dB</p>`);
        lines.push(`<p><strong>DX reduction:</strong> -${round(R.dxLoss,1)} dB</p>`);
        lines.push(`<p><strong>TOA shift:</strong> +${round(R.toaDelta,1)}°</p>`);
    }

    return `
        <div class="poster-preview">
            ${lines.join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Vertical NVIS systems use a reflector grid to enhance high-angle radiation
                while suppressing low-angle DX. Ideal for regional coverage.
            </p>
        </div>
    `;
}

/* VALIDATION */
function validate(freqStr, heightStr, groundStr, reflEnabledStr, numStr, spacingStr, offsetStr, reflHeightStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Base height");
    if (hErr) errors.push(hErr);

    if (!groundStr) errors.push("Ground quality is required.");

    const reflEnabled = reflEnabledStr === "yes";

    if (reflEnabled) {
        const nErr = requirePositive(numStr, "Number of reflector wires");
        if (nErr) errors.push(nErr);

        const sErr = requirePositive(spacingStr, "Reflector spacing");
        if (sErr) errors.push(sErr);

        const oErr = requirePositive(offsetStr, "Reflector radius/offset");
        if (oErr) errors.push(oErr);

        const h2Err = requirePositive(reflHeightStr, "Reflector height");
        if (h2Err) errors.push(h2Err);
    }

    return errors;
}

/* COMPUTE */
function handleCompute(root) {
    const freqStr = $(root, "#vnv-freq").value;
    const heightStr = $(root, "#vnv-height").value;
    const groundStr = $(root, "#vnv-ground").value;

    const reflEnabledStr = $(root, "#vnv-refl-enabled").value;
    const numStr = $(root, "#vnv-refl-num").value;
    const spacingStr = $(root, "#vnv-refl-spacing").value;
    const offsetStr = $(root, "#vnv-refl-offset").value;
    const reflHeightStr = $(root, "#vnv-refl-height").value;

    const summaryHost = $(root, "#vnv-summary");

    const errors = validate(freqStr, heightStr, groundStr, reflEnabledStr, numStr, spacingStr, offsetStr, reflHeightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    const V = computeVerticalNVIS(freqMHz, heightM);
    const feedZ = estimateFeedZ(freqMHz, groundStr);
    const gain = estimateGain(freqMHz, heightM, groundStr);
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
    summaryHost.appendChild(infoBox(buildSummary(freqMHz, V, feedZ, gain, toa, R)));

    log("vertical-nvis-designer", "Computed vertical NVIS with reflector grid", {
        freqMHz,
        heightM,
        groundStr,
        feedZ,
        gain,
        toa,
        reflector: R
    });
}

/* ENTRY */
export default function initVerticalNVISDesigner(root) {
    const btn = $(root, "#vnv-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#vnv-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter frequency, height, ground quality, and optional reflector grid parameters, then click <strong>Compute Vertical NVIS</strong>.";
    }

    log("vertical-nvis-designer", "Module initialized");
}
