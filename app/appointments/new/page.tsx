"use client";

import { Suspense } from "react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/provider";

function NewAppointmentInner() {
  const { t } = useI18n();
  return (
    <main>
      <ScreenHeader title={t.newAppointment} backHref="/" />
      <AppointmentForm />
    </main>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-4 mt-8 h-96" />}>
      <NewAppointmentInner />
    </Suspense>
  );
}
