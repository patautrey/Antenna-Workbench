export default function(content) {
    content.innerHTML = `
        <h2>System Gain Calculator</h2>
        <p>Module loaded successfully.</p>
    `;

    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>System Gain Calculator — Info Panel</h3>
        <p>This module will compute total system gain including antenna gain, feedline loss, and mismatch loss.</p>
    `;
}
