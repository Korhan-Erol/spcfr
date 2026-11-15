"use client";

import { useState } from "react";
import { parseSkyTarget } from "@/lib/astronomy/coords";

interface AtlasControlsProps {
  /** Current horizontal FoV (degrees) from the store; null until the atlas reads it back. */
  fov: number | null;
  onSetFov: (deg: number) => void;
  onGoto: (ra: number, dec: number) => void;
  disabled: boolean;
}

/** FoV slider range (degrees) — log-mapped so small fields stay reachable. */
const FOV_MIN = 0.5;
const FOV_MAX = 360;

const fovToSlider = (fov: number): number =>
  (100 * Math.log(fov / FOV_MIN)) / Math.log(FOV_MAX / FOV_MIN);

const sliderToFov = (slider: number): number =>
  FOV_MIN * Math.pow(FOV_MAX / FOV_MIN, slider / 100);

const formatFov = (fov: number): string =>
  fov < 10 ? `${fov.toFixed(1)}°` : `${Math.round(fov)}°`;

/**
 * Atlas discovery controls: field-of-view adjustment and a RA/Dec search
 * box ("17h57m +04d41m" or "269.3 4.7"). Values map 1:1 onto the shareable
 * URL parameters handled by `useUrlStateSync`.
 */
export function AtlasControls({
  fov,
  onSetFov,
  onGoto,
  disabled,
}: AtlasControlsProps) {
  const [query, setQuery] = useState("");
  const [invalid, setInvalid] = useState(false);

  const submitTarget = () => {
    const target = parseSkyTarget(query);
    if (!target) {
      setInvalid(true);
      window.setTimeout(() => setInvalid(false), 1200);
      return;
    }
    setQuery("");
    onGoto(target.ra, target.dec);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex min-w-[150px] flex-1 items-center gap-2">
        <span className="font-mono text-[9px] tracking-wider text-text-muted">
          FOV
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={fov === null ? fovToSlider(70) : fovToSlider(fov)}
          aria-label="Field of view (degrees)"
          disabled={disabled}
          className="band-range flex-1"
          onChange={(e) => onSetFov(Number(sliderToFov(Number(e.target.value)).toFixed(2)))}
        />
        <span className="w-11 text-right font-mono text-[9px] text-cyan-bright">
          {fov === null ? "—" : formatFov(fov)}
        </span>
      </label>

      <input
        type="text"
        value={query}
        placeholder="RA/Dec e.g. 17h57m +04d41m"
        aria-label="Go to sky coordinates"
        disabled={disabled}
        className={`w-[190px] rounded-[2px] border bg-[#0c1219] px-1.5 py-1 font-mono text-[10px] text-[#c7d6e6] outline-none transition-colors placeholder:text-[#4d6076] focus:border-cyan-bright ${
          invalid ? "border-[#a25a5a]" : "border-[#1e2a38]"
        }`}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submitTarget();
        }}
      />
      <button
        type="button"
        disabled={disabled}
        className="cursor-pointer rounded-[2px] border border-[#2e4054] bg-[#15202b] px-2 py-1 text-[9px] tracking-[0.06em] text-[#c2d1e0] transition-colors hover:border-cyan-bright hover:text-cyan-bright disabled:cursor-not-allowed disabled:opacity-40"
        onClick={submitTarget}
      >
        GO
      </button>
    </div>
  );
}
