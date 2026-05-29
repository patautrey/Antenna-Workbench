/* ---------------------------------------------------------
   Antenna Workbench — Sterba Curtain Designer
--------------------------------------------------------- */

import { wavelength, round } from "../utils.js";
import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";

function $(root, sel) { return root.querySelector(sel); }

const STERBA = {
    bayWidth:   0.5,
    bayHeight:  0.5
};

const REFLECTOR = {
    defaultSpacing: 0.2,
    lengthFactor:   1.10
};

function estimateFeedZ(freqMHz, bays, hasReflector) {
    let base = 75 - (bays - 1) * 5;
    if (hasReflector) base *= 0.9;
    return base;
}

function estimateGain(freqMHz, bays, heightM, hasReflector) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    let base = 6 + (bays - 1) * 1.2;
    if (frac > 0.5 && frac < 1.0) base += 1.0;
    if (hasReflector) base += 1.5;

    const freqFactor = (freqMHz - 7.0) * 0.03;
    return base + freqFactor;
}

function estimateFB(freqMHz, bays, hasReflector) {
    let base = 10 + (bays - 1) * 2;
    if (hasReflector) base += 8;
    const freqFactor = (freqMHz - 7.0) * 0.1;
    return base + freqFactor;
}

function estimateTOA(freqMHz, heightM) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.5) return 25;
    if (frac < 1.0) return 18;
    return 12;
}

function analyzeHeight(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const f = heightM / lambda;

    if (f < 0.5)
        return "Low (<0.5 λ): higher TOA, less ideal for long-haul DX.";
    if (f < 1.0)
        return "Moderate (0.5–1.0 λ): good low-angle performance.";
    return "High (>1.0 λ): very low TOA, strong DX but more structure required.";
}

function computeSterba(freqMHz, bays, heightM, reflectorEnabled, reflectorSpacingLambda) {
    const lambda = wavelength(freqMHz);

    const width = bays * STERBA.bayWidth * lambda;
    const height = STERBA.bayHeight * lambda;

    const xStart = -width / 2;
    const xEnd = width / 2;
    const yBottom = heightM;
    const yTop = heightM + height;

    const baysGeom = [];
    for (let i = 0; i < bays; i++) {
        const bx0 = xStart + i * STERBA.bayWidth * lambda;
        const bx1 = bx0 + STERBA.bayWidth * lambda;
        baysGeom.push({
            index: i + 1,
            xStart: bx0,
            xEnd: bx1,
            yBottom,
            yTop
        });
    }

    let reflector = null;
    if (reflectorEnabled) {
        const reflSpacingM = reflectorSpacingLambda * lambda;
        const reflX = xStart - reflSpacingM;
        const reflLength = width * REFLECTOR.lengthFactor;

        reflector = {
            xCenter: reflX,
            yCenter: (yBottom + yTop) / 2,
            length: reflLength,
            spacing: reflSpacingM
        };
    }

    return {
        lambda,
        bays,
        width,
        height,
        heightM,
        yTop,
        baysGeom,
        reflector
    };
}

function buildSummary(freqMHz, S, bays, hasReflector, reflectorSpacingLambda, feedZ, gain, fb, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non-standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz,2)} MHz (${bandLabel})`);
    lines.push(`<strong>Configuration:</strong> ${bays}-bay Sterba curtain`);
    lines.push(`<strong>Array width:</strong> ${round(S.width,2)} m (~${round(S.width / S.lambda,2)} λ)`);
    lines.push(`<strong>Array height:</strong> ${round(S.height,2)} m (~${round(S.height / S.lambda,2)} λ)`);
    lines.push(`<strong>Bottom height:</strong> ${round(S.heightM,2)} m`);
    lines.push(`<strong>Top height:</strong> ${round(S.yTop,2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(S.heightM,freqMHz)}`);
    lines.push(`<strong>Feedpoint impedance (est.):</strong> ${round(feedZ,1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain,1)} dBi`);
    lines.push(`<strong>Estimated F/B ratio:</strong> ${round(fb,1)} dB`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa,1)}°`);

    if (hasReflector && S.reflector) {
        lines.push(`<hr>`);
        lines.push(`<strong>Reflector:</strong> enabled`);
        lines.push(`<strong>Reflector spacing:</strong> ${round(S.reflector.spacing,2)} m (~${round(reflectorSpacingLambda,3)} λ)`);
        lines.push(`<strong>Reflector length:</strong> ${round(S.reflector.length,2)} m (~${round(REFLECTOR.lengthFactor,3)} × array width)`);
    } else {
        lines.push(`<hr>`);
        lines.push(`<strong>Reflector:</strong> none (classic Sterba curtain)`);
    }

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Sterba curtains are multi-bay wire arrays providing strong low-angle gain and good F/B.
                An optional reflector wire can further enhance forward gain and directivity.
            </p>
        </div>
    `;
}

function validate(freqStr, baysStr, heightStr, reflEnabledStr, reflSpacingStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const bErr = requirePositive(baysStr, "Number of bays");
    if (bErr) errors.push(bErr);

    const hErr = requirePositive(heightStr, "Bottom height");
    if (hErr) errors.push(hErr);

    const bays = Number(baysStr);
    if (bays < 1 || bays > 6) {
        errors.push("Number of bays should be between 1 and 6.");
    }

    const reflEnabled = reflEnabledStr === "yes";
    if (reflEnabled) {
        const rErr = requirePositive(reflSpacingStr, "Reflector spacing (λ)");
        if (rErr) errors.push(rErr);

        const r = Number(reflSpacingStr);
        if (r < 0.05 || r > 0.5) {
            errors.push("Reflector spacing must be between 0.05 λ and 0.50 λ.");
        }
    }

    return errors;
}

function handleCompute(root) {
    const freqStr = $(root, "#sterba-freq").value;
    const baysStr = $(root, "#sterba-bays").value;
    const heightStr = $(root, "#sterba-height").value;
    const reflEnabledStr = $(root, "#sterba-reflector").value;
    const reflSpacingStr = $(root, "#sterba-reflector-spacing").value;

    const summaryHost = $(root, "#sterba-summary");

    const errors = validate(freqStr, baysStr, heightStr, reflEnabledStr, reflSpacingStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const bays = toNumber(baysStr);
    const heightM = toNumber(heightStr);
    const reflectorEnabled = reflEnabledStr === "yes";
    const reflectorSpacingLambda = reflectorEnabled
        ? toNumber(reflSpacingStr || REFLECTOR.defaultSpacing)
        : 0;

    const S = computeSterba(freqMHz, bays, heightM, reflectorEnabled, reflectorSpacingLambda);
    const feedZ = estimateFeedZ(freqMHz, bays, reflectorEnabled);
    const gain = estimateGain(freqMHz, bays, heightM, reflectorEnabled);
    const fb = estimateFB(freqMHz, bays, reflectorEnabled);
    const toa = estimateTOA(freqMHz, heightM);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(
        infoBox(buildSummary(freqMHz, S, bays, reflectorEnabled, reflectorSpacingLambda, feedZ, gain, fb, toa))
    );

    log("sterba-designer", "Computed Sterba curtain design", {
        freqMHz,
        bays,
        heightM,
        reflectorEnabled,
        reflectorSpacingLambda,
        S,
        feedZ,
        gain,
        fb,
        toa
    });
}

export default function initSterbaDesigner(root) {
    const btn = $(root, "#sterba-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#sterba-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter frequency, bays, height, and reflector options, then click <strong>Compute Sterba Curtain</strong>.";
    }

    log("sterba-designer", "Module initialized");
}
