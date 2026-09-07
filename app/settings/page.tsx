"use client";

import { useState } from "react";
import Link from "next/link";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/hooks/use-store";
import {
  getBusinessSettings,
  getCurrentBusiness,
  updateBusiness,
  updateReminderOffsets,
} from "@/lib/services/businesses";
import { REMINDER_OPTIONS } from "@/lib/utils/format";
import { haptic } from "@/lib/telegram";

export default function SettingsPage() {
  useAppStore();
  const business = getCurrentBusiness();
  const settings = getBusinessSettings();
  const [name, setName] = useState(business.name);
  const [offsets, setOffsets] = useState(settings.reminderOffsetsMin);

  return (
    <main className="pb-8">
      <ScreenHeader title="Settings" backHref="/more" />
      <div className="flex flex-col gap-4 px-4">
        <Field label="Business name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Button
          onClick={() => {
            updateBusiness({ name });
            haptic("success");
          }}
        >
          Save name
        </Button>
        <Link href="/settings/hours" className="font-medium text-[var(--tg-accent-text-color)]">
          Working hours
        </Link>
        <Card>
          <p className="mb-3 font-semibold">Reminder before appointment</p>
          <div className="flex flex-col gap-3">
            {REMINDER_OPTIONS.map((option) => {
              const checked = offsets.includes(option.minutes);
              return (
                <label key={option.minutes} className="flex items-center justify-between">
                  <span>{option.label}</span>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? offsets.filter((item) => item !== option.minutes)
                        : [...offsets, option.minutes];
                      setOffsets(next);
                      updateReminderOffsets(next);
                    }}
                  />
                </label>
              );
            })}
          </div>
        </Card>
      </div>
    </main>
  );
}
