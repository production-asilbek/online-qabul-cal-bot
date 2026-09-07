"use client";

import { useParams } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen-header";
import { ClientForm } from "@/components/clients/client-form";
import { useI18n } from "@/lib/i18n/provider";
import { useAppStore } from "@/lib/hooks/use-store";

export default function EditClientPage() {
  useAppStore();
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  return (
    <main>
      <ScreenHeader title={t.editClient} backHref={`/clients/${params.id}`} />
      <ClientForm clientId={params.id} />
    </main>
  );
}
