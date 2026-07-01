# Playbook: Profile Photo Upload (Form 2)

Source: Jam 8d0baa46-c00a-4e0e-ab41-a4280c6ea3b2

## Pre-conditions

- Form 1 (General Info) completed and submitted → user is on `/details`
- Enrollment API running with S3 bucket deployed (`Bucket@ProfileImages`)
- `@aws-sdk/s3-request-presigner` installed in API module

## Sequence — Happy Path

### Step 1: Verify initial state
- **Selector:** `[data-test-key="profile-photo-input"]`
- **Action:** verify visible
- **Verify:** `accept="image/jpeg,image/png"`, no `multiple` attribute, no preview, no error
- **Playwright:** `expect(locator).toBeAttached()` + `toHaveAttribute('accept', ...)`

### Step 2: Upload valid JPEG (780KB)
- **Selector:** `[data-test-key="profile-photo-input"]`
- **Action:** `setInputFiles('/path/to/profile_under_10mb_square_b.jpg')`
- **Verify:** `[data-test-key="profile-photo-preview"]` visible with `<img>` + filename + size
- **Playwright:** `page.locator(sel.photoInput).setInputFiles(path)` → wait for preview
- **Note:** Upload triggers: validate → presign URL → PUT to S3 → show preview

### Step 3: Verify preview content
- **Selector:** `[data-test-key="profile-photo-preview"] img`
- **Action:** verify `src` starts with `blob:`
- **Verify:** Image source is a local blob URL (not S3 URL — security)
- **Playwright:** `getAttribute('src')` → `startsWith('blob:')`

### Step 4: Remove photo
- **Selector:** `[data-test-key="profile-photo-remove"]`
- **Action:** click
- **Verify:** Preview disappears, input section returns to "Choose File" state
- **Playwright:** Click → `expect(preview).not.toBeVisible()`

### Step 5: Re-upload different image (2.4MB)
- **Selector:** `[data-test-key="profile-photo-input"]`
- **Action:** `setInputFiles('/path/to/profile_under_10mb_square_a.jpg')`
- **Verify:** New preview visible with different filename
- **Playwright:** Same as Step 2 with different file

### Step 6: Submit form with photo
- **Selector:** `[data-test-key="submit-button"]`
- **Action:** click (after filling all required fields)
- **Verify:** URL changes to `/plan`
- **Playwright:** `page.waitForURL(/\/plan/)`

## Sequence — Validation (Error Handling)

### Step V1: Upload file > 10MB
- **File:** `profile_over_12mb_square.jpg` (13.9MB)
- **Selector:** `[data-test-key="profile-photo-input"]`
- **Action:** `setInputFiles(overLimitPath)`
- **Verify:** `[data-test-key="profile-photo-error"]` visible, NO preview, NO network request to backend
- **Note:** Validation is client-side only — `file.size > MAX_SIZE_BYTES`

### Step V2: Upload invalid type (WebP)
- **File:** `not-validate-imagen-profile.webp`
- **Selector:** `[data-test-key="profile-photo-input"]`
- **Action:** `setInputFiles(webpPath)`
- **Verify:** `[data-test-key="profile-photo-error"]` visible with type error message
- **Note:** Validation checks `ALLOWED_TYPES.includes(file.type)` — WebP not in list

### Step V3: Upload exactly 10MB (boundary)
- **File:** `profile_10mb_square.jpg` (10,000,000 bytes)
- **Selector:** `[data-test-key="profile-photo-input"]`
- **Action:** `setInputFiles(boundaryPath)`
- **Verify:** Preview visible, NO error — 10MB is the limit (≤), not over
- **Note:** `file.size > MAX_SIZE_BYTES` → 10MB passes (not strictly greater)

### Step V4: Recovery from error
- **Pre-condition:** Error visible from previous invalid upload
- **Selector:** `[data-test-key="profile-photo-input"]`
- **Action:** `setInputFiles(validPath)`
- **Verify:** Error disappears, preview visible
- **Note:** Component clears `localError` on successful validation

### Step V5: Submit WITHOUT photo (optional field)
- **Pre-condition:** No photo uploaded, all other fields filled
- **Action:** Click submit button
- **Verify:** Form submits successfully → `/plan`
- **Note:** `profilePhoto` is optional in the registration schema

## Confirmed Patterns

### File upload via Playwright
```typescript
// Playwright setInputFiles is stable for any file size
const input = page.locator('[data-test-key="profile-photo-input"]');
await input.setInputFiles('/absolute/path/to/image.jpg');
```

### Chrome MCP file upload (NOT recommended for this component)
Chrome MCP `upload_file` crashes the tab for files > 500KB due to CDP renderer memory issues.
Always use Playwright for file upload tests.

### Upload flow (what happens internally)
1. `handleFileChange` triggered by input change event
2. Client validates: `ALLOWED_TYPES.includes(file.type)` + `file.size <= MAX_SIZE_BYTES`
3. If invalid → `setLocalError(message)`, reset input, stop
4. If valid → `setIsUploading(true)`, call `getUploadUrl()`
5. Backend validates contentType, returns `{ uploadUrl, objectKey }`
6. Frontend PUTs file binary to S3 via presigned URL
7. On success → `setPreviewUrl(URL.createObjectURL(file))`, call `onChange(data)`
8. On failure → `setLocalError('Upload failed')`, `setIsUploading(false)`

### Error recovery
The component resets `localError` when a new valid file is selected.
The input value is reset on error (`inputRef.current.value = ''`) so the same file can be re-selected.

## Test Images

| File | Size | Type | Purpose |
|------|------|------|---------|
| `profile_under_10mb_square_b.jpg` | 780 KB | JPEG | Happy path (fast) |
| `profile_under_10mb_square_a.jpg` | 2.4 MB | JPEG | Re-upload test |
| `profile_10mb_square.jpg` | 10 MB | JPEG | Boundary (exactly at limit) |
| `profile_over_12mb_square.jpg` | 13.9 MB | JPEG | Over limit error |
| `not-validate-imagen-profile.webp` | 423 KB | WebP | Invalid type error |
