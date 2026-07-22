# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gorilla Translator (ゴリラ翻訳機) — a single-page comedy web app that "translates" between gorilla language (ウホウホ) and funny Japanese phrases. No AI, no backend, no dependencies. Everything lives in one `index.html` file deployed on GitHub Pages.

## Development

No build step. Open `index.html` in a browser to develop and test. The entire app is a single HTML file with inline CSS and JS.

## Deployment

GitHub Pages serving from root of `main` branch. Just push to `main`.

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
  10. **Easter eggs** — Konami code → disco mode (`toggleDisco`), `バナナバナナ` → banana祭り, legendary keywords (キング/ボス/王様/…) force a golden translation
  11. **Mood UI, animations & event listeners** — `updateMoodUI()`, `bananaRain()`, `quakeScreen()`, mood-driven emoji reactions

## Key Design Decisions

- All state is session-scoped except gorilla name (localStorage)
- Translation uses layered randomization, not AI: signal analysis → weighted pools → **grammar-aware compositing** → ring buffer → mood/session flavor
- **Absurd, not broken**: inaccuracy is the joke, but output must be well-formed Japanese. Phrases are tagged by grammatical `kind` and `compose()` only attaches fragments where they stay grammatical. When adding phrases, tag them correctly (`p`/`c`/`q`/`x`/`s`) or compositing will mangle them.
- `session.translationCount` tracks total translations (both directions); `session.gorillaTranslateCount` tracks gorilla→JP only (used for first-greeting logic); `session.mood` / `session.moodPoints` drive the mood chip and emoji reactions

## Documentation

- `docs/design-spec.md` — Full design spec with visual design, translation engine rules, and feature details
- `docs/implementation-plan.md` — Step-by-step build plan organized into tasks
