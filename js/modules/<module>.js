export default function(content) {
    content.innerHTML = `
        <h2>MODULE NAME</h2>
        <p>Module loaded successfully.</p>
    `;

    // ⭐ Update the Info Panel
    const info = document.getElementById("sidebar");
    info.innerHTML = `
        <h3>Info Panel</h3>
        <p>This module will eventually display engineering notes, tips, and data.</p>
    `;
}
