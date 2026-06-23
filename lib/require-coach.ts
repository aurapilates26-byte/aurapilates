import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function requireCoachSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: jsonError("Non autorisé", 401) } as const;
  }
  if (session.user.role !== "COACH") {
    return { error: jsonError("Accès réservé aux coachs", 403) } as const;
  }

  const coach = await prisma.coach.findUnique({
    where: { userId: session.user.id },
    select: { id: true, isActive: true },
  });

  if (!coach) {
    return { error: jsonError("Profil coach introuvable", 404) } as const;
  }
  if (!coach.isActive) {
    return { error: jsonError("Compte coach inactif", 403) } as const;
  }

  return { session, coach } as const;
}
