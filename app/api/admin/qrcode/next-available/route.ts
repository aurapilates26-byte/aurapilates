import { getNextAvailableAdminQrCode } from "../router/handlers";

export async function GET() {
  return getNextAvailableAdminQrCode();
}
