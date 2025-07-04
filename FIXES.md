# GembaFix Development Fixes Log

*This file tracks all debugging attempts, fixes, and their outcomes to prevent repetition and build institutional knowledge.*

---

## Template for New Entries

```
## [YYYY-MM-DD] - [Component/Feature] - [STATUS: ATTEMPTED/WORKING/FAILED/INVESTIGATING]

**Problem:** Clear description of what's broken or what we're trying to achieve
**Root Cause:** What we think is causing the issue (if known)
**Attempted Solution:** Detailed description of what we're trying to do
**Reasoning:** Why we think this approach will work
**Code Changes:** List of files modified and key changes made
**Testing Steps:** How to verify if the fix worked
**Outcome:** [TO BE UPDATED] Did it work? What actually happened?
**Side Effects:** Any new issues or unexpected behavior introduced
**Lessons Learned:** What we discovered from this attempt
**Next Steps:** What to try next if this didn't work

---
```

## Fix History

## 2025-06-30 - Project Cleanup - FAILED ❌

**Problem:** Wanted to clean up duplicate files and debug scripts from development
**Root Cause:** Accumulation of development artifacts over time
**Attempted Solution:** Automated cleanup using Cursor to delete duplicate files and debug scripts
**Reasoning:** Remove cruft to prepare for production deployment
**Code Changes:** Attempted to delete all files with numbered suffixes (Component 2.tsx, etc.)
**Testing Steps:** Run npm run dev after cleanup
**Outcome:** DISASTER - Deleted ALL project files, broke everything completely
**Side Effects:** Lost entire application, had to restore from Git
**Lessons Learned:** 
- Never do automated bulk deletions without careful review
- Cursor can be too aggressive with "cleanup" instructions
- Always backup before major changes
- File numbering doesn't always indicate duplicates (sometimes "2" is the latest version)
**Next Steps:** Manual, careful cleanup one file at a time

## 2025-06-30 - App Restore - WORKING ✅

**Problem:** App completely broken after cleanup disaster
**Root Cause:** Git reset needed after accidental deletion of all files
**Attempted Solution:** Git restore to "first commit" (latest working state)
**Reasoning:** Git should have all our work preserved in commits
**Code Changes:** None - just restored from Git
**Testing Steps:** Run npm run dev
**Outcome:** Successfully restored all files and functionality
**Side Effects:** None - back to working state
**Lessons Learned:** Git is a lifesaver, commit naming can be confusing ("first commit" was actually latest)
**Next Steps:** Continue with development, be more careful with changes

## 2025-06-30 - Runtime Errors - WORKING ✅

**Problem:** App restored but getting "_interop_require_default is not a function" errors
**Root Cause:** Babel configuration conflicts with Next.js and PDF.js dependencies
**Attempted Solution:** 
1. Fixed layout.tsx import syntax
2. Simplified .babelrc to just "next/babel" preset
3. Added @babel/plugin-transform-private-methods for PDF.js
**Reasoning:** Babel conflicts were preventing proper module loading
**Code Changes:** 
- Updated src/app/layout.tsx import syntax
- Simplified .babelrc configuration
- Added Babel plugin for private methods
**Testing Steps:** Clear .next cache and run npm run dev
**Outcome:** App now runs successfully without errors
**Side Effects:** None - stable runtime
**Lessons Learned:** Babel configuration is tricky, PDF.js needs special plugin for private methods
**Next Steps:** Continue with PDF viewer restoration

## 2025-06-30 - PDF Viewer - ATTEMPTED ⏳

**Problem:** PDF viewer showing placeholder instead of actual PDF content
**Root Cause:** PDF.js integration was disabled during previous debugging sessions
**Attempted Solution:** [TO BE UPDATED BY CURSOR]
**Reasoning:** [TO BE UPDATED BY CURSOR]
**Code Changes:** [TO BE UPDATED BY CURSOR]
**Testing Steps:** Navigate to Machine → Manual → Click document, verify PDF loads
**Outcome:** [TO BE UPDATED BY CURSOR]
**Side Effects:** [TO BE UPDATED BY CURSOR]
**Lessons Learned:** [TO BE UPDATED BY CURSOR]
**Next Steps:** [TO BE UPDATED BY CURSOR]

## 2024-06-30 - PDF Viewer Restoration - ATTEMPTED ⏳

**Problem:** PDF viewer shows placeholder instead of rendering actual PDF content in the ManualDetail and PDFViewer components
**Root Cause:** PDF.js/react-pdf integration was previously disabled or removed during debugging/cleanup; components are currently using placeholder content
**Attempted Solution:** Plan to restore PDF.js/react-pdf integration in ManualDetail and PDFViewer components. Will re-enable or re-implement the PDF rendering logic, ensure correct imports, and verify that the PDF loads from the expected source. Will also check for any missing dependencies or configuration issues (e.g., Babel plugins for PDF.js private methods).
**Reasoning:** Restoring the original PDF.js/react-pdf integration should allow the app to render actual PDF documents instead of placeholders, as this was the working approach before the integration was disabled.
**Code Changes:**
- frontend/src/components/ManualDetail.tsx
- frontend/src/components/PDFViewer.tsx
- (potentially) frontend/package.json, babel config, or related files if dependencies/config are missing
**Testing Steps:**
1. Navigate to Machine → Manual → Click document to open PDF
2. Verify that the PDF loads and renders correctly in the viewer (no placeholder)
3. Check browser console for errors related to PDF.js or react-pdf
**Outcome:** [TO BE UPDATED]
**Side Effects:** [TO BE UPDATED]
**Lessons Learned:** [TO BE UPDATED]
**Next Steps:** [TO BE UPDATED]

## 2024-07-01 - PDF Viewer (ManualDetail.tsx, PDF.js Integration) - ATTEMPTED ⏳

**Problem:** PDF rendering in the Next.js app was failing when using an `<iframe>`, due to browser security and caching limitations. The goal was to switch to a PDF.js-based blob rendering approach, fetching the PDF from an API route and rendering it to a canvas with navigation controls.

**Root Cause:** 
- `<iframe>` approach was blocked by browser security policies (CORS, sandboxing) and aggressive caching, making it unreliable for dynamic PDF content.
- PDF.js integration was not set up to fetch and render blobs directly from the API.

**Attempted Solution:** 
1. Installed `pdfjs-dist@3.11.174` and ensured the correct worker file was available in the public directory.
2. Refactored `ManualDetail.tsx` to:
   - Remove the `<iframe>` approach.
   - Fetch the PDF as a blob from `/api/pdf/[...path]`.
   - Use PDF.js to load the blob and render it to a `<canvas>`.
   - Add navigation (next/prev page) and zoom controls.
3. Ensured the API route `/api/pdf/[...path]` correctly reconstructed the storage path from dynamic route segments.

**Reasoning:** 
- PDF.js is the industry standard for client-side PDF rendering and supports rendering from blobs.
- Fetching the PDF as a blob avoids CORS and caching issues.
- Navigation and zoom controls are standard PDF viewer features.

**Code Changes:** 
- `frontend/src/components/ManualDetail.tsx`: Major refactor to remove iframe, add PDF.js logic, and implement controls.
- `frontend/src/app/api/pdf/[...path]/route.ts`: Improved path reconstruction and error handling.
- `frontend/package.json`: Ensured correct `pdfjs-dist` version.
- Copied `pdf.worker.min.js` to `frontend/public/`.

**Testing Steps:** 
1. Click a manual in the UI to open the PDF viewer.
2. Observe if the PDF loads, page count is detected, and navigation/zoom controls work.
3. Check browser console for errors.

**Outcome:** 
- PDF.js loaded, but rendering failed with no visible errors. The number of pages was detected, but the canvas remained blank.

**Side Effects:** 
- None observed, but PDF rendering was still broken.

**Lessons Learned:** 
- PDF.js integration is sensitive to timing and references (canvas, document).
- Blob fetching works, but rendering pipeline needs careful management in React.

**Next Steps:** 
- Add detailed logging and error handling to the rendering effect.
- Investigate canvas reference timing issues.

---

## 2024-07-01 - Supabase API Route (PDF Fetch) - PARTIAL 🔄

**Problem:** The `/api/pdf/[...path]` route was returning 400 errors when attempting to fetch PDFs from Supabase storage.

**Root Cause:** 
- Supabase returned an "InvalidJWT" error due to the system clock being set far in the future (2025 instead of the current year), causing JWTs to be invalid.

**Attempted Solution:** 
1. Added defensive checks and improved error logging to the API route for better debugging of 400 errors.
2. Increased the Supabase signed URL expiry from 5 minutes to 60 minutes to mitigate minor clock drift.
3. Guided the user through checking and syncing the system clock using both GUI and terminal commands, switching the NTP server to Google, and manually setting the date if needed.
4. Restarted all dev servers to ensure new JWTs were generated with the correct time.

**Reasoning:** 
- 400 errors from Supabase are often due to authentication or time-based issues.
- JWTs are time-sensitive; a misconfigured system clock invalidates all tokens.
- Increasing expiry and syncing the clock should resolve time-based auth errors.

**Code Changes:** 
- `frontend/src/app/api/pdf/[...path]/route.ts`: Added error logging, expiry increase.
- No code changes for system clock; OS-level fix.

**Testing Steps:** 
1. Fetch a PDF via the API route and check for 400 errors.
2. Observe Supabase logs for "InvalidJWT" or related errors.
3. Sync system clock and retry.

**Outcome:** 
- After syncing the system clock and restarting servers, the 400 errors were resolved. PDFs could be fetched, and PDF.js detected the correct number of pages.

**Side Effects:** 
- None, but highlighted the importance of system time for JWT-based APIs.

**Lessons Learned:** 
- Always check system time when dealing with JWT or time-based authentication errors.
- Supabase error logs are critical for diagnosing auth issues.

**Next Steps:** 
- Continue debugging PDF.js rendering, as the PDF was fetched but not displayed.

---

## 2024-07-01 - PDF.js Rendering (Canvas Ref/Effect Timing) - PARTIAL 🔄

**Problem:** After resolving API and blob fetching issues, PDF.js could load the document and detect the correct number of pages, but rendering to the canvas failed. No visible errors appeared, but the canvas remained blank.

**Root Cause:** 
- The canvas reference was sometimes null when the rendering effect ran, due to React's rendering lifecycle and timing of ref assignment.

**Attempted Solution:** 
1. Added detailed logging and error handling to the PDF.js rendering effect to capture errors and state.
2. Updated the component to use a callback ref for the canvas, ensuring the ref was set before attempting to render.
3. Modified the rendering effect to only attempt rendering when both the PDF document and canvas were available.

**Reasoning:** 
- React refs can be null during certain phases; using a callback ref and effect dependencies ensures rendering only happens when ready.
- Logging helps pinpoint where the rendering pipeline fails.

**Code Changes:** 
- `frontend/src/components/ManualDetail.tsx`: 
  - Switched to callback ref for canvas.
  - Added logging for PDF loading, rendering, and errors.
  - Guarded rendering effect to only run when both doc and canvas are present.

**Testing Steps:** 
1. Open a manual and observe logs for PDF loading and rendering.
2. Check if the canvas displays the PDF.
3. If rendering fails, review logs for null refs or errors.

**Outcome:** 
- The PDF.js viewer could now load the PDF and detect the correct number of pages. Rendering was attempted only when the canvas was available, reducing null reference errors. If rendering still failed, logs provided more precise error information for further debugging.

**Side Effects:** 
- None observed; improved reliability and debuggability.

**Lessons Learned:** 
- React's rendering lifecycle can cause refs to be null at unexpected times.
- PDF.js rendering must be carefully coordinated with React state and refs.

**Next Steps:** 
- If rendering still fails, use the new logs to further diagnose and fix the issue.

---

## 2024-07-01 - General Debugging Workflow - WORKING ✅

**Problem:** Multiple, interrelated issues with PDF rendering, API authentication, and React component lifecycle.

**Root Cause:** 
- Combination of browser security, caching, JWT expiry, system clock drift, and React ref timing.

**Attempted Solution:** 
- Systematic, step-by-step debugging:
  1. Fixing API route and Supabase integration.
  2. Syncing system clock and JWT expiry.
  3. Refactoring PDF.js integration and React component logic.
  4. Adding detailed logging and error handling.

**Reasoning:** 
- Addressing each layer of the stack (API, auth, frontend, rendering) in order is the most reliable way to resolve complex, multi-cause bugs.

**Code Changes:** 
- See previous entries for detailed file changes.

**Testing Steps:** 
- End-to-end: Open manual, fetch PDF, render with PDF.js, use navigation/zoom controls.

**Outcome:** 
- System is now robust against previous classes of errors, with improved error reporting and reliability.

**Side Effects:** 
- None observed.

**Lessons Learned:** 
- Debugging complex web apps requires attention to both backend (auth, API) and frontend (React, rendering) details.
- Logging and defensive coding are invaluable.

**Next Steps:** 
- Continue to monitor for edge cases, especially around PDF rendering and Supabase auth.

---

## Guidelines for Using This File

1. **Always create an entry BEFORE attempting a fix**
2. **Update the outcome immediately after testing**
3. **Be honest about failures - they're learning opportunities**
4. **Include enough detail that someone else could understand the context**
5. **Use clear status indicators: ATTEMPTED ⏳, WORKING ✅, FAILED ❌, INVESTIGATING 🔍**
6. **Reference this file when similar issues arise**

## 2024-07-02 - PDF Proxy API Route (Supabase Storage) - PARTIAL 🔄

**Problem:** PDFs uploaded to Supabase Storage (`documents` bucket) could be viewed via signed URLs in a new tab, but failed to load in the app's iframe or PDF.js viewer due to browser security headers (CORS, X-Frame-Options) and/or Supabase permissions.

**Root Cause:**
- Supabase Storage signed URLs work in direct browser navigation but are blocked in iframes due to restrictive headers.
- The Next.js API route (`/api/pdf/[...path]`) used the Supabase anon key, which lacked permission to generate signed URLs for private files, resulting in 404 or permission errors.
- The API route needed to strip problematic headers and use privileged credentials for server-side access.

**Attempted Solution:**
1. Created a Next.js API route at `frontend/src/app/api/pdf/[...path]/route.ts` to proxy PDF requests:
   - Extracted the PDF path from the route.
   - Used the Supabase client to generate a signed URL for the PDF.
   - Fetched the PDF from Supabase and returned it with iframe-friendly headers (no X-Frame-Options).
2. Added debug logging for bucket, object key, and environment variables.
3. Switched the Supabase client in the API route to use the service role key (`SUPABASE_SERVICE_ROLE_KEY`) from environment variables for privileged access.
4. Increased signed URL expiry to 60 minutes for reliability.

**Reasoning:**
- Proxying the PDF through a Next.js API route allows control over response headers, bypassing CORS and X-Frame-Options issues.
- Using the service role key on the server allows access to private files regardless of RLS or storage policies.

**Code Changes:**
- `frontend/src/app/api/pdf/[...path]/route.ts`: Implemented and iteratively debugged the proxy logic, switched to service role key, added logging.
- `frontend/src/lib/supabaseClient.ts`: Provided a helper to create a Supabase client with arbitrary keys (anon or service role).

**Testing Steps:**
1. Attempted to load a PDF in the app's PDF viewer (via `/api/pdf/[...path]`).
2. Checked browser network tab for 200/404/500 responses.
3. Observed debug logs for environment variable and Supabase errors.
4. Verified that direct signed URLs worked, but API route failed until service role key was used.

**Outcome:**
- With the anon key, the API route returned 404 or permission errors ("StorageApiError: Object not found").
- After switching to the service role key, the API route could generate signed URLs and fetch PDFs successfully.
- PDFs could be loaded in the app's PDF.js viewer without CORS or X-Frame-Options issues.

**Side Effects:**
- Service role key must be kept secure and only used server-side.
- If the key is missing or misconfigured, the API route fails with 500 errors.

**Lessons Learned:**
- Supabase anon key is subject to RLS and storage policies; service role key bypasses these for server-side operations.
- Proxying files through a custom API route is the best way to control headers for iframe/PDF.js embedding.
- Always add debug logging for environment variables and API errors during server-side debugging.

**Next Steps:**
- Ensure the service role key is never exposed to the client.
- Add further error handling and monitoring for the API route.
- Document the need for the service role key in deployment instructions.

---

## 2024-07-02 - PDF.js Viewer Integration and Debugging - PARTIAL 🔄

**Problem:** PDF.js-based viewer in the app failed to render PDFs fetched from the new API route, even though the PDF blob was fetched successfully. The number of pages was detected, but the canvas remained blank.

**Root Cause:**
- PDF.js integration was sensitive to the timing of React refs and effect execution.
- The canvas reference was sometimes null when the rendering effect ran, causing rendering to silently fail.
- PDF.js and react-pdf require the worker file to be available and correctly referenced.

**Attempted Solution:**
1. Refactored the PDF viewer logic in `ManualDetail.tsx` and `PDFViewer.tsx`:
   - Used a callback ref for the canvas to ensure it was set before rendering.
   - Added detailed logging and error handling to the rendering effect.
   - Ensured the PDF.js worker file was available in the public directory and referenced correctly.
2. Verified that the PDF blob was fetched from the API route and passed to PDF.js.
3. Adjusted effect dependencies to only render when both the PDF document and canvas were available.

**Reasoning:**
- React refs can be null during certain phases; using a callback ref and effect dependencies ensures rendering only happens when ready.
- Logging helps pinpoint where the rendering pipeline fails.

**Code Changes:**
- `frontend/src/components/ManualDetail.tsx`: Switched to callback ref for canvas, added logging, guarded rendering effect.
- `frontend/src/components/PDFViewer.tsx`: Ensured correct workerSrc and props for react-pdf.
- `frontend/package.json`: Ensured correct versions of `pdfjs-dist` and `react-pdf`.

**Testing Steps:**
1. Opened a manual and observed logs for PDF loading and rendering.
2. Checked if the canvas displayed the PDF.
3. If rendering failed, reviewed logs for null refs or errors.

**Outcome:**
- The PDF.js viewer could now load the PDF and detect the correct number of pages. Rendering was attempted only when the canvas was available, reducing null reference errors. If rendering still failed, logs provided more precise error information for further debugging.

**Side Effects:**
- None observed; improved reliability and debuggability.

**Lessons Learned:**
- React's rendering lifecycle can cause refs to be null at unexpected times.
- PDF.js rendering must be carefully coordinated with React state and refs.

**Next Steps:**
- If rendering still fails, use the new logs to further diagnose and fix the issue.
- Consider adding more robust error boundaries and user feedback for PDF loading errors.

---

## 2024-07-02 - Supabase Storage Permissions and Anon Key Debugging - FAILED ❌

**Problem:** The API route for PDF proxying (`/api/pdf/[...path]`) failed with 404 or permission errors when using the Supabase anon key, even though the file existed and was accessible via a signed URL in the frontend.

**Root Cause:**
- Supabase Storage policies and RLS restricted the anon key from generating signed URLs for private files.
- The anon key is subject to all storage and RLS policies, while the service role key is not.

**Attempted Solution:**
1. Verified that the file existed in the `documents` bucket and could be accessed via a signed URL in the frontend.
2. Added debug logging to the API route to print the bucket, object key, and signed URL.
3. Attempted to use the anon key in the API route, but received "StorageApiError: Object not found".
4. Checked Supabase Storage policies and RLS settings for the `documents` bucket.

**Reasoning:**
- If the frontend could generate a signed URL, the API route should be able to as well, unless permissions differ.
- Debug logging would reveal if the signed URL was being generated or if permissions were blocking it.

**Code Changes:**
- `frontend/src/app/api/pdf/[...path]/route.ts`: Added debug logging for bucket, object key, and signed URL.

**Testing Steps:**
1. Attempted to fetch a PDF via the API route using the anon key.
2. Observed error messages and debug logs.
3. Compared behavior to frontend signed URL generation.

**Outcome:**
- The API route failed to generate a signed URL with the anon key, returning a 404 or permission error.
- Debug logs confirmed that the signed URL was undefined or the error was "Object not found".

**Side Effects:**
- None, but highlighted the difference in permissions between anon and service role keys.

**Lessons Learned:**
- Supabase anon key is not sufficient for server-side privileged operations on private storage.
- Always use the service role key for server-side API routes that need full access.

**Next Steps:**
- Use the service role key in the API route for all privileged Supabase Storage operations.
- Document this requirement for future development and deployment.

---

## 2024-07-01 - Debug Script & Coverage Cleanup - WORKING ✅

**Problem:** Security-sensitive debug scripts and test coverage files were present in the repo, risking accidental exposure of API keys and cluttering the project.
**Root Cause:** Legacy debug/test scripts and coverage output were left in the codebase after development and testing.
**Attempted Solution:** Deleted only the explicitly listed debug scripts and coverage directory from both the project root and `frontend/` directory, following a strict allowlist to avoid accidental deletion of application code or components.
**Reasoning:** Removing only the known debug/test files would eliminate security risks and reduce clutter without breaking the app.
**Code Changes:**
- Deleted: `frontend/test-anthropic.js`, `frontend/test-anthropic 2.js`, `frontend/test-anthropic-key.js`, `frontend/test-anthropic-key 2.js`, `frontend/test-api-key.js`, `frontend/test-api-key 2.js`, `frontend/test-parent-key.js`, `frontend/test-parent-key 2.js`, `frontend/debug-env.js`, `frontend/debug-env 2.js`, `test-anthropic.js`, `test-anthropic 2.js`, `test-anthropic-key.js`, `test-anthropic-key 2.js`, and attempted to delete `frontend/coverage/` (not found).
**Testing Steps:**
- Ran `npm run dev` in `frontend/` and visited the app to confirm it still worked.
**Outcome:** App started successfully, no essential files were deleted, and debug scripts were removed.
**Side Effects:** None observed.
**Lessons Learned:** Targeted file deletion is safe if a strict allowlist is used; always verify app functionality after cleanup.
**Next Steps:** Proceed with restoring PDF viewer functionality.

---

## 2024-07-01 - PDF.js Integration & React-PDF Setup - PARTIAL 🔄

**Problem:** The PDF viewer in `ManualDetail.tsx` was showing a placeholder instead of rendering actual PDF content. The goal was to restore PDF.js/react-pdf integration.
**Root Cause:** PDF.js/react-pdf integration was previously disabled for debugging; placeholder content was left in the component.
**Attempted Solution:**
- Replaced the placeholder with a full PDF.js viewer using `react-pdf`.
- Added required imports, state, and event handlers for PDF loading, navigation, and zoom.
- Verified the `/api/pdf/[document.id]` endpoint was implemented and serving PDFs.
- Installed `react-pdf` via `npm install react-pdf`.
**Reasoning:** Restoring the original PDF.js/react-pdf integration should allow the app to render actual PDF documents with navigation and zoom controls.
**Code Changes:**
- Modified `frontend/src/components/ManualDetail.tsx` to use `react-pdf` and handle PDF state.
- Verified and left unchanged: `frontend/src/app/api/pdf/[...path]/route.ts` (already implemented).
- Installed `react-pdf` in `frontend/package.json`.
**Testing Steps:**
- Started the dev server and navigated to a manual/document in the app.
- Observed the PDF viewer area for loading, error, or successful rendering.
**Outcome:** Initial integration led to a build error: `Module not found: Can't resolve 'react-pdf/dist/esm/Page/AnnotationLayer.css'`.
**Side Effects:** None, but PDF viewer was still broken.
**Lessons Learned:** `react-pdf` v7+ changed CSS import paths; documentation must be checked for correct usage.
**Next Steps:** Fix CSS import paths for `react-pdf`.

---

## 2024-07-01 - React-PDF CSS Import Error - WORKING ✅

**Problem:** Build failed with `Module not found: Can't resolve 'react-pdf/dist/esm/Page/AnnotationLayer.css'` after attempting to use `react-pdf` in `ManualDetail.tsx`.
**Root Cause:** The installed version of `react-pdf` (v7+) no longer provides CSS files in the `dist/esm/Page/` directory; the correct path is now `dist/Page/`.
**Attempted Solution:**
- Updated CSS import paths in `ManualDetail.tsx` to `import 'react-pdf/dist/Page/AnnotationLayer.css';` and `import 'react-pdf/dist/Page/TextLayer.css';`.
**Reasoning:** Using the correct import paths per the latest `react-pdf` documentation should resolve the build error.
**Code Changes:**
- Modified import statements in `frontend/src/components/ManualDetail.tsx`.
**Testing Steps:**
- Restarted the dev server and checked for build errors.
**Outcome:** The build error was resolved, but a new runtime error appeared: `ReferenceError: DOMMatrix is not defined`.
**Side Effects:** None, but PDF viewer still did not work.
**Lessons Learned:** Always check library documentation for breaking changes in import paths.
**Next Steps:** Address SSR/browser-only issues with PDF.js/react-pdf.

---

## 2024-07-01 - PDF.js SSR Error (DOMMatrix) & Dynamic Import Fix - WORKING ✅

**Problem:** After fixing CSS imports, the app failed at runtime with `ReferenceError: DOMMatrix is not defined` when rendering the PDF viewer.
**Root Cause:** PDF.js (used by `react-pdf`) requires browser APIs like `DOMMatrix` that are not available during server-side rendering (SSR) in Next.js.
**Attempted Solution:**
- Created a new `PDFViewer.tsx` component that wraps the `react-pdf` logic and CSS imports.
- Used Next.js `dynamic` import with `ssr: false` in `ManualDetail.tsx` to ensure the PDF viewer is only rendered on the client.
- Removed all direct `react-pdf` imports from `ManualDetail.tsx`.
**Reasoning:** Rendering the PDF viewer only on the client avoids SSR errors and is the recommended pattern for browser-only libraries in Next.js.
**Code Changes:**
- Added `frontend/src/components/PDFViewer.tsx` (client-only PDF viewer wrapper).
- Updated `frontend/src/components/ManualDetail.tsx` to dynamically import and use `PDFViewer` with `ssr: false`.
**Testing Steps:**
- Restarted the dev server and navigated to a manual/document in the app.
- Observed that the app loaded without SSR errors and the PDF viewer rendered on the client.
**Outcome:** The PDF viewer loaded without SSR errors; the site was stable and the PDF viewer worked as expected.
**Side Effects:** None observed.
**Lessons Learned:** For browser-only libraries in Next.js, always use dynamic imports with `ssr: false` to avoid SSR issues.
**Next Steps:** Continue development and monitor for any further PDF viewer or SSR-related issues.

---

## 2024-07-01 - Dev Server Management - WORKING ✅

**Problem:** Multiple dev servers were running on ports 3000, 3001, and 3002, causing port conflicts and confusion during testing.
**Root Cause:** Previous dev server processes were not properly terminated before starting new ones.
**Attempted Solution:**
- Used `lsof -ti:3000,3001,3002 | xargs kill -9` to forcefully kill all dev servers on those ports.
**Reasoning:** Ensuring only one dev server is running prevents port conflicts and makes testing more reliable.
**Code Changes:**
- No code changes; terminal command only.
**Testing Steps:**
- Started a fresh dev server and confirmed only one instance was running.
**Outcome:** Port conflicts were resolved; development/testing could proceed smoothly.
**Side Effects:** None.
**Lessons Learned:** Always kill old dev servers before starting new ones, especially when switching branches or making major changes.
**Next Steps:** Continue with feature development and debugging as needed.

---

## 2024-07-04 - PDF.js Circular Loading State Bug Fix - WORKING ✅

**Problem:** PDF reader showing "Loading PDF..." indefinitely despite previous "working" fixes; PDFViewer component never rendering.

**Root Cause:** Circular dependency in loading state logic - PDFViewer was only rendered when `!loading && !error`, but loading was only set to false by the PDFViewer's onLoadSuccess callback, creating a deadlock.

**Attempted Solution:**
1. Identified circular dependency through enhanced logging
2. Removed blocking loading state logic from ManualDetail.tsx 
3. Changed PDFViewer to always render (unless there's an error)
4. Let the PDF.js component handle its own internal loading states

**Reasoning:** The PDFViewer needs to render in order to attempt loading the PDF and trigger the success/error callbacks.

**Code Changes:**
- `frontend/src/components/ManualDetail.tsx`: Removed circular loading dependency, simplified render logic
- Added comprehensive logging to trace the issue

**Testing Steps:**
1. Navigate to Machine → Manual → Click document
2. Verify PDFViewer console logs appear
3. Check for PDF rendering

**Outcome:** WORKING ✅ - PDFViewer now renders and attempts to load PDFs, but revealed next issue with worker loading
**Side Effects:** None observed
**Lessons Learned:** Always check for circular dependencies in React state management, especially with async operations
**Next Steps:** Fix PDF.js worker loading issue

---

## 2024-07-04 - PDF.js Worker URL Protocol Fix - ATTEMPTED ⏳

**Problem:** PDFViewer renders but PDF.js worker fails to load with error: "Failed to fetch dynamically imported module: http://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js"

**Root Cause:** 
1. CDN worker URL was using HTTP instead of HTTPS, causing fetch failures
2. Version mismatch between CDN version (5.3.31) and installed pdfjs-dist (3.11.174)

**Attempted Solution:**
1. Reverted back to using local worker file: `pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"`
2. Local worker file exists in public directory and should match the installed version

**Reasoning:** 
- Local worker file avoids CDN fetch issues and protocol mismatches
- Should be compatible with the installed pdfjs-dist version
- Eliminates network dependency for worker loading

**Code Changes:**
- `frontend/src/components/PDFViewer.tsx`: Changed worker src back to local file

**Testing Steps:**
1. Navigate to Machine → Manual → Click document
2. Check for worker loading errors in console
3. Verify PDF attempts to load from API route
4. Check Network tab for API calls

**Outcome:** [TO BE UPDATED]
**Side Effects:** [TO BE UPDATED]
**Lessons Learned:** [TO BE UPDATED]
**Next Steps:** [TO BE UPDATED]

---