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
