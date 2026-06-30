"use client";

import type { ReactNode } from "react";
import { getReservationActorBadge } from "@/lib/reservation-created-by";
import {
  formatCourseDateWithWeekday,
  formatReservationDateTime,
  formatSessionSlotLine,
  isReservationRecordedOnDifferentDay,
  type ReservationsListTab,
} from "@/lib/reservation-display";
import { planningLevelLabelFr } from "@/lib/planning-public-labels";

export type ReservationAdminListItemData = {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  courseLabel: string;
  coachName?: string | null;
  level?: string | null;
  reservedAt: string;
  source: "ADMIN" | "MEMBER" | null;
  status: string;
  statusLabel: string;
  statusBadgeClass: string;
  packRefundNote?: string | null;
  debitedPackName?: string | null;
};

type ReservationAdminListItemProps = {
  item: ReservationAdminListItemData;
  listTab?: ReservationsListTab;
  showReservedMeta?: boolean;
  trailingAction?: ReactNode;
  className?: string;
};

export function ReservationAdminListItem({
  item,
  listTab = "upcoming",
  showReservedMeta = true,
  trailingAction,
  className = "",
}: ReservationAdminListItemProps) {
  const actorBadge = getReservationActorBadge(item.source);
  const levelLabel = item.level ? planningLevelLabelFr(item.level) : null;
  const recordedLater = isReservationRecordedOnDifferentDay(item.reservedAt, item.sessionDate);
  const isHistory = listTab === "history";

  return (
    <div
      className={`rounded-xl border border-brand-medium/12 bg-white px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {showReservedMeta ? (
            isHistory ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-brand-dark">
                    Cours le {formatCourseDateWithWeekday(item.sessionDate)}
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${actorBadge.className}`}
                  >
                    {actorBadge.label}
                  </span>
                </div>
                <p className="mt-0.5 font-medium text-brand-dark/80">
                  {item.startTime} – {item.endTime}
                </p>
                {recordedLater ? (
                  <p className="mt-0.5 text-[11px] text-brand-dark/55 sm:text-xs">
                    Enregistré le {formatReservationDateTime(item.reservedAt)}
                  </p>
                ) : (
                  <p className="mt-0.5 text-[11px] text-brand-dark/55 sm:text-xs">
                    Réservé le {formatReservationDateTime(item.reservedAt)}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-brand-dark">
                    Réservé le {formatReservationDateTime(item.reservedAt)}
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${actorBadge.className}`}
                  >
                    {actorBadge.label}
                  </span>
                </div>
                <p className="mt-0.5 text-brand-dark/70">
                  {formatSessionSlotLine(item.sessionDate, item.startTime, item.endTime)}
                </p>
              </>
            )
          ) : (
            <p className="font-semibold text-brand-dark">
              {formatSessionSlotLine(item.sessionDate, item.startTime, item.endTime)}
            </p>
          )}
          <p className={showReservedMeta ? "mt-0.5 text-[11px] text-brand-dark/55 sm:text-xs" : "text-[11px] text-brand-dark/55 sm:text-xs"}>
            {item.courseLabel}
          </p>
          {item.coachName ? (
            <p className="text-[11px] text-brand-dark/60 sm:text-xs">Coach : {item.coachName}</p>
          ) : null}
        </div>
        {trailingAction ? <div className="shrink-0">{trailingAction}</div> : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.statusBadgeClass}`}
        >
          {item.statusLabel}
        </span>
      </div>

      {levelLabel ? (
        <p className="mt-1 text-[11px] text-brand-dark/55">Niveau : {levelLabel}</p>
      ) : null}

      {item.debitedPackName ? (
        <p className="mt-1 text-[11px] text-brand-dark/65">
          <span className="font-semibold">Pack utilisé :</span> {item.debitedPackName}
        </p>
      ) : null}

      {item.packRefundNote ? (
        <p className="mt-1 text-[11px] text-brand-dark/65">
          <span className="font-semibold">Pack :</span> {item.packRefundNote}
        </p>
      ) : null}
    </div>
  );
}
