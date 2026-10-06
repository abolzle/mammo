import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction, type StoreNames } from "idb";
import {
  consent as consentSchema,
  settings as settingsSchema,
  type Attempt,
  type CardState,
  type Consent,
  type ExamOutcome,
  type ReviewLog,
  type SessionRecord,
  type Settings,
  type StoredIssue,
} from "@/lib/schemas/learner";

export interface MammoDB extends DBSchema {
  kv: { key: string; value: unknown };
  sessions: { key: string; value: SessionRecord; indexes: { "by-status": string; "by-created": string } };
  attempts: { key: string; value: Attempt; indexes: { "by-session": string; "by-item": string; "by-family": string } };
  cardStates: { key: string; value: CardState; indexes: { "by-due": string } };
  reviewLogs: { key: string; value: ReviewLog; indexes: { "by-card": string } };
  outcomes: { key: string; value: ExamOutcome };
  issues: { key: string; value: StoredIssue };
}

export const DB_NAME = "mammo";
type UpgradeTx = IDBPTransaction<MammoDB, StoreNames<MammoDB>[], "versionchange">;

/**
 * Ordered schema migrations. Index i upgrades a database from version i to i + 1.
 * Never edit a shipped migration; append a new one.
 */
export const MIGRATIONS: ((db: IDBPDatabase<MammoDB>, tx: UpgradeTx) => void | Promise<void>)[] = [
  (db) => {
    db.createObjectStore("kv");
    const sessions = db.createObjectStore("sessions", { keyPath: "id" });
    sessions.createIndex("by-status", "status");
    sessions.createIndex("by-created", "createdAt");
    const attempts = db.createObjectStore("attempts", { keyPath: "id" });
    attempts.createIndex("by-session", "sessionId");
    attempts.createIndex("by-item", "itemId");
    const cards = db.createObjectStore("cardStates", { keyPath: "cardId" });
    cards.createIndex("by-due", "due");
    const logs = db.createObjectStore("reviewLogs", { keyPath: "id" });
    logs.createIndex("by-card", "cardId");
    db.createObjectStore("outcomes", { keyPath: "id" });
    db.createObjectStore("issues", { keyPath: "id" });
  },
  // v2: exposure lookups by question family.
  async (_db, tx) => {
    tx.objectStore("attempts").createIndex("by-family", "familyId");
  },
];
export const DB_VERSION = MIGRATIONS.length;

let dbPromise: Promise<IDBPDatabase<MammoDB>> | null = null;

export function getDB(name = DB_NAME): Promise<IDBPDatabase<MammoDB>> {
  if (name !== DB_NAME) return open(name);
  dbPromise ??= open(name);
  return dbPromise;
}

function open(name: string) {
  return openDB<MammoDB>(name, DB_VERSION, {
    async upgrade(db, oldVersion, _newVersion, tx) {
      for (let v = oldVersion; v < DB_VERSION; v++) await MIGRATIONS[v](db, tx);
    },
    blocking() {
      // Another tab opened a newer version; close so it can upgrade, and reload on next use.
      dbPromise = null;
    },
  });
}

export function resetDBHandle() {
  dbPromise = null;
}

export class Store {
  constructor(private readonly dbp: Promise<IDBPDatabase<MammoDB>> = getDB()) {}

  async getSettings(): Promise<Settings> {
    const db = await this.dbp;
    return settingsSchema.parse((await db.get("kv", "settings")) ?? {});
  }
  async saveSettings(patch: Partial<Settings>): Promise<Settings> {
    const db = await this.dbp;
    const next = settingsSchema.parse({ ...(await this.getSettings()), ...patch });
    await db.put("kv", next, "settings");
    return next;
  }
  async getConsent(): Promise<Consent> {
    const db = await this.dbp;
    return consentSchema.parse((await db.get("kv", "consent")) ?? {});
  }
  async saveConsent(c: Consent) {
    await (await this.dbp).put("kv", consentSchema.parse(c), "consent");
  }

  async putSession(s: SessionRecord) {
    await (await this.dbp).put("sessions", { ...s, updatedAt: new Date().toISOString() });
  }
  async getSession(id: string) {
    return (await this.dbp).get("sessions", id);
  }
  async listSessions(): Promise<SessionRecord[]> {
    const all = await (await this.dbp).getAllFromIndex("sessions", "by-created");
    return all.reverse();
  }
  async activeSessions(): Promise<SessionRecord[]> {
    return (await (await this.dbp).getAllFromIndex("sessions", "by-status", "active")).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  /** Idempotent: returns false and keeps the original when the attempt already exists. */
  async recordAttempt(a: Attempt): Promise<boolean> {
    const db = await this.dbp;
    const tx = db.transaction("attempts", "readwrite");
    const existing = await tx.store.get(a.id);
    if (existing) {
      await tx.done;
      return false;
    }
    await tx.store.add(a);
    await tx.done;
    return true;
  }
  /** Test mode lets learners change an answer until submission; graded fields are set at submit. */
  async upsertDraftAttempt(a: Attempt) {
    const db = await this.dbp;
    const tx = db.transaction(["attempts", "sessions"], "readwrite");
    const s = await tx.objectStore("sessions").get(a.sessionId);
    if (s && s.status !== "active") {
      await tx.done;
      return false;
    }
    await tx.objectStore("attempts").put(a);
    await tx.done;
    return true;
  }
  async attemptsForSession(sessionId: string) {
    return (await this.dbp).getAllFromIndex("attempts", "by-session", sessionId);
  }
  async allAttempts(): Promise<Attempt[]> {
    return (await this.dbp).getAll("attempts");
  }
  async putAttempts(list: Attempt[]) {
    const db = await this.dbp;
    const tx = db.transaction("attempts", "readwrite");
    await Promise.all(list.map((a) => tx.store.put(a)));
    await tx.done;
  }

  async allCardStates(): Promise<CardState[]> {
    return (await this.dbp).getAll("cardStates");
  }
  /** Card review and its log are written together; the log ID makes retries idempotent. */
  async recordCardReview(state: CardState, log: ReviewLog): Promise<boolean> {
    const db = await this.dbp;
    const tx = db.transaction(["cardStates", "reviewLogs"], "readwrite");
    if (await tx.objectStore("reviewLogs").get(log.id)) {
      await tx.done;
      return false;
    }
    await tx.objectStore("reviewLogs").add(log);
    await tx.objectStore("cardStates").put(state);
    await tx.done;
    return true;
  }
  async putCardState(state: CardState) {
    await (await this.dbp).put("cardStates", state);
  }
  async allReviewLogs(): Promise<ReviewLog[]> {
    return (await this.dbp).getAll("reviewLogs");
  }

  async putOutcome(o: ExamOutcome) {
    await (await this.dbp).put("outcomes", o);
  }
  async deleteOutcome(id: string) {
    await (await this.dbp).delete("outcomes", id);
  }
  async allOutcomes() {
    return (await this.dbp).getAll("outcomes");
  }
  async putIssue(i: StoredIssue) {
    await (await this.dbp).put("issues", i);
  }
  async allIssues() {
    return (await this.dbp).getAll("issues");
  }

  async clearAll() {
    const db = await this.dbp;
    const names = ["kv", "sessions", "attempts", "cardStates", "reviewLogs", "outcomes", "issues"] as const;
    const tx = db.transaction([...names], "readwrite");
    await Promise.all(names.map((n) => tx.objectStore(n).clear()));
    await tx.done;
  }
}
