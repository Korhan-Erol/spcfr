/**
 * Domain & API contract types.
 *
 * These types describe the data the frontend consumes. The FastAPI backend
 * must expose the same shape (see `backend/` reference implementation and the
 * mock provider in `lib/api/mock.ts`).
 */

export interface StarCatalogEntry {
  id: string;
  name: string;
  deltaMag: string;
  ra: string;
  dec: string;
  distance: string;
  magnitude: string;
  delta: string;
  raDrift: string;
  decDrift: string;
  properMotion: string;
  parallax: string;
  delta13: string;
  mas: string;
  /** Seeded spectral curve variation (0.5..2) */
  spectralSeed: number;
  /**
   * Proper motion magnitude in arcsec/yr — drives the target's displacement
   * between survey epochs (optional; the backend may refine this).
   */
  motionArcsecPerYr?: number;
  /**
   * Fractional brightness change between epochs (0..1) — drives the A−B
   * difference signal for variable targets.
   */
  variability?: number;
}

export interface PlanetXCandidate {
  id: string;
  label: string;
  ra: string;
  dec: string;
  au: string;
  color: string;
  orbitIdx: number;
}

export interface MissionInfo {
  name: string;
  agency: string;
  instrument: string;
  bandCount: number;
  wavelengthRange: [number, number];
  epochIntervalMonths: number;
  currentYear: number;
}

export interface ObservatorySnapshot {
  stars: StarCatalogEntry[];
  candidates: PlanetXCandidate[];
  mission: MissionInfo;
}

export type DataSource = "loading" | "api" | "mock";

export type DiffMode = "diff" | "movers" | "anomalies";

export interface ApiError {
  status?: number;
  message: string;
  cause?: unknown;
}
