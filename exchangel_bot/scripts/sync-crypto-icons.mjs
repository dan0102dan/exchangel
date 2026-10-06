import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { cryptoNames } from '../tgcloud/lib/providers.js';

// Official OKX public currency icons; no private asset API key is needed.
const directory = new URL('../public/crypto/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const code of Object.keys(cryptoNames)) {
  const url = `https://static.okx.com/cdn/oksupport/asset/currency/icon/${code.toLowerCase()}.png`;
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${code}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error(`${code}: expected a PNG from OKX`);
  }
  await writeFile(new URL(`${code}.png`, directory), bytes);
  console.log(`${code}: downloaded from OKX (${bytes.length} bytes)`);
}
console.log(`Saved to ${fileURLToPath(directory)}`);
