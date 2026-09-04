"use client";

type QrIdInputFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPickAvailable: () => void | Promise<void>;
  onClear: () => void;
  isPicking?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

function AddIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 fill-current ${className}`} aria-hidden="true">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 fill-current ${className}`} aria-hidden="true">
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

export function QrIdInputField({
  id,
  label,
  value,
  onChange,
  onPickAvailable,
  onClear,
  isPicking = false,
  placeholder = "Ex: identifiant qr code",
  disabled = false,
}: QrIdInputFieldProps) {
  const hasValue = value.trim().length > 0;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-brand-dark">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          value={value}
          disabled={disabled || isPicking}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-brand-medium/30 bg-white py-3 pl-4 pr-11 text-sm text-brand-dark outline-none transition placeholder:text-brand-dark/45 focus:border-brand-dark/60 disabled:cursor-not-allowed disabled:opacity-70"
        />
        <button
          type="button"
          disabled={disabled || isPicking}
          onClick={() => {
            if (hasValue) {
              onClear();
              return;
            }
            void onPickAvailable();
          }}
          aria-label={
            hasValue ? "Supprimer l'identifiant QR" : "Récupérer un identifiant QR disponible"
          }
          title={
            hasValue ? "Supprimer l'identifiant QR" : "Récupérer un identifiant QR disponible"
          }
          className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-brand-dark/70 transition hover:bg-brand-light/50 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPicking ? (
            <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-brand-dark/40" aria-hidden />
          ) : hasValue ? (
            <CloseIcon />
          ) : (
            <AddIcon />
          )}
        </button>
      </div>
    </div>
  );
}
