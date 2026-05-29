export default function(content) {
    content.innerHTML = `
        <h2>Vertical Designer</h2>
        <p class="vd-subtitle">
            Rapid‑design HF verticals for portable and fixed operation. Choose band, target height, and environment.
        </p>

        <div class="vd-layout">
            <div class="vd-column vd-left">
                <h3>Design Inputs</h3>

                <div class="vd-field">
                    <label for="vd-band">Band</label>
                    <select id="vd-band">
                        <option value="3.5">80 m (3.5 MHz)</option>
                        <option value="5.3">60 m (5.3 MHz)</option>
                        <option value="7.1">40 m (7.1 MHz)</option>
                        <option value="10.1">30 m (10.1 MHz)</option>
                        <option value="14.2" selected>20 m (14.2 MHz)</option>
                        <option value="18.1">17 m (18.1 MHz)</option>
                        <option value="21.2">15 m (21.2 MHz)</option>
                        <option value="24.9">12 m (24.9 MHz)</option>
                        <option value="28.5">10 m (28.5 MHz)</option>
                    </select>
                </div>

                <div class="vd-field">
                    <label for="vd-ground">Ground / Radials</label>
                    <select id="vd-ground">
                        <option value="poor">Poor ground, few radials</option>
                        <option value="average" selected>Average ground, 8–16 radials</option>
                        <option value="good">Good ground, 32+ radials</option>
                        <option value="elevated">Elevated radials (2–4 tuned)</option>
                    </select>
                </div>

                <div class="vd-field">
                    <label for="vd-height">Physical height (m)</label>
                    <input id="vd-height" type="number" step="0.1" value="10">
                    <small>Tip‑to‑ground physical height of the vertical radiator.</small>
                </div>

                <div class="vd-field">
                    <label for="vd-wire-type">Radiator type</label>
                    <select id="vd-wire-type">
                        <option value="wire" selected>Wire (portable / guyed)</option>
                        <option value="tubing">Aluminum tubing</option>
                        <option value="whip">Telescoping whip</option>
                    </select>
                </div>

                <button id="vd-design-btn">Compute Design</button>
            </div>

            <div class="vd-column vd-right">
                <h3>Design Summary</h3>
                <div id="vd-summary" class="vd-summary">
                    <p>Select band and height, then click <strong>Compute Design</strong>.</p>
                </div>

                <h3>Reference Lengths</h3>
                <div id="vd-ref" class="vd-ref">
                    <!-- Filled by JS -->
                </div>
            </div>
        </div>
    `;

    // Attach Info Panel content
    const info = document.getElementById("sidebar");
    if (info) {
        info.innerHTML = `
            <h3>Vertical Designer — Info Panel</h3>
            <p>
                This tool estimates practical HF vertical dimensions and operating characteristics based on band,
                physical height, and ground system quality.
            </p>
            <ul>
                <li><strong>Band:</strong> Sets design frequency and wavelength.</li>
                <li><strong>Height:</strong> Compared against 1/4λ, 3/8λ, and 1/2λ references.</li>
                <li><strong>Ground / Radials:</strong> Used to estimate efficiency and loss.</li>
            </ul>
            <p>
                Future versions can integrate NEC modeling, pattern estimation, and radial optimization.
            </p>
        `;
    }

    // --- Logic ---

    const c = 300; // m/µs ~ 300,000 km/s → λ(m) ≈ 300 / f(MHz)

    const bandEl = document.getElementById("vd-band");
    const groundEl = document.getElementById("vd-ground");
    const heightEl = document.getElementById("vd-height");
    const wireTypeEl = document.getElementById("vd-wire-type");
    const btn = document.getElementById("vd-design-btn");
    const summaryEl = document.getElementById("vd-summary");
    const refEl = document.getElementById("vd-ref");

    function computeRefs() {
        const fMHz = parseFloat(bandEl.value || "14.2");
        const lambda = c / fMHz; // meters
        const qtr = lambda / 4;
        const threeEighth = lambda * 0.375;
        const half = lambda / 2;

        refEl.innerHTML = `
            <table class="vd-table">
                <tr><th>Parameter</th><th>Value</th></tr>
                <tr><td>Frequency</td><td>${fMHz.toFixed(2)} MHz</td></tr>
                <tr><td>Wavelength (λ)</td><td>${lambda.toFixed(2)} m</td></tr>
                <tr><td>¼ λ</td><td>${qtr.toFixed(2)} m</td></tr>
                <tr><td>⅜ λ</td><td>${threeEighth.toFixed(2)} m</td></tr>
                <tr><td>½ λ</td><td>${half.toFixed(2)} m</td></tr>
            </table>
        `;

        return { lambda, qtr, threeEighth, half, fMHz };
    }

    function estimateEfficiency(groundQuality, heightRatio) {
        // Very rough qualitative mapping for now
        let base;
        switch (groundQuality) {
            case "poor": base = 0.35; break;
            case "average": base = 0.55; break;
            case "good": base = 0.75; break;
            case "elevated": base = 0.8; break;
            default: base = 0.5;
        }

        // Height factor: closer to 1/4–3/8λ is better
        const idealCenter = 0.32; // between 0.25 and 0.375
        const deviation = Math.abs(heightRatio - idealCenter);
        const heightFactor = Math.max(0.4, 1 - deviation * 3); // clamp

        return base * heightFactor;
    }

    function describeHeightRegion(heightRatio) {
        if (heightRatio < 0.15) return "very short (loaded) vertical region";
        if (heightRatio < 0.25) return "short vertical, below ¼λ";
        if (heightRatio < 0.35) return "near ¼–⅜λ sweet spot";
        if (heightRatio < 0.55) return "approaching ½λ, higher angle components increase";
        return "tall radiator region, pattern becomes more complex";
    }

    function onDesign() {
        const { lambda, qtr, threeEighth, half, fMHz } = computeRefs();
        const h = parseFloat(heightEl.value || "10");
        const groundQuality = groundEl.value;
        const wireType = wireTypeEl.value;

        const heightRatio = h / lambda;
        const eff = estimateEfficiency(groundQuality, heightRatio);
        const effPct = (eff * 100).toFixed(0);
        const regionDesc = describeHeightRegion(heightRatio);

        let groundText;
        switch (groundQuality) {
            case "poor":
                groundText = "High ground loss expected; additional radials or elevated system strongly recommended.";
                break;
            case "average":
                groundText = "Reasonable performance; more radials will still improve efficiency.";
                break;
            case "good":
                groundText = "Low ground loss; system should perform very well if matched correctly.";
                break;
            case "elevated":
                groundText = "Elevated tuned radials; current distribution is more controlled and efficient.";
                break;
            default:
                groundText = "Ground system not specified.";
        }

        let wireText;
        switch (wireType) {
            case "wire":
                wireText = "Lightweight wire radiator — ideal for portable or guyed installations.";
                break;
            case "tubing":
                wireText = "Tubular radiator — mechanically robust, broader bandwidth than thin wire.";
                break;
            case "whip":
                wireText = "Telescoping whip — convenient but may require loading for lower bands.";
                break;
            default:
                wireText = "Radiator type not specified.";
        }

        summaryEl.innerHTML = `
            <p><strong>Design frequency:</strong> ${fMHz.toFixed(2)} MHz</p>
            <p><strong>Physical height:</strong> ${h.toFixed(1)} m (${(heightRatio * 100).toFixed(1)}% of λ)</p>
            <p><strong>Height region:</strong> ${regionDesc}</p>
            <p><strong>Estimated efficiency:</strong> ~${effPct}% (very rough qualitative estimate)</p>
            <p><strong>Ground system:</strong> ${groundText}</p>
            <p><strong>Radiator type:</strong> ${wireText}</p>
            <hr>
            <p>
                <em>Next steps:</em> refine this design with real measurements, NEC modeling, or on‑air A/B testing.
            </p>
        `;
    }

    // Initial reference table
    computeRefs();

    // Wire events
    if (btn) btn.addEventListener("click", onDesign);
    if (bandEl) bandEl.addEventListener("change", computeRefs);
}
