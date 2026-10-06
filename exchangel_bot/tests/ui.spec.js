import { test, expect } from '@playwright/test';
const payload = {fiat:{rates:{USD:1,AED:3.6725,RUB:84.84,TRY:49.18,NGN:1322.04,KZT:455.28,BYN:3.2,EUR:.86,RON:4.5},updatedAt:Date.now()},crypto:{rates:{BTC:1/60000,ETH:1/3000,TON:1/3,PEPE:500000,RON:.5},updatedAt:Date.now()}};
test.beforeEach(async ({page}) => {
  await page.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'application/javascript',body:`window.Telegram={WebApp:{initData:'test',Serverless:{call:(name,input,cb)=>cb(null,${JSON.stringify(payload)})}}};`}));
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
  await page.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'application/javascript',body:`window.Telegram={WebApp:{initData:'test',Serverless:{call:(n,i,cb)=>cb({message:'Unavailable'})}}};`}));
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
 await page.route('https://telegram.org/js/telegram-web-app.js',route=>route.fulfill({contentType:'application/javascript',body:`window.Telegram={WebApp:{initData:'test',Serverless:{call:(n,i,cb)=>cb(null,${JSON.stringify({...payload,crypto:{rates:{},stale:true}})})}}};`}));
 await page.goto('/');
 await expect(page.locator('.currency-row[data-code="BTC"]')).toContainText('0.00001667');
 await expect(page.locator('.currency-row[data-code="TON"]')).toContainText('0.33333333');
 await expect(page.locator('.updated')).toContainText('Saved rates');
});
test('Telegram missing crypto is explicit and retry restores it',async({page})=>{
 await page.route('https://telegram.org/js/telegram-web-app.js',route=>route.fulfill({contentType:'application/javascript',body:`let count=0;window.Telegram={WebApp:{initData:'test',Serverless:{call:(n,i,cb)=>cb(null,count++ ? ${JSON.stringify(payload)} : ${JSON.stringify({...payload,crypto:{rates:{},stale:true}})})}}};`}));
 await page.goto('/');
 await expect(page.getByRole('alert')).toContainText('Could not load crypto rates');
 await expect(page.locator('.currency-row[data-code="BTC"]')).toContainText('—');
 await page.getByRole('button',{name:'Retry'}).click();
 await expect(page.getByRole('alert')).toBeHidden();
 await expect(page.locator('.currency-row[data-code="BTC"]')).toContainText('0.00001667');
});

test('loaded flag and crypto images survive repeated moves between list and dock',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.currency-row[data-code="BTC"] img')).toBeVisible();
 await page.waitForFunction(()=>['.base-button img','.currency-row[data-code="AED"] img','.currency-row[data-code="BTC"] img'].every(selector=>{const img=document.querySelector(selector);return img?.complete && img.naturalWidth>0;}));
 const result=await page.evaluate(()=>{
  const usd=document.querySelector('.base-button img');
  const aed=document.querySelector('.currency-row[data-code="AED"] img');
  const btc=document.querySelector('.currency-row[data-code="BTC"] img');
  document.querySelector('.currency-row[data-code="AED"]').click();
  const first=document.querySelector('.base-button img')===aed && document.querySelector('.currency-row[data-code="USD"] img')===usd;
  document.querySelector('.currency-row[data-code="BTC"]').click();
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
 const row=page.locator('.picker-row[data-code="PEPE"]');
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
