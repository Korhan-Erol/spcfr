"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import {
  parseUrlViewState,
  viewStateToSearchParams,
  type UrlViewState,
} from "@/lib/url/viewState";

type RawParams = Record<string, string | string[] | undefined>;

/** Debounce so panning/zooming does not spam history entries. */
const WRITE_BACK_DELAY_MS = 300;

/**
 * Keeps the dashboard state and the query string in sync:
 *
 * 1. On mount, hydrate the store from URL params (share/deep link support).
 * 2. Afterwards, write non-default view state back to the URL with
 *    `history.replaceState` — so copying the address bar shares the view.
 */
export function useUrlStateSync(urlParams: RawParams) {
  const hydrateFromUrl = useDashboardStore((s) => s.hydrateFromUrl);

  const viewCenter = useDashboardStore((s) => s.viewCenter);
  const viewFov = useDashboardStore((s) => s.viewFov);
  const viewFovTouched = useDashboardStore((s) => s.viewFovTouched);
  const selectedBand = useDashboardStore((s) => s.selectedBand);
  const selectedStarId = useDashboardStore((s) => s.selectedStarId);
  const activeEpoch = useDashboardStore((s) => s.activeEpoch);
  const embed = useDashboardStore((s) => s.embed);
  const urlHydrated = useDashboardStore((s) => s.urlHydrated);

  // 1) One-shot hydration from the server-provided search params.
  useEffect(() => {
    hydrateFromUrl(parseUrlViewState(urlParams));
    // URL params are constant for a given navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrateFromUrl]);

  // 2) Debounced write-back of the current view state.
  useEffect(() => {
    if (!urlHydrated) return;
    const state: UrlViewState = {
      ra: viewCenter?.ra ?? null,
      dec: viewCenter?.dec ?? null,
      // FoV reaches the URL only when the user deliberately changed it.
      fov: viewFovTouched ? viewFov : null,
      band: selectedBand,
      star: selectedStarId,
      epoch: activeEpoch,
      embed,
    };
    const timer = window.setTimeout(() => {
      const query = viewStateToSearchParams(state);
      const url = query.size > 0 ? `${location.pathname}?${query}` : location.pathname;
      window.history.replaceState(null, "", url);
    }, WRITE_BACK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [
    urlHydrated,
    viewCenter,
    viewFov,
    viewFovTouched,
    selectedBand,
    selectedStarId,
    activeEpoch,
    embed,
  ]);
}
