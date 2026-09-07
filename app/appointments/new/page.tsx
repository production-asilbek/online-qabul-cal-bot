"use client";

import { Suspense } from "react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Skeleton } from "@/components/ui/skeleton";

function NewAppointmentInner() {
  return (
    <main>
      <ScreenHeader title="New appointment" backHref="/" />
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
