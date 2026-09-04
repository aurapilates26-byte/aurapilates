/** Packs encore débitables : un solde à 0 ne doit pas apparaître dans la modale. */
export function selectBookablePackOptions<T extends { remainingForCourse: number }>(items: T[]): T[] {
  return items.filter((item) => item.remainingForCourse > 0);
}
