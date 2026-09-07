"use client";

import { useParams } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen-header";
import { ClientForm } from "@/components/clients/client-form";
import { useAppStore } from "@/lib/hooks/use-store";

export default function EditClientPage() {
  useAppStore();
  const params = useParams<{ id: string }>();
  return (
    <main>
      <ScreenHeader title="Edit client" backHref={`/clients/${params.id}`} />
      <ClientForm clientId={params.id} />
    </main>
  );
}
