"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description={description}
      onClose={isConfirming ? () => undefined : onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>
          <Button
            onClick={onConfirm}
            disabled={isConfirming}
            className="border-brand-dark/30 bg-brand-dark text-white hover:bg-brand-dark/90"
          >
            {isConfirming ? "Suppression…" : confirmText}
          </Button>
        </>
      }
    />
  );
}

