import { downloadAdminQrCodesZip } from "../router/handlers";

export async function GET(request: Request) {
  return downloadAdminQrCodesZip(request);
}
