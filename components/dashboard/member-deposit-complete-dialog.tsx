"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { PaymentMethodBadge } from "@/components/dashboard/payment-method-badge";
import {
  PACK_PAYMENT_METHODS,
  PACK_PAYMENT_METHOD_LABELS,
  type PackPaymentMethodValue,
} from "@/lib/pack-payment-method";

type DepositMember = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pack: { name: string } | null;
  expectedPackAmountDinars: number | null;
  totalPaidDinars: number | null;
  remainingDinars: number | null;
  depositPaymentMethod: "CASH" | "CHECK" | "TPE" | null;
};

type MemberDepositCompleteDialogProps = {
  member: DepositMember | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (qrId: string, paymentMethod: PackPaymentMethodValue) => void;
};

export function MemberDepositCompleteDialog({
  member,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: MemberDepositCompleteDialogProps) {
  const [qrId, setQrId] = useState("");
  const [qrKey, setQrKey] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isFetchingQr, setIsFetchingQr] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PackPaymentMethodValue>("CASH");

  useEffect(() => {
    if (!isOpen) {
      setQrId("");
      setQrKey(null);
      setQrError(null);
      setPaymentMethod("CASH");
    }
  }, [isOpen]);

  const fetchQrKey = useCallback(async (publicId: string) => {
    const trimmed = publicId.trim();
    if (trimmed.length < 10) {
      setQrKey(null);
      setQrError(null);
      return;
    }
    setIsFetchingQr(true);
    setQrError(null);
    try {
      const response = await fetch(`/api/admin/qrcode/${encodeURIComponent(trimmed)}/key`, {
        cache: "no-store",
      });
      if (!response.ok) {
        setQrKey(null);
        setQrError("QR introuvable ou non disponible.");
        return;
      }
      const data = (await response.json()) as { qrKey?: string; assignedMemberId?: string | null };
      if (data.assignedMemberId && data.assignedMemberId !== member?.id) {
        setQrKey(null);
        setQrError("Ce QR est déjà assigné à un autre adhérent.");
        return;
      }
      setQrKey(data.qrKey ?? null);
    } catch {
      setQrError("Impossible de charger la clé QR.");
    } finally {
      setIsFetchingQr(false);
    }
  }, [member?.id]);

  useEffect(() => {
    const trimmed = qrId.trim();
    if (!isOpen || trimmed.length < 10) return;
    const timer = window.setTimeout(() => void fetchQrKey(trimmed), 400);
    return () => window.clearTimeout(timer);
  }, [qrId, isOpen, fetchQrKey]);

  const displayName = member
    ? `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || "Adhérent"
    : "";

  return (
    <Modal
      isOpen={isOpen}
      title="Finaliser l'acompte"
      description={
        member
          ? `${displayName} — solde à encaisser : ${member.remainingDinars ?? 0} DT`
          : undefined
      }
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:opacity-60"
          >
            Annuler
          </button>
          <Button
            type="button"
            disabled={isSubmitting || qrId.trim().length < 10 || Boolean(qrError)}
            onClick={() => onConfirm(qrId.trim(), paymentMethod)}
          >
            {isSubmitting ? "Validation..." : "Encaisser le solde et activer"}
          </Button>
        </>
      }
    >
      {member ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/80 px-3 py-2 text-xs text-brand-dark/75">
            <p>
              Pack : <span className="font-semibold">{member.pack?.name ?? "—"}</span>
            </p>
            <p>
              Total attendu : <span className="font-semibold">{member.expectedPackAmountDinars ?? 0} DT</span>
            </p>
            <p>
              Déjà encaissé (acompte) : <span className="font-semibold">{member.totalPaidDinars ?? 0} DT</span>
            </p>
            <p className="flex flex-wrap items-center gap-1.5">
              Moyen de l&apos;acompte : <PaymentMethodBadge method={member.depositPaymentMethod} />
            </p>
            <p>
              Solde à encaisser maintenant :{" "}
              <span className="font-semibold text-brand-dark">{member.remainingDinars ?? 0} DT</span>
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-dark">Moyen de paiement du solde *</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PACK_PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    paymentMethod === method
                      ? "bg-brand-dark text-white"
                      : "border border-brand-medium/30 bg-white text-brand-dark"
                  }`}
                >
                  {PACK_PAYMENT_METHOD_LABELS[method]}
                </button>
              ))}
            </div>
          </div>
          <Input
            id="complete-deposit-qr"
            label="Identifiant QR *"
            value={qrId}
            onChange={(e) => setQrId(e.target.value)}
            placeholder="Public ID du QR code"
          />
          <div>
            <p className="text-sm font-medium text-brand-dark">Clé QR</p>
            <p className="mt-2 min-h-[42px] rounded-xl border border-brand-medium/35 bg-zinc-50 px-4 py-2.5 text-sm text-brand-dark/80">
              {isFetchingQr ? "Chargement..." : qrKey ?? "—"}
            </p>
          </div>
          {qrError ? (
            <p className="text-sm text-red-700">{qrError}</p>
          ) : (
            <p className="text-xs text-brand-dark/60">
              Le solde sera enregistré en caisse (badge « solde ») avec le moyen de paiement choisi.
            </p>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
