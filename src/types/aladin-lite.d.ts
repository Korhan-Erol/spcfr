/**
 * Ambient module declaration for `aladin-lite` (npm package).
 * The package ships plain JS without types; declare the small API surface
 * we use. Shape is structurally compatible with `AladinInstance` in
 * `./aladin.d.ts`.
 */

declare module "aladin-lite" {
  export interface AladinLiteInstance {
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
    /** Add a catalog to the view. */
    addCatalog: (catalog: AladinCatalogLike) => void;
    /** Stack a HiPS image layer on top of the base survey. */
    setOverlayImageLayer: (
      image: AladinHiPSLike,
      layer?: string,
    ) => AladinHiPSLike;
  }

  /** Minimal structural aliases (full shapes live in ./aladin.d.ts). */
  export interface AladinCatalogLike {
    hide?: () => void;
    show?: () => void;
  }
  export interface AladinHiPSLike {
    layer?: string;
  }

  export interface AladinLiteModule {
    /** Readiness promise (resolves once the WebGL/wasm core is ready). */
    init: Promise<void>;
    aladin: (
      target: HTMLElement | string,
      options?: Record<string, unknown>,
    ) => AladinLiteInstance;
    /** HiPS-backed progressive catalog factory (e.g. Gaia DR3). */
    catalogHiPS: (
      url: string,
      options?: Record<string, unknown>,
    ) => AladinCatalogLike;
    /** HiPS image factory for overlay layers. */
    imageHiPS: (
      url: string,
      options?: Record<string, unknown>,
    ) => AladinHiPSLike;
  }

  const Aladin: AladinLiteModule;
  export default Aladin;
}
