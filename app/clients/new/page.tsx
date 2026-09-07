"use client";

import { ScreenHeader } from "@/components/layout/screen-header";
import { ClientForm } from "@/components/clients/client-form";
import { useAppStore } from "@/lib/hooks/use-store";

export default function NewClientPage() {
  useAppStore();
  return (
    <main>
      <ScreenHeader title="Add client" backHref="/clients" />
      <ClientForm />
    </main>
  );
}
