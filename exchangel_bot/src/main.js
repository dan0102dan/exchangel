import { calculate, convert } from './calc.js';
import { defaults, region, currencyName, format, symbols, isCryptoAsset, assetCode, mergeRates, cryptoNames, getRates, retainRates, migrateAssetId } from './data.js';
import './style.css';

const tg = window.Telegram?.WebApp;
const ru = (tg?.initDataUnsafe?.user?.language_code || navigator.language).startsWith('ru');
const locale = ru ? 'ru-RU' : 'en-US';
const text = {
  summary: ru ? 'Обзор' : 'Summary', converter: ru ? 'Конвертер' : 'Converter', rates: ru ? 'Курсы' : 'Rates',
  tap: ru ? 'Изменить сумму' : 'Edit amount', input: ru ? 'Исходная валюта' : 'Input currency',
  hint: ru ? 'Нажмите на валюту, чтобы сделать её основной.' : 'Tap any currency to make it your base currency.',
  search: ru ? 'Поиск валюты' : 'Search currencies', manage: ru ? 'Мои валюты' : 'My currencies',
  edit: ru ? 'Изменить' : 'Edit', change: ru ? 'Валюта' : 'Currency',
  all: ru ? 'Все' : 'All', fiat: ru ? 'Валюты' : 'Currencies', crypto: ru ? 'Крипто' : 'Crypto',
  category: ru ? 'Тип валюты' : 'Currency type',
  selected: ru ? 'В списке' : 'In your list', available: ru ? 'Добавить валюты' : 'Add currencies',
  manageHint: ru ? 'Выберите валюты для главного экрана.' : 'Choose the currencies shown on your home screen.',
  refresh: ru ? 'Обновить курсы' : 'Refresh rates', done: ru ? 'Готово' : 'Done', close: ru ? 'Закрыть' : 'Close',
  noResults: ru ? 'Валюта не найдена' : 'No currencies found', loading: ru ? 'Загружаем курсы…' : 'Loading rates…',
  cryptoError: ru ? 'Не удалось загрузить курсы криптовалют' : 'Could not load crypto rates',
  error: ru ? 'Не удалось обновить курсы' : 'Could not refresh rates', retry: ru ? 'Повторить' : 'Retry',
  cached: ru ? 'Сохранённые курсы' : 'Saved rates', updated: ru ? 'Курсы на' : 'Rates as of',
  invalid: ru ? 'Проверьте выражение' : 'Check the expression', choose: ru ? 'Выберите валюту' : 'Choose currency',
};
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

const root = document.getElementById('root');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',backspace:'<path d="M9 5h12v14H9l-7-7Z"/><path d="m11 9 6 6m0-6-6 6"/>'})[name]}</svg>`;
const preferencesKey = 'exchangel.preferences.v2';
let data = read('exchangel.rates', null), rates = mergeRates(data);
const preferences = read(preferencesKey, null);
let base = preferences?.base ?? read('exchangel.base', 'USD');
if (typeof base !== 'string') base = 'USD';
let selected = preferences?.selected ?? read('exchangel.currencies', defaults);
selected = Array.isArray(selected) ? selected.filter(c => typeof c === 'string') : [...defaults];
if (!preferences) {
  base = migrateAssetId(base, data);
  selected = selected.map(code => migrateAssetId(code, data));
}
selected = [...new Set(selected)];
function savePreferences() { save(preferencesKey, { base, selected }); }
savePreferences();
let lastRefresh = 0;
let loading = false, failed = false, cached = Boolean(data), expression = '1';
let sheet = null, layer = null, panel = null, opener, previousOverflow, closing = false;
let query = '', category = 'all', catalog = [], rowNodes = new Map();
let editorCatalog = [];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const crypto = code => isCryptoAsset(code, data);
const name = code => currencyName(code, locale, crypto(code));
const number = (value, code) => format(value, code, locale, crypto(code));
function currencyIcon(id, lazy = false) {
  const code = assetCode(id), isCrypto = crypto(id);
  const src = isCrypto ? (cryptoNames[code] ? `/crypto/${code}.png` : `https://static.okx.com/cdn/oksupport/asset/currency/icon/${encodeURIComponent(code.toLowerCase())}.png`) : `/flags/${region(code)}.svg`;
  return `<span class="currency-icon ${isCrypto ? 'crypto' : ''}"><img loading="${lazy ? 'lazy' : 'eager'}" decoding="${lazy ? 'async' : 'sync'}" width="32" height="32" src="${escape(src)}" alt=""></span>`;
}
// Keep the already decoded image when a currency moves between a row and dock.
const mainIcons = new Map();
function mainIcon(code) {
  const signature = `${code}:${crypto(code)}`;
  let icon = mainIcons.get(signature);
  if (!icon) {
    const template = document.createElement('template');
    template.innerHTML = currencyIcon(code);
    icon = template.content.firstElementChild;
    mainIcons.set(signature, icon);
  }
  return icon;
}
function adoptPickerIcon(button, code) {
  const icon = button.querySelector('.currency-icon');
  const img = icon?.querySelector('img');
  if (img?.complete && img.naturalWidth > 0) {
    img.loading = 'eager'; img.decoding = 'sync';
    const signature = `${code}:${crypto(code)}`;
    const existing = mainIcons.get(signature)?.querySelector('img');
    if (!existing?.complete || !existing.naturalWidth) mainIcons.set(signature, icon);
  }
}
root.addEventListener('error', event => {
  if (event.target.tagName === 'IMG') event.target.outerHTML = '<span class="icon-unavailable" aria-hidden="true">—</span>';
}, true);
const info = code => `<span class="currency-info"><strong>${escape(assetCode(code))}</strong><span>${escape(name(code))}</span></span>`;
root.innerHTML = `<main class="app"><header class="header"><h1>${text.converter}</h1><button class="edit-list" data-action="manage" aria-label="${text.manage}">${text.edit}</button></header><div class="notice" role="alert" hidden><span class="error-message">${text.error}.</span> <button data-action="refresh">${text.retry}</button></div><div class="loading" role="status" hidden>${text.loading}</div><button class="empty-list" data-action="manage" hidden>＋ ${text.available}</button><section class="currencies" aria-label="${text.rates}"></section><p class="hint">${text.hint}</p><footer class="bottom-dock"><div class="dock-actions"><button class="base-button" data-action="calculator"></button><button class="round search-button" data-action="search" aria-label="${text.search}">${icon('search')}<span>${text.change}</span></button></div><button class="updated" data-action="refresh" aria-label="${text.refresh}"></button></footer></main>`;
const main = root.querySelector('main');
const list = main.querySelector('.currencies');
function rebuildCatalog() {
  catalog = [...new Set([...selected, ...Object.keys(rates).sort((a,b) => Number(crypto(a))-Number(crypto(b)) || a.localeCompare(b))])].map(code => ({code, crypto:crypto(code), search:`${assetCode(code)} ${name(code)}`.toLowerCase()}));
  if (sheet === 'manage') {
    const current = new Map(catalog.map(item => [item.code, item]));
    const known = new Set(editorCatalog.map(item => item.code));
    editorCatalog = [...editorCatalog.map(item => current.get(item.code) || item), ...catalog.filter(item => !known.has(item.code))];
  }
}
function renderRows(withMotion = false) {
  const moving = withMotion && !reduced.matches;
  const before = new Map();
  for (const [code, row] of rowNodes) {
    if (moving) before.set(code, row.getBoundingClientRect());
    row.getAnimations().forEach(animation => animation.cancel());
  }
  const visible = selected.filter(code => code !== base);
  for (const [code, row] of rowNodes) {
    if (visible.includes(code)) continue;
    const rect = before.get(code);
    if (moving && rect.bottom > 0 && rect.top < innerHeight) {
      const ghost = row.cloneNode(true);
      ghost.removeAttribute('data-action'); ghost.removeAttribute('data-code');
      ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
      ghost.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;pointer-events:none;z-index:2`;
      document.body.append(ghost);
      animate(ghost, [{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(14px)'}],260).finished.finally(() => ghost.remove());
    }
    row.remove(); rowNodes.delete(code);
  }
  visible.forEach((code, index) => {
    let row = rowNodes.get(code);
    if (!row) {
      row = document.createElement('button');
      row.className = 'currency-row'; row.dataset.code = code; row.dataset.action = 'base';
      row.innerHTML = `${info(code)}<span class="currency-value"><small dir="auto"></small><span></span></span>`;
      rowNodes.set(code, row);
    }
    const icon = mainIcon(code);
    if (row.firstElementChild !== icon) { row.querySelector('.currency-icon')?.remove(); row.prepend(icon); }
    if (list.children[index] !== row) list.insertBefore(row, list.children[index] || null);
  });
  main.querySelector('.empty-list').hidden = rowNodes.size > 0;
  const baseButton = main.querySelector('.base-button');
  if (baseButton.dataset.code !== base) {
    baseButton.dataset.code = base;
    baseButton.innerHTML = `<span class="currency-info"><strong><span class="base-value"></span> <span class="base-code">${escape(assetCode(base))}</span></strong><span>${escape(name(base))} · ${text.tap}</span></span>`;
  }
  const baseIcon = mainIcon(base);
  if (baseButton.firstElementChild !== baseIcon) { baseButton.querySelector('.currency-icon')?.remove(); baseButton.prepend(baseIcon); }
  updateValues(); updateStatus();
  if (moving) {
    // FLIP: measure once after layout, then animate compositor-only transforms.
    const after = new Map([...rowNodes].map(([code, row]) => [code,row.getBoundingClientRect()]));
    for (const [code, row] of rowNodes) {
      const rect = after.get(code), old = before.get(code);
      if (rect.bottom < 0 || rect.top > innerHeight) continue;
      if (old) {
        const delta = old.top - rect.top;
        if (Math.abs(delta) > .5) animate(row,[{transform:`translateY(${delta}px)`},{transform:'translateY(0)'}],380);
      } else animate(row,[{opacity:0,transform:'translateY(-12px)'},{opacity:1,transform:'translateY(0)'}],380);
    }
  }
}
// One frame loop for all amounts; no per-digit DOM or independent timers.
const amountStates = new WeakMap();
const amountTweens = new Map();
let amountFrame = 0;
function paintAmount(element, value, code) {
  const formatted = number(value, code);
  if (element.textContent !== formatted) element.textContent = formatted;
}
function tickAmounts(now) {
  amountFrame = 0;
  for (const [element, tween] of amountTweens) {
    if (!element.isConnected) { amountTweens.delete(element); continue; }
    const progress = reduced.matches ? 1 : Math.min(1, (now - tween.start) / 230);
    const eased = progress * progress * (3 - 2 * progress);
    const value = progress === 1 ? tween.target : tween.from * (1 - eased) + tween.target * eased;
    amountStates.set(element, { current: value, target: tween.target });
    paintAmount(element, value, tween.code);
    if (progress === 1) amountTweens.delete(element);
  }
  if (amountTweens.size) amountFrame = requestAnimationFrame(tickAmounts);
}
function updateAmount(element, target, code) {
  const previous = amountStates.get(element);
  if (previous?.target === target) return;
  if (reduced.matches || !Number.isFinite(previous?.current) || !Number.isFinite(target) || document.hidden) {
    amountTweens.delete(element);
    amountStates.set(element, { current: target, target });
    paintAmount(element, target, code);
    return;
  }
  amountStates.set(element, { current: previous.current, target });
  amountTweens.set(element, { from: previous.current, target, code, start: performance.now() });
  if (!amountFrame) amountFrame = requestAnimationFrame(tickAmounts);
}
function updateValues() {
  const value = calculate(expression);
  for (const [code,row] of rowNodes) {
    const target = convert(value, rates[base], rates[code]);
    const result = number(target, code);
    row.querySelector('.currency-value small').textContent = rates[code] && rates[base] && value !== null ? symbols[assetCode(code)] || '' : '';
    updateAmount(row.querySelector('.currency-value>span'), target, code);
    row.setAttribute('aria-label', `${name(code)}: ${result}`);
  }
  updateAmount(main.querySelector('.base-value'), value, base);
  if (sheet === 'calculator' && panel) {
    const input = panel.querySelector('.amount input');
    if (input.value !== expression) input.value = expression;
    panel.querySelector('.amount>span').textContent = value === null ? text.invalid : `${symbols[assetCode(base)] || ''}${number(value,base)}`;
  }
}
function updateStatus() {
  main.querySelector('.notice').hidden = !failed;
  main.querySelector('.error-message').textContent = (data?.fiat && !Object.keys(data?.crypto?.rates || {}).length ? text.cryptoError : text.error) + '.';
  main.querySelector('.loading').hidden = Boolean(data) || !loading;
  const button = main.querySelector('.updated');
  const stale = cached || data?.fiat?.stale || data?.crypto?.stale;
  const updated = data?.[crypto(base) ? 'crypto' : 'fiat']?.updatedAt;
  button.disabled = loading; button.classList.toggle('stale', Boolean(stale));
  button.innerHTML = `${escape(loading ? text.loading : `${stale ? text.cached : text.updated}${updated ? ' '+new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(updated) : ''}`)}<span class="${loading ? 'spin' : ''}">↻</span>`;
}
async function refresh() {
  if (loading) return;
  loading = true; failed = false; updateStatus();
  try { data = retainRates(data, await getRates()); failed = ['fiat','crypto'].some(source => !Object.keys(data[source]?.rates || {}).length); rates = mergeRates(data); save('exchangel.rates', data); cached = false; rebuildCatalog(); renderRows(); if (sheet && sheet !== 'calculator') renderPicker(); }
  catch { failed = true; cached = true; }
  finally { loading = false; lastRefresh = Date.now(); updateStatus(); }
}
function setBase(code) { base = code; expression = '1'; savePreferences(); renderRows(true); }
function animate(element, frames, duration = 320) {
  return element.animate(frames, {duration:reduced.matches ? 0 : duration, easing:'cubic-bezier(.25,.8,.25,1)'});
}
function openSheet(kind) {
  if (closing) return;
  query = ''; category = 'all'; sheet = kind;
  if (kind === 'manage') editorCatalog = [...catalog];
  if (!layer) {
    opener = document.activeElement; previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; main.inert = true;
    layer = document.createElement('div'); layer.className = 'sheet-layer';
    layer.innerHTML = `<button class="scrim" data-action="close" aria-label="${text.close}" tabindex="-1"></button><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"></section>`;
    root.append(layer); panel = layer.querySelector('.sheet');
    tg?.BackButton?.show(); tg?.BackButton?.onClick(closeSheet);
    renderSheet();
    animate(panel,[{transform:'translateY(110%)'},{transform:'translateY(0)'}]);
    animate(layer.querySelector('.scrim'),[{opacity:0},{opacity:1}]);
  } else renderSheet();
  panel.querySelector('button')?.focus({preventScroll:true});
}
async function closeSheet() {
  if (!layer || closing) return;
  closing = true;
  const start = getComputedStyle(panel).transform;
  const animation = animate(panel,[{transform:start},{transform:'translateY(110%)'}],260);
  animate(layer.querySelector('.scrim'),[{opacity:1},{opacity:0}],260);
  await animation.finished.catch(() => {});
  layer.remove(); layer = panel = sheet = null; closing = false;
  main.inert = false; document.body.style.overflow = previousOverflow;
  tg?.BackButton?.hide(); tg?.BackButton?.offClick(closeSheet);
  opener?.focus({preventScroll:true});
}
function renderSheet() {
  panel.className = `sheet ${sheet === 'calculator' ? 'calculator' : 'picker'}`;
  panel.innerHTML = `<div class="sheet-handle" aria-hidden="true"><span></span></div><div class="sheet-header"><h2 id="sheet-title">${sheet === 'calculator' ? text.converter : sheet === 'manage' ? text.manage : text.choose}</h2><button class="close" data-action="close" aria-label="${text.close}">${icon('close')}</button></div>`;
  if (sheet === 'calculator') {
    panel.insertAdjacentHTML('beforeend', `<div class="input-card"><button class="input-currency" data-action="search" aria-label="${text.choose}">${currencyIcon(base)}<span class="currency-info"><strong>${escape(name(base))}</strong><span>${text.input}</span></span></button><div class="amount"><input aria-label="${ru ? 'Сумма' : 'Amount'}" inputmode="none"><span></span></div></div><div class="keypad">${['1','2','3','+','4','5','6','−','7','8','9','×','.','0','back','÷'].map(k => `<button class="key ${'+−×÷'.includes(k) ? 'operator' : ''}" data-key="${k}" aria-label="${k === 'back' ? (ru ? 'Удалить цифру' : 'Delete digit') : k}">${k === 'back' ? icon('backspace') : k}</button>`).join('')}</div><div class="calc-actions"><button data-key="clear">AC</button><button data-action="close">${text.done} <span>↗</span></button></div>`);
    updateValues();
  } else {
    panel.insertAdjacentHTML('beforeend', `<div class="search-field">${icon('search')}<input aria-label="${text.search}" placeholder="${text.search}"><button data-action="clear-search" aria-label="${ru ? 'Очистить поиск' : 'Clear search'}" hidden>${icon('close')}</button></div><div class="currency-filter" role="group" aria-label="${text.category}">${['all','fiat','crypto'].map(type => `<button data-category="${type}" aria-pressed="${category === type}">${text[type]}</button>`).join('')}</div>${sheet === 'manage' ? `<p class="manage-hint">${text.manageHint}</p>` : ''}<div class="picker-list"></div>${sheet === 'manage' ? `<button class="editor-done" data-action="close">${text.done}</button>` : ''}`);
    renderPicker();
  }
  setupDrag();
}
function renderPicker() {
  // Keep the editor's opening order throughout this session, including searches.
  const entries = sheet === 'manage' ? editorCatalog : catalog;
  const matches = entries.filter(item => (category === 'all' || item.crypto === (category === 'crypto')) && item.search.includes(query.trim().toLowerCase()));
  const picked = new Set(selected);
  panel.querySelector('.picker-list').innerHTML = matches.map(({code}) => {
    const checked = sheet === 'manage' ? picked.has(code) : base === code;
    return `<button class="picker-row" data-action="choose" data-code="${escape(code)}" aria-pressed="${checked}">${currencyIcon(code, true)}${info(code)}<span class="check ${checked ? 'selected' : ''}">${checked ? '✓' : sheet === 'manage' ? '+' : ''}</span></button>`;
  }).join('') || `<p class="empty">${loading ? text.loading : text.noResults}</p>`;
  panel.querySelector('[data-action="clear-search"]').hidden = !query;
}
function key(k) {
  tg?.HapticFeedback?.selectionChanged();
  const value = calculate(expression);
  if (k === 'back') expression = expression.length > 1 ? expression.slice(0,-1) : '0';
  else if (k === 'clear') expression = '0';
  else if (k === '=') { if (value !== null) expression = String(Number(value.toPrecision(12))); }
  else if (expression.length < 32) {
    if ('+−×÷'.includes(k)) expression = /[+−×÷]$/.test(expression) ? expression.slice(0,-1)+k : expression+k;
    else if (!(k === '.' && expression.split(/[+−×÷]/).at(-1).includes('.'))) expression = expression === '0' && k !== '.' ? k : expression+k;
  }
  updateValues();
}
function setupDrag() {
  const handle = panel.querySelector('.sheet-handle');
  let startY, startTime, distance = 0;
  handle.addEventListener('pointerdown', event => {
    if (closing || (event.pointerType === 'mouse' && event.button !== 0)) return;
    startY = event.clientY; startTime = performance.now(); distance = 0;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', event => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    distance = Math.max(0,event.clientY-startY); panel.style.transform = `translateY(${distance}px)`;
  });
  const end = event => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    handle.releasePointerCapture(event.pointerId);
    if (event.type !== 'pointercancel' && (distance > 85 || distance > 15 && distance/(performance.now()-startTime) > .5)) closeSheet();
    else { animate(panel,[{transform:`translateY(${distance}px)`},{transform:'translateY(0)'}]); panel.style.transform = ''; }
  };
  handle.addEventListener('pointerup',end); handle.addEventListener('pointercancel',end);
}
root.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled || closing) return;
  if (button.dataset.key) return key(button.dataset.key);
  if (button.dataset.category) {
    category = button.dataset.category;
    panel.querySelectorAll('[data-category]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.category === category)));
    renderPicker(); panel.querySelector('.picker-list').scrollTop = 0; return;
  }
  const action = button.dataset.action;
  if (['calculator','manage','search'].includes(action)) openSheet(action);
  else if (action === 'close') closeSheet();
  else if (action === 'refresh') refresh();
  else if (action === 'base') setBase(button.dataset.code);
  else if (action === 'clear-search') { query = ''; panel.querySelector('.search-field input').value = ''; renderPicker(); panel.querySelector('.search-field input').focus(); }
  else if (action === 'choose') {
    const code = button.dataset.code;
    if (sheet === 'manage') {
      selected = selected.includes(code) ? selected.filter(c => c !== code) : [...selected,code];
      const order = new Map(editorCatalog.map((item, index) => [item.code, index]));
      selected.sort((a, b) => order.get(a) - order.get(b));
      savePreferences(); rebuildCatalog(); renderRows();
      const checked = selected.includes(code);
      button.setAttribute('aria-pressed', String(checked));
      const check = button.querySelector('.check');
      check.classList.toggle('selected', checked);
      check.textContent = checked ? '✓' : '+';
    } else { adoptPickerIcon(button, code); setBase(code); closeSheet(); }
  }
});
root.addEventListener('input', event => {
  if (event.target.matches('.search-field input')) { query = event.target.value; renderPicker(); }
  if (event.target.matches('.amount input')) {
    if (/^[0-9.,+−×÷*/\-\s]{0,32}$/.test(event.target.value)) expression = event.target.value.replaceAll('*','×').replaceAll('/','÷').replaceAll('-','−') || '0';
    updateValues();
  }
});
root.addEventListener('keydown', event => {
  if (!sheet || closing) return;
  if (event.key === 'Escape') { event.preventDefault(); closeSheet(); return; }
  if (event.key === 'Tab') {
    const elements = [...panel.querySelectorAll('button:not(:disabled):not([hidden]), input')];
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (sheet !== 'calculator' || event.target.tagName === 'INPUT') return;
  const map = {'*':'×','/':'÷','-':'−',',':'.',Backspace:'back',Delete:'clear',Enter:'='};
  if (/^[0-9.+]$/.test(event.key) || map[event.key]) { event.preventDefault(); key(map[event.key] || event.key); }
});
rebuildCatalog(); renderRows(); refresh();
tg?.ready?.(); tg?.expand?.(); tg?.setHeaderColor?.('#000000'); tg?.setBackgroundColor?.('#000000');

// Telegram can keep the WebView alive while the Mini App is closed.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Date.now() - lastRefresh > 60_000) refresh();
});
window.addEventListener('pageshow', event => { if (event.persisted) refresh(); });
