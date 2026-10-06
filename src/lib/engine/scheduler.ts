import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from "ts-fsrs";
import type { CardState, ReviewLog } from "@/lib/schemas/learner";

/**
 * Spaced review uses FSRS via the maintained open-source `ts-fsrs` package.
 * Fuzz is disabled so the schedule is deterministic and testable; short-term
 * steps are disabled because sessions are short and daily.
 */
const scheduler = fsrs(generatorParameters({ enable_fuzz: false, enable_short_term: false, request_retention: 0.9, maximum_interval: 365 }));

const RATING: Record<ReviewLog["rating"], Grade> = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };

function toCard(s: CardState): Card {
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

function fromCard(cardId: string, c: Card): CardState {
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

export function newCardState(cardId: string, now: Date): CardState {
  return fromCard(cardId, createEmptyCard(now));
}

export function reviewCard(prev: CardState | undefined, cardId: string, rating: ReviewLog["rating"], now: Date): CardState {
  const card = prev ? toCard(prev) : createEmptyCard(now);
  return fromCard(cardId, scheduler.next(card, now, RATING[rating]).card);
}

/** Previewed intervals, so learners see what each self-rating will do. */
export function previewIntervals(prev: CardState | undefined, now: Date): Record<ReviewLog["rating"], number> {
  const card = prev ? toCard(prev) : createEmptyCard(now);
  const p = scheduler.repeat(card, now);
  const days = (g: Grade) => Math.max(0, Math.round((p[g].card.due.getTime() - now.getTime()) / 86_400_000));
  return { again: days(Rating.Again), hard: days(Rating.Hard), good: days(Rating.Good), easy: days(Rating.Easy) };
}

export const isDue = (s: CardState, now: Date) => new Date(s.due).getTime() <= now.getTime();
