/* ============================================================
   KG5IEF Antenna‑Workbench
   HF + Portable Antenna Engineering Suite
   Common‑Mode Choke (CMC) Inductance Engine
   ============================================================ */

console.log("choke-engine.js loaded");

/* ------------------------------------------------------------
   Core Electrical Relationships
   ------------------------------------------------------------ */

/**
 * Reactance of an inductor:
 * X_L = 2π f L
 * L in Henries, f in Hz
 */
export function inductiveReactance(fMhz, mH) {
    const f = fMhz * 1e6;
    const L = mH / 1000;
    return 2 * Math.PI * f * L;
}

/**
 * Required inductance for a target impedance:
 * L = Z / (2π f)
 */
export function requiredInductanceMhy(fMhz, targetZ) {
    const f = fMhz * 1e6;
    const L = targetZ / (2 * Math.PI * f);
    return L * 1000; // convert H → mH
}

/* ------------------------------------------------------------
   Mix 31 / Mix 43 Approximation Curves
   (These are typical HF approximations for toroid behavior)
   ------------------------------------------------------------ */

export const mix31 = {
    name: "Mix 31",
    mH_per_turn2: 0.00028 // approximate mH per turn^2
};

export const mix43 = {
    name: "Mix 43",
    mH_per_turn2: 0.00020
};

/**
 * Approximate turns needed for a given inductance.
 * L ≈ k * N^2  →  N ≈ sqrt(L / k)
 */
export function turnsForInductance(mH, mix) {
    return Math.sqrt(mH / mix.mH_per_turn2);
}

/* ------------------------------------------------------------
   UI Output Block
   ------------------------------------------------------------ */

export function formatChokeReport({
    freqMhz,
    targetZ,
    mixType
}) {
    const mH = requiredInductanceMhy(freqMhz, targetZ);
    const turns = turnsForInductance(mH, mixType);

    return `
        <div class="output-block">
            <strong>Common‑Mode Choke Design</strong><br><br>

            <strong>Frequency:</strong> ${freqMhz} MHz<br>
            <strong>Target Impedance:</strong> ${targetZ} Ω<br>
            <strong>Ferrite Mix:</strong> ${mixType.name}<br><br>

            <strong>Required Inductance:</strong> ${mH.toFixed(3)} mH<br>
            <strong>Approx. Turns Needed:</strong> ${turns.toFixed(1)} turns<br>
        </div>
    `;
}
