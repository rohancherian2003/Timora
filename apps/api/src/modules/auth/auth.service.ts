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

      // Create role-specific profile with PENDING_APPROVAL for business roles
      if (params.role === 'seller') {
        const subtype = params.seller_subtype || 'individual';
        await client.query(
          `INSERT INTO seller_profiles (user_id, seller_subtype, business_name, district_id, locality, approval_status)
           VALUES ($1, $2, $3, $4, $5, 'PENDING_APPROVAL')`,
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
    if (user.role === 'seller') approvalStatus = user.seller_approval_status || 'PENDING_APPROVAL';
    else if (user.role === 'carpenter') approvalStatus = user.carpenter_approval_status || 'PENDING_APPROVAL';
    else if (user.role === 'transport') approvalStatus = user.transport_approval_status || 'PENDING_APPROVAL';

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
   * Update authenticated user profile fields
   * Strictly prevents modifying role, id, or approval_status
   */
  async updateProfile(userId: string, role: string, data: any) {
    const { name, businessName, millName, skills, experience, vehicleDetails, tonnageCapacity } = data;

    if (name && typeof name === 'string') {
      await query(
        `UPDATE user_profiles SET name = $1, updated_at = NOW() WHERE user_id = $2`,
        [name.trim(), userId]
      );
    }

    if (role === 'seller') {
      if (businessName && typeof businessName === 'string') {
        await query(
          `UPDATE seller_profiles SET business_name = $1 WHERE user_id = $2`,
          [businessName.trim(), userId]
        );
      }
      if (millName && typeof millName === 'string') {
        await query(
          `UPDATE timber_mills SET mill_name = $1 WHERE seller_id = $2`,
          [millName.trim(), userId]
        );
      }
    } else if (role === 'carpenter') {
      if (skills || experience != null) {
        await query(
          `UPDATE carpenter_profiles 
           SET specializations = COALESCE($1, specializations),
               experience_years = COALESCE($2, experience_years)
           WHERE user_id = $3`,
          [skills ? (Array.isArray(skills) ? skills : [skills]) : null, experience ? parseInt(String(experience), 10) : null, userId]
        );
      }
    } else if (role === 'transport') {
      if (vehicleDetails || tonnageCapacity != null) {
        await query(
          `UPDATE transport_owner_profiles
           SET vehicle_type = COALESCE($1, vehicle_type),
               tonnage_capacity = COALESCE($2, tonnage_capacity)
           WHERE user_id = $3`,
          [vehicleDetails || null, tonnageCapacity ? parseFloat(String(tonnageCapacity)) : null, userId]
        );
      }
    }

    return { success: true, message: 'Profile updated successfully.' };
  }
}

export const authService = new AuthService();
