import {
  BACKUP_FORMAT,
  LEARNER_SCHEMA_VERSION,
  backupFile,
  type BackupFile,
  type ResponseEvent,
  type StudySession,
} from "@/lib/schemas/learner";
import {
  allEvents,
  allExposures,
  allIssues,
  allObjectives,
  allOutcomes,
  allSchedules,
  allSessions,
  ensureProfile,
  getSettings,
  openMammoDB,
  resetDb,
  saveProfile,
  saveSettings,
} from "@/lib/db";
import { validateImportedJson } from "@/lib/content/validate";

export async function exportBackup(contentVersions: Record<string, string>): Promise<BackupFile> {
  const profile = await ensureProfile();
  const settings = await getSettings();
  return {
    format: BACKUP_FORMAT,
    version: 1,
    schemaVersion: LEARNER_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    contentVersions,
    profile,
    sessions: await allSessions(),
    events: await allEvents(),
    schedules: await allSchedules(),
    objectives: await allObjectives(),
    exposures: await allExposures(),
    settings,
    issues: await allIssues(),
    outcomes: await allOutcomes(),
  };
}

export type ImportResult = {
  ok: boolean;
  message: string;
  mergedSessions: number;
  skippedEvents: number;
  contentVersionNote: string | null;
};

export function parseBackupText(text: string): { ok: true; data: BackupFile } | { ok: false; message: string } {
  const raw = validateImportedJson(text);
  if (!raw.ok) return { ok: false, message: raw.issues[0]?.message ?? "Invalid file" };
  const parsed = backupFile.safeParse(raw.data);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Backup schema mismatch" };
  return { ok: true, data: parsed.data };
}

export async function importBackup(
  data: BackupFile,
  currentVersions: Record<string, string>,
  mode: "merge" | "replace",
): Promise<ImportResult> {
  let contentVersionNote: string | null = null;
  for (const [k, v] of Object.entries(data.contentVersions)) {
    if (currentVersions[k] && currentVersions[k] !== v) {
      contentVersionNote = `Backup was made against content ${k} ${v}; this app has ${currentVersions[k]}. Historical attempts keep the revision they used and are not silently rescored.`;
    }
  }
  if (mode === "replace") {
    await resetDb();
  }
  const db = await openMammoDB();
  await saveProfile(data.profile);
  await saveSettings(data.settings);
  let mergedSessions = 0;
  let skippedEvents = 0;
  for (const s of data.sessions) {
    const existing = await db.get("sessions", s.id);
    if (!existing || existing.lastActiveAt <= s.lastActiveAt) {
      await db.put("sessions", s);
      mergedSessions += 1;
    }
  }
  for (const ev of data.events) {
    const existing = await db.get("events", ev.id);
    if (existing) skippedEvents += 1;
    else await db.put("events", ev);
  }
  for (const s of data.schedules) await db.put("schedules", s);
  for (const o of data.objectives) await db.put("objectives", o);
  for (const e of data.exposures) await db.put("exposures", e);
  for (const i of data.issues as never[]) await db.put("issues", i);
  for (const o of data.outcomes) await db.put("outcomes", o);
  return {
    ok: true,
    message: mode === "replace" ? "Progress replaced from backup." : "Backup merged. Duplicate answer events were skipped.",
    mergedSessions,
    skippedEvents,
    contentVersionNote,
  };
}

export function researchExport(args: {
  sessions: StudySession[];
  events: ResponseEvent[];
  contentVersions: Record<string, string>;
  optIn: boolean;
}): { error: string } | {
  kind: string;
  generatedAt: string;
  contentVersions: Record<string, string>;
  sessionCount: number;
  eventCount: number;
  completedSessions: number;
  selfReported: true;
  limitations: string;
} {
  if (!args.optIn) return { error: "Research export is opt-in." };
  return {
    kind: "mammo-research-export",
    generatedAt: new Date().toISOString(),
    contentVersions: args.contentVersions,
    sessionCount: args.sessions.length,
    eventCount: args.events.length,
    completedSessions: args.sessions.filter((s) => s.status === "completed").length,
    selfReported: true,
    limitations:
      "Self-selected local exports cannot establish that the app caused success or was sufficient by itself. Tiny cohorts should not be published.",
  };
}
