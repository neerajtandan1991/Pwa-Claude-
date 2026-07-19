# Civil Works Estimator & Progress Report — PWA

Offline-first installable web app for civil works BOQ estimation, measurement-book
style quantity takeoff, photo evidence (before/during/after), and auto-generated
Work Progress Reports (IPCs) — exportable to Excel and PDF with a customizable
letterhead.

Built from, and fixes, the broken `#REF!`/`#ERROR!` formula chains found in the
original `estimate_sheet.xlsx` / `wpr.xlsx` — the calculation logic (L × B × H × No
→ quantity → rate → amount → category subtotal → VAT → grand total, and the
upto-date / previous-bill / this-bill IPC math) has been rebuilt cleanly in
`js/calc.js`.

## Quick start (test locally)

You need to serve the files over HTTP (service workers and installability do not
work from `file://`). From this folder:

```bash
# Python (built into most systems)
python3 -m http.server 8080
# then open http://localhost:8080 on your computer or phone (same Wi-Fi)
```

Or with Node:
```bash
npx serve .
```

## Deploy for real mobile use (installable, HTTPS required)

PWAs require HTTPS (localhost is exempt, for testing only). Easiest free options:

1. **GitHub Pages** — push this folder to a repo, enable Pages in Settings.
2. **Netlify / Vercel** — drag-and-drop this folder in their dashboard, or connect
   the repo. Both give you a free HTTPS URL instantly.
3. Any existing web host you control — just upload the files as-is (static site,
   no server/backend/database needed).

Once deployed, open the URL on the phone in Chrome (Android) or Safari (iOS) and:
- **Android/Chrome:** menu → "Install app" / "Add to Home Screen"
- **iOS/Safari:** Share button → "Add to Home Screen"

After that first install, the app opens like a native app and works with the
phone fully in airplane mode — data, photos, and exports all happen on-device.

## How offline works

- **Data** (projects, BOQ items, measurements, photos) is stored in the browser's
  IndexedDB, entirely on the device. Nothing is sent to any server.
- **App code** (HTML/CSS/JS) and the three CDN libraries used for Excel/PDF export
  (SheetJS, jsPDF, jsPDF-AutoTable) are cached by the service worker the first time
  the app loads with internet access. After that, everything — including
  generating Excel/PDF files — works with no connection at all.
- If you ever change the app files, bump `CACHE_VERSION` in `service-worker.js` so
  installed devices pick up the update next time they're online.

## Using the app

1. **New Project** — creates a project; optionally pre-loads the sample Ward
   Office BOQ (73 items) as an editable starting template, or start blank for any
   other project.
2. **BOQ & Measurements tab** — add/edit BOQ items (category, description, unit,
   rate). Tap an item to expand it: add measurement entries with Length / Breadth
   / Height / No. rows (matches the traditional measurement-book layout — leave
   any dimension blank to treat it as 1, use a negative "No." for deductions like
   door/window openings). Attach Before / During / After photos per item directly
   from the phone camera.
3. **Estimate tab** — live rollup of all BOQ items × up-to-date quantities, by
   category, with VAT and grand total. Export to Excel or PDF.
4. **Progress Report tab** — pick a bill number; see Upto-Date / Previous Bill /
   This Bill quantities and amounts per item (the IPC logic). Export to Excel or
   PDF.
5. **Photos tab** — all photo evidence per BOQ item; export a consolidated Photo
   Report PDF.
6. **Letterhead Settings** (from the Projects home screen) — office name, address,
   logo image, footer note. Applied to every Excel/PDF export.

## Known limitations / next steps to consider

- Letterhead is currently a single global setting (not per-project) — easy to
  extend to per-project if you need different letterheads for different clients.
- No multi-user sync/cloud backup by design (offline-first, on-device only). If
  you later want cross-device sync or a web dashboard, that needs a backend and
  is a separate project.
- Camera capture uses the native camera app via file input (`capture="environment"`)
  rather than an in-page live preview — more reliable across Android/iOS/PWA
  contexts, but no live overlay/guides during capture.
- BOQ template quantities are computed from your measurement entries — the
  template does not pre-fill any quantities, since those depend on your actual
  site dimensions.
