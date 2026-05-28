// Core module loader
export function loadModule(name) {
    const content = document.getElementById("content");
    content.innerHTML = `<h2>Loading ${name}...</h2>`;

    import(`./modules/${name}.js`)
        .then(module => {
            module.default(content);
        })
        .catch(err => {
            content.innerHTML = `
                <h2>Error loading module</h2>
                <p>${name}.js not found.</p>
            `;
            console.error(err);
        });
}
