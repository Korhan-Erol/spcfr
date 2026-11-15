# SPHEREx Sky Hunter

A citizen science portal for hunting transients and Planet X across NASA SPHEREx
all-sky spectral data. The original single-file prototype has been re-architected
on **Next.js (App Router) + TypeScript + Tailwind CSS v4**.

## Mission features

- **Time-domain change detection** — each epoch card renders the raw `A | B`
  survey frames or the `A−B` image-subtraction residual: identical pixels
  cancel and the selected target's motion and brightness change remain as a
  cyan residual. The view is driven by the selected target's proper motion
  and variability (`motionArcsecPerYr`, `variability` in the API contract).
- **102-band spectral visualization** — the band grid mirrors the real
  SPHEREx layout (6 detector arrays × 17 bands = 102, 0.75–5.0 μm); hover or
  click the spectral chart to select a band instantly.
- **Interactive discovery** — a log-mapped field-of-view slider and a
  RA/Dec search box (`17h57m +04d41m` or `269.3 4.7`) drive the Aladin view.
- **Overlay layers** — optional **Gaia DR3** (progressive HiPS catalog) and
  **AllWISE color** (HiPS image, multi-mirror with graceful offline state)
  stacked on top of the base survey.
- **Shareable, embeddable state** — the query string carries the view:
  `?ra=269.3&dec=4.7&fov=12&band=42&star=wise0855&epoch=1&embed=1`. Values
  hydrate on load and are written back as the user pans/zooms/selects, so
  the address bar always describes the view. `embed=1` renders a
  chrome-less (header/footer-free) dashboard for iframe embedding.
- **Test targets** — Barnard's Star, Epsilon Indi B, WISE 0855 (fast mover),
  RW Aurigae and R Draconis (variables) ship in the mock catalog and drive
  the A−B residual out of the box.


## Architecture

```
src/
├── app/                    # Next.js App Router (layout, page, globals.css)
│   ├── layout.tsx          # Root layout: fonts (next/font), metadata
│   ├── page.tsx            # Server component → Dashboard
│   └── globals.css         # Tailwind v4 @theme tokens
├── components/
│   ├── layout/             # SiteHeader, SiteFooter, InfoModal
│   ├── canvas/             # Reusable canvas primitives
│   │                       #   (MiniStarfield, AstrometryGauge, Sparkline, OrbitDiagram)
│   └── home/
│       ├── Dashboard.tsx   # 3-column shell + data loading
│       ├── left/           # EpochComparison (A/B + A−B), DetectionPanel, StarList
│       ├── center/         # AllSkyAtlas (Aladin Lite), AtlasControls, OverlayLayers
│       ├── right/          # SpectralChart, BandGrid, DataTracker
│       └── bottom/         # PlanetXPanel
├── hooks/
│   ├── useElementSize.ts   # ResizeObserver wrapper
│   ├── useAnimationClock.ts# Shared 60fps animation clock (no re-renders)
│   └── useUrlStateSync.ts  # URL ↔ store hydration + shareable write-back
├── lib/
│   ├── api/                # types.ts, client.ts, endpoints.ts, mock.ts
│   ├── astronomy/          # coords.ts (RA/Dec parsing), targetFrame.ts (A/B frames + diff)
│   ├── constants/          # bands.ts (real SPHEREx band plan), nav.ts, epochs.ts
│   ├── types/              # aladin.d.ts (ambient Aladin Lite types)
│   ├── url/                # viewState.ts (shareable ?ra=&dec=&fov=&band=... codec)
│   └── utils/              # random.ts (seeded RNG), canvas.ts (DPR setup),
│                           #   loadExternal.ts (script/stylesheet loader)
└── store/
    └── dashboardStore.ts   # Zustand store (data + UI state + actions)
```

> **All-sky map**: the hand-rolled Mollweide canvas was replaced with
> **Aladin Lite v3** (CDS sky atlas). The runtime is installed as an npm
> dependency (`aladin-lite`) and bundled with the app; a vendored local copy
> (`public/vendor/aladin/aladin.esm.js`) and the official CDN act as
> fallbacks. Catalog stars, selection, diff-mode styling and the orbit
> animation are HTML overlays projected with `world2pix`.

## Getting started

```bash
# Frontend (Next.js + Tailwind v4)
npm install
npm run dev            # http://localhost:3000

# Backend (FastAPI — reference)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000
```

## Backend integration

- The frontend fetches data from the **FastAPI** `GET /api/v1/snapshot` endpoint.
- Base URL: `NEXT_PUBLIC_API_URL` (see `.env.local.example` — default
  `http://localhost:8000`).
- When the backend is unreachable, the app **transparently falls back to mock
  data** (`src/lib/api/mock.ts`). A `MOCK DATA` / `LIVE API` badge is shown in
  the header.
- API contract: `src/lib/api/types.ts` ↔ `backend/main.py`.

## Code standards

- **One responsibility per component** — no file ever bloats.
- **Canvas rendering** goes through `lib/utils/canvas.ts` (DPR-aware).
- **Animations** use a shared clock (`useAnimationClock`) instead of re-renders.
- **Data access** lives only in `lib/api/*`; components never see URLs.
- **State** is centralized in the Zustand store; components consume via selectors.

## Scripts

```bash
npm run dev        # development
npm run build      # production build
npm run lint       # lint (Next.js)
npm run typecheck  # tsc --noEmit
```
