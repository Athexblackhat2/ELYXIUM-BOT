# ELYXIUM BOT

| Archive | Internal folder name | Size | Files | Era |
|---|---|---|---|---|
| `ELYXIUM-V1.zip` | `public/` + flat root | 620 KB | 63 | Earliest / legacy architecture |
| `ELYXIUM-V2.zip` | `ELYXIUM-V2/` | 3.8 MB | 97 | Rewritten, modular architecture |
| `ELYXIUM-V3.zip` | `ELYXIUM-V3/` | 3.8 MB | 103 | Current / latest — iterative refinement of V2 |

All three are the **same project at different points in time**: a self‑hosted, multi‑session **WhatsApp automation bot** built on the [Baileys](https://github.com/WhiskeySockets/Baileys) library, with a web dashboard for pairing/management. V3 is the most complete and should be treated as the canonical version; V1 and V2 are kept here only for historical/diff reference.

---

## 1. What this project is

**ELYXIUM BOT** (branding: "⚡ Powered by ATHEX & ALTHEA" / "ATHEX BLACK HAT") is a Node.js application that:

1. Connects to WhatsApp using the unofficial **Baileys** multi-device socket library (QR code or 8-digit pairing code login — no official WhatsApp Business API).
2. Runs **multiple independent WhatsApp sessions** at once (one per user/number), each as an isolated `BotSession` instance with its own auth folder.
3. Exposes a **web dashboard** (Express + Socket.IO) where a user can pair their number, watch live logs, and toggle features in real time.
4. Responds to **prefix commands** (`.command` in V2/V3, `!command` in V1) sent from WhatsApp chats, with 50–60+ commands split into free / premium / admin / owner tiers.
5. Persists state in **SQLite** (V2/V3) or flat JSON files (V1): users, premium status, command logs, scheduled messages, group settings, authorized-user allowlist.
6. Has a small **admin panel** (PIN-protected) for managing users, premium subscriptions, and sessions.

It is designed to be run by one operator ("owner") who hosts it (e.g. on a VPS, Render, or similar always-on Node host) and either uses it personally or resells "slots" to other WhatsApp numbers.

---

## 2. Version history / what changed

### V1 — "ELYXIUM BOT v1.0 PRO" (legacy, flat architecture)
- Single-file-ish design: `server.js` is the monolith (session handling, command loader, auto-seen/react logic, Express routes all together).
- Commands are plain files under `commands/<category>/*.js`, manually scanned at boot.
- Storage: a JSON file (`data/users.json`) — no SQL database.
- Config via `config.json` (prefix `!`, feature toggles) + a minimal `.env` (bot name, prefix, session ID).
- Notable `utils/`: `antiCallEngine.js`, `autoReact.js`, `crashEngine.js`, `embedBuilder.js`, `hackEngine.js`, `mediaDownloader.js`, `spamEngine.js`, `statusManager.js` — i.e. a bundle of prank/automation "engines" each backing one command (`.crash`, `.spam`, `.hack`, etc.).
- Categories: `commands/defense`, `commands/fun`, `commands/status`, `commands/system`, `commands/utility`.

### V2 — "ELYXIUM-MD-BOT-FOR-RUKHIII" (full rewrite)
- Proper layered structure under `src/`: `core/` (bot session + Express server + Socket.IO), `db/` (SQLite access layer), `services/` (AI, downloader, scheduler), `commands/` (now grouped as `free/`, `premium/`, `admin/`, `owner/`), `utils/`.
- Switched storage to **SQLite** (`better-sqlite3`-style synchronous API against `data/elyxium.db`), with real tables for users, sessions, command logs, scheduled messages, group settings, premium history, an authorized-user allowlist, and saved profile pictures.
- Added a proper **premium tier model** (free vs premium, expiry dates, pricing in `.env`), a Groq-backed **AI chat** integration, a dashboard with Socket.IO live console, and an admin REST API.
- Package renamed, entry point renamed `index.js` (was `server.js`), process management via **PM2** (`ecosystem.config.js`).

### V3 — "ELYXIUM-V3" (current / latest)
Same architecture as V2, with incremental additions and fixes:
- **New commands**: `.fortune`, `.quote`, `.weather`, `.truth` (file `tord.js`), `.stats` (file `recsong.js`), and `.remind` (new reminder scheduler command).
- Various bug-fix passes to existing commands (file headers mention "FIXED", "Final Fixed", "UPDATED", "Must Work" — see §5).
- `src/utils/constants.js` and `src/utils/logger.js` grew substantially (more command icons, more structured logging).
- Everything else (DB schema, server routes, socket events, auth model) is functionally the same as V2, just dated later (commits from Sept/Oct 2026 vs July/Aug 2026 for V2).

**Recommendation:** treat `ELYXIUM-V3` as the version to run/maintain; V1 and V2 are superseded.

---


### Request/message flow
1. `index.js` → `initializeDatabase()` → `createServer()` (Express + Socket.IO) → `initSocket()` → `loadAndStartAllSessions()`.
2. A user opens the dashboard, enters their WhatsApp number, and either scans a QR code or requests a pairing code. This creates a `BotSession` and calls Baileys' `makeWASocket` / `requestPairingCode`.
3. Once connected, `BotSession.handleMessage()` runs on every inbound WhatsApp message:
   - Stores it (for anti-delete) and marks it read (auto-read).
   - Detects status updates, view-once wrappers, group events.
   - Runs group guards (anti-link, anti-status, anti-spam) before anything else.
   - Optionally auto-reacts, auto-replies, or forwards the text to the AI service (DMs only).
   - If the message starts with `.`, it is treated as a command: **only the bot owner's own number (`fromMe`) may issue commands** — anyone else gets an automatic "SECURITY ALERT / NOT AUTHORIZED" reply with the bot logo.
   - Commands are further split into owner-only (`adduser`, `removeuser`), admin-only (require the sender to be a WhatsApp group admin), and general (require the sender's number to be on the SQLite `authorized_users` allowlist).
4. `src/commands/index.js` is a flat command registry (`commandHandlers` map) + `route()` function that performs the authorization checks and dispatches to the matching handler, logging every command to `command_logs`.

### Data model (SQLite, `src/db/database.js`)
| Table | Purpose |
|---|---|
| `users` | Per-number profile: tier (free/premium), premium expiry, feature toggles (anti-call, auto-read, AI, auto-react, auto-status, auto-seen…), command count |
| `sessions` | Connection history (connected/disconnected timestamps) |
| `command_logs` | Every command invocation (who, what, where, when) |
| `scheduled_messages` | Payload for `.schedule` / `.remind` |
| `group_settings` | Per-group welcome/goodbye text, anti-link/anti-spam/anti-status config |
| `premium_history` | Premium purchase/renewal/revocation audit trail |
| `bot_settings` | Generic key/value store |
| `authorized_users` | Allowlist of numbers permitted to use bot commands |
| `saved_dps` | Profile pictures saved via `.dp` (binary blob + URL) |

### Web/API surface (`src/core/server.js`)
- `GET /`, `/admin`, `/about` — static dashboard pages.
- `GET /api/health`, `GET /api/stats` — public status endpoints.
- `POST /api/admin/login` — PIN login, issues a 2-hour bearer token (in-memory `Set`, not persisted or hashed).
- `GET/POST /api/admin/*` (behind `adminAuth` bearer-token middleware): list/add/remove authorized users, view stats, list users/sessions, grant/revoke premium, force-disconnect a session.
- Real-time channel via Socket.IO: `set-user`, `pair-request`, `logout`, `get-sessions`, plus server→client events `qr`, `pairing-code`, `connection-status`, `console` (live log stream), `total-active`.

---

## 3. Command reference (V3, grouped by tier)

Prefix: **`.`** (dot). Full in-bot menu is generated by `src/commands/menu.js`.

**General / Free**
`menu`, `about`, `ping`, `owner`, `stats`, `joke`, `meme`, `quote`, `fortune`, `truth` (`tord.js`), `weather`, `translate`/`trt`, `groupinfo`, `dp` (fetch/save profile picture), `ok` (silent view‑once saver on reply).

**Premium**
`song`, `video`, `tt`/`tiktok`, `insta`/`ig`/`instagram`, `fb`/`facebook`, `apk`, `gdrive`, `mf`/`mediafire` (media/app downloaders), `vv` (auto view‑once saver triggered by reply keywords like "ok"/"nice"), `emojimix`, `character` (AI "personality analysis" of a tagged user), `sticker`, `remind`, `poll`, `autoreply` (add/list/remove/clear keyword replies), `schedule`, `welcome`/`goodbye` (group join/leave messages), `antispam`, `backup`/`restore` (session backup), `find`/`fd`/`finddata` (phone-number → personal-record lookup against a third-party "SIM database" API — see §7).

**Group Admin** (sender must be a WhatsApp group admin)
`kick`, `hidetag`, `tagall`, `antilink`, `kickoffline`, `antistatus`, `accept` (approve join requests).

**Owner-only** (the bot's own WhatsApp number)
`ai` (toggle/query AI auto-reply), `athex` (special AI persona command), `hack` (fake "hacking" animation — harmless prank, no real action), `broadcast`, `antidelete` (status/toggle; actual capture logic is always-on in `bot.js`), `adduser`/`removeuser`/`authlist` (manage the authorization allowlist), `anticall` (reject incoming calls automatically).

---

## 4. Setup & running

Tested against Node >= 18 (per `package.json engines`).

```bash
cd ELYXIUM-V3
npm install
cp .env.example .env    # if no example exists, copy the template in §6 and fill in real values
npm start                # node index.js  — or:
npm run pm2:start        # pm2 start ecosystem.config.js (recommended for production)
```

Other npm scripts: `dev` (nodemon), `pm2:stop`, `pm2:restart`, `pm2:logs`, `pm2:status`.

Once running, open `http://localhost:<PORT>` (default 3000), enter a WhatsApp number, and either scan the QR or request a pairing code to link a session. `/admin` gives access to the management panel using `ADMIN_PIN`.

**Notes from the code:**
- `data/`, `logs/`, `auth_info/` (WhatsApp credentials) and `temp/` must be writable at runtime; `.gitignore` already excludes auth/session data and the `.env` file, which is correct.
- The server self-pings its own `APP_URL` every 5 minutes (`index.js`) — a keep-alive pattern typical of free-tier hosts (Render/Replit/Railway) that sleep idle instances.
- `data/athez.db` ships as an empty 0‑byte placeholder; only `data/elyxium.db` is the real database and it is **included in the archive with live data already in it** (see §7 — this should not be committed/shared as-is).

---

## 5. Configuration (`.env`)

| Variable | Purpose |
|---|---|
| `PORT`, `NODE_ENV`, `APP_URL` | Server binding and self-ping target |
| `BOT_NAME`, `BOT_VERSION`, `BOT_LOGO` | Branding shown in menus/warnings |
| `OWNER_NAME`, `OWNER_NUMBER`, `ADMIN_PIN` | Bot owner identity + admin panel PIN |
| `OPENAI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `AI_MAX_TOKENS`, `AI_TEMPERATURE`, `AI_SYSTEM_PROMPT` | AI chat config — points at a **Groq** OpenAI-compatible endpoint (`api.groq.com`) running `llama-3.3-70b-versatile`, not actual OpenAI |
| `CHANNEL_LINK` | WhatsApp channel promoted in the menu |
| `TENOR_API_KEY` | GIF/meme lookups |
| `PREMIUM_MONTHLY_PRICE`, `PREMIUM_YEARLY_PRICE`, `PREMIUM_CURRENCY` | Pricing shown to users (defaults: Rs 200 / Rs 2000) |
| `FREE_DAILY_LIMIT` | Rate limit for free-tier usage |
| `LOG_LEVEL`, `DB_PATH` | Logging verbosity, SQLite file path |
| `SESSION_TIMEOUT`, `MAX_RECONNECT_ATTEMPTS`, `RECONNECT_DELAY` | Baileys reconnection behavior |
| `ENABLE_AI`, `ENABLE_AUTO_REPLY`, `ENABLE_ANTI_DELETE`, `ENABLE_ANTI_CALL`, `ENABLE_AUTO_REACT` | Global feature flags |

> **The uploaded archives contain a live, filled-in `.env` and a populated `data/elyxium.db`.** These include an admin PIN, owner phone number, and (in V3) what appear to be real API keys. Treat the archives themselves as sensitive — see §7.

---

## 6. Security, privacy & legal considerations

This is a serious, working piece of software, but several design choices carry real risk and should be understood (and likely removed or gated) before any wider deployment:

- **Secrets committed into the archive.** `.env` (with `ADMIN_PIN`, `OWNER_NUMBER`, `OPENAI_API_KEY`/Groq key, `TENOR_API_KEY`) and a pre-populated `data/elyxium.db` are *inside* the zip files you uploaded. Rotate the admin PIN and any API keys before sharing or deploying this code, and never commit `.env`/`*.db` to a public repo (the provided `.gitignore` correctly excludes them going forward, but the already-zipped copies still contain the real values).
- **Unofficial WhatsApp automation.** Baileys is an unofficial, reverse-engineered client. Using it for bulk automation, auto-replies, or multi-tenant "rental" of bot slots is against WhatsApp's Terms of Service and numbers can be banned; this is worth flagging to whoever operates it.
- **`.find` / `finddata` command (V2 & V3, `premium/find.js`).** This queries a third-party "SIM database" API with a phone number and returns the owner's name, national ID number (CNIC), and address. Looking up a person's government ID and home address from their phone number without their consent is a serious privacy/doxing risk and, in many jurisdictions (including Pakistan, whose number formats this command is hard-coded for), likely illegal. This feature should be removed or restricted to verified legitimate use before this code is deployed anywhere.
- **Silent view-once capture (`free/ok.js`, `premium/vv.js`).** These intercept WhatsApp "view once" photos/videos — content the sender explicitly marked to disappear after one view — and save them automatically and silently (comments literally say "COMPLETELY SILENT"). This defeats a privacy feature users rely on and can facilitate non-consensual retention of private media. `vv.js` triggers on common one-word replies like "ok"/"nice"/"sure", so it can run even when no one intended to save anything.
- **`antidelete`** forwards messages a sender deleted back to the bot owner — another feature that captures content against the sender's expressed intent to retract it.
- **Legacy V1 "engines"** (`utils/spamEngine.js`, `utils/crashEngine.js`, commands `.spam`, `.crash`) are message-flooding / client-disruption tools. These are abuse-oriented and are not present in V2/V3 — their removal in the rewrite looks intentional and should stay that way.
- **Admin auth is weak.** The admin panel is a single shared PIN (`ADMIN_PIN`, default `'123456'` if unset) producing an in-memory bearer token with no hashing, no rate-limiting, and no per-admin accounts. Fine for a single hobby operator, not for anything multi-admin or internet-facing without additional hardening.
- **`.hack`** is cosmetic only — it prints a fake progress animation and immediately says "Just kidding! This is a prank command." No actual action is taken; it is not a security concern beyond the obviously joking content.

**Recommendation:** if this project is going to be maintained or distributed further, prioritize (1) rotating every secret currently baked into the zip, (2) removing or gating the `find` SIM-lookup command behind explicit, logged consent and a legitimate-purpose justification, and (3) making the silent view-once/anti-delete capture opt-in and disclosed to chat participants rather than silent by default.

---

## 7. Dependencies (V3)

Core runtime: `@whiskeysockets/baileys` (WhatsApp protocol), `express` + `socket.io` (dashboard/API), `sqlite3`, `dotenv`, `pino` (logging), `qrcode`, `fs-extra`.
Media/AI: `@google/generative-ai`, `openai` (used against the Groq-compatible endpoint), `@distube/ytdl-core`, `yt-search`, `ffmpeg-static`/`fluent-ffmpeg`, `cheerio`, `adm-zip`, `axios`, `node-fetch`.
Dev: `nodemon`. Process management: PM2 (`ecosystem.config.js`), not a listed npm dependency (expected to be installed globally).

---

## 8. Summary

ELYXIUM BOT is a feature-rich, actively evolving, self-hosted WhatsApp automation platform with a clean V2/V3 rewrite over a rougher V1 prototype. The engineering (session management, SQLite schema, admin API, command router with tiered permissions) is competent and the bulk of the 60+ commands are ordinary bot fare (menus, games, downloaders, group management, reminders, AI chat). Alongside that, a small number of features — the SIM/CNIC lookup, silent view-once capture, and anti-delete forwarding — are privacy-invasive by design and the V1 spam/crash tools were outright abuse utilities; these are the parts most worth re-evaluating before further use or distribution.