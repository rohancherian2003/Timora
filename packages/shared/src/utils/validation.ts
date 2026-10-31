/**
 * Validate an Indian mobile number.
 * Accepts formats: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
 * Returns normalized E.164 format: +91XXXXXXXXXX
 */
export function validateIndianPhone(raw: string): { valid: boolean; normalized?: string; message?: string } {
  const cleaned = raw.replace(/\s+/g, '').replace(/-/g, '');

  // Strip country code prefixes
  let digits = cleaned;
  if (digits.startsWith('+91')) digits = digits.slice(3);
  else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);

  if (!/^\d{10}$/.test(digits)) {
    return {
      valid: false,
      message: 'Please enter a valid 10-digit mobile number.',
    };
  }

  // First digit of a valid Indian mobile must be 6–9
  const firstDigit = digits[0];
  if (!firstDigit || !['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      valid: false,
      message: 'Please enter a valid 10-digit mobile number.',
    };
  }

  return { valid: true, normalized: `+91${digits}` };
}

/**
 * Validate a 6-digit numeric PIN.
 * allowDemo allows standard test PINs like 123456 during development/demo workflows.
 */
export function validatePin(pin: string, allowDemo = false): { valid: boolean; message?: string } {
  if (!/^\d{6}$/.test(pin)) {
    return { valid: false, message: 'PIN must be exactly 6 digits.' };
  }
  if (!allowDemo) {
    // Reject trivial PINs in strict mode
    const trivial = ['000000', '111111', '222222', '333333', '444444', '555555',
                     '666666', '777777', '888888', '999999', '123456', '654321'];
    if (trivial.includes(pin)) {
      return { valid: false, message: 'Please choose a less obvious PIN.' };
    }
  }
  return { valid: true };
}

/**
 * Validate PIN and Confirmation PIN match.
 */
export function validatePinConfirmation(pin: string, confirmPin: string): { valid: boolean; message?: string } {
  if (pin !== confirmPin) {
    return { valid: false, message: 'Security PIN and Confirmation PIN do not match.' };
  }
  return { valid: true };
}

/**
 * Format a price in INR.
 */
export function formatINR(amount: number, options?: { compact?: boolean }): string {
  if (options?.compact && amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (options?.compact && amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate a unique support ticket reference in standard TKT-YYYY-NNNN format (e.g. TKT-2026-0001).
 */
export function formatTicketRef(sequenceNumber: number, year: number = new Date().getFullYear()): string {
  return `TKT-${year}-${String(sequenceNumber).padStart(4, '0')}`;
}

/**
 * Truncate a string with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
