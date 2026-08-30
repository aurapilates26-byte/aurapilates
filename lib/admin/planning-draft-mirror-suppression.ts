import "server-only";

import { prisma } from "@/lib/prisma";

/** Marque un créneau publié comme retiré du brouillon en cours. */
export async function suppressDraftMirrorForPublishedSource(publishedSourceId: string): Promise<void> {
  await prisma.planning.update({
    where: { id: publishedSourceId },
    data: { draftMirrorSuppressedAt: new Date() },
  });
}

/** Réinitialise les suppressions (nouveau brouillon ou effacement du brouillon). */
export async function clearAllDraftMirrorSuppressions(): Promise<void> {
  await prisma.planning.updateMany({
    where: { draftMirrorSuppressedAt: { not: null } },
    data: { draftMirrorSuppressedAt: null },
  });
}
