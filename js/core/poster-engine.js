/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Poster / SVG Rendering Engine
   ============================================================ */

console.log("poster-engine.js loaded");

/* ------------------------------------------------------------
   Base SVG Wrapper
   ------------------------------------------------------------ */

/**
 * Wrap raw SVG content in a full SVG document.
 */
export function svgWrapper(innerSvg, width = 800, height = 600) {
    return `
        <svg width="${width}" height="${height}"
             viewBox="0 0 ${width} ${height}"
             xmlns="http://www.w3.org/2000/svg"
             style="background:#ffffff; border:1px solid #ccc;">
            ${innerSvg}
        </svg>
    `;
}

/* ------------------------------------------------------------
   Text Helpers
   ------------------------------------------------------------ */

export function svgTitle(text, x = 20, y = 40) {
    return `
        <text x="${x}" y="${y}"
              font-size="28"
              font-family="Arial"
              font-weight="bold"
              fill="#1e3a5f">
            ${text}
        </text>
    `;
}

export function svgLabel(text, x, y) {
    return `
        <text x="${x}" y="${y}"
              font-size="16"
              font-family="Arial"
              fill="#222">
            ${text}
        </text>
    `;
}

/* ------------------------------------------------------------
   Line & Shape Helpers
   ------------------------------------------------------------ */

export function svgLine(x1, y1, x2, y2, color = "#000", width = 2) {
    return `
        <line x1="${x1}" y1="${y1}"
              x2="${x2}" y2="${y2}"
              stroke="${color}"
              stroke-width="${width}" />
    `;
}

export function svgDashedLine(x1, y1, x2, y2, color = "#555", width = 2) {
    return `
        <line x1="${x1}" y1="${y1}"
              x2="${x2}" y2="${y2}"
              stroke="${color}"
              stroke-width="${width}"
              stroke-dasharray="8 6" />
    `;
}

export function svgCircle(cx, cy, r, color = "#000") {
    return `
        <circle cx="${cx}" cy="${cy}" r="${r}"
                fill="${color}" />
    `;
}

/* ------------------------------------------------------------
   Poster Templates
   ------------------------------------------------------------ */

/**
 * Simple vertical antenna poster.
 */
export function posterVerticalAntenna({ heightMeters }) {
    const heightFt = (heightMeters * 3.28084).toFixed(1);

    const inner = `
        ${svgTitle("Vertical Antenna Diagram")}
        ${svgLabel(`Height: ${heightMeters.toFixed(2)} m (${heightFt} ft)`, 20, 80)}

        ${svgLine(400, 120, 400, 520, "#1e3a5f", 6)}

        ${svgLabel("Ground", 370, 550)}
        ${svgLine(100, 540, 700, 540, "#444", 3)}
    `;

    return svgWrapper(inner);
}

/**
 * Simple dipole poster.
 */
export function posterDipole({ totalLengthMeters }) {
    const half = totalLengthMeters / 2;
    const halfFt = (half * 3.28084).toFixed(1);

    const inner = `
        ${svgTitle("Dipole Antenna Diagram")}
        ${svgLabel(`Total Length: ${totalLengthMeters.toFixed(2)} m`, 20, 80)}
        ${svgLabel(`Each Leg: ${half.toFixed(2)} m (${halfFt} ft)`, 20, 110)}

        ${svgLine(100, 300, 700, 300, "#1e3a5f", 6)}
        ${svgCircle(400, 300, 10, "#ffb400")}
        ${svgLabel("Feedpoint", 380, 330)}
    `;

    return svgWrapper(inner);
}

/* ------------------------------------------------------------
   Export Hook
   ------------------------------------------------------------ */

export function generatePoster(type, params) {
    switch (type) {
        case "vertical":
            return posterVerticalAntenna(params);
        case "dipole":
            return posterDipole(params);
        default:
            return svgWrapper(svgTitle("Unknown Poster Type"));
    }
}
