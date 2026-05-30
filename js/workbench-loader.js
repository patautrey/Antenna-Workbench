// /HF-Workbench/js/workbench-loader.js
// Inside your hash/router switch:

case "#vertical-dx":
    import("./modules/vertical-dx.js").then(mod => {
        mod.loadVerticalDXDesigner();
    });
    break;
