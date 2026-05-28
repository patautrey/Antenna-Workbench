/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Antenna Noise Figure & SNR Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("noise-snr-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function noiseSnrLabUI() {
    return `
        <h2>Antenna Noise Figure & SNR Lab</h2>

        <div class="card">
            <label>Frequency (MHz):</label><br>
            <input id="ns_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Receiver Noise Figure (dB):</label><br>
            <input id="ns_nf" type="number" value="6" step="0.5"><br><br>

            <label>Man-Made Noise Level (dB):</label><br>
            <input id="ns_man" type="number" value="20" step="1"><br><br>

            <label>Atmospheric Noise Level (dB):</label><br>
            <input id="ns_atm" type="number" value="10" step="1"><br><br>

            <label>Galactic Noise Level (dB):</label><br>
            <input id="ns_gal" type="number" value="15" step="1"><br><br>

            <label>Signal Power at Antenna (dBm):</label><br>
            <input id="ns_sig" type="number" value="-100" step="1"><br><br>

            <button class="btn-primary" onclick="runNoiseSnrLab()">Analyze Noise & SNR</button>
        </div>

        <div id="ns_results"></div>
    `;
}

/* ------------------------------------------------------------
   Noise Math
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
 * Total noise power:
 * N_total = N_man + N_atm + N_gal + N_rx
 */
function totalNoise(man, atm, gal, rx) {
    return man + atm + gal + rx;
}

/**
 * Receiver noise contribution:
 * N_rx = kTB * NF
 * We approximate with NF only (relative scale)
 */
function receiverNoise(NFdb) {
    return dbToLin(NFdb);
}

/**
 * SNR:
 * SNR = S / N
 */
function snr(S, N) {
    return S / N;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function noisePoster(man, atm, gal, rx) {
    const cx = 400;
    const cy = 300;

    const total = man + atm + gal + rx;
    const scale = 300 / total;

    const bars = [
        { label: "Man-Made", value: man, color: "#cc0000" },
        { label: "Atmospheric", value: atm, color: "#ff8800" },
        { label: "Galactic", value: gal, color: "#1e3a5f" },
        { label: "Receiver", value: rx, color: "#555" }
    ];

    let x = cx - 150;
    let rects = "";

    bars.forEach(b => {
        const w = b.value * scale;
        rects += `<rect x="${x}" y="${cy - 20}" width="${w}" height="40" fill="${b.color}" />`;
        rects += svgLabel(b.label, x + w / 2 - 20, cy + 40);
        x += w;
    });

    const inner = `
        ${svgTitle("Noise Contribution Breakdown")}
        ${rects}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runNoiseSnrLab = function () {
    const freq = parseFloat(document.getElementById("ns_freq").value);
    const NFdb = parseFloat(document.getElementById("ns_nf").value);
    const manDb = parseFloat(document.getElementById("ns_man").value);
    const atmDb = parseFloat(document.getElementById("ns_atm").value);
    const galDb = parseFloat(document.getElementById("ns_gal").value);
    const Sdbm = parseFloat(document.getElementById("ns_sig").value);

    const man = dbToLin(manDb);
    const atm = dbToLin(atmDb);
    const gal = dbToLin(galDb);
    const rx = receiverNoise(NFdb);

    const Ntotal = totalNoise(man, atm, gal, rx);
    const S = dbToLin(Sdbm);

    const SNR = snr(S, Ntotal);
    const SNRdb = linToDb(SNR);

    const poster = noisePoster(man, atm, gal, rx);

    const html = `
        <div class="card">
            <h3>Noise & SNR Analysis</h3>

            <strong>Frequency:</strong> ${freq} MHz<br>
            <strong>Receiver NF:</strong> ${NFdb} dB<br><br>

            <strong>Man-Made Noise:</strong> ${manDb} dB<br>
            <strong>Atmospheric Noise:</strong> ${atmDb} dB<br>
            <strong>Galactic Noise:</strong> ${galDb} dB<br><br>

            <strong>Total Noise Power:</strong> ${linToDb(Ntotal).toFixed(1)} dB (relative)<br>
            <strong>Signal Power:</strong> ${Sdbm} dBm<br>
            <strong>SNR:</strong> ${SNRdb.toFixed(1)} dB<br><br>

            <p>HF bands are dominated by external noise, not receiver noise.</p>
            <p>On HF, preamps rarely help because atmospheric noise dominates.</p>
            <p>On VHF/UHF, receiver noise figure becomes critical.</p>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("ns_results").innerHTML = html;

    document.getElementById("sidebar").innerHTML = `
        <h3>Noise Notes</h3>
        <p>HF noise is dominated by man-made and atmospheric sources.</p>
        <p>Receiver noise figure matters more above ~50 MHz.</p>
        <p>Galactic noise dominates 15–30 MHz.</p>
        <p>SNR determines readability more than raw signal strength.</p>
    `;
};
