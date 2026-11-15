"use client";

import { useState } from "react";
import { MiniStarfield } from "@/components/canvas/MiniStarfield";
import { TargetDiffCanvas } from "@/components/canvas/TargetDiffCanvas";
import type { AnimationClock } from "@/hooks/useAnimationClock";
import { EPOCHS } from "@/lib/constants/epochs";
import { clamp } from "@/lib/utils/random";
import { useDashboardStore } from "@/store/dashboardStore";

interface EpochComparisonProps {
  clock: AnimationClock;
}

/** What the epoch cards render: the A/B pair or the subtracted residual. */
type CardView = "ab" | "diff";

const VIEWS: { id: CardView; label: string }[] = [
  { id: "ab", label: "A | B FRAMES" },
  { id: "diff", label: "A−B SUBTRACTION" },
];

/** Motion between A and B, scaled to the card's design space (px). */
const motionShiftPx = (arcsecPerYr: number | undefined): number =>
  clamp((arcsecPerYr ?? 3) * 0.8, 1, 9);

/**
 * Epoch comparison time-lapse: A/B frame pairs per 6-month epoch.
 * Clicking a card selects it and plays the A↔B time-lapse animation;
 * the play/pause control toggles playback on the selected card.
 * The view toggle switches the cards between the raw A/B pair and the
 * image-subtraction residual (|A−B|), driven by the selected target.
 */
export function EpochComparison({ clock }: EpochComparisonProps) {
  const activeEpoch = useDashboardStore((s) => s.activeEpoch);
  const setEpoch = useDashboardStore((s) => s.setEpoch);
  const selectedStarId = useDashboardStore((s) => s.selectedStarId);
  const data = useDashboardStore((s) => s.data);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<CardView>("ab");

  /** Selected target drives the A−B residual: motion + brightness change. */
  const star = data?.stars.find((st) => st.id === selectedStarId) ?? null;
  const shiftB = motionShiftPx(star?.motionArcsecPerYr);
  const brightnessB = 1 - (star?.variability ?? 0.1) * 0.85;

  const handleCardClick = (epoch: number) => {
    setEpoch(epoch);
    setPlaying(true);
  };

  const handleTogglePlay = (epoch: number) => {
    if (epoch === activeEpoch) {
      setPlaying((value) => !value);
      return;
    }
    // Activating from an inactive card: select it and start playback.
    setEpoch(epoch);
    setPlaying(true);
  };

  return (
    <section className="overflow-hidden rounded-[3px] border border-border-panel bg-gradient-to-b from-[rgba(20,29,39,0.94)] to-[rgba(15,22,30,0.96)]">
      <div className="flex items-center justify-between border-b border-border-subtle bg-[rgba(24,34,46,0.45)] px-3 py-2">
        <span className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[#cad6e2]">
          EPOCH COMPARISON TIME-LAPSE
        </span>
        <span className="font-mono text-[9px] tracking-wider text-text-muted">
          {playing ? "▶ PLAYING" : "⏸ PAUSED"}
        </span>
      </div>

      <div className="px-3 py-2.5">
        <p className="mb-2.5 text-[10px] leading-[1.35] text-text-muted">
          102 bands of near-infrared data mapped every 6 months by the SPHEREx telescope.
        </p>

        <div className="mb-2 grid grid-cols-2 gap-1.5">
          {VIEWS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              className={`cursor-pointer rounded-[3px] border px-1.5 py-1 text-center text-[9px] font-medium tracking-[0.04em] transition-all duration-200 ${
                view === id
                  ? "border-cyan bg-[#192b3c] text-cyan-bright shadow-[inset_0_0_8px_rgba(94,169,209,0.18)]"
                  : "border-[#2e4054] bg-[#15202b] text-[#c2d1e0] hover:border-[#4d789c] hover:bg-[#1b2938] hover:text-white"
              }`}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {EPOCHS.map((card) => {
            const isActive = card.epoch === activeEpoch;
            const isAnimating = isActive && playing;

            return (
              <div
                key={card.epoch}
                className={`overflow-hidden rounded-[2px] border bg-[#0d131a] transition-[border-color,box-shadow] duration-200 has-[button:focus-visible]:ring-1 has-[button:focus-visible]:ring-cyan-bright ${
                  isActive
                    ? "border-cyan shadow-[0_0_8px_rgba(94,169,209,0.2)]"
                    : "border-[#263445] hover:border-cyan"
                }`}
              >
                <div className="flex flex-col">
                  {/* Real button so keyboard users can select the epoch without
                      nesting interactive elements inside a role="button" card. */}
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-label={`${card.label} — ${isActive ? (playing ? "playing" : "paused") : "select and play"}`}
                    className="w-full cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none"
                    onClick={() => handleCardClick(card.epoch)}
                  >
                    {view === "ab" ? (
                      <>
                        <MiniStarfield
                          seed={card.seedA}
                          shiftX={card.shiftA}
                          shiftTo={isAnimating ? card.shiftB : undefined}
                          clock={isAnimating ? clock : undefined}
                          holdOnPause={isActive}
                          className="h-[46px] w-full"
                        />
                        <div className="h-px bg-[#22303f]" />
                        <MiniStarfield
                          seed={card.seedB}
                          shiftX={card.shiftB}
                          shiftTo={isAnimating ? card.shiftA : undefined}
                          clock={isAnimating ? clock : undefined}
                          holdOnPause={isActive}
                          className="h-[46px] w-full"
                        />
                      </>
                    ) : (
                      /* Subtraction residual — field stars cancel, the selected
                         target's motion + brightness change remain. */
                      <TargetDiffCanvas
                        frameA={{ seed: card.seedA, targetX: 80, brightness: 1 }}
                        frameB={{
                          seed: card.seedA,
                          targetX: 80 + shiftB,
                          brightness: brightnessB,
                        }}
                        className="h-[93px] w-full"
                      />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1 border-t border-[#1f2b38] bg-[#131c26] px-1 py-1 text-[8.5px] whitespace-nowrap text-[#9cb0c4]">
                  <button
                    type="button"
                    aria-label={isActive && playing ? `Pause ${card.label} time-lapse` : `Play ${card.label} time-lapse`}
                    className={`flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full border text-[7px] leading-none transition-colors ${
                      isActive && playing
                        ? "animate-pulse border-cyan-bright text-cyan-bright"
                        : "border-[#3a4e63] text-[#9cb0c4] hover:border-cyan-bright hover:text-cyan-bright"
                    }`}
                    onClick={() => handleTogglePlay(card.epoch)}
                  >
                    {isActive && playing ? "❚❚" : "▶"}
                  </button>
                  <span className="overflow-hidden text-ellipsis">{card.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
