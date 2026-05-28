/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Noise & RFI Lab
   ============================================================ */

import { svgWrapper, svgTitle, svgLine, svgLabel } from "../core/poster-engine.js";

console.log("noise-lab.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function noiseLabUI() {
    return `
        <h2>Noise & RFI Lab</h2>

        <div class="card">
            <label>Band (MHz):</label><br>
            <input id="noise_freq" type="number" value="7.2" step="0.1"><br><br>

            <label>Receiver Noise Figure (dB):</label><br>
            <input id="noise_nf" type="number" value="6" step="0.1"><br><br>

            <label>Man‑Made Noise Level (dB):</label><br>
            <select id="noise_env">
                <option value="40">Quiet Rural</option>
                <option value="50">Rural</option>
                <option value="60">Residential</option>
                <option value="70">Urban</option>
                <option value="80">Industrial</option>
            </select><br><br>

            <label>Signal Strength (dBm):</label><br>
            <input id="noise_sig" type="number" value="-90" step="1"><br><br>

            <button class="btn-primary" onclick="runNoiseLab()">Analyze</button>
        </div>

        <div id="noise_results"></div>
    `;
}

/* ------------------------------------------------------------
   Noise Math
   ------------------------------------------------------------ */

/**
 * Atmospheric noise approximation (ITU curves)
 * Lower bands have higher QRN.
 */
function atmosphericNoise(freqMhz) {
    if (freqMhz < 5) return 60;
    if (freqMhz < 10) return 50;
    if (freqMhz < 20) return 40;
    return 30;
}

/**
 * Receiver noise floor:
 * N = -174 dBm/Hz + 10log(BW) + NF
 * Assume 2.4 kHz SSB bandwidth.
 */
function receiverNoiseFloor(nf) {
    const bw = 2400;
    return -174 + 10 * Math.log10(bw) + nf;
}

/**
 * Total noise = max(atmospheric, man‑made, receiver)
 */
function totalNoise(atm, man, rx) {
    return Math.max(atm, man, rx);
}

/**
 * SNR = signal - noise
 */
function computeSnr(signal, noise) {
    return signal - noise;
}

/* ------------------------------------------------------------
   Poster Generator
   ------------------------------------------------------------ */

function noisePoster(noiseDbm, signalDbm) {
    const noiseY = 400 - noiseDbm;
    const sigY = 400 - signalDbm;

    const inner = `
        ${svgTitle("Noise Spectrum Diagram")}

        ${svgLabel("Signal", 100, sigY - 10)}
        ${svgLine(100, sigY, 700, sigY, "#00aa00", 4)}

        ${svgLabel("Noise Floor", 100, noiseY - 10)}
        ${svgLine(100, noiseY, 700, noiseY, "#cc0000", 4)}
    `;

    return svgWrapper(inner, 800, 500);
}

/* ------------------------------------------------------------
   Calculation Engine
   ------------------------------------------------------------ */

window.runNoiseLab = function () {
    const freq = parseFloat(document.getElementById("noise_freq").value);
    const nf = parseFloat(document.getElementById("noise_nf").value);
    const man = parseFloat(document.getElementById("noise_env").value);
    const sig = parseFloat(document.getElementById("noise_sig").value);

    const atm = atmosphericNoise(freq);
    const rx = receiverNoiseFloor(nf);
    const noise = totalNoise(atm, man, rx);
    const snr = computeSnr(sig, noise);

    const poster = noisePoster(noise, sig);

    const html = `
        <div class="card">
            <h3>Noise & RFI Analysis</h3>

            <strong>Band:</strong> ${freq} MHz<br><br>

            <strong>Atmospheric Noise:</strong> ${atm} dBm<br>
            <strong>Man‑Made Noise:</strong> ${man} dBm<br>
            <strong>Receiver Noise Floor:</strong> ${rx.toFixed(1)} dBm<br><br>

            <strong>Total Noise:</strong> ${noise} dBm<br><br>

            <strong>Signal Level:</strong> ${sig} dBm<br>
            <strong>SNR:</strong> ${snr.toFixed(1)} dB<br>
        </div>

        <div class="card">
            <h3>Poster</h3>
            ${poster}
        </div>
    `;

    document.getElementById("noise_results").innerHTML = html;

    // Sidebar update
    document.getElementById("sidebar").innerHTML = `
        <h3>Noise & RFI Notes</h3>
        <p>Atmospheric noise dominates low HF bands.</p>
        <p>Man‑made noise dominates in urban environments.</p>
        <p>Receiver noise matters most on high bands with low external noise.</p>
        <p>SNR determines readability far more than raw signal strength.</p>
    `;
};
