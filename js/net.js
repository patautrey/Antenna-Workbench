/* ---------------------------------------------------------
   Antenna Workbench — Network Layer
   Safe fetch wrapper with timeouts and JSON helpers
--------------------------------------------------------- */

const DEFAULT_TIMEOUT = 8000;

/* ---------------------------------------------------------
   TIMEOUT PROMISE
--------------------------------------------------------- */
function timeoutPromise(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), ms);
    });
}

/* ---------------------------------------------------------
   SAFE FETCH
--------------------------------------------------------- */
export async function request(url, options = {}, timeout = DEFAULT_TIMEOUT) {
    try {
        const response = await Promise.race([
            fetch(url, options),
            timeoutPromise(timeout)
        ]);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    } catch (err) {
        console.error("Network request error:", err);
        throw err;
    }
}

/* ---------------------------------------------------------
   GET JSON
--------------------------------------------------------- */
export async function getJSON(url, timeout = DEFAULT_TIMEOUT) {
    const res = await request(url, {}, timeout);
    try {
        return await res.json();
    } catch (err) {
        console.error("JSON parse error:", err);
        throw err;
    }
}

/* ---------------------------------------------------------
   POST JSON
--------------------------------------------------------- */
export async function postJSON(url, data = {}, timeout = DEFAULT_TIMEOUT) {
    const res = await request(
        url,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        },
        timeout
    );

    try {
        return await res.json();
    } catch (err) {
        console.error("JSON parse error:", err);
        throw err;
    }
}

/* ---------------------------------------------------------
   TEXT RESPONSE
--------------------------------------------------------- */
export async function getText(url, timeout = DEFAULT_TIMEOUT) {
    const res = await request(url, {}, timeout);
    try {
        return await res.text();
    } catch (err) {
        console.error("Text parse error:", err);
        throw err;
    }
}
