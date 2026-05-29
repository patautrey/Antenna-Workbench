/* ---------------------------------------------------------
   Antenna Workbench — NVIS Reflector Engine
   Multi-wire ground/elevated reflector model for low
   horizontal antennas (dipoles, doublets, loops, NVIS arrays)
--------------------------------------------------------- */

import { wavelength, round } from "../utils.js";
import { log } from "../log.js";

/* ---------------------------------------------------------
   REFLECTOR EFFECT MODELS
--------------------------------------------------------- */

function nvisGainBoost(num, heightFrac) {
    let base = num * 0.6; // ~0.6 dB per wire
    if (heightFrac > 0.02 && heightFrac < 0.15) base += 1.0;
    return base;
}

function dxReduction(num, heightFrac) {
    let base = num * 0.4; // ~0.4 dB per wire
    if (heightFrac > 0.02) base += 0.5;
    return base;
}

function toaShift(num, heightFrac) {
    let shift = num * 1.2; // ~1.2° per wire
    if (heightFrac > 0.02) shift += 1.0;
    return shift;
}

/* ---------------------------------------------------------
   MAIN ENGINE
--------------------------------------------------------- */
export function computeNVISReflector(freqMHz, mainHeightM, numWires, spacingM, offsetM, reflectorHeightM) {
    const lambda = wavelength(freqMHz);
    const heightFrac = reflectorHeightM / lambda;

    const gainNVIS = nvisGainBoost(numWires, heightFrac);
    const dxLoss = dxReduction(numWires, heightFrac);
    const toaDelta = toaShift(numWires, heightFrac);

    return {
        lambda,
        numWires,
        spacingM,
        offsetM,
        reflectorHeightM,
        heightFrac,
        gainNVIS,
        dxLoss,
        toaDelta,
        summary: `
            <p><strong>Reflector wires:</strong> ${numWires}</p>
            <p><strong>Reflector spacing:</strong> ${round(spacingM,2)} m</p>
            <p><strong>Reflector height:</strong> ${round(reflectorHeightM,2)} m (${round(heightFrac,3)} λ)</p>
            <p><strong>NVIS gain improvement:</strong> +${round(gainNVIS,1)} dB</p>
            <p><strong>DX reduction:</strong> -${round(dxLoss,1)} dB</p>
            <p><strong>TOA shift:</strong> +${round(toaDelta,1)}° (higher NVIS lobe)</p>
        `
    };
}

export function logNVISReflector(params, result) {
    log("nvis-reflector", "Computed NVIS reflector performance", {
        params,
        result
    });
}
