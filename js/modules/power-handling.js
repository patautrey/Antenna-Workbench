export default function(content) {
    content.innerHTML = `
        <h2>Thermal Power Handling Lab</h2>
        <p>Module loaded successfully.</p>
    `;

    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Thermal Power Handling Lab — Info Panel</h3>
        <p>This module will analyze conductor heating, dielectric breakdown, and safe operating limits for HF systems.</p>
    `;
}
