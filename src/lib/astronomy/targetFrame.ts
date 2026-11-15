import { mulberry32 } from "@/lib/utils/random";

/**
 * Deterministic target-frame renderer for the epoch comparison cards.
 * Visually identical to MiniStarfield (same 160×92 design space, seeded
 * field, cyan target star) but parameterized so the A and B frames of a
 * survey epoch can be *subtracted*: identical field stars cancel out and
 * only the target's motion + brightness change survives.
 */

/** Design-space size; matches MiniStarfield so the two views align. */
export const FRAME_W = 160;
export const FRAME_H = 92;
const TARGET_Y = 46;
const FIELD_STAR_COUNT = 65;

export interface TargetFrameOptions {
  /** Seed for the background field — must match between A and B. */
  seed: number;
  /** Horizontal target position (design px). */
  targetX: number;
  /** Target brightness multiplier (1 = nominal). */
  brightness: number;
}

interface FieldStar {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

/** The seeded background field — shared by both frames of an epoch. */
function fieldStars(seed: number): FieldStar[] {
  const rand = mulberry32(seed);
  const stars: FieldStar[] = [];
  for (let i = 0; i < FIELD_STAR_COUNT; i++) {
    stars.push({
      x: rand() * FRAME_W,
      y: rand() * FRAME_H,
      r: rand() * 1.1 + 0.3,
      alpha: rand() * 0.75 + 0.2,
    });
  }
  return stars;
}

/** Paints one survey-epoch frame into the given 2D context. */
export function renderTargetFrame(
  ctx: CanvasRenderingContext2D,
  options: TargetFrameOptions,
): void {
  ctx.fillStyle = "#070b10";
  ctx.fillRect(0, 0, FRAME_W, FRAME_H);

  for (const star of fieldStars(options.seed)) {
    ctx.fillStyle = `rgba(210, 228, 248, ${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const glow = Math.min(1.15, Math.max(0.15, options.brightness));
  ctx.fillStyle = `rgba(125, 206, 245, ${0.95 * glow})`;
  ctx.beginPath();
  ctx.arc(options.targetX, TARGET_Y, 1.8 * glow, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Computes |frame A − frame B| into a fresh design-space (160×92) canvas —
 * the image-subtraction residual. Identical pixels cancel; the target's
 * displacement and brightness change remain as a cyan residual (positive
 * sources bright, vacated positions dark).
 *
 * Returns a standalone canvas so callers can draw it scaled onto a
 * DPR-mapped visible canvas (`putImageData` ignores transforms).
 */
export function renderTargetDifferenceImage(
  frameA: TargetFrameOptions,
  frameB: TargetFrameOptions,
): HTMLCanvasElement | null {
  const scratchA = document.createElement("canvas");
  const scratchB = document.createElement("canvas");
  const paint = (canvas: HTMLCanvasElement, options: TargetFrameOptions) => {
    canvas.width = FRAME_W;
    canvas.height = FRAME_H;
    const context = canvas.getContext("2d");
    if (!context) return null;
    renderTargetFrame(context, options);
    return context.getImageData(0, 0, FRAME_W, FRAME_H);
  };

  const imageA = paint(scratchA, frameA);
  const imageB = paint(scratchB, frameB);
  if (!imageA || !imageB) return null;

  const diff = document.createElement("canvas");
  diff.width = FRAME_W;
  diff.height = FRAME_H;
  const diffCtx = diff.getContext("2d");
  if (!diffCtx) return null;

  const result = diffCtx.createImageData(FRAME_W, FRAME_H);
  const GAIN = 9; // residual amplification so faint deltas stay visible
  for (let i = 0; i < imageA.data.length; i += 4) {
    const delta =
      (Math.abs(imageA.data[i] - imageB.data[i]) +
        Math.abs(imageA.data[i + 1] - imageB.data[i + 1]) +
        Math.abs(imageA.data[i + 2] - imageB.data[i + 2])) /
      3;
    const value = Math.min(255, delta * GAIN);
    result.data[i] = Math.round(value * 0.45); // R
    result.data[i + 1] = Math.round(value * 0.8); // G
    result.data[i + 2] = Math.round(value); // B — cyan residual
    result.data[i + 3] = 255;
  }
  diffCtx.putImageData(result, 0, 0);
  return diff;
}
