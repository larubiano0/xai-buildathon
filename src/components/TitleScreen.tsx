import { WELCOME } from "../game/content";
import { Cobweb, GhostSprite, Manor } from "./art";

export function TitleScreen({ muted, onEnter, onMute }: { muted: boolean; onEnter: () => void; onMute: () => void }) {
  return (
    <section className="title-screen">
      <div className="sky" aria-hidden>
        <div className="moon-glow" />
        <div className="moon" />
        <div className="lightning" />
        <span className="bat bat-1" />
        <span className="bat bat-2" />
        <span className="bat bat-3" />
        <Cobweb className="cobweb left" />
        <Cobweb className="cobweb right" />
      </div>
      <header className="title-top">
        <span>A Halloween escape · three minutes</span>
        <button type="button" className="icon-btn" onClick={onMute} aria-pressed={muted} data-testid="mute">
          {muted ? "Sound off" : "Sound on"}
        </button>
      </header>
      <div className="title-copy">
        <p className="eyebrow">The doors locked themselves</p>
        <h1 className="display">
          <span>Escape From</span>
          <span className="sub">Grok Manor</span>
        </h1>
        <div className="welcome-card">
          <GhostSprite mood="smug" />
          <blockquote>{WELCOME}</blockquote>
        </div>
        <button type="button" className="enter-btn" data-testid="enter-manor" onClick={onEnter}>
          Enter the Manor
        </button>
        <p className="fine-print">Three rooms. Three secrets. One way out.</p>
      </div>
      <div className="manor-wrap">
        <div className="fogbank" />
        <Manor />
      </div>
    </section>
  );
}
