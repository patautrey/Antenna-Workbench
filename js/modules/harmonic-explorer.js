export default function(content) {
    content.innerHTML = `
        <h2>Harmonic Explorer</h2>
        <p>Module loaded successfully.</p>
    `;

    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Harmonic Explorer — Info Panel</h3>
        <p>This module will visualize harmonic behavior, resonances, and unwanted radiation modes.</p>
    `;
}
