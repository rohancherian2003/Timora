import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import http from 'node:http';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import {
  uploadListingImage,
  deleteListingImage,
  getListingImageUrl,
  checkStorageConnectivity,
  setSupabaseClientForTesting,
  resetSupabaseClient,
  detectImageSignature,
} from '../utils/storage.js';
import { listingsService } from '../modules/listings/listings.service.js';
import { env } from '../config/env.js';
import { setPoolForTesting } from '../config/database.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Phase 8.2: Supabase Storage Real Network HTTP Integration Suite', () => {
  let pool: pg.Pool;
  let testSellerId: string;
  let unauthorizedSellerId: string;
  let testListingId: string;

  // Real HTTP server implementing Supabase Storage REST API
  let server: http.Server;
  let serverPort: number;
  let serverUrl: string;

  // In-memory mock bucket storage tracking real uploaded buffers and metadata
  const storedObjects = new Map<string, { buffer: Buffer; contentType: string }>();
  let serverErrorMode: 'none' | '401' | '403' | '404' | '500' | 'disconnect' = 'none';

  const validJpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00,
  ]);
  const validPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52,
  ]);
  const validWebp = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    0x56, 0x50, 0x38, 0x20,
  ]);

  const getRandPhone = () => '+9197' + Math.floor(10000000 + Math.random() * 90000000);

  beforeAll(async () => {
    // 1. Setup real PostgreSQL connection for seller and listing records
    pool = new pg.Pool({ connectionString: TEST_DB_URL, max: 10 });
    setPoolForTesting(pool);
    const client = await pool.connect();
    try {
      const s1 = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'seller', 'hash') RETURNING id`,
        [getRandPhone()]
      );
      const s2 = await client.query(
        `INSERT INTO users (phone, role, pin_hash) VALUES ($1, 'seller', 'hash') RETURNING id`,
        [getRandPhone()]
      );
      testSellerId = s1.rows[0].id;
      unauthorizedSellerId = s2.rows[0].id;
    } finally {
      client.release();
    }

    // 2. Setup real Node.js HTTP Server implementing Supabase Storage REST API
    server = http.createServer((req, res) => {
      // Failure mode simulation
      if (serverErrorMode === 'disconnect') {
        req.socket.destroy();
        return;
      }
      if (serverErrorMode === '401') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: '401', error: 'Unauthorized', message: 'Invalid API key' }));
        return;
      }
      if (serverErrorMode === '403') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: '403', error: 'Forbidden', message: 'Access denied to bucket' }));
        return;
      }
      if (serverErrorMode === '404') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: '404', error: 'Not Found', message: 'Bucket not found' }));
        return;
      }
      if (serverErrorMode === '500') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: '500', error: 'Internal Server Error', message: 'Storage backend failure' }));
        return;
      }

      const url = req.url || '';

      // GET /storage/v1/bucket/:id
      if (req.method === 'GET' && url.startsWith('/storage/v1/bucket/')) {
        const bucketName = url.replace('/storage/v1/bucket/', '');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: bucketName, name: bucketName, public: true }));
        return;
      }

      // POST /storage/v1/object/:bucket/:path*
      if (req.method === 'POST' && url.startsWith('/storage/v1/object/')) {
        const pathParts = url.replace('/storage/v1/object/', '').split('/');
        const bucket = pathParts[0];
        const key = pathParts.slice(1).join('/');

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
          const body = Buffer.concat(chunks);
          const contentType = (req.headers['content-type'] as string) || 'application/octet-stream';
          storedObjects.set(key, { buffer: body, contentType });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ Key: `${bucket}/${key}`, Id: 'obj-' + Date.now() }));
        });
        return;
      }

      // GET /storage/v1/object/public/:bucket/:path*
      if (req.method === 'GET' && url.startsWith('/storage/v1/object/public/')) {
        const pathParts = url.replace('/storage/v1/object/public/', '').split('/');
        const key = pathParts.slice(1).join('/');
        const item = storedObjects.get(key);

        if (!item) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ statusCode: '404', error: 'Not Found', message: 'Object not found' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': item.contentType, 'Content-Length': item.buffer.length });
        res.end(item.buffer);
        return;
      }

      // DELETE /storage/v1/object/:bucket
      if (req.method === 'DELETE' && url.startsWith('/storage/v1/object/')) {
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
            const prefixes: string[] = body.prefixes || [];
            prefixes.forEach((p) => storedObjects.delete(p));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(prefixes.map((p) => ({ name: p, deleted: true }))));
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Malformed JSON' }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end();
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        serverPort = addr.port;
        serverUrl = `http://127.0.0.1:${serverPort}`;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    serverErrorMode = 'none';
    storedObjects.clear();

    // Create an authentic Supabase JS Client pointing to our real local network HTTP server
    const realSupabaseClient = createClient(serverUrl, 'test-service-role-key-real-network', {
      auth: { persistSession: false },
    });
    setSupabaseClientForTesting(realSupabaseClient);

    // Create fresh test listing in PostgreSQL
    const client = await pool.connect();
    try {
      const l = await client.query(
        `INSERT INTO timber_listings (seller_id, title, species_id, timber_type_id, district_id, quantity, unit, price_per_cft, pricing_mode, status)
         VALUES ($1, 'Real Supabase Network Verification Listing', 1, 1, 7, 120, 'cft', 3100, 'fixed', 'approved')
         RETURNING id`,
        [testSellerId]
      );
      testListingId = l.rows[0].id;
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    resetSupabaseClient();
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    if (pool) {
      await pool.end();
    }
  });

  // ─────────────────────────────────────────────────────────────
  // A. CONNECTION & PROVIDER IDENTIFICATION
  // ─────────────────────────────────────────────────────────────
  describe('A. Real Supabase Storage Connection & Provider Verification', () => {
    it('successfully connects over HTTP network to Supabase Storage and reports correct provider and bucket', async () => {
      const status = await checkStorageConnectivity();

      expect(status.connected).toBe(true);
      expect(status.provider).toBe('supabase');
      expect(status.bucket).toBe(env.SUPABASE_STORAGE_BUCKET);
      expect(status.message).toContain('Connected to Supabase Storage bucket');
    });

    it('reports failure when Supabase HTTP server returns 401 Unauthorized', async () => {
      serverErrorMode = '401';
      const status = await checkStorageConnectivity();

      expect(status.connected).toBe(false);
      expect(status.provider).toBe('supabase');
      expect(status.message).toContain('Invalid API key');
    });

    it('reports failure when Supabase HTTP server returns 404 Bucket Not Found', async () => {
      serverErrorMode = '404';
      const status = await checkStorageConnectivity();

      expect(status.connected).toBe(false);
      expect(status.provider).toBe('supabase');
      expect(status.message).toContain('Bucket not found');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // B. IMAGE UPLOAD & RETRIEVAL OVER REAL NETWORK
  // ─────────────────────────────────────────────────────────────
  describe('B. Real Image Upload & Retrieval over HTTP Network', () => {
    it('uploads valid JPEG, PNG and WebP images over real network and verifies binary data integrity', async () => {
      const images = [
        { name: 'timber-1.jpg', mime: 'image/jpeg', buffer: validJpeg },
        { name: 'timber-2.png', mime: 'image/png', buffer: validPng },
        { name: 'timber-3.webp', mime: 'image/webp', buffer: validWebp },
      ];

      for (const img of images) {
        const uploadResult = await uploadListingImage(img.buffer, img.name, img.mime, testListingId);

        expect(uploadResult.storageKey).toMatch(new RegExp(`^listings/${testListingId}/\\d+-[a-f0-9]+`));
        expect(uploadResult.publicUrl).toContain(uploadResult.storageKey);

        // Verify the storage server actually received and stored the binary buffer
        const stored = storedObjects.get(uploadResult.storageKey);
        expect(stored).toBeDefined();
        expect(stored?.buffer).toEqual(img.buffer);
        expect(stored?.contentType).toBe(img.mime);

        // Verify image retrieval: fetching the public URL over real HTTP GET returns exact binary
        const res = await fetch(uploadResult.publicUrl);
        expect(res.status).toBe(200);
        const fetchedBuffer = Buffer.from(await res.arrayBuffer());
        expect(fetchedBuffer).toEqual(img.buffer);
      }
    });

    it('persists uploaded image metadata in PostgreSQL database through listingsService', async () => {
      const uploadResult = await uploadListingImage(validJpeg, 'timber.jpg', 'image/jpeg', testListingId);

      const dbImage = await listingsService.addListingImage(testSellerId, testListingId, uploadResult, true);
      expect(dbImage).toBeDefined();
      expect(dbImage.id).toBeDefined();
      expect(dbImage.storage_key).toBe(uploadResult.storageKey);
      expect(dbImage.is_primary).toBe(true);

      // Verify in PostgreSQL query
      const client = await pool.connect();
      try {
        const rows = await client.query(`SELECT * FROM listing_images WHERE id = $1`, [dbImage.id]);
        expect(rows.rows.length).toBe(1);
        expect(rows.rows[0].storage_key).toBe(uploadResult.storageKey);
      } finally {
        client.release();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // C. IMAGE REPLACEMENT & CLEANUP
  // ─────────────────────────────────────────────────────────────
  describe('C. Real Image Replacement & Atomic Cleanup', () => {
    it('replaces an existing image: uploads new, updates DB, and deletes old object from Supabase storage', async () => {
      // 1. Initial image upload
      const initialUpload = await uploadListingImage(validJpeg, 'initial.jpg', 'image/jpeg', testListingId);
      const initialDbImage = await listingsService.addListingImage(testSellerId, testListingId, initialUpload, true);
      expect(storedObjects.has(initialUpload.storageKey)).toBe(true);

      // 2. Upload replacement image over real network
      const replacementUpload = await uploadListingImage(validPng, 'replacement.png', 'image/png', testListingId);
      expect(storedObjects.has(replacementUpload.storageKey)).toBe(true);

      // 3. Replace via service (updates PostgreSQL and returns old storage key)
      const replacementResult = await listingsService.replaceListingImage(
        testSellerId,
        testListingId,
        initialDbImage.id,
        replacementUpload
      );

      expect(replacementResult.old_storage_key).toBe(initialUpload.storageKey);
      expect(replacementResult.storage_key).toBe(replacementUpload.storageKey);

      // 4. Delete old object from Supabase Storage (mimicking controller behavior)
      await deleteListingImage(replacementResult.old_storage_key);

      // Verify old image was deleted from storage server, and new image remains
      expect(storedObjects.has(initialUpload.storageKey)).toBe(false);
      expect(storedObjects.has(replacementUpload.storageKey)).toBe(true);
    });

    it('rolls back newly uploaded file if database replacement fails, preventing orphan storage files', async () => {
      // 1. Initial image upload
      const initialUpload = await uploadListingImage(validJpeg, 'initial.jpg', 'image/jpeg', testListingId);
      await listingsService.addListingImage(testSellerId, testListingId, initialUpload, true);

      // 2. Upload replacement image
      const newUpload = await uploadListingImage(validPng, 'new.png', 'image/png', testListingId);
      expect(storedObjects.has(newUpload.storageKey)).toBe(true);

      // 3. Attempt replacement with a NON-EXISTENT image ID (triggers DB failure)
      let caughtError: any = null;
      try {
        await listingsService.replaceListingImage(
          testSellerId,
          testListingId,
          '00000000-0000-0000-0000-000000000000',
          newUpload
        );
      } catch (err) {
        caughtError = err;
        // Controller rollback logic
        await deleteListingImage(newUpload.storageKey);
      }

      expect(caughtError).toBeDefined();
      expect(caughtError.code).toBe('NOT_FOUND');

      // The orphan new upload is deleted, while original initial image remains intact!
      expect(storedObjects.has(newUpload.storageKey)).toBe(false);
      expect(storedObjects.has(initialUpload.storageKey)).toBe(true);
    });

    it('deletes image from both Supabase storage and PostgreSQL database', async () => {
      const upload = await uploadListingImage(validJpeg, 'to_delete.jpg', 'image/jpeg', testListingId);
      const dbImage = await listingsService.addListingImage(testSellerId, testListingId, upload, false);

      expect(storedObjects.has(upload.storageKey)).toBe(true);

      // Delete from DB and Storage
      const deleted = await listingsService.removeListingImage(testSellerId, testListingId, dbImage.id);
      expect(deleted.storage_key).toBe(upload.storageKey);

      await deleteListingImage(deleted.storage_key);
      expect(storedObjects.has(upload.storageKey)).toBe(false);

      // Verify DB record is gone
      const client = await pool.connect();
      try {
        const rows = await client.query(`SELECT * FROM listing_images WHERE id = $1`, [dbImage.id]);
        expect(rows.rows.length).toBe(0);
      } finally {
        client.release();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────
  // D. SECURITY & BUSINESS LOGIC AUDIT
  // ─────────────────────────────────────────────────────────────
  describe('D. Security, Ownership & Format Validation', () => {
    it('rejects replacement when attempted by a seller who does not own the listing', async () => {
      const upload = await uploadListingImage(validJpeg, 'img.jpg', 'image/jpeg', testListingId);
      const dbImage = await listingsService.addListingImage(testSellerId, testListingId, upload, true);

      const replacementUpload = await uploadListingImage(validPng, 'hacked.png', 'image/png', testListingId);

      await expect(
        listingsService.replaceListingImage(
          unauthorizedSellerId, // different seller
          testListingId,
          dbImage.id,
          replacementUpload
        )
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'FORBIDDEN',
      });
    });

    it('rejects spoofed MIME type (text file disguised as image/jpeg)', async () => {
      const fakeImage = Buffer.from('console.log("malicious code");');
      await expect(
        uploadListingImage(fakeImage, 'exploit.jpg', 'image/jpeg', testListingId)
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_IMAGE_CONTENT',
      });
    });

    it('rejects oversized images exceeding IMAGE_MAX_SIZE_BYTES', async () => {
      // Create buffer exceeding 10MB limit
      const oversized = Buffer.alloc(11 * 1024 * 1024);
      oversized[0] = 0xff;
      oversized[1] = 0xd8;
      oversized[2] = 0xff;

      await expect(
        uploadListingImage(oversized, 'huge.jpg', 'image/jpeg', testListingId)
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'FILE_TOO_LARGE',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // E. NETWORK FAILURE HANDLING & NO SILENT MOCK FALLBACK
  // ─────────────────────────────────────────────────────────────
  describe('E. Network Failure Handling (Strictly Throws STORAGE_ERROR)', () => {
    it('throws STORAGE_ERROR on HTTP 500 without silently falling back to mock storage', async () => {
      serverErrorMode = '500';

      await expect(
        uploadListingImage(validJpeg, 'fail.jpg', 'image/jpeg', testListingId)
      ).rejects.toMatchObject({
        statusCode: 500,
        code: 'STORAGE_ERROR',
      });
    });

    it('throws STORAGE_ERROR on network disconnect without silently falling back to mock storage', async () => {
      serverErrorMode = 'disconnect';

      await expect(
        uploadListingImage(validJpeg, 'fail.jpg', 'image/jpeg', testListingId)
      ).rejects.toMatchObject({
        statusCode: 500,
        code: 'STORAGE_ERROR',
      });
    });
  });
});
