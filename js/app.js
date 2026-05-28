// Core module loader
export function loadModule(name) {
    const content = document.getElementById("content");
    content.innerHTML = `<h2>Loading ${name}...</h2>`;

    import(`./modules/${name}.js?v=3`)
        .then(module => {
            module.default(content);
        })
        .catch(err => {
            content.innerHTML = `
                <h2>Error loading module</h2>
                <p>Module file not found: ${name}.js</p>
            `;
            console.error("Module load error:", err);
        });
}
