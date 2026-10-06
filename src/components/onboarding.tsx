"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { MinutesPref, Profile } from "@/lib/schemas/learner";

export function Onboarding({ profile, onSave }: { profile: Profile; onSave: (p: Profile) => Promise<void> }) {
  const [examDate, setExamDate] = useState(profile.examDate ?? "");
  const [minutes, setMinutes] = useState<MinutesPref>(profile.minutesPref);
  const [experience, setExperience] = useState(profile.experience);

  return (
    <form
      className="space-y-3 rounded-xl border p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave({
          ...profile,
          examDate: examDate || null,
          minutesPref: minutes,
          experience,
          onboardingComplete: true,
        });
      }}
    >
      <h2 className="font-heading text-lg">Optional setup</h2>
      <p className="text-sm text-muted-foreground">Skip if you just want to look around. You can change this later in Settings.</p>
      <div>
        <Label htmlFor="exam">Exam date (or leave blank if not scheduled)</Label>
        <input
          id="exam"
          type="date"
          className="mt-1 min-h-11 w-full rounded-md border px-3"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
        />
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Usual session length</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {([5, 10, 15, 20] as const).map((m) => (
            <Button key={m} type="button" variant={minutes === m ? "default" : "outline"} className="min-h-11" onClick={() => setMinutes(m)}>
              {m} min
            </Button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-medium">Experience</legend>
        <div className="mt-2 flex gap-2">
          <Button type="button" variant={experience === "new" ? "default" : "outline"} className="min-h-11" onClick={() => setExperience("new")}>
            New candidate
          </Button>
          <Button
            type="button"
            variant={experience === "experienced" ? "default" : "outline"}
            className="min-h-11"
            onClick={() => setExperience("experienced")}
          >
            Experienced technologist
          </Button>
        </div>
      </fieldset>
      <div className="flex gap-2">
        <Button type="submit" className="min-h-11">
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          onClick={() => onSave({ ...profile, onboardingComplete: true, diagnosticStatus: "skipped" })}
        >
          Skip
        </Button>
      </div>
    </form>
  );
}
