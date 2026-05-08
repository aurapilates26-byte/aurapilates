import { createAdminQrCode, listAdminQrCodes } from "./router/handlers";

export async function GET(request: Request) {
  return listAdminQrCodes(request);
}

export async function POST(request: Request) {
  return createAdminQrCode(request);
}
