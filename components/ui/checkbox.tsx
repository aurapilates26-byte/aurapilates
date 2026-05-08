"use client";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-3 text-sm text-brand-dark ${className}`.trim()}>
      <input {...props} type="checkbox" className="h-4 w-4 rounded border-brand-medium/35" />
      {label}
    </label>
  );
}

