"use client";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ label, className = "", children, ...props }: SelectProps) {
  return (
    <div>
      {label ? (
        <label htmlFor={props.id} className="text-sm font-medium text-brand-dark">
          {label}
        </label>
      ) : null}
      <select
        {...props}
        className={`mt-2 w-full rounded-xl border border-brand-medium/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-dark/60 ${className}`.trim()}
      >
        {children}
      </select>
    </div>
  );
}

