export function splitSentences(text) {
  return (text || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function words(text) {
  return (text || '').toLowerCase().match(/[a-z']+/g) || [];
}

export function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export function ensurePeriod(text) {
  const t = (text || '').trim();
  if (!t) return t;
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

/** Levenshtein distance — used for rough word-match scoring. */
export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[m][n];
}

export function similarity(a, b) {
  const x = (a || '').toLowerCase().trim();
  const y = (b || '').toLowerCase().trim();
  if (!x && !y) return 1;
  return 1 - levenshtein(x, y) / Math.max(x.length, y.length);
}

export function pick(arr, rand = Math.random) {
  return arr[Math.floor(rand() * arr.length)];
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function average(nums) {
  const valid = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}
