import { createHash, randomBytes, randomInt } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { Prisma, QrCodeStatus } from "@prisma/client";
import JSZip from "jszip";
import QRCode from "qrcode";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  createQrCodeSchema,
  downloadQrCodeQuerySchema,
  listQrCodeQuerySchema,
  updateQrCodeSchema,
} from "./schemas";
import { compareQrCodesBySequenceName } from "@/lib/qr-code-name";
import { prisma as db } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function tooManyRequestsResponse(retryAfterSeconds: number) {
  return Response.json(
    {
      error: "Trop de générations de QR code. Veuillez réessayer dans quelques instants.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}

async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: errorResponse("Unauthorized", 401) };
  }

  if (!isStaffRole(session.user.role)) {
    return { error: errorResponse("Forbidden", 403) };
  }

  return { session };
}

function buildPublicId() {
  const seed = `${Date.now()}-${randomBytes(16).toString("hex")}`;
  return createHash("sha256").update(seed).digest("hex").slice(0, 24);
}

function buildQrKey() {
  // 4 digits, cryptographically random (non-sequential).
  return String(randomInt(0, 10_000)).padStart(4, "0");
}

async function buildUniqueQrKey() {
  // Keep retrying random 4-digit keys to avoid collisions.
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = buildQrKey();
    const existing = await db.qrCode.findFirst({
      where: { qrKey: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("QR_KEY_POOL_EXHAUSTED");
}

function buildQrImageUrl(publicId: string) {
  return `/qrcode/${publicId}`;
}

function getRequestOrigin(request: Request) {
  try {
    const url = new URL(request.url);
    return url.origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function buildPublicScanUrl(publicId: string, request: Request) {
  const requestOrigin = getRequestOrigin(request);

  // Deep-audit safety:
  // - If you generate from localhost, always encode localhost in the QR,
  //   even if NEXT_PUBLIC_SITE_URL is mistakenly set to production.
  if (requestOrigin && isLocalOrigin(requestOrigin)) {
    return `${requestOrigin.replace(/\/+$/, "")}/id/${publicId}`;
  }

  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    requestOrigin ??
    "https://aurapilates.tn";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  return `${baseUrl}/id/${publicId}`;
}

async function writeQrCodeFile(params: {
  publicId: string;
  targetUrl: string; // Contenu encode dans le QR (scan URL)
}) {
  const outputDir = join(process.cwd(), "public", "qrcode");
  await mkdir(outputDir, { recursive: true });

  const outputPath = join(outputDir, `${params.publicId}.png`);

  const pngBuffer = await QRCode.toBuffer(params.targetUrl, {
    width: 512,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    margin: 1,
  });
  await writeFile(outputPath, pngBuffer);
}

function mapQrCode(
  record: {
  id: string;
  publicId: string;
  name: string;
  status: QrCodeStatus;
  assignedMemberId: string | null;
  createdByUserId: string;
  assignedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  },
  request: Request
) {
  const version = record.updatedAt.getTime();
  return {
    publicId: record.publicId,
    name: record.name,
    status: record.status,
    assignedMemberId: record.assignedMemberId,
    createdByUserId: record.createdByUserId,
    assignedAt: record.assignedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    // Cache-buster: fixes "image not shown until refresh" after generation.
    imageUrl: `${buildQrImageUrl(record.publicId)}?v=${version}`,
    scanUrl: buildPublicScanUrl(record.publicId, request),
  };
}

export async function listAdminQrCodes(request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const url = new URL(request.url);
  const parsedQuery = listQrCodeQuerySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    assignment: url.searchParams.get("assignment") ?? undefined,
    page: url.searchParams.get("page") ?? "1",
    pageSize: url.searchParams.get("pageSize") ?? "10",
  });

  if (!parsedQuery.success) {
    return errorResponse("Invalid query parameters", 400);
  }

  const { search, status, assignment, page, pageSize } = parsedQuery.data;

  const where: Prisma.QrCodeWhereInput = {
    ...(status ? { status } : {}),
    ...(assignment === "ASSIGNED"
      ? { assignedMemberId: { not: null } }
      : assignment === "UNASSIGNED"
        ? { assignedMemberId: null }
        : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { publicId: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [matchingRows, total, assignedCount, unassignedCount] = await Promise.all([
    db.qrCode.findMany({
      where,
      select: { id: true, name: true },
    }),
    db.qrCode.count({ where }),
    db.qrCode.count({
      where: {
        ...where,
        assignedMemberId: { not: null },
      },
    }),
    db.qrCode.count({
      where: {
        ...where,
        assignedMemberId: null,
      },
    }),
  ]);

  const sortedIds = [...matchingRows]
    .sort(compareQrCodesBySequenceName)
    .slice((page - 1) * pageSize, page * pageSize)
    .map((row) => row.id);

  const pageRows =
    sortedIds.length > 0
      ? await db.qrCode.findMany({
          where: { id: { in: sortedIds } },
        })
      : [];

  const rowsById = new Map(pageRows.map((row) => [row.id, row]));
  const orderedItems = sortedIds
    .map((id) => rowsById.get(id))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  return Response.json({
    items: orderedItems.map((item) => mapQrCode(item, request)),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      assignedCount,
      unassignedCount,
    },
  });
}

export async function createAdminQrCode(request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const rateLimit = checkRateLimit(`admin-qrcode-create:${sessionResult.session.user.id}`, {
    maxRequests: 30,
    windowMs: 5 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return tooManyRequestsResponse(rateLimit.retryAfterSeconds);
  }

  const rawBody = await request.json().catch(() => null);
  const parsedBody = createQrCodeSchema.safeParse(rawBody);

  if (!parsedBody.success) {
    return errorResponse("Invalid request payload", 400);
  }

  const data = parsedBody.data;
  const createdItems = [];

  for (let index = 0; index < data.quantity; index += 1) {
    const padWidth = data.quantity > 1 ? Math.max(2, String(data.quantity).length) : 0;
    const numberedName =
      data.quantity > 1 ? `${data.name} ${String(index + 1).padStart(padWidth, "0")}` : data.name;
    const publicId = buildPublicId();
    const qrKey = await buildUniqueQrKey();
    const scanUrl = buildPublicScanUrl(publicId, request);
    const created = await db.qrCode.create({
      data: {
        publicId,
        qrKey,
        name: numberedName,
        status: QrCodeStatus.DRAFT,
        assignedMember: data.assignedMemberId ? { connect: { id: data.assignedMemberId } } : undefined,
        assignedAt: data.assignedMemberId ? new Date() : null,
        createdByUser: { connect: { id: sessionResult.session.user.id } },
      },
    });

    await writeQrCodeFile({
      publicId,
      // On encode dans l'image un lien de scan public ne revelant aucune info sensible.
      targetUrl: scanUrl,
    });

    createdItems.push(mapQrCode(created, request));
  }

  return Response.json({ items: createdItems }, { status: 201 });
}

export async function getAdminQrCodeByPublicId(publicId: string, request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const item = await db.qrCode.findUnique({
    where: { publicId },
  });

  if (!item) {
    return errorResponse("QR code not found", 404);
  }

  return Response.json({ item: mapQrCode(item, request) });
}

export async function updateAdminQrCodeByPublicId(publicId: string, request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const rawBody = await request.json().catch(() => null);
  const parsedBody = updateQrCodeSchema.safeParse(rawBody);

  if (!parsedBody.success) {
    return errorResponse("Invalid request payload", 400);
  }

  const data = parsedBody.data;

  const existing = await db.qrCode.findUnique({
    where: { publicId },
    select: { id: true },
  });

  if (!existing) {
    return errorResponse("QR code not found", 404);
  }

  const updated = await db.qrCode.update({
    where: { publicId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.assignedMemberId !== undefined
        ? data.assignedMemberId
          ? { assignedMember: { connect: { id: data.assignedMemberId } } }
          : { assignedMember: { disconnect: true } }
        : {}),
      ...(data.assignedMemberId !== undefined
        ? data.assignedMemberId
          ? { assignedAt: new Date() }
          : { assignedAt: null }
        : {}),
    },
  });

  return Response.json({ item: mapQrCode(updated, request) });
}

export async function getAdminQrKeyByPublicId(publicId: string) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const item = await db.qrCode.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      qrKey: true,
      assignedMemberId: true,
    },
  });

  if (!item) {
    return errorResponse("QR code not found", 404);
  }

  // Only reveal qrKey in secured admin context.
  return Response.json({
    qrId: item.publicId,
    assignmentStatus: item.assignedMemberId ? "ASSIGNED" : "UNASSIGNED",
    assignedMemberId: item.assignedMemberId,
    qrKey: item.qrKey,
  });
}

export async function deleteAdminQrCodeByPublicId(publicId: string) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const existing = await db.qrCode.findUnique({
    where: { publicId },
    select: { id: true, publicId: true },
  });

  if (!existing) {
    return errorResponse("QR code not found", 404);
  }

  await db.qrCode.delete({
    where: { id: existing.id },
  });

  const imagePath = join(process.cwd(), "public", "qrcode", `${existing.publicId}.png`);
  await unlink(imagePath).catch(() => {
    // Keep API resilient if file was already removed manually.
  });

  return Response.json({ success: true });
}

const DOWNLOAD_MAX_CODES = 2000;

export async function downloadAdminQrCodesZip(request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const url = new URL(request.url);
  const parsedQuery = downloadQrCodeQuerySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    assignment: url.searchParams.get("assignment") ?? "ALL",
  });

  if (!parsedQuery.success) {
    return errorResponse("Paramètres d'export invalides.", 400);
  }

  const { search, status, assignment } = parsedQuery.data;

  const where: Prisma.QrCodeWhereInput = {
    ...(status ? { status } : {}),
    ...(assignment === "ASSIGNED"
      ? { assignedMemberId: { not: null } }
      : assignment === "UNASSIGNED"
        ? { assignedMemberId: null }
        : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { publicId: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const records = await db.qrCode.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: { publicId: true },
    take: DOWNLOAD_MAX_CODES,
  });

  if (records.length === 0) {
    return errorResponse("Aucun QR code à exporter pour ces filtres.", 404);
  }

  const zip = new JSZip();
  const folder = zip.folder("qrcode");
  let added = 0;
  let regeneratedFromDb = 0;
  let skipped = 0;

  const qrPngOptions = {
    width: 512,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    margin: 1,
  } as const;

  for (const row of records) {
    const imagePath = join(process.cwd(), "public", "qrcode", `${row.publicId}.png`);
    const targetUrl = buildPublicScanUrl(row.publicId, request);
    let buf: Buffer | null = null;
    try {
      buf = await readFile(imagePath);
    } catch {
      try {
        buf = await QRCode.toBuffer(targetUrl, qrPngOptions);
        regeneratedFromDb += 1;
      } catch {
        buf = null;
      }
    }
    if (buf) {
      folder?.file(`${row.publicId}.png`, buf);
      added += 1;
    } else {
      skipped += 1;
    }
  }

  if (added === 0) {
    return errorResponse("Aucune image PNG trouvée sur le serveur pour ces QR codes.", 404);
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const day = new Date().toISOString().slice(0, 10);
  const filename = `aurapilates-qrcodes-${day}.zip`;

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Qr-Zip-Count": String(added),
      "X-Qr-Zip-Total-Db": String(records.length),
      "X-Qr-Zip-Regenerated": String(regeneratedFromDb),
      "X-Qr-Zip-Skipped": String(skipped),
    },
  });
}
