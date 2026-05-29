/* ---------------------------------------------------------
   Antenna Workbench — Dominator
   Antenna Optimizer & Recommender
   Now NVIS-aware and reflector-aware
--------------------------------------------------------- */

import { round } from "../utils.js";
import { infoBox, warnBox } from "../dom.js";
import { log } from "../log.js";

function $(root, sel) { return root.querySelector(sel); }

/* ---------------------------------------------------------
   NVIS SCORING
--------------------------------------------------------- */
function nvisScore(params, antenna) {
    let score = 0;

    if (params.goal !== "nvis") return 0;

    if (params.heightFrac < 0.05) score -= 10;
    else if (params.heightFrac < 0.15) score += 20;
    else if (params.heightFrac < 0.25) score += 10;

    if (params.reflectorWires > 0) {
        score += params.reflectorWires * 4;
        if (params.reflectorHeightFrac < 0.15) score += 5;
    }

    if (antenna.tags.includes("nvis")) score += 20;
    if (antenna.tags.includes("loop")) score += 10;
    if (antenna.tags.includes("vertical")) score += 5;

    return score;
}

/* ---------------------------------------------------------
   ANTENNA KNOWLEDGE BASE
--------------------------------------------------------- */
const ANTENNAS = [
    {
        name: "Dipole / Doublet",
        tags: ["balanced", "general", "nvis", "low-cost"],
        score: params => {
            let s = 60;
            if (params.goal === "nvis") s += 20;
            if (params.height < 10) s += 10;
            if (params.span < 20) s -= 10;
            s += nvisScore(params, { tags: ["nvis"] });
            return s;
        }
    },
    {
        name: "Inverted-V",
        tags: ["balanced", "compact", "general"],
        score: params => {
            let s = 65;
            if (params.span < 20) s += 15;
            if (params.goal === "dx") s += 5;
            s += nvisScore(params, { tags: [] });
            return s;
        }
    },
    {
        name: "EFHW",
        tags: ["multiband", "simple", "end-fed"],
        score: params => {
            let s = 70;
            if (params.goal === "multiband") s += 20;
            if (params.noise === "noisy") s -= 10;
            s += nvisScore(params, { tags: [] });
            return s;
        }
    },
    {
        name: "Vertical",
        tags: ["dx", "low-angle", "vertical"],
        score: params => {
            let s = 75;
            if (params.goal === "dx") s += 20;
            if (params.ground === "poor") s -= 15;
            s += nvisScore(params, { tags: ["vertical"] });
            return s;
        }
    },
    {
        name: "4-Square",
        tags: ["dx", "array", "high-performance", "vertical"],
        score: params => {
            let s = 85;
            if (params.goal === "dx") s += 25;
            if (params.space < 20) s -= 40;
            s += nvisScore(params, { tags: ["vertical"] });
            return s;
        }
    },
    {
        name: "Loop / Skyloop",
        tags: ["quiet", "balanced", "multiband", "nvis", "loop"],
        score: params => {
            let s = 80;
            if (params.noise === "noisy") s += 20;
            if (params.goal === "nvis") s += 10;
            if (params.height < 8) s -= 10;
            s += nvisScore(params, { tags: ["nvis", "loop"] });
            return s;
        }
    },
    {
        name: "Hexbeam",
        tags: ["dx", "beam", "rotatable"],
        score: params => {
            let s = 90;
            if (params.goal === "dx") s += 20;
            if (params.height < 10) s -= 20;
            s += nvisScore(params, { tags: [] });
            return s;
        }
    },
    {
        name: "Yagi",
        tags: ["dx", "beam", "high-performance"],
        score: params => {
            let s = 95;
            if (params.goal === "dx") s += 25;
            if (params.height < 12) s -= 25;
            if (params.space < 15) s -= 20;
            s += nvisScore(params, { tags: [] });
            return s;
        }
    },
    {
        name: "Vertical NVIS",
        tags: ["vertical", "nvis"],
        score: params => {
            let s = 70;
            if (params.goal === "nvis") s += 15;
            if (params.ground === "good") s += 5;
            s += nvisScore(params, { tags: ["vertical", "nvis"] });
            return s;
        }
    }
];

/* ---------------------------------------------------------
   SCORING ENGINE
--------------------------------------------------------- */
function evaluate(params) {
    return ANTENNAS.map(a => {
        return {
            name: a.name,
            tags: a.tags,
            score: a.score(params)
        };
    }).sort((a, b) => b.score - a.score);
}

/* ---------------------------------------------------------
   SUMMARY
--------------------------------------------------------- */
function buildSummary(params, results) {
    const top = results[0];

    const lines = [];

    lines.push(`<strong>Goal:</strong> ${params.goal}`);
    lines.push(`<strong>Height:</strong> ${params.height} m`);
    lines.push(`<strong>Span:</strong> ${params.span} m`);
    lines.push(`<strong>Space:</strong> ${params.space} m`);
    lines.push(`<strong>Ground:</strong> ${params.ground}`);
    lines.push(`<strong>Noise:</strong> ${params.noise}`);
    lines.push(`<strong>Reflector wires:</strong> ${params.reflectorWires}`);
    lines.push(`<hr>`);
    lines.push(`<strong>Top Recommendation:</strong> ${top.name} (${round(top.score,1)} pts)`);

    const list = results
        .map(r => `<p>${r.name}: ${round(r.score,1)} pts</p>`)
        .join("");

    return `
        <div class="poster-preview">
            ${lines.map(l => `<p>${l}</p>`).join("")}
            <p><strong>Ranked List:</strong></p>
            ${list}
            <p style="margin-top:10px;font-size:13px;color:#aaa;">
                Dominator uses heuristic scoring, including NVIS and reflector awareness,
                to match antennas to goals and site constraints.
            </p>
        </div>
    `;
}

/* ---------------------------------------------------------
   VALIDATION
--------------------------------------------------------- */
function validate(params) {
    const errors = [];
    if (!params.goal) errors.push("Goal is required.");
    if (!params.height) errors.push("Height is required.");
    if (!params.span) errors.push("Span is required.");
    if (!params.space) errors.push("Space is required.");
    if (!params.ground) errors.push("Ground quality is required.");
    if (!params.noise) errors.push("Noise environment is required.");
    return errors;
}

/* ---------------------------------------------------------
   COMPUTE
--------------------------------------------------------- */
function handleCompute(root) {
    const params = {
        goal: $(root, "#dom-goal").value,
        height: Number($(root, "#dom-height").value),
        span: Number($(root, "#dom-span").value),
        space: Number($(root, "#dom-space").value),
        ground: $(root, "#dom-ground").value,
        noise: $(root, "#dom-noise").value,
        reflectorWires: Number($(root, "#dom-reflector-wires")?.value || 0),
        heightFrac: Number($(root, "#dom-height-frac")?.value || 0),
        reflectorHeightFrac: Number($(root, "#dom-reflector-height-frac")?.value || 0)
    };

    const summaryHost = $(root, "#dom-summary");

    const errors = validate(params);
    if (errors.length > 0) {
        summaryHost.innerHTML = "";
        summaryHost.appendChild(warnBox(errors.join("<br>")));
        return;
    }

    const results = evaluate(params);

    summaryHost.innerHTML = "";
    summaryHost.appendChild(infoBox(buildSummary(params, results)));

    log("dominator", "Computed antenna recommendations", {
        params,
        results
    });
}

/* ---------------------------------------------------------
   ENTRY
--------------------------------------------------------- */
export default function initDominator(root) {
    const btn = $(root, "#dom-compute");
    if (btn) btn.addEventListener("click", () => handleCompute(root));

    const summaryHost = $(root, "#dom-summary");
    if (summaryHost) {
        summaryHost.innerHTML =
            "Enter your goals, site constraints, and optional NVIS/reflector parameters, then click <strong>Compute Recommendations</strong>.";
    }

    log("dominator", "Module initialized");
}
