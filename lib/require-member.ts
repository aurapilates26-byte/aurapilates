import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function requireMemberSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: jsonError("Non autorisé", 401) } as const;
  }
  if (session.user.role !== "MEMBRE") {
    return { error: jsonError("Accès réservé aux membres", 403) } as const;
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!member) {
    return { error: jsonError("Profil membre introuvable", 404) } as const;
  }

  return { session, member } as const;
}
