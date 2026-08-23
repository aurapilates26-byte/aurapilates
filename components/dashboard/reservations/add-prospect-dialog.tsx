"use client";

import { useEffect, useState } from "react";
import { Button, Input, Modal } from "@/components/ui";

type AddProspectDialogProps = {
  isOpen: boolean;
  courseLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (data: { firstName: string; lastName: string; phone: string }) => void;
};

export function AddProspectDialog({
  isOpen,
  courseLabel,
  isSubmitting,
  onClose,
  onConfirm,
}: AddProspectDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFirstName("");
      setLastName("");
      setPhone("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (firstName.trim().length < 2) {
      setError("Le prénom est obligatoire (2 caractères minimum).");
      return;
    }
    if (lastName.trim().length < 2) {
      setError("Le nom est obligatoire (2 caractères minimum).");
      return;
    }
    if (phone.trim().length < 6) {
      setError("Le téléphone est obligatoire.");
      return;
    }
    setError(null);
    onConfirm({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Ajouter un prospect"
      description="Séance d'essai pour une personne non adhérente. Occupe une place sur le créneau."
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-brand-medium/30 bg-white px-5 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:opacity-60"
          >
            Annuler
          </button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Ajout..." : "Ajouter"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Input
          id="prospect-first-name"
          label="Prénom *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          id="prospect-last-name"
          label="Nom *"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <Input
          id="prospect-phone"
          label="Téléphone *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input id="prospect-course" label="Cours" value={courseLabel} readOnly disabled />
      </div>
    </Modal>
  );
}
