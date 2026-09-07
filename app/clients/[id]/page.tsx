"use client";

import { useParams, useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAppStore } from "@/lib/hooks/use-store";
import { getClient, getClientTags } from "@/lib/services/clients";
import { getClientAppointments } from "@/lib/services/appointments";
import { track } from "@/lib/services/analytics";
import { formatLongDate, formatTime } from "@/lib/utils/date";
import { fullName } from "@/lib/utils/format";
import { telHref } from "@/lib/utils/phone";
import { useEffect } from "react";
import Link from "next/link";

export default function ClientProfilePage() {
  useAppStore();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = getClient(params.id);
  const tags = client ? getClientTags(client.id) : [];
  const history = client ? getClientAppointments(client.id) : [];
  const next = history.find((item) => ["scheduled", "confirmed"].includes(item.appointment.status));

  useEffect(() => {
    if (client) track("client_viewed", client.id);
  }, [client]);

  if (!client) {
    return (
      <main>
        <ScreenHeader title="Client" backHref="/clients" />
        <EmptyState title="Client not found" subtitle="This client may have been removed." />
      </main>
    );
  }

  return (
    <main className="pb-8">
      <ScreenHeader title="Client" backHref="/clients" />
      <div className="px-4">
        <Card>
          <h2 className="text-2xl font-semibold">{fullName(client)}</h2>
          <p className="mt-2 text-[var(--tg-subtitle-text-color)]">{client.phone}</p>
          {client.telegramUsername ? (
            <p className="mt-1 text-sm text-[var(--tg-accent-text-color)]">@{client.telegramUsername}</p>
          ) : null}
          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: `${tag.color}22`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}
          {client.notes ? <p className="mt-3 text-sm text-[var(--tg-subtitle-text-color)]">{client.notes}</p> : null}
        </Card>

        <div className="mt-6">
          <SectionHeader title="Next appointment" />
          {next ? (
            <Link href={`/appointments/${next.appointment.id}`}>
              <Card>
                <div className="font-semibold">{formatLongDate(next.appointment.startAt)}</div>
                <div className="text-[var(--tg-accent-text-color)]">{formatTime(next.appointment.startAt)}</div>
                <div className="mt-1 text-sm">{next.service.name}</div>
              </Card>
            </Link>
          ) : (
            <p className="text-sm text-[var(--tg-hint-color)]">No upcoming visit.</p>
          )}
        </div>

        <div className="mt-6">
          <SectionHeader title="Visit history" />
          {history.length === 0 ? (
            <EmptyState title="History is empty" subtitle="Appointments will appear here." />
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((item) => (
                <Link key={item.appointment.id} href={`/appointments/${item.appointment.id}`}>
                  <Card>
                    <div className="font-semibold">{formatLongDate(item.appointment.startAt)}</div>
                    <div className="text-sm">{item.service.name}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-[var(--tg-subtitle-text-color)]">
                        {formatTime(item.appointment.startAt)}
                      </span>
                      <StatusBadge status={item.appointment.status} />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <SectionHeader title="Actions" />
          <Button onClick={() => router.push(`/appointments/new?clientId=${client.id}`)}>Book appointment</Button>
          <Button variant="secondary" onClick={() => router.push(`/messages/new?clientId=${client.id}&channel=sms`)}>
            Send SMS
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(`/messages/new?clientId=${client.id}&channel=telegram`)}
          >
            Send Telegram
          </Button>
          <Button variant="ghost" onClick={() => router.push(`/clients/${client.id}/edit`)}>
            Edit client
          </Button>
          <a href={telHref(client.phone)} className="text-center text-sm text-[var(--tg-accent-text-color)]">
            Call
          </a>
        </div>
      </div>
    </main>
  );
}
