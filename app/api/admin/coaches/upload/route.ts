import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isSuperAdminRole } from "@/lib/admin/access";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireSuperAdminUpload() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: errorResponse("Unauthorized", 401) };
  if (!isSuperAdminRole(session.user.role)) {
    return { error: errorResponse("Accès réservé à la direction", 403) };
  }
  return { session };
}

function extensionFromMimeType(type: string) {
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return "";
}

export async function POST(request: Request) {
  const guard = await requireSuperAdminUpload();
  if ("error" in guard) return guard.error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return errorResponse("Aucun fichier image fourni.", 400);
  }
  if (!file.type.startsWith("image/")) {
    return errorResponse("Le fichier doit être une image.", 400);
  }
  if (file.size > 2 * 1024 * 1024) {
    return errorResponse("L'image dépasse 2 Mo.", 400);
  }

  const ext = extensionFromMimeType(file.type) || path.extname(file.name) || ".jpg";
  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const publicCoachDir = path.join(process.cwd(), "public", "coach");
  const diskPath = path.join(publicCoachDir, fileName);

  await mkdir(publicCoachDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(diskPath, Buffer.from(arrayBuffer));

  return Response.json({ imageUrl: `/coach/${fileName}` }, { status: 201 });
}
