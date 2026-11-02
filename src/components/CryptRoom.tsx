import { INSCRIPTION } from "../game/content";
import type { Door } from "../game/logic";
import { Cobweb, Embers } from "./art";

const DOORS: { id: Door; name: string; whisper: string }[] = [
  { id: "shadows", name: "Door of Shadows", whisper: "Something moves inside the dark." },
  { id: "flames", name: "Door of Flames", whisper: "Heat presses against the wood." },
  { id: "silence", name: "Door of Silence", whisper: "No echo. No breath. No welcome." },
];

export function CryptRoom({ door, onSelect }: { door: Door | null; onSelect: (door: Door) => void }) {
  return (
    <div className="room crypt">
      <div className="backdrop crypt-bg" aria-hidden>
        <Cobweb className="cobweb left" />
        <Cobweb className="cobweb right" />
        <Embers />
        <div className="fog" />
      </div>
      <blockquote className="inscription" data-testid="inscription">
        {INSCRIPTION}
      </blockquote>
      <div className="doors">
        {DOORS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`door ${entry.id} ${door === entry.id ? "selected" : ""}`}
            data-testid={`door-${entry.id}`}
            aria-pressed={door === entry.id}
            onClick={() => onSelect(entry.id)}
          >
            <span className="arch" />
            <span className="door-name">{entry.name}</span>
            <span className="whisper">{entry.whisper}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
