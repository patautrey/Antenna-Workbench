/* ---------------------------------------------------------
   Antenna Workbench — Global Event Bus
   Lightweight pub/sub system for module communication
--------------------------------------------------------- */

const listeners = {};

/* ---------------------------------------------------------
   SUBSCRIBE TO AN EVENT
--------------------------------------------------------- */
export function on(eventName, callback) {
    if (!listeners[eventName]) {
        listeners[eventName] = [];
    }
    listeners[eventName].push(callback);
}

/* ---------------------------------------------------------
   UNSUBSCRIBE FROM AN EVENT
--------------------------------------------------------- */
export function off(eventName, callback) {
    if (!listeners[eventName]) return;

    listeners[eventName] = listeners[eventName].filter(fn => fn !== callback);
}

/* ---------------------------------------------------------
   EMIT AN EVENT
--------------------------------------------------------- */
export function emit(eventName, data = null) {
    if (!listeners[eventName]) return;

    listeners[eventName].forEach(callback => {
        try {
            callback(data);
        } catch (err) {
            console.error(`Event handler error for "${eventName}":`, err);
        }
    });
}

/* ---------------------------------------------------------
   CLEAR ALL LISTENERS (DEV/DEBUG)
--------------------------------------------------------- */
export function clearEvents() {
    Object.keys(listeners).forEach(key => {
        listeners[key] = [];
    });
}
