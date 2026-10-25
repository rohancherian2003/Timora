import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import path from 'node:path';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { AppError } from '../middleware/errorHandler.js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export interface UploadResult {
  storageKey: string;
  publicUrl: string;
}

export async function uploadListingImage(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  listingId: string
): Promise<UploadResult> {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(mimeType)) {
    throw new AppError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, and WebP images are permitted.');
  }

  if (buffer.length > env.IMAGE_MAX_SIZE_BYTES) {
    throw new AppError(400, 'FILE_TOO_LARGE', `Image file exceeds maximum size of ${env.IMAGE_MAX_SIZE_BYTES / (1024 * 1024)}MB.`);
  }

  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const fileHash = crypto.randomBytes(16).toString('hex');
  const storageKey = `listings/${listingId}/${Date.now()}-${fileHash}${ext}`;

  if (supabaseClient) {
    const { error } = await supabaseClient.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(storageKey, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      logger.error({ error, storageKey }, 'Supabase Storage upload failed');
      throw new AppError(500, 'STORAGE_ERROR', 'Failed to upload image to storage service.');
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(storageKey);

    return {
      storageKey,
      publicUrl: publicUrlData.publicUrl,
    };
  }

  // Fallback demo storage URL when Supabase credentials are not provided
  logger.info({ storageKey, size: buffer.length }, 'Using mock storage upload for development');
  return {
    storageKey,
    publicUrl: `https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80&demo=${fileHash}`,
  };
}

export async function deleteListingImage(storageKey: string): Promise<void> {
  if (supabaseClient) {
    const { error } = await supabaseClient.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .remove([storageKey]);

    if (error) {
      logger.error({ error, storageKey }, 'Supabase Storage deletion failed');
    }
  }
}
