"use client";

type SwitchProps = {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (next: boolean) => void;
  /** Accessible label for screen readers (recommended). */
  ariaLabel?: string;
  /** Optional visible label next to the switch. */
  label?: string;
  className?: string;
};

export function Switch({ checked, disabled, onCheckedChange, ariaLabel, label, className = "" }: SwitchProps) {
  const base =
    "inline-flex h-6 w-11 items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/40";
  const state = checked ? "border-emerald-600 bg-emerald-600" : "border-brand-medium/40 bg-brand-light/50";
  const off = disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-emerald-500/60";
  const knobBase = "h-5 w-5 rounded-full bg-white shadow-sm transition";
  const knob = checked ? "translate-x-5 border border-white/40" : "translate-x-0.5 border border-brand-medium/35";

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      {label ? <span className="text-xs font-medium text-brand-dark/70">{label}</span> : null}
      <label className={`${base} ${state} ${off}`.trim()}>
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          aria-label={ariaLabel ?? label ?? "Interrupteur"}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <span className={`${knobBase} ${knob}`.trim()} aria-hidden="true" />
      </label>
    </div>
  );
}

