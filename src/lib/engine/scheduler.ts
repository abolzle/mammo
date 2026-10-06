import { createEmptyCard, fsrs, generatorParameters, type Card, type Grade } from "ts-fsrs";
import type { CardSchedule } from "@/lib/schemas/learner";

const scheduler = fsrs(generatorParameters({ enable_fuzz: false }));

export function emptySchedule(cardId: string, now = new Date()): CardSchedule {
  const c = createEmptyCard(now);
  return serialize(cardId, c);
}

export function reviewCard(schedule: CardSchedule, rating: 1 | 2 | 3 | 4, now = new Date()): CardSchedule {
  const card = deserialize(schedule);
  const next = scheduler.next(card, now, rating as Grade);
  return serialize(schedule.cardId, next.card);
}

export function isDue(schedule: CardSchedule, now = new Date()): boolean {
  return new Date(schedule.due).getTime() <= now.getTime();
}

function serialize(cardId: string, c: Card): CardSchedule {
  return {
    cardId,
    due: c.due.toISOString(),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review ? c.last_review.toISOString() : null,
  };
}

function deserialize(s: CardSchedule): Card {
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: s.elapsed_days,
    scheduled_days: s.scheduled_days,
    learning_steps: s.learning_steps,
    reps: s.reps,
    lapses: s.lapses,
    state: s.state,
    last_review: s.last_review ? new Date(s.last_review) : undefined,
  };
}

/** Deterministic fallback documented for maintainers if ts-fsrs is unavailable. */
export function documentedFallbackIntervalDays(rating: 1 | 2 | 3 | 4, reps: number): number {
  if (rating === 1) return 0;
  if (rating === 2) return Math.max(1, reps);
  if (rating === 3) return Math.max(1, 2 * (reps + 1));
  return Math.max(3, 4 * (reps + 1));
}
