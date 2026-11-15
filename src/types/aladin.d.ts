/**
 * Ambient types for Aladin Lite v3 (CDS sky atlas).
 * Loaded from CDN at runtime — the API surface we touch is deliberately small.
 *
 * v3 shape: `A.init` is a readiness Promise; the viewer is created with
 * `A.aladin(target, options)`.
 */

export {};

declare global {
  interface Window {
    A?: {
      /** Readiness promise (resolves once the WebGL/wasm core is ready). */
      init: Promise<void>;
      aladin: (
        target: HTMLElement | string,
        options?: Record<string, unknown>,
      ) => AladinInstance;
      /** HiPS-backed progressive catalog factory (e.g. Gaia DR3). */
      catalogHiPS: (
        url: string,
        options?: Record<string, unknown>,
      ) => AladinCatalog;
      /** HiPS image (survey or cutout) factory for overlay layers. */
      imageHiPS: (
        url: string,
        options?: Record<string, unknown>,
      ) => AladinHiPS;
    };
  }
}

/** Opaque catalog handle; visibility toggled with `hide`/`show`. */
export interface AladinCatalog {
  hide?: () => void;
  show?: () => void;
  isShowing?: boolean;
}

/** Opaque HiPS image handle for overlay layers. */
export interface AladinHiPS {
  layer?: string;
}

export interface AladinInstance {
  /** Project sky coordinates (degrees) to CSS pixels relative to the viewport. */
  world2pix: (ra: number, dec: number) => { 0: number; 1: number } | null;
  /** Project CSS pixels to sky coordinates (degrees). */
  pix2world: (x: number, y: number) => [number, number] | null;
  on: (event: string, handler: (payload?: unknown) => void) => void;
  remove: () => void;
  getSize: () => [number, number];
  /** Sky coordinates of the view center (J2000 degrees). */
  getRaDec: () => [number, number] | null;
  /** Horizontal and vertical field of view in degrees. */
  getFov: () => [number, number] | null;
  /** Set the horizontal field of view (degrees). */
  setFov: (fovDeg: number) => void;
  /** Move the view center to a target ("ra dec" in degrees). */
  gotoObject: (target: string) => void;
  /** Add a catalog (e.g. a HiPS catalog) to the view. */
  addCatalog: (catalog: AladinCatalog) => void;
  /** Stack a HiPS image layer on top of the base survey; keyed by name. */
  setOverlayImageLayer: (image: AladinHiPS, layer?: string) => AladinHiPS;
}

declare module "aladin-lite" {
  const Aladin: {
    /** Readiness promise (resolves once the WebGL/wasm core is ready). */
    init: Promise<void>;
    aladin: (
      target: HTMLElement | string,
      options?: Record<string, unknown>,
    ) => AladinInstance;
    catalogHiPS: (
      url: string,
      options?: Record<string, unknown>,
    ) => AladinCatalog;
    imageHiPS: (
      url: string,
      options?: Record<string, unknown>,
    ) => AladinHiPS;
  };
  export default Aladin;
}
