/**
 * Fonds de carte planning (grille admin) — palette émotionnelle AURA.
 * Crème #F6E9E2 · Rose poudré #EBC4C6 · Rose ancien #D4A1A8 ·
 * Mauve rosé #B57A83 · Baie #7A3E4D · Chocolat #4A2E2A
 * Tons lavés pour garder le contraste du texte brand-dark.
 */
export function planningCourseCardToneClass(courseSlug: string): string {
  switch (courseSlug) {
    case "pilates-reformer":
      // Rose poudré — cours signature
      return "border-[#D4A1A8]/55 bg-[#EBC4C6]/45";
    case "mat-pilates":
      // Crème → rose poudré léger
      return "border-[#EBC4C6]/50 bg-[#F6E9E2]/95";
    case "yoga":
    case "cours-de-yoga":
      // Rose ancien
      return "border-[#B57A83]/40 bg-[#D4A1A8]/28";
    case "dance":
    case "cours-de-dance":
      // Mauve rosé
      return "border-[#B57A83]/50 bg-[#B57A83]/22";
    case "coaching-prive":
      // Baie (lavé)
      return "border-[#7A3E4D]/35 bg-[#7A3E4D]/12";
    case "sans-cours":
      // Crème neutre
      return "border-[#EBC4C6]/35 bg-[#F6E9E2]/80";
    default:
      return "border-[#D4A1A8]/30 bg-[#F6E9E2]/70";
  }
}
