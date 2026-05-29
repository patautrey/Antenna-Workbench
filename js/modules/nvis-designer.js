export default function(content) {
    content.innerHTML = `
        <h2>NVIS Designer</h2>
        <p class="vd-subtitle">
            Near‑Vertical Incidence Skywave height optimization for regional HF coverage (0–500 miles).
        </p>

        <div class="nvis-layout">
            <div class="nvis-column nvis-left">
                <h3>NVIS Parameters</h3>

                <div class="nvis-field">
                    <label for="nvis-band">Band</label>
                    <select id="nvis-band">
                        <option value="3.5">80 m (3.5 MHz)</option>
                        <option value="5.3">60 m (5.3 MHz)</option>
                        <option value="7.1" selected>40 m (7.1 MHz)</option>
                    </select>
                </div>

                <div class="nvis-field">
                    <label for="nvis-height">Antenna Height (m)</label>
                    <input id="nvis-height" type="number" step="0.1" value="6">
                    <small>Height above ground of the horizontal radiator.</small>
                </div>

                <div class="nvis-field">
                    <label for="nvis-ground">Ground Quality</label>
                    <select id="nvis-ground">
                        <option value="poor">Poor</option>
                        <option value="average" selected>Average</option>
                        <option value="good">Good</option>
                    </select>
                </div>

                <div class="nvis-field">
                    <label for="nvis-time">Time of Day</label>
                    <select id="nvis-time">
                        <option value="day">Daytime</option>
                        <option value="night" selected>Nighttime</option>
                    </select>
                </div>

                <button id="nvis-compute-btn">Compute NVIS</button>
            </div>

            <div class="nvis-column nvis-right">
                <h3>NVIS Summary</h3>
                <div id="nvis-summary" class="nvis-summary">
                    <p>Select parameters and click <strong>Compute NVIS</strong>.</p>
                </div>

                <h3>Reference Data</h3>
                <div id="nvis-ref" class="nvis-ref"></div>
            </div>
        </div>
    `;

    // INFO PANEL
    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>NVIS Designer — Info Panel</h3>
        <p>
            NVIS (Near‑Vertical Incidence Skywave) is used for short‑range HF communication (0–500 miles).
            It requires a high takeoff angle (60–90°) and a low antenna height (0.1–0.25 λ).
        </p>
        <ul>
            <li>Best NVIS height: 0.1–0.2 λ</li>
            <li>Nighttime supports lower frequencies (80/60m)</li>
            <li>Daytime supports 40m NVIS when MUF is high enough</li>
            <li>Poor ground increases absorption</li>
        </ul>
        <p>Future versions will integrate real‑time ionospheric data.</p>
    `;

    const c = 300; // λ(m) ≈ 300 / f(MHz)

    const bandEl = document.getElementById("nvis-band");
    const heightEl = document.getElementById("nvis-height");
    const groundEl = document.getElementById("nvis-ground");
    const timeEl = document.getElementById("nvis-time");
    const btn = document.getElementById("nvis-compute-btn");
    const summaryEl = document.getElementById("nvis-summary");
    const refEl = document.getElementById("nvis-ref");

    function computeRefs() {
        const fMHz = parseFloat(bandEl.value);
        const lambda = c / fMHz;

        const h = parseFloat(heightEl.value);
        const ratio = h / lambda;

        refEl.innerHTML = `
            <table class="nvis-table">
                <tr><th>Parameter</th><th>Value</th></tr>
                <tr><td>Frequency</td><td>${fMHz.toFixed(2)} MHz</td></tr>
                <tr><td>Wavelength (λ)</td><td>${lambda.toFixed(2)} m</td></tr>
                <tr><td>Height Ratio</td><td>${(ratio * 100).toFixed(1)}% of λ</td></tr>
                <tr><td>Ideal NVIS Height</td><td>${(lambda * 0.15).toFixed(2)} m</td></tr>
            </table>
        `;

        return { fMHz, lambda, ratio };
    }

    function describeHeight(ratio) {
        if (ratio < 0.08) return "Too low — excessive ground absorption";
        if (ratio < 0.12) return "Low NVIS region — workable";
        if (ratio < 0.22) return "Optimal NVIS height";
        if (ratio < 0.35) return "High NVIS — still usable";
        return "Too high — NVIS weak, more low‑angle radiation";
    }

    function computeNVIS() {
        const { fMHz, lambda, ratio } = computeRefs();
        const h = parseFloat(heightEl.value);
        const ground = groundEl.value;
        const tod = timeEl.value;

        const heightDesc = describeHeight(ratio);

        let groundLoss;
        switch (ground) {
            case "poor": groundLoss = "High absorption — NVIS degraded"; break;
            case "average": groundLoss = "Moderate absorption — typical performance"; break;
            case "good": groundLoss = "Low absorption — strong NVIS return"; break;
        }

        let todEffect;
        if (tod === "day") {
            if (fMHz < 5) todEffect = "D‑layer absorption may be high — 80m weaker";
            else todEffect = "40m NVIS often strong during daytime";
        } else {
            if (fMHz < 5) todEffect = "80m/60m NVIS excellent at night";
            else todEffect = "40m NVIS depends on MUF and solar conditions";
        }

        const takeoffAngle = (80 - ratio * 120).toFixed(1);
        const clampedAngle = Math.max(60, Math.min(90, takeoffAngle));

        summaryEl.innerHTML = `
            <p><strong>Band:</strong> ${fMHz.toFixed(2)} MHz</p>
            <p><strong>Height:</strong> ${h.toFixed(1)} m (${(ratio * 100).toFixed(1)}% of λ)</p>
            <p><strong>Height Region:</strong> ${heightDesc}</p>
            <p><strong>Estimated Takeoff Angle:</strong> ${clampedAngle}°</p>
            <p><strong>Ground Effect:</strong> ${groundLoss}</p>
            <p><strong>Time‑of‑Day Effect:</strong> ${todEffect}</p>
            <hr>
            <p><em>Note:</em> NVIS performance depends heavily on ionospheric conditions and D‑layer absorption.</p>
        `;
    }

    computeRefs();
    btn.addEventListener("click", computeNVIS);
    bandEl.addEventListener("change", computeRefs);
    heightEl.addEventListener("input", computeRefs);
}
