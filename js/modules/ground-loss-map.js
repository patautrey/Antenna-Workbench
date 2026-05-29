export default function(content) {
    content.innerHTML = `
        <h2>Ground Loss Mapping Engine</h2>
        <p>Module loaded successfully.</p>
    `;

    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Ground Loss Mapping Engine — Info Panel</h3>
        <p>This module will analyze soil conductivity, dielectric constants, and ground loss impact on antenna efficiency.</p>
    `;
}
