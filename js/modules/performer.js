/* ---------------------------------------------------------
   Antenna Workbench — Performer
   Pattern & Performance Explorer
   Now NVIS-aware with reflector-based shaping
--------------------------------------------------------- */

import { round } from "../utils.js";
import { infoBox, warnBox } from "../dom.js";
import { log } from "../log.js";

function $(root, sel) { return root.querySelector(sel); }

/* ---------------------------------------------------------
   PATTERN GENERATION
--------------------------------------------------------- */
function generateElevationPattern(toaDeg, gainDB) {
    const pts = [];
    for (let deg = 0; deg <= 90; deg += 1) {
        const rel = Math.exp(-Math.pow((deg - toaDeg) / 18, 2));
        const g = gainDB * rel;
        pts.push({ angle: deg, gain: g });
    }
    return pts;
}

function generateAzimuthPattern(gainDB, fbDB, fsDB) {
    const pts = [];
    for (let deg = 0; deg < 360; deg += 2) {
        let rel = Math.cos((deg * Math.PI) / 180);
        rel = Math.abs(rel);
        let g = gainDB * rel;

        if (deg > 120 && deg < 240) g -= fbDB * 0.1;
        if (deg > 60 && deg < 120) g -= fsDB * 0.05;

        pts.push({ angle: deg, gain: g });
    }
    return pts;
}

/* NVIS elevation model */
function generateNVISPattern(toaDeg, nvisBoostDB, dxLossDB) {
    const pts = [];
    for (let deg = 0; deg <= 90; deg += 1) {
        const center = 85 - toaDeg * 0.2;
        const rel = Math.exp(-Math.pow((deg - center) / 12, 2));
        let g = nvisBoostDB * rel;

        if (deg < 30) g -= dxLossDB * (1 - deg / 30);

        pts.push({ angle: deg, gain: g });
    }
    return pts;
}

/* ---------------------------------------------------------
   RENDERING
--------------------------------------------------------- */
function renderPatternCanvas(canvas, pattern, label) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.min(W, H) * 0.45;

    const maxGain = Math.max(...pattern.map(p => p.gain || 0), 0.1);

    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#00aaff";
    ctx.lineWidth = 2;
    ctx.beginPath();

    pattern.forEach((p, i) => {
        const r = (p.gain / maxGain) * maxR;
        const ang = (p.angle * Math.PI) / 180;
        const x = cx + r * Math.cos(ang);
        const y = cy - r * Math.sin(ang);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "14px sans-serif";
    ctx.fillText(label, 10, 20);
}

/* ---------------------------------------------------------
   SUMMARY
--------------------------------------------------------- */
function buildSummary(data) {
    const lines = [];

    lines.push(`<strong>Antenna:</strong> ${data.name}`);
    lines.push(`<strong>Design frequency:</strong> ${round(data.freqMHz,2)} MHz`);
    lines.push(`<strong>Forward gain:</strong> ${round(data.gainDB,1)} dBi`);
    lines.push(`<strong>F/B ratio:</strong> ${round(data.fbDB,1)} dB`);
    lines.push(`<strong>F/S ratio:</strong> ${round(data.fsDB,1)} dB`);
    lines.push(`<strong>Takeoff angle:</strong> ${round(data.toaDeg,1)}°`);
    lines.push(`<strong>Height:</strong> ${round(data.heightM,2)} m`);

    if (data.nvisMode) {
        lines.push(`<strong>NVIS mode:</strong> enabled`);
        lines.push(`<strong>NVIS gain boost:</strong> ${round(data.nvisBoostDB,1)} dB`);
        lines.push(`<strong>DX suppression:</strong> ${round(data.dxLossDB,1)} dB`);
    } else {
        lines.push(`<strong>NVIS mode:</strong> disabled`);
    }

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Performer visualizes approximate radiation patterns for quick comparison
                and performance intuition across antenna types, including NVIS behavior.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validateInputs(freqStr, gainStr, fbStr, fsStr, toaStr, heightStr) {
    const errors = [];

    if (!freqStr) errors.push("Frequency is required.");
    if (!gainStr) errors.push("Gain is required.");
    if (!fbStr) errors.push("F/B ratio is required.");
    if (!fsStr) errors.push("F/S ratio is required.");
    if (!toaStr) errors.push("TOA is required.");
    if (!heightStr) errors.push("Height is required.");

    return errors;
}

/* ---------------------------------------------------------
   COMPUTE
--------------------------------------------------------- */
function handleCompute(root) {
    const name = $(root, "#perf-name").value;
    const freqStr = $(root, "#perf-freq").value;
    const gainStr = $(root, "#perf-gain").value;
    const fbStr = $(root, "#perf-fb").value;
    const fsStr = $(root, "#perf-fs").value;
    const toaStr = $(root, "#perf-toa").value;
    const heightStr = $(root, "#perf-height").value;

    const nvisMode = $(root, "#perf-nvis-mode")?.value === "yes";
    const nvisBoostStr = $(root, "#perf-nvis-boost")?.value || "0";
    const dxLossStr = $(root, "#perf-nvis-dxloss")?.value || "0";

    const summaryHost = $(root, "#perf-summary");
    const elevCanvas = $(root, "#perf-elev");
    const azCanvas = $(root, "#perf-az");

    const errors = validateInputs(freqStr, gainStr, fbStr, fsStr, toaStr, heightStr);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const data = {
        name,
        freqMHz: Number(freqStr),
        gainDB: Number(gainStr),
        fbDB: Number(fbStr),
        fsDB: Number(fsStr),
        toaDeg: Number(toaStr),
        heightM: Number(heightStr),
        nvisMode,
        nvisBoostDB: Number(nvisBoostStr),
        dxLossDB: Number(dxLossStr)
    };

    let elevPattern;
    if (nvisMode) {
        elevPattern = generateNVISPattern(data.toaDeg, data.nvisBoostDB || data.gainDB, data.dxLossDB);
    } else {
        elevPattern = generateElevationPattern(data.toaDeg, data.gainDB);
    }
    const azPattern = generateAzimuthPattern(data.gainDB, data.fbDB, data.fsDB);

    renderPatternCanvas(elevCanvas, elevPattern, nvisMode ? "Elevation (NVIS)" : "Elevation");
    renderPatternCanvas(azCanvas, azPattern, "Azimuth");

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(data)));

    log("performer", "Computed pattern visualization", data);
}

/* ---------------------------------------------------------
   ENTRY
--------------------------------------------------------- */
export default function initPerformer(root) {
    const btn = $(root, "#perf-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#perf-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter antenna parameters (and optional NVIS parameters), then click <strong>Compute Pattern</strong>.";
    }

    log("performer", "Module initialized");
}
