import Link from "next/link";

type ButtonProps = {
  children: string;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  size?: "xs" | "sm" | "lg";
  href?: string;
};

export function Button({
  children,
  className = "",
  type = "button",
  disabled = false,
  onClick,
  size = "sm",
  href,
}: ButtonProps) {
  const sizeClasses = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-5 py-2 text-sm",
    lg: "px-7 py-3 text-base",
  };

  const classes =
    `inline-flex items-center justify-center rounded-full border border-brand-dark/20 bg-brand-dark font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-dark/90 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
