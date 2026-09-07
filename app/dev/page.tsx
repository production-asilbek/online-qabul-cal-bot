"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/hooks/use-store";
import { useTelegram } from "@/lib/hooks/use-telegram";
import { dataModeLabel, isMockMode } from "@/lib/data/mode";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getCurrentBusiness, getCurrentUser, resetOnboarding } from "@/lib/services/businesses";
import { getNotificationJobs, processDueJobs } from "@/lib/services/reminders";
import { mockStore } from "@/lib/mock/store";
import { getNotificationProvider } from "@/lib/notifications/service";

export default function DevPage() {
  const { ready } = useAppStore();
  const { user, insideTelegram } = useTelegram();
  const router = useRouter();

  if (process.env.NODE_ENV === "production") {
    return (
      <main className="px-4 py-10">
        <p>Not available.</p>
      </main>
    );
  }

  if (!ready) return null;

  const business = getCurrentBusiness();
  const appUser = getCurrentUser();
  const jobs = getNotificationJobs();
  const provider = getNotificationProvider("sms");

  return (
    <main className="pb-8">
      <ScreenHeader title="Dev" backHref="/more" />
      <div className="flex flex-col gap-3 px-4 text-sm">
        <Card>
          <Row label="Telegram user" value={`${user?.first_name ?? "—"} (${user?.id ?? "—"})`} />
          <Row label="Inside Telegram" value={insideTelegram ? "yes" : "no"} />
          <Row label="App user" value={`${appUser.firstName} · ${appUser.id}`} />
          <Row label="Business" value={`${business.name} · ${business.id}`} />
          <Row label="Data mode" value={dataModeLabel()} />
          <Row label="Mock mode" value={isMockMode() ? "yes" : "no"} />
          <Row label="Supabase" value={isSupabaseConfigured() ? "connected" : "not configured"} />
          <Row label="SMS provider" value={provider.name} />
          <Row label="Pending jobs" value={String(jobs.filter((job) => job.status === "pending").length)} />
        </Card>
        <Button
          onClick={async () => {
            await processDueJobs();
          }}
        >
          Process reminder jobs
        </Button>
        <Button variant="secondary" onClick={() => mockStore.reset()}>
          Reset demo data
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            resetOnboarding();
            router.push("/onboarding");
          }}
        >
          Replay onboarding
        </Button>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[color-mix(in_srgb,var(--tg-hint-color)_12%,transparent)] py-2 last:border-b-0">
      <span className="text-[var(--tg-subtitle-text-color)]">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{value}</span>
    </div>
  );
}
