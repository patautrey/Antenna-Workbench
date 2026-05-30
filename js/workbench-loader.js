// HF Workbench — Loader (module‑driven UI)

function renderHome(root) {
    root.innerHTML = `
        <section class="home">
            <h1>HF Workbench</h1>
            <p>Select a tool from the menu.</p>
        </section>
    `;
}

function renderHelp(root) {
    root.innerHTML = `
        <section class="page">
            <h1>Help</h1>
            <p>Use the navigation links above to choose a designer, then enter your parameters and click Compute.</p>
        </section>
    `;
}

function renderUserManual(root) {
    root.innerHTML = `
        <section class="page">
            <h1>User Manual</h1>
            <p>Detailed documentation for HF Workbench tools will appear here.</p>
        </section>
    `;
}

function renderQuickStart(root) {
    root.innerHTML = `
        <section class="page">
            <h1>Quick Start</h1>
            <p>Choose a band, enter height and length, then click Compute to see design guidance.</p>
        </section>
    `;
}

function renderGlossary(root) {
    root.innerHTML = `
        <section class="page">
            <h1>Glossary</h1>
            <p>Key HF and antenna terms will be listed here.</p>
        </section>
    `;
}

function loadRoute() {
    const hash = window.location.hash || "#home";
    const root = document.querySelector("#content");
    if (!root) return;

    switch (hash) {

        case "#doublet": {
            import("./modules/doublet-designer.js")
                .then(m => m.default(root))
                .catch(err => {
                    console.error("Error loading Doublet Designer:", err);
                    root.innerHTML = `<p>Error loading Doublet Designer.</p>`;
                });
            break;
        }

        case "#loop": {
            import("./modules/loop-designer.js")
                .then(m => m.default(root))
                .catch(err => {
                    console.error("Error loading Loop Designer:", err);
                    root.innerHTML = `<p>Error loading Horizontal Loop Designer.</p>`;
                });
            break;
        }

        case "#skyloop": {
            import("./modules/skyloop-designer.js")
                .then(m => m.default(root))
                .catch(err => {
                    console.error("Error loading Skyloop Designer:", err);
                    root.innerHTML = `<p>Error loading Skyloop Designer.</p>`;
                });
            break;
        }

        case "#vertical-dx": {
            import("./modules/vertical-dx-designer.js")
                .then(m => m.default(root))
                .catch(err => {
                    console.error("Error loading Vertical DX Designer:", err);
                    root.innerHTML = `<p>Error loading Vertical DX Designer.</p>`;
                });
            break;
        }

        case "#vertical-nvis": {
            import("./modules/vertical-nvis-designer.js")
                .then(m => m.default(root))
                .catch(err => {
                    console.error("Error loading Vertical NVIS Designer:", err);
                    root.innerHTML = `<p>Error loading Vertical NVIS Designer.</p>`;
                });
            break;
        }

        case "#performer": {
            import("./modules/performer.js")
                .then(m => m.default(root))
                .catch(err => {
                    console.error("Error loading Performer Vertical:", err);
                    root.innerHTML = `<p>Error loading Performer Vertical.</p>`;
                });
            break;
        }

        case "#dominator": {
            import("./modules/dominator.js")
                .then(m => {
                    if (m.loadDominatorArray) {
                        m.loadDominatorArray(root);
                    } else if (m.default) {
                        m.default(root);
                    } else {
                        root.innerHTML = `<p>Dominator module loaded, but no entry function was found.</p>`;
                    }
                })
                .catch(err => {
                    console.error("Error loading Dominator Array:", err);
                    root.innerHTML = `<p>Error loading Dominator Array.</p>`;
                });
            break;
        }

        case "#help": {
            renderHelp(root);
            break;
        }

        case "#user-manual": {
            renderUserManual(root);
            break;
        }

        case "#quick-start": {
            renderQuickStart(root);
            break;
        }

        case "#glossary": {
            renderGlossary(root);
            break;
        }

        case "#home":
        default: {
            renderHome(root);
            break;
        }
    }
}

function wireDropdowns() {
    const dropdownButtons = document.querySelectorAll(".dropdown-btn");

    dropdownButtons.forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const content = btn.nextElementSibling;

            document.querySelectorAll(".dropdown-content").forEach(dc => {
                if (dc !== content) dc.classList.remove("open");
            });

            if (content) {
                content.classList.toggle("open");
            }
        });
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-content").forEach(dc => dc.classList.remove("open"));
    });
}

window.addEventListener("DOMContentLoaded", () => {
    wireDropdowns();
    loadRoute();
});

window.addEventListener("hashchange", loadRoute);
