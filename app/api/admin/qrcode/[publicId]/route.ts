import { deleteAdminQrCodeByPublicId, getAdminQrCodeByPublicId, updateAdminQrCodeByPublicId } from "../router/handlers";

type Params = {
  params: Promise<{ publicId: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { publicId } = await params;
  return getAdminQrCodeByPublicId(publicId, request);
}

export async function PATCH(request: Request, { params }: Params) {
  const { publicId } = await params;
  return updateAdminQrCodeByPublicId(publicId, request);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { publicId } = await params;
  return deleteAdminQrCodeByPublicId(publicId);
}
