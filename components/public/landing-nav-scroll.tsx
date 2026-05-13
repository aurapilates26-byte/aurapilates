"use client";

import { useEffect } from "react";
import { isPublicLandingSectionSlug } from "@/lib/public-sections";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.scrollIntoView({ block: "start", behavior: "instant" });
}

function sectionIdFromPathname(pathname: string): string | null {
  if (pathname === "/" || pathname === "") {
    return "accueil";
  }
  const segment = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  if (!segment || segment.includes("/")) {
    return null;
  }
  return isPublicLandingSectionSlug(segment) ? segment : null;
}

function applyScrollFromLocation() {
  const id = sectionIdFromPathname(window.location.pathname);
  if (id) {
    scrollToId(id);
  }
}

/**
 * Scroll vers la section après navigation (/coach, /tarif, etc.).
 * N’utilise pas `usePathname` : avec Next 15 + Turbopack cela peut provoquer
 * « Router action dispatched before initialization ». On lit l’URL et on
 * réagit aux changements d’historique (pushState / replaceState / popstate).
 */
export function LandingNavScroll() {
  useEffect(() => {
    const schedule = () => {
      queueMicrotask(applyScrollFromLocation);
    };

    const t0 = window.setTimeout(schedule, 0);
    const t1 = window.setTimeout(applyScrollFromLocation, 80);

    const nativePushState = history.pushState;
    const nativeReplaceState = history.replaceState;

    history.pushState = function pushStateWrapped(
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      nativePushState.call(history, data, unused, url);
      schedule();
    };

    history.replaceState = function replaceStateWrapped(
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      nativeReplaceState.call(history, data, unused, url);
      schedule();
    };

    window.addEventListener("popstate", schedule);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      history.pushState = nativePushState;
      history.replaceState = nativeReplaceState;
      window.removeEventListener("popstate", schedule);
    };
  }, []);

  return null;
}
