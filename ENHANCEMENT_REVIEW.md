# Deputation Page Review & Enhancement Roadmap

## What is working well

- The current page has a **clear workflow**: select branch → fill engineer rows → save all.
- Batch save behavior is practical for field use and reduces repetitive submissions.
- Existing duplicate/update handling from backend responses is a strong base for data integrity.

## Key technical observations

1. **Data loading uses JSONP by injecting `<script>` tags** (`loadBranch`, `loadTodayData`).
   - This works around CORS, but creates maintainability and security overhead.
   - Callback/script tags are never cleaned up after use.

2. **HTML uses inline `onclick` handlers** for branch selection and save button.
   - This tightly couples structure and behavior and makes scaling harder.

3. **IDs are index-based (`wo_0`, `wo_1`, etc.)**.
   - Fine for now, but fragile when adding filtering/sorting/reordering.

4. **Validation is minimal**.
   - Only `machineNo` is required; other important inputs can be empty.

5. **Accessibility and UX can be improved**.
   - No labels for inputs.
   - Popup is custom but not keyboard-accessible/modal-safe.
   - Color-only status cues may not be enough for all users.

6. **No local state persistence**.
   - If the page refreshes or network drops, partially entered data is lost.

7. **Total calculation appears manual-only**.
   - `total` is readonly, but there is no client-side formula binding from labour + KM.

## Suggested feature roadmap

### Phase 1 (Quick wins, high impact)

- Add **search/filter engineer rows**.
- Add **auto-calc total allowances** from labour and KM (with editable override option).
- Add **required field indicators + inline validation messages**.
- Add **unsaved changes warning** before branch switch or page close.
- Add **sticky table header + frozen first column** for large branch teams.

### Phase 2 (Reliability + productivity)

- Add **draft autosave in localStorage** per branch/date.
- Add **retry queue for failed saves** with per-row result badges.
- Add **last saved timestamp** and request progress counter.
- Add **row-level save** in addition to Save All.
- Add **keyboard shortcuts** (next cell, duplicate previous row values, submit).

### Phase 3 (Management/reporting)

- Add **daily branch summary panel**: total calls, breakdowns, running with problem, free engineers.
- Add **export to CSV/Excel** for reporting.
- Add **date picker** to view/edit previous entries.
- Add **role-based view modes** (engineer/coordinator/manager).

## Recommended technical refactor path

- Move from JSONP callbacks to **`fetch` + CORS-enabled backend**.
- Replace inline handlers with **event listeners**.
- Introduce a **single source of truth state object** in JS.
- Generate table rows from schema/config to reduce duplication.
- Add a lightweight test stack:
  - Unit tests for validation/calculation functions.
  - End-to-end save flow smoke test.

## Practical next step

If you want, the best immediate implementation bundle is:

1. Engineer search + sticky header.
2. Auto total calculation.
3. Client-side validation + draft autosave.

This gives immediate UX value without backend migration risk.
