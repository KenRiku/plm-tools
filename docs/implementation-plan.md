# Gorilla Translator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file comedy web app that translates between gorilla language and Japanese, with sound, sharing, and playful UI.

**Architecture:** Single `index.html` containing all HTML, CSS, and JS. No build step, no dependencies. Translation engine uses layered randomization (signal analysis → weighted pools → fragment compositing → ring buffer → session flavor). Deployed as static file on GitHub Pages.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Web Audio API, Web Share API

---

### Task 1: Project Setup and HTML Structure

**Files:**
- Create: `gorilla-translator/index.html`

- [ ] **Step 1: Create the HTML skeleton with full page structure**

Create `gorilla-translator/index.html` with the complete HTML structure — all sections from header to emoji reactions. No CSS or JS yet, just semantic markup.

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ゴリラ翻訳機 — Gorilla Translator</title>
  <style>
    /* CSS added in Task 2 */
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="header-emoji">🦍</div>
      <h1 class="header-title">GORILLA TRANSLATOR</h1>
      <p class="header-subtitle">ゴリラ翻訳機</p>
    </header>

    <!-- Gorilla Name Badge -->
    <div class="name-badge">
      <span class="name-badge-icon">🦍</span>
      <span class="name-badge-text" id="gorillaNameDisplay">ゴリ太郎</span>
      <button class="name-badge-edit" id="nameEditBtn" aria-label="名前を変更">✏️</button>
      <input class="name-badge-input" id="gorillaNameInput" type="text" maxlength="20" style="display:none;">
    </div>

    <!-- Input Area -->
    <div class="input-card">
      <label class="input-label" for="mainInput">INPUT</label>
      <textarea id="mainInput" class="input-textarea" rows="3"
        placeholder="ゴリラ語を入力... 例: ウホウホ？ウホォ！"></textarea>
    </div>

    <!-- Main Action Buttons -->
    <div class="button-row">
      <button class="btn btn-translate" id="translateBtn">🦍→日本語 翻訳</button>
      <button class="btn btn-reverse" id="reverseBtn">日本語→🦍 逆翻訳</button>
    </div>

    <!-- Output Speech Bubble -->
    <div class="output-area" id="outputArea" style="display:none;">
      <div class="output-gorilla" id="outputGorilla">🦍</div>
      <div class="speech-bubble">
        <div class="speech-bubble-arrow"></div>
        <div class="speech-bubble-text" id="outputText"></div>
        <div class="speech-bubble-subtitle" id="outputSubtitle">ゴリ太郎の翻訳結果</div>
      </div>
    </div>

    <!-- Banana Progress Bar -->
    <div class="progress-card">
      <div class="progress-label">バナナパワー 🍌</div>
      <div class="progress-track">
        <div class="progress-fill" id="progressFill" style="width:0%"></div>
      </div>
      <div class="progress-max" id="progressMax" style="display:none;">🍌 MAX POWER! 🍌</div>
    </div>

    <!-- Secondary Buttons -->
    <div class="button-row">
      <button class="btn btn-secondary" id="soundBtn">🔊 Sound</button>
      <button class="btn btn-secondary" id="shareBtn">📤 Share</button>
    </div>

    <!-- Emoji Reactions -->
    <div class="emoji-reactions" id="emojiReactions">🦍🍌😂</div>

    <!-- Toast Notification -->
    <div class="toast" id="toast"></div>
  </div>

  <script>
    // JS added in Tasks 3-8
  </script>
</body>
</html>
```

- [ ] **Step 2: Open in browser to verify structure renders**

Run: `open gorilla-translator/index.html` (macOS)

Expected: Raw unstyled HTML elements visible — header, textarea, buttons, etc. Everything present but ugly.

---

### Task 2: Banana Pop CSS

**Files:**
- Modify: `gorilla-translator/index.html` (replace the `<style>` block)

- [ ] **Step 1: Add all CSS inside the `<style>` tag**

Replace `/* CSS added in Task 2 */` with the complete Banana Pop stylesheet:

```css
/* === Reset & Base === */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(180deg, #FFC107 0%, #FFD54F 40%, #FFF8E1 100%);
  min-height: 100vh;
  color: #3e2723;
}

.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 20px 16px 40px;
}

/* === Header === */
.header {
  text-align: center;
  padding: 24px 0 12px;
}

.header-emoji {
  font-size: 64px;
  line-height: 1;
}

.header-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #3e2723;
  margin-top: 8px;
}

.header-subtitle {
  font-size: 14px;
  color: #6d4c41;
  margin-top: 4px;
}

/* === Name Badge === */
.name-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 12px 0 16px;
}

.name-badge-icon { font-size: 18px; }

.name-badge-text {
  background: #FFF8E1;
  border: 2px dashed #d4a017;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #5d4037;
}

.name-badge-edit {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 4px;
}
.name-badge-edit:hover { opacity: 1; }

.name-badge-input {
  background: #FFF8E1;
  border: 2px solid #d4a017;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #5d4037;
  text-align: center;
  width: 140px;
  outline: none;
}

/* === Input Card === */
.input-card {
  background: white;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 12px;
}

.input-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #8d6e63;
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.input-textarea {
  width: 100%;
  background: #fffde7;
  border: 2px solid #ffe082;
  border-radius: 12px;
  padding: 12px;
  font-size: 16px;
  color: #3e2723;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.input-textarea:focus { border-color: #ffc107; }

/* === Buttons === */
.button-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  min-width: 120px;
  min-height: 44px;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s;
  font-family: inherit;
}
.btn:active { transform: scale(0.95); }

.btn-translate {
  background: #4CAF50;
  color: white;
  box-shadow: 0 3px 0 #388E3C;
}
.btn-translate:active { box-shadow: 0 1px 0 #388E3C; transform: scale(0.95) translateY(2px); }

.btn-reverse {
  background: #FF9800;
  color: white;
  box-shadow: 0 3px 0 #E65100;
}
.btn-reverse:active { box-shadow: 0 1px 0 #E65100; transform: scale(0.95) translateY(2px); }

.btn-secondary {
  background: #fffde7;
  color: #5d4037;
  border: 2px solid #ffe082;
  box-shadow: none;
}
.btn-secondary:active { background: #fff9c4; }

/* === Output Area === */
.output-area {
  margin-bottom: 12px;
  text-align: center;
}

.output-gorilla {
  font-size: 40px;
  line-height: 1;
  margin-bottom: -4px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.output-gorilla.react { transform: scale(1.3); }

.speech-bubble {
  background: white;
  border-radius: 16px;
  padding: 16px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  animation: bubbleIn 0.3s ease-out;
}

.speech-bubble-arrow {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}

.speech-bubble-text {
  font-size: 22px;
  font-weight: 700;
  color: #3e2723;
  word-break: break-word;
}

.speech-bubble-subtitle {
  font-size: 11px;
  color: #a1887f;
  margin-top: 8px;
}

@keyframes bubbleIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* === Progress Bar === */
.progress-card {
  background: rgba(255,255,255,0.6);
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 11px;
  font-weight: 600;
  color: #8d6e63;
  margin-bottom: 6px;
}

.progress-track {
  background: #ffe082;
  border-radius: 8px;
  height: 14px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #FFC107, #FF9800);
  height: 100%;
  border-radius: 8px;
  transition: width 0.5s ease-out;
}

.progress-max {
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  color: #FF6F00;
  margin-top: 6px;
  animation: maxFlash 0.6s ease-in-out;
}

@keyframes maxFlash {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.15); }
}

/* === Emoji Reactions === */
.emoji-reactions {
  text-align: center;
  font-size: 28px;
  letter-spacing: 10px;
  padding: 8px 0;
  transition: transform 0.3s;
}
.emoji-reactions.shake {
  animation: emojiShake 0.4s ease-in-out;
}

@keyframes emojiShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px) rotate(-3deg); }
  75% { transform: translateX(4px) rotate(3deg); }
}

/* === Toast === */
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: #3e2723;
  color: white;
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 100;
  pointer-events: none;
}
.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
```

- [ ] **Step 2: Open in browser to verify Banana Pop styling**

Run: `open gorilla-translator/index.html`

Expected: Yellow gradient background, styled buttons, input area, banana progress bar. No JS functionality yet.

---

### Task 3: Translation Data — Phrase Pools

**Files:**
- Modify: `gorilla-translator/index.html` (add JS inside `<script>`)

- [ ] **Step 1: Add phrase pool data and prefix/suffix lists**

Replace `// JS added in Tasks 3-8` with the translation data:

```javascript
// ============================================================
// 1. TRANSLATION DATA — Phrase pools, prefixes, suffixes
// ============================================================

const PHRASE_POOLS = {
  greeting: [
    'よう！', 'やあ', 'ウホ、来たな', 'おう、待ってたぞ', 'やっと来たか'
  ],
  question: [
    'それマジ？', 'ほんとに？', 'え、うそでしょ', '聞いてる？', 'なんで？',
    'マジか...', 'どういうこと？', '誰に聞いてんの？', 'は？', 'それ聞く？',
    'なんの話？', '知らんけど？', 'え、なに？'
  ],
  excited: [
    'めっちゃテンション上がる！', 'バナナ見つけた！！', '最高かよ！',
    'やばいやばい！', 'ドラミング始めるわ！', 'うおおおお！', 'テンションMAX！',
    'ジャングルが揺れる！', '止まらねえ！', 'これはアツい！', 'バナナ100本分の喜び！'
  ],
  passionate: [
    '今日は語りたい気分', '聞いてくれよ、長い話がある', 'めっちゃ興奮してる',
    '止まらないんだわ', '言いたいことがありすぎる', '熱い思いを伝えたい',
    '胸がいっぱい', '今のオレを見てくれ', '全力で伝える', '魂の叫びを聞け'
  ],
  casual: [
    'バナナくれ', '今ヒマ？', 'それわかる', 'ちょっと落ち着け', '仲間呼んでる',
    'よう', 'ん？', 'まあね', 'そうだな', 'べつに', 'ふーん', 'あー',
    'ヒマだな', 'なんかない？', '暇すぎてドラミングしてた'
  ],
  emphasis: [
    '何回言わせんの', '大事なことだから', 'しつこいって言われる', 'だから言ったじゃん',
    'いい加減わかれ', 'もう一回言うぞ', '聞いてなかったのか', 'メモしろ',
    '覚えとけ', 'ここテストに出る'
  ],
  emotional: [
    '気持ちが溢れてる', '複雑な気分', 'ゴリラだって泣く', 'いろいろあんのよ',
    '言葉にできない', '胸がぎゅっとなる', '感情のジェットコースター',
    'わかってほしい', '今日は色々あったんだ', 'ゴリラの心は繊細'
  ],
  melancholy: [
    'バナナ...ないの？', '森が恋しい', '一人は寂しいな', '雨の日は静かにしたい',
    'ため息しか出ない', '遠い目してる', 'ちょっと放っておいて',
    '木の上でぼーっとしたい', '今日は静かにドラミング'
  ]
};

const PREFIXES = ['', '', 'うーん、', 'あのさ、', 'ちょっと、', 'ねえ、', 'まあ、', 'おい、'];
const SUFFIXES = ['', '', 'って感じ', 'かな', 'でしょ', 'よね', 'けど', 'んだわ', 'じゃん'];

// Bonus emoji appended during session phase 3 (translations 6+)
const BONUS_EMOJI = ['🍌', '💪', '🦍', '🌴', '😤', '✨', '🔥'];

// Gorilla sounds for reverse translation
const GORILLA_SOUNDS = {
  short_kata: ['ウホ', 'ウッホ', 'ホ'],
  short_hira: ['うほ', 'うっほ', 'ほ'],
  medium_kata: ['ウホウホ', 'ウホッウホ'],
  medium_hira: ['うほうほ', 'うほっうほ'],
  long_kata: ['ウホウホウホ', 'ウッホウッホ', 'ウホウホウッホ'],
  long_hira: ['うほうほうほ', 'うっほうっほ'],
  dramatic: ['ウッ...', 'ドンドン🥁', '*胸を叩く*', '...', 'ウホォォォ']
};

// Reverse translation particles to split on
const PARTICLES = /([はがをにでともの]|[よねか](?=[。！？、]|$)|[。！？、\n])/;
```

- [ ] **Step 2: Verify no syntax errors**

Open browser console (Cmd+Option+J), reload page. Expected: No errors in console.

---

### Task 4: Translation Engine — Gorilla to Japanese

**Files:**
- Modify: `gorilla-translator/index.html` (append to `<script>`)

- [ ] **Step 1: Add signal analysis, weighted selection, ring buffer, and session state**

Append after the translation data:

```javascript
// ============================================================
// 2. TRANSLATION ENGINE — Gorilla → Japanese
// ============================================================

// Session state
const session = {
  translationCount: 0,
  ringBuffer: [],       // last 8 outputs
  ringBufferSize: 8,
  weights: {}           // category → { phrase: weight }
};

// Initialize weights for all pools
function initWeights() {
  for (const [category, phrases] of Object.entries(PHRASE_POOLS)) {
    session.weights[category] = {};
    for (const phrase of phrases) {
      session.weights[category][phrase] = 1;
    }
  }
}
initWeights();

/**
 * Analyze input signals and return the highest-priority category.
 * Priority: question > excitement > sadness > passionate > emphasis > emotional > casual
 */
function analyzeSignals(input) {
  const signals = [];
  const trimmed = input.trim();

  // Question: contains ? or ？
  if (/[?？]/.test(trimmed)) signals.push('question');

  // Excitement: contains ! or ！, or 3+ repeated chars
  if (/[!！]/.test(trimmed) || /(.)\1{2,}/.test(trimmed)) signals.push('excited');

  // Sadness: contains ... or 。。。
  if (/\.{3}|。{3}/.test(trimmed)) signals.push('melancholy');

  // Passionate: long input > 20 chars
  if (trimmed.length > 20) signals.push('passionate');

  // Repetition: same 2-3 char pattern repeated 3+ times
  if (/(.{2,3})\1{2,}/.test(trimmed)) signals.push('emphasis');

  // Emotional: both katakana and hiragana AND 2+ different punctuation types
  const hasKatakana = /[\u30A0-\u30FF]/.test(trimmed);
  const hasHiragana = /[\u3040-\u309F]/.test(trimmed);
  const punctTypes = new Set();
  if (/[?？]/.test(trimmed)) punctTypes.add('q');
  if (/[!！]/.test(trimmed)) punctTypes.add('e');
  if (/[、，]/.test(trimmed)) punctTypes.add('c');
  if (/[。.]/.test(trimmed)) punctTypes.add('p');
  if (hasKatakana && hasHiragana && punctTypes.size >= 2) signals.push('emotional');

  // Casual: short input < 5 chars (lowest priority)
  if (trimmed.length < 5) signals.push('casual');

  // Priority order — return first match
  const priority = ['question', 'excited', 'melancholy', 'passionate', 'emphasis', 'emotional', 'casual'];
  for (const cat of priority) {
    if (signals.includes(cat)) return cat;
  }
  return 'casual'; // default fallback
}

/**
 * Pick a phrase from the pool using weighted random selection.
 * Recently used phrases have halved weights.
 */
function weightedPick(category) {
  const phrases = PHRASE_POOLS[category];
  const weights = session.weights[category];

  // Calculate total weight
  let totalWeight = 0;
  for (const phrase of phrases) {
    totalWeight += weights[phrase];
  }

  // If all weights are 0 (extremely unlikely), reset them
  if (totalWeight === 0) {
    for (const phrase of phrases) {
      weights[phrase] = 1;
    }
    totalWeight = phrases.length;
  }

  // Weighted random pick
  let roll = Math.random() * totalWeight;
  for (const phrase of phrases) {
    roll -= weights[phrase];
    if (roll <= 0) {
      // Halve weight of picked phrase
      weights[phrase] = Math.max(0.1, weights[phrase] * 0.5);
      return phrase;
    }
  }
  return phrases[phrases.length - 1]; // fallback
}

/**
 * Optionally wrap a core phrase with prefix/suffix (~60% of the time).
 */
function maybeComposite(core) {
  if (Math.random() < 0.4) return core; // 40% — use phrase as-is

  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  return prefix + core + suffix;
}

/**
 * Check if result is in the ring buffer (would be a repeat).
 */
function isInRingBuffer(text) {
  return session.ringBuffer.includes(text);
}

/**
 * Add to ring buffer, evicting oldest if full.
 */
function pushRingBuffer(text) {
  session.ringBuffer.push(text);
  if (session.ringBuffer.length > session.ringBufferSize) {
    session.ringBuffer.shift();
  }
}

/**
 * Main translation function: Gorilla → Japanese.
 */
function translateGorillaToJapanese(input) {
  if (!input.trim()) return null;

  session.translationCount++;

  // Session flavor: first translation is always a greeting
  if (session.translationCount === 1) {
    const greetings = PHRASE_POOLS.greeting;
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    pushRingBuffer(greeting);
    return greeting;
  }

  // Analyze input signals
  const category = analyzeSignals(input);

  // Try up to 10 times to get a non-repeated result
  for (let attempt = 0; attempt < 10; attempt++) {
    const core = weightedPick(category);
    const result = maybeComposite(core);

    if (!isInRingBuffer(result)) {
      pushRingBuffer(result);

      // Session phase 3 (6+ translations): occasional bonus emoji
      if (session.translationCount >= 6 && Math.random() < 0.4) {
        const emoji = BONUS_EMOJI[Math.floor(Math.random() * BONUS_EMOJI.length)];
        return result + ' ' + emoji;
      }
      return result;
    }
  }

  // If all attempts repeated (very rare), just return the last attempt
  const fallback = weightedPick(category);
  pushRingBuffer(fallback);
  return fallback;
}
```

- [ ] **Step 2: Test in browser console**

Open console, run:
```javascript
console.log(translateGorillaToJapanese('ウホ'));       // greeting (first call)
console.log(translateGorillaToJapanese('ウホ？'));      // question category
console.log(translateGorillaToJapanese('ウホォォォ！')); // excited category
console.log(translateGorillaToJapanese('ウホ...'));     // melancholy category
```

Expected: Different phrases each time, first call always a greeting.

---

### Task 5: Reverse Translation Engine — Japanese to Gorilla

**Files:**
- Modify: `gorilla-translator/index.html` (append to `<script>`)

- [ ] **Step 1: Add reverse translation logic**

Append after the gorilla→Japanese engine:

```javascript
// ============================================================
// 3. REVERSE TRANSLATION ENGINE — Japanese → Gorilla
// ============================================================

/**
 * Split Japanese text into chunks by particles and punctuation.
 */
function chunkJapanese(input) {
  // Split on particles, keeping the delimiters
  const parts = input.split(PARTICLES).filter(p => p.length > 0);

  // Merge very small fragments back together
  const chunks = [];
  let current = '';
  for (const part of parts) {
    current += part;
    // If current chunk ends with a particle or punctuation, flush it
    if (PARTICLES.test(part) || current.length >= 3) {
      chunks.push(current);
      current = '';
    }
  }
  if (current) chunks.push(current);

  return chunks.length > 0 ? chunks : [input];
}

/**
 * Convert a single chunk to gorilla sound.
 */
function chunkToGorilla(chunk) {
  const len = chunk.length;
  const useKatakana = Math.random() < 0.5;

  let sound;
  if (len <= 3) {
    const pool = useKatakana ? GORILLA_SOUNDS.short_kata : GORILLA_SOUNDS.short_hira;
    sound = pool[Math.floor(Math.random() * pool.length)];
  } else if (len <= 7) {
    const pool = useKatakana ? GORILLA_SOUNDS.medium_kata : GORILLA_SOUNDS.medium_hira;
    sound = pool[Math.floor(Math.random() * pool.length)];
  } else {
    const pool = useKatakana ? GORILLA_SOUNDS.long_kata : GORILLA_SOUNDS.long_hira;
    sound = pool[Math.floor(Math.random() * pool.length)];
  }

  // Preserve trailing punctuation
  if (/[！!]$/.test(chunk)) sound = sound.replace(/[。]?$/, '') + '！';
  else if (/[？?]$/.test(chunk)) sound = sound.replace(/[。]?$/, '') + '？';
  else if (/[。]$/.test(chunk)) sound += '。';

  return sound;
}

/**
 * Main reverse translation: Japanese → Gorilla.
 */
function translateJapaneseToGorilla(input) {
  if (!input.trim()) return null;

  session.translationCount++;
  const chunks = chunkJapanese(input.trim());

  const parts = [];
  for (let i = 0; i < chunks.length; i++) {
    // ~15% chance to insert a dramatic sound between chunks
    if (i > 0 && Math.random() < 0.15) {
      const dramatic = GORILLA_SOUNDS.dramatic;
      parts.push(dramatic[Math.floor(Math.random() * dramatic.length)]);
    }
    parts.push(chunkToGorilla(chunks[i]));
  }

  return parts.join(' ');
}
```

- [ ] **Step 2: Test in browser console**

```javascript
console.log(translateJapaneseToGorilla('今日はいい天気ですね'));
console.log(translateJapaneseToGorilla('バナナが好き！'));
console.log(translateJapaneseToGorilla('明日は何する？'));
```

Expected: Varied gorilla sounds with punctuation preserved. Different output each time.

---

### Task 6: Sound Generation (Web Audio API)

**Files:**
- Modify: `gorilla-translator/index.html` (append to `<script>`)

- [ ] **Step 1: Add Web Audio API gorilla sound generator**

```javascript
// ============================================================
// 4. SOUND GENERATION — Web Audio API "uho" sound
// ============================================================

let audioCtx = null;

/**
 * Play a single "uho" tone burst.
 * @param {number} startTime - AudioContext time to start at
 * @param {number} baseFreq - Base frequency in Hz
 */
function playUho(startTime, baseFreq) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = 'sawtooth';

  // "Uh" part: low frequency
  osc.frequency.setValueAtTime(baseFreq, startTime);
  // "Ho" part: pitch bend up
  osc.frequency.linearRampToValueAtTime(baseFreq * 1.6, startTime + 0.15);
  // Drop back
  osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, startTime + 0.3);

  // Gain envelope: quick attack, sustain, decay
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.3, startTime + 0.03);
  gain.gain.setValueAtTime(0.3, startTime + 0.15);
  gain.gain.linearRampToValueAtTime(0, startTime + 0.35);

  osc.start(startTime);
  osc.stop(startTime + 0.35);
}

/**
 * Play a gorilla sound: 1-3 "uho" bursts.
 */
function playGorillaSound() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;
  const burstCount = 1 + Math.floor(Math.random() * 3); // 1-3 bursts

  for (let i = 0; i < burstCount; i++) {
    const baseFreq = 80 + Math.random() * 40; // 80-120 Hz
    playUho(now + i * 0.4, baseFreq);
  }
}
```

- [ ] **Step 2: Test in browser console**

```javascript
playGorillaSound();
```

Expected: A short low-pitched "uho" sound plays through speakers. 1-3 bursts.

---

### Task 7: Share, Name Management, Progress Bar, Animations

**Files:**
- Modify: `gorilla-translator/index.html` (append to `<script>`)

- [ ] **Step 1: Add share, name, progress bar, animation, and toast utilities**

```javascript
// ============================================================
// 5. SHARE FUNCTIONALITY
// ============================================================

let lastInput = '';
let lastOutput = '';

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

async function shareTranslation() {
  if (!lastInput || !lastOutput) {
    showToast('先に翻訳してね！');
    return;
  }

  const text = '「' + lastInput + ' → ' + lastOutput + ' 🦍」\nゴリラ翻訳機で翻訳しました';

  if (navigator.share) {
    try {
      await navigator.share({ text: text });
    } catch (e) {
      // User cancelled or share failed — fall through to clipboard
      if (e.name !== 'AbortError') copyToClipboard(text);
    }
  } else {
    copyToClipboard(text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('コピーしたよ！📋');
  }).catch(() => {
    showToast('コピーできなかった...');
  });
}

// ============================================================
// 6. GORILLA NAME MANAGEMENT
// ============================================================

const DEFAULT_NAME = 'ゴリ太郎';
const NAME_STORAGE_KEY = 'gorillaName';

function getGorillaName() {
  return localStorage.getItem(NAME_STORAGE_KEY) || DEFAULT_NAME;
}

function setGorillaName(name) {
  const trimmed = name.trim();
  const finalName = trimmed || DEFAULT_NAME;
  localStorage.setItem(NAME_STORAGE_KEY, finalName);
  updateNameDisplay(finalName);
}

function updateNameDisplay(name) {
  document.getElementById('gorillaNameDisplay').textContent = name;
  document.getElementById('outputSubtitle').textContent = name + 'の翻訳結果';
}

function startNameEdit() {
  const display = document.getElementById('gorillaNameDisplay');
  const input = document.getElementById('gorillaNameInput');
  const editBtn = document.getElementById('nameEditBtn');

  input.value = display.textContent;
  display.style.display = 'none';
  editBtn.style.display = 'none';
  input.style.display = '';
  input.focus();
  input.select();
}

function finishNameEdit() {
  const display = document.getElementById('gorillaNameDisplay');
  const input = document.getElementById('gorillaNameInput');
  const editBtn = document.getElementById('nameEditBtn');

  setGorillaName(input.value);
  input.style.display = 'none';
  display.style.display = '';
  editBtn.style.display = '';
}

// ============================================================
// 7. BANANA PROGRESS BAR
// ============================================================

let bananaProgress = 0;

function updateProgressBar() {
  bananaProgress = Math.min(100, bananaProgress + 12);
  const fill = document.getElementById('progressFill');
  const maxLabel = document.getElementById('progressMax');

  fill.style.width = bananaProgress + '%';

  if (bananaProgress >= 100 && maxLabel.style.display === 'none') {
    maxLabel.style.display = '';
    // Re-trigger animation
    maxLabel.style.animation = 'none';
    maxLabel.offsetHeight; // force reflow
    maxLabel.style.animation = '';
  }
}

// ============================================================
// 8. ANIMATIONS
// ============================================================

function animateGorilla() {
  const gorilla = document.getElementById('outputGorilla');
  gorilla.classList.add('react');
  setTimeout(() => gorilla.classList.remove('react'), 300);
}

function animateEmoji() {
  const reactions = document.getElementById('emojiReactions');
  // Randomize emoji set
  const sets = ['🦍🍌😂', '🦍💪🍌', '🍌😤🦍', '🦍🌴✨', '🔥🦍🍌', '🦍😎🍌'];
  reactions.textContent = sets[Math.floor(Math.random() * sets.length)];
  reactions.classList.add('shake');
  setTimeout(() => reactions.classList.remove('shake'), 400);
}
```

- [ ] **Step 2: Verify no console errors**

Reload page, check browser console. Expected: No errors.

---

### Task 8: Event Listeners and Initialization

**Files:**
- Modify: `gorilla-translator/index.html` (append to `<script>`)

- [ ] **Step 1: Wire up all event listeners and run init**

```javascript
// ============================================================
// 9. EVENT LISTENERS & INITIALIZATION
// ============================================================

function handleTranslation(result) {
  if (!result) return;

  const outputArea = document.getElementById('outputArea');
  const outputText = document.getElementById('outputText');

  outputText.textContent = '「' + result + '」';
  outputArea.style.display = '';

  // Re-trigger speech bubble animation
  const bubble = outputArea.querySelector('.speech-bubble');
  bubble.style.animation = 'none';
  bubble.offsetHeight; // force reflow
  bubble.style.animation = '';

  animateGorilla();
  animateEmoji();
  updateProgressBar();
}

document.addEventListener('DOMContentLoaded', function() {
  const mainInput = document.getElementById('mainInput');
  const translateBtn = document.getElementById('translateBtn');
  const reverseBtn = document.getElementById('reverseBtn');
  const soundBtn = document.getElementById('soundBtn');
  const shareBtn = document.getElementById('shareBtn');
  const nameEditBtn = document.getElementById('nameEditBtn');
  const nameInput = document.getElementById('gorillaNameInput');

  // Restore gorilla name from localStorage
  updateNameDisplay(getGorillaName());

  // Translate: Gorilla → Japanese
  translateBtn.addEventListener('click', function() {
    const input = mainInput.value;
    const result = translateGorillaToJapanese(input);
    if (result) {
      lastInput = input;
      lastOutput = result;
      handleTranslation(result);
    }
  });

  // Reverse: Japanese → Gorilla
  reverseBtn.addEventListener('click', function() {
    const input = mainInput.value;
    const result = translateJapaneseToGorilla(input);
    if (result) {
      lastInput = input;
      lastOutput = result;
      handleTranslation(result);
    }
  });

  // Sound button
  soundBtn.addEventListener('click', function() {
    playGorillaSound();
    animateGorilla();
  });

  // Share button
  shareBtn.addEventListener('click', shareTranslation);

  // Name editing
  nameEditBtn.addEventListener('click', startNameEdit);
  nameInput.addEventListener('blur', finishNameEdit);
  nameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') finishNameEdit();
    if (e.key === 'Escape') {
      nameInput.value = getGorillaName();
      finishNameEdit();
    }
  });
});
```

- [ ] **Step 2: Full end-to-end test in browser**

Open `gorilla-translator/index.html` and test:

1. Type "ウホ？" → click translate → should show a question-category phrase in speech bubble
2. Type "ウホウホウホ！！" → click translate → should show an excited phrase
3. Type "今日はいい天気" → click reverse → should show gorilla sounds
4. Click 🔊 Sound → should hear "uho" audio
5. Translate something → click 📤 Share → should copy to clipboard / show share sheet
6. Click ✏️ next to ゴリ太郎 → change name → verify it persists after reload
7. Translate 9+ times → banana bar should fill to 100% and show MAX POWER
8. Verify on mobile-width viewport (toggle device toolbar in DevTools)

Expected: All features work. Animations fire on each translation. No console errors.

- [ ] **Step 3: Commit**

```bash
cd gorilla-translator
git init
git add index.html
git commit -m "feat: gorilla translator — complete single-file app"
```

---

### Task 9: GitHub Pages Deployment (Manual Instructions)

This task is a reference guide — no code changes needed.

- [ ] **Step 1: Create the repository on GitHub**

1. Go to https://github.com/new (logged into personal account)
2. Repository name: `gorilla-translator` (or whatever you prefer)
3. Set to **Public** (required for free GitHub Pages)
4. Do NOT initialize with README (we already have files)
5. Click "Create repository"

- [ ] **Step 2: Push the code**

GitHub will show push instructions. Run these in `gorilla-translator/`:

```bash
git remote add origin https://github.com/YOUR_USERNAME/gorilla-translator.git
git branch -M main
git push -u origin main
```

(Use your personal account credentials when prompted — GitHub may ask for a Personal Access Token instead of password.)

- [ ] **Step 3: Enable GitHub Pages**

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)**
4. Click **Save**
5. Wait 1-2 minutes for deployment

Your site will be live at: `https://YOUR_USERNAME.github.io/gorilla-translator/`

- [ ] **Step 4: Verify the live site**

Open the URL in your browser and mobile. Test all features work the same as local.
