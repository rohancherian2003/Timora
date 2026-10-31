import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import path from 'node:path';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { AppError } from '../middleware/errorHandler.js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function initSupabaseClient() {
  if (
    env.SUPABASE_URL &&
    env.SUPABASE_SERVICE_ROLE_KEY &&
    !env.SUPABASE_URL.includes('placeholder') &&
    env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder'
  ) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
}

initSupabaseClient();

/**
 * Testing helper allowing isolated test suites to inject mock or live isolated Supabase clients.
 */
export function setSupabaseClientForTesting(client: ReturnType<typeof createClient> | null): void {
  supabaseClient = client;
}

/**
 * Reset Supabase client back to environment default.
 */
export function resetSupabaseClient(): void {
  supabaseClient = null;
  initSupabaseClient();
}

/**
 * Inspect storage connectivity status.
 */
export async function checkStorageConnectivity(): Promise<{
  connected: boolean;
  provider: 'supabase' | 'mock_development';
  bucket: string;
  message: string;
}> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.storage.getBucket(env.SUPABASE_STORAGE_BUCKET);
      if (error) {
        return {
          connected: false,
          provider: 'supabase',
          bucket: env.SUPABASE_STORAGE_BUCKET,
          message: error.message,
        };
      }
      return {
        connected: true,
        provider: 'supabase',
        bucket: env.SUPABASE_STORAGE_BUCKET,
        message: 'Connected to Supabase Storage bucket.',
      };
    } catch (err: any) {
      return {
        connected: false,
        provider: 'supabase',
        bucket: env.SUPABASE_STORAGE_BUCKET,
        message: err.message || 'Failed to connect to Supabase Storage.',
      };
    }
  }

  return {
    connected: env.NODE_ENV !== 'production',
    provider: 'mock_development',
    bucket: env.SUPABASE_STORAGE_BUCKET,
    message: 'Using mock development storage fallback (Supabase credentials not configured).',
  };
}

export interface UploadResult {
  storageKey: string;
  publicUrl: string;
}

/**
 * Validates actual binary content (magic bytes) to ensure the uploaded file
 * is genuinely a valid JPEG, PNG, or WebP image and not an executable or malicious script.
 */
export function detectImageSignature(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP magic bytes: RIFF....WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return 'image/webp';
  }

  return null;
}

export async function uploadListingImage(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  listingId: string
): Promise<UploadResult> {
  if (!buffer || buffer.length === 0) {
    throw new AppError(400, 'EMPTY_FILE', 'Uploaded image file cannot be empty.');
  }

  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const normalizedMime = mimeType?.toLowerCase()?.trim();
  if (!allowedMimes.includes(normalizedMime)) {
    throw new AppError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, and WebP images are permitted.');
  }

  if (buffer.length > env.IMAGE_MAX_SIZE_BYTES) {
    throw new AppError(
      400,
      'FILE_TOO_LARGE',
      `Image file exceeds maximum size of ${env.IMAGE_MAX_SIZE_BYTES / (1024 * 1024)}MB.`
    );
  }

  // Deep inspection of magic bytes / content signature
  const detectedMime = detectImageSignature(buffer);
  if (!detectedMime) {
    throw new AppError(
      400,
      'INVALID_IMAGE_CONTENT',
      'File content does not match genuine image binary signature (JPEG, PNG, or WebP).'
    );
  }

  // Determine safe extension based on actual content type
  const extensionMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  const safeExt = extensionMap[detectedMime] || '.jpg';
  const fileHash = crypto.randomBytes(16).toString('hex');
  const storageKey = `listings/${listingId}/${Date.now()}-${fileHash}${safeExt}`;

  // Production Guard: Never permit mock fallback in production
  if (env.NODE_ENV === 'production' && !supabaseClient) {
    throw new AppError(
      500,
      'STORAGE_CONFIG_MISSING',
      'Supabase Storage is not configured in production environment. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
    );
  }

  // Real Supabase upload path
  if (supabaseClient) {
    const { error } = await supabaseClient.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(storageKey, buffer, {
        contentType: normalizedMime,
        upsert: false,
      });

    if (error) {
      logger.error({ error, storageKey }, 'Supabase Storage upload failed');
      throw new AppError(500, 'STORAGE_ERROR', `Supabase Storage upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(storageKey);

    return {
      storageKey,
      publicUrl: publicUrlData.publicUrl,
    };
  }

  // Fallback demo storage URL when Supabase credentials are not provided (development/test only)
  logger.warn(
    { storageKey, size: buffer.length },
    'Using isolated mock storage upload for development. Real Supabase credentials not provided.'
  );
  return {
    storageKey,
    publicUrl: `https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80&timora_storage=mock_dev&demo=${fileHash}`,
  };
}

export function getListingImageUrl(storageKey: string): string {
  if (supabaseClient) {
    const { data } = supabaseClient.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(storageKey);
    return data.publicUrl;
  }
  return `https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80&timora_storage=mock_dev&key=${encodeURIComponent(storageKey)}`;
}

export async function deleteListingImage(storageKey: string): Promise<void> {
  if (supabaseClient) {
    const { error } = await supabaseClient.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .remove([storageKey]);

    if (error) {
      logger.error({ error, storageKey }, 'Supabase Storage deletion failed');
      throw new AppError(500, 'STORAGE_ERROR', `Supabase Storage deletion failed: ${error.message}`);
    }
  }
}
