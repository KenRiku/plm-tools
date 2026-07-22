# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gorilla Translator (ゴッリッラ翻訳) — a single-page comedy web app that "translates" between gorilla language (ウホウホ) and funny Japanese phrases. No AI, no backend, no dependencies. The core app is one `index.html` file with inline CSS and JS; a small set of PWA support files (manifest, service worker, icons) sit alongside it so it can be installed on a phone home screen. Deployed on Vercel.

`dino-demo.html` is a separate, standalone Chrome-Dino-style gorilla runner (canvas, no dependencies) that is **not linked from `index.html`**'s markup — keeping it in its own file means it adds zero weight to the main translator's bundle. It's reachable by typing the secret phrase `ゴリランナー` into the main input, which reveals a button that opens it in a new tab (see item 15 below).

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
  15. **Gorilla runner unlock** — typing the secret phrase `ゴリランナー` (`RUNNER_SECRET`) into the main input reveals a button linking to `dino-demo.html` (opened in a new tab); unlock state persists in `localStorage` (`gorillaRunnerUnlocked`) so it's a one-time discovery, checked in the same `mainInput` listener as the Konami text detector

## Key Design Decisions

- Most state is session-scoped; gorilla name, translation streak, lifetime banana power (evolution), and the gorilla runner unlock persist via `localStorage`
- Translation uses layered randomization, not AI: signal analysis → weighted pools → **grammar-aware compositing** → ring buffer → mood/session flavor
- **Absurd, not broken**: inaccuracy is the joke, but output must be well-formed Japanese. Phrases are tagged by grammatical `kind` and `compose()` only attaches fragments where they stay grammatical. When adding phrases, tag them correctly (`p`/`c`/`q`/`x`/`s`) or compositing will mangle them.
- `session.translationCount` tracks total translations (both directions); `session.gorillaTranslateCount` tracks gorilla→JP only (used for first-greeting logic); `session.mood` / `session.moodPoints` drive the mood chip and emoji reactions
- New heavier features (like the gorilla runner game) go in their own standalone file first, unlinked from `index.html`'s markup, so the main app's payload stays light — gate access via a secret trigger rather than a visible link

## PWA

`manifest.json` + `sw.js` (stale-while-revalidate app-shell cache) + `icon-192.png`/`icon-512.png`/`apple-touch-icon.png` make the app installable on a phone home screen. All paths are root-relative (`/...`), which matches how Vercel serves the project. Bump `CACHE_NAME` in `sw.js` when shipping changes so installed clients pick up the new version instead of serving a stale cached copy. Service workers need a secure context — works on Vercel (https) and on `localhost`/`127.0.0.1`, not on `file://`.

## Documentation

- `docs/design-spec.md` — Full design spec with visual design, translation engine rules, and feature details
- `docs/implementation-plan.md` — Step-by-step build plan organized into tasks
