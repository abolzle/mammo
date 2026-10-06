export function newId(prefix: string): string {
  const raw = crypto.randomUUID().replace(/[^a-z0-9]/g, "");
  return `${prefix}-${raw}`;
}

export function eventId(sessionId: string, itemId: string): string {
  return `evt-${sessionId}-${itemId}`;
}

export function nowIso() {
  return new Date().toISOString();
}
