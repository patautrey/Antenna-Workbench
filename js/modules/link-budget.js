/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Full-System HF Link Budget Simulator
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("link-budget.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function linkBudgetUI() {
    return `
        <h2>Full-System HF Link Budget Simulator</h2>

        <div class="card">
            <label>Transmit Power (W):</label><br>
            <input id="lb_tx" type="number" value="100" step="5"><br><br>

            <label>Feedline Loss (dB):</label><br>
            <input id="lb_feed" type="number" value="1.0" step="0.1"><br><br>

            <label>Antenna Gain (dBi):</label><br>
            <input id="lb_gain" type="number" value="2.1" step="0.1"><br><br>

            <label>Ground Loss (dB):</label><br>
            <input id="lb_ground" type="number" value="1.5" step="0.1"><br><br>

            <label>Path Distance (km):</label><br>
            <input id="lb_dist" type="number" value="3000" step="100"><br><br>

            <label>Frequency (MHz):</label><br>
            <input id="lb_freq" type="number" value="14.2" step="0.1"><br><br>

            <label>Receiver Noise Floor (dBm):</label><br>
            <input id="lb_noise" type="number" value="-110" step="1"><br><br>

            <button class="btn-primary" onclick="runLinkBudget()">Simulate Link</button>
        </div>

        <div id="lb_results"></div>
    `;
}

/* ------------------------------------------------------------
   Link Budget Math
   ------------------------------------------------------------ */

/**
 * Convert dB to linear
 */
function dbToLin(db) {
    return Math.pow(10, db / 10);
}

/**
 * Convert linear to dB
 */
function linToDb(lin) {
    return 10 * Math.log10(lin);
}

/**
 * Apply loss:
 * Pout = Pin * 10^(-loss/10)
 */
function applyLoss(Pin, lossDb) {
    return Pin * Math.pow(10, -lossDb / 10);
}

/**
 * Free-space path loss (FSPL):
 * FSPL(dB) = 32.44 + 20log(f MHz) + 20log(d km)
 */
function fspl(freq, dist) {
    return 32.44 + 20 * Math.log10(freq) + 20 * Math.log10(dist);
}

/**
 * Ionospheric loss approximation:
 * L_iono ≈ 10–20 dB depending on MUF proximity
 */
function ionoLoss(freq, MUF) {
    if (freq > MUF) return 40;   // unusable
    const ratio = freq / MUF;
    return 10 + 20 * (1 - ratio);
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function linkPoster(SNRdb) {
    const cx = 400;
    const cy = 300;

    const barWidth = 300;
    const scaled = Math.max(0, Math.min(barWidth, (SNRdb + 20) * 5));

    const inner = `
        ${svgTitle("Link SNR")}

        ${svgLine(cx - barWidth/2, cy, cx + barWidth/2, cy, "#444", 20)}
        ${svgLine(cx - barWidth/2, cy, cx - barWidth/2 + scaled, cy, "#1e8f3f", 20)}

        ${svgLabel(SNRdb.toFixed(1) + " dB", cx - 20, cy - 30)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runLinkBudget = function () {
    const Ptx = parseFloat(document.getElementById("lb_tx").value);
    const Lfeed = parseFloat(document.getElementById("lb_feed").value);
    const Gant = parseFloat(document.getElementById("lb_gain").value);
    const Lground = parseFloat(document.getElementById("lb_ground").value);
    const dist = parseFloat(document.getElementById("lb_dist").value);
    const freq = parseFloat(document.getElementById("lb_freq").value);
    const Nfloor = parseFloat(document.getElementById("lb_noise").value);

    // Step 1: Apply feedline + ground losses
    const P_after_feed = applyLoss(Ptx, Lfeed);
    const P_after_ground = applyLoss(P_after_feed, Lground);

    // Step 2: Add antenna gain
    const EIRP = P_after_ground * dbToLin(Gant);

    // Step 3: Path loss
    const Lfs = fspl(freq, dist);

    // Step 4: Ionospheric loss (simple model)
    const MUF = freq * 1.2; // placeholder: assume MUF slightly above freq
    const Liono = ionoLoss(freq, MUF);

    // Step 5: Received power
    const Prx = EIRP / dbToLin(Lfs + Liono);
    const PrxDbm = linToDb(Prx) + 30; // convert W → dBm

    // Step 6: SNR
    const SNRdb = PrxDbm - Nfloor;

    const poster = linkPoster(SNRdb);

    const html = `
        <div class="card">
            <h3>HF Link Budget Summary</h3>

            <strong>Transmit Power:</strong> ${Ptx} W<br>
            <strong>EIRP:</strong> ${EIRP.toFixed(2)} W<br><br>

            <strong>Free-Space Path Loss:</strong> ${Lfs.toFixed(1)} dB<br>
            <strong>Ionospheric Loss:</strong> ${Liono.toFixed(1)} dB<br><br>

            <strong>Received Power:</strong> ${PrxDbm.toFixed(1)} dBm<br>
            <strong>Noise Floor:</strong> ${Nfloor} dBm<br>
            <strong>SNR:</strong> ${SNRdb.toFixed(1)} dB<br><br>

            <p>SNR above 10 dB is readable.</p>
            <p>SNR above 20 dB is solid copy.</p>
            <p>SNR above 30 dB is broadcast quality.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("lb_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Link Budget Notes</h3>
        <p>HF links depend heavily on ionospheric conditions.</p>
        <p>Feedline and ground losses reduce EIRP.</p>
        <p>Path loss increases with distance and frequency.</p>
        <p>SNR determines readability more than raw signal strength.</p>
    `;
};
