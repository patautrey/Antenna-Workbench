/* ---------------------------------------------------------
   Antenna Workbench — Vertical Designer Module
   Practical HF vertical dimensions, efficiency, and gain
--------------------------------------------------------- */

import { wavelength, quarterWave, threeEighthWave, halfWave, round } from "../utils.js";
import { requirePositive, requireFrequency, toNumber } from "../validators.js";
import { findBand } from "../constants.js";
import { infoBox, warnBox } from "../dom.js";
import { log } from "../log.js";

/* ---------------------------------------------------------
   DOM HELPERS (SCOPED TO ROOT)
--------------------------------------------------------- */

function $(root, selector) {
    return root.querySelector(selector);
}

function $all(root, selector) {
    return Array.from(root.querySelectorAll(selector));
}

/* ---------------------------------------------------------
   GROUND / RADIAL MODELS
   Very approximate, intentionally "engineering‑grade"
--------------------------------------------------------- */

const GROUND_MODELS = {
    "poor_0_4": { label: "Poor ground, 0–4 radials", efficiency: 0.25, lossDb: 6 },
    "average_8_16": { label: "Average ground, 8–16 radials", efficiency: 0.45, lossDb: 3 },
    "good_32_plus": { label: "Good ground, 32+ radials", efficiency: 0.65, lossDb: 1.5 },
    "excellent_mesh": { label: "Excellent ground screen / dense radials", efficiency: 0.8, lossDb: 1.0 }
};

/* ---------------------------------------------------------
   RADIATOR TYPE ADJUSTMENTS
--------------------------------------------------------- */

const RADIATOR_TYPES = {
    "wire": { label: "Wire (portable / guyed)", mechNote: "Lightweight, easy to deploy, but wind‑sensitive." },
    "tubular": { label: "Tubular aluminum", mechNote: "Rigid, durable, good long‑term option." },
    "multi_section": { label: "Multi‑section telescoping", mechNote: "Portable, but watch for contact resistance." }
};

/* ---------------------------------------------------------
   BOOST OPTIONS (dB)
--------------------------------------------------------- */

const BOOSTS = {
    reflector: 2.5,
    director: 1.5,
    elevated: 1.0,
    screen: 0.5,
    saltwater: 3.0,
    dx: 4.0,
    tod: 0.5,
    feedline: 0.5
};

/* ---------------------------------------------------------
   HEIGHT ANALYSIS
--------------------------------------------------------- */

function analyzeHeight(heightM, freqMHz) {
    const lambda = wavelength(freqMHz); // meters
    const frac = heightM / lambda;

    let region = "";
    if (frac < 0.2) {
        region = "Short vertical (less than 0.2 λ) — efficiency and low‑angle performance are limited, but NVIS and local coverage can still be useful.";
    } else if (frac >= 0.2 && frac <= 0.3) {
        region = "Near 1/4 λ — classic vertical territory with good low‑angle radiation and reasonable efficiency.";
    } else if (frac > 0.3 && frac <= 0.45) {
        region = "Between 1/4 λ and 3/8 λ — often a sweet spot for DX, with strong low‑angle radiation.";
    } else if (frac > 0.45 && frac <= 0.55) {
        region = "Around 1/2 λ — strong low‑angle radiation but with more pronounced high‑angle lobes.";
    } else if (frac > 0.55 && frac <= 0.8) {
        region = "Tall vertical (0.55–0.8 λ) — can produce very strong low‑angle gain but with more complex patterns.";
    } else {
        region = "Very tall radiator (> 0.8 λ) — pattern becomes multi‑lobed; modeling is recommended for serious optimization.";
    }

    return {
        lambda,
        frac,
        description: region
    };
}

/* ---------------------------------------------------------
   EFFICIENCY / GAIN ESTIMATION
--------------------------------------------------------- */

function estimateEfficiencyAndGain(freqMHz, heightM, groundKey, boostState) {
    const ground = GROUND_MODELS[groundKey] || GROUND_MODELS["average_8_16"];
    const heightInfo = analyzeHeight(heightM, freqMHz);

    // Base "pattern gain" relative to a 1/4 λ reference vertical over average ground
    let patternDb = 0;

    if (heightInfo.frac < 0.2) {
        patternDb -= 2; // short and lossy
    } else if (heightInfo.frac >= 0.2 && heightInfo.frac <= 0.3) {
        patternDb += 0; // reference
    } else if (heightInfo.frac > 0.3 && heightInfo.frac <= 0.45) {
        patternDb += 1.5; // 3/8 λ sweet spot
    } else if (heightInfo.frac > 0.45 && heightInfo.frac <= 0.55) {
        patternDb += 2.0; // 1/2 λ can be strong at low angles
    } else if (heightInfo.frac > 0.55 && heightInfo.frac <= 0.8) {
        patternDb += 3.0; // tall vertical, strong low‑angle
    } else {
        patternDb += 3.5; // very tall, but pattern complexity caveat
    }

    // Ground / radial loss
    const groundLossDb = ground.lossDb;

    // Boost stacking
    let boostDb = 0;
    if (boostState.reflector) boostDb += BOOSTS.reflector;
    if (boostState.director) boostDb += BOOSTS.director;
    if (boostState.elevated) boostDb += BOOSTS.elevated;
    if (boostState.screen) boostDb += BOOSTS.screen;
    if (boostState.saltwater) boostDb += BOOSTS.saltwater;
    if (boostState.dx) boostDb += BOOSTS.dx;
    if (boostState.tod) boostDb += BOOSTS.tod;
    if (boostState.feedline) boostDb += BOOSTS.feedline;

    // Net "effective gain" relative to an isotropic-ish baseline
    const effectiveGainDb = patternDb - groundLossDb + boostDb;

    return {
        ground,
        heightInfo,
        patternDb,
        groundLossDb,
        boostDb,
        effectiveGainDb
    };
}

/* ---------------------------------------------------------
   UPDATE REFERENCE TABLE
--------------------------------------------------------- */

function updateReferenceTable(root, freqMHz) {
    const lambda = wavelength(freqMHz);
    const qtr = quarterWave(freqMHz);
    const three8 = threeEighthWave(freqMHz);
    const half = halfWave(freqMHz);

    const freqCell = $(root, "#vd-ref-freq");
    const lambdaCell = $(root, "#vd-ref-lambda");
    const qtrCell = $(root, "#vd-ref-qtr");
    const three8Cell = $(root, "#vd-ref-three8");
    const halfCell = $(root, "#vd-ref-half");

    if (!freqCell) return; // table not present

    freqCell.textContent = `${round(freqMHz, 2)} MHz`;
    lambdaCell.textContent = `${round(lambda, 2)} m`;
    qtrCell.textContent = `${round(qtr, 2)} m`;
    three8Cell.textContent = `${round(three8, 2)} m`;
    halfCell.textContent = `${round(half, 2)} m`;
}

/* ---------------------------------------------------------
   BUILD SUMMARY HTML
--------------------------------------------------------- */

function buildSummary(freqMHz, heightM, groundKey, radiatorKey, est) {
    const band = findBand(freqMHz);
    const bandLabel = band ? `${band.name} (${band.low}–${band.high} MHz)` : "Non‑standard HF segment";

    const ground = GROUND_MODELS[groundKey] || GROUND_MODELS["average_8_16"];
    const radiator = RADIATOR_TYPES[radiatorKey] || RADIATOR_TYPES["wire"];

    const lines = [];

    lines.push(`<strong>Design frequency:</strong> ${round(freqMHz, 2)} MHz (${bandLabel})`);
    lines.push(`<strong>Physical height:</strong> ${round(heightM, 2)} m (${round(est.heightInfo.frac * 100, 1)}% of λ)`);
    lines.push(`<strong>Height region:</strong> ${est.heightInfo.description}`);
    lines.push(`<strong>Ground / radials:</strong> ${ground.label}`);
    lines.push(`<strong>Radiator type:</strong> ${radiator.label}`);
    lines.push(`<strong>Pattern gain (height‑driven):</strong> ${round(est.patternDb, 1)} dB`);
    lines.push(`<strong>Ground / radial loss:</strong> −${round(est.groundLossDb, 1)} dB`);
    lines.push(`<strong>Boost stack:</strong> +${round(est.boostDb, 1)} dB`);
    lines.push(`<strong>Estimated effective gain:</strong> <span style="color:#4da3ff;">${round(est.effectiveGainDb, 1)} dB</span>`);

    lines.push(`<em>Note:</em> These values are approximate, “engineering‑grade” estimates. For critical designs, NEC modeling and on‑air testing are recommended.`);

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Mechanical note: ${radiator.mechNote}
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   READ BOOST STATE FROM CHECKBOXES
--------------------------------------------------------- */

function readBoostState(root) {
    return {
        reflector: !!$(root, "#vd-boost-reflector")?.checked,
        director: !!$(root, "#vd-boost-director")?.checked,
        elevated: !!$(root, "#vd-boost-elevated")?.checked,
        screen: !!$(root, "#vd-boost-screen")?.checked,
        saltwater: !!$(root, "#vd-boost-saltwater")?.checked,
        dx: !!$(root, "#vd-boost-dx")?.checked,
        tod: !!$(root, "#vd-boost-tod")?.checked,
        feedline: !!$(root, "#vd-boost-feedline")?.checked
    };
}

/* ---------------------------------------------------------
   VALIDATE INPUTS
--------------------------------------------------------- */

function validateInputs(freqStr, heightStr) {
    const errors = [];

    const freqErr = requireFrequency(freqStr, "Design frequency");
    if (freqErr) errors.push(freqErr);

    const heightErr = requirePositive(heightStr, "Physical height");
    if (heightErr) errors.push(heightErr);

    return errors;
}

/* ---------------------------------------------------------
   MAIN COMPUTE HANDLER
--------------------------------------------------------- */

function handleCompute(root) {
    const bandSelect = $(root, "#vd-band");
    const groundSelect = $(root, "#vd-ground");
    const heightInput = $(root, "#vd-height");
    const radiatorSelect = $(root, "#vd-radiator");
    const summaryHost = $(root, "#vd-summary");

    if (!bandSelect || !groundSelect || !heightInput || !radiatorSelect || !summaryHost) {
        console.error("Vertical Designer: Missing one or more required DOM elements.");
        return;
    }

    const freqStr = bandSelect.value || bandSelect.dataset.freq || "14.2";
    const heightStr = heightInput.value;
    const groundKey = groundSelect.value || "average_8_16";
    const radiatorKey = radiatorSelect.value || "wire";

    const errors = validateInputs(freqStr, heightStr);

    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        const box = warnBox(errors.join("<br>"));
        summaryHost.appendChild(box);
        return;
    }

    const freqMHz = toNumber(freqStr);
    const heightM = toNumber(heightStr);

    if (freqMHz === null || heightM === null) {
        summaryHost.innerHTML = "";
        const box = warnBox("Could not parse inputs. Please check your values.");
        summaryHost.appendChild(box);
        return;
    }

    // Update reference table
    updateReferenceTable(root, freqMHz);

    // Read boosts
    const boostState = readBoostState(root);

    // Estimate performance
    const est = estimateEfficiencyAndGain(freqMHz, heightM, groundKey, boostState);

    // Build summary
    summaryHost.innerHTML = "";
    const html = buildSummary(freqMHz, heightM, groundKey, radiatorKey, est);
    const box = infoBox(html);
    summaryHost.appendChild(box);

    log("vertical-designer", "Computed design", {
        freqMHz,
        heightM,
        groundKey,
        radiatorKey,
        boostState,
        est
    });
}

/* ---------------------------------------------------------
   MODULE ENTRY POINT
   This is called by the router with a content root element
--------------------------------------------------------- */

export default function initVerticalDesigner(root) {
    // Assume the HTML for Vertical Designer is already injected into `root`
    // and contains the expected IDs.

    const computeBtn = $(root, "#vd-compute");
    if (computeBtn) {
        computeBtn.addEventListener("click", () => handleCompute(root));
    }

    // If a default band is selected, pre‑populate the reference table
    const bandSelect = $(root, "#vd-band");
    if (bandSelect) {
        const freqStr = bandSelect.value || bandSelect.dataset.freq || "14.2";
        const freqMHz = toNumber(freqStr) || 14.2;
        updateReferenceTable(root, freqMHz);

        bandSelect.addEventListener("change", () => {
            const fStr = bandSelect.value || bandSelect.dataset.freq || "14.2";
            const fMHz = toNumber(fStr) || 14.2;
            updateReferenceTable(root, fMHz);
        });
    }

    const summaryHost = $(root, "#vd-summary");
    if (summaryHost) {
        summaryHost.innerHTML = "Select band and height, then click <strong>Compute Design</strong>.";
    }

    log("vertical-designer", "Module initialized");
}
