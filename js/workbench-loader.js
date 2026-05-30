/* ---------------------------------------------------------
   HF Workbench — Unified Loader
   Loads modules based on URL hash routes
--------------------------------------------------------- */

function loadModule(path) {
    const root = document.querySelector("#content");
    if (!root) return;

    root.innerHTML = `<p style="padding:1rem;">Loading...</p>`;

    import(path)
        .then(m => {
            if (typeof m.default === "function") {
                m.default(root);
            } else {
                root.innerHTML = `<p style="color:red;">Module loaded but no default() export found.</p>`;
            }
        })
        .catch(err => {
            root.innerHTML = `<p style="color:red;">Error loading module:<br>${err}</p>`;
            console.error("Module load error:", err);
        });
}

function route() {
    const hash = window.location.hash || "#home";
    const root = document.querySelector("#content");
    if (!root) return;

    switch (hash) {

        case "#home":
            root.innerHTML = `
                <section class="tool">
                    <h2>HF Workbench</h2>
                    <p>Select a tool from the navigation bar.</p>
                </section>
            `;
            break;

        case "#doublet":
            loadModule("./modules/doublet-designer.js");
            break;

        case "#loop":
            loadModule("./modules/loop-designer.js");
            break;

        case "#skyloop":
            loadModule("./modules/skyloop-designer.js");
            break;

        case "#vertical-dx":
            loadModule("./modules/vertical-dx-designer.js");
            break;

        case "#vertical-nvis":
            loadModule("./modules/vertical-nvis-designer.js");
            break;

        case "#performer":
            loadModule("./modules/performer.js");
            break;

        case "#dominator":
            loadModule("./modules/dominator.js");
            break;

        case "#user-manual":
            root.innerHTML = `<h2>User Manual</h2><p>Coming soon.</p>`;
            break;

        case "#quick-start":
            root.innerHTML = `<h2>Quick Start</h2><p>Coming soon.</p>`;
            break;

        case "#glossary":
            root.innerHTML = `<h2>Glossary</h2><p>Coming soon.</p>`;
            break;

        default:
            root.innerHTML = `<h2>Unknown route</h2>`;
            break;
    }
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
