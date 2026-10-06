import { cryptoNames, loadFiat, loadCrypto } from '../tgcloud/lib/providers.js';
export { cryptoNames };
const regions = { USD: 'us', AED: 'ae', RUB: 'ru', TRY: 'tr', NGN: 'ng', KZT: 'kz', BYN: 'by', EUR: 'eu', GBP: 'gb', CNY: 'cn', JPY: 'jp', CHF: 'ch', GEL: 'ge', THB: 'th', KRW: 'kr', VND: 'vn', INR: 'in', IDR: 'id', UAH: 'ua', XAF: 'cm', XOF: 'sn', XCD: 'ag', XCG: 'cw', XPF: 'pf', ANG: 'cw', CNH: 'cn', USDT: null };
export const defaults = ['USD', 'AED', 'RUB', 'TRY', 'NGN', 'KZT', 'BYN', 'EUR', 'BTC', 'ETH', 'TON'];
export const assetCode = id => id.startsWith('crypto:') ? id.slice(7) : id;
export const isCrypto = code => code.startsWith('crypto:') || Boolean(cryptoNames[code]);
export function mergeRates(data) {
  const fiat = data?.fiat?.rates || {};
  const crypto = data?.crypto?.rates || {};
  return { ...fiat, ...Object.fromEntries(Object.entries(crypto).map(([code, rate]) =>
    [Object.hasOwn(fiat, code) ? `crypto:${code}` : code, rate])) };
}
export function isCryptoAsset(code, data) {
  return code.startsWith('crypto:') || (!Object.hasOwn(data?.fiat?.rates || {}, code) &&
    (Object.hasOwn(data?.crypto?.rates || {}, code) || isCrypto(code)));
}
export const region = code => regions[code] || code.slice(0, 2).toLowerCase();
const extraNames = { RON: 'Ronin', SCR: 'Scroll', SUI: 'Sui', SHIB: 'Shiba Inu', PEPE: 'Pepe', AAVE: 'Aave', UNI: 'Uniswap', OKB: 'OKB', ARB: 'Arbitrum', OP: 'Optimism', ATOM: 'Cosmos', NEAR: 'NEAR Protocol', XLM: 'Stellar', ALGO: 'Algorand', FIL: 'Filecoin', APT: 'Aptos', INJ: 'Injective' };
const displayNames = new Map(), numberFormats = new Map();
export function currencyName(id, locale, crypto = isCrypto(id)) {
  const code = assetCode(id);
  if (crypto) return cryptoNames[code] || extraNames[code] || code;
  try {
    if (!displayNames.has(locale)) displayNames.set(locale, new Intl.DisplayNames([locale], { type: 'currency' }));
    return displayNames.get(locale).of(code);
  }
  catch { return code; }
}
export function format(value, code, locale, crypto = isCrypto(code)) {
  if (value === null || !Number.isFinite(value)) return '—';
  const digits = crypto ? 8 : Math.abs(value) > 0 && Math.abs(value) < .01 ? 6 : 2;
  const key = `${locale}:${digits}`;
  if (!numberFormats.has(key)) numberFormats.set(key, new Intl.NumberFormat(locale, { maximumFractionDigits: digits }));
  return numberFormats.get(key).format(value);
}
export const symbols = { USD: '$', EUR: '€', GBP: '£', RUB: '₽', TRY: '₺', NGN: '₦', KZT: '₸', CNY: '¥', JPY: '¥', AED: 'د.إ', BTC: '₿', ETH: 'Ξ', TON: 'TON', USDT: '₮' };
export async function getRates() {
  const tg = window.Telegram?.WebApp;
  if (tg?.initData) {
    if (!tg.Serverless?.call) throw Error('Please update Telegram to open the converter.');
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error('Connection timed out. Please try again.')), 20000);
      tg.Serverless.call('getRates', {}, (error, data) => {
        clearTimeout(timeout);
        error ? reject(Error(error.message)) : resolve(data);
      });
    });
  }
  // Public browser preview; the Telegram app uses the server-side endpoint.
  const results = await Promise.allSettled([loadFiat(fetch), loadCrypto(fetch)]);
  if (results.every(r => r.status === 'rejected')) throw Error('Rates are temporarily unavailable.');
  const unwrap = r => r.status === 'fulfilled' ? { ...r.value, stale: Boolean(r.value.partial) } : { rates: {}, stale: true };
  return { fiat: unwrap(results[0]), crypto: unwrap(results[1]) };
}

// A partial refresh must not erase the last successful snapshot of either source.
export function retainRates(previous, incoming) {
  const result = {};
  for (const source of ['fiat', 'crypto']) {
    const next = incoming?.[source];
    const old = previous?.[source];
    if (!Object.keys(next?.rates || {}).length && Object.keys(old?.rates || {}).length) {
      result[source] = { ...old, stale: true };
    } else if (next?.partial && Object.keys(old?.rates || {}).length) {
      result[source] = { ...next, rates: { ...old.rates, ...next.rates }, updatedAt: old.updatedAt, stale: true };
    } else result[source] = next || { rates: {}, updatedAt: null, stale: true };
  }
  return result;
}
