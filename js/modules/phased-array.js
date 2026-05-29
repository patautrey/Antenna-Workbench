export default function(content) {
    content.innerHTML = `
        <h2>Phased Array Designer</h2>
        <p>Module loaded successfully.</p>
    `;

    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Phased Array Designer — Info Panel</h3>
        <p>This module will design multi‑element phased arrays, steering angles, and pattern synthesis.</p>
    `;
}
