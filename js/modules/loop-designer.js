// /HF-Workbench/js/modules/loop-designer.js
// Horizontal Loop / Skyloop Designer module

export default function initLoopDesigner(root) {
    if (!root) return;

    root.innerHTML = `
        <section class="tool" style="line-height: 1.45;">

            <h2 style="margin-bottom: 1rem;">Horizontal Loop Designer</h2>

            <div class="field-grid" style="row-gap: 1rem; margin-bottom: 1.5rem;">
                <label>Frequency (MHz)
                    <input id="loop-freq" type="number" step="0.01" value="3.55">
                </label>

                <label>Height (m)
                    <input id="loop-height" type="number" step="0.01" value="5">
                </label>

                <label>Perimeter (m)
                    <input id="loop-perimeter" type="number" step="0.01" value="284">
                </label>
            </div>

            <h3 style="margin-top: 1.5rem; margin-bottom: 0.75rem;">NVIS Reflector (Optional)</h3>

            <label style="display:block; margin-bottom: 1rem;">NVIS Reflector?
                <select id="loop-refl-enabled">
                    <option value="no" selected>No</option>
                    <option value="yes">Yes</option>
                </select>
            </label>

            <div class="field-grid" style="row-gap: 1rem; margin-bottom: 1.5rem;">
                <label>Reflector Wires
                    <input id="loop-refl-num" type="number" value="0">
                </label>

                <label>Spacing (m)
                    <input id="loop-refl-spacing" type="number" step="0.01" value="0">
                </label>

                <label>Offset (m)
                    <input id="loop-refl-offset" type="number" step="0.01" value="0">
                </label>

                <label>Reflector Height (m)
                    <input id="loop-refl-height" type="number" step="0.01" value="0">
                </label>
            </div>

            <button id="loop-compute" style="margin-top: 1rem; margin-bottom: 1.5rem;">
                Compute Loop
            </button>

            <div id="loop-summary" class="summary" 
                 style="margin-top: 1.5rem; padding: 1rem; border-radius: 6px;">
            </div>

        </section>
    `;

    const freqInput = document.getElementById("loop-freq");
    const heightInput = document.getElementById("loop-height");
    const perimInput = document.getElementById("loop-perimeter");
    const reflEnabled = document.getElementById("loop-refl-enabled");
    const reflNum = document.getElementById("loop-refl-num");
    const reflSpacing = document.getElementById("loop-refl-spacing");
    const reflOffset = document.getElementById("loop-refl-offset");
    const reflHeight = document.getElementById("loop-refl-height");
    const summaryDiv = document.getElementById("loop-summary");
    const button = document.getElementById("loop-compute");

    if (!button || !summaryDiv) return;

    button.addEventListener("click", () => {
        const f = parseFloat(freqInput.value) || 0;
        const h = parseFloat(heightInput.value) || 0;
        const p = parseFloat(perimInput.value) || 0;

        const reflOn = reflEnabled.value === "yes";
        const rn = parseInt(reflNum.value) || 0;
        const rs = parseFloat(reflSpacing.value) || 0;
        const ro = parseFloat(reflOffset.value) || 0;
        const rh = parseFloat(reflHeight.value) || 0;

        const band =
            f >= 1.8 && f <= 2.0 ? "160m (1.8–2.0 MHz)" :
            f >= 3.4 && f <= 4.0 ? "80m (3.5–4.0 MHz)" :
            f >= 5.0 && f <= 6.0 ? "60m (5–6 MHz)" :
            f >= 6.9 && f <= 7.5 ? "40m (7–7.3 MHz)" :
            f >= 10.0 && f <= 11.0 ? "30m (10–11 MHz)" :
            f >= 13.9 && f <= 14.5 ? "20m (14–14.35 MHz)" :
            f >= 20.9 && f <= 21.5 ? "15m (21–21.45 MHz)" :
            f >= 27.9 && f <= 29.8 ? "10m (28–29.7 MHz)" :
            "Unknown band";

        const wavelength = 300 / (f || 1);
        const approxGain = 3 + Math.log10((p || 1) / wavelength) * 2;
        const toa = Math.max(5, Math.min(90, 90 - (h / wavelength) * 45));

        let reflText = "NVIS reflector: disabled";
        if (reflOn) {
            reflText = `NVIS reflector: ${rn} wires, spacing ${rs} m, offset ${ro} m, height ${rh} m`;
        }

        summaryDiv.innerHTML = `
            <p style="margin-bottom: 0.5rem;"><strong>Design frequency:</strong> ${f.toFixed(2)} MHz (${band})</p>
            <p style="margin-bottom: 0.5rem;"><strong>Perimeter:</strong> ${p.toFixed(1)} m</p>
            <p style="margin-bottom: 0.5rem;"><strong>Height:</strong> ${h.toFixed(1)} m</p>
            <p style="margin-bottom: 0.5rem;"><strong>Estimated gain:</strong> ${approxGain.toFixed(1)} dBi</p>
            <p style="margin-bottom: 0.5rem;"><strong>Estimated TOA:</strong> ${toa.toFixed(0)}°</p>
            <p style="margin-top: 0.75rem;">${reflText}</p>
        `;
    });
}
