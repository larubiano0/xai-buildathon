import type { FormEvent } from "react";
import type { Mood } from "../game/logic";
import { GhostSprite } from "./art";

export function GhostDock({
  line,
  mood,
  draft,
  onDraft,
  onAsk,
  onHint,
}: {
  line: string;
  mood: Mood;
  draft: string;
  onDraft: (value: string) => void;
  onAsk: (message: string) => void;
  onHint: () => void;
}) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onAsk(draft);
  }
  return (
    <aside className="ghost-dock">
      <GhostSprite mood={mood} />
      <div className="ghost-copy">
        <p className="ghost-name">Grokgeist</p>
        <p className="speech" data-testid="ghost-line" aria-live="polite">
          {line}
        </p>
        <form className="ghost-form" onSubmit={submit}>
          <input
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            maxLength={200}
            placeholder="Whisper…"
            aria-label="Whisper to Grokgeist"
            data-testid="ghost-input"
            autoComplete="off"
          />
          <button type="submit" className="mini" data-testid="ghost-ask">
            Ask
          </button>
          <button type="button" className="mini ghost-hint" data-testid="ghost-hint" onClick={onHint}>
            Hint
          </button>
        </form>
      </div>
    </aside>
  );
}
