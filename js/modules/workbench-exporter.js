export default function(content) {
    content.innerHTML = `
        <h2>Workbench Exporter & Packager</h2>
        <p>Module loaded successfully.</p>
    `;

    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Workbench Exporter & Packager — Info Panel</h3>
        <p>This module will bundle project data, module outputs, and engineering notes into exportable formats.</p>
    `;
}
