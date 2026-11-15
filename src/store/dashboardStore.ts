import { create } from "zustand";
import { getObservatorySnapshot } from "@/lib/api/endpoints";
import { fetchMockSnapshot } from "@/lib/api/mock";
import type { DataSource, DiffMode, ObservatorySnapshot } from "@/lib/api/types";
import type { UrlViewState } from "@/lib/url/viewState";
import { VIEW_DEFAULTS } from "@/lib/url/viewState";

interface SkyCenter {
  ra: number;
  dec: number;
}

interface DashboardState {
  /* --- data --- */
  data: ObservatorySnapshot | null;
  source: DataSource;
  loadError: string | null;

  /* --- UI state --- */
  selectedStarId: string;
  selectedBand: number;
  activeBands: number[];
  activeEpoch: number;
  diffMode: DiffMode;
  selectedCandidateIdx: number;

  /* --- shareable atlas view state --- */
  viewCenter: SkyCenter | null;
  viewFov: number | null;
  /** True once the user deliberately changed the FoV (URL write gate). */
  viewFovTouched: boolean;
  embed: boolean;
  /** True once the URL-provided state has been applied (write-back gate). */
  urlHydrated: boolean;

  /* --- actions --- */
  loadData: () => Promise<void>;
  selectStar: (id: string) => void;
  setSelectedBand: (band: number) => void;
  toggleBand: (band: number) => void;
  setEpoch: (epoch: number) => void;
  setDiffMode: (mode: DiffMode) => void;
  selectCandidate: (index: number) => void;
  setViewCenter: (center: SkyCenter) => void;
  /** Live FoV readback; `touched` gates the URL write-back. */
  setViewFov: (fov: number, touched: boolean) => void;
  hydrateFromUrl: (state: UrlViewState) => void;
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  data: null,
  source: "loading",
  loadError: null,

  selectedStarId: "barnard",
  selectedBand: 18,
  activeBands: Array.from({ length: 12 }, (_, i) => 86 + i),
  activeEpoch: 0,
  diffMode: "diff",
  selectedCandidateIdx: 0,

  viewCenter: null,
  viewFov: null,
  viewFovTouched: false,
  embed: false,
  urlHydrated: false,

  loadData: async () => {
    set({ source: "loading", loadError: null });
    try {
      const data = await getObservatorySnapshot();
      const current = get();
      const starExists = data.stars.some((s) => s.id === current.selectedStarId);
      set({
        data,
        source: "api",
        selectedStarId: starExists ? current.selectedStarId : data.stars[0]?.id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const data = await fetchMockSnapshot();
      const current = get();
      const starExists = data.stars.some((s) => s.id === current.selectedStarId);
      set({
        data,
        source: "mock",
        loadError: message,
        selectedStarId: starExists ? current.selectedStarId : data.stars[0]?.id,
      });
    }
  },

  selectStar: (id) => set({ selectedStarId: id }),

  setSelectedBand: (band) => set({ selectedBand: band }),

  toggleBand: (band) =>
    set((state) => {
      const has = state.activeBands.includes(band);
      return {
        selectedBand: band,
        activeBands: has
          ? state.activeBands.filter((b) => b !== band)
          : [...state.activeBands, band],
      };
    }),

  setEpoch: (epoch) => set({ activeEpoch: epoch }),

  setDiffMode: (mode) => set({ diffMode: mode }),

  selectCandidate: (index) => set({ selectedCandidateIdx: index }),

  setViewCenter: (center) => set({ viewCenter: center }),

  setViewFov: (fov, touched) => set({ viewFov: fov, viewFovTouched: touched }),

  /** Applies URL-provided state once per page load (idempotent). */
  hydrateFromUrl: (state) => {
    if (get().urlHydrated) return;
    set((current) => ({
      urlHydrated: true,
      embed: state.embed,
      viewCenter:
        state.ra !== null && state.dec !== null
          ? { ra: state.ra, dec: state.dec }
          : current.viewCenter,
      viewFov: state.fov ?? current.viewFov,
      viewFovTouched: state.fov !== null,
      selectedBand: state.band ?? current.selectedBand,
      selectedStarId:
        state.star && state.star !== VIEW_DEFAULTS.star
          ? state.star
          : current.selectedStarId,
      activeEpoch: state.epoch ?? current.activeEpoch,
    }));
  },
}));
