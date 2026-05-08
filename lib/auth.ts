import "server-only";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/connexion");
  }

  return session;
}

export async function requireRole(expectedRole: "ADMIN" | "MEMBRE") {
  const session = await requireUser();

  if (session.user.role !== expectedRole) {
    redirect("/dashboard");
  }

  return session;
}
