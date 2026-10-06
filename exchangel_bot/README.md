# Exchangel converter

One screen for fiat and crypto conversion, deployed at
https://app6547657300.tgcloud.ai/ with Telegram Serverless CLI 0.2.

- Tap a currency to change the base; tap the bottom card to open the calculator.
- Search selects a base currency. The Edit button opens your currency list directly.
- The calculator supports decimals, +, −, ×, ÷ and normal operator precedence.
- Language follows Telegram (Russian/English). Preferences are stored locally.
- There are no price subscriptions or background notification jobs.

The frontend uses plain JavaScript and CSS, with no UI runtime dependencies.
Panel transitions use the browser animation API (transform and opacity only),
respect reduced motion, and avoid backdrop blur. Amount edits update existing
text nodes without rebuilding currency rows. Vite, Playwright and the Telegram
CLI are development tools only.

## Development and publishing

```sh
npm install
npm run dev
npm test
npm run test:ui
npm run build
npx tgcloud login
npx tgcloud migrate --local --safe
npm run deploy
```

Credentials live only in CLI-managed, Git-ignored `.tgcloud/`. Never copy them into
source files. `npm run deploy` builds into `dist/`, then publishes the frontend and
all `tgcloud/` modules. The /start button uses the same hosted Mini App URL.

## Rates

`tgcloud/endpoints/getRates.js` uses the SDK HTTP client and stores source snapshots
in `converter_rate_cache`. Fiat results are cached for an hour (the provider updates
daily); OKX results for a minute. Requests trigger refresh, with no cron needed.
Each source retains its own timestamp and stale flag; a failed refresh can serve
cached data, visibly marked in the UI. An unavailable rate displays a dash, never a
fabricated conversion. Rates are indicative and do not include trading fees.

Fiat: https://www.exchangerate-api.com/docs/free.
Crypto: OKX `/api/v5/market/index-tickers?quoteCcy=USD`; the list includes all available USD indices and active OKX spot currencies traded against USDT.
USD indices are preferred; currencies without one are converted using the spot
price and actual USDT/USD index. Fiat and crypto ticker collisions (RON, SCR)
are stored as separate assets. Every crypto asset uses a stable `crypto:` ID,
independent of source availability. Existing preferences migrate once using the
saved rates snapshot. Search and list editing support All / Currencies / Crypto filters.

In Telegram the frontend calls `Telegram.WebApp.Serverless.call('getRates', …)`;
Telegram authenticates init data. Ordinary browsers fetch the same public data
sources directly for preview. No user data is sent to those providers.

The tests use fixed market fixtures to verify arithmetic, conversion, search,
preferences, error states and mobile sizing. Runtime verification uses
`npx tgcloud run endpoints/getRates '{}'` against real providers and the cloud DB.


Cryptocurrency icons come from the official OKX CDN. The original 16 icons are
bundled locally; other coins load their OKX images lazily. Run `npm run icons:sync`
to refresh the bundled icons.

Base-currency changes reuse rows and animate their positions with native transform
animations. Partial source failures preserve cached rates; USD indices remain
available even when the spot catalog request fails or a USDT pair is absent.
