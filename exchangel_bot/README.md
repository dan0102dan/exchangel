# Development guide

Exchangel runs entirely on Telegram Serverless. The frontend uses plain JavaScript
and CSS, built with Vite. Node.js 24 is used in CI.

## Local development

Run these commands from `exchangel_bot/`:

```sh
npm ci
npm run dev
```

The browser preview fetches public rates directly. Inside Telegram, the app calls
`getRates` through `Telegram.WebApp.Serverless.call`.

## Testing

```sh
npm test
npx playwright install chromium
npm run test:ui
npm run build
```

## Deployment

Link the project and initialize its database on first setup:

```sh
npx tgcloud login
npx tgcloud migrate --local --safe
```

Publish the app:

```sh
npm run deploy
```

This builds `dist/` and publishes it with the modules in `tgcloud/`. Database schema
changes require a separate migration. Preview them with
`npx tgcloud migrate --local --dry-run`.

Live app: https://app6547657300.tgcloud.ai/

## Project structure

| Path | Purpose |
| --- | --- |
| `src/` | Converter UI, calculator, virtual list, and icon cache |
| `public/` | Flags and bundled cryptocurrency icons |
| `tgcloud/endpoints/getRates.js` | Rates endpoint and SQLite cache |
| `tgcloud/lib/providers.js` | ExchangeRate-API and OKX clients |
| `tgcloud/handlers/` | Telegram bot handlers |
| `tgcloud/schema.js` | Database schema |
| `tests/` | Unit and browser tests |

See the [Telegram Serverless SDK reference](docs/tgcloud-sdk.md) for backend APIs.

## Rates and assets

Fiat rates use ExchangeRate-API and are cached server-side for one hour.
Cryptocurrency rates use OKX USD indices, supplemented by active USDT spot pairs,
and are cached for one minute. Spot prices use the actual USDT/USD index.

A failed refresh preserves available cached rates and marks them as stale.
Unavailable rates display a dash. Rates do not include trading fees.

Crypto assets always use `crypto:` IDs, such as `crypto:RON`, to distinguish them
from fiat currencies with the same ticker. Currency preferences are stored locally.

Icons use a shared memory cache and, where supported, a seven-day persistent cache.
To update the bundled OKX icons:

```sh
npm run icons:sync
```
