/**
 * Client-side listing persistence layer for demo/offline sessions.
 *
 * When the backend is unavailable (demo-token sessions), listings submitted by sellers
 * are stored in localStorage so they can be read by the Admin Console and Seller Dashboard.
 *
 * In production (real JWT sessions), the backend is the source of truth and this store
 * acts only as a cross-tab sync helper.
 */

const PENDING_LISTINGS_KEY = 'timora_pending_listings';
const APPROVED_LISTINGS_KEY = 'timora_approved_listings';

export interface LocalListing {
  id: string;
  title: string;
  species_id: number;
  species_name: string;
  timber_type_id: number;
  timber_type_name: string;
  district_id: number;
  district_name: string;
  quantity: number;
  unit: string;
  price_per_cft: number;
  pricing_mode: string;
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  business_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  image_urls: string[];
  images: Array<{ id: string; url: string; is_primary: boolean }>;
  image_count: number;
  created_at: string;
  approved_at?: string;
}

// ─── Species & District Maps (fallback for offline label resolution) ───

const SPECIES_MAP: Record<number, string> = {
  1: 'Teak (തേക്ക്)',
  2: 'Mahogany (മഹാഗണി)',
  3: 'Anjili (ആഞ്ഞിലി)',
  4: 'Rubberwood (റബ്ബർ)',
  6: 'Jackfruit (പ്ലാവ്)',
  7: 'Rosewood (ഈട്ടി)',
  8: 'Firewood (വിറക്)',
};

const TIMBER_TYPE_MAP: Record<number, string> = {
  1: 'Round Logs (ലോഗ്സ്)',
  2: 'Rough-sawn Planks (പലക)',
  3: 'Squared Beams (തൂൺ)',
  4: 'Firewood (വിറക്)',
};

const DISTRICT_MAP: Record<number, string> = {
  1: 'Thiruvananthapuram (തിരുവനന്തപുരം)',
  2: 'Kollam (കൊല്ലം)',
  3: 'Pathanamthitta (പത്തനംതിട്ട)',
  4: 'Alappuzha (ആലപ്പുഴ)',
  5: 'Kottayam (കോട്ടയം)',
  6: 'Idukki (ഇടുക്കി)',
  7: 'Ernakulam (എറണാകുളം)',
  8: 'Thrissur (തൃശ്ശൂർ)',
  9: 'Palakkad (പാലക്കാട്)',
  10: 'Malappuram (മലപ്പുറം)',
  11: 'Kozhikode (കോഴിക്കോട്)',
  12: 'Wayanad (വയനാട്)',
  13: 'Kannur (കണ്ണൂർ)',
  14: 'Kasaragod (കാസർഗോഡ്)',
};

// ─── Helpers ───

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── Generate Listing ID ───

let listingCounter = 0;

export function generateListingId(): string {
  listingCounter += 1;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `lst-local-${Date.now().toString(36)}-${rand}`;
}

// ─── Resolve Species/District Labels ───

export function resolveSpeciesName(speciesId: number): string {
  return SPECIES_MAP[speciesId] || `Species #${speciesId}`;
}

export function resolveTimberTypeName(typeId: number): string {
  return TIMBER_TYPE_MAP[typeId] || `Type #${typeId}`;
}

export function resolveDistrictName(districtId: number): string {
  return DISTRICT_MAP[districtId] || `District #${districtId}`;
}

// ─── CRUD Operations ───

/** Get all pending listings from localStorage */
export function getPendingListings(): LocalListing[] {
  return readJSON<LocalListing[]>(PENDING_LISTINGS_KEY, []);
}

/** Get all approved listings from localStorage */
export function getApprovedListings(): LocalListing[] {
  return readJSON<LocalListing[]>(APPROVED_LISTINGS_KEY, []);
}

/** Get all listings for a specific seller (pending + approved) */
export function getSellerListings(sellerId: string): LocalListing[] {
  const pending = getPendingListings().filter((l) => l.seller_id === sellerId);
  const approved = getApprovedListings().filter((l) => l.seller_id === sellerId);
  return [...pending, ...approved];
}

/** Add a new pending listing */
export function addPendingListing(listing: LocalListing): void {
  const existing = getPendingListings();
  // Deduplicate by ID
  const deduped = existing.filter((l) => l.id !== listing.id);
  deduped.push(listing);
  writeJSON(PENDING_LISTINGS_KEY, deduped);
  broadcastSync();
}

/** Approve a listing: move from pending to approved */
export function approveListing(listingId: string): void {
  const pending = getPendingListings();
  const listing = pending.find((l) => l.id === listingId);
  if (listing) {
    listing.status = 'approved';
    listing.approved_at = new Date().toISOString();
    // Remove from pending
    writeJSON(PENDING_LISTINGS_KEY, pending.filter((l) => l.id !== listingId));
    // Add to approved
    const approved = getApprovedListings();
    approved.push(listing);
    writeJSON(APPROVED_LISTINGS_KEY, approved);
  }
  broadcastSync();
}

/** Reject a listing: remove from pending */
export function rejectListing(listingId: string): void {
  const pending = getPendingListings();
  writeJSON(PENDING_LISTINGS_KEY, pending.filter((l) => l.id !== listingId));
  broadcastSync();
}

/** Delete a listing from both pending and approved */
export function deleteListing(listingId: string): void {
  writeJSON(PENDING_LISTINGS_KEY, getPendingListings().filter((l) => l.id !== listingId));
  writeJSON(APPROVED_LISTINGS_KEY, getApprovedListings().filter((l) => l.id !== listingId));
  broadcastSync();
}

/** Broadcast a sync event so other tabs/components pick up the change */
function broadcastSync(): void {
  try {
    localStorage.setItem('timora_last_listing_sync', String(Date.now()));
  } catch {}
  window.dispatchEvent(new CustomEvent('timora_listings_updated'));
}

/** Check if the current session is a demo session */
export function isDemoSession(): boolean {
  const token =
    localStorage.getItem('timora_auth_token') ||
    localStorage.getItem('timora_access_token');
  return Boolean(token && token.startsWith('demo-'));
}

/** Get current user profile from localStorage */
export function getCurrentUser(): { id: string; name: string; phone: string; businessName?: string } | null {
  try {
    const raw = localStorage.getItem('timora_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

