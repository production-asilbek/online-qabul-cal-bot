"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, MessageSquare, Plus, UserPlus } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { haptic } from "@/lib/telegram";
import { useI18n } from "@/lib/i18n/provider";

export function QuickActions() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  const go = (href: string) => {
    haptic("light");
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        aria-label={t.quickActions}
        onClick={() => {
          haptic("medium");
          setOpen(true);
        }}
        className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)] shadow-lg bottom-[calc(88px+env(safe-area-inset-bottom))]"
      >
        <Plus size={26} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t.quickActions}>
        <div className="flex flex-col gap-2">
          <ActionRow icon={<CalendarPlus size={20} />} label={t.newAppointment} onClick={() => go("/appointments/new")} />
          <ActionRow icon={<UserPlus size={20} />} label={t.addClient} onClick={() => go("/clients/new")} />
          <ActionRow icon={<MessageSquare size={20} />} label={t.sendMessage} onClick={() => go("/messages/new")} />
        </div>
      </Sheet>
    </>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-14 items-center gap-3 rounded-2xl bg-[var(--tg-bg-color)] px-4 text-left font-medium"
    >
      {icon}
      {label}
    </button>
  );
}
