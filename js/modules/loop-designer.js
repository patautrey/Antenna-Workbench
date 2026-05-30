case "#loop": {
    const root = document.querySelector("#content");

    root.innerHTML = `
        <section class="tool">
            <h2>Horizontal Loop / Skyloop Designer</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="loop-freq" type="number" step="0.01">
                </label>

                <label>Height (m)
                    <input id="loop-height" type="number" step="0.01">
                </label>

                <label>Perimeter (m)
                    <input id="loop-perimeter" type="number" step="0.01">
                </label>
            </div>

            <h3>NVIS Reflector (Optional)</h3>

            <label>NVIS Reflector?
                <select id="loop-refl-enabled">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </label>

            <div class="field-grid">
                <label>Reflector Wires
                    <input id="loop-refl-num" type="number">
                </label>

                <label>Spacing (m)
                    <input id="loop-refl-spacing" type="number" step="0.01">
                </label>

                <label>Offset (m)
                    <input id="loop-refl-offset" type="number" step="0.01">
                </label>

                <label>Reflector Height (m)
                    <input id="loop-refl-height" type="number" step="0.01">
                </label>
            </div>

            <button id="loop-compute">Compute Loop</button>

            <div id="loop-summary" class="summary"></div>
        </section>
    `;

    import("./modules/loop-designer.js").then(m => m.default(root));
    break;
}
