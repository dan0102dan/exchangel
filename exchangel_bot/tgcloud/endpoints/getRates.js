import { db, fetch, EndpointError } from 'sdk';
import { eq } from 'sdk/db';
import { rateCache } from '../schema.js';
import { loadFiat, loadCrypto } from '../lib/providers.js';

async function cached(source, ttl, loader) {
  const row = await db.select().from(rateCache).where(eq(rateCache.source, source)).get();
  if (row && Date.now() - row.fetchedAt < ttl) return { ...JSON.parse(row.payload), stale: Boolean(JSON.parse(row.payload).partial) };
  try {
    let result;
    try { result = await loader(fetch); }
    catch { result = await loader(fetch); }
    if (result.partial) {
      console.warn(`Partial rates for ${source}`);
      if (row) {
        const previous = JSON.parse(row.payload);
        return { ...result, rates: { ...previous.rates, ...result.rates }, updatedAt: previous.updatedAt, stale: true };
      }
      return { ...result, stale: true };
    }
    await db.insert(rateCache).values({ source, payload: JSON.stringify(result), fetchedAt: Date.now() })
      .onConflictDoUpdate({ target: rateCache.source, set: { payload: JSON.stringify(result), fetchedAt: Date.now() } }).run();
    return { ...result, stale: false };
  } catch (error) {
    console.warn(`Rates refresh failed for ${source}: ${error.message}`);
    if (row) return { ...JSON.parse(row.payload), stale: true };
    return { rates: {}, updatedAt: null, stale: true };
  }
}

export default async function () {
  const [fiat, crypto] = await Promise.all([
    cached('fiat', 60 * 60 * 1000, loadFiat),
    cached('crypto-v3', 60 * 1000, loadCrypto),
  ]);
  if (!Object.keys(fiat.rates).length && !Object.keys(crypto.rates).length) {
    throw new EndpointError('Rates are temporarily unavailable. Please try again.');
  }
  return { fiat, crypto };
}
