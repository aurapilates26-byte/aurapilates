import { getAdminQrKeyByPublicId } from "../../router/handlers";

type Params = {
  params: Promise<{ publicId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { publicId } = await params;
  return getAdminQrKeyByPublicId(publicId);
}

