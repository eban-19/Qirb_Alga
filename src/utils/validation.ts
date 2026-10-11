import { z } from 'zod';

/**
 * ============================================================================
 * REGULAR EXPRESSIONS CONSTANTS
 * ============================================================================
 */

// Name regex: Allows letters (English, Latin accents, and Ethiopian Ge'ez / Amharic / Tigrinya), spaces, apostrophes, and hyphens.
// Rejects digits and arbitrary symbols.
export const NAME_REGEX = /^[\p{L}\s'-]+$/u;

// Strict 10-digit Ethiopian local phone number:
// Standard Ethiopian format starts with 09 (Ethio Telecom) or 07 (Safaricom), followed by 8 digits (total 10 digits).
export const PHONE_10_DIGIT_STRICT_REGEX = /^0[79]\d{8}$/;

// Exactly 10 digits (digits only)
export const EXACT_10_DIGITS_REGEX = /^\d{10}$/;

// General Ethiopian phone format:
// Supports:
// 1) 09xxxxxxxx or 07xxxxxxxx (10 digits)
// 2) 2519xxxxxxx or 2517xxxxxxx (12 digits)
// 3) +2519xxxxxxx or +2517xxxxxxx (13 characters)
export const ETHIOPIAN_PHONE_FULL_REGEX = /^(\+251[79]\d{8}|251[79]\d{8}|0[79]\d{8})$/;

// Standard RFC-compliant email regex
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Password requirement: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Numbers
export const POSITIVE_INTEGER_REGEX = /^\d+$/;
export const POSITIVE_DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

// Ethiopian Tax Identification Number (TIN): Exactly 10 digits
export const TIN_REGEX = /^\d{10}$/;

// Bank Account Number: 8 to 20 digits
export const BANK_ACCOUNT_REGEX = /^\d{8,20}$/;

// OTP code: Exactly 6 digits
export const OTP_CODE_REGEX = /^\d{6}$/;


/**
 * ============================================================================
 * INPUT TYPING FILTER HELPERS
 * Prevent invalid characters from being entered while the user is typing
 * ============================================================================
 */

/**
 * Filter input for names: allows letters (including Unicode / Amharic), spaces, hyphens, and apostrophes.
 * Disallows numbers and special symbols.
 */
export const filterNameInput = (value: string, maxLength = 80): string => {
  // Replace anything that is not a letter, space, hyphen, or apostrophe
  const filtered = value.replace(/[^\p{L}\s'-]/gu, '');
  return filtered.slice(0, maxLength);
};

/**
 * Filter input for strictly 10-digit phone numbers:
 * Strips non-digits and restricts length to 10.
 */
export const filterPhone10Input = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits.slice(0, 10);
};

/**
 * Filter input for general phone numbers:
 * Allows an optional leading '+' and digits only.
 * Max length 13 (e.g. +251912345678).
 */
export const filterPhoneInput = (value: string): string => {
  let cleaned = value.trim();
  const startsWithPlus = cleaned.startsWith('+');
  const digitsOnly = cleaned.replace(/\D/g, '');
  
  if (startsWithPlus) {
    return ('+' + digitsOnly).slice(0, 13);
  }
  return digitsOnly.slice(0, 12);
};

/**
 * Filter input for positive integers (e.g. rooms, guests, beds, capacities):
 * Strips non-digits.
 */
export const filterIntegerInput = (value: string, maxLength = 6): string => {
  const digits = value.replace(/\D/g, '');
  return digits.slice(0, maxLength);
};

/**
 * Filter input for decimal currency/prices (e.g. 1500.50):
 * Allows digits and at most one decimal point with up to 2 decimal places.
 */
export const filterDecimalInput = (value: string, maxLength = 12): string => {
  let clean = value.replace(/[^\d.]/g, '');
  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = parts[0] + '.' + parts.slice(1).join('');
  }
  const [intPart, decPart] = clean.split('.');
  if (decPart !== undefined) {
    clean = `${intPart}.${decPart.slice(0, 2)}`;
  }
  return clean.slice(0, maxLength);
};

/**
 * Filter input for 6-digit OTP codes.
 */
export const filterOtpInput = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 6);
};

/**
 * Filter input for alphanumeric codes (e.g. promo codes, business IDs).
 */
export const filterAlphaNumericInput = (value: string, maxLength = 30): string => {
  return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, maxLength);
};


/**
 * ============================================================================
 * FIELD VALIDATION FUNCTIONS (Return error message string or null if valid)
 * ============================================================================
 */

export const validateName = (
  name: string,
  fieldLabel = 'Full Name',
  required = true,
  minLength = 2,
  maxLength = 70
): string | null => {
  const trimmed = name?.trim() || '';
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

/**
 * Validate phone numbers with support for strict 10-digit mode or general Ethiopian formats.
 */
export const validatePhone = (
  phone: string,
  required = true,
  strict10Digits = false,
  fieldLabel = 'Phone number'
): string | null => {
  const cleanPhone = phone?.trim() || '';
  if (!cleanPhone) {
    return required ? `${fieldLabel} is required` : null;
  }

  // If strict 10 digits is demanded
  if (strict10Digits) {
    if (!/^\d+$/.test(cleanPhone)) {
      return `${fieldLabel} must contain only digits`;
    }
    if (cleanPhone.length !== 10) {
      return `${fieldLabel} must be exactly 10 digits (you entered ${cleanPhone.length})`;
    }
    if (!cleanPhone.startsWith('09') && !cleanPhone.startsWith('07')) {
      return `${fieldLabel} must start with 09 (Ethio Telecom) or 07 (Safaricom)`;
    }
    return null;
  }

  // General Ethiopian Phone Validation
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
      return `${fieldLabel} in +251 format must be exactly 13 characters (e.g. +251912345678)`;
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
    // Local format (should be 10 digits starting with 09 or 07, or 9 digits without leading 0)
    const startsWithZero = cleanPhone.startsWith('0');
    const normalizedLocal = startsWithZero ? cleanPhone : '0' + cleanPhone;

    if (!normalizedLocal.startsWith('09') && !normalizedLocal.startsWith('07')) {
      return `${fieldLabel} must start with 09 (Ethio Telecom) or 07 (Safaricom)`;
    }

    const expectedLength = startsWithZero ? 10 : 9;
    if (cleanPhone.length !== expectedLength) {
      return `${fieldLabel} must be exactly ${expectedLength} digits (you entered ${cleanPhone.length})`;
    }
  }

  return null;
};

export const validateEmail = (
  email: string,
  required = true,
  fieldLabel = 'Email address'
): string | null => {
  const trimmed = email?.trim() || '';
  if (!trimmed) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return `Please enter a valid ${fieldLabel.toLowerCase()} (e.g. name@example.com)`;
  }
  return null;
};

export const validatePassword = (
  password: string,
  required = true,
  fieldLabel = 'Password'
): string | null => {
  if (!password) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (password.length < 8) {
    return `${fieldLabel} must be at least 8 characters long`;
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return `${fieldLabel} must contain at least one lowercase letter`;
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return `${fieldLabel} must contain at least one uppercase letter`;
  }
  if (!/(?=.*\d)/.test(password)) {
    return `${fieldLabel} must contain at least one number`;
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    return `${fieldLabel} must contain at least one special character`;
  }
  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validatePrice = (
  price: string | number,
  fieldLabel = 'Price',
  required = true,
  min = 1,
  max = 10000000
): string | null => {
  const str = String(price ?? '').trim();
  if (!str) {
    return required ? `${fieldLabel} is required` : null;
  }
  const num = parseFloat(str);
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
  val: string | number,
  fieldLabel = 'Value',
  required = true,
  min = 1,
  max = 10000
): string | null => {
  const str = String(val ?? '').trim();
  if (!str) {
    return required ? `${fieldLabel} is required` : null;
  }
  const num = parseInt(str, 10);
  if (isNaN(num) || !POSITIVE_INTEGER_REGEX.test(str)) {
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
  checkIn: string,
  checkOut: string,
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
  val: string,
  fieldLabel = 'This field',
  minLength = 1,
  maxLength = 500
): string | null => {
  const trimmed = val?.trim() || '';
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

export const validateTIN = (tin: string, required = true): string | null => {
  const clean = tin?.trim() || '';
  if (!clean) {
    return required ? 'Tax Identification Number (TIN) is required' : null;
  }
  if (!TIN_REGEX.test(clean)) {
    return 'TIN must be exactly 10 numeric digits';
  }
  return null;
};

export const validateBankAccount = (
  accountNumber: string,
  required = true,
  fieldLabel = 'Account number'
): string | null => {
  const clean = accountNumber?.trim() || '';
  if (!clean) {
    return required ? `${fieldLabel} is required` : null;
  }
  if (!BANK_ACCOUNT_REGEX.test(clean)) {
    return `${fieldLabel} must contain between 8 and 20 numeric digits`;
  }
  return null;
};

export const validateOtpCode = (otp: string): string | null => {
  const clean = otp?.trim() || '';
  if (!clean) return 'OTP code is required';
  if (!OTP_CODE_REGEX.test(clean)) {
    return 'OTP code must be exactly 6 digits';
  }
  return null;
};

export const validatePercentage = (
  val: string | number,
  fieldLabel = 'Percentage',
  required = true
): string | null => {
  const str = String(val ?? '').trim();
  if (!str) return required ? `${fieldLabel} is required` : null;
  const num = parseFloat(str);
  if (isNaN(num)) return `${fieldLabel} must be a number`;
  if (num < 0 || num > 100) return `${fieldLabel} must be between 0 and 100`;
  return null;
};


/**
 * ============================================================================
 * REUSABLE ZOD SCHEMAS
 * ============================================================================
 */

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(70, 'Name cannot exceed 70 characters')
  .regex(NAME_REGEX, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const phone10Schema = z.string()
  .regex(PHONE_10_DIGIT_STRICT_REGEX, 'Phone must be exactly 10 digits starting with 09 or 07');

export const phoneGeneralSchema = z.string()
  .regex(ETHIOPIAN_PHONE_FULL_REGEX, 'Invalid Ethiopian phone format (+2519..., 2519..., or 09...)');

export const emailSchema = z.string()
  .email('Invalid email address format');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(STRONG_PASSWORD_REGEX, 'Password must include uppercase, lowercase, number, and special character');

export const priceSchema = z.number()
  .positive('Price must be greater than zero')
  .max(10000000, 'Price exceeds maximum allowable value');

export const integerSchema = z.number()
  .int('Must be a whole number')
  .positive('Must be greater than zero');
