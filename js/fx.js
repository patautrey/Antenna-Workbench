/* ---------------------------------------------------------
   Antenna Workbench — FX / Animation Engine
   Smooth transitions, highlights, and UI effects
--------------------------------------------------------- */

/* ---------------------------------------------------------
   FADE IN
--------------------------------------------------------- */
export function fadeIn(element, duration = 250) {
    element.style.opacity = 0;
    element.style.display = "block";

    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.opacity = progress;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

/* ---------------------------------------------------------
   FADE OUT
--------------------------------------------------------- */
export function fadeOut(element, duration = 250) {
    element.style.opacity = 1;

    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.opacity = 1 - progress;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.style.display = "none";
        }
    }

    requestAnimationFrame(step);
}

/* ---------------------------------------------------------
   SLIDE DOWN
--------------------------------------------------------- */
export function slideDown(element, duration = 250) {
    element.style.display = "block";
    element.style.height = "0px";
    element.style.overflow = "hidden";

    const targetHeight = element.scrollHeight;
    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.height = (targetHeight * progress) + "px";

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.style.height = "";
            element.style.overflow = "";
        }
    }

    requestAnimationFrame(step);
}

/* ---------------------------------------------------------
   SLIDE UP
--------------------------------------------------------- */
export function slideUp(element, duration = 250) {
    const startHeight = element.scrollHeight;
    element.style.overflow = "hidden";

    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.height = (startHeight * (1 - progress)) + "px";

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.style.display = "none";
            element.style.height = "";
            element.style.overflow = "";
        }
    }

    requestAnimationFrame(step);
}

/* ---------------------------------------------------------
   HIGHLIGHT PULSE
--------------------------------------------------------- */
export function pulse(element, color = "#4da3ff", duration = 600) {
    const original = element.style.boxShadow || "none";

    element.style.transition = `box-shadow ${duration / 2}ms ease`;
    element.style.boxShadow = `0 0 12px ${color}`;

    setTimeout(() => {
        element.style.boxShadow = original;
    }, duration);
}

/* ---------------------------------------------------------
   FLASH (QUICK ATTENTION)
--------------------------------------------------------- */
export function flash(element, color = "#ff4d4d", duration = 150) {
    const original = element.style.backgroundColor || "";

    element.style.transition = `background-color ${duration}ms ease`;
    element.style.backgroundColor = color;

    setTimeout(() => {
        element.style.backgroundColor = original;
    }, duration);
}
