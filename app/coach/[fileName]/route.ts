import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ fileName: string }>;
};

function contentTypeFromExtension(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

export async function GET(_request: Request, { params }: Params) {
  const { fileName } = await params;

  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    return new Response("Not found", { status: 404 });
  }

  const diskPath = path.join(process.cwd(), "public", "coach", fileName);

  try {
    const fileBuffer = await readFile(diskPath);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentTypeFromExtension(fileName),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
