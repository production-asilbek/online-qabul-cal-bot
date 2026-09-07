"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppStore } from "@/lib/hooks/use-store";
import { getMessages, getTemplates } from "@/lib/services/messages";
import { getClient } from "@/lib/services/clients";
import { fullName } from "@/lib/utils/format";
import { formatShortDate, formatTime } from "@/lib/utils/date";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  useAppStore();
  const router = useRouter();
  const templates = getTemplates();
  const messages = getMessages();

  return (
    <main className="pb-8">
      <ScreenHeader
        title="Messages"
        backHref="/more"
        action={
          <Link aria-label="New message" href="/messages/new" className="flex h-10 w-10 items-center justify-center">
            <Plus />
          </Link>
        }
      />
      <div className="px-4">
        <h2 className="mb-3 text-sm font-semibold">Templates</h2>
        <div className="flex flex-col gap-3">
          {templates.map((template) => (
            <Link key={template.id} href={`/messages/new?templateId=${template.id}`}>
              <Card>
                <div className="font-semibold">{template.name}</div>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--tg-subtitle-text-color)]">{template.content}</p>
              </Card>
            </Link>
          ))}
        </div>
        <h2 className="mb-3 mt-8 text-sm font-semibold">History</h2>
        {messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            subtitle="Send a reminder or confirmation."
            actionLabel="Send message"
            onAction={() => router.push("/messages/new")}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const client = getClient(message.clientId);
              return (
                <Card key={message.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{client ? fullName(client) : "Client"}</div>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--tg-subtitle-text-color)]">{message.content}</p>
                      <p className="mt-2 text-xs text-[var(--tg-hint-color)]">
                        {message.channel.toUpperCase()} · {formatShortDate(message.createdAt)} {formatTime(message.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--tg-bg-color)] px-2.5 py-1 text-[11px] font-semibold capitalize">
                      {message.status}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
