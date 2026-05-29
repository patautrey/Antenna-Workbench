/* ---------------------------------------------------------
   Antenna Workbench — Input Validators
   Numeric checks, ranges, frequency validation, and errors
--------------------------------------------------------- */

/* ---------------------------------------------------------
   CHECK IF VALUE IS A NUMBER
--------------------------------------------------------- */
export function isNumber(value) {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
}

/* ---------------------------------------------------------
   PARSE NUMBER SAFELY
--------------------------------------------------------- */
export function toNumber(value) {
    const n = parseFloat(value);
    return isNumber(n) ? n : null;
}

/* ---------------------------------------------------------
   REQUIRE NUMBER
--------------------------------------------------------- */
export function requireNumber(value, fieldName = "Value") {
    const n = toNumber(value);
    if (n === null) {
        return `${fieldName} must be a valid number.`;
    }
    return null;
}

/* ---------------------------------------------------------
   REQUIRE POSITIVE NUMBER
--------------------------------------------------------- */
export function requirePositive(value, fieldName = "Value") {
    const n = toNumber(value);
    if (n === null) {
        return `${fieldName} must be a valid number.`;
    }
    if (n <= 0) {
        return `${fieldName} must be greater than zero.`;
    }
    return null;
}

/* ---------------------------------------------------------
   REQUIRE NUMBER IN RANGE
--------------------------------------------------------- */
export function requireRange(value, min, max, fieldName = "Value") {
    const n = toNumber(value);
    if (n === null) {
        return `${fieldName} must be a valid number.`;
    }
    if (n < min || n > max) {
        return `${fieldName} must be between ${min} and ${max}.`;
    }
    return null;
}

/* ---------------------------------------------------------
   FREQUENCY VALIDATION (MHz)
--------------------------------------------------------- */
export function requireFrequency(value, fieldName = "Frequency") {
    const n = toNumber(value);
    if (n === null) {
        return `${fieldName} must be a valid number.`;
    }
    if (n < 0.1 || n > 10000) {
        return `${fieldName} must be between 0.1 MHz and 10,000 MHz.`;
    }
    return null;
}

/* ---------------------------------------------------------
   MULTI-FIELD VALIDATION
--------------------------------------------------------- */
export function validateFields(fieldMap) {
    const errors = [];

    for (const key in fieldMap) {
        const { value, rules } = fieldMap[key];

        for (const rule of rules) {
            const err = rule(value);
            if (err) errors.push(err);
        }
    }

    return errors;
}
