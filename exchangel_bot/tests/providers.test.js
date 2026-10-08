import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCrypto, CRYPTO_URL, INSTRUMENTS_URL, TICKERS_URL } from '../tgcloud/lib/providers.js';
import { mergeRates, isCryptoAsset, currencyName, currencySymbol } from '../src/data.js';

test('currency symbols cover additional fiat and keep crypto tickers separate',()=>{
 for (const [code,symbol] of Object.entries({INR:'₹',UAH:'₴',KRW:'₩',GEL:'₾',RON:'lei',CHF:'CHF',XDR:'XDR'})) {
  assert.equal(currencySymbol(code),symbol);
 }
 assert.equal(currencySymbol('crypto:BTC'),'₿');
 assert.equal(currencySymbol('crypto:RON'),'');
 assert.equal(currencySymbol('crypto:BYN'),'');
 assert.equal(currencySymbol('NEW'),'NEW');
});

test('all live USDT coins are included, USD indices preferred and USDT fallback calibrated',async()=>{
 const instrument=(code,state='live')=>({baseCcy:code,quoteCcy:'USDT',instType:'SPOT',instId:code+'-USDT',state});
 const fixtures={
  [CRYPTO_URL]:[{instId:'BTC-USD',idxPx:'60000',ts:'1000'},{instId:'USDT-USD',idxPx:'0.98',ts:'1000'},{instId:'PEPE-USD',idxPx:'0.000002',ts:'1000'}],
  [INSTRUMENTS_URL]:[instrument('BTC'),instrument('PEPE'),instrument('NEWCOIN'),instrument('INVALID'),instrument('DELISTED','suspend')],
  [TICKERS_URL]:[{instId:'BTC-USDT',last:'61000',ts:'1000'},{instId:'NEWCOIN-USDT',last:'2',ts:'1000'},{instId:'INVALID-USDT',last:'0',ts:'1000'}],
 };
 const data=await loadCrypto(async url=>({ok:true,json:async()=>({code:'0',data:fixtures[url]})}));
 assert.equal(data.rates.BTC,1/60000);
 assert.equal(data.rates.PEPE,500000);
 assert.equal(data.rates.NEWCOIN,1/(2*.98));
 assert.equal(data.rates.USDT,1/.98);
 assert.equal(data.rates.INVALID,undefined);
 assert.equal(data.rates.DELISTED,undefined);
});
test('fiat and crypto sharing a ticker remain separate',()=>{
 const data={fiat:{rates:{RON:4.5,SCR:14}},crypto:{rates:{RON:.5,SCR:4,PEPE:500000}}};
 assert.deepEqual(mergeRates(data),{RON:4.5,SCR:14,'crypto:RON':.5,'crypto:SCR':4,'crypto:PEPE':500000});
 assert.equal(isCryptoAsset('RON',data),false);
 assert.equal(isCryptoAsset('crypto:RON',data),true);
 assert.equal(isCryptoAsset('crypto:PEPE',data),true);
 assert.equal(currencyName('crypto:RON','en-US',true),'Ronin');
 assert.equal(currencyName('RON','en-US',false),'Romanian Leu');
 assert.equal(currencyName('NEWCOIN','en-US',true),'NEWCOIN');
});

test('a failed spot request retains real BTC and TON index rates', async()=>{
 for (const failing of [INSTRUMENTS_URL,TICKERS_URL]) {
  const data=await loadCrypto(async url=>{
   if (url === failing) return {ok:false,status:503};
   return {ok:true,json:async()=>({code:'0',data:url === CRYPTO_URL ? [{instId:'BTC-USD',idxPx:'60000',ts:'1000'},{instId:'TON-USD',idxPx:'3',ts:'1000'}] : []})};
  });
  assert.equal(data.rates.BTC,1/60000);
  assert.equal(data.rates.TON,1/3);
  assert.equal(data.partial,true);
  assert.equal(data.stale,true);
 }
});
test('missing USD indices never fabricate a USDT/USD peg',async()=>{
 await assert.rejects(loadCrypto(async url=>({ok:url !== CRYPTO_URL,status:503,json:async()=>({code:'0',data:[]})})));
});
test('partial refreshes preserve previously available crypto and its timestamp',async()=>{
 const {retainRates}=await import('../src/data.js');
 const old={fiat:{rates:{USD:1}},crypto:{rates:{BTC:1/60000,TON:1/3},updatedAt:1000}};
 const empty=retainRates(old,{fiat:{rates:{USD:1,EUR:.9}},crypto:{rates:{},stale:true}});
 assert.deepEqual(empty.crypto,{...old.crypto,stale:true});
 assert.equal(empty.fiat.rates.EUR,.9);
 const partial=retainRates(old,{crypto:{rates:{BTC:1/70000},updatedAt:2000,partial:true}});
 assert.equal(partial.crypto.rates.TON,1/3);
 assert.equal(partial.crypto.rates.BTC,1/70000);
 assert.equal(partial.crypto.updatedAt,1000);
 assert.equal(partial.crypto.stale,true);
});

test('TON USD index is available even when TON has no live USDT spot pair', async()=>{
 const fixtures={
  [CRYPTO_URL]:[{instId:'BTC-USD',idxPx:'60000',ts:'1000'},{instId:'TON-USD',idxPx:'1.7',ts:'1000'}],
  [INSTRUMENTS_URL]:[{instId:'BTC-USDT',baseCcy:'BTC',quoteCcy:'USDT',state:'live',instType:'SPOT'}],
  [TICKERS_URL]:[{instId:'BTC-USDT',last:'60000',ts:'1000'}],
 };
 const data=await loadCrypto(async url=>({ok:true,json:async()=>({code:'0',data:fixtures[url]})}));
 assert.equal(data.rates.TON,1/1.7);
 assert.equal(data.partial,undefined);
});

test('crypto IDs and classification do not change when fiat fails or recovers',()=>{
 const crypto={rates:{RON:.5,SCR:4,BTC:1/60000}};
 for(const fiat of [undefined,{rates:{}},{rates:{RON:4.5,SCR:14}}]) {
  const data={crypto,fiat};
  const merged=mergeRates(data);
  assert.equal(merged['crypto:RON'],.5);
  assert.equal(merged['crypto:SCR'],4);
  assert.equal(merged['crypto:BTC'],1/60000);
  assert.equal(isCryptoAsset('RON',data),false);
  assert.equal(isCryptoAsset('crypto:RON',data),true);
 }
});
test('legacy preferences migrate using their saved source snapshot',async()=>{
 const {migrateAssetId}=await import('../src/data.js');
 const onlyCrypto={crypto:{rates:{RON:.5,SCR:4}}};
 assert.equal(migrateAssetId('RON',onlyCrypto),'crypto:RON');
 assert.equal(migrateAssetId('SCR',onlyCrypto),'crypto:SCR');
 assert.equal(migrateAssetId('RON',{...onlyCrypto,fiat:{rates:{RON:4.5}}}),'RON');
 assert.equal(migrateAssetId('crypto:RON',null),'crypto:RON');
 assert.equal(migrateAssetId('BTC',null),'crypto:BTC');
 assert.equal(migrateAssetId('USD',null),'USD');
});
