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
import { useI18n } from "@/lib/i18n/provider";

export default function ServicesPage() {
  useAppStore();
  const { t } = useI18n();
  const business = getCurrentBusiness();
  const services = getServices(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("30");
  const [durationMin, setDurationMin] = useState("30");

  return (
    <main className="pb-8">
      <ScreenHeader title={t.services} backHref="/more" />
      <div className="px-4">
        {services.length === 0 ? (
          <EmptyState
            title={t.emptyServicesTitle}
            subtitle={t.emptyServicesSubtitle}
            actionLabel={t.addService}
            onAction={() => setOpen(true)}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {services.map((service) => (
              <Card key={service.id} className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{service.name}</div>
                  <div className="mt-1 text-sm text-[var(--tg-subtitle-text-color)]">
                    {formatPrice(service.price, business.currency)} · {formatDuration(service.durationMin, t)}
                  </div>
                  {!service.active ? <div className="mt-1 text-xs text-[var(--tg-hint-color)]">{t.archived}</div> : null}
                </div>
                {service.active ? (
                  <button
                    className="text-sm text-[var(--tg-destructive-text-color)]"
                    onClick={() => {
                      archiveService(service.id);
                      haptic("warning");
                    }}
                  >
                    {t.archive}
                  </button>
                ) : null}
              </Card>
            ))}
          </div>
        )}
        <Button className="mt-5 w-full" onClick={() => setOpen(true)}>
          {t.addService}
        </Button>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title={t.newService}>
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
          <Field label={t.name}>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label={t.description}>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.price}>
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field label={t.durationMin}>
              <Input type="number" min={5} value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
            </Field>
          </div>
          <Button type="submit">{t.save}</Button>
        </form>
      </Sheet>
    </main>
  );
}
