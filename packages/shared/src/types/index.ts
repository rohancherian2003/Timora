// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'buyer' | 'seller' | 'carpenter' | 'admin';
export type AccountTier = 'free' | 'premium';
export type Language = 'en' | 'ml';

export type OtpPurpose =
  | 'register'
  | 'login'
  | 'forgot_pin'
  | 'phone_change';

export type SellerApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended';

// ─── Marketplace ─────────────────────────────────────────────────────────────

export type TimberGrade = 'A' | 'B' | 'C' | 'Ungraded';

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'hidden'
  | 'out_of_stock'
  | 'expired';

export type TimberUnit = 'cft' | 'pieces' | 'kg' | 'tonnes';
export type PricingMode = 'fixed' | 'negotiable';

// ─── Enquiries & Offers ───────────────────────────────────────────────────────

export type EnquiryStatus =
  | 'open'
  | 'offer_made'
  | 'accepted'
  | 'rejected'
  | 'ordered'
  | 'closed';

export type OfferStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'countered'
  | 'expired'
  | 'withdrawn';

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'ready'
  | 'in_progress'
  | 'delivered_pending'
  | 'completed'
  | 'cancellation_requested'
  | 'cancelled'
  | 'disputed';

export type CancellationStatus = 'pending' | 'approved' | 'rejected' | 'admin_review';

// ─── Support & Disputes ───────────────────────────────────────────────────────

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';
export type ReportTargetType = 'user' | 'listing' | 'message' | 'review';

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationCategory =
  | 'enquiry'
  | 'offer'
  | 'order'
  | 'seller_account'
  | 'listing_review'
  | 'buyer_request'
  | 'wishlist'
  | 'support'
  | 'security';

// ─── Buyer Requests ───────────────────────────────────────────────────────────

export type BuyerRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'shared_with_sellers'
  | 'response_received'
  | 'fulfilled'
  | 'closed';

// ─── API Response Shapes ─────────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Domain Entities (lightweight, for API responses) ────────────────────────

export interface TimberSpecies {
  id: number;
  name_en: string;
  name_ml: string;
  slug: string;
}

export interface TimberType {
  id: number;
  name_en: string;
  name_ml: string;
  slug: string;
  description?: string;
}

export interface KeralaDistrict {
  id: number;
  name_en: string;
  name_ml: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  district?: KeralaDistrict;
  avatar_url?: string;
  language_pref: Language;
  account_tier: AccountTier;
  is_active: boolean;
  created_at: string;
}

export interface SellerProfile {
  user_id: string;
  business_name?: string;
  district?: KeralaDistrict;
  locality?: string;
  approval_status: SellerApprovalStatus;
}

export interface TimberListingImage {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface TimberListing {
  id: string;
  seller_id: string;
  title: string;
  species: TimberSpecies;
  timber_type: TimberType;
  district: KeralaDistrict;
  locality?: string;
  quantity: number;
  unit: TimberUnit;
  price_per_cft: number;
  pricing_mode: PricingMode;
  // Dimensions
  length_ft?: number;
  width_in?: number;
  thickness_in?: number;
  diameter_in?: number;
  pieces?: number;
  // Quality (seller-reported — not independently certified)
  is_dried?: boolean;
  moisture_pct?: number;
  has_cracks?: boolean;
  condition_notes?: string;
  description?: string;
  // Status
  status: ListingStatus;
  view_count: number;
  images: TimberListingImage[];
  seller?: Partial<UserProfile>;
  created_at: string;
  updated_at: string;
}

// ─── Calculator ───────────────────────────────────────────────────────────────

export interface TimberCalcInput {
  length_ft: number;       // Length in feet
  width_in: number;        // Width in inches
  thickness_in: number;    // Thickness in inches
  pieces: number;          // Number of pieces
  price_per_cft?: number;  // Optional ₹/CFT
}

export interface RoundLogCalcInput {
  diameter_in: number;     // Average diameter in inches
  length_ft: number;       // Length in feet
  price_per_cft?: number;
}

export interface TimberCalcResult {
  cft_per_piece: number;
  total_cft: number;
  total_cft_m3: number;       // converted to cubic metres
  estimated_cost: number | null;
  formula_used: string;
  is_approximate: boolean;
}
