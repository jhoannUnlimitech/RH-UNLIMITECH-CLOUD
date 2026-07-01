/**
 * Profile Photo API + S3 Bucket Validation
 *
 * Validates:
 * 1. POST /upload/:sessionId/profile-image endpoint (presigned URL generation)
 * 2. S3 bucket configuration (CORS, lifecycle, public access)
 * 3. Object storage structure (uploads/{year}/{month}/{sessionId}/profile-image/{ts}_{name})
 * 4. PUT to presigned URL (actual upload to S3)
 *
 * Pre-condition: Run profile-photo-upload.spec.ts first (uploads an image to S3).
 *
 * Covers: AC-PU-18 to AC-PU-30, AC-PU-31 to AC-PU-36
 *
 * Run:
 *   npx playwright test profile-photo-api-validation --reporter=list
 */

import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { execSync } from 'child_process';

// ─── Constants ──────────────────────────────────────────────────────────────

const BASE_URL = process.env.ENROLLMENT_API_URL
  || 'https://22v2583v57.execute-api.us-east-1.amazonaws.com';

const BUCKET_NAME = process.env.S3_BUCKET_PROFILE_IMAGES
  || 'hcamsws--appenroll-devqa-bucketprofileimagesbucket-xdshfwwk';

const FAKE_SESSION_ID = '00000000-0000-0000-0000-000000000000';

/** Object key pattern: uploads/{year}/{month}/{sessionId}/profile-image/{timestamp}_{filename} */
const OBJECT_KEY_REGEX = /^uploads\/\d{4}\/\d{2}\/[a-f0-9-]+\/profile-image\/\d+_.+$/;

// ─── Setup ──────────────────────────────────────────────────────────────────

let api: APIRequestContext;
let validSessionId: string;

test.beforeAll(async () => {
  api = await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
    ignoreHTTPSErrors: true,
  });

  // Get a valid sessionId: try snapshot first, then lead endpoint, then env var
  const { readFileSync, existsSync } = await import('fs');
  const { resolve } = await import('path');

  // Strategy 1: Read from snapshot
  const snapshotPath = resolve(process.cwd(), '.temp/session-snapshot.json');
  if (existsSync(snapshotPath)) {
    const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
    validSessionId = snapshot.session?.id || '';
  }

  // Strategy 2: Create a session via lead endpoint
  if (!validSessionId) {
    const leadRes = await api.post('/lead', {
      data: {
        firstName: 'APITest',
        lastName: 'PhotoValidation',
        email: `apitest-photo-${Date.now()}@example.com`,
        companyName: 'Photo Test LLC',
        phone: '+13055550199',
        street: '123 Test St',
        city: 'Miami',
        zip: '33101',
        countryISO3: 'USA',
        stateISO: 'FL',
        referralSource: 'Testing',
      },
    });
    if (leadRes.ok()) {
      const body = await leadRes.json();
      validSessionId = body.sessionId || body.session?.id || body.id || '';
    }
  }

  // Strategy 3: Extract sessionId from the most recent S3 object
  if (!validSessionId) {
    try {
      const output = execSync(
        `aws s3 ls s3://${BUCKET_NAME}/ --recursive | tail -1`,
        { encoding: 'utf8', timeout: 10_000 },
      );
      const match = output.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
      if (match) validSessionId = match[0];
    } catch { /* ignore */ }
  }

  // Strategy 4: env var override
  if (!validSessionId && process.env.TEST_SESSION_ID) {
    validSessionId = process.env.TEST_SESSION_ID;
  }
});

test.afterAll(async () => {
  await api.dispose();
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 1: S3 BUCKET CONFIGURATION (AC-PU-31 to AC-PU-36)
// ═════════════════════════════════════════════════════════════════════════════

test('AC-PU-31: bucket exists', async () => {
  const output = execSync(`aws s3api head-bucket --bucket ${BUCKET_NAME} 2>&1 || echo "NOT_FOUND"`, {
    encoding: 'utf8', timeout: 10_000,
  });
  expect(output).not.toContain('NOT_FOUND');
  expect(output).not.toContain('404');
});

test('AC-PU-32: CORS allows PUT and GET from any origin (*)', async () => {
  const output = execSync(`aws s3api get-bucket-cors --bucket ${BUCKET_NAME}`, {
    encoding: 'utf8', timeout: 10_000,
  });
  const cors = JSON.parse(output);
  const rule = cors.CORSRules[0];

  expect(rule.AllowedOrigins).toContain('*');
  expect(rule.AllowedMethods).toContain('PUT');
  expect(rule.AllowedMethods).toContain('GET');
});

test('AC-PU-33: CORS allows Content-Type and Content-Length headers', async () => {
  const output = execSync(`aws s3api get-bucket-cors --bucket ${BUCKET_NAME}`, {
    encoding: 'utf8', timeout: 10_000,
  });
  const cors = JSON.parse(output);
  const rule = cors.CORSRules[0];

  expect(rule.AllowedHeaders).toContain('Content-Type');
  expect(rule.AllowedHeaders).toContain('Content-Length');
});

test('AC-PU-34: lifecycle rule deletes uploads/ after 3 days', async () => {
  const output = execSync(`aws s3api get-bucket-lifecycle-configuration --bucket ${BUCKET_NAME}`, {
    encoding: 'utf8', timeout: 10_000,
  });
  const lifecycle = JSON.parse(output);
  const rule = lifecycle.Rules.find((r: any) => r.ID === 'auto-delete-uploads');

  expect(rule).toBeTruthy();
  expect(rule.Status).toBe('Enabled');
  expect(rule.Filter.Prefix).toBe('uploads/');
  expect(rule.Expiration.Days).toBe(3);
});

test('AC-PU-35: bucket blocks all public access', async () => {
  const output = execSync(`aws s3api get-public-access-block --bucket ${BUCKET_NAME}`, {
    encoding: 'utf8', timeout: 10_000,
  });
  const config = JSON.parse(output).PublicAccessBlockConfiguration;

  expect(config.BlockPublicAcls).toBe(true);
  expect(config.IgnorePublicAcls).toBe(true);
  expect(config.BlockPublicPolicy).toBe(true);
  expect(config.RestrictPublicBuckets).toBe(true);
});

test('AC-PU-36: objects stored with correct path structure (uploads/{year}/{month}/{sessionId}/...)', async () => {
  const output = execSync(`aws s3 ls s3://${BUCKET_NAME}/ --recursive | tail -5`, {
    encoding: 'utf8', timeout: 10_000,
  });

  // At least one object should exist
  expect(output.trim().length).toBeGreaterThan(0);

  // Each line should contain the expected path structure
  const lines = output.trim().split('\n');
  for (const line of lines) {
    const keyMatch = line.match(/uploads\/\d{4}\/\d{2}\/[a-f0-9-]+\/profile-image\/\d+_.+\.(jpg|png)$/);
    expect(keyMatch, `Invalid key format: ${line}`).toBeTruthy();
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 2: API ENDPOINT (AC-PU-18 to AC-PU-30)
// ═════════════════════════════════════════════════════════════════════════════

test('AC-PU-18: valid body (image/jpeg) → 200 + correct response shape', async () => {
  test.skip(!validSessionId, 'No valid session — run profile-photo-upload first');

  const res = await api.post(`/upload/${validSessionId}/profile-image`, {
    data: { filename: 'test-photo.jpg', contentType: 'image/jpeg' },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();

  expect(body.uploadUrl).toBeTruthy();
  expect(body.objectKey).toBeTruthy();
  expect(body.expiresIn).toBe(300);                    // AC-PU-27
  expect(body.maxSizeBytes).toBe(10 * 1024 * 1024);   // AC-PU-28
  expect(body.objectKey).toMatch(OBJECT_KEY_REGEX);    // AC-PU-26
  expect(body.objectKey).toContain(validSessionId);    // AC-PU-44
});

test('AC-PU-19: valid body (image/png) → 200', async () => {
  test.skip(!validSessionId, 'No valid session');

  const res = await api.post(`/upload/${validSessionId}/profile-image`, {
    data: { filename: 'test-photo.png', contentType: 'image/png' },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.uploadUrl).toBeTruthy();
  expect(body.objectKey).toBeTruthy();
});

test('AC-PU-20: contentType image/webp → 400 INVALID_CONTENT_TYPE', async () => {
  test.skip(!validSessionId, 'No valid session');

  const res = await api.post(`/upload/${validSessionId}/profile-image`, {
    data: { filename: 'test.webp', contentType: 'image/webp' },
  });

  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.code).toBe('INVALID_CONTENT_TYPE');
});

test('AC-PU-21: contentType application/pdf → 400 INVALID_CONTENT_TYPE', async () => {
  test.skip(!validSessionId, 'No valid session');

  const res = await api.post(`/upload/${validSessionId}/profile-image`, {
    data: { filename: 'doc.pdf', contentType: 'application/pdf' },
  });

  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.code).toBe('INVALID_CONTENT_TYPE');
});

test('AC-PU-22: missing filename → 400 INVALID_BODY', async () => {
  test.skip(!validSessionId, 'No valid session');

  const res = await api.post(`/upload/${validSessionId}/profile-image`, {
    data: { contentType: 'image/jpeg' },
  });

  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.code).toBe('INVALID_BODY');
});

test('AC-PU-23: missing contentType → 400 INVALID_BODY', async () => {
  test.skip(!validSessionId, 'No valid session');

  const res = await api.post(`/upload/${validSessionId}/profile-image`, {
    data: { filename: 'test.jpg' },
  });

  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.code).toBe('INVALID_BODY');
});

test('AC-PU-24: empty body → 400 INVALID_BODY', async () => {
  test.skip(!validSessionId, 'No valid session');

  const res = await api.post(`/upload/${validSessionId}/profile-image`, {
    data: {},
  });

  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.code).toBe('INVALID_BODY');
});

test('AC-PU-25: non-existent sessionId → 403 or 404', async () => {
  const res = await api.post(`/upload/${FAKE_SESSION_ID}/profile-image`, {
    data: { filename: 'test.jpg', contentType: 'image/jpeg' },
  });

  // API Gateway returns 403 for unknown routes, or Lambda returns 404
  expect([403, 404]).toContain(res.status());
});

test('AC-PU-29: PUT to uploadUrl with valid JPEG → 200/204 (S3 accepts)', async () => {
  test.skip(!validSessionId, 'No valid session');

  // 1. Get presigned URL
  const presignRes = await api.post(`/upload/${validSessionId}/profile-image`, {
    data: { filename: 'put-test.jpg', contentType: 'image/jpeg' },
  });
  expect(presignRes.status()).toBe(200);
  const { uploadUrl, objectKey } = await presignRes.json();

  // 2. Upload a minimal valid JPEG (1x1 pixel — 285 bytes)
  const minimalJpeg = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////' +
    '////////////////////////////////////////////////////////////' +
    '2wBDAf//////////////////////////////////////////////////////' +
    '////////////////////////////////////////////////////////////' +
    'wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQ' +
    'AQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEB' +
    'AAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AKwA//9k=',
    'base64',
  );

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: minimalJpeg,
    headers: { 'Content-Type': 'image/jpeg' },
  });

  expect([200, 204]).toContain(uploadRes.status);

  // 3. Verify object exists in S3
  const headOutput = execSync(
    `aws s3api head-object --bucket ${BUCKET_NAME} --key "${objectKey}" 2>&1`,
    { encoding: 'utf8', timeout: 10_000 },
  );
  expect(headOutput).toContain('image/jpeg');
});

test('AC-PU-30: filename with special chars → sanitized in objectKey', async () => {
  test.skip(!validSessionId, 'No valid session');

  const res = await api.post(`/upload/${validSessionId}/profile-image`, {
    data: { filename: 'my photo (1) [final].jpg', contentType: 'image/jpeg' },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();

  // Special chars replaced with underscores
  expect(body.objectKey).not.toContain('(');
  expect(body.objectKey).not.toContain(')');
  expect(body.objectKey).not.toContain('[');
  expect(body.objectKey).not.toContain(']');
  expect(body.objectKey).not.toContain(' ');
  expect(body.objectKey).toContain('my_photo__1___final_.jpg');
});
