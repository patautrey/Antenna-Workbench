export default function(content) {
    content.innerHTML = `
        <h2>HF Antenna Optimization AI</h2>
        <p>Module loaded successfully.</p>
    `;

    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>HF Antenna Optimization AI — Info Panel</h3>
        <p>This module will use AI-assisted heuristics to optimize antenna geometry, height, feedpoint, and band performance.</p>
    `;
}
