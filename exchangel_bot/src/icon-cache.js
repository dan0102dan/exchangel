// Shared across all screens. Blob URLs avoid re-fetching the same image when
// new <img> elements are created; Cache Storage also survives WebView restarts.
const cacheName = 'exchangel-icons-v1';
const maxAge = 7 * 24 * 60 * 60 * 1000;
const assets = new Map();
const storage = (async () => {
  try { return typeof caches === 'undefined' ? null : await caches.open(cacheName); }
  catch { return null; }
})();

// Limit simultaneous fetch/decode work while a long list is being scrolled.
const queue = [];
let activeLoads = 0;
function drain() {
  while (activeLoads < 4 && queue.length) {
    // Skip rows that left the virtual window before their request started.
    const next = queue.findIndex(task => [...task.entry.images].some(img => img.isConnected && (img.loading !== 'lazy' || img.parentElement?.classList.contains('icon-visible'))));
    if (next < 0) break;
    const { url, entry, resolve } = queue.splice(next, 1)[0];
    activeLoads++;
    loadAsset(url, entry).finally(() => { activeLoads--; entry.images.clear(); resolve(); drain(); });
  }
}
function schedule(url, entry) {
  return new Promise(resolve => { queue.push({ url, entry, resolve }); drain(); });
}
async function loadAsset(url, entry) {
  let src = url;
  try {
    const cache = await storage;
    let response = await cache?.match(url);
    if (!response || Date.now() - Number(response.headers.get('x-icon-cached-at')) > maxAge) {
      response = await fetch(url, { credentials: 'omit' });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw Error('Icon unavailable');
      const blob = await response.blob();
      response = new Response(blob, { headers: { 'content-type': blob.type, 'x-icon-cached-at': String(Date.now()) } });
      // Storage failure must not prevent displaying a successfully fetched icon.
      if (cache) await cache.put(url, response.clone()).catch(() => {});
    }
    src = URL.createObjectURL(await response.blob());
  } catch {
    // Some image hosts disallow CORS, and some WebViews disable Cache Storage.
    // A normal image can still load; retain its decoded resource in memory.
  }
  const decoded = new Image();
  decoded.src = src;
  try { await decoded.decode(); }
  catch { if (src.startsWith('blob:')) URL.revokeObjectURL(src); entry.failed = true; return; }
  entry.src = src;
  entry.decoded = decoded;
}
function show(img) {
  img.dataset.iconStarted = 'true';
  const url = new URL(img.dataset.iconSrc, location.href).href;
  let entry = assets.get(url);
  if (!entry) {
    entry = {images: new Set([img])};
    assets.set(url, entry);
    entry.pending = schedule(url, entry);
  }
  if (!entry.src && !entry.failed) { entry.images.add(img); drain(); }
  const holder = img.parentElement;
  const pending = !entry.src && !entry.failed;
  if (pending) { holder.classList.add('icon-loading'); holder.setAttribute('aria-busy', 'true'); }
  const apply = () => {
    holder.classList.remove('icon-loading', 'icon-visible'); holder.removeAttribute('aria-busy');
    observer?.unobserve(img); waiting.delete(img);
    if (entry.failed) { img.replaceWith(Object.assign(document.createElement('span'), { className: 'icon-unavailable', textContent: '—' })); return; }
    img.loading = 'eager';
    img.decoding = 'sync';
    img.src = entry.src;
    if (pending && img.isConnected && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      img.animate([{opacity:0,transform:'scale(.94)'},{opacity:1,transform:'scale(1)'}], {duration:220,easing:'ease-out'});
    }
  };
  if (entry.src || entry.failed) apply();
  else {
    if (observer) { waiting.add(img); observer.observe(img); }
    else holder.classList.add('icon-visible');
    entry.pending.then(apply);
  }
}
const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
  for (const {target, isIntersecting} of entries) {
    target.parentElement?.classList.toggle('icon-visible', isIntersecting);
    if (isIntersecting) {
      if (!target.dataset.iconStarted) { target.dataset.iconStarted = 'true'; show(target); }
      else drain();
    }
  }
}, {rootMargin:'0px'});
const waiting = new Set();
export function hydrateIcons(container) {
  // Release observers for rows replaced by a search/filter or closed sheet.
  for (const img of waiting) if (!img.isConnected) { observer?.unobserve(img); waiting.delete(img); }
  for (const img of container.querySelectorAll('img[data-icon-src]:not([data-icon-mounted])')) {
    img.dataset.iconMounted = '';
    const cached = assets.get(new URL(img.dataset.iconSrc, location.href).href);
    if (img.loading !== 'lazy' || cached || !observer) show(img);
    else { waiting.add(img); observer.observe(img); }
  }
}
export function releaseIconObservers(container) {
  for (const img of waiting) if (container.contains(img)) { observer?.unobserve(img); waiting.delete(img); }
}
