import { createAdminMember, listAdminMembers } from "./router/handlers";

export async function GET(request: Request) {
  return listAdminMembers(request);
}

export async function POST(request: Request) {
  return createAdminMember(request);
}

