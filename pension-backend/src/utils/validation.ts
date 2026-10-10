/**
 * ============================================================================
 * BACKEND CENTRALIZED VALIDATION UTILITIES & REGEX RULES
 * ============================================================================
 */

// Name regex: Allows letters (English, Latin accents, and Ethiopian Ge'ez / Amharic / Tigrinya), spaces, apostrophes, and hyphens.
// Rejects digits and arbitrary symbols.
export const NAME_REGEX = /^[\p{L}\s'-]+$/u;

// Strict 10-digit Ethiopian local phone number:
// Starts with 09 (Ethio Telecom) or 07 (Safaricom), followed by 8 digits.
export const PHONE_10_DIGIT_STRICT_REGEX = /^0[79]\d{8}$/;

// Exactly 10 digits
export const EXACT_10_DIGITS_REGEX = /^\d{10}$/;

// Full Ethiopian Phone formats (+251, 251, or local 09/07)
export const ETHIOPIAN_PHONE_FULL_REGEX = /^(\+251[79]\d{8}|251[79]\d{8}|0[79]\d{8})$/;

// Standard RFC-compliant email regex
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Password requirement: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Numbers
export const POSITIVE_INTEGER_REGEX = /^\d+$/;
export const POSITIVE_DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

// TIN: Exactly 10 digits
export const TIN_REGEX = /^\d{10}$/;

// Bank account: 8 to 20 digits
export const BANK_ACCOUNT_REGEX = /^\d{8,20}$/;

// OTP code: Exactly 6 digits
export const OTP_CODE_REGEX = /^\d{6}$/;


/**
 * ============================================================================
 * BACKEND FIELD VALIDATORS
 * ============================================================================
 */

export const validateName = (
  name: any,
  fieldLabel = 'Full Name',
  required = true,
  minLength = 2,
  maxLength = 70
): string | null => {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (trimmed.length < minLength) {
    return `${fieldLabel} must be at least ${minLength} characters`;
  }
  if (trimmed.length > maxLength) {
    return `${fieldLabel} cannot exceed ${maxLength} characters`;
  }
  if (!NAME_REGEX.test(trimmed)) {
    return `${fieldLabel} can only contain letters, spaces, hyphens, and apostrophes (no numbers or symbols)`;
  }
  return null;
};

export const validatePhone = (
  phone: any,
  required = true,
  strict10Digits = false,
  fieldLabel = 'Phone number'
): string | null => {
  const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
  if (!cleanPhone) {
    return required ? `${fieldLabel} is required` : null;
  }

  if (strict10Digits) {
    if (!/^\d+$/.test(cleanPhone)) {
      return `${fieldLabel} must contain only digits`;
    }
    if (cleanPhone.length !== 10) {
      return `${fieldLabel} must be exactly 10 digits (you provided ${cleanPhone.length})`;
    }
    if (!cleanPhone.startsWith('09') && !cleanPhone.startsWith('07')) {
      return `${fieldLabel} must start with 09 (Ethio Telecom) or 07 (Safaricom)`;
    }
    return null;
  }

  const digitsOnly = cleanPhone.replace('+', '');
  if (!/^\d+$/.test(digitsOnly)) {
    return `${fieldLabel} must contain only numeric digits`;
  }

  if (cleanPhone.startsWith('+')) {
    if (!cleanPhone.startsWith('+251')) {
      return `${fieldLabel} international format must start with country code +251`;
    }
    const afterCountryCode = cleanPhone.slice(4);
    if (!afterCountryCode.startsWith('9') && !afterCountryCode.startsWith('7')) {
      return `${fieldLabel} must start with 9 or 7 after +251`;
    }
    if (cleanPhone.length !== 13) {
      return `${fieldLabel} in +251 format must be exactly 13 characters`;
    }
  } else if (cleanPhone.startsWith('251')) {
    const afterCountryCode = cleanPhone.slice(3);
    if (!afterCountryCode.startsWith('9') && !afterCountryCode.startsWith('7')) {
      return `${fieldLabel} must start with 9 or 7 after 251`;
    }
    if (cleanPhone.length !== 12) {
      return `${fieldLabel} starting with 251 must be exactly 12 digits`;
    }
  } else {
    const startsWithZero = cleanPhone.startsWith('0');
    const normalizedLocal = startsWithZero ? cleanPhone : '0' + cleanPhone;

    if (!normalizedLocal.startsWith('09') && !normalizedLocal.startsWith('07')) {
      return `${fieldLabel} must start with 09 (Ethio Telecom) or 07 (Safaricom)`;
    }

    const expectedLength = startsWithZero ? 10 : 9;
    if (cleanPhone.length !== expectedLength) {
      return `${fieldLabel} must be exactly ${expectedLength} digits (you provided ${cleanPhone.length})`;
    }
  }

  return null;
};

export const validateEmail = (
  email: any,
  required = true,
  fieldLabel = 'Email address'
): string | null => {
  const trimmed = typeof email === 'string' ? email.trim() : '';
  if (!trimmed) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return `Please provide a valid ${fieldLabel.toLowerCase()} (e.g. name@example.com)`;
  }
  return null;
};

export const validatePassword = (
  password: any,
  required = true,
  fieldLabel = 'Password'
): string | null => {
  const str = typeof password === 'string' ? password : '';
  if (!str) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (str.length < 8) {
    return `${fieldLabel} must be at least 8 characters long`;
  }
  if (!/(?=.*[a-z])/.test(str)) {
    return `${fieldLabel} must contain at least one lowercase letter`;
  }
  if (!/(?=.*[A-Z])/.test(str)) {
    return `${fieldLabel} must contain at least one uppercase letter`;
  }
  if (!/(?=.*\d)/.test(str)) {
    return `${fieldLabel} must contain at least one number`;
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(str)) {
    return `${fieldLabel} must contain at least one special character`;
  }
  return null;
};

export const validatePrice = (
  price: any,
  fieldLabel = 'Price',
  required = true,
  min = 1,
  max = 10000000
): string | null => {
  if (price === undefined || price === null || price === '') {
    return required ? `${fieldLabel} is required` : null;
  }
  const num = typeof price === 'number' ? price : parseFloat(String(price));
  if (isNaN(num)) {
    return `${fieldLabel} must be a valid number`;
  }
  if (num < min) {
    return `${fieldLabel} must be at least ${min}`;
  }
  if (num > max) {
    return `${fieldLabel} cannot exceed ${max.toLocaleString()}`;
  }
  return null;
};

export const validatePositiveInteger = (
  val: any,
  fieldLabel = 'Value',
  required = true,
  min = 1,
  max = 10000
): string | null => {
  if (val === undefined || val === null || val === '') {
    return required ? `${fieldLabel} is required` : null;
  }
  const num = typeof val === 'number' ? val : parseInt(String(val), 10);
  if (isNaN(num) || !POSITIVE_INTEGER_REGEX.test(String(val))) {
    return `${fieldLabel} must be a valid whole number`;
  }
  if (num < min) {
    return `${fieldLabel} must be at least ${min}`;
  }
  if (num > max) {
    return `${fieldLabel} cannot exceed ${max.toLocaleString()}`;
  }
  return null;
};

export const validateDateRange = (
  checkIn: any,
  checkOut: any,
  allowPastCheckIn = false
): string | null => {
  if (!checkIn) return 'Check-in date is required';
  if (!checkOut) return 'Check-out date is required';

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (isNaN(inDate.getTime())) return 'Invalid check-in date';
  if (isNaN(outDate.getTime())) return 'Invalid check-out date';

  if (!allowPastCheckIn) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inDateZero = new Date(inDate);
    inDateZero.setHours(0, 0, 0, 0);
    if (inDateZero.getTime() < today.getTime()) {
      return 'Check-in date cannot be in the past';
    }
  }

  if (outDate.getTime() <= inDate.getTime()) {
    return 'Check-out date must be after check-in date';
  }

  return null;
};

export const validateRequiredText = (
  val: any,
  fieldLabel = 'This field',
  minLength = 1,
  maxLength = 500
): string | null => {
  const trimmed = typeof val === 'string' ? val.trim() : '';
  if (!trimmed) {
    return `${fieldLabel} is required`;
  }
  if (trimmed.length < minLength) {
    return `${fieldLabel} must be at least ${minLength} characters`;
  }
  if (trimmed.length > maxLength) {
    return `${fieldLabel} cannot exceed ${maxLength} characters`;
  }
  return null;
};

export const validateOtpCode = (otp: any): string | null => {
  const clean = typeof otp === 'string' ? otp.trim() : '';
  if (!clean) return 'OTP code is required';
  if (!OTP_CODE_REGEX.test(clean)) {
    return 'OTP code must be exactly 6 digits';
  }
  return null;
};
