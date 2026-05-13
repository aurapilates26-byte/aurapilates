"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    L?: {
      map: (
        element: HTMLElement,
        options?: { zoomControl?: boolean }
      ) => {
        setView: (coords: [number, number], zoom: number) => void;
        remove: () => void;
        invalidateSize: () => void;
      };
      tileLayer: (
        urlTemplate: string,
        options?: { attribution?: string; maxZoom?: number }
      ) => { addTo: (map: unknown) => void };
      marker: (coords: [number, number]) => {
        addTo: (map: unknown) => { bindPopup: (html: string) => void };
      };
    };
  }
}

const LEAFLET_CSS_ID = "leaflet-css-cdn";
const LEAFLET_SCRIPT_ID = "leaflet-js-cdn";
const STUDIO_POSITION: [number, number] = [36.7411865, 10.3009188];
const STUDIO_ZOOM = 16;

type LeafletMapInstance = {
  setView: (coords: [number, number], zoom: number) => void;
  remove: () => void;
  invalidateSize: () => void;
};

type ContactMapProps = {
  /** Colonne grille : meme hauteur que le formulaire (parent en flex / grid). */
  layout?: "default" | "split";
};

const mapMinHeight: Record<NonNullable<ContactMapProps["layout"]>, string> = {
  default: "min-h-[520px]",
  /** Colonne grille : hauteur fixée par le parent (alignée sur le formulaire) sur lg. */
  split: "min-h-[320px] lg:min-h-0",
};

export function ContactMap({ layout = "default" }: ContactMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  useEffect(() => {
    // Init unique Leaflet ; `layout` via ref (deps `[]` stables — evite erreurs Fast Refresh / HMR).
    const layoutMode = layoutRef.current;
    let mounted = true;
    let mapInstance: LeafletMapInstance | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const ensureLeafletCss = () => {
      if (document.getElementById(LEAFLET_CSS_ID)) {
        return;
      }

      const link = document.createElement("link");
      link.id = LEAFLET_CSS_ID;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "";
      document.head.appendChild(link);
    };

    const ensureLeafletScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.L) {
          resolve();
          return;
        }

        const existing = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error("Leaflet script failed")), {
            once: true,
          });
          return;
        }

        const script = document.createElement("script");
        script.id = LEAFLET_SCRIPT_ID;
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.crossOrigin = "";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Leaflet script failed"));
        document.body.appendChild(script);
      });

    const initMap = async () => {
      try {
        ensureLeafletCss();
        await ensureLeafletScript();

        if (!mounted || !containerRef.current || !window.L) {
          return;
        }

        mapInstance = window.L.map(containerRef.current, { zoomControl: true });
        mapInstance.setView(STUDIO_POSITION, STUDIO_ZOOM);

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapInstance);

        window.L.marker(STUDIO_POSITION)
          .addTo(mapInstance)
          .bindPopup("Aura Pilates Studio");

        const el = containerRef.current;
        if (layoutMode === "split" && el) {
          resizeObserver = new ResizeObserver(() => {
            mapInstance?.invalidateSize();
          });
          resizeObserver.observe(el);
        }

        requestAnimationFrame(() => {
          mapInstance?.invalidateSize();
        });
      } catch {
        // Keep graceful fallback UI if the map CDN cannot be loaded.
      }
    };

    void initMap();

    return () => {
      mounted = false;
      resizeObserver?.disconnect();
      mapInstance?.remove();
    };
  }, []);

  return (
    <div className="relative z-0 h-full min-h-0 overflow-hidden rounded-xl border border-brand-medium/30 bg-white shadow-sm">
      <div
        ref={containerRef}
        className={`h-full w-full bg-zinc-100 ${mapMinHeight[layout]}`}
        aria-label="Carte du studio"
      />
      <style jsx global>{`
        .leaflet-container,
        .leaflet-pane,
        .leaflet-top,
        .leaflet-bottom {
          z-index: 1 !important;
        }
      `}</style>
    </div>
  );
}
