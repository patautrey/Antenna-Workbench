/* ---------------------------------------------------------
   Antenna Workbench — Bobtail Curtain Designer
--------------------------------------------------------- */

import { wavelength, round } from "../utils.js";
import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";

function $(root, sel) { return root.querySelector(sel); }

const BOBTAIL = {
    vertLength: 0.25,
    spacing:    0.25
};

const REFLECTOR = {
    defaultSpacing: 0.15,
    lengthFactor:   1.06
};

function estimateFeedZ(freqMHz, hasReflector) {
    const base = 60;
    return hasReflector ? base * 0.9 : base;
}

function estimateGain(freqMHz, heightM, hasReflector) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    let base = 5.5;
    if (frac > 0.25 && frac < 0.6) base += 0.8;
    if (hasReflector) base += 1.3;

    const freqFactor = (freqMHz - 7.0) * 0.03;
    return base + freqFactor;
}

function estimateFB(freqMHz, hasReflector) {
    const base = 8;
    const reflBoost = hasReflector ? 7 : 0;
    const freqFactor = (freqMHz - 7.0) * 0.1;
    return base + reflBoost + freqFactor;
}

function estimateTOA(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const frac = heightM / lambda;

    if (frac < 0.2) return 28;
    if (frac < 0.35) return 22;
    if (frac < 0.5) return 18;
    return 14;
}

function analyzeHeight(heightM, freqMHz) {
    const lambda = wavelength(freqMHz);
    const f = heightM / lambda;

    if (f < 0.2)
        return "Very low (<0.2 λ): pattern distorted, higher TOA.";
    if (f < 0.35)
        return "Low (0.2–0.35 λ): usable, moderate TOA.";
    if (f < 0.6)
        return "Good (0.35–0.6 λ): strong low-angle DX performance.";
    return "High (>0.6 λ): very low TOA, strong DX but more height required.";
}

function computeBobtail(freqMHz, heightM, reflectorEnabled, reflectorSpacingLambda) {
    const lambda = wavelength(freqMHz);

    const vertLen = lambda * BOBTAIL.vertLength;
    const spacing = lambda * BOBTAIL.spacing;

    const x0 = -spacing;
    const x1 = 0;
    const x2 = spacing;

    const topHeight = heightM + vertLen;

    const verticals = [
        { label: "Left vertical",   x: x0, yBottom: 0, yTop: vertLen },
        { label: "Center vertical", x: x1, yBottom: 0, yTop: vertLen },
        { label: "Right vertical",  x: x2, yBottom: 0, yTop: vertLen }
    ];

    const topWire = {
        y: vertLen,
        xStart: x0,
        xEnd: x2
    };

    let reflector = null;
    if (reflectorEnabled) {
        const reflSpacingM = reflectorSpacingLambda * lambda;
        const reflY = vertLen;
        const reflLength = (x2 - x0) * REFLECTOR.lengthFactor;

        reflector = {
            y: reflY,
            xCenter: 0,
            length: reflLength,
            spacing: reflSpacingM
        };
    }

    return {
        lambda,
        vertLen,
        spacing,
        heightM,
        topHeight,
        verticals,
        topWire,
        reflector
    };
}

function buildSummary(freqMHz, B, hasReflector, reflectorSpacingLambda, feedZ, gain, fb, toa) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non-standard HF segment";

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz,2)} MHz (${bandLabel})`);
    lines.push(`<strong>Configuration:</strong> 3-vertical Bobtail Curtain`);
    lines.push(`<strong>Vertical length:</strong> ${round(B.vertLen,2)} m (~${round(BOBTAIL.vertLength,3)} λ)`);
    lines.push(`<strong>Spacing between verticals:</strong> ${round(B.spacing,2)} m (~${round(BOBTAIL.spacing,3)} λ)`);
    lines.push(`<strong>Base height (bottom of verticals):</strong> ${round(B.heightM,2)} m`);
    lines.push(`<strong>Top wire height:</strong> ${round(B.topHeight,2)} m`);
    lines.push(`<strong>Height region:</strong> ${analyzeHeight(B.heightM,freqMHz)}`);
    lines.push(`<strong>Feedpoint impedance (est.):</strong> ${round(feedZ,1)} Ω`);
    lines.push(`<strong>Estimated forward gain:</strong> ${round(gain,1)} dBi`);
    lines.push(`<strong>Estimated F/B ratio:</strong> ${round(fb,1)} dB`);
    lines.push(`<strong>Estimated takeoff angle:</strong> ${round(toa,1)}°`);

    if (hasReflector && B.reflector) {
        lines.push(`<hr>`);
        lines.push(`<strong>Reflector:</strong> enabled`);
        lines.push(`<strong>Reflector spacing:</strong> ${round(B.reflector.spacing,2)} m (~${round(reflectorSpacingLambda,3)} λ)`);
        lines.push(`<strong>Reflector length:</strong> ${round(B.reflector.length,2)} m (~${round(REFLECTOR.lengthFactor,3)} × array width)`);
    } else {
        lines.push(`<hr>`);
        lines.push(`<strong>Reflector:</strong> none (classic bobtail)`);
    }

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Bobtail curtains provide strong low-angle DX performance using three quarter-wave verticals and a
                top phasing wire. An optional reflector wire can further increase gain and front-to-back ratio.
            </p>
        </div>
    `;
}

function validate(freqStr, heightStr, reflSpacingStr, reflEnabledStr) {
    const errors = [];

    const fErr = requireFrequency(freqStr, "Design frequency");
    if (fErr) errors.push(fErr);

    const hErr = requirePositive(heightStr, "Base height");
    if (hErr) errors.push(hErr);

    const reflEnabled = reflEnabledStr === "yes";

    if (reflEnabled) {
        const rErr = requirePositive(reflSpacingStr, "Reflector spacing (λ)");
        if (rErr) errors.push(rErr);

        const r = Number(reflSpacingStr);
        if (r < 0.05 || r > 0.4) {
            errors.push("Reflector spacing must be between 0.05 λ and 0.40 λ.");
        }
    }

    return errors;
}

function handleCompute(root) {
    const freqStr = $(root, "#bobtail-freq").value;
    const heightStr = $(root, "#bobtail-height").value;
    const reflEnabledStr = $(root, "#bobtail-reflector").value;
    const reflSpacingStr = $(root, "#bobtail-reflector-spacing").value;
    const summaryHost = $(root, "#bobtail-summary");

    const errors = validate(freqStr, heightStr, reflSpacingStr, reflEnabledStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);
    const reflectorEnabled = reflEnabledStr === "yes";
    const reflectorSpacingLambda = reflectorEnabled
        ? toNumber(reflSpacingStr || REFLECTOR.defaultSpacing)
        : 0;

    const B = computeBobtail(freqMHz, heightM, reflectorEnabled, reflectorSpacingLambda);
    const feedZ = estimateFeedZ(freqMHz, reflectorEnabled);
    const gain = estimateGain(freqMHz, heightM, reflectorEnabled);
    const fb = estimateFB(freqMHz, reflectorEnabled);
    const toa = estimateTOA(heightM, freqMHz);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(
        infoBox(buildSummary(freqMHz, B, reflectorEnabled, reflectorSpacingLambda, feedZ, gain, fb, toa))
    );

    log("bobtail-designer", "Computed Bobtail Curtain design", {
        freqMHz,
        heightM,
        reflectorEnabled,
        reflectorSpacingLambda,
        B,
        feedZ,
        gain,
        fb,
        toa
    });
}

export default function initBobtailDesigner(root) {
    const btn = $(root, "#bobtail-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#bobtail-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter frequency, base height, and reflector options, then click <strong>Compute Bobtail Curtain</strong>.";
    }

    log("bobtail-designer", "Module initialized");
}
