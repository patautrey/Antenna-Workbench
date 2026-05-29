/* ---------------------------------------------------------
   Antenna Workbench — Logging & Diagnostics
   Timestamped logs, debug toggles, and module tagging
--------------------------------------------------------- */

let debugEnabled = true;

/* ---------------------------------------------------------
   ENABLE / DISABLE DEBUG LOGGING
--------------------------------------------------------- */
export function setDebug(enabled) {
    debugEnabled = !!enabled;
}

/* ---------------------------------------------------------
   GET TIMESTAMP
--------------------------------------------------------- */
function timestamp() {
    const d = new Date();
    return d.toISOString().replace("T", " ").replace("Z", "");
}

/* ---------------------------------------------------------
   FORMAT MODULE TAG
--------------------------------------------------------- */
function tag(moduleName) {
    return moduleName ? `[${moduleName}]` : "[Workbench]";
}

/* ---------------------------------------------------------
   INFO LOG
--------------------------------------------------------- */
export function log(moduleName, ...msg) {
    if (!debugEnabled) return;
    console.log(`${timestamp()} ${tag(moduleName)}:`, ...msg);
}

/* ---------------------------------------------------------
   WARNING LOG
--------------------------------------------------------- */
export function warn(moduleName, ...msg) {
    console.warn(`${timestamp()} ${tag(moduleName)} WARNING:`, ...msg);
}

/* ---------------------------------------------------------
   ERROR LOG
--------------------------------------------------------- */
export function error(moduleName, ...msg) {
    console.error(`${timestamp()} ${tag(moduleName)} ERROR:`, ...msg);
}

/* ---------------------------------------------------------
   GROUPED LOGGING
--------------------------------------------------------- */
export function group(moduleName, label) {
    if (!debugEnabled) return;
    console.group(`${timestamp()} ${tag(moduleName)} ${label}`);
}

export function groupEnd() {
    if (!debugEnabled) return;
    console.groupEnd();
}
