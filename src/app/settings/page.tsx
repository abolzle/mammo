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
        Progress is stored only in this browser. It does not sync across devices and may be lost if storage is cleared.
      </p>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Session length</h2>
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
        <h2 className="font-heading text-lg">Backup</h2>
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
            Download JSON backup
          </Button>
          <Label className="min-h-11 cursor-pointer rounded-lg border px-3 py-2">
            Import backup
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
            Replace from backup
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
                if (!confirm("Replace all progress on this device with this backup?")) return;
                const result = await importBackup(parsed.data, versions, "replace");
                setMessage([result.message, result.contentVersionNote].filter(Boolean).join(" "));
                await refreshProfile();
              }}
            />
          </Label>
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Offline cache</h2>
        <p className="text-sm text-muted-foreground">{cached.length} files in cache. Content updates use network-first so a new lesson does not rewrite old attempts.</p>
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
            setMessage("Asked the service worker to check for an update.");
          }}
        >
          Check for cache update
        </Button>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Exam outcome (optional)</h2>
        <p className="text-sm text-muted-foreground">
          Stays on this device. Do not paste exam questions, registry IDs, or score-report files.
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
            setMessage("Recorded a placeholder outcome you can edit by exporting JSON. Prefer-not-to-say is stored.");
          }}
        >
          Record prefer-not-to-say
        </Button>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Research export</h2>
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
          Opt in to an anonymized local export (no identifiers)
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
          Build research summary
        </Button>
      </section>
      <Button
        variant="destructive"
        className="min-h-11"
        onClick={async () => {
          if (!confirm("Erase all local progress on this device?")) return;
          await resetDb();
          location.reload();
        }}
      >
        Reset this device
      </Button>
      {message ? <p className="text-sm" role="status">{message}</p> : null}
    </div>
  );
}
