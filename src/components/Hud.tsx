import { ROOM_TITLES } from "../game/content";
import { formatClock, GAME_MS, type RoomId } from "../game/logic";

export function Hud({
  room,
  remainingMs,
  muted,
  urgent,
  critical,
  onMute,
}: {
  room: RoomId;
  remainingMs: number;
  muted: boolean;
  urgent: boolean;
  critical: boolean;
  onMute: () => void;
}) {
  const scale = Math.max(0, Math.min(1, remainingMs / GAME_MS));
  return (
    <header className="hud">
      <div className="brand">
        <span className="brand-kicker">Grok Manor</span>
        <strong>{ROOM_TITLES[room]}</strong>
      </div>
      <div className="progress" data-testid="room-progress" aria-label={`Room ${room} of 3`}>
        <span>
          {room} / 3
        </span>
        <div className="pips" aria-hidden>
          {[1, 2, 3].map((n) => (
            <i key={n} className={n <= room ? "on" : ""} />
          ))}
        </div>
      </div>
      <div className={`timer ${critical ? "critical" : ""} ${urgent ? "urgent" : ""}`} data-testid="timer">
        <span className="timer-label">Soul clock</span>
        <span className="timer-value">{formatClock(remainingMs)}</span>
        <span className="timebar" aria-hidden>
          <i style={{ transform: `scaleX(${scale})` }} />
        </span>
      </div>
      <button type="button" className="icon-btn" onClick={onMute} aria-pressed={muted} data-testid="mute-game">
        {muted ? "Sound off" : "Sound on"}
      </button>
    </header>
  );
}
