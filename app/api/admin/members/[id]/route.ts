import {
  deleteAdminMemberById,
  getAdminMemberById,
  updateAdminMemberById,
} from "../router/handlers";

type Params = {
  params: Promise<{ id: string }>;
};

async function runUpdate(id: string, request: Request) {
  try {
    return await updateAdminMemberById(id, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message.includes("already assigned") ? 409 : message.includes("not found") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return getAdminMemberById(id);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  return runUpdate(id, request);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return runUpdate(id, request);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return deleteAdminMemberById(id);
}
