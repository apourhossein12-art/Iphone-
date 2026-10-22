/**
 * ALI Intelligence — free-provider router with automatic failover.
 *
 * Providers (all optional except Pollinations, which needs no key):
 *   pollinations  – keyless, OpenAI-compatible          (POLLINATIONS_TOKEN optional)
 *   huggingface   – HF Inference Providers router       (HF_TOKEN)
 *   openrouter    – ":free" models                      (OPENROUTER_API_KEY)
 *   groq          – very fast free tier                 (GROQ_API_KEY)
 *   gemini        – Google GenAI                        (GEMINI_API_KEY)
 *
 * Speed strategy:
 *   1. Providers are ranked by recent latency (EWMA); the last good one goes first.
 *   2. Hedged requests: if the leader hasn't answered after HEDGE_MS, the next
 *      provider is started in parallel; the first valid answer wins, the rest are aborted.
 *   3. Failing providers get an exponential cool-down so they are not retried every message.
 *   4. Short history + capped max_tokens + small LRU cache for repeated prompts.
 */
import { GoogleGenAI } from '@google/genai';

export interface ChatTurn { role: 'user' | 'assistant'; text: string }
export interface RouterResult { text: string; provider: string; model: string; ms: number }

interface Provider {
  id: string;
  model: string;
  enabled: () => boolean;
  call: (system: string, turns: ChatTurn[], signal: AbortSignal) => Promise<string>;
}

const env = (k: string, d = '') => (process.env[k] ?? d).trim();
const num = (k: string, d: number) => {
  const n = Number(process.env[k]);
  return Number.isFinite(n) && n > 0 ? n : d;
};

const HEDGE_MS = num('AI_HEDGE_MS', 2500);      // start next provider if leader is slower than this
const TIMEOUT_MS = num('AI_TIMEOUT_MS', 12000); // hard per-provider limit
const MAX_TOKENS = num('AI_MAX_TOKENS', 600);
const HISTORY_TURNS = num('AI_HISTORY_TURNS', 6);

/* ---------- OpenAI-compatible helper ---------- */
async function openAIChat(
  url: string,
  headers: Record<string, string>,
  model: string,
  system: string,
  turns: ChatTurn[],
  signal: AbortSignal,
): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      stream: false,
      messages: [
        { role: 'system', content: system },
        ...turns.map((t) => ({ role: t.role, content: t.text })),
      ],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text().catch(() => '')).slice(0, 120)}`);
  const data: any = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('empty response');
  return text.trim();
}

/* ---------- Provider table ---------- */
const providers: Provider[] = [
  {
    id: 'pollinations',
    model: env('POLLINATIONS_MODEL', 'openai-fast'),
    enabled: () => true, // no key required
    call: (s, t, sig) =>
      openAIChat(
        'https://text.pollinations.ai/openai',
        env('POLLINATIONS_TOKEN') ? { Authorization: `Bearer ${env('POLLINATIONS_TOKEN')}` } : {},
        env('POLLINATIONS_MODEL', 'openai-fast'),
        s, t, sig,
      ),
  },
  {
    id: 'huggingface',
    model: env('HF_MODEL', 'meta-llama/Llama-3.3-70B-Instruct'),
    enabled: () => !!(env('HF_TOKEN') || env('HUGGINGFACE_API_KEY')),
    call: (s, t, sig) =>
      openAIChat(
        'https://router.huggingface.co/v1/chat/completions',
        { Authorization: `Bearer ${env('HF_TOKEN') || env('HUGGINGFACE_API_KEY')}` },
        env('HF_MODEL', 'meta-llama/Llama-3.3-70B-Instruct'),
        s, t, sig,
      ),
  },
  {
    id: 'groq',
    model: env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
    enabled: () => !!env('GROQ_API_KEY'),
    call: (s, t, sig) =>
      openAIChat(
        'https://api.groq.com/openai/v1/chat/completions',
        { Authorization: `Bearer ${env('GROQ_API_KEY')}` },
        env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        s, t, sig,
      ),
  },
  {
    id: 'openrouter',
    model: env('OPENROUTER_MODEL', 'meta-llama/llama-3.3-70b-instruct:free'),
    enabled: () => !!env('OPENROUTER_API_KEY'),
    call: (s, t, sig) =>
      openAIChat(
        'https://openrouter.ai/api/v1/chat/completions',
        { Authorization: `Bearer ${env('OPENROUTER_API_KEY')}` },
        env('OPENROUTER_MODEL', 'meta-llama/llama-3.3-70b-instruct:free'),
        s, t, sig,
      ),
  },
  {
    id: 'gemini',
    model: env('GEMINI_MODEL', 'gemini-3.8-flash'),
    enabled: () => !!env('GEMINI_API_KEY') && env('GEMINI_API_KEY') !== 'MY_GEMINI_API_KEY',
    call: async (system, turns, signal) => {
      const ai = new GoogleGenAI({ apiKey: env('GEMINI_API_KEY') });
      const r = await ai.models.generateContent({
        model: env('GEMINI_MODEL', 'gemini-3.8-flash'),
        contents: turns.map((t) => ({ role: t.role === 'assistant' ? 'model' : 'user', parts: [{ text: t.text }] })),
        config: { systemInstruction: system, temperature: 0.7, maxOutputTokens: MAX_TOKENS, abortSignal: signal },
      });
      if (!r.text?.trim()) throw new Error('empty response');
      return r.text.trim();
    },
  },
];

/* ---------- Health tracking ---------- */
interface Health { ewma: number; fails: number; coolUntil: number; lastError?: string; ok: number }
const health = new Map<string, Health>(providers.map((p) => [p.id, { ewma: 0, fails: 0, coolUntil: 0, ok: 0 }]));

const order = env('AI_PROVIDER_ORDER', 'pollinations,huggingface,groq,openrouter,gemini')
  .split(',').map((s) => s.trim()).filter(Boolean);

function ranked(): Provider[] {
  const now = Date.now();
  const active = providers
    .filter((p) => p.enabled())
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const ready = active.filter((p) => (health.get(p.id)!.coolUntil <= now));
  // Providers with measured latency go first (fastest wins); unmeasured keep configured order.
  ready.sort((a, b) => {
    const ha = health.get(a.id)!, hb = health.get(b.id)!;
    if (ha.ewma && hb.ewma) return ha.ewma - hb.ewma;
    if (ha.ewma) return -1;
    if (hb.ewma) return 1;
    return 0;
  });
  // If everything is cooling down, still try them (soonest-to-recover first) rather than fail instantly.
  const cooling = active
    .filter((p) => health.get(p.id)!.coolUntil > now)
    .sort((a, b) => health.get(a.id)!.coolUntil - health.get(b.id)!.coolUntil);
  return [...ready, ...cooling];
}

function markOk(id: string, ms: number) {
  const h = health.get(id)!;
  h.ewma = h.ewma ? h.ewma * 0.6 + ms * 0.4 : ms;
  h.fails = 0; h.coolUntil = 0; h.ok++; h.lastError = undefined;
}
function markFail(id: string, err: unknown) {
  const h = health.get(id)!;
  h.fails++;
  h.lastError = String((err as any)?.message ?? err).slice(0, 160);
  h.coolUntil = Date.now() + Math.min(5 * 60_000, 15_000 * 2 ** (h.fails - 1)); // 15s,30s,60s… max 5min
}

/* ---------- Tiny LRU cache ---------- */
const cache = new Map<string, { at: number; value: RouterResult }>();
const CACHE_TTL = num('AI_CACHE_TTL_MS', 60_000);
function cacheGet(k: string) {
  const e = cache.get(k);
  if (!e) return null;
  if (Date.now() - e.at > CACHE_TTL) { cache.delete(k); return null; }
  return e.value;
}
function cacheSet(k: string, value: RouterResult) {
  cache.set(k, { at: Date.now(), value });
  if (cache.size > 100) cache.delete(cache.keys().next().value as string);
}

/* ---------- Public API ---------- */
export async function routeChat(system: string, history: ChatTurn[], prompt: string): Promise<RouterResult> {
  const turns: ChatTurn[] = [...history.slice(-HISTORY_TURNS), { role: 'user', text: prompt }]
    // collapse accidental duplicate of the last user message (clients send it in history too)
    .filter((t, i, a) => !(i < a.length - 1 && t.role === 'user' && t.text === prompt && a[i + 1].text === prompt));
  while (turns.length > 1 && turns[0].role === 'assistant') turns.shift(); // providers expect a user turn first

  const cacheKey = turns.length === 1 ? prompt.trim().toLowerCase() : '';
  if (cacheKey) { const hit = cacheGet(cacheKey); if (hit) return { ...hit, ms: 0 }; }

  const queue = ranked();
  if (!queue.length) throw new Error('No AI provider is configured');

  const controllers: AbortController[] = [];
  const errors: string[] = [];

  return new Promise<RouterResult>((resolve, reject) => {
    let settled = false;
    let launched = 0;
    let finished = 0;
    let hedgeTimer: NodeJS.Timeout | undefined;

    const launchNext = () => {
      if (settled || launched >= queue.length) return;
      const p = queue[launched++];
      const ctrl = new AbortController();
      controllers.push(ctrl);
      const timer = setTimeout(() => ctrl.abort(new Error('timeout')), TIMEOUT_MS);
      const started = Date.now();

      p.call(system, turns, ctrl.signal)
        .then((text) => {
          clearTimeout(timer);
          const ms = Date.now() - started;
          markOk(p.id, ms);
          if (settled) return;
          settled = true;
          clearTimeout(hedgeTimer);
          controllers.forEach((c) => c !== ctrl && c.abort());
          const result = { text, provider: p.id, model: p.model, ms };
          if (cacheKey) cacheSet(cacheKey, result);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          if (!settled) markFail(p.id, err);
          errors.push(`${p.id}: ${String(err?.message ?? err).slice(0, 80)}`);
          finished++;
          if (settled) return;
          if (launched < queue.length) { clearTimeout(hedgeTimer); launchNext(); armHedge(); }
          else if (finished >= launched) { settled = true; reject(new Error(`All providers failed — ${errors.join(' | ')}`)); }
        });
    };

    const armHedge = () => {
      clearTimeout(hedgeTimer);
      if (launched < queue.length) hedgeTimer = setTimeout(() => { launchNext(); armHedge(); }, HEDGE_MS);
    };

    launchNext();
    armHedge();
  });
}

export function providerStatus() {
  const now = Date.now();
  return providers.map((p) => {
    const h = health.get(p.id)!;
    return {
      id: p.id,
      model: p.model,
      configured: p.enabled(),
      avgMs: Math.round(h.ewma),
      successes: h.ok,
      coolingDownSec: h.coolUntil > now ? Math.ceil((h.coolUntil - now) / 1000) : 0,
      lastError: h.lastError ?? null,
    };
  });
}
