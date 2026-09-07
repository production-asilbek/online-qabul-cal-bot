"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { ClientRow } from "@/components/clients/client-row";
import { ClientSearch } from "@/components/clients/client-search";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader } from "@/components/layout/screen-header";
import { useAppStore, useDebouncedValue } from "@/lib/hooks/use-store";
import { getClients } from "@/lib/services/clients";
import { useRouter } from "next/navigation";

export default function ClientsPage() {
  useAppStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 250);
  const result = getClients(debounced);

  return (
    <main>
      <ScreenHeader
        title="Clients"
        action={
          <Link aria-label="Add client" href="/clients/new" className="flex h-10 w-10 items-center justify-center">
            <Plus />
          </Link>
        }
      />
      <div className="pb-4">
        <ClientSearch value={query} onChange={setQuery} />
      </div>
      {result.items.length === 0 ? (
        <EmptyState
          title="Add your first client."
          subtitle="Clients are the heart of your calendar."
          actionLabel="+ Add client"
          onAction={() => router.push("/clients/new")}
        />
      ) : (
        <div>
          {result.items.map((client) => (
            <ClientRow key={client.id} client={client} />
          ))}
        </div>
      )}
    </main>
  );
}
