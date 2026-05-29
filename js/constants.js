/* ---------------------------------------------------------
   Antenna Workbench — Shared RF Constants & Lookup Tables
   Band plans, coax losses, material constants, and RF values
--------------------------------------------------------- */

export const C = 299.792458; // speed of light (m/µs)

/* ---------------------------------------------------------
   HF BAND PLAN (MHz)
--------------------------------------------------------- */
export const HF_BANDS = [
    { name: "160m", low: 1.8, high: 2.0 },
    { name: "80m",  low: 3.5, high: 4.0 },
    { name: "60m",  low: 5.3, high: 5.4 },
    { name: "40m",  low: 7.0, high: 7.3 },
    { name: "30m",  low: 10.1, high: 10.15 },
    { name: "20m",  low: 14.0, high: 14.35 },
    { name: "17m",  low: 18.068, high: 18.168 },
    { name: "15m",  low: 21.0, high: 21.45 },
    { name: "12m",  low: 24.89, high: 24.99 },
    { name: "10m",  low: 28.0, high: 29.7 }
];

/* ---------------------------------------------------------
   COMMON COAX LOSS (dB per 100 ft @ 14 MHz)
   Values are approximate and used for modeling
--------------------------------------------------------- */
export const COAX_LOSS_DB_100FT = {
    "RG-58": 4.5,
    "RG-8X": 3.0,
    "RG-213": 1.5,
    "LMR-240": 2.1,
    "LMR-400": 0.7,
    "LMR-600": 0.45
};

/* ---------------------------------------------------------
   WIRE MATERIAL VELOCITY FACTORS
--------------------------------------------------------- */
export const VELOCITY_FACTORS = {
    "bare_copper": 0.98,
    "insulated_copper": 0.95,
    "steel_copperweld": 0.90,
    "aluminum": 0.97
};

/* ---------------------------------------------------------
   GROUND CONDUCTIVITY (mS/m)
   Approximate values for modeling
--------------------------------------------------------- */
export const GROUND_TYPES = [
    { name: "Poor (0.5 mS/m)", conductivity: 0.5 },
    { name: "Average (5 mS/m)", conductivity: 5 },
    { name: "Good (15 mS/m)", conductivity: 15 },
    { name: "Very Good (30 mS/m)", conductivity: 30 }
];

/* ---------------------------------------------------------
   ANTENNA HEIGHT GUIDELINES (WAVELENGTH FRACTIONS)
--------------------------------------------------------- */
export const HEIGHT_GUIDELINES = {
    nvis: 0.1,      // 0.1 λ for NVIS
    dipole: 0.25,   // 0.25 λ for general dipoles
    vertical: 0.05  // 0.05 λ for verticals
};

/* ---------------------------------------------------------
   DEFAULT IMPEDANCE
--------------------------------------------------------- */
export const Z0 = 50;

/* ---------------------------------------------------------
   UTILITY LOOKUP: FIND BAND BY FREQUENCY
--------------------------------------------------------- */
export function findBand(freqMHz) {
    return HF_BANDS.find(b => freqMHz >= b.low && freqMHz <= b.high) || null;
}
