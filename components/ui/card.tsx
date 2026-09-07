import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[18px] bg-[var(--tg-section-bg-color)] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]",
        className,
      )}
      {...props}
    />
  );
}
