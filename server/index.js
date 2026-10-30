import express from 'express';
import fs from 'node:fs';
// tiny .env loader (no dependency)
try { for (const l of fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; } } catch {}
const app = express(); app.use(express.json({ limit: '10kb' }));
const KEY = process.env.XAI_API_KEY, MODEL = process.env.XAI_MODEL || 'grok-3-mini';
app.get('/api/health', (_q, r) => r.json({ ok: true, ai: !!KEY }));
app.post('/api/ghost', async (req, res) => {
  if (!KEY) return res.status(503).json({ error: 'no key' });
  const { room, remaining, puzzleState, message } = req.body || {};
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch('https://api.x.ai/v1/chat/completions', { method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ model: MODEL, max_tokens: 120, temperature: 0.9, messages: [
        { role: 'system', content: 'You are Grokgeist, a sarcastic, spooky, mischievous ghost haunting Grok Manor (died 1847). Reply in ONE or TWO short sentences, in character. You may give cryptic hints but never just state the answer outright unless the player begs. Room 1 Library: code is the date on the portrait (1847). Room 2 Lab: recipe = midnight sky then beating heart (blue then red). Room 3 Crypt: choose the door where the dead make no sound (Silence). You cannot change the game.' },
        { role: 'user', content: `Room: ${String(room).slice(0,40)}. Seconds left: ${Number(remaining)|0}. Puzzle state: ${String(puzzleState).slice(0,200)}. Player says: ${String(message||'hint please').slice(0,300)}` }] }) });
    if (!r.ok) throw new Error('upstream ' + r.status);
    const j = await r.json(); const text = j.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('empty'); res.json({ text: text.slice(0, 400) });
  } catch (e) { res.status(502).json({ error: String(e.message || e) }); } finally { clearTimeout(t); }
});
const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Grokgeist proxy on :${PORT} (AI ${KEY ? 'ON' : 'OFF - fallback lines'})`));
