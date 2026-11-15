"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { AladinCatalog, AladinHiPS } from "@/types/aladin";
import type { AladinInstance } from "@/types/aladin";

interface OverlayLayersProps {
  imRef: RefObject<AladinInstance | null>;
  disabled: boolean;
}

type LayerKind = "gaia" | "wise";

type LayerStatus = "off" | "on" | "loading" | "offline";

/** AllWISE color HiPS mirrors, tried in order (same pattern as the DSS chain). */
const WISE_HIPS_URLS = [
  "https://hips.china-vo.org/m/CDS_P_allWISE_color",
  "https://alasky.cds.unistra.fr/P/allWISE/color",
  "https://skies.esac.esa.int/AllWISE_RGB",
] as const;

const WISE_LAYER_KEY = "wise-overlay";
const WISE_LOAD_TIMEOUT_MS = 8000;

/** Gaia DR3 progressive HiPS catalog (CDS HiPS catalog service). */
const GAIA_CATALOG_URL = "https://axel.cds.unistra.fr/HiPSCatService/I/355/gaiadr3";
const GAIA_CATALOG_OPTIONS = {
  id: "gaia-dr3",
  name: "Gaia DR3",
  shape: "square",
  sourceSize: 6,
  color: "#7ab9e8",
};

const LAYERS: { kind: LayerKind; label: string; hint: string }[] = [
  { kind: "gaia", label: "GAIA", hint: "Gaia DR3 sources overlay" },
  { kind: "wise", label: "WISE", hint: "AllWISE color HiPS overlay" },
];

const buttonStyle = (status: LayerStatus): string =>
  `flex items-center gap-1 cursor-pointer rounded-[2px] border px-2 py-1 text-[9px] tracking-[0.06em] transition-colors ${
    status === "on"
      ? "border-cyan bg-[#192b3c] text-cyan-bright shadow-[inset_0_0_8px_rgba(94,169,209,0.18)]"
      : status === "offline"
        ? "cursor-not-allowed border-[#4a3b2e] bg-[#1a1712] text-[#8a7a64]"
        : "border-[#2e4054] bg-[#15202b] text-[#c2d1e0] hover:border-[#4d789c] hover:bg-[#1b2938] hover:text-white"
  }`;

/**
 * Optional telescope-data overlay layers (Gaia / WISE) stacked on top of the
 * base survey. Layers live in the Aladin instance; toggling only changes
 * visibility or removes the image layer, and a re-initialized atlas resets
 * them to "off".
 */
export function OverlayLayers({ imRef, disabled }: OverlayLayersProps) {
  const [status, setStatus] = useState<Record<LayerKind, LayerStatus>>({
    gaia: "off",
    wise: "off",
  });
  const gaiaCatalogRef = useRef<AladinCatalog | null>(null);
  const wiseHiPSRef = useRef<AladinHiPS | null>(null);

  // A re-initialized atlas (Retry) drops all layers — reflect that.
  useEffect(() => {
    if (disabled) return;
    gaiaCatalogRef.current = null;
    wiseHiPSRef.current = null;
    setStatus({ gaia: "off", wise: "off" });
  }, [disabled]);

  const removeWiseLayer = () => {
    const im = imRef.current;
    if (!im) return;
    const view = (im as unknown as {
      view?: { removeImageLayer?: (key: string) => void };
    }).view;
    view?.removeImageLayer?.(WISE_LAYER_KEY);
    wiseHiPSRef.current = null;
  };

  const loadWise = (attempt: number): void => {
    const im = imRef.current;
    const Aladin = window.A;
    if (!im || !Aladin || attempt >= WISE_HIPS_URLS.length) {
      setStatus((current) => ({ ...current, wise: "offline" }));
      return;
    }
    let settled = false;
    const finalize = (ok: boolean) => {
      if (settled) return;
      settled = true;
      if (ok && imRef.current === im) {
        setStatus((current) => ({ ...current, wise: "on" }));
        return;
      }
      loadWise(attempt + 1);
    };
    try {
      const hips = Aladin.imageHiPS(WISE_HIPS_URLS[attempt], {
        name: "AllWISE",
        successCallback: () => finalize(true),
        errorCallback: () => finalize(false),
      });
      wiseHiPSRef.current = hips;
      im.setOverlayImageLayer(hips, WISE_LAYER_KEY);
      // Mirrors may hang without invoking callbacks.
      window.setTimeout(() => finalize(false), WISE_LOAD_TIMEOUT_MS);
    } catch {
      finalize(false);
    }
  };

  const toggle = (kind: LayerKind) => {
    const im = imRef.current;
    const Aladin = window.A;
    if (!im || !Aladin || disabled) return;

    const turningOn = status[kind] !== "on";
    setStatus((current) => {
      const next = { ...current };
      if (kind === "gaia") {
        if (turningOn) {
          if (!gaiaCatalogRef.current) {
            gaiaCatalogRef.current = Aladin.catalogHiPS(
              GAIA_CATALOG_URL,
              GAIA_CATALOG_OPTIONS,
            );
            im.addCatalog(gaiaCatalogRef.current);
          } else {
            gaiaCatalogRef.current.show?.();
          }
          next.gaia = "on";
        } else {
          gaiaCatalogRef.current?.hide?.();
          next.gaia = "off";
        }
      } else if (turningOn) {
        next.wise = "loading";
      } else {
        removeWiseLayer();
        next.wise = "off";
      }
      return next;
    });

    if (kind === "wise" && turningOn) loadWise(0);
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[9px] tracking-wider text-text-muted">
        LAYERS
      </span>
      {LAYERS.map(({ kind, label, hint }) => (
        <button
          key={kind}
          type="button"
          aria-pressed={status[kind] === "on"}
          title={status[kind] === "offline" ? `${hint} — unreachable` : hint}
          disabled={disabled || status[kind] === "loading"}
          className={`${buttonStyle(status[kind])} disabled:cursor-wait disabled:opacity-60`}
          onClick={() => toggle(kind)}
        >
          {label}
          {status[kind] === "loading" && <span className="animate-pulse">…</span>}
          {status[kind] === "offline" && <span aria-hidden="true">✕</span>}
        </button>
      ))}
    </div>
  );
}
