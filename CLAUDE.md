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

- **CSS** (`<style>` block): "Banana Pop" visual design — yellow gradient background, chunky rounded UI, 480px max-width mobile-first layout
- **HTML**: Single-column layout with header, name badge, input textarea, action buttons, speech bubble output, banana progress bar, secondary buttons, emoji reactions, toast
- **JS** (`<script>` block), organized as:
  1. **Translation data** — `PHRASE_POOLS` (8 categories: greeting, question, excited, passionate, casual, emphasis, emotional, melancholy), prefix/suffix arrays, `GORILLA_SOUNDS` mapping
  2. **Gorilla→Japanese engine** — `analyzeSignals()` detects input mood, `weightedPick()` selects from category with decay weights, `maybeComposite()` adds prefix/suffix (~60% of time), ring buffer prevents repeats within last 8 outputs, session flavor (first translation = greeting, 6+ = bonus emoji)
  3. **Japanese→Gorilla engine** — `chunkJapanese()` splits by particles/punctuation, `chunkToGorilla()` maps chunk length to gorilla sounds (short/medium/long), randomly alternates katakana/hiragana, 15% chance of dramatic interjections
  4. **Sound** — Web Audio API oscillator-based "uho" (no audio files)
  5. **Share** — Web Share API with clipboard fallback
  6. **Name management** — localStorage-persisted gorilla name (default: ゴリ太郎)
  7. **Progress bar** — Session-scoped banana power, +12% per translation, decorative only
  8. **Animations & event listeners**

## Key Design Decisions

- All state is session-scoped except gorilla name (localStorage)
- Translation uses layered randomization, not AI: signal analysis → weighted pools → fragment compositing → ring buffer → session flavor
- `session.translationCount` tracks total translations (both directions); `session.gorillaTranslateCount` tracks gorilla→JP only (used for first-greeting logic)

## Documentation

- `docs/design-spec.md` — Full design spec with visual design, translation engine rules, and feature details
- `docs/implementation-plan.md` — Step-by-step build plan organized into tasks
