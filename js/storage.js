/* ---------------------------------------------------------
   Antenna Workbench — Storage Layer
   Safe localStorage wrapper with namespacing
--------------------------------------------------------- */

const PREFIX = "antennaWorkbench_";

/* ---------------------------------------------------------
   BUILD FULL KEY
--------------------------------------------------------- */
function key(name) {
    return PREFIX + name;
}

/* ---------------------------------------------------------
   SAVE VALUE
--------------------------------------------------------- */
export function save(name, value) {
    try {
        const json = JSON.stringify(value);
        localStorage.setItem(key(name), json);
    } catch (err) {
        console.error("Storage save error:", err);
    }
}

/* ---------------------------------------------------------
   LOAD VALUE
--------------------------------------------------------- */
export function load(name, fallback = null) {
    try {
        const raw = localStorage.getItem(key(name));
        if (raw === null) return fallback;
        return JSON.parse(raw);
    } catch (err) {
        console.error("Storage load error:", err);
        return fallback;
    }
}

/* ---------------------------------------------------------
   REMOVE VALUE
--------------------------------------------------------- */
export function remove(name) {
    try {
        localStorage.removeItem(key(name));
    } catch (err) {
        console.error("Storage remove error:", err);
    }
}

/* ---------------------------------------------------------
   CLEAR ALL WORKBENCH KEYS
--------------------------------------------------------- */
export function clearAll() {
    try {
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith(PREFIX)) {
                localStorage.removeItem(k);
            }
        });
    } catch (err) {
        console.error("Storage clear error:", err);
    }
}

/* ---------------------------------------------------------
   LIST ALL KEYS
--------------------------------------------------------- */
export function listKeys() {
    return Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .map(k => k.replace(PREFIX, ""));
}
