"use client";

import { ScreenHeader } from "@/components/layout/screen-header";
import { ClientForm } from "@/components/clients/client-form";
import { useI18n } from "@/lib/i18n/provider";
import { useAppStore } from "@/lib/hooks/use-store";

export default function NewClientPage() {
  useAppStore();
  const { t } = useI18n();
  return (
    <main>
      <ScreenHeader title={t.addClient} backHref="/clients" />
      <ClientForm />
    </main>
  );
}
