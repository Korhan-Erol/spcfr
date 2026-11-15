/** Spectral band constants shared across the dashboard. */

export const BAND_COUNT = 102;

/**
 * SPHEREx images 6 detector arrays per 6-month survey; each array spreads
 * its light into 17 spectral bands → 6 × 17 = 102 bands, 0.75–5.0 μm.
 * The BandGrid mirrors this layout: one row per array, 17 columns.
 */
export const BAND_COLS = 17;

/** Wavelength span (μm) covered by each detector array. */
const DETECTOR_ARRAYS: ReadonlyArray<{ first: number; last: number }> = [
  { first: 0.75, last: 1.11 }, // D1 — H2RG-1a
  { first: 1.12, last: 1.63 }, // D2 — H2RG-1b
  { first: 1.7, last: 2.44 }, // D3 — H2RG-2a
  { first: 2.5, last: 3.62 }, // D4 — H2RG-2b
  { first: 3.73, last: 4.43 }, // D5 — H2RG-3a
  { first: 4.46, last: 5.05 }, // D6 — H2RG-3b
];

/** Detector array index (0..5) that owns a given 1-based band. */
export function bandArrayIndex(band: number): number {
  return Math.min(
    Math.max(Math.floor((band - 1) / BAND_COLS), 0),
    DETECTOR_ARRAYS.length - 1,
  );
}

/** Wavelength (μm) for a given band index (1-based), from the real band plan. */
export function bandWavelength(band: number): number {
  const array = DETECTOR_ARRAYS[bandArrayIndex(band)];
  const t = ((band - 1) % BAND_COLS) / (BAND_COLS - 1);
  return array.first + (array.last - array.first) * t;
}

/** Approximate flux (Jy) for a given band+star seed (demo formula). */
export function bandFlux(band: number, spectralSeed: number): number {
  return (
    12 +
    Math.sin(band * 0.14 * spectralSeed) * 14 +
    band * 0.48
  );
}
