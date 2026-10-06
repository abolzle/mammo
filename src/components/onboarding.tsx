"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { MinutesPref, Profile } from "@/lib/schemas/learner";

export function Onboarding({
  profile,
  onSave,
  onDiagnostic,
}: {
  profile: Profile;
  onSave: (p: Profile) => Promise<void>;
  onDiagnostic?: () => Promise<void>;
}) {
  const [examDate, setExamDate] = useState(profile.examDate ?? "");
  const [minutes, setMinutes] = useState<MinutesPref>(profile.minutesPref);
  const [experience, setExperience] = useState(profile.experience);
  const [days, setDays] = useState<number[]>(profile.studyDays);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function save(extra: Partial<Profile> = {}) {
    await onSave({
      ...profile,
      examDate: examDate || null,
      minutesPref: minutes,
      experience,
      studyDays: days.length ? days : [1, 2, 3, 4, 5],
      onboardingComplete: true,
      ...extra,
    });
  }

  return (
    <form
      className="space-y-3 rounded-xl border p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await save({ diagnosticStatus: "pending" });
      }}
    >
      <h2 className="font-heading text-lg">Make the plan fit your week</h2>
      <p className="text-sm text-muted-foreground">
        These details help Mammo size your study sessions. Everything is optional, and you can change it later in Settings.
      </p>
      <div>
        <Label htmlFor="exam">Exam date, if you have one scheduled</Label>
        <input
          id="exam"
          type="date"
          className="mt-1 min-h-11 w-full rounded-md border px-3"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
        />
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Days you usually want to study</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, i) => (
            <Button key={label} type="button" variant={days.includes(i) ? "default" : "outline"} className="min-h-11" onClick={() => toggleDay(i)}>
              {label}
            </Button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-medium">How much time do you usually have?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {([5, 10, 15, 20] as const).map((m) => (
            <Button key={m} type="button" variant={minutes === m ? "default" : "outline"} className="min-h-11" onClick={() => setMinutes(m)}>
              {m} min
            </Button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-medium">Where are you starting?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant={experience === "new" ? "default" : "outline"} className="min-h-11" onClick={() => setExperience("new")}>
            Preparing for my first credential
          </Button>
          <Button
            type="button"
            variant={experience === "experienced" ? "default" : "outline"}
            className="min-h-11"
            onClick={() => setExperience("experienced")}
          >
            Working technologist
          </Button>
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="min-h-11">
          Save my plan
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          onClick={() => save({ diagnosticStatus: "skipped" })}
        >
          Skip for now
        </Button>
        {onDiagnostic ? (
          <Button type="button" variant="outline" className="min-h-11" onClick={() => onDiagnostic()}>
            Start a 5-question knowledge check
          </Button>
        ) : null}
      </div>
    </form>
  );
}
