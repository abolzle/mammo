"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useApp } from "@/components/app-provider";
import { allEvents, allSessions, getSettings, putOutcome, resetDb, saveSettings } from "@/lib/db";
import { exportBackup, importBackup, parseBackupText, researchExport } from "@/lib/engine/backup";
import { contentVersions } from "@/lib/content/load";
import { cachedUrls, updateServiceWorker } from "@/lib/offline";
import { newId } from "@/lib/engine/ids";
import type { Settings } from "@/lib/schemas/learner";

export default function SettingsPage() {
  const { content, profile, updateProfile, refreshProfile } = useApp();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [cached, setCached] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void getSettings().then(setSettings);
    void cachedUrls().then(setCached);
  }, []);

  if (!content || !profile || !settings) return <p>Loading…</p>;
  const versions = contentVersions(content);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-navy">Settings</h1>
      <p className="text-muted-foreground">
        Adjust your usual study time and manage the progress saved in this browser. Mammo does not use an account or sync your work to another device.
      </p>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Usual study session</h2>
        <p className="text-sm text-muted-foreground">Today will use this as your default. You can still choose a shorter session whenever you need one.</p>
        <div className="flex flex-wrap gap-2">
          {([5, 10, 15, 20] as const).map((m) => (
            <Button
              key={m}
              variant={profile.minutesPref === m ? "default" : "outline"}
              className="min-h-11"
              onClick={() => updateProfile({ ...profile, minutesPref: m })}
            >
              {m} min
            </Button>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Back up your progress</h2>
        <p className="text-sm text-muted-foreground">
          Download a backup file if you want to protect your study history or move it to another browser. Import adds a backup to the progress already here; replace erases
          the progress here first.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            className="min-h-11"
            onClick={async () => {
              const data = await exportBackup(versions);
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "mammo-backup.json";
              a.click();
            }}
          >
            Download backup
          </Button>
          <Label className="min-h-11 cursor-pointer rounded-lg border px-3 py-2">
            Add from backup
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const parsed = parseBackupText(text);
                if (!parsed.ok) {
                  setMessage(parsed.message);
                  return;
                }
                const result = await importBackup(parsed.data, versions, "merge");
                setMessage([result.message, result.contentVersionNote].filter(Boolean).join(" "));
                await refreshProfile();
              }}
            />
          </Label>
          <Label className="min-h-11 cursor-pointer rounded-lg border px-3 py-2">
            Replace with backup
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const parsed = parseBackupText(text);
                if (!parsed.ok) {
                  setMessage(parsed.message);
                  return;
                }
                if (!confirm("Replace all progress in this browser with this backup? This cannot be undone.")) return;
                const result = await importBackup(parsed.data, versions, "replace");
                setMessage([result.message, result.contentVersionNote].filter(Boolean).join(" "));
                await refreshProfile();
              }}
            />
          </Label>
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Offline content</h2>
        <p className="text-sm text-muted-foreground">
          Mammo has saved {cached.length} app and content files in this browser so previously loaded material can remain available with a limited connection. Checking for
          an update does not change your past answers.
        </p>
        <ul className="max-h-40 overflow-auto text-xs text-muted-foreground">
          {cached.slice(0, 40).map((u) => (
            <li key={u}>{u.replace(window.location.origin, "") || "/"}</li>
          ))}
        </ul>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={async () => {
            await updateServiceWorker();
            setCached(await cachedUrls());
            setMessage("Checked for updated app and study content.");
          }}
        >
          Check for content updates
        </Button>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Exam outcome preference (optional)</h2>
        <p className="text-sm text-muted-foreground">
          This beta can store a private “prefer not to say” outcome with your local data. It stays in this browser. Never enter exam questions, registry IDs, patient
          information, or score-report files.
        </p>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={async () => {
            await putOutcome({
              id: newId("out"),
              examDate: new Date().toISOString().slice(0, 10),
              attempt: "first",
              result: "prefer_not",
              otherResources: "",
              createdAt: new Date().toISOString(),
            });
            setMessage("Saved “prefer not to say” with the data in this browser.");
          }}
        >
          Save “prefer not to say”
        </Button>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Optional research summary</h2>
        <p className="text-sm text-muted-foreground">
          Build a summary of your local study activity for research review. Nothing is uploaded or shared automatically.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.researchExportOptIn}
            onChange={async (e) => {
              const next = { ...settings, researchExportOptIn: e.target.checked };
              await saveSettings(next);
              setSettings(next);
            }}
          />
          Allow a local summary without direct identifiers
        </label>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={async () => {
            const data = researchExport({
              sessions: await allSessions(),
              events: await allEvents(),
              contentVersions: versions,
              optIn: settings.researchExportOptIn,
            });
            if ("error" in data) setMessage(data.error);
            else setMessage(`Export ready: ${data.sessionCount} sessions, ${data.eventCount} events. ${data.limitations}`);
          }}
        >
          Preview research summary
        </Button>
      </section>
      <Button
        variant="destructive"
        className="min-h-11"
        onClick={async () => {
          if (!confirm("Erase all Mammo progress in this browser? This cannot be undone.")) return;
          await resetDb();
          location.reload();
        }}
      >
        Erase all progress in this browser
      </Button>
      {message ? <p className="text-sm" role="status">{message}</p> : null}
    </div>
  );
}
