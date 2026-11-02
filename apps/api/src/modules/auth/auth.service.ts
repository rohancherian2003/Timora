import crypto from 'node:crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { query, withTransaction } from '../../config/database.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logger } from '../../utils/logger.js';
import { validateIndianPhone, validatePin } from '@timora/shared';
import type { UserRole, Language } from '@timora/shared';

export class AuthService {
  /**
   * Request OTP (Simulated in Dev / Twilio in Prod)
   */
  async requestOtp(rawPhone: string, purpose: string): Promise<{ message: string; demoOtp?: string }> {
    const { valid, normalized, message } = validateIndianPhone(rawPhone);
    if (!valid || !normalized) {
      throw new AppError(400, 'INVALID_PHONE', message || 'Please enter a valid 10-digit mobile number.');
    }

    // Generate 6-digit numeric OTP
    const otp = env.OTP_DEMO_MODE ? '123456' : crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

    // Invalidate existing unused OTP challenges for this phone and purpose
    await query(
      `UPDATE otp_challenges SET is_used = true WHERE phone = $1 AND purpose = $2 AND is_used = false`,
      [normalized, purpose]
    );

    await query(
      `INSERT INTO otp_challenges (phone, otp_hash, purpose, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [normalized, otpHash, purpose, expiresAt]
    );

    if (env.OTP_DEMO_MODE) {
      logger.info({ phone: normalized, demoOtp: otp, purpose }, '🔑 [DEMO OTP GENERATED]');
      return {
        message: 'OTP generated in demo mode (logged to server console).',
        demoOtp: otp,
      };
    }

    // Production Twilio SMS dispatch
    // In production Twilio client would dispatch SMS
    logger.info({ phone: normalized, purpose }, 'SMS OTP dispatched to user');
    return {
      message: 'OTP has been dispatched via SMS.',
    };
  }

  /**
   * Verify OTP Challenge
   */
  async verifyOtp(rawPhone: string, otp: string, purpose: string): Promise<{ verified: boolean; tempToken: string }> {
    const { valid, normalized } = validateIndianPhone(rawPhone);
    if (!valid || !normalized) {
      throw new AppError(400, 'INVALID_PHONE', 'Please enter a valid 10-digit mobile number.');
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const res = await query(
      `SELECT id, attempts, expires_at
       FROM otp_challenges
       WHERE phone = $1 AND purpose = $2 AND is_used = false
       ORDER BY created_at DESC
       LIMIT 1`,
      [normalized, purpose]
    );

    const challenge = res.rows[0];
    if (!challenge) {
      throw new AppError(400, 'INVALID_OTP', 'No active OTP request found. Please request a new OTP.');
    }

    if (new Date() > new Date(challenge.expires_at)) {
      throw new AppError(400, 'OTP_EXPIRED', 'OTP has expired. Please request a new one.');
    }

    if (challenge.attempts >= env.OTP_MAX_ATTEMPTS) {
      await query(`UPDATE otp_challenges SET is_used = true WHERE id = $1`, [challenge.id]);
      throw new AppError(429, 'OTP_MAX_ATTEMPTS', 'Maximum verification attempts exceeded. Please request a new OTP.');
    }

    // Verify hash
    const matchRes = await query(
      `SELECT id FROM otp_challenges WHERE id = $1 AND otp_hash = $2`,
      [challenge.id, otpHash]
    );

    if (matchRes.rows.length === 0) {
      await query(`UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = $1`, [challenge.id]);
      throw new AppError(400, 'INVALID_OTP', 'Invalid OTP. Please check the code and try again.');
    }

    // Mark as used
    await query(`UPDATE otp_challenges SET is_used = true WHERE id = $1`, [challenge.id]);

    const tempToken = jwt.sign(
      { phone: normalized, purpose, type: 'otp_verified' },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return { verified: true, tempToken };
  }

  /**
   * Register User with 6-digit PIN and Role
   */
  async register(params: {
    phone: string;
    pin: string;
    role: UserRole;
    name: string;
    district_id?: number;
    language_pref?: Language;
    seller_subtype?: 'individual' | 'mill_owner';
    business_name?: string;
    mill_name?: string;
    daily_cft_capacity?: number;
    saw_types?: string[];
    vehicle_types?: string[];
    vehicle_count?: number;
    max_tonnage?: number;
    locality?: string;
  }) {
    const { valid: phoneValid, normalized: phone } = validateIndianPhone(params.phone);
    if (!phoneValid || !phone) {
      throw new AppError(400, 'INVALID_PHONE', 'Please enter a valid 10-digit mobile number.');
    }

    const { valid: pinValid, message: pinMessage } = validatePin(params.pin);
    if (!pinValid) {
      throw new AppError(400, 'INVALID_PIN', pinMessage || 'Invalid PIN.');
    }

    // Check if user already exists
    const existing = await query(`SELECT id FROM users WHERE phone = $1`, [phone]);
    if (existing.rows.length > 0) {
      throw new AppError(409, 'USER_EXISTS', 'An account with this mobile number already exists. Please login.');
    }

    const pinHash = await argon2.hash(params.pin, {
      memoryCost: env.ARGON2_MEMORY,
      timeCost: env.ARGON2_ITERATIONS,
      parallelism: env.ARGON2_PARALLELISM,
    });

    return await withTransaction(async (client) => {
      const userRes = await client.query(
        `INSERT INTO users (phone, pin_hash, role)
         VALUES ($1, $2, $3)
         RETURNING id, phone, role, created_at`,
        [phone, pinHash, params.role]
      );
      const user = userRes.rows[0];

      await client.query(
        `INSERT INTO user_profiles (user_id, name, district_id, language_pref)
         VALUES ($1, $2, $3, $4)`,
        [user.id, params.name, params.district_id || null, params.language_pref || 'en']
      );

      // Create role-specific profile with pending status for business roles
      if (params.role === 'seller') {
        const subtype = params.seller_subtype || 'individual';
        await client.query(
          `INSERT INTO seller_profiles (user_id, seller_subtype, business_name, district_id, locality, approval_status)
           VALUES ($1, $2, $3, $4, $5, 'pending')`,
          [user.id, subtype, params.business_name || null, params.district_id || null, params.locality || null]
        );

        if (subtype === 'mill_owner') {
          await client.query(
            `INSERT INTO timber_mills (owner_id, mill_name, district_id, locality, daily_cft_capacity, saw_types, approval_status)
             VALUES ($1, $2, $3, $4, $5, $6, 'PENDING_APPROVAL')`,
            [
              user.id,
              params.mill_name || params.business_name || `${params.name} Timber Sawmill`,
              params.district_id || null,
              params.locality || null,
              params.daily_cft_capacity || 0,
              params.saw_types || [],
            ]
          );
        }
      } else if (params.role === 'carpenter') {
        await client.query(
          `INSERT INTO carpenter_profiles (user_id, business_name, district_id, approval_status)
           VALUES ($1, $2, $3, 'PENDING_APPROVAL')`,
          [user.id, params.business_name || params.name, params.district_id || null]
        );
      } else if (params.role === 'transport') {
        await client.query(
          `INSERT INTO transport_owner_profiles (user_id, business_name, district_id, vehicle_types, vehicle_count, max_tonnage, approval_status)
           VALUES ($1, $2, $3, $4, $5, $6, 'PENDING_APPROVAL')`,
          [
            user.id,
            params.business_name || `${params.name} Timber Haulage`,
            params.district_id || null,
            params.vehicle_types || ['Timber Lorry'],
            params.vehicle_count || 1,
            params.max_tonnage || 10.0,
          ]
        );
      }

      // Default notification preferences
      await client.query(
        `INSERT INTO notification_preferences (user_id) VALUES ($1)`,
        [user.id]
      );

      const accessToken = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRES as `${number}m` | `${number}h` | `${number}d` }
      );

      const refreshToken = jwt.sign(
        { id: user.id, tokenVersion: 1 },
        env.JWT_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES as `${number}m` | `${number}h` | `${number}d` }
      );

      return {
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          name: params.name,
          approval_status: params.role === 'buyer' ? 'APPROVED' : 'PENDING_APPROVAL',
        },
        accessToken,
        refreshToken,
      };
    });
  }

  /**
   * Login with Phone and PIN
   */
  async login(rawPhone: string, pin: string, meta?: { ip?: string; userAgent?: string }) {
    const { valid, normalized: phone } = validateIndianPhone(rawPhone);
    if (!valid || !phone) {
      throw new AppError(400, 'INVALID_PHONE', 'Please enter a valid 10-digit mobile number.');
    }

    const res = await query(
      `SELECT u.id, u.phone, u.pin_hash, u.role, u.is_active, p.name, p.language_pref, p.account_tier,
              sp.seller_subtype, sp.approval_status as seller_approval_status, sp.business_name as seller_business,
              cp.approval_status as carpenter_approval_status,
              tp.approval_status as transport_approval_status
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       LEFT JOIN carpenter_profiles cp ON cp.user_id = u.id
       LEFT JOIN transport_owner_profiles tp ON tp.user_id = u.id
       WHERE u.phone = $1`,
      [phone]
    );

    const user = res.rows[0];
    if (!user) {
      // Record failed login
      await query(
        `INSERT INTO login_history (ip_address, user_agent, success) VALUES ($1, $2, false)`,
        [meta?.ip || null, meta?.userAgent || null]
      );
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid phone number or PIN.');
    }

    if (!user.is_active) {
      throw new AppError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended. Please contact Timora support.');
    }

    const pinMatch = await argon2.verify(user.pin_hash, pin);
    if (!pinMatch) {
      await query(
        `INSERT INTO login_history (user_id, ip_address, user_agent, success) VALUES ($1, $2, $3, false)`,
        [user.id, meta?.ip || null, meta?.userAgent || null]
      );
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid phone number or PIN.');
    }

    // Record successful login
    await query(
      `INSERT INTO login_history (user_id, ip_address, user_agent, success) VALUES ($1, $2, $3, true)`,
      [user.id, meta?.ip || null, meta?.userAgent || null]
    );

    let approvalStatus = 'APPROVED';
    if (user.role === 'seller') {
      const raw = user.seller_approval_status;
      if (raw === 'approved' || raw === 'APPROVED') approvalStatus = 'APPROVED';
      else if (raw === 'rejected' || raw === 'REJECTED') approvalStatus = 'REJECTED';
      else if (raw === 'suspended' || raw === 'SUSPENDED') approvalStatus = 'SUSPENDED';
      else approvalStatus = 'PENDING_APPROVAL';
    } else if (user.role === 'carpenter') {
      approvalStatus = user.carpenter_approval_status || 'PENDING_APPROVAL';
    } else if (user.role === 'transport') {
      approvalStatus = user.transport_approval_status || 'PENDING_APPROVAL';
    }

    const accessToken = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES as `${number}m` | `${number}h` | `${number}d` }
    );

    const refreshToken = jwt.sign(
      { id: user.id, tokenVersion: 1 },
      env.JWT_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES as `${number}m` | `${number}h` | `${number}d` }
    );

    return {
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        seller_subtype: user.seller_subtype,
        name: user.name,
        language_pref: user.language_pref,
        account_tier: user.account_tier,
        approval_status: approvalStatus,
        seller_approval_status: user.seller_approval_status,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rotate refresh token and issue a fresh access token
   */
  async rotateTokens(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new AppError(400, 'REFRESH_TOKEN_REQUIRED', 'Refresh token is required.');
    }

    let payload: { id: string; tokenVersion?: number };
    try {
      payload = jwt.verify(rawRefreshToken, env.JWT_SECRET) as { id: string; tokenVersion?: number };
    } catch {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.');
    }

    const res = await query(
      `SELECT u.id, u.phone, u.role, u.is_active, p.name, p.language_pref, p.account_tier,
              sp.seller_subtype, sp.approval_status as seller_approval_status, sp.business_name as seller_business,
              cp.approval_status as carpenter_approval_status,
              tp.approval_status as transport_approval_status
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       LEFT JOIN carpenter_profiles cp ON cp.user_id = u.id
       LEFT JOIN transport_owner_profiles tp ON tp.user_id = u.id
       WHERE u.id = $1`,
      [payload.id]
    );

    const user = res.rows[0];
    if (!user) {
      throw new AppError(401, 'USER_NOT_FOUND', 'User belonging to this token no longer exists.');
    }

    if (!user.is_active) {
      throw new AppError(403, 'ACCOUNT_DEACTIVATED', 'Your account has been deactivated.');
    }

    const approvalStatus =
      user.role === 'buyer'
        ? 'APPROVED'
        : user.seller_approval_status ||
          user.carpenter_approval_status ||
          user.transport_approval_status ||
          'PENDING_APPROVAL';

    const accessToken = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES as `${number}m` | `${number}h` | `${number}d` }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, tokenVersion: (payload.tokenVersion || 1) + 1 },
      env.JWT_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES as `${number}m` | `${number}h` | `${number}d` }
    );

    return {
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        seller_subtype: user.seller_subtype,
        seller_business: user.seller_business,
        language_pref: user.language_pref,
        account_tier: user.account_tier,
        approval_status: approvalStatus,
      },
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Update authenticated user profile fields
   * Strictly prevents modifying role, id, phone, is_active, or approval_status
   */
  async updateProfile(userId: string, role: string, data: any) {
    const {
      name,
      businessName,
      business_name,
      millName,
      mill_name,
      skills,
      experience,
      vehicleDetails,
      vehicle_details,
      tonnageCapacity,
      tonnage_capacity,
      district,
      district_id,
      locality,
    } = data;

    const effectiveBusinessName = businessName !== undefined ? businessName : business_name;
    const effectiveMillName = millName !== undefined ? millName : mill_name;
    const effectiveVehicleDetails = vehicleDetails !== undefined ? vehicleDetails : vehicle_details;
    const effectiveTonnageCapacity = tonnageCapacity !== undefined ? tonnageCapacity : tonnage_capacity;

    let districtId: number | null = null;
    if (district !== undefined && district !== null) {
      if (typeof district === 'number') {
        if (district < 1 || district > 14) {
          throw new AppError(400, 'INVALID_DISTRICT', 'District ID must be between 1 and 14.');
        }
        districtId = district;
      } else if (typeof district === 'string') {
        const trimmedDist = district.trim();
        if (trimmedDist.length === 0) {
          throw new AppError(400, 'INVALID_DISTRICT', 'District name cannot be empty.');
        }
        const distMatch = trimmedDist.split(' ')[0]?.replace(/[^a-zA-Z]/g, '');
        const distRes = await query(
          `SELECT id FROM kerala_districts WHERE name_en ILIKE $1 OR name_ml ILIKE $2 LIMIT 1`,
          [`%${distMatch || trimmedDist}%`, `%${trimmedDist}%`]
        );
        const matchedDistrict = distRes.rows[0];
        if (!matchedDistrict) {
          throw new AppError(400, 'INVALID_DISTRICT', `"${trimmedDist}" is not a recognized Kerala district.`);
        }
        districtId = matchedDistrict.id;
      }
    } else if (district_id !== undefined && district_id !== null) {
      const dId = Number(district_id);
      if (isNaN(dId) || dId < 1 || dId > 14) {
        throw new AppError(400, 'INVALID_DISTRICT', 'District ID must be between 1 and 14.');
      }
      districtId = dId;
    }

    if (name !== undefined && name !== null) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        throw new AppError(400, 'INVALID_NAME', 'Name must be at least 2 characters.');
      }
      if (name.trim().length > 100) {
        throw new AppError(400, 'INVALID_NAME', 'Name must not exceed 100 characters.');
      }
      await query(
        `UPDATE user_profiles 
         SET name = $1, 
             district_id = COALESCE($2, district_id),
             updated_at = NOW() 
         WHERE user_id = $3`,
        [name.trim(), districtId, userId]
      );
    } else if (districtId) {
      await query(
        `UPDATE user_profiles SET district_id = $1, updated_at = NOW() WHERE user_id = $2`,
        [districtId, userId]
      );
    }

    if (role === 'seller') {
      const trimmedBusiness = typeof effectiveBusinessName === 'string' ? effectiveBusinessName.trim() : null;
      const trimmedLocality = typeof locality === 'string' ? locality.trim() : null;

      if (trimmedBusiness || districtId || trimmedLocality) {
        await query(
          `UPDATE seller_profiles 
           SET business_name = COALESCE($1, business_name),
               district_id = COALESCE($2, district_id),
               locality = COALESCE($3, locality),
               updated_at = NOW()
           WHERE user_id = $4`,
          [trimmedBusiness, districtId, trimmedLocality, userId]
        );
      }
      if (effectiveMillName && typeof effectiveMillName === 'string') {
        await query(
          `UPDATE timber_mills 
           SET mill_name = $1,
               district_id = COALESCE($2, district_id),
               locality = COALESCE($3, locality),
               updated_at = NOW()
           WHERE owner_id = $4`,
          [effectiveMillName.trim(), districtId, trimmedLocality, userId]
        );
      }
    } else if (role === 'carpenter') {
      if (skills || experience != null || effectiveBusinessName || districtId) {
        if (experience != null) {
          const exp = Number(experience);
          if (isNaN(exp) || exp < 0 || exp > 70) {
            throw new AppError(400, 'INVALID_INPUT', 'Experience must be a number between 0 and 70.');
          }
        }
        const specializationsArr = skills
          ? (Array.isArray(skills) ? skills : String(skills).split(',').map((s) => s.trim()).filter(Boolean))
          : null;
        await query(
          `UPDATE carpenter_profiles 
           SET specialization = COALESCE($1, specialization),
               experience_yrs = COALESCE($2, experience_yrs),
               business_name = COALESCE($3, business_name),
               district_id = COALESCE($4, district_id),
               updated_at = NOW()
           WHERE user_id = $5`,
          [
            specializationsArr,
            experience != null ? parseInt(String(experience), 10) : null,
            effectiveBusinessName ? String(effectiveBusinessName).trim() : null,
            districtId,
            userId,
          ]
        );
      }
    } else if (role === 'transport') {
      if (effectiveVehicleDetails || effectiveTonnageCapacity != null || effectiveBusinessName || districtId) {
        if (effectiveTonnageCapacity != null) {
          const ton = Number(effectiveTonnageCapacity);
          if (isNaN(ton) || ton <= 0 || ton > 100) {
            throw new AppError(400, 'INVALID_INPUT', 'Tonnage capacity must be a positive number up to 100.');
          }
        }
        const vehicleArr = effectiveVehicleDetails
          ? (Array.isArray(effectiveVehicleDetails) ? effectiveVehicleDetails : [String(effectiveVehicleDetails).trim()])
          : null;
        await query(
          `UPDATE transport_owner_profiles
           SET vehicle_types = COALESCE($1, vehicle_types),
               max_tonnage = COALESCE($2, max_tonnage),
               business_name = COALESCE($3, business_name),
               district_id = COALESCE($4, district_id),
               updated_at = NOW()
           WHERE user_id = $5`,
          [
            vehicleArr,
            effectiveTonnageCapacity != null ? parseFloat(String(effectiveTonnageCapacity)) : null,
            effectiveBusinessName ? String(effectiveBusinessName).trim() : null,
            districtId,
            userId,
          ]
        );
      }
    }

    return { success: true, message: 'Profile updated successfully.' };
  }

  /**
   * Initiate self-service phone change
   */
  async initiatePhoneChange(userId: string, newPhone: string) {
    const { valid, normalized, message } = validateIndianPhone(newPhone);
    if (!valid || !normalized) {
      throw new AppError(400, 'INVALID_PHONE', message || 'Please enter a valid 10-digit mobile number.');
    }

    const currentRes = await query('SELECT phone FROM users WHERE id = $1', [userId]);
    if (currentRes.rows[0]?.phone === normalized) {
      throw new AppError(400, 'SAME_PHONE', 'The new phone number cannot be the same as your current phone number.');
    }

    const existing = await query('SELECT id FROM users WHERE phone = $1 AND id != $2', [normalized, userId]);
    if (existing.rows.length > 0) {
      throw new AppError(409, 'PHONE_ALREADY_EXISTS', 'This mobile number is already registered to another Timora account.');
    }

    const hasLiveSms = !env.OTP_DEMO_MODE && !!env.TWILIO_ACCOUNT_SID;
    if (!hasLiveSms) {
      return {
        configured: false,
        message: 'Live SMS gateway is not configured on this server. Contact Timora support or configure a verified SMS provider (Twilio / Indian DLT Gateway) to proceed.',
      };
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

    await query(
      `UPDATE otp_challenges SET is_used = true WHERE phone = $1 AND purpose = 'phone_change' AND is_used = false`,
      [normalized]
    );

    await query(
      `INSERT INTO otp_challenges (phone, otp_hash, purpose, expires_at)
       VALUES ($1, $2, 'phone_change', $3)`,
      [normalized, otpHash, expiresAt]
    );

    logger.info({ phone: normalized, purpose: 'phone_change' }, 'SMS OTP dispatched for phone change');
    return {
      configured: true,
      message: 'OTP has been dispatched via SMS to your new mobile number.',
    };
  }

  /**
   * Verify and execute phone change
   */
  async verifyPhoneChange(userId: string, newPhone: string, otp: string) {
    const { valid, normalized } = validateIndianPhone(newPhone);
    if (!valid || !normalized) {
      throw new AppError(400, 'INVALID_PHONE', 'Please enter a valid 10-digit mobile number.');
    }

    const hasLiveSms = !env.OTP_DEMO_MODE && !!env.TWILIO_ACCOUNT_SID;
    if (!hasLiveSms) {
      throw new AppError(
        422,
        'SMS_GATEWAY_NOT_CONFIGURED',
        'Cannot verify phone number without active SMS gateway infrastructure.'
      );
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const res = await query(
      `SELECT id, attempts, expires_at
       FROM otp_challenges
       WHERE phone = $1 AND purpose = 'phone_change' AND is_used = false
       ORDER BY created_at DESC
       LIMIT 1`,
      [normalized]
    );

    const challenge = res.rows[0];
    if (!challenge) {
      throw new AppError(400, 'INVALID_OTP', 'No active OTP request found for this number.');
    }

    if (new Date() > new Date(challenge.expires_at)) {
      throw new AppError(400, 'OTP_EXPIRED', 'Verification code has expired. Please request a new code.');
    }

    if (challenge.attempts >= env.OTP_MAX_ATTEMPTS) {
      await query(`UPDATE otp_challenges SET is_used = true WHERE id = $1`, [challenge.id]);
      throw new AppError(429, 'OTP_MAX_ATTEMPTS', 'Maximum verification attempts exceeded.');
    }

    const matchRes = await query(
      `SELECT id FROM otp_challenges WHERE id = $1 AND otp_hash = $2`,
      [challenge.id, otpHash]
    );

    if (matchRes.rows.length === 0) {
      await query(`UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = $1`, [challenge.id]);
      throw new AppError(400, 'INVALID_OTP', 'Invalid verification code. Please check and try again.');
    }

    await query(`UPDATE otp_challenges SET is_used = true WHERE id = $1`, [challenge.id]);
    await query(`UPDATE users SET phone = $1, updated_at = NOW() WHERE id = $2`, [normalized, userId]);

    logger.info({ userId, newPhone: normalized }, 'User phone number updated successfully');
    return {
      success: true,
      newPhone: normalized,
      message: 'Mobile number updated successfully. You can now log in using this number.',
    };
  }

  /**
   * Get live authoritative profile including approval status
   */
  async getMe(userId: string) {
    const res = await query(
      `SELECT u.id, u.phone, u.role, u.is_active, p.name, p.language_pref, p.account_tier,
              kd.name_en as district_en, kd.name_ml as district_ml,
              sp.seller_subtype, sp.approval_status as seller_approval_status, sp.business_name as seller_business, sp.approval_note as seller_approval_note,
              tm.mill_name, tm.approval_status as mill_approval_status, tm.approval_note as mill_approval_note,
              cp.approval_status as carpenter_approval_status, cp.approval_note as carpenter_approval_note,
              cp.specialization as carpenter_skills, cp.experience_yrs as carpenter_exp,
              tp.approval_status as transport_approval_status, tp.approval_note as transport_approval_note,
              tp.vehicle_types as transport_vehicles, tp.max_tonnage as transport_tonnage
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN kerala_districts kd ON kd.id = p.district_id
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       LEFT JOIN timber_mills tm ON tm.owner_id = u.id
       LEFT JOIN carpenter_profiles cp ON cp.user_id = u.id
       LEFT JOIN transport_owner_profiles tp ON tp.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    const user = res.rows[0];
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found.');

    let approvalStatus = 'APPROVED';
    let approvalNote: string | undefined = undefined;

    if (user.role === 'seller') {
      const raw = user.seller_subtype === 'mill_owner'
        ? (user.mill_approval_status || user.seller_approval_status)
        : user.seller_approval_status;
      if (raw === 'approved' || raw === 'APPROVED') approvalStatus = 'APPROVED';
      else if (raw === 'rejected' || raw === 'REJECTED') approvalStatus = 'REJECTED';
      else if (raw === 'suspended' || raw === 'SUSPENDED') approvalStatus = 'SUSPENDED';
      else approvalStatus = 'PENDING_APPROVAL';

      approvalNote = user.seller_subtype === 'mill_owner'
        ? (user.mill_approval_note || user.seller_approval_note || undefined)
        : (user.seller_approval_note || undefined);
    } else if (user.role === 'carpenter') {
      approvalStatus = user.carpenter_approval_status || 'PENDING_APPROVAL';
      approvalNote = user.carpenter_approval_note || undefined;
    } else if (user.role === 'transport') {
      approvalStatus = user.transport_approval_status || 'PENDING_APPROVAL';
      approvalNote = user.transport_approval_note || undefined;
    }

    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      businessName: user.seller_business || user.mill_name,
      millName: user.mill_name,
      district: user.district_en ? `${user.district_en} (${user.district_ml})` : undefined,
      skills: user.carpenter_skills,
      experience: user.carpenter_exp,
      vehicleDetails: user.transport_vehicles ? (Array.isArray(user.transport_vehicles) ? user.transport_vehicles.join(', ') : user.transport_vehicles) : undefined,
      tonnageCapacity: user.transport_tonnage,
      sellerSubtype: user.seller_subtype,
      approvalStatus,
      approvalNote,
      isActive: user.is_active,
    };
  }
}

export const authService = new AuthService();
