import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const telegramFixture = fileURLToPath(new URL('./fixtures/telegram.js', import.meta.url));
async function mockRates(page, responses) {
 let count = 0;
 await page.route('**/__test/rates', route => route.fulfill({json:responses[Math.min(count++, responses.length - 1)]}));
}
const payload = {fiat:{rates:{USD:1,AED:3.6725,RUB:84.84,TRY:49.18,NGN:1322.04,KZT:455.28,BYN:3.2,EUR:.86,RON:4.5},updatedAt:Date.now()},crypto:{rates:{BTC:1/60000,ETH:1/3000,TON:1/3,PEPE:500000,RON:.5},updatedAt:Date.now()}};
test.beforeEach(async ({page}) => {
  await page.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'application/javascript',path:telegramFixture}));
  await mockRates(page,[{result:payload}]);
});
test('conversion, keyboard, search, list customization and persistence', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Converter'})).toBeVisible();
  await expect(page.locator('.currency-row').first()).toContainText('3.67');
  await page.locator('.base-button').click();
  await page.getByRole('button',{name:'AC',exact:true}).click();
  for (const n of ['5','5','6']) await page.getByRole('button',{name:n,exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Amount'})).toHaveValue('556');
  await expect(page.locator('.currency-row').first()).toContainText('2,041.91');
  await page.screenshot({path:'/tmp/exchangel-converter.png'});
  await page.getByRole('button',{name:'Done',exact:false}).click();
  await page.getByRole('button',{name:'Search currencies',exact:true}).click();
  await page.getByRole('textbox',{name:'Search currencies'}).fill('Bitcoin');
  await page.locator('.picker-row').click();
  await expect(page.locator('.base-button')).toContainText('Bitcoin');
  await page.getByRole('button',{name:'My currencies',exact:true}).click();
  await page.getByRole('textbox',{name:'Search currencies'}).fill('RUB');
  await page.locator('.picker-row').filter({hasText:'Russian Ruble'}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
  await expect(page.locator('.currency-row').filter({has:page.getByText('RUB',{exact:true})})).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.base-button')).toContainText('Bitcoin');
  await expect(page.locator('.currency-row').filter({has:page.getByText('RUB',{exact:true})})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('mobile summary and narrow viewport fit',async({page})=>{
  await page.goto('/');await expect(page.locator('.currency-row').first()).toContainText('3.67');
  await page.screenshot({path:'/tmp/exchangel-summary.png'});
  await page.setViewportSize({width:320,height:568});
  await page.locator('.base-button').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button',{name:'Done',exact:false})).toBeInViewport();
});
test('failure offers retry and does not fabricate rates', async ({page}) => {
  await mockRates(page,[{error:{message:'Unavailable'}}]);
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Could not refresh rates');
  await expect(page.locator('.currency-row').first()).toContainText('—');
  await expect(page.getByRole('button',{name:'Retry'})).toBeVisible();
});
test('calculator evaluates operations and blocks division by zero', async ({page}) => {
  await page.goto('/');await page.locator('.base-button').click();
  await page.getByRole('textbox',{name:'Amount'}).fill('2+3*4');
  await expect(page.locator('.amount span')).toHaveText('$14');
  await page.getByRole('textbox',{name:'Amount'}).fill('1/0');
  await expect(page.locator('.amount span')).toHaveText('Check the expression');
  await expect(page.locator('.currency-row').first()).toContainText('—');
});
test('sheets animate out, restore focus and dismiss with a swipe', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('.eyebrow')).toHaveCount(0);
  await page.locator('.base-button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.getByRole('button',{name:'Done',exact:false}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.base-button')).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await page.locator('.base-button').click();
  await expect(page.getByRole('dialog')).toBeInViewport();
  const handle=page.locator('.sheet-handle');
  // Wait for the panel transition to finish before starting the gesture.
  await expect.poll(async () => Math.abs(await page.getByRole('dialog').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m42))).toBeLessThan(1);
  const box=await handle.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2+160,{steps:12});
  await page.mouse.up();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('reduced motion shows exact amounts and accessible controls',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('.currency-row').first()).toContainText('3.67');
  await expect(page.locator('.rolling-digits')).toHaveCount(0);
  await page.locator('.base-button').click();
  await expect(page.getByRole('dialog')).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.base-button')).toBeFocused();
});
test('search filters currencies and crypto, including coins outside the old shortlist', async ({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Search currencies',exact:true}).click();
 const filters=page.getByRole('group',{name:'Currency type'});
 await filters.getByRole('button',{name:'Crypto',exact:true}).click();
 await expect(page.locator('.picker-row').filter({has:page.getByText('USD',{exact:true})})).toHaveCount(0);
 await page.getByRole('textbox',{name:'Search currencies'}).fill('PEPE');
 await expect(page.locator('.picker-row')).toHaveCount(1);
 await page.locator('.picker-row').click();
 await expect(page.locator('.base-button')).toContainText('PEPE');
 await page.getByRole('button',{name:'My currencies',exact:true}).click();
 await page.getByRole('textbox',{name:'Search currencies'}).fill('RON');
 await expect(page.locator('.picker-row')).toHaveCount(2);
 await filters.getByRole('button',{name:'Currencies',exact:true}).click();
 await expect(page.locator('.picker-row')).toHaveCount(1);
 await expect(page.locator('.picker-row')).toContainText('Romanian Leu');
 await filters.getByRole('button',{name:'Crypto',exact:true}).click();
 await expect(page.locator('.picker-row')).toHaveCount(1);
 await expect(page.locator('.picker-row')).toContainText('Ronin');
 await page.locator('.picker-row').click();
 await page.getByRole('button',{name:'Done',exact:true}).click();
 await expect(page.locator('.currency-row').filter({hasText:'Ronin'})).toHaveCount(1);
});

test('typing updates values without replacing currency rows or their images', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('.currency-row').first()).toContainText('3.67');
  await page.locator('.base-button').click();
  await page.evaluate(() => { window.originalRow = document.querySelector('.currency-row'); window.originalIcon = window.originalRow.querySelector('img'); });
  await page.getByRole('textbox', {name:'Amount'}).fill('123.45');
  await expect(page.locator('.currency-row').first()).toContainText('453.37');
  expect(await page.evaluate(() => document.querySelector('.currency-row') === window.originalRow && window.originalRow.querySelector('img') === window.originalIcon)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('switching base reuses rows and animates their movement, including rapid taps',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.currency-row').first()).toContainText('3.67');
 const result=await page.evaluate(()=>{
  const row=document.querySelector('.currency-row[data-code="AED"]');
  window.preservedRow=row;
  document.querySelector('.currency-row[data-code="RUB"]').click();
  return {same:row===document.querySelector('.currency-row[data-code="AED"]'),moving:row.getAnimations().some(a=>a.effect.getKeyframes().some(f=>f.transform && f.transform!=='translateY(0)'))};
 });
 expect(result).toEqual({same:true,moving:true});
 await page.evaluate(()=>{for(const code of ['USD','TRY','AED']) document.querySelector(`.currency-row[data-code="${code}"]`).click();});
 await expect(page.locator('.base-code')).toHaveText('AED');
 await expect.poll(()=>page.locator('body > .currency-row').count()).toBe(0);
 expect(await page.locator('.currencies > .currency-row').evaluateAll(rows=>new Set(rows.map(r=>r.dataset.code)).size===rows.length)).toBe(true);
});
test('Telegram partial response preserves cached BTC and TON',async({page})=>{
 await page.addInitScript(payload=>localStorage.setItem('exchangel.rates',JSON.stringify(payload)),payload);
 await mockRates(page,[{result:{...payload,crypto:{rates:{},stale:true}}}]);
 await page.goto('/');
 await expect(page.locator('.currency-row[data-code="crypto:BTC"]')).toContainText('0.00001667');
 await expect(page.locator('.currency-row[data-code="crypto:TON"]')).toContainText('0.33333333');
 await expect(page.locator('.updated')).toContainText('Saved rates');
});
test('Telegram missing crypto is explicit and retry restores it',async({page})=>{
 await mockRates(page,[{result:{...payload,crypto:{rates:{},stale:true}}},{result:payload}]);
 await page.goto('/');
 await expect(page.getByRole('alert')).toContainText('Could not load crypto rates');
 await expect(page.locator('.currency-row[data-code="crypto:BTC"]')).toContainText('—');
 await page.getByRole('button',{name:'Retry'}).click();
 await expect(page.getByRole('alert')).toBeHidden();
 await expect(page.locator('.currency-row[data-code="crypto:BTC"]')).toContainText('0.00001667');
});

test('loaded flag and crypto images survive repeated moves between list and dock',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.currency-row[data-code="crypto:BTC"] img')).toBeVisible();
 await page.waitForFunction(()=>['.base-button img','.currency-row[data-code="AED"] img','.currency-row[data-code="crypto:BTC"] img'].every(selector=>{const img=document.querySelector(selector);return img?.complete && img.naturalWidth>0;}));
 const result=await page.evaluate(()=>{
  const usd=document.querySelector('.base-button img');
  const aed=document.querySelector('.currency-row[data-code="AED"] img');
  const btc=document.querySelector('.currency-row[data-code="crypto:BTC"] img');
  document.querySelector('.currency-row[data-code="AED"]').click();
  const first=document.querySelector('.base-button img')===aed && document.querySelector('.currency-row[data-code="USD"] img')===usd;
  document.querySelector('.currency-row[data-code="crypto:BTC"]').click();
  const second=document.querySelector('.base-button img')===btc && document.querySelector('.currency-row[data-code="AED"] img')===aed;
  document.querySelector('.currency-row[data-code="USD"]').click();
  return {first,second,back:document.querySelector('.base-button img')===usd,decoded:[usd,aed,btc].every(img=>img.complete && img.naturalWidth>0 && img.loading==='eager')};
 });
 expect(result).toEqual({first:true,second:true,back:true,decoded:true});
});

test('editor keeps unchecked currencies in place so selection can be restored immediately',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'My currencies',exact:true}).click();
 const rub=page.locator('.picker-row[data-code="RUB"]');
 await expect.poll(async()=>Math.abs(await page.getByRole('dialog').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m42))).toBeLessThan(1);
 const before=await rub.boundingBox();
 await page.evaluate(()=>{window.editorRow=document.querySelector('.picker-row[data-code="RUB"]');window.editorImage=window.editorRow.querySelector('img');});
 await rub.click();
 await expect(rub).toHaveAttribute('aria-pressed','false');
 expect((await rub.boundingBox()).y).toBe(before.y);
 expect(await page.evaluate(()=>window.editorRow===document.querySelector('.picker-row[data-code="RUB"]') && window.editorImage===window.editorRow.querySelector('img'))).toBe(true);
 await rub.click();
 await expect(rub).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Done',exact:true}).click();
 await expect(page.locator('.currencies .currency-row').nth(1)).toHaveAttribute('data-code','RUB');
 await page.reload();
 await expect(page.locator('.currencies .currency-row').nth(1)).toHaveAttribute('data-code','RUB');
});

test('editor keeps added currencies in place and preserves the current scroll position',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'My currencies',exact:true}).click();
 const row=page.locator('.picker-row[data-code="crypto:PEPE"]');
 await expect.poll(async()=>Math.abs(await page.getByRole('dialog').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m42))).toBeLessThan(1);
 await row.scrollIntoViewIfNeeded();
 const before=await row.boundingBox();
 const scroll=await page.locator('.picker-list').evaluate(el=>el.scrollTop);
 await row.click();
 await expect(row).toHaveAttribute('aria-pressed','true');
 expect((await row.boundingBox()).y).toBe(before.y);
 expect(await page.locator('.picker-list').evaluate(el=>el.scrollTop)).toBe(scroll);
 await row.click();
 await expect(row).toHaveAttribute('aria-pressed','false');
 await page.getByRole('textbox',{name:'Search currencies'}).fill('RUB');
 const rub=page.locator('.picker-row[data-code="RUB"]');
 await rub.click();
 await expect(rub).toHaveAttribute('aria-pressed','false');
 await expect(rub).toBeVisible();
});

test('amounts interpolate smoothly and rapid input continues from the displayed value',async({page})=>{
 await page.clock.install();
 await page.goto('/');
 await expect(page.locator('.currency-row[data-code="AED"]')).toContainText('3.67');
 await page.locator('.base-button').click();
 await page.clock.runFor(350);
 const input=page.getByRole('textbox',{name:'Amount'});
 const amount=page.locator('.currency-row[data-code="AED"] .currency-value>span');
 await input.fill('100');
 await page.clock.runFor(180);
 const intermediate=Number((await amount.textContent()).replaceAll(',',''));
 expect(intermediate).toBeGreaterThan(3.67);
 expect(intermediate).toBeLessThan(367.25);
 const retargeted=await page.evaluate(()=>{
  const output=document.querySelector('.currency-row[data-code="AED"] .currency-value>span');
  const input=document.querySelector('.amount input');
  const before=output.textContent;
  input.value='200';input.dispatchEvent(new Event('input',{bubbles:true}));
  return {before,after:output.textContent};
 });
 expect(retargeted.after).toBe(retargeted.before);
 await page.clock.runFor(500);
 await expect(amount).toHaveText('734.5');
 await input.fill('1/0');
 await expect(amount).toHaveText('—');
 await page.clock.runFor(500);
 await expect(amount).toHaveText('—');
});

test('reduced motion changes amounts immediately without interpolation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 await page.locator('.base-button').click();
 await page.getByRole('textbox',{name:'Amount'}).fill('100');
 expect(await page.locator('.currency-row[data-code="AED"] .currency-value>span').textContent()).toBe('367.25');
});

test('Ronin base and saved Scroll survive fiat recovery and reload',async({page})=>{
 const full={...payload,crypto:{...payload.crypto,rates:{...payload.crypto.rates,SCR:4}}};
 await mockRates(page,[{result:{...full,fiat:{rates:{},stale:true}}},{result:full}]);
 await page.goto('/');
 await page.getByRole('button',{name:'Search currencies',exact:true}).click();
 await page.getByRole('textbox',{name:'Search currencies'}).fill('RON');
 await page.locator('.picker-row[data-code="crypto:RON"]').click();
 await expect(page.locator('.base-button')).toContainText('Ronin');
 await page.getByRole('button',{name:'My currencies',exact:true}).click();
 await page.getByRole('textbox',{name:'Search currencies'}).fill('SCR');
 await page.locator('.picker-row[data-code="crypto:SCR"]').click();
 await page.getByRole('button',{name:'Done',exact:true}).click();
 await page.getByRole('button',{name:'Refresh rates'}).click();
 await expect(page.getByRole('alert')).toBeHidden();
 await expect(page.locator('.base-button')).toContainText('Ronin');
 await expect(page.locator('.currency-row[data-code="crypto:SCR"]')).toContainText('Scroll');
 await expect(page.locator('.currency-row[data-code="crypto:SCR"] .currency-value>span')).toHaveText('8');
 await page.reload();
 await expect(page.locator('.base-button')).toContainText('Ronin');
 const preferences=await page.evaluate(()=>JSON.parse(localStorage.getItem('exchangel.preferences.v2')));
 expect(preferences.base).toBe('crypto:RON');
 expect(preferences.selected).toContain('crypto:SCR');
});

test('existing crypto-only preferences migrate before a full refresh arrives',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('exchangel.base','"RON"');
  localStorage.setItem('exchangel.currencies',JSON.stringify(['RON','SCR','BTC']));
  localStorage.setItem('exchangel.rates',JSON.stringify({crypto:{rates:{RON:.5,SCR:4,BTC:1/60000}}}));
 });
 await page.goto('/');
 await expect(page.locator('.base-button')).toContainText('Ronin');
 const preferences=await page.evaluate(()=>JSON.parse(localStorage.getItem('exchangel.preferences.v2')));
 expect(preferences).toEqual({base:'crypto:RON',selected:['crypto:RON','crypto:SCR','crypto:BTC']});
 await page.reload();
 await expect(page.locator('.base-button')).toContainText('Ronin');
});

test('icons share one fetch across calculator, search, editor and page reload',async({page})=>{
 let requests=0;
 await page.route('**/flags/us.svg',route=>{
  requests++;
  return route.fulfill({contentType:'image/svg+xml',headers:{'cache-control':'no-store'},body:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24"><rect width="32" height="24" fill="red"/></svg>'});
 });
 const decoded=async selector=>page.waitForFunction(selector=>{const img=document.querySelector(selector);return img?.complete && img.naturalWidth>0;},selector);
 await page.goto('/');
 await decoded('.base-button img');
 expect(requests).toBe(1);
 await page.locator('.base-button').click();
 await decoded('.input-currency img');
 await page.getByRole('button',{name:'Done',exact:false}).click();
 await page.getByRole('button',{name:'Search currencies',exact:true}).click();
 await page.getByRole('textbox',{name:'Search currencies'}).fill('USD');
 await decoded('.picker-row[data-code="USD"] img');
 await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('button',{name:'My currencies',exact:true}).click();
 await decoded('.picker-row[data-code="USD"] img');
 expect(requests).toBe(1);
 await page.reload();
 await decoded('.base-button img');
 expect(requests).toBe(1);
});

test('icons still load when the WebView denies persistent cache access',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'caches',{get(){throw new Error('Storage disabled');}}));
 await page.goto('/');
 await page.waitForFunction(()=>{const img=document.querySelector('.base-button img');return img?.complete && img.naturalWidth>0;});
 await page.locator('.base-button').click();
 await page.waitForFunction(()=>{const img=document.querySelector('.input-currency img');return img?.complete && img.naturalWidth>0;});
});

test('pending icons shimmer, reveal on load and skip waiting animation when cached',async({page})=>{
 let release;
 await page.route('**/flags/us.svg',async route=>{
  await new Promise(resolve=>{release=resolve;});
  await route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24"><rect width="32" height="24" fill="red"/></svg>'});
 });
 await page.goto('/');
 const placeholder=page.locator('.base-button .currency-icon');
 await expect(placeholder).toHaveAttribute('aria-busy','true');
 expect(await placeholder.evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('icon-shimmer');
 await page.emulateMedia({reducedMotion:'reduce'});
 expect(await placeholder.evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect.poll(()=>Boolean(release)).toBe(true);
 release();
 await expect(placeholder).not.toHaveClass(/icon-loading/);
 await page.waitForFunction(()=>document.querySelector('.base-button img')?.naturalWidth>0);
 await page.locator('.base-button').click();
 await expect(page.locator('.input-currency .currency-icon')).not.toHaveClass(/icon-loading/);
});

test('failed icons stop their loading animation',async({page})=>{
 await page.route('**/flags/us.svg',route=>route.fulfill({status:404,body:''}));
 await page.goto('/');
 await expect(page.locator('.base-button .icon-unavailable')).toBeVisible();
 await expect(page.locator('.base-button .currency-icon')).not.toHaveClass(/icon-loading/);
 await expect(page.locator('.base-button .currency-icon')).not.toHaveAttribute('aria-busy');
});

test('virtual scrolling keeps DOM bounded and shimmer active without row-height jumps',async({page})=>{
 const many={...payload,crypto:{rates:Object.fromEntries(Array.from({length:600},(_,i)=>['COIN'+i,1])),updatedAt:Date.now()}};
 await mockRates(page,[{result:many}]);
 let release;
 const gate=new Promise(resolve=>{release=resolve;});
 let active=0,peak=0;
 await page.route(/\/(?:flags\/.*\.svg|crypto\/.*\.png|currency\/icon\/.*\.png)/,async route=>{
  active++;peak=Math.max(peak,active);
  await gate;
  await route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24"><rect width="32" height="24" fill="red"/></svg>'});
  active--;
 });
 await page.goto('/');
 await page.getByRole('button',{name:'Search currencies',exact:true}).click();
 await page.getByRole('group',{name:'Currency type'}).getByRole('button',{name:'Crypto',exact:true}).click();
 await expect(page.locator('.picker-list')).toHaveAttribute('data-total','603');
 expect(await page.locator('.picker-row').count()).toBeLessThan(30);
 const list=page.locator('.picker-list');
 const before=await list.evaluate(el=>{
  el.scrollTop=10000;el.dispatchEvent(new Event('scroll'));
  return {height:el.scrollHeight,top:el.scrollTop};
 });
 await expect.poll(()=>page.locator('.picker-row').first().getAttribute('data-list-index')).not.toBe('0');
 await expect.poll(()=>page.locator('.picker-list .icon-loading.icon-visible').count()).toBeGreaterThan(0);
 expect(await page.locator('.picker-list .icon-loading.icon-visible').first().evaluate(el=>getComputedStyle(el,'::after').animationPlayState)).toBe('running');
 expect(await page.locator('.picker-row').count()).toBeLessThan(30);
 expect(peak).toBeLessThanOrEqual(4);
 expect(peak).toBeGreaterThan(0);
 release();
 expect(await list.evaluate(el=>({height:el.scrollHeight,top:el.scrollTop}))).toEqual({height:before.height,top:before.top});
});

test('virtual list reaches its last currency by keyboard and keeps edits after recycling',async({page})=>{
 const many={...payload,crypto:{rates:Object.fromEntries(Array.from({length:1200},(_,i)=>['COIN'+String(i).padStart(4,'0'),1])),updatedAt:Date.now()}};
 await mockRates(page,[{result:many}]);
 await page.goto('/');
 await page.getByRole('button',{name:'My currencies',exact:true}).click();
 await page.getByRole('group',{name:'Currency type'}).getByRole('button',{name:'Crypto',exact:true}).click();
 await page.locator('.picker-row').first().focus();
 await page.keyboard.press('End');
 const last=page.locator('.picker-row[data-code="crypto:COIN1199"]');
 await expect(last).toBeFocused();
 await last.click();
 await expect(last).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('Home');
 await expect(last).toHaveCount(0);
 await page.keyboard.press('End');
 await expect(last).toHaveAttribute('aria-pressed','true');
 expect(await page.locator('.picker-row').count()).toBeLessThan(30);
 const centers=await last.locator('.check').evaluate(el=>{const a=el.getBoundingClientRect(),b=el.querySelector('svg').getBoundingClientRect();return [Math.abs(a.x+a.width/2-b.x-b.width/2),Math.abs(a.y+a.height/2-b.y-b.height/2)];});
 expect(Math.max(...centers)).toBeLessThan(1);
 await page.getByRole('textbox',{name:'Search currencies'}).fill('COIN0042');
 await expect(page.locator('.picker-row')).toHaveCount(1);
 await expect(page.locator('.picker-row')).toContainText('COIN0042');
});

test('touch drag follows the handle and restores Telegram swipe behavior on close',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'My currencies',exact:true}).click();
 expect(await page.evaluate(()=>window.Telegram.WebApp.isVerticalSwipesEnabled)).toBe(false);
 await expect.poll(async()=>Math.abs(await page.getByRole('dialog').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m42))).toBeLessThan(1);
 const box=await page.locator('.sheet-handle').boundingBox();
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 const x=box.x+box.width/2,y=box.y+box.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+120}]});
 expect(await page.getByRole('dialog').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m42)).toBeGreaterThan(80);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect(page.getByRole('dialog')).toHaveCount(0);
 expect(await page.evaluate(()=>window.Telegram.WebApp.swipeCalls)).toEqual(['disable','enable']);
 await cdp.detach();
});

for (const kind of ['picker', 'calculator']) test(`handle expands upward, collapses downward, then dismisses the ${kind}`,async({page})=>{
 await page.goto('/');
 if (kind === 'picker') await page.getByRole('button',{name:'My currencies',exact:true}).click();
 else await page.locator('.base-button').click();
 const dialog=page.getByRole('dialog');
 await expect.poll(async()=>Math.abs(await dialog.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m42))).toBeLessThan(1);
 const compact=(await dialog.boundingBox()).height;
 const drag=async delta=>{
  await expect.poll(()=>dialog.evaluate(el=>el.getAnimations().length)).toBe(0);
  const box=await page.locator('.sheet-handle').boundingBox();
  const x=box.x+box.width/2,y=box.y+box.height/2;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x,y+delta,{steps:12});await page.mouse.up();
 };
 await drag(-140);
 await expect(dialog).toHaveAttribute('data-expanded','true');
 await expect.poll(async()=>(await dialog.boundingBox()).height).toBeGreaterThan(compact+80);
 await expect(page.getByRole('button',{name:'Done',exact:false})).toBeInViewport();
 expect(await page.evaluate(()=>window.Telegram.WebApp.isVerticalSwipesEnabled)).toBe(false);
 await drag(140);
 await expect(dialog).toHaveAttribute('data-expanded','false');
 await expect.poll(async()=>Math.abs((await dialog.boundingBox()).height-compact)).toBeLessThan(1);
 await drag(140);
 await expect(dialog).toHaveCount(0);
 expect(await page.evaluate(()=>window.Telegram.WebApp.isVerticalSwipesEnabled)).toBe(true);
});

test('BYN uses a bundled vector symbol in the list and calculator',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const row=page.locator('.currency-row[data-code="BYN"]');
 const symbol=row.locator('.currency-value .currency-symbol-byn');
 await expect(symbol).toBeVisible();
 await expect(symbol).toHaveAttribute('aria-hidden','true');
 expect(await symbol.evaluate(el=>getComputedStyle(el).webkitMaskImage)).toContain('byn-symbol');
 await expect(page.locator('.currency-row[data-code="EUR"] .currency-value small')).toHaveText('€');
 await row.click();
 await page.locator('.base-button').click();
 const preview=page.locator('.amount>span');
 await expect(preview.locator('.currency-symbol-byn')).toBeVisible();
 await page.getByRole('textbox',{name:'Amount',exact:true}).fill('1000+32.95');
 await expect(preview).toHaveText('1,032.95');
 await page.getByRole('textbox',{name:'Amount',exact:true}).fill('1/0');
 await expect(preview).toHaveText('Check the expression');
 await expect(preview.locator('.currency-symbol-byn')).toHaveCount(0);
});
