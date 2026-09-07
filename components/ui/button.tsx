"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)] shadow-sm",
  secondary:
    "bg-[var(--tg-section-bg-color)] text-[var(--tg-text-color)] border border-[color-mix(in_srgb,var(--tg-hint-color)_28%,transparent)]",
  ghost: "bg-transparent text-[var(--tg-accent-text-color)]",
  danger: "bg-[color-mix(in_srgb,var(--tg-destructive-text-color)_12%,transparent)] text-[var(--tg-destructive-text-color)]",
};

const sizes = {
  md: "h-12 px-4 text-[15px]",
  sm: "h-10 px-3 text-sm",
  lg: "h-14 px-5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "primary", size = "md", type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tg-button-color)]",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
