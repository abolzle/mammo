import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import {
  LEARNER_SCHEMA_VERSION,
  type CardSchedule,
  type ExamOutcome,
  type Exposure,
  type ObjectiveHistory,
  type Profile,
  type ResponseEvent,
  type Settings,
  type StudySession,
} from "@/lib/schemas/learner";
import type { IssueReport } from "@/lib/schemas/content";

export const DB_NAME = "mammo";

export interface MammoDB extends DBSchema {
  meta: { key: string; value: unknown };
  profile: { key: string; value: Profile };
  sessions: { key: string; value: StudySession; indexes: { "by-status": string } };
  events: { key: string; value: ResponseEvent; indexes: { "by-session": string } };
  schedules: { key: string; value: CardSchedule; indexes: { "by-due": string } };
  objectives: { key: string; value: ObjectiveHistory };
  exposures: { key: string; value: Exposure };
  settings: { key: string; value: Settings };
  issues: { key: string; value: IssueReport };
  outcomes: { key: string; value: ExamOutcome };
}

let dbPromise: Promise<IDBPDatabase<MammoDB>> | null = null;

const MIGRATIONS: Array<(db: IDBDatabase, tx: IDBTransaction) => void> = [
  (db) => {
    db.createObjectStore("meta");
    db.createObjectStore("profile", { keyPath: "id" });
    db.createObjectStore("sessions", { keyPath: "id" });
    db.createObjectStore("events", { keyPath: "id" });
    db.createObjectStore("schedules", { keyPath: "cardId" });
    db.createObjectStore("objectives", { keyPath: "objectiveId" });
    db.createObjectStore("exposures", { keyPath: "contentId" });
    db.createObjectStore("settings", { keyPath: "id" });
    db.createObjectStore("issues", { keyPath: "id" });
    db.createObjectStore("outcomes", { keyPath: "id" });
  },
  // v2: lookup indexes. Never edit a shipped migration; append instead.
  (_db, tx) => {
    tx.objectStore("sessions").createIndex("by-status", "status");
    tx.objectStore("events").createIndex("by-session", "sessionId");
    tx.objectStore("schedules").createIndex("by-due", "due");
  },
];

export function openMammoDB() {
  if (!dbPromise) {
    dbPromise = openDB<MammoDB>(DB_NAME, LEARNER_SCHEMA_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        for (let v = oldVersion; v < MIGRATIONS.length; v++) {
          MIGRATIONS[v](transaction.db as unknown as IDBDatabase, transaction as unknown as IDBTransaction);
        }
      },
    });
  }
  return dbPromise;
}

export async function resetDb() {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
  dbPromise = null;
}

export function defaultProfile(now = new Date().toISOString()): Profile {
  return {
    id: "guest",
    createdAt: now,
    examDate: null,
    studyDays: [1, 2, 3, 4, 5],
    minutesPref: 10,
    experience: "new",
    onboardingComplete: false,
    diagnosticStatus: "pending",
    lastBackupPromptAt: null,
    lastActiveAt: now,
    longAbsenceRecheckAt: null,
  };
}

export function defaultSettings(): Settings {
  return {
    id: "settings",
    reducedMotion: false,
    researchExportOptIn: false,
    examOutcomeConsent: false,
    cacheNoteDismissed: false,
  };
}

export async function ensureProfile(): Promise<Profile> {
  const db = await openMammoDB();
  const existing = await db.get("profile", "guest");
  if (existing) return existing;
  const p = defaultProfile();
  await db.put("profile", p);
  await db.put("settings", defaultSettings());
  await db.put("meta", LEARNER_SCHEMA_VERSION, "schemaVersion");
  return p;
}

export async function saveProfile(p: Profile) {
  const db = await openMammoDB();
  await db.put("profile", { ...p, lastActiveAt: new Date().toISOString() });
}

export async function getSettings(): Promise<Settings> {
  const db = await openMammoDB();
  return (await db.get("settings", "settings")) ?? defaultSettings();
}

export async function saveSettings(s: Settings) {
  const db = await openMammoDB();
  await db.put("settings", s);
}

export async function putSession(s: StudySession) {
  const db = await openMammoDB();
  await db.put("sessions", s);
}

export async function getSession(id: string) {
  const db = await openMammoDB();
  return db.get("sessions", id);
}

export async function allSessions() {
  const db = await openMammoDB();
  return db.getAll("sessions");
}

export async function activeSession() {
  const all = await allSessions();
  return all.find((s) => s.status === "in_progress") ?? null;
}

/** Idempotent: same event id is not stored twice. */
export async function putEvent(ev: ResponseEvent): Promise<{ event: ResponseEvent; inserted: boolean }> {
  const db = await openMammoDB();
  const existing = await db.get("events", ev.id);
  if (existing) return { event: existing, inserted: false };
  await db.put("events", ev);
  return { event: ev, inserted: true };
}

export async function eventsForSession(sessionId: string) {
  const db = await openMammoDB();
  return db.getAllFromIndex("events", "by-session", sessionId);
}

export async function allEvents() {
  const db = await openMammoDB();
  return db.getAll("events");
}

export async function getSchedule(cardId: string) {
  const db = await openMammoDB();
  return db.get("schedules", cardId);
}

export async function putSchedule(s: CardSchedule) {
  const db = await openMammoDB();
  await db.put("schedules", s);
}

export async function allSchedules() {
  const db = await openMammoDB();
  return db.getAll("schedules");
}

export async function getObjective(id: string) {
  const db = await openMammoDB();
  return db.get("objectives", id);
}

export async function putObjective(o: ObjectiveHistory) {
  const db = await openMammoDB();
  await db.put("objectives", o);
}

export async function allObjectives() {
  const db = await openMammoDB();
  return db.getAll("objectives");
}

export async function getExposure(contentId: string) {
  const db = await openMammoDB();
  return db.get("exposures", contentId);
}

export async function putExposure(e: Exposure) {
  const db = await openMammoDB();
  await db.put("exposures", e);
}

export async function allExposures() {
  const db = await openMammoDB();
  return db.getAll("exposures");
}

export async function putIssue(i: IssueReport) {
  const db = await openMammoDB();
  await db.put("issues", i);
}

export async function allIssues() {
  const db = await openMammoDB();
  return db.getAll("issues");
}

export async function putOutcome(o: ExamOutcome) {
  const db = await openMammoDB();
  await db.put("outcomes", o);
}

export async function allOutcomes() {
  const db = await openMammoDB();
  return db.getAll("outcomes");
}
