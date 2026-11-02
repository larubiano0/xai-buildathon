import type { Door, GameState, Potion } from "../game/logic";

function doorName(door: Door): string {
  if (door === "shadows") return "Door of Shadows";
  if (door === "flames") return "Door of Flames";
  return "Door of Silence";
}

export function PuzzlePanel({
  state,
  onEnterDoor,
}: {
  state: GameState;
  onEnterDoor: () => void;
}) {
  if (state.room === 1) {
    return (
      <section className="puzzle-panel" aria-label="Library clues">
        <p className="panel-title">What the room has given you</p>
        <ul className="clues">
          <li className={state.inspected.book1 ? "done" : ""}>History of Ashwood</li>
          <li className={state.inspected.book2 ? "done" : ""}>Faces in Oil</li>
          <li className={state.inspected.book3 ? "done" : ""}>Inventory of Keys</li>
          <li className={state.inspected.portrait ? "done" : ""}>
            Portrait plaque
            {state.inspected.portrait && <b data-testid="found-code">1847</b>}
          </li>
        </ul>
        <p className="panel-note">Type the four digits, then press Enter. Wrong years only annoy the furniture.</p>
      </section>
    );
  }
  if (state.room === 2) {
    const mix = state.potions.length
      ? state.potions.map(label).join(" → ")
      : "The cauldron is empty.";
    return (
      <section className="puzzle-panel" aria-label="Brew">
        <p className="panel-title">The pour</p>
        <p className="mix" data-testid="mix">
          {mix}
        </p>
        <p className="panel-note">Midnight sky first. A beating heart second. Two pours, then brew.</p>
      </section>
    );
  }
  return (
    <section className="puzzle-panel" aria-label="Final door">
      <p className="panel-title">{state.door ? doorName(state.door) : "No door chosen"}</p>
      <p className="panel-note">Read the stone. The wrong door bites, then puts you back. The clock does not care.</p>
      <button type="button" className="lever wide" data-testid="enter-door" disabled={!state.door} onClick={onEnterDoor}>
        {state.door ? `Step through` : "Choose a door"}
      </button>
    </section>
  );
}

function label(potion: Potion): string {
  if (potion === "blue") return "Blue";
  if (potion === "red") return "Red";
  return "Green";
}
