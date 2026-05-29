export default function(content) {
    content.innerHTML = `
        <h2>DX Vertical Lab</h2>
        <p class="vd-subtitle">
            Low‑angle HF vertical optimization for long‑distance DX operation.
        </p>

        <div class="dxv-layout">
            <div class="dxv-column dxv-left">
                <h3>DX Vertical Parameters</h3>

                <div class="dxv-field">
                    <label for="dxv-band">Band</label>
                    <select id="dxv-band">
                        <option value="3.5">80 m (3.5 MHz)</option>
                        <option value="7.1">40 m (7.1 MHz)</option>
                        <option value="10.1">30 m (10.1 MHz)</option>
                        <option value="14.2" selected>20 m (14.2 MHz)</option>
                        <option value="18.1">17 m (18.1 MHz)</option>
                        <option value="21.2">15 m (21.2 MHz)</option>
                        <option value="24.9">12 m (24.9 MHz)</option>
                        <option value="28.5">10 m (28.5 MHz)</option>
                    </select>
                </div>

                <div class="dxv-field">
                    <label for="dxv-height">Vertical Height (m)</label>
                    <input id="dxv-height" type="number" step="0.1" value="10">
                    <small>Physical height of the radiator.</small>
                </div>

                <div class="dxv-field">
                    <label for="dxv-ground">Ground Quality</label>
                    <select id="dxv-ground">
                        <option value="poor">Poor</option>
                        <option value="average" selected>Average</option>
                        <option value="good">Good</option>
                        <option value="saltwater">Saltwater / Seaside</option>
                    </select>
                </div>

                <div class="dxv-field">
                    <label for="dxv-radials">Radials</label>
                    <select id="dxv-radials">
                        <option value="4">4 radials</option>
                        <option value="8">8 radials</option>
                        <option value="16" selected>16 radials</option>
                        <option value="32">32 radials</option>
                        <option value="64">64 radials</option>
                    </select>
                </div>

                <button id="dxv-compute-btn">Compute DX Vertical</button>
            </div>

            <div class="dxv-column dxv-right">
                <h3>DX Summary</h3>
                <div id="dxv-summary" class="dxv-summary">
                    <p>Enter parameters and click <strong>Compute DX Vertical</strong>.</p>
                </div>

                <h3>Reference Data</h3>
                <div id="dxv-ref" class="dxv-ref"></div>
            </div>
        </div>
    `;

    // INFO PANEL
    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>DX Vertical Lab — Info Panel</h3>
        <p>
            DX verticals rely on low takeoff angles (5–15°) and efficient ground systems.
            Height, ground quality, and radial count dramatically affect performance.
        </p>
        <ul>
            <li>Best DX height: 0.25–0.70 λ</li>
            <li>Saltwater provides exceptional low‑angle gain</li>
            <li>More radials reduce ground loss</li>
            <li>40m and 20m are prime DX bands</li>
        </ul>
        <p>Future versions will include NEC‑based pattern estimation.</p>
    `;

    const c = 300; // λ(m) ≈ 300 / f(MHz)

    const bandEl = document.getElementById("dxv-band");
    const heightEl = document.getElementById("dxv-height");
    const groundEl = document.getElementById("dxv-ground");
    const radialsEl = document.getElementById("dxv-radials");
    const btn = document.getElementById("dxv-compute-btn");
    const summaryEl = document.getElementById("dxv-summary");
    const refEl = document.getElementById("dxv-ref");

    function computeRefs() {
        const fMHz = parseFloat(bandEl.value);
        const lambda = c / fMHz;

        const qtr = lambda / 4;
        const threeEighth = lambda * 0.375;
        const half = lambda / 2;
        const sevenTenths = lambda * 0.70;

        refEl.innerHTML = `
            <table class="dxv-table">
                <tr><th>Parameter</th><th>Value</th></tr>
                <tr><td>Frequency</td><td>${fMHz.toFixed(2)} MHz</td></tr>
                <tr><td>Wavelength (λ)</td><td>${lambda.toFixed(2)} m</td></tr>
                <tr><td>¼ λ</td><td>${qtr.toFixed(2)} m</td></tr>
                <tr><td>⅜ λ</td><td>${threeEighth.toFixed(2)} m</td></tr>
                <tr><td>½ λ</td><td>${half.toFixed(2)} m</td></tr>
                <tr><td>0.70 λ</td><td>${sevenTenths.toFixed(2)} m</td></tr>
            </table>
        `;

        return { fMHz, lambda };
    }

    function describeHeight(ratio) {
        if (ratio < 0.15) return "Very short — high angle, poor DX";
        if (ratio < 0.25) return "Short vertical — moderate DX performance";
        if (ratio < 0.40) return "DX sweet spot — strong low‑angle radiation";
        if (ratio < 0.60) return "Tall radiator — excellent DX potential";
        if (ratio < 0.80) return "0.70 λ region — maximum low‑angle gain";
        return "Very tall — pattern becomes complex";
    }

    function computeDX() {
        const { fMHz, lambda } = computeRefs();

        const h = parseFloat(heightEl.value);
        const ratio = h / lambda;

        const ground = groundEl.value;
        const radials = parseInt(radialsEl.value);

        const heightDesc = describeHeight(ratio);

        let groundGain;
        switch (ground) {
            case "poor": groundGain = -2; break;
            case "average": groundGain = 0; break;
            case "good": groundGain = +1; break;
            case "saltwater": groundGain = +3; break;
        }

        let radialGain = 0;
        if (radials >= 64) radialGain = 1.5;
        else if (radials >= 32) radialGain = 1.0;
        else if (radials >= 16) radialGain = 0.5;
        else radialGain = 0.2;

        const heightGain = Math.max(0, (ratio - 0.25) * 6).toFixed(1);
        const totalGain = (parseFloat(heightGain) + groundGain + radialGain).toFixed(1);

        const takeoffAngle = Math.max(5, Math.min(25, 25 - ratio * 30)).toFixed(1);

        summaryEl.innerHTML = `
            <p><strong>Band:</strong> ${fMHz.toFixed(2)} MHz</p>
            <p><strong>Height:</strong> ${h.toFixed(1)} m (${(ratio * 100).toFixed(1)}% of λ)</p>
            <p><strong>Height Region:</strong> ${heightDesc}</p>
            <p><strong>Estimated Takeoff Angle:</strong> ${takeoffAngle}°</p>
            <p><strong>Ground Gain:</strong> ${groundGain} dB</p>
            <p><strong>Radial Gain:</strong> ${radialGain} dB</p>
            <p><strong>Height Gain:</strong> ${heightGain} dB</p>
            <hr>
            <p><strong>Total Estimated DX Gain:</strong> ${totalGain} dB</p>
            <p><em>Note:</em> Saltwater and 0.70 λ heights produce exceptional DX performance.</p>
        `;
    }

    computeRefs();
    btn.addEventListener("click", computeDX);
    bandEl.addEventListener("change", computeRefs);
    heightEl.addEventListener("input", computeRefs);
}
