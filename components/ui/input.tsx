"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-2xl border border-[color-mix(in_srgb,var(--tg-hint-color)_24%,transparent)] bg-[var(--tg-section-bg-color)] px-4 text-[15px] text-[var(--tg-text-color)] outline-none placeholder:text-[var(--tg-hint-color)] focus:border-[var(--tg-button-color)]",
          className,
        )}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-24 w-full rounded-2xl border border-[color-mix(in_srgb,var(--tg-hint-color)_24%,transparent)] bg-[var(--tg-section-bg-color)] px-4 py-3 text-[15px] text-[var(--tg-text-color)] outline-none placeholder:text-[var(--tg-hint-color)] focus:border-[var(--tg-button-color)]",
          className,
        )}
        {...props}
      />
    );
  },
);

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[var(--tg-subtitle-text-color)]">{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--tg-hint-color)]">{hint}</span> : null}
    </label>
  );
}
