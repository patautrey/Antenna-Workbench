export default function(content) {
    content.innerHTML = `
        <h2>Coupling Simulator</h2>
        <p>Module loaded successfully.</p>
    `;

    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Coupling Simulator — Info Panel</h3>
        <p>This module will model mutual coupling between antennas, feedlines, and nearby conductors.</p>
    `;
}
