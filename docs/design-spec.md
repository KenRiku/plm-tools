# Gorilla Translator — Design Spec

## Overview

A standalone, single-page web app that "translates" between gorilla language (ウホウホ) and funny Japanese phrases. Pure comedy — no AI, no backend, no dependencies. Ships as a single HTML file on GitHub Pages.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting | GitHub Pages (personal account) | Free, simple, no backend needed |
| Visual style | Banana Pop | Bright yellow, chunky, maximum goofiness |
| Layout | Single panel, centered column | Best mobile experience, simplest to build |
| Gorilla personality | Character with speech bubble | Output appears as gorilla speech, renamable name |
| Visuals | Emoji-only (for now) | Self-contained single file; images added later |
| Translation engine | Rule-based with 5 variety techniques | No LLM; feels varied through layered randomization |
| Frameworks | None — pure HTML/CSS/JS | Zero dependencies, single file |

## Page Structure

Top-to-bottom single column layout:

1. **Header** — 🦍 emoji (large), title "GORILLA TRANSLATOR", subtitle "ゴリラ翻訳機"
2. **Gorilla name badge** — Default "ゴリ太郎", pencil icon to rename. Stored in localStorage. Purely cosmetic — does not affect translation logic.
3. **Input textarea** — Accepts gorilla language or Japanese text. Placeholder hint showing example input.
4. **Main action buttons** (row):
   - "🦍→日本語 翻訳" (green) — Gorilla-to-Japanese
   - "日本語→🦍 逆翻訳" (orange) — Japanese-to-Gorilla
5. **Speech bubble output** — Gorilla emoji above, translation result in a white speech bubble with a triangle pointer. Shows "ゴリ太郎の翻訳結果" subtitle.
6. **Banana progress bar** — Decorative. Fills as user translates more in the session. Label: "バナナパワー 🍌"
7. **Secondary action buttons** (row):
   - "🔊 Sound" — Play gorilla sound via Web Audio API
   - "📤 Share" — Web Share API or clipboard fallback
8. **Random emoji reactions** — 🦍🍌😂 area that reacts to translations

## Visual Design — Banana Pop

- **Background**: Gradient from #FFC107 (top) to #FFF8E1 (bottom)
- **Text color**: Dark brown #3e2723 for headings, #5d4037 / #6d4c41 for body
- **Cards/containers**: White with border-radius: 16px, subtle box-shadow
- **Buttons**: Chunky, rounded (12px radius), 3px bottom shadow for a "3D press" effect. Green (#4CAF50) for translate, orange (#FF9800) for reverse.
- **Input**: Yellow-tinted background (#fffde7), dashed or solid yellow border (#ffe082)
- **Typography**: System font stack, bold weights (700-800 for headings)
- **Animations**: Button click bounce (scale down then up), gorilla emoji shake/scale on translation

## Translation Engine — Gorilla to Japanese

### Signal Analysis

Score each input on multiple axes simultaneously:

| Signal | Detection | Category |
|--------|-----------|----------|
| Question | Contains `?` or `？` | question |
| Excitement | Contains `!` or `！`, or 3+ repeated chars | excited |
| Long input | > 20 characters | passionate |
| Short input | < 5 characters | casual |
| Repetition | Same 2-3 char pattern repeated 3+ times | emphasis |
| Intensity | Input contains both katakana and hiragana, AND 2+ different punctuation marks | emotional |
| Sadness | Contains `...` or `。。。` | melancholy |

Multiple signals can fire. Priority when combining: question > excitement > sadness > passionate > emphasis > emotional > casual.

### Phrase Pools

Each category has 8-15 phrases. Examples (full lists in implementation):

- **question**: それマジ？ / ほんとに？ / え、うそでしょ / 聞いてる？ / なんで？ / マジか... / どういうこと？ / 誰に聞いてんの？
- **excited**: めっちゃテンション上がる！ / バナナ見つけた！！ / 最高かよ！ / やばいやばい！ / ドラミング始めるわ！
- **passionate**: 今日は語りたい気分 / 聞いてくれよ、長い話がある / めっちゃ興奮してる / 止まらないんだわ
- **casual**: バナナくれ / 今ヒマ？ / それわかる / ちょっと落ち着け / 仲間呼んでる / よう / ん？
- **emphasis**: 何回言わせんの / 大事なことだから / しつこいって言われる / だから言ったじゃん
- **emotional**: 気持ちが溢れてる / 複雑な気分 / ゴリラだって泣く / いろいろあんのよ
- **melancholy**: バナナ...ないの？ / 森が恋しい / 一人は寂しいな / 雨の日は静かにしたい

### Fragment Compositing (grammar-aware)

Build output from randomized pieces, but only where it stays grammatical:

```
[prefix] + [core phrase] + [suffix]

prefix pool:  あのさ、 / ねえ、 / まあ、 / ちょっと、 / いや、 / つまり、 / ぶっちゃけ、 / ていうか、 / うーん、 / おい、
suffix pool:  って感じ / かな / かも / って話
```

**Guiding principle: absurd, not broken.** Inaccuracy is the joke; ungrammatical mush is not. The original engine blindly appended suffixes and produced broken output like `バナナくれでしょ` (imperative + でしょ) or stacked fillers like `ちょっと、え、うそでしょって感じ`.

To fix this, every phrase is tagged with a grammatical `kind`:

| kind | meaning | prefix? | suffix? |
|------|---------|---------|---------|
| `p` | plain declarative | yes | yes |
| `c` | command / imperative | yes | no |
| `q` | question (already interrogative) | no | no |
| `x` | exclamation (keeps its own `！`) | no | no |
| `s` | set phrase (self-contained) | no | no |

`compose()` attaches a prefix only to `p`/`c` phrases (and never when the phrase already opens with a comma/interjection), and a suffix only to `p` phrases that don't already end in punctuation. Suffixes are restricted to universally-safe tails (`って感じ` / `かな` / `かも` / `って話`) that stay grammatical after any noun, verb, or adjective. Question phrases carry their own `？` and are left untouched.

## Gorilla Mood System

The gorilla has a visible mood that drifts based on what you translate:

| Mood | Face | Label | Triggered by |
|------|------|-------|--------------|
| chill | 😎 | ごきげん | casual / greeting |
| hyped | 🤩 | 大興奮 | excited / passionate |
| hangry | 😤 | おこ | question / emphasis |
| emo | 🥺 | おセンチ | emotional / melancholy |
| lovey | 🥰 | ラブラブ | affection keywords (好き/愛/大好き/…) |

`bumpMood()` decays all mood points by 0.5 each translation and adds to the current one, with ties broken toward the freshly-bumped mood — so a single strong input flips the mood while a streak still shows some memory. Mood colors the chip, the emoji reactions, and the flavor emoji appended to translations. Cosmetic only — it does not change which phrase category is chosen.

## Gorilla-o-meter (fake accuracy rating)

Each translation shows a mock academic accuracy line under the result, e.g. `翻訳精度 98.3% ・ 🦍🎓 ゴリラ言語学会 認定`. Percentages are usually suspiciously precise and high (85–99.9%), but ~16% of the time go comically wrong: `404%`, over-100%, or `0.x%`. Legendary translations read `∞%`. Certifications are drawn from a joke pool (`CERTS`).

## Banana Combo Meter

Rapid-fire translations (each within 2.2s of the last) build a combo streak. At ≥3 a `🔥 N COMBO!!` badge pops; at ≥5 it escalates (`SUPER`, then `ULTRA GORILLA` at ≥8) and adds a screen quake, banana rain, and extra gorilla grunts. Decorative — rewards button-mashing.

## Easter Eggs

- **Konami code** (↑↑↓↓←→←→BA) → disco gorilla mode: rainbow background, spinning header emoji, banana rain. Toggle off with the code again.
- **`バナナバナナ`** in the input → banana祭り (30-banana rain + toast).
- **Legendary translations** — keywords キング/ボス/王様/伝説/レジェンド/ゴッド (or a rare ~2.5% random roll) force a "legendary" phrase in a glowing gold speech bubble with a 👑 gorilla and `∞%` rating.

### Variety Mechanisms

1. **Weighted pools**: Each phrase has a base weight. Recently used phrases get weight halved. Weights reset after all phrases in a category have been used.
2. **Ring buffer**: Track last 8 outputs. Never repeat an exact output within the buffer window.
3. **Session flavor**:
   - Translation #1: Always a greeting-like phrase (「よう！」「やあ」「ウホ、来たな」)
   - Translations 2-5: Normal behavior
   - Translations 6+: More enthusiastic phrases, occasional bonus emoji in output
   - Banana progress bar fills proportionally (resets at page reload)

## Translation Engine — Japanese to Gorilla (Reverse)

### Chunking

Split input by Japanese particles and punctuation: は、が、を、に、で、と、も、の、よ、ね、か、。、！、？、、

Each chunk maps to a gorilla sound unit.

### Sound Mapping

| Chunk property | Gorilla output |
|----------------|----------------|
| Short (1-3 chars) | ウホ / うほ |
| Medium (4-7 chars) | ウホウホ / うほうほ |
| Long (8+ chars) | ウホウホウホ / ウッホウッホ |
| Ends with ！ | ウホォ！/ ウホッ！ |
| Ends with ？ | ウホ？ / ...ウホ？ |
| Ends with 。 | ウホ。 |

### Variety

- Randomly alternate between katakana (ウホ) and hiragana (うほ) per chunk
- Occasionally insert dramatic variations: ウッ... / ドンドン🥁 / *胸を叩く*
- Add random spacing and punctuation drama

## Sound Feature

Use Web Audio API to generate gorilla-like sounds. No external audio files.

### Implementation

Create an oscillator-based "uho" sound:
- Low frequency oscillator (80-120 Hz) for the base "uh" tone
- Quick pitch bend up for the "ho" part
- Short duration (~300ms per "uho")
- Add slight gain envelope (attack/decay) for naturalness
- Play 1-3 "uho" bursts with slight gaps

## Share Feature

1. Build share text: `「{input} → {output} 🦍」\nゴリラ翻訳機で翻訳しました`
2. Try `navigator.share()` (Web Share API) if available
3. Fallback: `navigator.clipboard.writeText()` with a "Copied!" toast notification

## Animations

- **Button click**: `transform: scale(0.95)` on `:active`, spring back with CSS transition
- **Gorilla emoji reaction**: On translation, the gorilla emoji in the output section does a brief scale-up (1.0 → 1.3 → 1.0) over 300ms
- **Speech bubble**: Fade-in + slight slide-up when translation appears
- **Banana progress bar**: Smooth width transition on fill
- **Random emoji reactions**: Brief shake animation on the 🦍🍌😂 row after each translation

## Gorilla Name

- Default: ゴリ太郎
- Pencil icon (✏️) beside the name, clicking opens an inline text input
- Saved to `localStorage` under key `gorillaName`
- Restored on page load
- Displayed in the speech bubble subtitle: "{name}の翻訳結果"
- Does NOT affect translation logic

## Banana Progress Bar

- Purely decorative / gamification element
- Starts at 0%, increments ~12% per translation (caps at 100%)
- At 100%: show a brief "🍌 MAX POWER! 🍌" flash animation
- Resets on page reload (session-scoped, not persisted)
- Label: "バナナパワー 🍌"

## Mobile Responsiveness

- Max-width: 480px centered container
- All elements stack vertically
- Buttons wrap if needed (flex-wrap)
- Textarea at comfortable touch size
- Touch-friendly button sizing (min 44px height)

## File Structure

Single file: `index.html`

Internal organization:
```
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ゴリラ翻訳機 — Gorilla Translator</title>
  <style>/* All CSS here */</style>
</head>
<body>
  <!-- All HTML here -->
  <script>/* All JS here, organized in sections:
    1. Translation data (phrase pools, weights)
    2. Translation engine (signal analysis, compositing, ring buffer)
    3. Reverse translation engine
    4. Sound generation (Web Audio API)
    5. Share functionality
    6. Gorilla name management
    7. Banana progress bar
    8. Animations
    9. Event listeners and initialization
  */</script>
</body>
</html>
```

## Deployment

- Repository: New repo on personal GitHub account
- Branch: `main`
- GitHub Pages: Serve from root of `main` branch
- Single `index.html` at repo root
- Optional: Add a `README.md` explaining the project

## Future Enhancements (Out of Scope)

- Custom gorilla images/illustrations to replace emoji
- More phrase pools and categories
- Custom domain
- OGP meta tags for social sharing previews
- Sound variations / volume control
