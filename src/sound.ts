let AC: AudioContext | null = null;
export let muted = false;
export const setMuted = (m: boolean) => { muted = m; };
type P = [number, number, number, OscillatorType];
const S: Record<string, P> = { click: [440, 220, .08, 'square'], good: [500, 1200, .35, 'triangle'], bad: [160, 70, .45, 'sawtooth'], open: [180, 640, .6, 'triangle'], ghost: [300, 520, .9, 'sine'], boom: [120, 40, .7, 'sawtooth'], scream: [900, 200, .6, 'sawtooth'], win: [400, 1600, 1.4, 'triangle'], lose: [220, 50, 1.6, 'sawtooth'], tick: [1000, 900, .04, 'square'] };
export function sfx(name: keyof typeof S | string) {
  if (muted) return;
  try {
    AC = AC || new (window.AudioContext || (window as any).webkitAudioContext)();
    const p = S[name] || S.click, o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = p[3]; o.frequency.setValueAtTime(p[0], t); o.frequency.exponentialRampToValueAtTime(p[1], t + p[2]);
    g.gain.setValueAtTime(.14, t); g.gain.exponentialRampToValueAtTime(.001, t + p[2]);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + p[2] + .05);
  } catch { /* audio unavailable */ }
}
// ---- ambience: generative drone + heartbeat + thunder ----
let amb: { stop: () => void } | null = null;
let hbTimer: number | null = null;
function ctx() { AC = AC || new (window.AudioContext || (window as any).webkitAudioContext)(); return AC; }
export function startAmbience() {
  if (amb || muted) return;
  try {
    const a = ctx(), out = a.createGain(); out.gain.value = .05; out.connect(a.destination);
    const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = .08; lg.gain.value = .03; lfo.connect(lg); lg.connect(out.gain); lfo.start();
    const oscs = [55, 82.4, 110.7, 164.8].map((f, i) => { const o = a.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 14; o.connect(out); o.start(); return o; });
    amb = { stop: () => { [...oscs, lfo].forEach(o => { try { o.stop(); } catch {} }); out.disconnect(); } };
  } catch {}
}
export function stopAmbience() { amb?.stop(); amb = null; heartbeat(0); }
function thump(a: AudioContext, t: number, v: number) { const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(35, t + .15); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + .25); }
/** bpm 0 = off */
export function heartbeat(bpm: number) {
  if (hbTimer) { clearInterval(hbTimer); hbTimer = null; }
  if (!bpm) return;
  hbTimer = window.setInterval(() => { if (muted) return; try { const a = ctx(), t = a.currentTime; thump(a, t, .35); thump(a, t + .18, .22); } catch {} }, 60000 / bpm);
}
export function thunder() {
  if (muted) return;
  try {
    const a = ctx(), len = a.sampleRate * 2.5, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); f.type = 'lowpass'; f.frequency.value = 400; g.gain.value = .5;
    s.buffer = buf; s.connect(f); f.connect(g); g.connect(a.destination); s.start();
  } catch {}
}
