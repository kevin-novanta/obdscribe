# Evidence Pack – OBDscribe History & Reporting Features (v0.1)

**Feature Area:** Report History, Filters, Clone, PDF Export, CSV Export  
**Repo:** `kevin-novanta/obdscribe`  
**Date:** 2025-11-30  
**Author:** Kevin Evans 

---

## 1. Scope of This Evidence Pack

This evidence pack documents the end‑to‑end implementation and behavior of the **History** feature set in OBDscribe:

- `/app/history` – main report history table
- `/app/history/[id]` – report detail view
- `/api/reports/[id]` – GET + DELETE
- `/api/reports/[id]/pdf` – PDF export for a single report
- `/api/reports/export` – CSV export for filtered history
- **Clone flow**: `/app/new-report?cloneId=<id>`

It is meant to prove that:

1. History is correctly scoped to the logged‑in shop (and user).  
2. Filtering and searching work for common use cases.  
3. Reports can be cloned, deleted, and exported (PDF + CSV).  
4. The UI and APIs behave consistently across typical flows.

---

## 2. Implementation Overview

### 2.1. Backend

**Prisma / DB**

- `prisma/schema.prisma`
  - Added `enum ReportStatus { DRAFT ESTIMATE_SENT APPROVED COMPLETED }`.
  - Added `status ReportStatus @default(COMPLETED)` field to `Report`.
- Migrations created via Prisma:
  - `20251130225054_add_report_status`

**Helpers**

- `src/lib/history.ts`
  - `HistoryFilterOptions` type for filters (make, model, code, q, from, to).
  - `listRecentReportsForShop(shopId, userId?, filters?)`
    - Scopes by `shopId` (and optionally `userId`).
    - Applies filters:
      - `vehicleMake`, `vehicleModel`
      - `codesRaw` substring match
      - `complaint` substring match
      - `createdAt` range
    - Returns up to 100 most recent reports.
  - `getReportByIdForShop(shopId, id)`
    - Returns a single report for the given shop or `null` if missing.

**API Routes**

- `src/app/api/reports/[id]/route.ts`
  - `GET` – returns a JSON payload suitable for cloning:
    - `vehicleYear`, `vehicleMake`, `vehicleModel`, `vehicleTrim`
    - `mileage`, `complaint`, `notes`, `codesRaw`
  - `DELETE` – deletes a report owned by the current shop.
    - Uses session → `shopId` to confirm ownership.
    - Returns `{ ok: true }` on success.
    - Returns `404` if report not found or belongs to another shop.

- `src/app/api/reports/[id]/pdf/route.ts`
  - `GET` – generates a one‑page PDF using `pdf-lib` with:
    - Header: “OBDscribe Report”
    - Vehicle, created date
    - Complaint
    - OBD codes (if present)
    - Truncated Tech View + Customer View
  - Returns `Content-Type: application/pdf` and `Content-Disposition: attachment`.

- `src/app/api/reports/export/route.ts`
  - `GET` – exports filtered report history as CSV.
  - Accepts the same query string filters as `/app/history`:
    - `make`, `model`, `code`, `q`, `from`, `to`
  - Uses `listRecentReportsForShop` to reuse the same backend filters.
  - CSV columns:
    - `id, createdAt, vehicleYear, vehicleMake, vehicleModel, vehicleTrim, mileage, codesRaw, complaint, status`

- `src/app/api/generate-report/route.ts`
  - On report creation, sets:
    - `status: "COMPLETED"`
    - `mode` from request body or `"standard"`
    - `codesRaw` as joined codes array
    - `maintenanceSuggestions` as newline‑joined list

### 2.2. Frontend

**History Page**

- `src/app/app/history/page.tsx`
  - Server component.
  - Reads session from cookies (`obdscribe_session` → `parseSessionToken`).
  - Parses `searchParams` and converts to `HistoryFilterOptions`.
  - Calls `listRecentReportsForShop(shopId, userId, filters)`.
  - Renders:
    - `HistoryFilterForm` above the table.
    - “Showing N reports (filtered)” + `Export CSV` link.
    - Scrollable table with columns:
      - Date, Year, Make, Model, Codes, Complaint, Mode, Status, Actions.
    - Actions:
      - `View` – `/app/history/[id]`
      - `PDF` – `/api/reports/[id]/pdf`
      - `Clone` – `/app/new-report?cloneId=[id]`
      - `Delete` – `DeleteReportButton` calling DELETE endpoint.

- `src/app/app/history/HistoryFilterForm.tsx`
  - Client component.
  - Accepts `searchParams` from server as initial values.
  - Fields:
    - Make (dropdown)
    - Model (dropdown – disabled until Make selected)
    - OBD Code
    - Complaint search (`q`)
    - From date, To date
  - Uses shared vehicle make/model data (`VEHICLE_MAKE_MODELS`) for dropdowns.
  - Disables model select when no make is chosen.
  - Submits via GET to `/app/history`.

- `src/app/app/history/[id]/page.tsx`
  - Server component.
  - Uses `getReportByIdForShop(shopId, id)`.
  - If no session → message “You must be logged in to view reports.”  
  - If no report → “Report not found” with link back to history.
  - Shows:
    - Vehicle header + created date + **Status**.
    - Complaint, Notes, OBD Codes.
    - Vehicle block (Year/Make/Model/Trim).
    - Tech View and Customer View blocks (`whitespace-pre-wrap`).
    - Maintenance suggestions block.
    - Download PDF link.

- `src/app/app/history/DeleteReportButton.tsx`
  - Client button that:
    - Confirms with user.
    - Sends `DELETE` to `/api/reports/[id]`.
    - On success, calls `router.refresh()` to update the table.

**Clone Flow**

- `src/app/app/new-report/page.tsx`
  - Client component with `useSearchParams()`.
  - Reads `cloneId` from query string.
  - `useEffect` fetches `/api/reports/[cloneId]` when present:
    - Prefills:
      - Year, Make, Model, Mileage
      - Complaint, Notes
      - Codes (`codesRaw`)
  - Reuses existing `YEAR/MAKE/MODEL` dropdown logic.

---

## 3. Screenshots to Capture

Create a new evidence folder, for example:

- `docs/evidence/evidence-00003-11-30-25-history/`

Recommended screenshots (names are suggestions):

1. **History table – unfiltered**
   - File: `01-history-unfiltered.png`
   - Shows `/app/history` with several reports listed, no filters applied.

2. **History table – filtered by make/model**
   - File: `02-history-filter-make-model.png`
   - Make = `Toyota`, Model = `Corolla` (or any realistic combo).
   - Shows that only matching rows appear.

3. **History table – filtered by OBD code**
   - File: `03-history-filter-code.png`
   - Code field = `P0301` (or another existing code).
   - Only rows containing that code in `codesRaw` show up.

4. **History table – complaint search**
   - File: `04-history-filter-complaint.png`
   - Complaint search (`q`) = e.g., `"misfire"`.
   - Rows with “misfire” in complaint are visible.

5. **History table – date range filter**
   - File: `05-history-filter-dates.png`
   - `from` / `to` set to a specific range.
   - List shows reports only in that range.

6. **History actions – PDF/Clone/Delete visible**
   - File: `06-history-actions.png`
   - Zoomed on Actions column showing `View | PDF | Clone | Delete`.

7. **Report detail page**
   - File: `07-report-detail.png`
   - `/app/history/[id]` showing:
     - Status, vehicle info, complaint, notes, codes, tech/customer views.
     - “Download PDF” link.

8. **PDF download opened in browser**
   - File: `08-report-pdf.png`
   - Shows generated PDF open in browser or PDF viewer (one report).

9. **CSV export opened in spreadsheet**
   - File: `09-history-csv.png`
   - After clicking “Export CSV”, open in Excel/Sheets showing columns and rows.

10. **Clone flow – prefilled New Report**
    - File: `10-clone-prefilled-new-report.png`
    - Start from `/app/history`, click `Clone`, land on `/app/new-report?cloneId=...`.
    - Shows year/make/model/mileage/complaint/notes/codes prefilled.

Place all screenshots into the evidence folder, for example:

- `docs/evidence/evidence-00003-11-30-25-history/01-history-unfiltered.png`
- `...` etc.

---

## 4. Manual Test Log

Below is a suggested test log format. Replace the ✅ with actual result notes if needed.

### 4.1. History visibility

- User with valid session opens `/app/history` → sees only reports from their shop. ✅
- User without session → sees “You must be logged in to view history.” ✅

### 4.2. Filters

- **Make/Model**
  - Set Make = `Toyota`, Model = `Corolla` → only Toyota Corolla reports shown. ✅
  - Model dropdown disabled until a Make is selected. ✅

- **OBD code**
  - Enter `P0301` → only reports whose `codesRaw` contains `P0301` are shown. ✅

- **Complaint search**
  - Enter `misfire` → only reports with “misfire” in complaint are shown. ✅

- **Date range**
  - Set `from` and `to` to a narrow window → only reports in that window appear. ✅

### 4.3. Actions

- **View**
  - From history table, click `View` → navigates to `/app/history/[id]` with correct data. ✅

- **Delete**
  - Click `Delete` → confirm prompt → report disappears from table after refresh. ✅
  - Verify in DB (Prisma Studio/psql) that the row is gone. ✅

- **Clone**
  - Click `Clone` → navigates to `/app/new-report?cloneId=...`.
  - New report form is prefilled with vehicle, complaint, notes, codes. ✅
  - Submitting creates a new report while original remains intact. ✅

- **PDF**
  - Click `PDF` in table or “Download PDF” on detail page → browser downloads a PDF.
  - Open PDF: Verify header, vehicle info, complaint, codes, truncated tech/customer views. ✅

- **CSV export**
  - On `/app/history`, click `Export CSV`.
  - Downloaded CSV contains the same rows as currently filtered history view. ✅
  - Columns match spec (id, createdAt, vehicleYear, etc.). ✅

---

