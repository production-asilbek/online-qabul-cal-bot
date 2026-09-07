"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { clientSchema, type ClientInput } from "@/lib/validation/schemas";
import { createClient, getClient, getTags, updateClient } from "@/lib/services/clients";
import { track } from "@/lib/services/analytics";
import { haptic } from "@/lib/telegram";
import { useI18n } from "@/lib/i18n/provider";

export function ClientForm({ clientId }: { clientId?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const existing = clientId ? getClient(clientId) : null;
  const tags = getTags();
  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: existing?.firstName ?? "",
      lastName: existing?.lastName ?? "",
      phone: existing?.phone ?? "+998 ",
      telegramUsername: existing?.telegramUsername ?? "",
      telegramId: existing?.telegramId ? String(existing.telegramId) : "",
      dateOfBirth: existing?.dateOfBirth ?? "",
      notes: existing?.notes ?? "",
      tags: [],
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      telegramUsername: values.telegramUsername?.replace(/^@/, "") || undefined,
      telegramId: values.telegramId ? Number(values.telegramId) : undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      notes: values.notes,
    };
    if (existing) {
      updateClient(existing.id, payload);
      haptic("success");
      router.push(`/clients/${existing.id}`);
      return;
    }
    const created = createClient(payload);
    track("client_created", created.id);
    haptic("success");
    router.push(`/clients/${created.id}`);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 px-4 pb-8">
      {form.formState.errors.firstName || form.formState.errors.phone ? (
        <ErrorBanner message={Object.values(form.formState.errors)[0]?.message ?? t.completeForm} />
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.firstName}>
          <Input {...form.register("firstName")} />
        </Field>
        <Field label={t.lastName}>
          <Input {...form.register("lastName")} />
        </Field>
      </div>
      <Field label={t.phone}>
        <Input inputMode="tel" placeholder="+998 XX XXX XX XX" {...form.register("phone")} />
      </Field>
      <Field label={t.telegramUsername}>
        <Input placeholder="@username" {...form.register("telegramUsername")} />
      </Field>
      <Field label={t.telegramId}>
        <Input inputMode="numeric" {...form.register("telegramId")} />
      </Field>
      <Field label={t.dateOfBirth}>
        <Input type="date" {...form.register("dateOfBirth")} />
      </Field>
      <Field label={t.notes}>
        <Textarea {...form.register("notes")} />
      </Field>
      {tags.length > 0 ? (
        <p className="text-xs text-[var(--tg-hint-color)]">
          {t.tags}: {tags.map((tag) => tag.name).join(", ")}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full">
        {t.saveClient}
      </Button>
    </form>
  );
}
