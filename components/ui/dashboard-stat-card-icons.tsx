type IconProps = { className?: string };

const defaultClass = "h-4 w-4";

export function StatUsersIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
      <circle cx="10" cy="8" r="3" />
      <path d="M20 19v-1a3 3 0 0 0-2-2.83" />
      <path d="M16 4.17a3 3 0 0 1 0 5.66" />
    </svg>
  );
}

export function StatPlayIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M10 9.5v5l4-2.5-4-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StatExpiredIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function StatProlongedIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 12h16" />
      <path d="M12 4v16" />
      <path d="M16 8l4 4-4 4" />
    </svg>
  );
}

export function StatFinishedIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function StatCalendarIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

export function StatReformerIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <path d="M6 14v3M18 14v3" />
      <path d="M9 8h6" />
    </svg>
  );
}

export function StatMatIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="4" y="12" width="16" height="5" rx="1" />
      <path d="M8 9v3M12 8v4M16 9v3" />
    </svg>
  );
}

export function StatYogaIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <path d="M8 18l4-4 4 4" />
      <path d="M9 11h6" />
    </svg>
  );
}

export function StatDanceIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M9 18V6l6 3-6 3v6" />
      <circle cx="7" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StatCoachingIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 19v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
      <path d="M17 7l2 2-2 2" />
    </svg>
  );
}

export function StatEmptySlotIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="2" strokeDasharray="3 3" />
      <path d="M9 12h6" />
    </svg>
  );
}
