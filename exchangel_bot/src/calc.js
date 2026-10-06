// Small arithmetic parser: operator precedence, unary minus, no eval.
export function calculate(input) {
  const text = input.replaceAll(',', '.').replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-').replace(/\s/g, '');
  const tokens = text.match(/(?:\d+(?:\.\d*)?|\.\d+)|[+*/-]/g) || [];
  if (tokens.join('') !== text || !tokens.length) return null;
  let i = 0;
  function number() {
    let sign = 1;
    if (tokens[i] === '-') { sign = -1; i++; }
    else if (tokens[i] === '+') i++;
    if (!tokens[i] || !/^(\d|\.)/.test(tokens[i])) throw Error();
    return sign * Number(tokens[i++]);
  }
  function term() {
    let n = number();
    while (tokens[i] === '*' || tokens[i] === '/') {
      const op = tokens[i++], right = number();
      n = op === '*' ? n * right : n / right;
    }
    return n;
  }
  try {
    let n = term();
    while (i < tokens.length) {
      const op = tokens[i++];
      if (!['+', '-'].includes(op)) return null;
      const right = term();
      n = op === '+' ? n + right : n - right;
    }
    return Number.isFinite(n) ? n : null;
  } catch { return null; }
}
export function convert(amount, baseRate, targetRate) {
  return Number.isFinite(amount) && baseRate > 0 && targetRate > 0 ? amount / baseRate * targetRate : null;
}
