"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useAppStore } from "@/lib/hooks/use-store";
import { getClients } from "@/lib/services/clients";
import { getTemplates, sendMessage } from "@/lib/services/messages";
import { fullName } from "@/lib/utils/format";
import { haptic } from "@/lib/telegram";
import type { MessageChannel } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

function ComposeInner() {
  useAppStore();
  const router = useRouter();
  const params = useSearchParams();
  const clients = getClients("", 1, 200).items;
  const templates = getTemplates();
  const [clientId, setClientId] = useState(params.get("clientId") ?? "");
  const [channel, setChannel] = useState<MessageChannel>((params.get("channel") as MessageChannel) || "sms");
  const [templateId, setTemplateId] = useState(params.get("templateId") ?? "");
  const [content, setContent] = useState(
    templates.find((item) => item.id === params.get("templateId"))?.content ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  return (
    <main className="pb-8">
      <ScreenHeader title="Send message" backHref="/messages" />
      <form
        className="flex flex-col gap-4 px-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setSending(true);
          try {
            const message = await sendMessage({ clientId, channel, content, templateId: templateId || undefined });
            if (message?.status === "failed") {
              setError("Message couldn't be sent.");
              haptic("error");
              return;
            }
            haptic("success");
            router.push("/messages");
          } catch {
            setError("Message couldn't be sent.");
            haptic("error");
          } finally {
            setSending(false);
          }
        }}
      >
        {error ? (
          <div className="flex flex-col gap-2">
            <ErrorBanner message={error} />
            <Button type="submit" variant="secondary">
              Try again
            </Button>
          </div>
        ) : null}
        <Field label="Client">
          <select className="select-field" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {fullName(client)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Channel">
          <select className="select-field" value={channel} onChange={(e) => setChannel(e.target.value as MessageChannel)}>
            <option value="sms">SMS</option>
            <option value="telegram">Telegram</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </Field>
        <Field label="Template">
          <select
            className="select-field"
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value);
              const template = templates.find((item) => item.id === e.target.value);
              if (template) setContent(template.content);
            }}
          >
            <option value="">Custom message</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Message" hint="Variables: {{client_name}} {{business_name}} {{date}} {{time}} {{service}} {{staff}}">
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} required />
        </Field>
        <Button type="submit" size="lg" disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </form>
    </main>
  );
}

export default function NewMessagePage() {
  return (
    <Suspense fallback={<Skeleton className="mx-4 mt-8 h-80" />}>
      <ComposeInner />
    </Suspense>
  );
}
