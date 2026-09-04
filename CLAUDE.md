# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gorilla Translator (ゴッリッラ翻訳) — a single-page comedy web app that "translates" between gorilla language (ウホウホ) and funny Japanese phrases. No AI, no backend, no dependencies. The core app is one `index.html` file with inline CSS and JS; a small set of PWA support files (manifest, service worker, icons) sit alongside it so it can be installed on a phone home screen. Deployed on Vercel.

`rally-trainer.html` is a Whiteout Survival rally-tap trainer — a separate tool that has nothing to do with translation, kept in its own file and gated behind its own secret phrase (see "Rally trainer" below). `gorilla-runner.html` is a separate Chrome-Dino-style gorilla runner (canvas, no dependencies) that is **not linked from `index.html`**'s markup — keeping it in its own file means it adds zero weight to the main translator's bundle. It's reachable by typing one of a few gorilla-flavored secret words into the main input, which reveals a glowing button that navigates to it (see item 15 below).

## Development

No build step. Open `index.html` in a browser to develop and test. If iterating on the service worker or install behavior, serve it over a local HTTP server (`python -m http.server`) rather than `file://`, since service workers require a secure context (localhost counts).

## Deployment

Vercel, auto-deploys from `main` (serves from the project root, so all PWA paths — `manifest.json` `start_url`/`scope`, `sw.js` scope — are root-relative). Just push to `main`.

## Architecture

Single `index.html` organized in sections:

- **CSS** (`<style>` block): "Banana Pop" visual design — yellow gradient background, chunky rounded UI, 480px max-width mobile-first layout. Also: mood chip, gorilla-o-meter rating row, legendary gold bubble, combo badge, banana-rain, disco/quake keyframes
- **HTML**: Single-column layout with header, name badge, mood chip, input textarea, action buttons, speech bubble output (with gorilla-o-meter rating row), banana progress bar, secondary buttons, emoji reactions. Fixed overlays: combo badge, banana rain, toast
- **JS** (`<script>` block), organized as:
  1. **Translation data** — `PHRASE_POOLS` (8 categories: greeting, question, excited, passionate, casual, emphasis, emotional, melancholy). Each phrase is `[text, kind]` where kind ∈ `p`(plain) `c`(command) `q`(question) `x`(exclaim) `s`(set) and governs which compositing is grammatical. Plus `LEGENDARY`, `PREFIXES`, `SUFFIXES` (universally-safe tails only), `GORILLA_SOUNDS`, `MOODS`, `CATEGORY_MOOD`
  2. **Gorilla→Japanese engine** — `analyzeSignals()` detects input mood (sadness `…` checked before repeated-char excitement so trailing-off reads wistful), `bumpMood()` drifts the gorilla's mood (decay 0.5, fresh-input tie-break), `weightedPick()` selects from category with decay weights, **`compose()` is grammar-aware** — only attaches a prefix to plain/command phrases and a safe suffix to plain phrases, never onto punctuation/commas (this replaced the old `maybeComposite` which produced broken output). Ring buffer prevents repeats within last 8 outputs; mood-colored emoji tail; banana overload at MAX; rare `LEGENDARY` golden output
  3. **Japanese→Gorilla engine** — `chunkJapanese()` splits by particles/punctuation, `chunkToGorilla()` maps chunk length to gorilla sounds (short/medium/long), randomly alternates katakana/hiragana, 15% chance of dramatic interjections
  4. **Gorilla-o-meter** — `makeRating()` returns a mock accuracy % (mostly high & precise, occasionally absurd 404%/>100%/`∞`) + a joke certification from `CERTS`
  5. **Sound** — Web Audio API oscillator-based "uho" (no audio files); `playGorillaSound(bursts)` takes an optional burst count
  6. **Share** — Web Share API with clipboard fallback
  7. **Name management** — localStorage-persisted gorilla name (default: ゴリ太郎)
  8. **Progress bar** — Session-scoped banana power, +12% per translation; rains bananas on first hit to MAX
  9. **Combo meter** — `registerCombo()`: rapid translations (<2.2s apart) build a streak; ≥3 shows a badge, ≥5 adds screen quake + banana rain + sound
  10. **Easter eggs** — Konami code → disco mode (`toggleDisco`), triggered by either the physical-keyboard `keydown` sequence or typing `↑↑↓↓←→←→BA` as text into the input (`KONAMI_TEXT`, for phones without arrow keys); `バナナバナナ` → banana祭り; legendary keywords (キング/ボス/王様/…) force a golden translation
  11. **Mood UI, animations & event listeners** — `updateMoodUI()`, `bananaRain()`, `quakeScreen()`, mood-driven emoji reactions
  12. **Fortune cookie & facts** — `FORTUNES`/`FUN_FACTS` pools, shown via `showToast()` (now takes an optional `duration` arg) on button click; pure flavor text, no state
  13. **Translation streak** — `updateStreak()`/`renderStreak()`: calendar-day streak counter persisted in `localStorage` (`gorillaStreak`), shown as a badge under the mood chip
  14. **Gorilla evolution** — `updateHeaderEmoji()`: swaps the header emoji based on lifetime banana power in `localStorage` (`gorillaTotalBananas`, +12/translation, never resets), announcing stage-ups via toast + banana rain
  15. **Gorilla runner unlock** — typing any of a few secret words (`RUNNER_SECRETS`: `ゆしま`/`バッサー`/`バナナ`/`うほっほーい`) into the main input reveals a glowing `.btn-runner` button that navigates to `gorilla-runner.html` (same tab, input left untouched); unlock state persists in `localStorage` (`gorillaRunnerUnlocked`) so it's a one-time discovery, checked in the same `mainInput` listener as the Konami text detector

## Key Design Decisions

- Most state is session-scoped; gorilla name, translation streak, lifetime banana power (evolution), and the gorilla runner unlock persist via `localStorage`
- Translation uses layered randomization, not AI: signal analysis → weighted pools → **grammar-aware compositing** → ring buffer → mood/session flavor
- **Absurd, not broken**: inaccuracy is the joke, but output must be well-formed Japanese. Phrases are tagged by grammatical `kind` and `compose()` only attaches fragments where they stay grammatical. When adding phrases, tag them correctly (`p`/`c`/`q`/`x`/`s`) or compositing will mangle them.
- `session.translationCount` tracks total translations (both directions); `session.gorillaTranslateCount` tracks gorilla→JP only (used for first-greeting logic); `session.mood` / `session.moodPoints` drive the mood chip and emoji reactions
- New heavier features (like the gorilla runner game) go in their own standalone file first, unlinked from `index.html`'s markup, so the main app's payload stays light — gate access via a secret trigger rather than a visible link

## Rally trainer (`rally-trainer.html`)

Practice tool for the weekly Fortress/Station fight: at a user-set wall-clock time the 集結 button goes live and you race through the four-tap rally sequence. Standalone file, unlocked from `index.html` by typing `私はPLMのゴリラ` anywhere in the main input (`RALLY_SECRET`, substring match — unlike `RUNNER_SECRETS`, which match the whole value).

- **Course** — `STANDARD_COURSE`: 集結 → 5分 → 集結を発起 → 出征. Each step names the mock screen it lives on and `armDelayMs`, the game's animation delay before it becomes tappable. Step 0 (opening the station popup) is done in advance, so a run opens with the popup already showing and only the clock to wait on.
- **Full-bleed frame** — the run screen is a fixed overlay and the frame fills the viewport, capped at a fixed `max-width` rather than one derived from viewport height: a mobile browser toolbar shortens `100dvh`, which makes the viewport proportionally wider and would pull the frame off a phone's edges. `startRun()` also requests fullscreen (allowed because 開始 is a user gesture) to hide that toolbar, and `endRun()` exits.
- **Mock screens** — simplified but positionally faithful redraws of the three real game screens. Each element carries `--x`/`--y` (centre, as a % of the frame) and `--w`/`--h` (its size as a % of the 1080x2340 source screen), all measured off screenshots. Positions stay percentage-based so targets sit where the screen puts them, but **both** dimensions are resolved against the frame's *width* via container units — `--source-k` (2340/1080) converts a source height percentage into that width-relative unit — so a button keeps its proportions on any screen aspect. Sizing height off frame height instead made buttons ~30% flatter than the game whenever a browser toolbar shortened the viewport. `--ui-scale` scales every element and font together and is adjustable in 設定. Standard is **1**, which renders pixel-for-pixel the same as the real game (a 集結 button measures 274x70 physical px on a Galaxy S23, matching the screenshots). Sizes grow but positions do not, so the game's own spacing is the ceiling: the paired buttons sit 2.8% of the screen width apart and touch at scale 1.110, and 出征 leaves the screen at 1.119 — hence `MAX_UI_SCALE` of 1.05, which still leaves a visible gap. Any value in `MIN_UI_SCALE`-`MAX_UI_SCALE` (0.8-1.05) ranks — only the course timing has to match for a run to count — so target size varies between players on the board by design. Values outside that range only arise from hand-edited storage and are both clamped on load and rejected by `isStandardCourse()`. The frame is locked to that aspect ratio so targets land in the same place on any device. Decoy buttons are real: tapping one counts as a miss and costs time, same as in game.
- **Timing** — `pointerdown` (not `click`) and its own `event.timeStamp`, which shares the `performance.now()` clock. A target's clock starts when it actually painted, read via double-`requestAnimationFrame`, so refresh-rate jitter cancels out instead of being guessed at. `total = tapped[last] - shown[0]`.
- **Run invalidation** — a backgrounded tab stops painting and would stall the countdown, so `visibilitychange` kills the run rather than reporting a wrong time. False starts do the same, but are **off by default** and toggleable in settings. A false start is only a tap *before the clock reaches zero* — an eager tap during an inter-step animation gap is an ordinary miss, or the banana would fire constantly mid-run. A false start plays `playBananaHit()`: a banana flies in, squashes on impact, the frame reels, and the result screen follows once the animation is done.
- **Start time** — the picker defaults to `DEFAULT_LEAD_SECONDS` (10s) ahead and is never persisted, since a time restored from an earlier session is always in the past. A picked time that has already passed falls back to a fresh lead rather than rolling to tomorrow, and returning to the home screen refreshes a stale time while leaving a deliberate future one alone.
- **Course version** — `COURSE_VERSION` guards `delaysMs` in saved settings: when the standard course changes, stored delays adopt the new values instead of silently flagging every run as practice.
- **Settings** — `localStorage` (`rallyTrainerSettings`), merged over defaults on load. Per-step animation delays, input/display compensation, false-start toggle, name.
- **Standard vs practice** — tuning any delay away from `STANDARD_COURSE` makes the run *practice*: still timed and still kept in local history, but not submittable, so the shared board compares like with like.
- **Leaderboard** — `api/leaderboard.js`, an Upstash Redis sorted set scored on ms (`ZADD`/`ZRANGE`, top 50). Plain `fetch` against Upstash's REST API, so the project keeps its no-dependency/no-build property. Needs `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`; without them `getRedis()` returns `null` and routes 503 while the page falls back to local-only history. Submissions under 1000 ms are rejected as inhuman. Deliberately unauthenticated — bad entries get pruned by hand, and anyone can wipe the board with the `9t9t` phrase (client-side; the server checks it only to stop drive-by crawlers). `sw.js` skips `/api/` so the board is never served from cache.

## PWA

`manifest.json` + `sw.js` (stale-while-revalidate app-shell cache) + `icon-192.png`/`icon-512.png`/`apple-touch-icon.png` make the app installable on a phone home screen. All paths are root-relative (`/...`), which matches how Vercel serves the project. Bump `CACHE_NAME` in `sw.js` when shipping changes so installed clients pick up the new version instead of serving a stale cached copy. Service workers need a secure context — works on Vercel (https) and on `localhost`/`127.0.0.1`, not on `file://`.

## Documentation

- `docs/design-spec.md` — Full design spec with visual design, translation engine rules, and feature details
- `docs/implementation-plan.md` — Step-by-step build plan organized into tasks
