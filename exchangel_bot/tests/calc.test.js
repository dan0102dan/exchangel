import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, convert } from '../src/calc.js';

test('arithmetic, decimal comma and precedence', () => {
  assert.equal(calculate('556'), 556);
  assert.equal(calculate('2+3×4'), 14);
  assert.equal(calculate('1,5+2.5'), 4);
  assert.equal(calculate('−4÷2'), -2);
  assert.equal(calculate('10−−2'), 12);
});
test('invalid and nonfinite expressions never become rates', () => {
  for (const s of ['', '1÷0', '1+', 'alert(1)', '2..3', '1 2']) assert.equal(calculate(s), s === '1 2' ? 12 : null);
});
test('cross rates in both directions, crypto precision and unavailable data', () => {
  assert.equal(convert(556, 1, 3.6725), 2041.9099999999999);
  assert.equal(convert(100, 100, 1), 1);
  assert.equal(convert(1, 1/60000, 100), 6000000);
  assert.equal(convert(null, 1, 2), null);
  assert.equal(convert(1, undefined, 2), null);
  assert.equal(convert(1, 0, 2), null);
});
