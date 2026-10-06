# Exchangel

🏆 Award-winning project at the [Telegram Mini Apps Contest](https://t.me/contest/327).

Exchangel is a single-page currency and cryptocurrency converter hosted entirely
on Telegram Serverless. Price subscriptions and background notifications are retired.

**Mini App:** https://app6547657300.tgcloud.ai/

The maintained application is in [`exchangel_bot/`](./exchangel_bot/README.md):
Vanilla JavaScript frontend, Telegram bot handlers, and a serverless rates endpoint with SQLite
caching. Fiat rates come from ExchangeRate-API; crypto/USD indices come from OKX.
No private OKX API key is required. Currency selection is stored on the device.

```sh
cd exchangel_bot
npm install
npm run dev
npm test
npm run test:ui
npm run deploy
```

`tgcloud push` publishes the built frontend and backend together. Schema migrations
are separate: `npx tgcloud migrate`. See the project README for setup and validation.

Licensed under [MIT](LICENSE).

## GitHub and credentials

The GitHub workflow validates the converter (unit tests, browser tests and build).
It does not deploy to Telegram.
Deploy to Telegram from `exchangel_bot/` with `npm run deploy`.

The root `.gitignore` excludes dependencies, builds, local cloud state, environment
files and private credentials across all subprojects. Keep only placeholder values
in example configuration. `.gitignore` does not remove secrets already in history.

A Gitleaks pre-commit hook is configured in `.pre-commit-config.yaml`. To enable it,
install [pre-commit](https://pre-commit.com/), then run `pre-commit install`. Before
publishing, review `git diff --cached` and run `pre-commit run --all-files`.

Security review on 2026-10-06: the current publishable files passed Gitleaks. The
history scan found an old Telegram bot token in `server/config.test.ts`, commit
`930aea666131033c2aaf429d466215ac7647604f`, already reachable from the locally known
`origin/main`. Revoke that old bot token in BotFather if it has not already been
revoked. Its current validity was not tested. The history has not been rewritten.
