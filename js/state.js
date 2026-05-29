/* ---------------------------------------------------------
   Antenna Workbench — Global State Manager
   Centralized shared state for all modules
--------------------------------------------------------- */

const state = {};

/* ---------------------------------------------------------
   SET A VALUE
--------------------------------------------------------- */
export function setState(key, value) {
    state[key] = value;
}

/* ---------------------------------------------------------
   GET A VALUE
--------------------------------------------------------- */
export function getState(key, fallback = null) {
    return state.hasOwnProperty(key) ? state[key] : fallback;
}

/* ---------------------------------------------------------
   MERGE MULTIPLE VALUES
--------------------------------------------------------- */
export function mergeState(obj) {
    Object.assign(state, obj);
}

/* ---------------------------------------------------------
   REMOVE A VALUE
--------------------------------------------------------- */
export function deleteState(key) {
    if (state.hasOwnProperty(key)) {
        delete state[key];
    }
}

/* ---------------------------------------------------------
   CLEAR ALL STATE
--------------------------------------------------------- */
export function clearState() {
    Object.keys(state).forEach(k => delete state[k]);
}

/* ---------------------------------------------------------
   EXPORT RAW STATE (READ‑ONLY)
--------------------------------------------------------- */
export function getAllState() {
    return { ...state };
}
