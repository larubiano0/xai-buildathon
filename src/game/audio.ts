export type ManorAudio = {
  unlock: () => void;
  setMuted: (muted: boolean) => void;
  click: () => void;
  error: () => void;
  success: () => void;
  scare: () => void;
  win: () => void;
  lose: () => void;
  tick: () => void;
};

export function createAudio(): ManorAudio {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let muted = false;
  let droneOn = false;

  function ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      if (!ctx) {
        ctx = new AudioCtx();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.8;
        master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") void ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  }

  function startDrone() {
    const context = ensure();
    if (!context || !master || droneOn) return;
    droneOn = true;
    const frequencies = [55, 82, 110];
    for (const frequency of frequencies) {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = frequency === 110 ? "triangle" : "sine";
      osc.frequency.value = frequency;
      gain.gain.value = frequency === 55 ? 0.045 : 0.018;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
    }
    const length = context.sampleRate * 2;
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    const noiseGain = context.createGain();
    noiseGain.gain.value = 0.02;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
  }

  function tone(frequency: number, duration: number, type: OscillatorType, volume: number, slide = 0) {
    const context = ensure();
    if (!context || !master) return;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, context.currentTime);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), context.currentTime + duration);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    osc.stop(context.currentTime + duration + 0.02);
  }

  return {
    unlock() {
      startDrone();
    },
    setMuted(next) {
      muted = next;
      if (master) master.gain.value = next ? 0 : 0.8;
    },
    click() {
      tone(640, 0.07, "square", 0.03);
    },
    error() {
      tone(196, 0.18, "sawtooth", 0.05, -80);
      tone(92, 0.32, "triangle", 0.06);
    },
    success() {
      tone(523, 0.12, "triangle", 0.05);
      window.setTimeout(() => tone(659, 0.14, "triangle", 0.05), 90);
      window.setTimeout(() => tone(784, 0.22, "triangle", 0.05), 180);
    },
    scare() {
      tone(780, 0.08, "sawtooth", 0.08);
      tone(140, 0.45, "sawtooth", 0.09, -90);
    },
    win() {
      [523, 659, 784, 1046].forEach((frequency, index) => {
        window.setTimeout(() => tone(frequency, 0.28, "triangle", 0.06), index * 120);
      });
    },
    lose() {
      tone(220, 0.4, "sawtooth", 0.06, -80);
      tone(110, 0.8, "triangle", 0.07, -40);
    },
    tick() {
      tone(880, 0.04, "square", 0.025);
    },
  };
}
