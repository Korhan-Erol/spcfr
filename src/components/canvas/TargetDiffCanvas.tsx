"use client";

import { useEffect, useRef } from "react";
import { prepareCanvas } from "@/lib/utils/canvas";
import {
  FRAME_H,
  FRAME_W,
  renderTargetDifferenceImage,
  type TargetFrameOptions,
} from "@/lib/astronomy/targetFrame";

interface TargetDiffCanvasProps {
  frameA: TargetFrameOptions;
  frameB: TargetFrameOptions;
  className?: string;
}

/**
 * Image-subtraction view (|A − B|) for an epoch pair. The residual is
 * computed in the shared 160×92 design space and stretched to the CSS box,
 * exactly like the MiniStarfield A/B frames it complements.
 */
export function TargetDiffCanvas({
  frameA,
  frameB,
  className,
}: TargetDiffCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dims = prepareCanvas(canvas);
    if (!dims) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the design-space residual stretched over the CSS box.
    ctx.scale(dims.width / FRAME_W, dims.height / FRAME_H);
    ctx.imageSmoothingEnabled = false;
    const residual = renderTargetDifferenceImage(frameA, frameB);
    if (!residual) return;
    ctx.drawImage(residual, 0, 0, FRAME_W, FRAME_H);
  }, [frameA, frameB]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
