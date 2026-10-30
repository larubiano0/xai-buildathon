import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx, setMuted } from './sound';
import { LINES, ROOMS, askGhost, pick, quip } from './ghost';

const TOTAL = 180;
type Phase = 'title' | 'play' | 'win' | 'lose';
type Potion = 'red' | 'blue' | 'green';
const DEV = new URLSearchParams(location.search).has('dev');
const fmt = (s: number) => { const c = Math.max(0, Math.ceil(s)); return `${Math.floor(c / 60)}:${String(c % 60).padStart(2, '0')}`; };
const rank = (left: number) => left > 120 ? 'Poltergeist Speedrunner 👑' : left > 80 ? 'Certified Ghostbuster 🔦' : left > 40 ? 'Moderately Haunted Mortal 🕯️' : left > 10 ? 'Lucky Little Pumpkin 🎃' : 'Escaped By A Fingernail 💀';

function Ghost({ mood }: { mood: string }) {
  return (<svg viewBox="0 0 100 120" className={`ghost-svg ${mood}`} aria-hidden>
    <defs><radialGradient id="gg" cx="50%" cy="40%"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#c9b8ff" /></radialGradient></defs>
    <path d="M50 8C24 8 12 30 12 55v55l12-10 13 12 13-12 13 12 13-12 12 10V55C88 30 76 8 50 8z" fill="url(#gg)" opacity=".92" />
    <ellipse cx="37" cy="50" rx="7" ry={mood === 'shock' ? 11 : 9} fill="#1a0b2e" /><ellipse cx="63" cy="50" rx="7" ry={mood === 'shock' ? 11 : 9} fill="#1a0b2e" />
    <circle cx="39" cy="47" r="2" fill="#ff8c1a" /><circle cx="65" cy="47" r="2" fill="#ff8c1a" />
    {mood === 'shock' ? <ellipse cx="50" cy="76" rx="7" ry="9" fill="#1a0b2e" /> : <path d="M38 72q12 10 24 0" stroke="#1a0b2e" strokeWidth="4" fill="none" strokeLinecap="round" />}
  </svg>);
}
const Candle = ({ x, y }: { x: string; y: string }) => <div className="candle" style={{ left: x, top: y }}><div className="flame" /><div className="wax" /></div>;
const Cobweb = ({ right }: { right?: boolean }) => <svg className={`cobweb ${right ? 'r' : ''}`} viewBox="0 0 100 100" aria-hidden><g stroke="#ffffff30" fill="none">{[20, 40, 60, 80].map(r => <path key={r} d={`M${r} 0Q${r * .7} ${r * .7} 0 ${r}`} />)}<path d="M0 0L100 100M0 0L50 100M0 0L100 50" /></g></svg>;

export default function App() {
  const [phase, setPhase] = useState<Phase>('title');
  const [room, setRoom] = useState(0);
  const [left, setLeft] = useState(TOTAL);
  const deadline = useRef(0);
  const busy = useRef(false); // guards double submits / room skips
  const warned = useRef({ sixty: false, thirty: false });
  const [line, setLine] = useState(LINES.intro);
  const [mood, setMood] = useState('idle');
  const [muted, setMute] = useState(false);
  const [hints, setHints] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [thinking, setThinking] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);
  // room 1
  const [digits, setDigits] = useState([0, 0, 0, 0]);
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [lockShake, setLockShake] = useState(false);
  // room 2
  const [seq, setSeq] = useState<Potion[]>([]);
  const [smoke, setSmoke] = useState(false);
  const [labDoor, setLabDoor] = useState(false);
  // room 3
  const [flash, setFlash] = useState(false);
  const [fade, setFade] = useState(false);
  const [endTime, setEndTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const timeouts = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timeouts.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  const say = useCallback((t: string, m = 'talk') => { setLine(t); setMood(m); later(() => setMood('idle'), 1600); }, []);

  // deadline-based timer
  useEffect(() => {
    if (phase !== 'play') return;
    const id = window.setInterval(() => {
      const l = (deadline.current - performance.now()) / 1000;
      setLeft(Math.max(0, l));
      if (l <= 60 && !warned.current.sixty) { warned.current.sixty = true; say(LINES.sixty, 'talk'); sfx('ghost'); }
      if (l <= 30 && !warned.current.thirty) { warned.current.thirty = true; say(LINES.thirty, 'shock'); sfx('ghost'); }
      if (l <= 0) { setPhase('lose'); setChatOpen(false); setPanel(null); say(LINES.lose, 'shock'); sfx('lose'); }
    }, 100);
    return () => clearInterval(id);
  }, [phase, say]);

  // random quips
  useEffect(() => {
    if (phase !== 'play') return;
    const id = window.setInterval(() => { if (Math.random() < .5) say(quip()); }, 22000);
    return () => clearInterval(id);
  }, [phase, say]);

  const reset = () => {
    timeouts.current.forEach(clearTimeout); timeouts.current = [];
    busy.current = false; warned.current = { sixty: false, thirty: false };
    setRoom(0); setLeft(TOTAL); setHints(0); setChatOpen(false); setMsg(''); setPanel(null); setThinking(false);
    setDigits([0, 0, 0, 0]); setCabinetOpen(false); setLockShake(false); setSeq([]); setSmoke(false); setLabDoor(false); setFlash(false); setFade(false); setCopied(false);
  };
  const start = () => { reset(); deadline.current = performance.now() + TOTAL * 1000; setPhase('play'); sfx('open'); say(pick(LINES.enter)); };
  const toTitle = () => { reset(); setPhase('title'); setLine(LINES.intro); };

  const advance = (to: number) => {
    if (busy.current) return; busy.current = true; sfx('open'); setFade(true); setPanel(null);
    later(() => { setRoom(r => (r === to - 1 ? to : r)); setFade(false); busy.current = false; }, 600);
  };
  const winGame = () => {
    if (busy.current) return; busy.current = true;
    setEndTime(TOTAL - (deadline.current - performance.now()) / 1000);
    setLeft((deadline.current - performance.now()) / 1000);
    setPhase('win'); setChatOpen(false); say(LINES.win, 'shock'); sfx('win');
  };

  // Room 1
  const tryCode = () => {
    if (cabinetOpen || busy.current) return;
    if (digits.join('') === '1847') { setCabinetOpen(true); sfx('good'); say(pick(LINES.solved1), 'happy'); setPanel(null); }
    else { sfx('bad'); setLockShake(true); later(() => setLockShake(false), 500); say(pick(LINES.wrongCode), 'happy'); }
  };
  // Room 2
  const drink = (p: Potion) => {
    if (smoke || labDoor || busy.current) return;
    sfx('click'); const s = [...seq, p]; setSeq(s);
    if (s.length === 2) {
      if (s[0] === 'blue' && s[1] === 'red') { setLabDoor(true); sfx('good'); say(pick(LINES.solved2), 'happy'); }
      else { setSmoke(true); sfx('boom'); say(pick(LINES.wrongPotion), 'happy'); later(() => { setSmoke(false); setSeq([]); }, 1300); }
    }
  };
  // Room 3
  const chooseDoor = (d: string) => {
    if (flash || busy.current) return;
    if (d === 'silence') winGame();
    else { setFlash(true); sfx('scream'); say(pick(LINES.wrongDoor), 'shock'); later(() => setFlash(false), 700); }
  };

  const puzzleState = () => room === 0 ? (cabinetOpen ? 'cabinet open' : `lock shows ${digits.join('')}`) : room === 1 ? `selected: ${seq.join(',') || 'none'}` : 'choosing a door';
  const ask = async (text: string) => {
    if (thinking || phase !== 'play') return;
    setThinking(true); setHints(h => h + 1); sfx('ghost');
    const r = await askGhost(room, left, puzzleState(), text || 'Give me a hint', hints);
    setThinking(false); setLine(r.text); setMood('talk'); later(() => setMood('idle'), 1600); setMsg('');
  };
  const toggleMute = () => { setMute(m => { setMuted(!m); return !m; }); };
  const share = async () => {
    const t = `👻 I ESCAPED GROK MANOR in ${fmt(endTime)} with ${fmt(left)} to spare! Rank: ${rank(left)}. Hints begged: ${hints}. Can you escape? #GrokManor #Halloween`;
    try { await navigator.clipboard.writeText(t); } catch { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }
    setCopied(true);
  };

  const urgency = phase === 'play' ? (left <= 30 ? 'crit' : left <= 60 ? 'warn' : '') : '';

  return (
    <div className={`app ${urgency} ${phase}`} data-testid="app">
      <div className="fog f1" /><div className="fog f2" /><div className="vignette" />
      {flash && <div className="jumpscare" data-testid="jumpscare"><Ghost mood="shock" /></div>}

      {phase === 'title' && (
        <section className="title-screen" data-testid="title">
          <Cobweb /><Cobweb right />
          <div className="moon" />
          <svg className="manor" viewBox="0 0 400 220" aria-hidden>
            <path d="M40 220V110l40-50 40 50v110zM120 220V80l80-60 80 60v140zM280 220V110l40-50 40 50v110z" fill="#0b0612" stroke="#3b1d5c" strokeWidth="2" />
            {[[70, 140], [190, 110], [230, 110], [330, 140], [190, 160], [70, 180], [330, 180]].map(([x, y], i) => <rect key={i} x={x - 10} y={y} width="20" height="26" fill="#ff8c1a" className="win-light" style={{ animationDelay: `${i * .4}s` }} />)}
            <path d="M190 220v-34a10 10 0 0 1 20 0v34z" fill="#2a1408" />
          </svg>
          <h1 className="logo">Escape From<br /><span>Grok Manor</span></h1>
          <div className="intro-ghost"><Ghost mood="talk" /><p className="bubble big">{LINES.intro}</p></div>
          <button className="enter" onClick={start} data-testid="enter">ENTER THE MANOR</button>
          <p className="sub">3 rooms · 3 secrets · 180 seconds</p>
        </section>
      )}

      {phase !== 'title' && (
        <div className="hud">
          <div className="progress" data-testid="progress">{[0, 1, 2].map(i => <span key={i} className={i < room || phase === 'win' ? 'done' : i === room ? 'cur' : ''} />)}<b>Room {Math.min(room + 1, 3)}/3</b></div>
          <div className={`timer ${urgency}`} data-testid="timer">{fmt(left)}</div>
          <div className="hud-r"><span className="hint-count">💡 {hints}</span><button onClick={toggleMute} data-testid="mute" aria-label="mute">{muted ? '🔇' : '🔊'}</button></div>
        </div>
      )}

      {phase === 'play' && (
        <main className={`stage ${fade ? 'fading' : ''}`}>
          <h2 className="room-title" key={room}>{ROOMS[room]}</h2>
          <div className={`scene room${room}`} data-testid={`room${room + 1}`}>
            <Cobweb /><Cobweb right />
            {room === 0 && <>
              <div className="shelf"><div className="planks" />
                {[1, 2, 3].map(n => <button key={n} className={`book b${n}`} data-testid={`book${n}`} onClick={() => { sfx('click'); setPanel(`book${n}`); }}><span>{['I', 'II', 'III'][n - 1]}</span></button>)}
              </div>
              <button className="portrait" data-testid="portrait" onClick={() => { sfx('click'); setPanel('portrait'); }}>
                <svg viewBox="0 0 80 100"><rect width="80" height="100" fill="#1d0f08" /><circle cx="40" cy="38" r="16" fill="#c7a77a" /><rect x="22" y="56" width="36" height="40" fill="#301040" /><circle cx="34" cy="36" r="2.5" fill="#ff8c1a" className="eye" /><circle cx="46" cy="36" r="2.5" fill="#ff8c1a" className="eye" /><path d="M24 26q16-16 32 0" fill="#222" /></svg>
                <small>LORD GROK · 1847</small>
              </button>
              <button className={`cabinet ${cabinetOpen ? 'open' : ''}`} data-testid="cabinet" onClick={() => { sfx('click'); if (!cabinetOpen) setPanel('lock'); }}>
                <div className="cab-door l" /><div className="cab-door r" />{!cabinetOpen && <div className="padlock">🔒</div>}
              </button>
              {cabinetOpen && <button className="key-item" data-testid="key" onClick={() => advance(1)}>🗝️<small>Take the key</small></button>}
              <Candle x="8%" y="55%" /><Candle x="90%" y="55%" />
            </>}
            {room === 1 && <>
              <div className={`cauldron ${smoke ? 'boom' : ''}`}><div className="bubbles"><i /><i /><i /></div>{smoke && <div className="smoke" data-testid="smoke"><i /><i /><i /><i /></div>}</div>
              {(['red', 'blue', 'green'] as Potion[]).map((p, i) => <button key={p} className={`potion ${p} ${seq.includes(p) ? 'picked' : ''}`} style={{ left: `${18 + i * 14}%` }} data-testid={`potion-${p}`} onClick={() => drink(p)}>
                <svg viewBox="0 0 40 60"><path d="M15 2h10v16l12 22a12 12 0 0 1-10 18H13A12 12 0 0 1 3 40l12-22z" className="glass" /><path d="M8 34h24l5 8a12 12 0 0 1-10 16H13A12 12 0 0 1 3 42z" className="liquid" /></svg>
                <small>{p.toUpperCase()}{seq.indexOf(p) >= 0 ? ` #${seq.indexOf(p) + 1}` : ''}</small></button>)}
              <button className="recipe" data-testid="recipe" onClick={() => { sfx('click'); setPanel('recipe'); }}>📜<small>Ancient recipe</small></button>
              <button className={`lab-door ${labDoor ? 'unlocked' : ''}`} data-testid="lab-door" onClick={() => labDoor ? advance(2) : say('Locked. Brew something first, genius.')}>{labDoor ? '🚪' : '🔒'}<small>{labDoor ? 'Enter the crypt' : 'Locked door'}</small></button>
              <Candle x="6%" y="40%" />
            </>}
            {room === 2 && <>
              <div className="inscription" data-testid="inscription">“The shadows conceal a hunter. The flames consume all who enter. Only where the dead make no sound shall the living walk free.”</div>
              {[['shadows', 'Door of Shadows', '🌑'], ['flames', 'Door of Flames', '🔥'], ['silence', 'Door of Silence', '🤫']].map(([id, label, ico]) => (
                <button key={id} className={`door d-${id}`} data-testid={`door-${id}`} onClick={() => chooseDoor(id)}><div className="arch"><span>{ico}</span></div><small>{label}</small></button>))}
              <Candle x="4%" y="60%" /><Candle x="93%" y="60%" />
            </>}
          </div>

          {panel && (
            <div className="panel" data-testid="panel">
              <button className="close" onClick={() => setPanel(null)} aria-label="close">✕</button>
              {panel === 'book1' && <p>📕 <i>“Lord Grok trusted no lock he could not see from his own portrait.”</i></p>}
              {panel === 'book2' && <p>📗 <i>“Look upon the master’s likeness. The year he was painted is the year he died.”</i></p>}
              {panel === 'book3' && <p>📘 <i>“Four numbers guard the cabinet. Read them beneath his gaze, left to right.”</i></p>}
              {panel === 'portrait' && <p>🖼️ A gilded plaque beneath the glaring portrait: <b className="date">LORD GROK · 1847</b>. His eyes follow you. Rude.</p>}
              {panel === 'recipe' && <p>📜 <i>“First, choose the color of the midnight sky. Then choose the color of a beating heart.”</i></p>}
              {panel === 'lock' && (
                <div className={`lock ${lockShake ? 'shake' : ''}`}>
                  <p>The cabinet’s brass combination lock:</p>
                  <div className="dials">{digits.map((d, i) => (
                    <div key={i} className="dial">
                      <button data-testid={`up${i}`} onClick={() => { sfx('tick'); setDigits(a => a.map((v, j) => j === i ? (v + 1) % 10 : v)); }}>▲</button>
                      <span data-testid={`digit${i}`}>{d}</span>
                      <button data-testid={`down${i}`} onClick={() => { sfx('tick'); setDigits(a => a.map((v, j) => j === i ? (v + 9) % 10 : v)); }}>▼</button>
                    </div>))}</div>
                  <button className="enter small" data-testid="unlock" onClick={tryCode}>UNLOCK</button>
                </div>)}
            </div>
          )}
        </main>
      )}

      {phase === 'win' && (
        <section className="ending win-screen" data-testid="win">
          <div className="burst" /><div className="doors"><div className="dl" /><div className="dr" /></div>
          <div className="end-content">
            <div className="ghost-fade"><Ghost mood="shock" /></div>
            <h1>YOU ESCAPED GROK MANOR.</h1>
            <p className="stat">Time: <b data-testid="final-time">{fmt(endTime)}</b> · Left on the clock: <b>{fmt(left)}</b> · Hints: <b>{hints}</b></p>
            <p className="rank">Rank: <b data-testid="rank">{rank(left)}</b></p>
            <p className="bubble">“{LINES.win}”</p>
            <button className="enter" onClick={start} data-testid="play-again">PLAY AGAIN</button>
            <button className="enter ghosty" onClick={share} data-testid="share">{copied ? 'COPIED! 📋' : 'SHARE RESULT'}</button>
          </div>
        </section>
      )}
      {phase === 'lose' && (
        <section className="ending lose-screen" data-testid="lose">
          <div className="end-content">
            <div className="ghost-big"><Ghost mood="shock" /></div>
            <h1>THE MANOR CLAIMS ANOTHER SOUL.</h1>
            <p className="bubble">“{LINES.lose} Your room is the one with the screaming wallpaper. You’ll love it.”</p>
            <button className="enter" onClick={start} data-testid="try-again">TRY AGAIN</button>
            <button className="enter ghosty" onClick={toTitle}>TITLE SCREEN</button>
          </div>
        </section>
      )}

      {phase === 'play' && (
        <aside className="companion" data-testid="ghost">
          <p className="bubble" data-testid="ghost-line">{thinking ? '…the spirits are typing…' : line}</p>
          <button className={`ghost-btn ${mood}`} onClick={() => setChatOpen(o => !o)} aria-label="Talk to Grokgeist"><Ghost mood={mood} /></button>
          <div className="ghost-name">GROKGEIST</div>
          {chatOpen && (
            <form className="chat" onSubmit={e => { e.preventDefault(); ask(msg); }}>
              <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Ask the ghost…" data-testid="ghost-input" maxLength={200} />
              <button type="submit" disabled={thinking} data-testid="ghost-ask">{msg ? 'Ask' : 'Hint'}</button>
            </form>)}
          {!chatOpen && <button className="hint-btn" onClick={() => ask('')} disabled={thinking} data-testid="hint">👻 Hint</button>}
        </aside>
      )}

      {DEV && (
        <div className="dev" data-testid="dev">
          <b>DEV</b>
          <button data-testid="dev-5s" onClick={() => { deadline.current = performance.now() + 5000; }}>⏱ 5s</button>
          {[0, 1, 2].map(r => <button key={r} data-testid={`dev-room${r + 1}`} onClick={() => { if (phase !== 'play') start(); setRoom(r); setPanel(null); }}>R{r + 1}</button>)}
          <button data-testid="dev-win" onClick={() => { if (phase !== 'play') { deadline.current = performance.now() + TOTAL * 1000; } winGame(); }}>🏆 win</button>
        </div>
      )}
    </div>
  );
}
