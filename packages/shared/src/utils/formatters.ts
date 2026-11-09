/**
 * Timora Platform User & Phone Formatters
 * Enforces standardized, memorable public identifiers and clean Indian phone display.
 */

export interface FormatUserIdInput {
  id?: string;
  role?: string;
  sellerSubtype?: string;
  phone?: string;
  [key: string]: any;
}

/**
 * Formats a user into a distinct, memorable User Profile ID:
 * `TMR-[ROLE_CODE]-[4_DIGITS]`
 *
 * Role mapping:
 * - Carpenter: CRP
 * - Buyer: BYR
 * - Individual Seller: SLR
 * - Timber Mill: MIL
 * - Transport: TRN
 * - Admin: ADM
 *
 * Suffix: Deterministic 4-character/digit code derived from user UUID or registered phone number.
 */
export function formatUserProfileId(
  userOrRole?: FormatUserIdInput | string | null,
  idArg?: string,
  phoneArg?: string,
  subtypeArg?: string
): string {
  let role = '';
  let subtype = '';
  let id = '';
  let phone = '';

  if (typeof userOrRole === 'string') {
    role = userOrRole;
    id = idArg || '';
    phone = phoneArg || '';
    subtype = subtypeArg || '';
  } else if (userOrRole && typeof userOrRole === 'object') {
    role = userOrRole.role || '';
    subtype = userOrRole.sellerSubtype || '';
    id = userOrRole.id || '';
    phone = userOrRole.phone || '';
  }

  // 1. Role code mapping (3 uppercase letters)
  let roleCode = 'USR';
  const r = (role || '').toLowerCase();
  const s = (subtype || '').toLowerCase();

  if (r === 'carpenter') {
    roleCode = 'CRP';
  } else if (r === 'buyer') {
    roleCode = 'BYR';
  } else if (r === 'seller') {
    roleCode = s === 'mill_owner' ? 'MIL' : 'SLR';
  } else if (r === 'mill_owner' || r === 'mill') {
    roleCode = 'MIL';
  } else if (r === 'transport') {
    roleCode = 'TRN';
  } else if (r === 'admin') {
    roleCode = 'ADM';
  }

  // 2. Extract deterministic 4-character suffix
  let suffix = '';

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // A) If ID is a genuine UUID, extract the last 4 characters
  if (isUuid) {
    const cleanUuid = id.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    if (cleanUuid.length >= 4) {
      suffix = cleanUuid.slice(-4);
    }
  }

  // B) If not a UUID or suffix not found, extract from registered phone number
  if (!suffix || suffix.length < 4) {
    if (phone) {
      const phoneDigits = String(phone).replace(/\D/g, '');
      if (phoneDigits.length >= 4) {
        suffix = phoneDigits.slice(-4);
      }
    }
  }

  // C) If still empty, check for any digits in id
  if (!suffix || suffix.length < 4) {
    if (id) {
      const idDigits = String(id).replace(/\D/g, '');
      if (idDigits.length >= 4) {
        suffix = idDigits.slice(-4);
      } else if (idDigits.length > 0) {
        suffix = idDigits.padStart(4, '0');
      }
    }
  }

  // D) Normalize all-zero suffix for admin demo (e.g. 9847000000 -> 0001)
  if (suffix === '0000' && r === 'admin') {
    suffix = '0001';
  }

  // E) Safe fallback
  if (!suffix) {
    suffix = '0001';
  } else if (suffix.length < 4) {
    suffix = suffix.padStart(4, '0');
  }

  return `TMR-${roleCode}-${suffix}`;
}

/**
 * Cleanly formats phone numbers to strictly the 10-digit number.
 * Strips any leading '+91', country code prefixes, spaces, or non-digit characters.
 */
export function formatCleanPhone(phone?: string | null): string {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return String(phone).replace(/^\+?91\s*/, '').trim();
}
