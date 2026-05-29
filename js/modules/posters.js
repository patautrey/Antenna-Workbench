export default function(content) {
    content.innerHTML = `
        <h2>Posters & Cheat Sheets</h2>
        <p class="vd-subtitle">
            Printable engineering reference posters for HF antennas, feedlines, and field deployment.
        </p>

        <div class="poster-layout">
            <div class="poster-column">
                <h3>Available Posters</h3>
                <ul class="poster-list">
                    <li data-poster="hf-bands">HF Band Chart</li>
                    <li data-poster="vertical-lengths">Vertical Length Guide</li>
                    <li data-poster="coax-loss">Coax Loss Chart</li>
                    <li data-poster="nvis">NVIS Deployment Guide</li>
                    <li data-poster="doublet">Doublet Length Chart</li>
                    <li data-poster="radials">Radial Field Guide</li>
                    <li data-poster="dx-angles">DX Takeoff Angles</li>
                </ul>
            </div>

            <div class="poster-column">
                <h3>Preview</h3>
                <div id="poster-preview" class="poster-preview">
                    <p>Select a poster from the list.</p>
                </div>
            </div>
        </div>
    `;

    // INFO PANEL
    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Posters & Cheat Sheets — Info Panel</h3>
        <p>
            This module provides printable engineering reference sheets for HF operation.
        </p>
        <ul>
            <li>HF band allocations</li>
            <li>Vertical antenna lengths</li>
            <li>Coax loss charts</li>
            <li>NVIS deployment geometry</li>
            <li>Doublet lengths and feedline considerations</li>
            <li>Radial field optimization</li>
            <li>DX takeoff angle references</li>
        </ul>
        <p>Future versions will export to PDF and PNG.</p>
    `;

    // POSTER PREVIEW LOGIC
    const preview = document.getElementById("poster-preview");
    const items = document.querySelectorAll(".poster-list li");

    items.forEach(item => {
        item.addEventListener("click", () => {
            const id = item.dataset.poster;

            switch (id) {
                case "hf-bands":
                    preview.innerHTML = `
                        <h4>HF Band Chart</h4>
                        <p>Shows all amateur HF bands with frequency ranges and common uses.</p>
                        <ul>
                            <li>160m — 1.8 MHz</li>
                            <li>80m — 3.5 MHz</li>
                            <li>60m — 5.3 MHz</li>
                            <li>40m — 7.1 MHz</li>
                            <li>30m — 10.1 MHz</li>
                            <li>20m — 14.2 MHz</li>
                            <li>17m — 18.1 MHz</li>
                            <li>15m — 21.2 MHz</li>
                            <li>12m — 24.9 MHz</li>
                            <li>10m — 28.5 MHz</li>
                        </ul>
                    `;
                    break;

                case "vertical-lengths":
                    preview.innerHTML = `
                        <h4>Vertical Length Guide</h4>
                        <p>¼λ, ⅜λ, and ½λ lengths for all HF bands.</p>
                        <p>Example: 20m → ¼λ ≈ 5.2 m</p>
                    `;
                    break;

                case "coax-loss":
                    preview.innerHTML = `
                        <h4>Coax Loss Chart</h4>
                        <p>Loss per 100 ft for common coax types across HF.</p>
                        <p>RG‑8X ≈ 1.1 dB @ 14 MHz</p>
                    `;
                    break;

                case "nvis":
                    preview.innerHTML = `
                        <h4>NVIS Deployment Guide</h4>
                        <p>Height vs. angle chart for NVIS optimization.</p>
                        <p>Best height: 0.1–0.2 λ</p>
                    `;
                    break;

                case "doublet":
                    preview.innerHTML = `
                        <h4>Doublet Length Chart</h4>
                        <p>Recommended doublet lengths for multi‑band HF operation.</p>
                        <p>44–88 ft typical for 40–10m coverage.</p>
                    `;
                    break;

                case "radials":
                    preview.innerHTML = `
                        <h4>Radial Field Guide</h4>
                        <p>Number and length of radials vs. efficiency.</p>
                        <p>32 radials → ~80% efficiency</p>
                    `;
                    break;

                case "dx-angles":
                    preview.innerHTML = `
                        <h4>DX Takeoff Angles</h4>
                        <p>Typical low‑angle radiation requirements for long‑distance HF work.</p>
                        <p>20m DX → 5–12°</p>
                    `;
                    break;

                default:
                    preview.innerHTML = `<p>No preview available.</p>`;
            }
        });
    });
}
