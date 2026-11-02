import { DEFEAT_JIBE, TRANSITIONS } from "../game/content";
import { formatClock, formatElapsed, rankFor, type GameState, type RoomId } from "../game/logic";
import { GhostSprite } from "./art";

export function TransitionCard({
  room,
  line,
  onSkip,
}: {
  room: RoomId;
  line: string;
  onSkip: () => void;
}) {
  const copy = TRANSITIONS[room];
  return (
    <button type="button" className="transition-card" data-testid="transition" onClick={onSkip}>
      <p className="kicker">{copy.kicker}</p>
      <h2>{copy.title}</h2>
      <p className="detail">{copy.detail}</p>
      <p className="ghost-aside">“{line}”</p>
      <span className="skip-hint">Click to step inside</span>
    </button>
  );
}

export function VictoryScreen({
  state,
  copied,
  onAgain,
  onShare,
}: {
  state: GameState;
  copied: boolean;
  onAgain: () => void;
  onShare: () => void;
}) {
  const rank = rankFor(state.remainingMs);
  return (
    <section className="ending victory" data-testid="victory">
      <div className="door-leaf left" />
      <div className="door-leaf right" />
      <div className="light-flood" />
      <div className="ending-copy">
        <p className="kicker">The night lets go</p>
        <h2>YOU ESCAPED GROK MANOR.</h2>
        <p className="stat">
          Completion time <strong data-testid="completion-time">{formatElapsed(state.elapsedMs ?? 0)}</strong>
        </p>
        <p className="stat">
          Time remaining <strong>{formatClock(state.remainingMs)}</strong>
        </p>
        <p className="rank" data-testid="rank">
          {rank.title}
        </p>
        <p className="blurb">{rank.blurb}</p>
        <div className="ending-ghost">
          <GhostSprite mood="shock" />
          <p data-testid="victory-ghost">{state.ghostLine}</p>
        </div>
        <div className="ending-actions">
          <button type="button" className="enter-btn" data-testid="play-again" onClick={onAgain}>
            Play again
          </button>
          <button type="button" className="icon-btn" data-testid="share-result" onClick={onShare}>
            {copied ? "Copied" : "Share result"}
          </button>
        </div>
      </div>
    </section>
  );
}

export function DefeatScreen({ state, onAgain }: { state: GameState; onAgain: () => void }) {
  return (
    <section className="ending defeat" data-testid="defeat">
      <div className="flicker" />
      <div className="ending-copy">
        <GhostSprite mood="angry" />
        <h2>THE MANOR CLAIMS ANOTHER SOUL.</h2>
        <p className="blurb">{DEFEAT_JIBE}</p>
        <p className="stat">
          You lasted <strong data-testid="lasted">{formatElapsed(state.elapsedMs ?? 0)}</strong>
        </p>
        <p className="ghost-aside">“{state.ghostLine}”</p>
        <button type="button" className="enter-btn" data-testid="try-again" onClick={onAgain}>
          Try again
        </button>
      </div>
    </section>
  );
}

export function Jumpscare() {
  return (
    <div className="jumpscare" role="alert" aria-label="The door lunges" data-testid="jumpscare">
      <div className="scare-face">
        <GhostSprite mood="angry" />
      </div>
    </div>
  );
}

export function DevTools({
  onWin,
  onLose,
  onRoom,
}: {
  onWin: () => void;
  onLose: () => void;
  onRoom: (room: RoomId) => void;
}) {
  return (
    <div className="devtools" data-testid="devtools">
      <p>Stage tools</p>
      <button type="button" onClick={onWin}>
        Victory
      </button>
      <button type="button" onClick={onLose}>
        Timeout
      </button>
      <button type="button" onClick={() => onRoom(1)}>
        Room 1
      </button>
      <button type="button" onClick={() => onRoom(2)}>
        Room 2
      </button>
      <button type="button" onClick={() => onRoom(3)}>
        Room 3
      </button>
    </div>
  );
}
