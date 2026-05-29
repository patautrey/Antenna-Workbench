export default function(content) {
    content.innerHTML = `
        <h2>Noise & SNR Lab</h2>
        <p>Module loaded successfully.</p>
    `;

    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Noise & SNR Lab — Info Panel</h3>
        <p>This panel will show noise floor models, SNR curves, and band‑specific noise predictions.</p>
    `;
}
