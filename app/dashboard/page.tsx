"use client";

import { ScreenHeader } from "@/components/layout/screen-header";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/hooks/use-store";
import { getMonthStats } from "@/lib/services/appointments";
import { getCurrentBusiness } from "@/lib/services/businesses";
import { formatPrice } from "@/lib/utils/format";

export default function DashboardPage() {
  useAppStore();
  const stats = getMonthStats();
  const business = getCurrentBusiness();

  return (
    <main className="pb-8">
      <ScreenHeader title="Overview" backHref="/more" />
      <div className="grid grid-cols-2 gap-3 px-4">
        <Stat label="Today's appointments" value={stats.today} />
        <Stat label="Upcoming" value={stats.upcoming} />
        <Stat label="Clients" value={stats.clients} />
        <Stat label="This month" value={stats.appointments} />
      </div>
      <div className="mt-4 px-4">
        <Card>
          <p className="text-sm text-[var(--tg-subtitle-text-color)]">This month</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Mini label="Completed" value={stats.completed} />
            <Mini label="Cancelled" value={stats.cancelled} />
            <Mini label="No-show" value={stats.noShow} />
            <Mini label="Revenue" value={formatPrice(stats.revenue, business.currency)} />
          </div>
        </Card>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <div className="text-3xl font-semibold">{value.toLocaleString()}</div>
      <div className="mt-1 text-sm text-[var(--tg-subtitle-text-color)]">{label}</div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-[var(--tg-subtitle-text-color)]">{label}</div>
    </div>
  );
}
