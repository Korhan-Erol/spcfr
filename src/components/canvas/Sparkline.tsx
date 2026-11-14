"use client";

import { useEffect, useRef } from "react";

interface SparklineProps {
  spectralSeed: number;
}

/** Small proper-motion / flux sparkline. */
export function Sparkline({ spectralSeed }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 360;
    canvas.height = 56;
    ctx.clearRect(0, 0, 360, 56);

    ctx.strokeStyle = "#243445";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 44);
    ctx.lineTo(360, 44);
    ctx.stroke();

    ctx.strokeStyle = "#76bfe8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const x = (i / 60) * 360;
      const y = 30 - Math.sin(i * 0.35 + spectralSeed) * 11 - Math.cos(i * 0.8) * 5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [spectralSeed]);

  return <canvas ref={canvasRef} className="h-[28px] flex-1" aria-hidden="true" />;
}
