import { DashboardHeader } from "@/components/dashboard/header";
import { QrCodeHeaderActions } from "@/components/dashboard/qr-code-header-actions";
import { QrCodeManager } from "@/components/dashboard/qr-code-manager";
import { requireRole } from "@/lib/auth";

export default async function AdminQrCodePage() {
  await requireRole("ADMIN");

  return (
    <div className="space-y-6">
      <DashboardHeader
        role="ADMIN"
        showRoleLine={false}
        title="QR codes"
        description="Préparez ici les QR codes pour l'accès, le pointage et le suivi des séances. Cette étape reste volontairement concentrée sur l'interface avant l'intégration backend."
        actions={<QrCodeHeaderActions />}
      />

      <QrCodeManager />
    </div>
  );
}

