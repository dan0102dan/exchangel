export const FIAT_URL = 'https://open.er-api.com/v6/latest/USD';
export const CRYPTO_URL = 'https://www.okx.com/api/v5/market/index-tickers?quoteCcy=USD';
export const cryptoNames = { BTC: 'Bitcoin', ETH: 'Ethereum', TON: 'Toncoin', USDT: 'Tether', USDC: 'USD Coin', SOL: 'Solana', XRP: 'XRP', DOGE: 'Dogecoin', LTC: 'Litecoin', ADA: 'Cardano', TRX: 'TRON', AVAX: 'Avalanche', DOT: 'Polkadot', BNB: 'BNB', BCH: 'Bitcoin Cash', LINK: 'Chainlink' };

export async function loadFiat(fetcher) {
  const res = await fetcher(FIAT_URL);
  if (!res.ok) throw new Error('Currency rates are temporarily unavailable');
  const data = await res.json();
  if (data.result !== 'success' || data.rates?.USD !== 1) throw new Error('Invalid currency rates');
  const rates = Object.fromEntries(Object.entries(data.rates).filter(([, rate]) => Number.isFinite(rate) && rate > 0));
  return { rates, updatedAt: data.time_last_update_unix * 1000 };
}

export const INSTRUMENTS_URL = 'https://www.okx.com/api/v5/public/instruments?instType=SPOT';
export const TICKERS_URL = 'https://www.okx.com/api/v5/market/tickers?instType=SPOT';

async function okxData(fetcher, url) {
  const res = await fetcher(url);
  if (!res.ok) throw new Error(`OKX HTTP ${res.status || 'error'}`);
  const data = await res.json();
  if (data.code !== '0' || !Array.isArray(data.data)) throw new Error('Invalid crypto rates');
  return data.data;
}

export async function loadCrypto(fetcher) {
  const results = await Promise.allSettled([
    okxData(fetcher, CRYPTO_URL), okxData(fetcher, INSTRUMENTS_URL), okxData(fetcher, TICKERS_URL),
  ]);
  if (results[0].status === 'rejected') throw results[0].reason;
  const indices = results[0].value;
  const instruments = results[1].status === 'fulfilled' ? results[1].value : [];
  const tickers = results[2].status === 'fulfilled' ? results[2].value : [];
  const partial = results.some(result => result.status === 'rejected');
  const indexById = new Map(indices.map(row => [row.instId, row]));
  const tickerById = new Map(tickers.map(row => [row.instId, row]));
  const usdt = indexById.get('USDT-USD');
  const usdtUsd = Number(usdt?.idxPx);
  const rates = {};
  let updatedAt = 0;
  for (const instrument of instruments) {
    if (instrument.state !== 'live' || instrument.quoteCcy !== 'USDT' || instrument.instType !== 'SPOT') continue;
    const code = instrument.baseCcy;
    if (!/^[A-Z0-9][A-Z0-9._]{0,30}$/.test(code)) continue;
    const index = indexById.get(`${code}-USD`);
    const ticker = tickerById.get(instrument.instId);
    const indexPrice = Number(index?.idxPx);
    const spotPrice = Number(ticker?.last);
    const useIndex = Number.isFinite(indexPrice) && indexPrice > 0;
    const price = useIndex ? indexPrice : spotPrice * usdtUsd;
    if (!Number.isFinite(price) || price <= 0) continue;
    rates[code] = 1 / price;
    updatedAt = Math.max(updatedAt, Number((useIndex ? index : ticker)?.ts) || 0);
  }
  // USD indices are independently valid even without a current USDT spot pair.
  // For example TON can have a TON-USD index while TON-USDT is absent.
  for (const row of indices) {
    const code = row.instId?.endsWith('-USD') ? row.instId.slice(0, -4) : '';
    const price = Number(row.idxPx);
    if (!/^[A-Z0-9][A-Z0-9._]{0,30}$/.test(code) || !Number.isFinite(price) || price <= 0) continue;
    rates[code] = 1 / price;
    updatedAt = Math.max(updatedAt, Number(row.ts) || 0);
  }
  // USDT is the quote currency, so it has no USDT-USDT spot pair.
  if (Number.isFinite(usdtUsd) && usdtUsd > 0) rates.USDT = 1 / usdtUsd;
  if (!rates.BTC) throw new Error('Missing crypto rates');
  return { rates, updatedAt, ...(partial ? { partial: true, stale: true } : {}) };
}
