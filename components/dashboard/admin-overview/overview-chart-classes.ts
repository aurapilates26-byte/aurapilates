import styles from "@/components/dashboard/admin-overview/admin-overview-dashboard.module.css";

type CssModule = Record<string, string>;

function occupancyScaleKey(pct: number): keyof CssModule {
  const clamped = Math.min(100, Math.max(0, Math.round(pct / 5) * 5));
  return `occupancyScale${clamped}` as keyof CssModule;
}

export function occupancyBarScaleClass(pct: number): string {
  const key = occupancyScaleKey(pct);
  return `${styles.occupancyBar} ${styles[key] ?? styles.occupancyScale0}`;
}

/** Largeur relative (0–100 %) pour barres horizontales. */
export function horizontalBarScaleClass(pct: number): string {
  const key = occupancyScaleKey(pct);
  return `${styles.hBarFill} ${styles[key] ?? styles.occupancyScale0}`;
}

export { styles as overviewStyles };
