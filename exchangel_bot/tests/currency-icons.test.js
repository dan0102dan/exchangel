import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fiatSymbols } from '../src/assets/currencies/symbols.js';

test('every fiat currency has a bundled vector symbol independent of browser fonts',()=>{
 for (const code of Object.keys(fiatSymbols)) {
  const svg=readFileSync(new URL(`../src/assets/currencies/${code}.svg`,import.meta.url),'utf8');
  assert.match(svg,/<path\b/,`${code} must contain vector geometry`);
  assert.doesNotMatch(svg,/<(?:text|image|use)\b/,`${code} must not depend on fonts or external assets`);
  assert.match(svg,/currentColor/,`${code} must inherit the surrounding text color`);
  const [,viewBox]=svg.match(/viewBox="([^"]+)"/);
  const [,,width,height]=viewBox.split(/\s+/).map(Number);
  assert.ok(width>0&&height>0,`${code} must have visible bounds`);
 }
});
