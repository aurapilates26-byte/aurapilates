import { create } from "zustand";
import type { MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";

const OWNED_PACKS_CHANGED_EVENT = "aurapilates:member-owned-packs-changed";

/** Référence stable — ne jamais faire `?? []` dans un sélecteur Zustand. */
export const EMPTY_MEMBER_OWNED_PACKS: MemberOwnedPackDto[] = [];

export type MemberOwnedPacksChangedDetail = {
  memberId: string;
  items?: MemberOwnedPackDto[];
};

type MemberOwnedPacksStoreState = {
  byMemberId: Record<string, MemberOwnedPackDto[]>;
  loadingByMemberId: Record<string, boolean>;
  errorByMemberId: Record<string, string | null>;
  /** Incrémenté à chaque mutation pour forcer les effets locaux. */
  revision: number;
  setPacks: (memberId: string, items: MemberOwnedPackDto[]) => void;
  clearPacks: (memberId: string) => void;
  loadPacks: (memberId: string) => Promise<MemberOwnedPackDto[]>;
  /**
   * Mise à jour optimiste : le plus ancien pack encore disponible du même catalogue
   * passe à Terminé (1/1) dès la présence.
   */
  consumeOldestOpenPackOptimistic: (
    memberId: string,
    packId: string,
    sessionDateIso: string,
  ) => void;
  notifyPacksChanged: (memberId: string, items?: MemberOwnedPackDto[]) => void;
};

function sortOwnedPacks(items: MemberOwnedPackDto[]): MemberOwnedPackDto[] {
  return [...items].sort(
    (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime(),
  );
}

export function dispatchMemberOwnedPacksChanged(detail: MemberOwnedPacksChangedDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OWNED_PACKS_CHANGED_EVENT, { detail }));
}

export function subscribeMemberOwnedPacksChanged(
  listener: (detail: MemberOwnedPacksChangedDetail) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const custom = event as CustomEvent<MemberOwnedPacksChangedDetail>;
    if (!custom.detail?.memberId) return;
    listener(custom.detail);
  };
  window.addEventListener(OWNED_PACKS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(OWNED_PACKS_CHANGED_EVENT, handler);
}

/** Sélecteur stable pour les packs d'une adhérente (évite la boucle getSnapshot). */
export function selectOwnedPacksForMember(memberId: string) {
  return (state: MemberOwnedPacksStoreState) =>
    state.byMemberId[memberId] ?? EMPTY_MEMBER_OWNED_PACKS;
}

export const useMemberOwnedPacksStore = create<MemberOwnedPacksStoreState>((set, get) => ({
  byMemberId: {},
  loadingByMemberId: {},
  errorByMemberId: {},
  revision: 0,

  setPacks: (memberId, items) =>
    set((state) => ({
      byMemberId: { ...state.byMemberId, [memberId]: sortOwnedPacks(items) },
      errorByMemberId: { ...state.errorByMemberId, [memberId]: null },
      revision: state.revision + 1,
    })),

  clearPacks: (memberId) =>
    set((state) => {
      const byMemberId = { ...state.byMemberId };
      delete byMemberId[memberId];
      return { byMemberId, revision: state.revision + 1 };
    }),

  loadPacks: async (memberId) => {
    set((state) => ({
      loadingByMemberId: { ...state.loadingByMemberId, [memberId]: true },
      errorByMemberId: { ...state.errorByMemberId, [memberId]: null },
    }));
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}/owned-packs`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Chargement impossible.");
      }
      const data = (await response.json()) as { items: MemberOwnedPackDto[] };
      const items = sortOwnedPacks(data.items ?? []);
      set((state) => ({
        byMemberId: { ...state.byMemberId, [memberId]: items },
        loadingByMemberId: { ...state.loadingByMemberId, [memberId]: false },
        errorByMemberId: { ...state.errorByMemberId, [memberId]: null },
        revision: state.revision + 1,
      }));
      return items;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur";
      set((state) => ({
        loadingByMemberId: { ...state.loadingByMemberId, [memberId]: false },
        errorByMemberId: { ...state.errorByMemberId, [memberId]: message },
      }));
      throw e;
    }
  },

  consumeOldestOpenPackOptimistic: (memberId, packId, sessionDateIso) => {
    const current = get().byMemberId[memberId];
    if (!current?.length) return;

    const openIndexes = current
      .map((pack, index) => ({ pack, index }))
      .filter(
        ({ pack }) =>
          pack.packId === packId &&
          pack.remainingSessions > 0 &&
          (pack.totalSessions == null || pack.consumedSessions < pack.totalSessions),
      )
      .sort(
        (a, b) =>
          new Date(a.pack.purchasedAt).getTime() - new Date(b.pack.purchasedAt).getTime(),
      );

    const target = openIndexes[0];
    if (!target) return;

    const next = current.map((pack, index) => {
      if (index !== target.index) return pack;
      const total = pack.totalSessions ?? pack.sessionCount ?? 1;
      return {
        ...pack,
        packStartedAt: pack.packStartedAt ?? sessionDateIso,
        consumedSessions: total,
        remainingSessions: 0,
        status: "expired" as const,
        enrollmentStatus: "ACTIVE" as const,
      };
    });

    set((state) => ({
      byMemberId: { ...state.byMemberId, [memberId]: next },
      revision: state.revision + 1,
    }));
  },

  notifyPacksChanged: (memberId, items) => {
    if (items) {
      get().setPacks(memberId, items);
    }
    dispatchMemberOwnedPacksChanged({ memberId, items });
  },
}));
