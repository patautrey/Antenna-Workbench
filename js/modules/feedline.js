export default function(content) {
    content.innerHTML = `
        <h2>Feedline & CMC Engine</h2>
        <p class="vd-subtitle">
            Analyze coax loss, SWR transformation, and common‑mode current behavior across HF bands.
        </p>

        <div class="fl-layout">
            <div class="fl-column fl-left">
                <h3>Feedline Parameters</h3>

                <div class="fl-field">
                    <label for="fl-type">Coax Type</label>
                    <select id="fl-type">
                        <option value="rg58">RG‑58</option>
                        <option value="rg8x" selected>RG‑8X</option>
                        <option value="rg213">RG‑213</option>
                        <option value="lmr240">LMR‑240</option>
                        <option value="lmr400">LMR‑400</option>
                    </select>
                </div>

                <div class="fl-field">
                    <label for="fl-length">Length (ft)</label>
                    <input id="fl-length" type="number" step="1" value="50">
                </div>

                <div class="fl-field">
                    <label for="fl-freq">Frequency (MHz)</label>
                    <input id="fl-freq" type="number" step="0.1" value="14.2">
                </div>

                <div class="fl-field">
                    <label for="fl-swr">Load SWR</label>
                    <input id="fl-swr" type="number" step="0.1" value="1.5">
                </div>

                <button id="fl-compute-btn">Compute</button>
            </div>

            <div class="fl-column fl-right">
                <h3>Results</h3>
                <div id="fl-results" class="fl-results">
                    <p>Enter feedline parameters and click <strong>Compute</strong>.</p>
                </div>

                <h3>Coax Reference Data</h3>
                <div id="fl-ref" class="fl-ref"></div>
            </div>
        </div>
    `;

    // INFO PANEL
    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Feedline & CMC Engine — Info Panel</h3>
        <p>
            This module estimates coax loss, SWR transformation, and common‑mode current risk.
        </p>
        <ul>
            <li>Loss is frequency‑dependent and coax‑type‑dependent.</li>
            <li>SWR at the radio differs from SWR at the antenna.</li>
            <li>CMC risk increases with imbalance, poor grounding, and long feedlines.</li>
        </ul>
        <p>Future versions will include choke design, ferrite selection, and CMC modeling.</p>
    `;

    // --- FEEDLINE DATA ---
    const coaxData = {
        rg58:  { loss: 1.5 },   // dB per 100 ft @ 14 MHz (approx)
        rg8x:  { loss: 1.1 },
        rg213: { loss: 0.7 },
        lmr240:{ loss: 0.8 },
        lmr400:{ loss: 0.5 }
    };

    const typeEl = document.getElementById("fl-type");
    const lenEl = document.getElementById("fl-length");
    const freqEl = document.getElementById("fl-freq");
    const swrEl = document.getElementById("fl-swr");
    const btn = document.getElementById("fl-compute-btn");
    const resultsEl = document.getElementById("fl-results");
    const refEl = document.getElementById("fl-ref");

    function updateRef() {
        const type = typeEl.value;
        const d = coaxData[type];

        refEl.innerHTML = `
            <table class="fl-table">
                <tr><th>Coax Type</th><th>Loss @ 14 MHz</th></tr>
                <tr><td>${type.toUpperCase()}</td><td>${d.loss} dB / 100 ft</td></tr>
            </table>
        `;
    }

    function compute() {
        const type = typeEl.value;
        const length = parseFloat(lenEl.value);
        const freq = parseFloat(freqEl.value);
        const swr = parseFloat(swrEl.value);

        const baseLoss = coaxData[type].loss;
        const freqFactor = freq / 14.0;
        const loss = baseLoss * freqFactor * (length / 100);

        const swrAtRadio = Math.max(1, swr * (1 + loss / 10));

        resultsEl.innerHTML = `
            <p><strong>Coax Type:</strong> ${type.toUpperCase()}</p>
            <p><strong>Length:</strong> ${length} ft</p>
            <p><strong>Frequency:</strong> ${freq.toFixed(1)} MHz</p>
            <p><strong>Estimated Loss:</strong> ${loss.toFixed(2)} dB</p>
            <p><strong>SWR at Radio:</strong> ${swrAtRadio.toFixed(2)}</p>
            <hr>
            <p><em>Note:</em> These are simplified estimates. Future versions will include ferrite choke modeling and CMC prediction.</p>
        `;
    }

    updateRef();
    typeEl.addEventListener("change", updateRef);
    btn.addEventListener("click", compute);
}
