// src/utils/validators.js
//
// All form-validation helper functions live here. Every function takes
// some input and returns true/false ("is this valid?") — none of them
// change any data, they only check it. Pages import these and call them
// before submitting a form, so the user sees an error instantly instead
// of waiting for the backend to reject it.

/**
 * isEmail
 * Checks a string looks like a valid email address.
 * @param {string} value
 * @returns {boolean}
 */
export function isEmail(value) {
  // A simple, widely-used pattern: something@something.something
  // (not 100% spec-perfect, but good enough for form validation —
  // the backend does the real, authoritative check.)
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value ?? "");
}

/**
 * validateEmail
 * Field-level validator used by the auth pages (Login, ForgotPassword,
 * FacultyInviteForm, ...). Unlike isEmail (a plain true/false check),
 * this returns the message to show the user directly, so callers can
 * do `const err = validateEmail(x); if (err) { ... }`.
 * @param {string} value
 * @returns {string} error message, or "" if valid
 */
export function validateEmail(value) {
  if (!nonEmpty(value)) return "Email is required.";
  if (!isEmail(value)) return "Enter a valid email address.";
  return "";
}

/**
 * isStrongPassword
 * Backend rule: minimum 8 characters, at least 1 uppercase letter,
 * at least 1 number.
 * @param {string} value
 * @returns {boolean}
 */
export function isStrongPassword(value) {
  if (!value || value.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  return hasUppercase && hasNumber;
}

/**
 * getPasswordStrength
 * Unlike isStrongPassword (which only answers pass/fail against the
 * backend's minimum rule), this gives a graded result so a UI can render
 * a strength meter as the user types. Register.jsx and ResetPassword.jsx
 * both spread the return value straight into a local PasswordStrengthBar
 * component as props: `<PasswordStrengthBar {...passwordStrength} />`,
 * which expects `{ score, label, color }` (score 0-4 fills that many of
 * the 4 meter segments; the bar renders nothing when score is 0).
 *
 * How it works: start at 1 for any non-empty password (so the meter
 * always shows something once the user starts typing), then add a point
 * for each good quality present (long enough, uppercase letter, number,
 * special character), capped at 4.
 *
 * @param {string} value
 * @returns {{score:number, label:string, color:string}}
 */
export function getPasswordStrength(value) {
  if (!value) return { score: 0, label: "", color: "" }; // nothing typed yet — no meter to show

  let score = 1; // something was typed
  if (value.length >= 8) score++;          // long enough
  if (/[A-Z]/.test(value)) score++;        // has an uppercase letter
  if (/[0-9]/.test(value)) score++;        // has a number
  if (/[^A-Za-z0-9]/.test(value)) score++; // has a special character (anything not a letter/digit)
  score = Math.min(score, 4);

  const levels = [
    { label: "Weak", color: "var(--danger)" },
    { label: "Fair", color: "var(--warning)" },
    { label: "Good", color: "var(--accent)" },
    { label: "Strong", color: "var(--success)" },
  ];

  return { score, ...levels[score - 1] };
}

/**
 * validatePassword
 * Field-level validator (ResetPassword.jsx) built on isStrongPassword,
 * returning the message to show the user directly instead of a boolean.
 * @param {string} value
 * @returns {string} error message, or "" if valid
 */
export function validatePassword(value) {
  if (!nonEmpty(value)) return "Password is required.";
  if (!isStrongPassword(value)) {
    return "Password must be at least 8 characters, with 1 uppercase letter and 1 number.";
  }
  return "";
}

/**
 * validateConfirmPassword
 * Field-level validator (ResetPassword.jsx) checking a confirmation
 * field matches the password it's meant to repeat.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string} error message, or "" if valid
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (!nonEmpty(confirmPassword)) return "Please confirm your password.";
  if (confirmPassword !== password) return "Passwords do not match.";
  return "";
}

/**
 * isOtp
 * Backend rule: OTP codes are always exactly 6 digits.
 * @param {string} value
 * @returns {boolean}
 */
export function isOtp(value) {
  return /^[0-9]{6}$/.test(value ?? "");
}

/**
 * validateOtp
 * Field-level validator (VerifyEmail.jsx, ResetPassword.jsx) built on
 * isOtp, returning the message to show the user directly.
 * @param {string} value
 * @returns {string} error message, or "" if valid
 */
export function validateOtp(value) {
  if (!nonEmpty(value)) return "Verification code is required.";
  if (!isOtp(value)) return "Enter the 6-digit code.";
  return "";
}

/**
 * inRange
 * Generic numeric-bounds check. Used for things like credits (1-10) or
 * semester numbers (1-8).
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean} true if min <= value <= max
 */
export function inRange(value, min, max) {
  return value >= min && value <= max;
}

/**
 * marksValid
 * A mark can't be negative, and can't exceed the subject's total marks.
 * @param {number} marks
 * @param {number} total
 * @returns {boolean}
 */
export function marksValid(marks, total) {
  return marks >= 0 && marks <= total;
}

/**
 * nonEmpty
 * Checks a string has real content after trimming whitespace. Used for
 * names, reasons, comments — anywhere blank text isn't allowed.
 * @param {string} value
 * @returns {boolean}
 */
export function nonEmpty(value) {
  return Boolean(value && value.trim().length > 0);
}

/**
 * gradeRulesCover
 * Checks a grading-system's rules cover 0% to 100% with no gaps or
 * overlaps, and that exactly one rule is the "fail" rule (gradePoint 0).
 * Mirrors the backend's grading-system validation exactly.
 * @param {Array<{grade:string, gradePoint:number, minMarksPercent:number, maxMarksPercent:number}>} rules
 * @returns {boolean}
 */
export function gradeRulesCover(rules) {
  if (!Array.isArray(rules) || rules.length < 2) return false;

  // Sort a COPY of the rules by their starting percentage — sorting the
  // original array would silently reorder it for the caller too, which
  // could confuse whatever renders the rule table.
  const sorted = [...rules].sort((a, b) => a.minMarksPercent - b.minMarksPercent);

  const failRuleCount = sorted.filter((r) => r.gradePoint === 0).length;
  if (failRuleCount !== 1) return false;

  if (sorted[0].minMarksPercent !== 0) return false;
  if (sorted[sorted.length - 1].maxMarksPercent !== 100) return false;

  for (let i = 0; i < sorted.length; i++) {
    const rule = sorted[i];
    if (rule.minMarksPercent > rule.maxMarksPercent) return false; // min must not exceed max

    if (i > 0) {
      const prev = sorted[i - 1];
      // The next rule must start exactly where the previous one ended
      // (allowing a tiny rounding gap of 0.01, e.g. 79.99 → 80).
      const gap = rule.minMarksPercent - prev.maxMarksPercent;
      if (gap < -0.01 || gap > 0.02) return false;
    }
  }

  return true;
}

/**
 * isUrl
 * Checks a string is a valid http(s) URL, or empty — several backend
 * fields (certificateUrl, proofUrl, offerLetterUrl) are optional but
 * must be a real http(s) link if provided at all.
 * @param {string} value
 * @returns {boolean}
 */
export function isUrl(value) {
  if (!value || value.trim() === "") return true; // empty is fine, it's optional
  try {
    // `new URL()` is a built-in JS constructor that parses a string as a
    // URL. It THROWS an error if the string isn't a valid URL at all —
    // that's why this is wrapped in try/catch.
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * facultyIdsValid
 * Mirrors the backend rule for facultyIds: must be a non-empty array of
 * unique numbers (no picking the same reviewer twice).
 * @param {number[]} facultyIds
 * @returns {boolean}
 */
export function facultyIdsValid(facultyIds) {
  if (!Array.isArray(facultyIds) || facultyIds.length === 0) return false;
  // `Set` is a built-in JS collection that automatically drops duplicate
  // values. If the Set's size is smaller than the array's length, that
  // means at least one value was repeated.
  const uniqueCount = new Set(facultyIds).size;
  return uniqueCount === facultyIds.length;
}

/**
 * dateOrderValid
 * For internships: if both dates are given, start must not be after end.
 * Returns true when either date is missing, since both are optional.
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {boolean}
 */
export function dateOrderValid(startDate, endDate) {
  if (!startDate || !endDate) return true;
  return new Date(startDate) <= new Date(endDate);
}

/**
 * isNonNegative
 * Checks a number is 0 or greater, or empty/undefined (since the field
 * is usually optional, e.g. internship stipend).
 * @param {number|string} value
 * @returns {boolean}
 */
export function isNonNegative(value) {
  if (value === "" || value === null || value === undefined) return true; // optional field
  return Number(value) >= 0;
}

/**
 * validateRegisterForm
 * Checks every field on the registration form (name, email, password,
 * confirmPassword) and returns an "errors object" — one key per field
 * that failed, with a message to show the user. A field with no problem
 * simply isn't in the object at all.
 *
 * Example return value when everything is wrong:
 *   {
 *     name: "Name is required.",
 *     email: "Enter a valid email address.",
 *     password: "Password must be at least 8 characters, with 1 uppercase letter and 1 number.",
 *     confirmPassword: "Passwords do not match."
 *   }
 *
 * @param {Object} form
 * @param {string} form.name
 * @param {string} form.email
 * @param {string} form.password
 * @param {string} form.confirmPassword
 * @returns {Object} errors - empty object means the form is valid
 */
export function validateRegisterForm(form) {
  const errors = {};

  if (!nonEmpty(form.name)) {
    errors.name = "Name is required.";
  }

  const emailError = validateEmail(form.email);
  if (emailError) {
    errors.email = emailError;
  }

  if (!isStrongPassword(form.password)) {
    errors.password =
      "Password must be at least 8 characters, with 1 uppercase letter and 1 number.";
  }

  // Only flag a mismatch if confirmPassword doesn't match — this also
  // naturally catches an empty confirmPassword, since "" !== password.
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

/**
 * hasErrors
 * Takes an errors object (like the one validateRegisterForm returns) and
 * answers a simple question: is there ANY error in here at all?
 *
 * How it works: `Object.keys(errors)` is a built-in JS function that
 * returns an array of all the property names on an object — e.g.
 * Object.keys({ email: "bad" }) → ["email"]. If that array's length is
 * greater than 0, at least one field has an error.
 *
 * @param {Object} errors
 * @returns {boolean} true if at least one error exists
 */
export function hasErrors(errors) {
  return Object.keys(errors ?? {}).length > 0;
}