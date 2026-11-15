/**
 * Coordinate parsing helpers.
 * Converts the display strings from the API ("17h 57m", "+04° 41\"")
 * into J2000 degrees usable with Aladin Lite.
 */

/** Parse right ascension "Xh Ym Zs" → degrees (0..360). */
export function parseRAhms(ra: string): number {
  const match = ra.match(/(\d+(?:\.\d+)?)h\s*(\d+(?:\.\d+)?)m(?:\s*(\d+(?:\.\d+)?)s)?/i);
  if (!match) return NaN;
  const hours = parseFloat(match[1]);
  const minutes = parseFloat(match[2]);
  const seconds = match[3] ? parseFloat(match[3]) : 0;
  return (hours + minutes / 60 + seconds / 3600) * 15;
}

/** Parse declination "+04° 41\"" or "-56° 47\"" → degrees (-90..90). */
export function parseDecDMS(dec: string): number {
  const match = dec.match(/([+-]?)(\d+(?:\.\d+)?)°\s*(\d+(?:\.\d+)?)(?:\s*(\d+(?:\.\d+)?)")?/);
  if (!match) return NaN;
  const sign = match[1] === "-" ? -1 : 1;
  const degrees = parseFloat(match[2]);
  const minutes = parseFloat(match[3]);
  const seconds = match[4] ? parseFloat(match[4]) : 0;
  return sign * (degrees + minutes / 60 + seconds / 3600);
}

/**
 * Parse a free-form sky target like "17h57m +04d41m", "269.3 4.7",
 * or "17 57 +4 41" → J2000 degrees. Accepts h/m/s, °/d/m, or plain decimals;
 * returns null when either half is unparseable.
 */
export function parseSkyTarget(text: string): { ra: number; dec: number } | null {
  const parts = text.trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length < 2) return null;
  const [raPart, decPart] = parts;

  const dec = parseDecNumber(decPart);
  if (!Number.isFinite(dec) || Math.abs(dec) > 90) return null;

  const ra = parseRaNumber(raPart);
  if (!Number.isFinite(ra) || ra < 0 || ra > 360) return null;

  return { ra, dec };
}

/** RA token: "17h57m04s", "17 57", or "269.3" (degrees). */
function parseRaNumber(token: string): number {
  if (/h/i.test(token)) return parseRAhms(token.includes("m") ? token : `${token}0m`);
  const values = token.split(/[d°]/).filter(Boolean);
  if (values.length === 1) return parseFloat(values[0]);
  if (values.length === 2) return parseFloat(values[0]) + parseFloat(values[1]) / 60;
  if (values.length === 3) {
    return (
      parseFloat(values[0]) + parseFloat(values[1]) / 60 + parseFloat(values[2]) / 3600
    );
  }
  return NaN;
}

/** Dec token: "-07d14m", "+4 41", or "4.7" (degrees). */
function parseDecNumber(token: string): number {
  const sign = token.trimStart().startsWith("-") ? -1 : 1;
  const unsigned = token.replace(/^[+-]/, "");
  if (/d|°/i.test(unsigned)) {
    const values = unsigned.split(/[d°]/).filter(Boolean);
    if (values.length === 2) return sign * (parseFloat(values[0]) + parseFloat(values[1]) / 60);
    if (values.length === 3) {
      return sign * (parseFloat(values[0]) + parseFloat(values[1]) / 60 + parseFloat(values[2]) / 3600);
    }
    return NaN;
  }
  // "07 14" style: two numbers = degrees + arcminutes.
  const values = unsigned.split(/\s+/).filter(Boolean);
  if (values.length === 2) return sign * (parseFloat(values[0]) + parseFloat(values[1]) / 60);
  const decimal = parseFloat(unsigned);
  return Number.isFinite(decimal) ? sign * Math.abs(decimal) : NaN;
}
