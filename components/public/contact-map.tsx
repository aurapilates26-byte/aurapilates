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
const DEFAULT_POSITION: [number, number] = [36.8065, 10.1815];

export function ContactMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let mapInstance: { remove: () => void } | null = null;

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
        mapInstance.setView(DEFAULT_POSITION, 14);

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapInstance);

        window.L.marker(DEFAULT_POSITION)
          .addTo(mapInstance)
          .bindPopup("Aura Pilates Studio");
      } catch {
        // Keep graceful fallback UI if the map CDN cannot be loaded.
      }
    };

    void initMap();

    return () => {
      mounted = false;
      mapInstance?.remove();
    };
  }, []);

  return (
    <div className="relative z-0 h-full overflow-hidden rounded-xl border border-brand-medium/30 bg-white shadow-sm">
      <div ref={containerRef} className="h-full min-h-[520px] w-full bg-zinc-100" aria-label="Carte du studio" />
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
