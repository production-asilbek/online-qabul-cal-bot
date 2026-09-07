"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { useAppStore } from "@/lib/hooks/use-store";
import { archiveService, createService, getServices } from "@/lib/services/services";
import { formatDuration, formatPrice } from "@/lib/utils/format";
import { getCurrentBusiness } from "@/lib/services/businesses";
import { haptic } from "@/lib/telegram";

export default function ServicesPage() {
  useAppStore();
  const business = getCurrentBusiness();
  const services = getServices(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("30");
  const [durationMin, setDurationMin] = useState("30");

  return (
    <main className="pb-8">
      <ScreenHeader title="Services" backHref="/more" />
      <div className="px-4">
        {services.length === 0 ? (
          <EmptyState
            title="Create services so you can book appointments faster."
            subtitle="Name, price, and duration are enough."
            actionLabel="Add service"
            onAction={() => setOpen(true)}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {services.map((service) => (
              <Card key={service.id} className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{service.name}</div>
                  <div className="mt-1 text-sm text-[var(--tg-subtitle-text-color)]">
                    {formatPrice(service.price, business.currency)} · {formatDuration(service.durationMin)}
                  </div>
                  {!service.active ? <div className="mt-1 text-xs text-[var(--tg-hint-color)]">Archived</div> : null}
                </div>
                {service.active ? (
                  <button
                    className="text-sm text-[var(--tg-destructive-text-color)]"
                    onClick={() => {
                      archiveService(service.id);
                      haptic("warning");
                    }}
                  >
                    Archive
                  </button>
                ) : null}
              </Card>
            ))}
          </div>
        )}
        <Button className="mt-5 w-full" onClick={() => setOpen(true)}>
          Add service
        </Button>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="New service">
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            createService({
              name,
              description,
              price: Number(price),
              durationMin: Number(durationMin),
              active: true,
            });
            haptic("success");
            setOpen(false);
            setName("");
            setDescription("");
          }}
        >
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price">
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field label="Duration (min)">
              <Input type="number" min={5} value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
            </Field>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </Sheet>
    </main>
  );
}
