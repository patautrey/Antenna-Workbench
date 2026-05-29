export default function(content) {
    content.innerHTML = `
        <h2>Propagation Lab</h2>
        <p class="vd-subtitle">
            HF propagation indicators, solar conditions, MUF/LSF estimates, and band‑by‑band usability snapshots.
        </p>

        <div class="prop-layout">
            <div class="prop-column prop-left">
                <h3>Solar & Geomagnetic Inputs</h3>

                <div class="prop-field">
                    <label for="prop-sfi">Solar Flux Index (SFI)</label>
                    <input id="prop-sfi" type="number" value="120">
                </div>

                <div class="prop-field">
                    <label for="prop-kp">Kp Index</label>
                    <input id="prop-kp" type="number" value="2">
                </div>

                <div class="prop-field">
                    <label for="prop-sn">Sunspot Number</label>
                    <input id="prop-sn" type="number" value="80">
                </div>

                <div class="prop-field">
                    <label for="prop-lat">Latitude (°)</label>
                    <input id="prop-lat" type="number" value="32">
                </div>

                <button id="prop-compute-btn">Compute Propagation</button>
            </div>

            <div class="prop-column prop-right">
                <h3>Propagation Summary</h3>
                <div id="prop-summary" class="prop-summary">
                    <p>Enter solar values and click <strong>Compute Propagation</strong>.</p>
                </div>

                <h3>Band Conditions</h3>
                <div id="prop-bands" class="prop-bands"></div>
            </div>
        </div>
    `;

    // INFO PANEL
    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Propagation Lab — Info Panel</h3>
        <p>
            This module provides simplified HF propagation estimates based on solar flux, geomagnetic activity,
            and latitude. It is not a replacement for VOACAP or real‑time ionospheric data, but gives a quick
            operational snapshot.
        </p>
        <ul>
            <li>SFI influences MUF and high‑band openings.</li>
            <li>Kp affects geomagnetic stability and polar absorption.</li>
            <li>Sunspot number correlates with ionization strength.</li>
            <li>Latitude influences MUF and D‑layer absorption.</li>
        </ul>
        <p>Future versions will integrate real‑time solar data APIs.</p>
    `;

    const sfiEl = document.getElementById("prop-sfi");
    const kpEl = document.getElementById("prop-kp");
    const snEl = document.getElementById("prop-sn");
    const latEl = document.getElementById("prop-lat");
    const btn = document.getElementById("prop-compute-btn");
    const summaryEl = document.getElementById("prop-summary");
    const bandsEl = document.getElementById("prop-bands");

    function computePropagation() {
        const sfi = parseFloat(sfiEl.value);
        const kp = parseFloat(kpEl.value);
        const sn = parseFloat(snEl.value);
        const lat = parseFloat(latEl.value);

        const muf = (sfi * 0.18 + sn * 0.12 + 10).toFixed(1);
        const luf = (kp * 1.2 + 2).toFixed(1);

        let stability;
        if (kp <= 2) stability = "Stable";
        else if (kp <= 4) stability = "Unsettled";
        else stability = "Disturbed";

        summaryEl.innerHTML = `
            <p><strong>SFI:</strong> ${sfi}</p>
            <p><strong>Kp Index:</strong> ${kp} (${stability})</p>
            <p><strong>Sunspot Number:</strong> ${sn}</p>
            <p><strong>Latitude:</strong> ${lat}°</p>
            <hr>
            <p><strong>Estimated MUF:</strong> ${muf} MHz</p>
            <p><strong>Estimated LUF:</strong> ${luf} MHz</p>
            <p><em>Note:</em> These are simplified estimates for quick field reference.</p>
        `;

        const bands = [
            { name: "160m", freq: 1.8 },
            { name: "80m", freq: 3.5 },
            { name: "60m", freq: 5.3 },
            { name: "40m", freq: 7.1 },
            { name: "30m", freq: 10.1 },
            { name: "20m", freq: 14.2 },
            { name: "17m", freq: 18.1 },
            { name: "15m", freq: 21.2 },
            { name: "12m", freq: 24.9 },
            { name: "10m", freq: 28.5 }
        ];

        let html = `<table class="prop-table">
            <tr><th>Band</th><th>Freq</th><th>Condition</th></tr>
        `;

        bands.forEach(b => {
            let cond;

            if (b.freq < luf) cond = "Closed (LUF too high)";
            else if (b.freq > muf) cond = "Closed (MUF too low)";
            else if (kp > 5 && b.freq > 14) cond = "Weak (geomagnetic)";
            else cond = "Open";

            html += `
                <tr>
                    <td>${b.name}</td>
                    <td>${b.freq} MHz</td>
                    <td>${cond}</td>
                </tr>
            `;
        });

        html += `</table>`;
        bandsEl.innerHTML = html;
    }

    btn.addEventListener("click", computePropagation);
}
