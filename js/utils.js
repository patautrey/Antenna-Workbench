/* ---------------------------------------------------------
   Antenna Workbench — Utility Library
   Shared math helpers, conversions, and RF utilities
--------------------------------------------------------- */

export const SPEED_OF_LIGHT = 299.792458; // meters per microsecond

/* ---------------------------------------------------------
   BASIC CONVERSIONS
--------------------------------------------------------- */

export function feetToMeters(ft) {
    return ft * 0.3048;
}

export function metersToFeet(m) {
    return m / 0.3048;
}

export function mhzToWavelength(fMHz) {
    return (SPEED_OF_LIGHT * 1e6) / (fMHz * 1e6);
}

export function wavelengthToMHz(lambda) {
    return SPEED_OF_LIGHT / lambda;
}

/* ---------------------------------------------------------
   ANGLE HELPERS
--------------------------------------------------------- */

export function degToRad(deg) {
    return deg * (Math.PI / 180);
}

export function radToDeg(rad) {
    return rad * (180 / Math.PI);
}

/* ---------------------------------------------------------
   dB UTILITIES
--------------------------------------------------------- */

export function dbToRatio(db) {
    return Math.pow(10, db / 10);
}

export function ratioToDb(ratio) {
    return 10 * Math.log10(ratio);
}

/* ---------------------------------------------------------
   RF / ANTENNA HELPERS
--------------------------------------------------------- */

export function quarterWave(fMHz) {
    return (SPEED_OF_LIGHT / (fMHz * 1e6)) / 4;
}

export function halfWave(fMHz) {
    return (SPEED_OF_LIGHT / (fMHz * 1e6)) / 2;
}

export function threeEighthWave(fMHz) {
    return (SPEED_OF_LIGHT / (fMHz * 1e6)) * 0.375;
}

export function wavelength(fMHz) {
    return SPEED_OF_LIGHT / (fMHz * 1e6);
}

/* ---------------------------------------------------------
   SWR / IMPEDANCE HELPERS
--------------------------------------------------------- */

export function swrFromImpedance(z, z0 = 50) {
    const gamma = (z - z0) / (z + z0);
    return (1 + Math.abs(gamma)) / (1 - Math.abs(gamma));
}

export function impedanceFromSWR(swr, z0 = 50) {
    const gamma = (swr - 1) / (swr + 1);
    const z = z0 * (1 + gamma) / (1 - gamma);
    return z;
}

/* ---------------------------------------------------------
   FEEDLINE LOSS HELPERS
--------------------------------------------------------- */

export function coaxLossDb(baseLossDbPer100ft, lengthFt, freqMHz, refFreq = 14) {
    const freqFactor = freqMHz / refFreq;
    return baseLossDbPer100ft * freqFactor * (lengthFt / 100);
}

export function swrAtRadio(loadSWR, lossDb) {
    return Math.max(1, loadSWR * (1 + lossDb / 10));
}

/* ---------------------------------------------------------
   GENERAL HELPERS
--------------------------------------------------------- */

export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function round(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
