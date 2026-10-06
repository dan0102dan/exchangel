import { table, text, integer } from 'sdk/db';

export const rateCache = table('converter_rate_cache', {
  source: text('source').primaryKey(),
  payload: text('payload').notNull(),
  fetchedAt: integer('fetched_at').notNull(),
});
