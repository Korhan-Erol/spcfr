/** Idempotent loading of external scripts / stylesheets (e.g. Aladin Lite). */

const scriptCache = new Map<string, Promise<void>>();
const styleCache = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  const cached = scriptCache.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });

  scriptCache.set(src, promise);
  return promise;
}

export function loadStylesheet(href: string): Promise<void> {
  const cached = styleCache.get(href);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
    document.head.appendChild(link);
  });

  styleCache.set(href, promise);
  return promise;
}
