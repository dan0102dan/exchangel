// Fixed-height window: only the viewport and a small overscan live in the DOM.
export function createVirtualList(container, { renderRow, mount, release, rowHeight = 54 }) {
  const top = document.createElement('div'), bottom = document.createElement('div');
  top.className = bottom.className = 'list-spacer';
  top.setAttribute('aria-hidden', 'true'); bottom.setAttribute('aria-hidden', 'true');
  container.replaceChildren(top, bottom);
  let items = [], nodes = new Map(), frame = 0, disposed = false;
  const overscan = 5;
  function draw() {
    frame = 0;
    if (disposed) return;
    const first = Math.max(0, Math.min(items.length - 1, Math.floor(container.scrollTop / rowHeight)) - overscan);
    const end = Math.min(items.length, first + Math.ceil(container.clientHeight / rowHeight) + overscan * 2 + 1);
    const visible = new Set(items.slice(first, end).map(item => item.code));
    for (const [code, node] of nodes) if (!visible.has(code)) {
      release(node); node.remove(); nodes.delete(code);
    }
    top.style.height = `${first * rowHeight}px`;
    bottom.style.height = `${Math.max(0, items.length - end) * rowHeight}px`;
    let previous = top;
    for (let index = first; index < end; index++) {
      const item = items[index];
      let node = nodes.get(item.code);
      if (!node) { node = renderRow(item); nodes.set(item.code, node); }
      node.dataset.listIndex = index;
      if (previous.nextSibling !== node) container.insertBefore(node, previous.nextSibling);
      previous = node;
    }
    mount(container);
  }
  function schedule() { if (!frame && !disposed) frame = requestAnimationFrame(draw); }
  function focusIndex(index) {
    if (index < 0 || index >= items.length) return;
    const y = index * rowHeight;
    if (y < container.scrollTop) container.scrollTop = y;
    else if (y + rowHeight > container.scrollTop + container.clientHeight) container.scrollTop = y + rowHeight - container.clientHeight;
    draw(); nodes.get(items[index].code)?.focus({preventScroll:true});
  }
  function keydown(event) {
    const row = event.target.closest('[data-list-index]');
    if (!row) return;
    const index = Number(row.dataset.listIndex);
    let next;
    if (event.key === 'ArrowDown') next = Math.min(items.length - 1,index + 1);
    else if (event.key === 'ArrowUp') next = Math.max(0,index - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else if (event.key === 'Tab') next = index + (event.shiftKey ? -1 : 1);
    if (next === undefined || next < 0 || next >= items.length) return;
    event.preventDefault(); event.stopPropagation(); focusIndex(next);
  }
  const resize = new ResizeObserver(schedule);
  resize.observe(container);
  container.addEventListener('scroll', schedule, {passive:true});
  container.addEventListener('keydown', keydown);
  return {
    setItems(next, reset = false) {
      items = next; container.dataset.total = items.length;
      if (reset) container.scrollTop = 0;
      const max = Math.max(0,items.length * rowHeight - container.clientHeight);
      if (container.scrollTop > max) container.scrollTop = max;
      draw();
    },
    destroy() {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect();
      container.removeEventListener('scroll',schedule); container.removeEventListener('keydown',keydown);
      for (const node of nodes.values()) release(node);
      nodes.clear();
    },
  };
}
