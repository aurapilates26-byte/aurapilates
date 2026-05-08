"use client";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div>
      {label ? (
        <label htmlFor={props.id} className="text-sm font-medium text-brand-dark">
          {label}
        </label>
      ) : null}
      <input
        {...props}
        className={`mt-2 w-full rounded-xl border border-brand-medium/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-dark/60 ${className}`.trim()}
      />
    </div>
  );
}

