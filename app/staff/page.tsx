"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { useAppStore } from "@/lib/hooks/use-store";
import { createStaff, getStaff } from "@/lib/services/staff";
import { fullName } from "@/lib/utils/format";
import { haptic } from "@/lib/telegram";

const COLORS = ["#187ACC", "#2A9D8F", "#C9A227", "#E76F51", "#7C6CF0"];

export default function StaffPage() {
  useAppStore();
  const staff = getStaff(true);
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("Specialist");
  const [color, setColor] = useState(COLORS[0]);

  return (
    <main className="pb-8">
      <ScreenHeader title="Staff" backHref="/more" />
      <div className="flex flex-col gap-3 px-4">
        {staff.map((member) => (
          <Card key={member.id} className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full" style={{ background: member.color }} />
            <div>
              <div className="font-semibold">
                {member.title.toLowerCase().includes("dentist") ? `Dr. ${member.firstName}` : fullName(member)}
              </div>
              <div className="text-sm text-[var(--tg-subtitle-text-color)]">{member.title}</div>
            </div>
          </Card>
        ))}
        <Button className="mt-2" onClick={() => setOpen(true)}>
          Add staff
        </Button>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="New staff">
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            createStaff({ firstName, lastName, title, color, active: true });
            haptic("success");
            setOpen(false);
            setFirstName("");
            setLastName("");
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </Field>
            <Field label="Last name">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </Field>
          </div>
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <div className="flex gap-2">
            {COLORS.map((item) => (
              <button
                key={item}
                type="button"
                aria-label={item}
                onClick={() => setColor(item)}
                className={`h-8 w-8 rounded-full ${color === item ? "ring-2 ring-offset-2" : ""}`}
                style={{ background: item }}
              />
            ))}
          </div>
          <Button type="submit">Save</Button>
        </form>
      </Sheet>
    </main>
  );
}
