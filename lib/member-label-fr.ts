/** Libellés adhérente — studio 100 % femmes. */

export const MEMBER_FALLBACK_NAME = "Adhérente";
export const MEMBERS_NAV_LABEL = "Adhérentes";

export function memberDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  fallback: string = MEMBER_FALLBACK_NAME,
): string {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim() || fallback;
}

export function memberCountLabel(count: number): string {
  return `${count} adhérente${count > 1 ? "s" : ""}`;
}

export function memberAttendanceLabel(count: number): string {
  return `${memberCountLabel(count)} présente${count > 1 ? "s" : ""}`;
}
