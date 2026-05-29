export default function(content) {
    content.innerHTML = `
        <h2>Doublet Designer</h2>
        <p class="vd-subtitle">
            Multi‑band HF doublet length planning, feedline selection, and current distribution guidance.
        </p>

        <div class="dbl-layout">
            <div class="dbl-column dbl-left">
                <h3>Doublet Parameters</h3>

                <div class="dbl-field">
                    <label for="dbl-band">Primary Band</label>
                    <select id="dbl-band">
                        <option value="3.5">80 m (3.5 MHz)</option>
                        <option value="5.3">60 m (5.3 MHz)</option>
                        <option value="7.1" selected>40 m (7.1 MHz)</option>
                        <option value="10.1">30 m (10.1 MHz)</option>
                        <option value="14.2">20 m (14.2 MHz)</option>
                    </select>
                </div>

                <div class="dbl-field">
                    <label for="dbl-total">Total Doublet Length (ft)</label>
                    <input id="dbl-total" type="number" step="1" value="88">
                    <small>Total tip‑to‑tip wire length.</small>
                </div>

                <div class="dbl-field">
                    <label for="dbl-feedline">Feedline Type</label>
                    <select id="dbl-feedline">
                        <option value="ladder" selected>450Ω Ladder Line</option>
                        <option value="window">300Ω Window Line</option>
                        <option value="coax">Coax (not recommended)</option>
                    </select>
                </div>

                <div class="dbl-field">
                    <label for="dbl-feedlen">Feedline Length (ft)</label>
                    <input id="dbl-feedlen" type="number" step="1" value="50">
                </div>

                <button id="dbl-compute-btn">Compute Doublet</button>
            </div>

            <div class="dbl-column dbl-right">
                <h3>Doublet Summary</h3>
                <div id="dbl-summary" class="dbl-summary">
                    <p>Enter parameters and click <strong>Compute Doublet</strong>.</p>
                </div>

                <h3>Reference Data</h3>
                <div id="dbl-ref" class="dbl-ref"></div>
            </div>
        </div>
    `;

    // INFO PANEL
    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Doublet Designer — Info Panel</h3>
        <p>
            A doublet is a non‑resonant multi‑band HF antenna fed with balanced line and a tuner.
            Length selection affects current distribution, feedline impedance, and tuner load.
        </p>
        <ul>
            <li>Best lengths avoid exact multiples of ½λ on any band.</li>
            <li>88 ft and 135 ft are classic multi‑band choices.</li>
            <li>Balanced line minimizes loss under high SWR.</li>
            <li>Coax is discouraged due to extreme mismatch loss.</li>
        </ul>
        <p>Future versions will include impedance charts and tuner stress modeling.</p>
    `;

    const c = 300; // λ(m) ≈ 300 / f(MHz)

    const bandEl = document.getElementById("dbl-band");
    const totalEl = document.getElementById("dbl-total");
    const feedTypeEl = document.getElementById("dbl-feedline");
    const feedLenEl = document.getElementById("dbl-feedlen");
    const btn = document.getElementById("dbl-compute-btn");
    const summaryEl = document.getElementById("dbl-summary");
    const refEl = document.getElementById("dbl-ref");

    function computeRefs() {
        const fMHz = parseFloat(bandEl.value);
        const lambda = c / fMHz;
        const half = lambda / 2;
        const qtr = lambda / 4;

        refEl.innerHTML = `
            <table class="dbl-table">
                <tr><th>Parameter</th><th>Value</th></tr>
                <tr><td>Frequency</td><td>${fMHz.toFixed(2)} MHz</td></tr>
                <tr><td>Wavelength (λ)</td><td>${lambda.toFixed(2)} m</td></tr>
                <tr><td>½ λ</td><td>${half.toFixed(2)} m</td></tr>
                <tr><td>¼ λ</td><td>${qtr.toFixed(2)} m</td></tr>
            </table>
        `;

        return { fMHz, lambda, half, qtr };
    }

    function computeDoublet() {
        const { fMHz, lambda, half, qtr } = computeRefs();

        const totalFt = parseFloat(totalEl.value);
        const totalM = totalFt * 0.3048;
        const legM = totalM / 2;

        const feedType = feedTypeEl.value;
        const feedLenFt = parseFloat(feedLenEl.value);

        let feedText;
        switch (feedType) {
            case "ladder":
                feedText = "450Ω ladder line — excellent for high SWR, minimal loss.";
                break;
            case "window":
                feedText = "300Ω window line — good performance, slightly higher loss.";
                break;
            case "coax":
                feedText = "Coax — NOT recommended due to extreme mismatch loss.";
                break;
        }

        const legRatio = legM / (lambda / 2);
        let resonanceDesc;
        if (legRatio < 0.4) resonanceDesc = "Short doublet — high impedance, current peaks near feedpoint.";
        else if (legRatio < 0.6) resonanceDesc = "Near half‑wave — moderate impedance, good current distribution.";
        else resonanceDesc = "Long doublet — multiple current peaks, complex impedance.";

        const bands = [
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

        let coverage = "";
        bands.forEach(b => {
            const lam = 300 / b.freq;
            const leg = legM;
            const ratio = leg / (lam / 2);

            let status;
            if (ratio < 0.3) status = "High Z — tuner load heavy";
            else if (ratio < 0.6) status = "Good match region";
            else if (ratio < 1.2) status = "Multiple peaks — workable";
            else status = "Complex impedance — tuner stress likely";

            coverage += `
                <tr>
                    <td>${b.name}</td>
                    <td>${b.freq} MHz</td>
                    <td>${status}</td>
                </tr>
            `;
        });

        summaryEl.innerHTML = `
            <p><strong>Total Length:</strong> ${totalFt} ft (${totalM.toFixed(2)} m)</p>
            <p><strong>Leg Length:</strong> ${(totalFt / 2).toFixed(1)} ft</p>
            <p><strong>Primary Band:</strong> ${fMHz.toFixed(2)} MHz</p>
            <p><strong>Resonance Region:</strong> ${resonanceDesc}</p>
            <p><strong>Feedline:</strong> ${feedText}</p>
            <p><strong>Feedline Length:</strong> ${feedLenFt} ft</p>
            <hr>
            <h4>Multi‑Band Coverage</h4>
            <table class="dbl-table">
                <tr><th>Band</th><th>Freq</th><th>Match Behavior</th></tr>
                ${coverage}
            </table>
            <p><em>Note:</em> Balanced tuners handle these loads far better than coax‑fed systems.</p>
        `;
    }

    computeRefs();
    btn.addEventListener("click", computeDoublet);
    bandEl.addEventListener("change", computeRefs);
    totalEl.addEventListener("input", computeRefs);
}
