/**
 * Shareable view state carried in the query string:
 *
 *   ?ra=269.3&dec=4.7&fov=12&band=42&star=barnard&epoch=1&embed=1
 *
 * Coordinates accept decimal degrees or sexagesimal ("17h57m", "+04d41m").
 * Only values that differ from the app defaults are written back, so shared
 * links stay short and future parameters remain forward-compatible.
 */

export interface UrlViewState {
  /** View center right ascension (J2000 degrees) or null. */
  ra: number | null;
  /** View center declination (J2000 degrees) or null. */
  dec: number | null;
  /** Horizontal field of view (degrees) or null. */
  fov: number | null;
  /** Selected spectral band (1..102) or null. */
  band: number | null;
  /** Selected catalog star id or null. */
  star: string | null;
  /** Selected epoch index or null. */
  epoch: number | null;
  /** Chrome-less embed mode for iframes. */
  embed: boolean;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (raw: RawParams, key: string): string | null => {
  const value = raw[key];
  const single = Array.isArray(value) ? value[0] : value;
  return single ? single : null;
};

const parseNumber = (
  value: string | null,
  min: number,
  max: number,
): number | null => {
  if (value === null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < min || parsed > max) return null;
  return parsed;
};

/** Decodes the query-string view state; unknown/malformed values are dropped. */
export function parseUrlViewState(raw: RawParams): UrlViewState {
  return {
    ra: parseNumber(first(raw, "ra"), 0, 360),
    dec: parseNumber(first(raw, "dec"), -90, 90),
    fov: parseNumber(first(raw, "fov"), 0.1, 360),
    band: parseNumber(first(raw, "band"), 1, 102),
    star: first(raw, "star"),
    epoch: parseNumber(first(raw, "epoch"), 0, 99),
    embed: /^(1|true)$/i.test(first(raw, "embed") ?? ""),
  };
}

/** Values that never need to appear in a shareable URL. */
export const VIEW_DEFAULTS = {
  band: 18,
  epoch: 0,
  star: "barnard",
  fov: 70, // matches the Aladin initialization FoV
} as const;

const round = (value: number, digits: number): number =>
  Number(value.toFixed(digits));

/**
 * Serializes the current view state back to query params. Null/default
 * values are omitted so a pristine dashboard keeps a clean URL.
 */
export function viewStateToSearchParams(state: UrlViewState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.ra !== null && state.dec !== null) {
    params.set("ra", round(state.ra, 4).toString());
    params.set("dec", round(state.dec, 4).toString());
  }
  if (state.fov !== null && Math.abs(state.fov - VIEW_DEFAULTS.fov) >= 0.5) {
    params.set("fov", round(state.fov, 1).toString());
  }
  if (state.band !== null && state.band !== VIEW_DEFAULTS.band) {
    params.set("band", state.band.toString());
  }
  if (state.star !== null && state.star !== VIEW_DEFAULTS.star) {
    params.set("star", state.star);
  }
  if (state.epoch !== null && state.epoch !== VIEW_DEFAULTS.epoch) {
    params.set("epoch", state.epoch.toString());
  }
  if (state.embed) params.set("embed", "1");
  return params;
}
