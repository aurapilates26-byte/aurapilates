"use client";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <div>
      {label ? (
        <label htmlFor={props.id} className="text-sm font-medium text-brand-dark">
          {label}
        </label>
      ) : null}
      <textarea
        {...props}
        className={`mt-2 w-full rounded-xl border border-brand-medium/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-dark/60 ${className}`.trim()}
      />
    </div>
  );
}

