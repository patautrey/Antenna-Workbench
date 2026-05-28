/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Module: Workbench Exporter & Project Packager
   ============================================================ */

console.log("workbench-exporter.js loaded");

/* ------------------------------------------------------------
   Module UI
   ------------------------------------------------------------ */

export function workbenchExporterUI() {
    return `
        <h2>Workbench Exporter & Project Packager</h2>

        <div class="card">
            <label>Project Name:</label><br>
            <input id="wb_name" type="text" value="My HF Project"><br><br>

            <button class="btn-primary" onclick="wb_exportProject()">Export Project</button>
            <button class="btn-secondary" onclick="wb_importProject()">Import Project</button>

            <input id="wb_import_file" type="file" style="display:none" accept=".json">
        </div>

        <div id="wb_results"></div>
    `;
}

/* ------------------------------------------------------------
   Project Snapshot Engine
   ------------------------------------------------------------ */

/**
 * Collects all module inputs from the page.
 * This is a generic scraper that finds all <input> and <select>.
 */
function wb_collectInputs() {
    const data = {};
    document.querySelectorAll("input, select").forEach(el => {
        if (el.id) data[el.id] = el.value;
    });
    return data;
}

/**
 * Creates a downloadable JSON file.
 */
function wb_download(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------
   Export Engine
   ------------------------------------------------------------ */

window.wb_exportProject = function () {
    const name = document.getElementById("wb_name").value || "HF_Project";

    const snapshot = {
        projectName: name,
        timestamp: new Date().toISOString(),
        inputs: wb_collectInputs()
    };

    const json = JSON.stringify(snapshot, null, 2);

    wb_download(name.replace(/\s+/g, "_") + ".json", json);

    document.getElementById("wb_results").innerHTML = `
        <div class="card">
            <h3>Project Exported</h3>
            <p>Your project <strong>${name}</strong> has been exported as a JSON file.</p>
            <p>This file contains all module inputs and settings.</p>
        </div>
    `;
};

/* ------------------------------------------------------------
   Import Engine
   ------------------------------------------------------------ */

window.wb_importProject = function () {
    const fileInput = document.getElementById("wb_import_file");
    fileInput.click();

    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);

                // Restore inputs
                Object.keys(data.inputs).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = data.inputs[id];
                });

                document.getElementById("wb_results").innerHTML = `
                    <div class="card">
                        <h3>Project Imported</h3>
                        <p>Loaded project: <strong>${data.projectName}</strong></p>
                        <p>Timestamp: ${data.timestamp}</p>
                    </div>
                `;
            } catch (err) {
                document.getElementById("wb_results").innerHTML = `
                    <div class="card">
                        <h3>Error</h3>
                        <p>Invalid project file.</p>
                    </div>
                `;
            }
        };

        reader.readAsText(file);
    };
};
