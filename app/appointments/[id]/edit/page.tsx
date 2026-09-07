"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Skeleton } from "@/components/ui/skeleton";

function EditInner({ id }: { id: string }) {
  return (
    <main>
      <ScreenHeader title="Edit appointment" backHref={`/appointments/${id}`} />
      <AppointmentForm appointmentId={id} />
    </main>
  );
}

export default function EditAppointmentPage() {
  const params = useParams<{ id: string }>();
  return (
    <Suspense fallback={<Skeleton className="mx-4 mt-8 h-96" />}>
      <EditInner id={params.id} />
    </Suspense>
  );
}
