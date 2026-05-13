"use client";

import { publicPanelSurfaceClass } from "@/lib/public-panel-surface";

import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  /** Aligné formulaire / panneaux publics (même teinte que cartes planning). */
  variant?: "default" | "soft";
};

export function Input({ label, className = "", variant = "default", ...props }: InputProps) {
  const surface =
    variant === "soft"
      ? `${publicPanelSurfaceClass} border-brand-medium/25`
      : "bg-white border-brand-medium/30";

  return (
    <div>
      {label ? (
        <label htmlFor={props.id} className="text-sm font-medium text-brand-dark">
          {label}
        </label>
      ) : null}
      <input
        {...props}
        className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-brand-dark outline-none transition placeholder:text-brand-dark/45 focus:border-brand-dark/60 ${surface} ${className}`.trim()}
      />
    </div>
  );
}

