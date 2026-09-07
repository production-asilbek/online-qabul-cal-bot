"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/hooks/use-store";
import { completeOnboarding, getCurrentBusiness } from "@/lib/services/businesses";
import { createService } from "@/lib/services/services";
import { BUSINESS_TYPE_LABELS } from "@/lib/utils/format";
import type { BusinessType, WorkingHours } from "@/types";
import { haptic } from "@/lib/telegram";

const TYPES: BusinessType[] = ["clinic", "dental", "beauty", "barber", "fitness", "other"];

export default function OnboardingPage() {
  useAppStore();
  const router = useRouter();
  const business = getCurrentBusiness();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(business.name === "STOM Clinic" ? "" : business.name);
  const [type, setType] = useState<BusinessType>(business.type);
  const [serviceName, setServiceName] = useState("Consultation");
  const [price, setPrice] = useState("20");
  const [duration, setDuration] = useState("30");

  const next = () => {
    haptic("light");
    setStep((value) => value + 1);
  };

  const finish = () => {
    const hours: WorkingHours[] = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
      id: crypto.randomUUID(),
      businessId: business.id,
      weekday,
      isClosed: weekday === 0,
      ranges: weekday === 0 ? [] : weekday === 6 ? [{ start: "10:00", end: "15:00" }] : [{ start: "09:00", end: "18:00" }],
      breaks: weekday === 0 || weekday === 6 ? [] : [{ start: "13:00", end: "14:00" }],
    }));
    completeOnboarding({ name, type, hours });
    if (serviceName) {
      createService({
        name: serviceName,
        price: Number(price),
        durationMin: Number(duration),
        active: true,
      });
    }
    haptic("success");
    setStep(5);
  };

  return (
    <main className="flex min-h-dvh flex-col px-6 py-10">
      {step === 0 ? (
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-sm text-[var(--tg-subtitle-text-color)]">Welcome</p>
          <h1 className="mt-2 text-3xl font-semibold">Let&apos;s set up your business.</h1>
          <Button className="mt-8" size="lg" onClick={next}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <p className="text-sm text-[var(--tg-subtitle-text-color)]">Step 1 of 4</p>
          <h1 className="mt-2 text-2xl font-semibold">Business name</h1>
          <div className="mt-6">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="STOM Clinic" />
            </Field>
          </div>
          <Button className="mt-6 w-full" onClick={next} disabled={!name.trim()}>
            Next
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <p className="text-sm text-[var(--tg-subtitle-text-color)]">Step 2 of 4</p>
          <h1 className="mt-2 text-2xl font-semibold">Business type</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {TYPES.map((item) => (
              <button
                key={item}
                onClick={() => setType(item)}
                className={`rounded-2xl px-4 py-5 text-left font-semibold ${
                  type === item
                    ? "bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]"
                    : "bg-[var(--tg-section-bg-color)]"
                }`}
              >
                {BUSINESS_TYPE_LABELS[item]}
              </button>
            ))}
          </div>
          <Button className="mt-6 w-full" onClick={next}>
            Next
          </Button>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <p className="text-sm text-[var(--tg-subtitle-text-color)]">Step 3 of 4</p>
          <h1 className="mt-2 text-2xl font-semibold">Working hours</h1>
          <p className="mt-3 text-[var(--tg-subtitle-text-color)]">
            Weekdays 09:00–18:00. Saturday 10:00–15:00. Sunday closed. You can change this later.
          </p>
          <Button className="mt-6 w-full" onClick={next}>
            Looks good
          </Button>
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <p className="text-sm text-[var(--tg-subtitle-text-color)]">Step 4 of 4</p>
          <h1 className="mt-2 text-2xl font-semibold">First service</h1>
          <div className="mt-6 flex flex-col gap-3">
            <Field label="Name">
              <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price">
                <Input value={price} onChange={(e) => setPrice(e.target.value)} />
              </Field>
              <Field label="Minutes">
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
              </Field>
            </div>
          </div>
          <Button className="mt-6 w-full" onClick={finish}>
            Finish
          </Button>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="flex flex-1 flex-col justify-center text-center">
          <h1 className="text-3xl font-semibold">Your business is ready.</h1>
          <Button className="mt-8" size="lg" onClick={() => router.replace("/")}>
            Open calendar
          </Button>
        </div>
      ) : null}
    </main>
  );
}
