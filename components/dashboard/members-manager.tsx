"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Button, Checkbox, ConfirmDialog, Input, Modal, SelectMenu } from "@/components/ui";
import { addPackDurationToStartDate } from "@/lib/pack-duration";

export type MembersManagerHandle = {
  refresh: () => void;
};
type MembersManagerProps = {
  viewMode: "list" | "form";
  onChangeViewMode: (mode: "list" | "form") => void;
};

type MemberItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  pack: { id: string; name: string; durationDays: string | null } | null;
  packStartedAt: string | null;
  packExpiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  qrCode:
    | {
        qrId: string;
        status: string;
        updatedAt: string;
      }
    | null;
};

type MembersResponse = {
  items: MemberItem[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

type PackItem = {
  id: string;
  name: string;
  isActive: boolean;
  sessionCount?: number | null;
  durationDays?: string | null;
  courseQuotas?: { courseSlug: string; sessionCount: number }[];
};

export const MembersManager = forwardRef<MembersManagerHandle, MembersManagerProps>(function MembersManagerWithRef(
  { viewMode, onChangeViewMode },
  ref
) {
  const { toast } = useToast();
  const [items, setItems] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [renewModalError, setRenewModalError] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<MemberItem | null>(null);
  const [memberToRenew, setMemberToRenew] = useState<MemberItem | null>(null);
  const [renewPackId, setRenewPackId] = useState<string>("");
  const initialQrPublicIdRef = useRef("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [packFilterId, setPackFilterId] = useState<string>("ALL");
  const [packs, setPacks] = useState<PackItem[]>([]);

  const [qrId, setQrId] = useState("");
  const [qrKey, setQrKey] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<"UNKNOWN" | "UNASSIGNED" | "ASSIGNED" | "NOT_FOUND">("UNKNOWN");
  const [qrAssignedMemberId, setQrAssignedMemberId] = useState<string | null>(null);
  const [isFetchingQrKey, setIsFetchingQrKey] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [packId, setPackId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => {
      const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim().toLowerCase();
      const tel = (m.phone ?? "").toLowerCase();
      return name.includes(q) || tel.includes(q);
    });
  }, [items, search]);

  const visibleItems = useMemo(() => {
    return filteredItems.filter((m) => {
      const statusOk =
        statusFilter === "ALL" ? true : statusFilter === "ACTIVE" ? m.isActive : !m.isActive;
      const packOk = packFilterId === "ALL" ? true : m.pack?.id === packFilterId;
      return statusOk && packOk;
    });
  }, [filteredItems, packFilterId, statusFilter]);

  const qrIdentifyStatusText = useMemo(() => {
    if (qrStatus === "UNKNOWN") return isFetchingQrKey ? "Verification..." : "Non verifie";
    if (qrStatus === "UNASSIGNED") return "Disponible";
    if (qrStatus === "ASSIGNED") {
      if (editingMemberId && qrAssignedMemberId === editingMemberId) return "Lié à cet adhérent";
      return "Déjà assigné";
    }
    return "Identifiant introuvable";
  }, [qrStatus, isFetchingQrKey, editingMemberId, qrAssignedMemberId]);

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/members?page=1&pageSize=50", { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les adhérents.");
      }
      const data = (await response.json()) as MembersResponse;
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPacks = async () => {
    const response = await fetch("/api/admin/packs", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Impossible de charger les packs.");
    }
    const data = (await response.json()) as { items: PackItem[] };
    setPacks(data.items);
  };

  const packsForForm = useMemo(() => {
    if (editingMemberId) return packs;
    return packs.filter((item) => item.isActive);
  }, [packs, editingMemberId]);

  const activePacks = useMemo(() => packs.filter((item) => item.isActive), [packs]);

  const selectedRenewPack = useMemo(
    () => activePacks.find((pack) => pack.id === renewPackId) ?? null,
    [activePacks, renewPackId]
  );

  const computePackExpiresAt = (startAt: string | null, durationLabel: string | null | undefined) => {
    if (!startAt || !durationLabel) return null;
    const started = new Date(startAt);
    if (Number.isNaN(started.getTime())) return null;
    return addPackDurationToStartDate(started, durationLabel);
  };

  const formatDateFr = (value: Date | string | null | undefined) => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("fr-FR");
  };

  const oldPackExpiresAt = useMemo(
    () => computePackExpiresAt(memberToRenew?.packStartedAt ?? null, memberToRenew?.pack?.durationDays),
    [memberToRenew]
  );

  const oldPackStatus = useMemo(() => {
    if (!memberToRenew?.pack?.id) return { label: "Aucun pack", toneClass: "border-zinc-200 bg-zinc-50 text-zinc-800" };
    if (!oldPackExpiresAt) return { label: "Actif", toneClass: "border-emerald-200 bg-emerald-50 text-emerald-900" };
    const now = new Date();
    const isActive = oldPackExpiresAt.getTime() > now.getTime();
    return isActive
      ? { label: "Ancien pack actif", toneClass: "border-emerald-200 bg-emerald-50 text-emerald-900" }
      : { label: "Ancien pack expiré", toneClass: "border-zinc-200 bg-zinc-50 text-zinc-800" };
  }, [memberToRenew, oldPackExpiresAt]);

  const renewalStartDate = useMemo(() => {
    const now = new Date();
    if (oldPackExpiresAt && oldPackExpiresAt.getTime() > now.getTime()) {
      return oldPackExpiresAt;
    }
    return now;
  }, [oldPackExpiresAt]);

  const renewalEndDate = useMemo(() => {
    if (!selectedRenewPack?.durationDays) return null;
    return addPackDurationToStartDate(renewalStartDate, selectedRenewPack.durationDays);
  }, [renewalStartDate, selectedRenewPack]);

  const getPackSessionCount = (pack: PackItem | null) => {
    if (!pack) return null;
    if (Array.isArray(pack.courseQuotas) && pack.courseQuotas.length > 0) {
      return pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
    }
    return pack.sessionCount ?? null;
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMembers();
      void loadPacks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const trimmed = qrId.trim();
    if (trimmed.length < 10) {
      return;
    }

    let isCancelled = false;

    const run = async () => {
      setIsFetchingQrKey(true);
      setModalError(null);
      try {
        const response = await fetch(`/api/admin/qrcode/${encodeURIComponent(trimmed)}/key`, { cache: "no-store" });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "QR code introuvable.");
        }
        const data = (await response.json()) as {
          qrId: string;
          assignmentStatus: "ASSIGNED" | "UNASSIGNED";
          assignedMemberId: string | null;
          qrKey: string;
        };

        if (isCancelled) return;
        setQrKey(data.qrKey);
        setQrStatus(data.assignmentStatus);
        setQrAssignedMemberId(data.assignedMemberId ?? null);
      } catch (e) {
        if (isCancelled) return;
        setQrKey(null);
        setQrAssignedMemberId(null);
        const message = e instanceof Error ? e.message : "Une erreur est survenue.";
        if (message.toLowerCase().includes("introuvable") || message.toLowerCase().includes("not found")) {
          setQrStatus("NOT_FOUND");
        } else {
          setQrStatus("UNKNOWN");
        }
        setModalError(message);
      } finally {
        if (!isCancelled) setIsFetchingQrKey(false);
      }
    };

    void run();

    return () => {
      isCancelled = true;
    };
  }, [qrId]);

  const resetForm = () => {
    initialQrPublicIdRef.current = "";
    setQrId("");
    setQrKey(null);
    setQrStatus("UNKNOWN");
    setQrAssignedMemberId(null);
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setBirthDate("");
    setPackId("");
    setIsActive(true);
    setModalError(null);
    setIsSubmitting(false);
    setIsFetchingQrKey(false);
  };

  useEffect(() => {
    if (viewMode === "list") {
      setEditingMemberId(null);
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "form" && !editingMemberId) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset baseline when opening blank form
  }, [viewMode, editingMemberId]);

  const handleStartEdit = (m: MemberItem) => {
    initialQrPublicIdRef.current = m.qrCode?.qrId ?? "";
    setEditingMemberId(m.id);
    setQrId(m.qrCode?.qrId ?? "");
    setQrKey(null);
    setQrStatus(m.qrCode ? "UNKNOWN" : "UNKNOWN");
    setQrAssignedMemberId(null);
    setFirstName(m.firstName ?? "");
    setLastName(m.lastName ?? "");
    setPhone(m.phone ?? "");
    setEmail(m.email ?? "");
    setBirthDate(m.birthDate ? m.birthDate.split("T")[0] ?? "" : "");
    setPackId(m.pack?.id ?? "");
    setIsActive(m.isActive);
    setModalError(null);
    onChangeViewMode("form");
  };

  const handleSubmit = async () => {
    setModalError(null);

    const trimmedQr = qrId.trim();

    const isEditMode = editingMemberId !== null;

    if (!isEditMode && !trimmedQr) {
      setModalError("Veuillez scanner ou saisir un qr_id.");
      return;
    }

    if (!email.trim()) {
      setModalError("L'email est obligatoire.");
      return;
    }

    if (!packId) {
      setModalError("Veuillez choisir un pack.");
      return;
    }

    if (!isEditMode) {
      if (qrStatus === "ASSIGNED") {
        setModalError("Ce QR code est déjà assigné à un adhérent.");
        return;
      }
    } else if (trimmedQr) {
      const changingQr = trimmedQr !== initialQrPublicIdRef.current;
      if (
        changingQr &&
        qrStatus === "ASSIGNED" &&
        qrAssignedMemberId &&
        qrAssignedMemberId !== editingMemberId
      ) {
        setModalError("Ce QR code est déjà assigné à un autre adhérent.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (!isEditMode) {
        const response = await fetch("/api/admin/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrId: trimmedQr,
            email: email.trim(),
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
            phone: phone.trim() || undefined,
            birthDate: birthDate || undefined,
            packId,
            isActive,
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Creation impossible.");
        }

        await loadMembers();
        setEditingMemberId(null);
        onChangeViewMode("list");
        resetForm();
        toast({
          variant: "success",
          title: "Adhérent créé",
          description: "Le nouvel adhérent a été ajouté et le QR code a été assigné.",
        });
        return;
      }

      const body: Record<string, unknown> = {
        email: email.trim(),
        isActive,
      };
      if (firstName.trim().length > 0 && firstName.trim().length < 2) {
        setModalError("Le prenom doit contenir au moins 2 caracteres ou rester vide.");
        return;
      }
      if (firstName.trim().length >= 2) body.firstName = firstName.trim();
      if (lastName.trim().length > 0 && lastName.trim().length < 2) {
        setModalError("Le nom doit contenir au moins 2 caracteres ou rester vide.");
        return;
      }
      if (lastName.trim().length >= 2) body.lastName = lastName.trim();
      if (phone.trim().length > 0 && phone.trim().length < 6) {
        setModalError("Le numéro de téléphone doit contenir au moins 6 chiffres.");
        return;
      }
      if (phone.trim().length >= 6) body.phone = phone.trim();
      if (birthDate) body.birthDate = birthDate;
      body.packId = packId;
      if (trimmedQr !== initialQrPublicIdRef.current) {
        body.qrId = trimmedQr || undefined;
      }

      const response = await fetch(`/api/admin/members/${encodeURIComponent(editingMemberId!)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Mise a jour impossible.");
      }

      await loadMembers();
      setEditingMemberId(null);
      onChangeViewMode("list");
      resetForm();
      toast({
        variant: "success",
        title: "Adhérent mis à jour",
        description: "Les informations ont été enregistrées.",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      setModalError(message);
      toast({
        variant: "error",
        title: "Erreur",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return;
    const target = memberToDelete;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(target.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        let message = "Suppression impossible.";
        try {
          const text = await response.text();
          if (text) {
            const parsed = JSON.parse(text) as { error?: string };
            if (parsed.error) message = parsed.error;
          }
        } catch {
          //
        }
        throw new Error(message);
      }
      setMemberToDelete(null);
      await loadMembers();
      toast({
        variant: "success",
        title: "Adhérent supprimé",
        description:
          `${target.firstName ?? ""} ${target.lastName ?? ""}`.trim() || "Profil retire — compte supprime.",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      toast({
        variant: "error",
        title: "Erreur",
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openRenewPackModal = (member: MemberItem) => {
    setMemberToRenew(member);
    setRenewPackId(member.pack?.id ?? "");
    setRenewModalError(null);
  };

  const closeRenewPackModal = () => {
    if (isRenewing) return;
    setMemberToRenew(null);
    setRenewPackId("");
    setRenewModalError(null);
  };

  const handleRenewPack = async () => {
    if (!memberToRenew) return;
    if (!renewPackId) {
      setRenewModalError("Veuillez choisir un pack pour continuer.");
      return;
    }

    setIsRenewing(true);
    setRenewModalError(null);
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(memberToRenew.id)}/renew-pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: renewPackId }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Renouvellement impossible.");
      }

      const payload = (await response.json().catch(() => null)) as { renewalStartAt?: string } | null;
      const renewalStartLabel = formatDateFr(payload?.renewalStartAt ?? renewalStartDate);

      await loadMembers();
      toast({
        variant: "success",
        title: "Pack renouvele",
        description: `Nouveau pack actif a partir du ${renewalStartLabel}.`,
      });
      closeRenewPackModal();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      setRenewModalError(message);
    }
    setIsRenewing(false);
  };

  // Expose actions for DashboardHeader buttons (avoid duplication)
  useImperativeHandle(ref, () => {
    return {
      refresh() {
        void loadMembers();
      },
    };
  });

  return (
    <div className="space-y-6">
      {viewMode === "list" ? isLoading ? (
        <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 text-sm text-brand-dark/70">
          Chargement...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : (
        <div className="rounded-2xl border border-brand-medium/20 bg-white">
          <div className="border-b border-brand-medium/20 px-5 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-base font-semibold text-brand-dark">Liste des adhérents</p>
                  <p className="mt-1 text-xs text-brand-dark/60">{visibleItems.length} résultat(s)</p>
                </div>

                <div className="grid min-w-0 w-full gap-2 md:max-w-3xl md:grid-cols-[minmax(320px,1fr)_160px_190px_140px] md:items-end">
                  <Input
                    id="members-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nom, téléphone..."
                    className="mt-0 py-2.5"
                  />
                  <SelectMenu
                    id="members-status"
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                    options={[
                      { value: "ALL", label: "Tous" },
                      { value: "ACTIVE", label: "Actifs" },
                      { value: "INACTIVE", label: "Inactifs" },
                    ]}
                  />
                  <SelectMenu
                    id="members-pack"
                    value={packFilterId}
                    onChange={(value) => setPackFilterId(value)}
                    options={[
                      { value: "ALL", label: "Tous les packs" },
                      ...packs.map((pack) => ({ value: pack.id, label: pack.name })),
                    ]}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                      setPackFilterId("ALL");
                    }}
                    aria-label="Réinitialiser les filtres"
                    title="Réinitialiser"
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-brand-medium/30 bg-white text-lg font-semibold text-brand-dark/70 transition hover:bg-zinc-50 hover:text-brand-dark"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
          {visibleItems.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-brand-dark/60">
              Aucun adhérent. Ajustez la recherche ou les filtres.
            </div>
          ) : (
            <>
              <div className="divide-y divide-brand-medium/15 lg:hidden">
                {visibleItems.map((m) => (
                  <article key={m.id} className="space-y-2 px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-brand-dark">
                        {(m.firstName || m.lastName) ? `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() : "Adhérent"}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          m.isActive
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                        }`}
                      >
                        {m.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <p className="text-xs text-brand-dark/75">Pack: {m.pack?.name ?? "—"}</p>
                    <p className="text-xs text-brand-dark/75">Email: {m.email ?? "—"}</p>
                    <p className="text-xs text-brand-dark/75">Tel: {m.phone ?? "—"}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          m.qrCode?.qrId
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border border-amber-200 bg-amber-50 text-amber-900"
                        }`}
                      >
                        QR: {m.qrCode?.qrId ? "Assigné" : "Non assigné"}
                      </span>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(m)}
                          aria-label="Modifier l'adhérent"
                          title="Modifier"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-medium/30 bg-brand-light/40 text-brand-dark transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/30"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                            <path d="M4 17.25V20h2.75l8.12-8.12-2.75-2.75L4 17.25zm12.71-9.04a1 1 0 000-1.41l-1.5-1.5a1 1 0 00-1.41 0l-1.17 1.17 2.75 2.75 1.33-1.01z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberToDelete(m)}
                          aria-label="Supprimer l'adhérent"
                          title="Supprimer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                            <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => openRenewPackModal(m)}
                          disabled={!m.pack?.id}
                          aria-label="Renouveler le pack"
                          title="Renouveler"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-medium/30 bg-white text-brand-dark/80 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/30 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                            <path d="M12 5a7 7 0 016.65 4.8h-2.2A5 5 0 107 12H4a8 8 0 118-7zm-1 1v4.59l2.7 2.7 1.3-1.3-2-2V6h-2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[920px]">
                  <thead>
                    <tr className="border-b border-brand-medium/15 bg-zinc-50/60 text-left text-xs font-semibold text-brand-dark/70">
                      <th className="px-5 py-3">Nom</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Pack</th>
                      <th className="px-4 py-3">QR</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Téléphone</th>
                      <th className="px-4 py-3">Pack expire</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-medium/15">
                    {visibleItems.map((m) => (
                      <tr key={m.id} className="text-sm">
                        <td className="px-5 py-4 font-semibold text-brand-dark">
                          {(m.firstName || m.lastName) ? `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() : "Adhérent"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              m.isActive
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                                : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                            }`}
                          >
                            {m.isActive ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-brand-dark/80">{m.pack?.name ?? "—"}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                m.qrCode?.qrId
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                                  : "border border-amber-200 bg-amber-50 text-amber-900"
                              }`}
                            >
                              {m.qrCode?.qrId ? "Assigné" : "Non assigné"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-brand-dark/80">{m.email ?? "—"}</td>
                        <td className="px-4 py-4 text-brand-dark/80">{m.phone ?? "—"}</td>
                        <td className="px-4 py-4 text-xs text-brand-dark/60">
                          {m.packExpiresAt ? new Date(m.packExpiresAt).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(m)}
                              aria-label="Modifier l'adhérent"
                              title="Modifier"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-medium/30 bg-brand-light/40 text-brand-dark transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/30"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                <path d="M4 17.25V20h2.75l8.12-8.12-2.75-2.75L4 17.25zm12.71-9.04a1 1 0 000-1.41l-1.5-1.5a1 1 0 00-1.41 0l-1.17 1.17 2.75 2.75 1.33-1.01z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setMemberToDelete(m)}
                              aria-label="Supprimer l'adhérent"
                              title="Supprimer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => openRenewPackModal(m)}
                              disabled={!m.pack?.id}
                              aria-label="Renouveler le pack"
                              title="Renouveler"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-medium/30 bg-white text-brand-dark/80 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/30 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                <path d="M12 5a7 7 0 016.65 4.8h-2.2A5 5 0 107 12H4a8 8 0 118-7zm-1 1v4.59l2.7 2.7 1.3-1.3-2-2V6h-2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-brand-dark">
            {editingMemberId ? "Modifier un adhérent" : "Ajouter un adhérent"}
          </h3>
          <p className="mt-2 text-sm text-brand-dark/70">
            {editingMemberId ? (
              <>Mettez a jour les infos, le pack ou le QR code associe si necessaire.</>
            ) : (
              <>
                Scannez un QR code vierge puis collez l&apos;identifiant du QR code. La cle associee sera chargee
                automatiquement.
              </>
            )}
          </p>

          <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Input
                    id="member-qrid"
                    label={`Identifiant QR: ${qrIdentifyStatusText}`}
                    value={qrId}
                    onChange={(e) => {
                      const next = e.target.value;
                      setQrId(next);

                      if (next.trim().length < 10) {
                        setQrKey(null);
                        setQrStatus("UNKNOWN");
                        setQrAssignedMemberId(null);
                        setModalError(null);
                      }
                    }}
                    placeholder="Ex: identifiant qr code"
                  />
                </div>

                <div>
                  <label htmlFor="member-qrkey" className="text-sm font-medium text-brand-dark">
                    Clé qr code
                  </label>
                  <div
                    id="member-qrkey"
                    className="mt-2 min-h-[42px] w-full rounded-xl border border-brand-medium/35 bg-zinc-50 px-4 py-2.5 text-sm text-brand-dark/80"
                  >
                    {isFetchingQrKey ? "Chargement..." : qrKey ?? "—"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Input
                    id="member-first"
                    label="Prenom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="member-last"
                    label="Nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Input
                    id="member-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="member-birthdate"
                    label="Date de naissance"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <SelectMenu
                    id="member-pack"
                    value={packId}
                    onChange={(value) => setPackId(value)}
                    label="Pack choisi"
                    placeholder="Choisir un pack"
                    options={[
                      { value: "" as string, label: "Choisir un pack" },
                      ...packsForForm.map((pack) => ({
                        value: pack.id,
                        label: `${pack.name}${pack.isActive ? "" : " (inactive)"}`,
                      })),
                    ]}
                  />
                </div>
                <div>
                  <Input
                    id="member-phone"
                    label="Téléphone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} label="Actif" />
          </div>

          {modalError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {modalError}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onChangeViewMode("list")}
              disabled={isSubmitting}
              className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
            >
              Retour a la liste
            </button>
            <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting
                ? editingMemberId
                  ? "Enregistrement..."
                  : "Creation..."
                : editingMemberId
                  ? "Mettre a jour"
                  : "Confirmer"}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        title="Supprimer cet adhérent ?"
        description={
          memberToDelete
            ? `${memberToDelete.firstName ?? ""} ${memberToDelete.lastName ?? ""}`.trim() ||
              memberToDelete.email ||
              "Cette fiche sera supprimee ainsi que le compte utilisateur associe."
            : undefined
        }
        confirmText="Supprimer"
        isConfirming={isDeleting}
        onClose={() => {
          if (!isDeleting) setMemberToDelete(null);
        }}
        onConfirm={() => void handleConfirmDeleteMember()}
      />

      <Modal
        isOpen={Boolean(memberToRenew)}
        title="Renouveler le pack"
        description="Consultez l'ancien pack puis choisissez le nouveau pack avant validation."
        onClose={closeRenewPackModal}
        footer={
          <>
            <button
              type="button"
              onClick={closeRenewPackModal}
              disabled={isRenewing}
              className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Annuler
            </button>
            <Button
              type="button"
              onClick={() => void handleRenewPack()}
              disabled={isRenewing || !renewPackId}
              className="border-brand-dark/30 bg-brand-dark text-white hover:bg-brand-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRenewing ? "Validation..." : "Valider le renouvellement"}
            </Button>
          </>
        }
      >
        {memberToRenew ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-medium/20 bg-zinc-50/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand-dark">Ancien pack</p>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${oldPackStatus.toneClass}`}>
                  {oldPackStatus.label}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-brand-dark/80 sm:grid-cols-2">
                <p>Nom: {memberToRenew.pack?.name ?? "Aucun pack"}</p>
                <p>Duree: {memberToRenew.pack?.durationDays ?? "—"}</p>
                <p>Date de début : {formatDateFr(memberToRenew.packStartedAt)}</p>
                <p>Date d'expiration: {formatDateFr(oldPackExpiresAt)}</p>
              </div>
            </div>

            <div>
              <SelectMenu
                id="renew-pack-select"
                label="Nouveau pack"
                value={renewPackId}
                onChange={(value) => {
                  setRenewPackId(value);
                  setRenewModalError(null);
                }}
                options={[
                  { value: "", label: "Choisir un pack" },
                  ...activePacks.map((pack) => ({ value: pack.id, label: pack.name })),
                ]}
              />
            </div>

            <div className="rounded-xl border border-brand-medium/20 bg-white p-3">
              <p className="text-sm font-semibold text-brand-dark">Pack selectionne</p>
              {selectedRenewPack ? (
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-brand-dark/80 sm:grid-cols-2">
                  <p>Nom: {selectedRenewPack.name}</p>
                  <p>Nombre de séances : {getPackSessionCount(selectedRenewPack) ?? "—"}</p>
                  <p>Duree: {selectedRenewPack.durationDays ?? "—"}</p>
                  <p>Date de début : {formatDateFr(renewalStartDate)}</p>
                  <p className="sm:col-span-2">Date d'expiration estimee: {formatDateFr(renewalEndDate)}</p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-brand-dark/60">Choisissez un pack pour afficher ses details.</p>
              )}
            </div>

            {renewModalError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {renewModalError}
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
});

