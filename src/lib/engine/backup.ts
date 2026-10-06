import { BACKUP_VERSION, backupFile, type BackupFile } from "@/lib/schemas/learner";
import type { Store } from "@/lib/db/db";
import type { Lookup } from "./lookup";

export async function exportBackup(store: Store, contentVersion: string, now = new Date()): Promise<BackupFile> {
  const [settings, consent, sessions, attempts, cardStates, reviewLogs, outcomes, issues] = await Promise.all([
    store.getSettings(),
    store.getConsent(),
    store.listSessions(),
    store.allAttempts(),
    store.allCardStates(),
    store.allReviewLogs(),
    store.allOutcomes(),
    store.allIssues(),
  ]);
  return { app: "mammo", backupVersion: BACKUP_VERSION, exportedAt: now.toISOString(), contentVersion, data: { settings, consent, sessions, attempts, cardStates, reviewLogs, outcomes, issues } };
}

/** Upgrades older backup formats before validation. Append steps; never rewrite shipped ones. */
const BACKUP_MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {};

export type ParseResult = { ok: true; backup: BackupFile } | { ok: false; error: string };

export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file isn't valid JSON." };
  }
  if (!raw || typeof raw !== "object" || (raw as { app?: unknown }).app !== "mammo") return { ok: false, error: "This doesn't look like a Mammo backup." };
  let obj = raw as Record<string, unknown>;
  let v = Number(obj.backupVersion);
  if (!Number.isInteger(v) || v < 1) return { ok: false, error: "The backup has no valid version number." };
  if (v > BACKUP_VERSION) return { ok: false, error: `This backup was made by a newer version of Mammo (format ${v}). Update the app, then import again.` };
  while (v < BACKUP_VERSION) {
    obj = BACKUP_MIGRATIONS[v](obj);
    v++;
  }
  const r = backupFile.safeParse({ ...obj, backupVersion: v });
  if (!r.success) return { ok: false, error: `The backup is damaged or incomplete (${r.error.issues[0]?.path.join(".")}: ${r.error.issues[0]?.message}).` };
  return { ok: true, backup: r.data };
}

export interface ImportSummary {
  sessionsAdded: number;
  sessionsUpdated: number;
  attemptsAdded: number;
  attemptsSkipped: number;
  cardsMerged: number;
  logsAdded: number;
  orphaned: number;
  contentVersionDiffers: boolean;
  activeSessionsClosed: number;
}

/**
 * Merges a backup into local data. Attempts and review logs are immutable events keyed by ID,
 * so re-importing the same file changes nothing. For sessions and card states, the more
 * recently updated record wins. Items no longer in the content bank are kept, not dropped.
 */
export async function importBackup(store: Store, backup: BackupFile, lookup: Lookup, currentContentVersion: string): Promise<ImportSummary> {
  const d = backup.data;
  const summary: ImportSummary = { sessionsAdded: 0, sessionsUpdated: 0, attemptsAdded: 0, attemptsSkipped: 0, cardsMerged: 0, logsAdded: 0, orphaned: 0, contentVersionDiffers: backup.contentVersion !== currentContentVersion, activeSessionsClosed: 0 };

  const local = new Map((await store.listSessions()).map((s) => [s.id, s]));
  for (const s of d.sessions) {
    const mine = local.get(s.id);
    // A session planned against different content can't be resumed safely; keep its history but close it.
    const incoming = s.status === "active" && s.contentVersion !== currentContentVersion ? { ...s, status: "abandoned" as const } : s;
    if (incoming !== s) summary.activeSessionsClosed++;
    if (!mine) {
      await store.putSession(incoming);
      summary.sessionsAdded++;
    } else if (incoming.updatedAt > mine.updatedAt) {
      await store.putSession(incoming);
      summary.sessionsUpdated++;
    }
  }
  for (const a of d.attempts) {
    if (await store.recordAttempt(a)) summary.attemptsAdded++;
    else summary.attemptsSkipped++;
    const known = a.itemType === "recap" || lookup.questions.has(a.itemId) || lookup.lessons.has(a.itemId) || lookup.cards.has(a.itemId) || lookup.visuals.has(a.itemId);
    if (!known) summary.orphaned++;
  }
  const localCards = new Map((await store.allCardStates()).map((c) => [c.cardId, c]));
  const logsByCard = new Map<string, typeof d.reviewLogs>();
  for (const l of d.reviewLogs) logsByCard.set(l.cardId, [...(logsByCard.get(l.cardId) ?? []), l]);
  const existingLogs = new Set((await store.allReviewLogs()).map((l) => l.id));
  for (const c of d.cardStates) {
    const mine = localCards.get(c.cardId);
    const newer = !mine || (c.last_review ?? "") > (mine.last_review ?? "");
    const logs = logsByCard.get(c.cardId) ?? [];
    for (const l of logs) {
      if (existingLogs.has(l.id)) continue;
      await store.recordCardReview(newer ? c : mine!, l);
      existingLogs.add(l.id);
      summary.logsAdded++;
    }
    if (newer) {
      await store.putCardState(c);
      summary.cardsMerged++;
    }
  }
  for (const o of d.outcomes) await store.putOutcome(o);
  for (const i of d.issues) await store.putIssue(i);
  const settings = await store.getSettings();
  if (!settings.onboarded && d.settings.onboarded) await store.saveSettings({ ...d.settings, lastBackupAt: settings.lastBackupAt });
  const consent = await store.getConsent();
  if (!consent.decidedAt && d.consent.decidedAt) await store.saveConsent(d.consent);
  return summary;
}
