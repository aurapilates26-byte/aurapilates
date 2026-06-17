import { isSessionSlotEndedLocal, parseYmdLocal, startOfLocalToday } from "@/lib/calendar-day";

/** Admin peut marquer une présence : jour passé, ou aujourd'hui après la fin du cours. */
export function canAdminMarkPresenceForSession(
  sessionDateYmd: string,
  sessionEndTime: string,
  referenceNow: Date = new Date(),
): boolean {
  const session = parseYmdLocal(sessionDateYmd);
  const today = startOfLocalToday();
  if (!session) return false;

  const sessionDay = new Date(session.getFullYear(), session.getMonth(), session.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (sessionDay.getTime() < todayDay.getTime()) return true;
  if (sessionDay.getTime() > todayDay.getTime()) return false;

  return isSessionSlotEndedLocal(sessionDateYmd, sessionEndTime, referenceNow);
}
