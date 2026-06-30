type SpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizeClass: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export function Spinner({ className = "", size = "md", label = "Chargement" }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-brand-medium/20 border-t-brand-dark ${sizeClass[size]} ${className}`.trim()}
      role="status"
      aria-label={label}
    />
  );
}

type PlanningGridLoadingStateProps = {
  label?: string;
};

export function PlanningGridLoadingState({
  label = "Chargement du planning…",
}: PlanningGridLoadingStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-brand-medium/20 bg-white px-6 py-14">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-brand-dark/65">{label}</p>
    </div>
  );
}
