"use client";

import { format } from "date-fns";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { openTributePayment } from "@/lib/tribute";
import { interpolate, useI18n } from "@/lib/i18n/provider";

export default function PayPage() {
  const { t, dateLocale } = useI18n();
  const month = format(new Date(), "LLLL", { locale: dateLocale });

  return (
    <main className="pb-8">
      <ScreenHeader title={t.pay} backHref="/more" />
      <div className="flex flex-col gap-4 px-4">
        <Card>
          <h2 className="text-xl font-semibold">{t.payTitle}</h2>
          <p className="mt-2 text-sm text-[var(--tg-subtitle-text-color)]">
            {interpolate(t.payBody, { month })}
          </p>
        </Card>
        <Button size="lg" onClick={openTributePayment}>
          {t.payOpen}
        </Button>
      </div>
    </main>
  );
}
