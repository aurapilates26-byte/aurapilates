import { renewAdminMemberPackById } from "../../router/handlers";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    return await renewAdminMemberPackById(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message.includes("Record to update not found") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}
