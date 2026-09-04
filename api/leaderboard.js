// Shared rally-tap leaderboard, stored as an Upstash Redis sorted set keyed on
// milliseconds — so ascending rank is the ranking. Talks to Upstash over its
// REST API so the project stays dependency-free and needs no build step.

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const LEADERBOARD_KEY = 'rally:leaderboard';
const MAX_ENTRIES = 50;
const MIN_PLAUSIBLE_MS = 1000;
const MAX_PLAUSIBLE_MS = 120000;
const MAX_NAME_LENGTH = 24;
const CLEAR_PHRASE = '9t9t';

function getRedis() {
  if (!REDIS_URL || !REDIS_TOKEN) return null;

  return async function command(args) {
    const response = await fetch(REDIS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) throw new Error(`Upstash ${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error);
    return payload.result;
  };
}

function parseEntry(member) {
  try {
    const entry = JSON.parse(member);
    return { name: String(entry.name), ms: Number(entry.ms), at: Number(entry.at) };
  } catch (e) {
    return null;
  }
}

async function readTopEntries(redis) {
  const members = await redis(['ZRANGE', LEADERBOARD_KEY, '0', String(MAX_ENTRIES - 1)]);
  return (members || []).map(parseEntry).filter(Boolean);
}

function validateSubmission(body) {
  const ms = Math.round(Number(body && body.ms));
  if (!Number.isFinite(ms)) return { error: 'ms must be a number' };
  if (ms < MIN_PLAUSIBLE_MS) return { error: `ms below the ${MIN_PLAUSIBLE_MS}ms human floor` };
  if (ms > MAX_PLAUSIBLE_MS) return { error: 'ms too large' };

  const name = String((body && body.name) || '').trim().slice(0, MAX_NAME_LENGTH);
  if (!name) return { error: 'name is required' };

  return { entry: { name, ms, at: Date.now() } };
}

async function addEntry(redis, entry) {
  await redis(['ZADD', LEADERBOARD_KEY, String(entry.ms), JSON.stringify(entry)]);
  await redis(['ZREMRANGEBYRANK', LEADERBOARD_KEY, String(MAX_ENTRIES), '-1']);
}

module.exports = async (req, res) => {
  const redis = getRedis();
  if (!redis) {
    res.status(503).json({ error: 'leaderboard is not configured' });
    return;
  }

  try {
    if (req.method === 'GET') {
      res.status(200).json({ entries: await readTopEntries(redis) });
      return;
    }

    if (req.method === 'POST') {
      const { entry, error } = validateSubmission(req.body);
      if (error) {
        res.status(400).json({ error });
        return;
      }
      await addEntry(redis, entry);
      res.status(200).json({ entries: await readTopEntries(redis) });
      return;
    }

    if (req.method === 'DELETE') {
      // The phrase is public (it lives in the page source) and is only here to
      // stop drive-by crawlers from wiping the board.
      if (!req.body || req.body.phrase !== CLEAR_PHRASE) {
        res.status(403).json({ error: 'wrong phrase' });
        return;
      }
      await redis(['DEL', LEADERBOARD_KEY]);
      res.status(200).json({ entries: [] });
      return;
    }

    res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    res.status(502).json({ error: 'leaderboard store unavailable' });
  }
};
