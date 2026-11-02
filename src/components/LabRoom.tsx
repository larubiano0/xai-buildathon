import { RECIPE } from "../game/content";
import type { Potion } from "../game/logic";
import { Bottle, Cobweb, Embers } from "./art";

const POTIONS: { id: Potion; label: string; color: string }[] = [
  { id: "red", label: "Red", color: "#ff3158" },
  { id: "blue", label: "Blue", color: "#3aa0ff" },
  { id: "green", label: "Green", color: "#3dce7a" },
];

function marks(color: Potion, potions: Potion[]): number[] {
  return potions.flatMap((potion, index) => (potion === color ? [index + 1] : []));
}

export function LabRoom({
  potions,
  burst,
  burstNonce,
  onAdd,
  onBrew,
  onReset,
}: {
  potions: Potion[];
  burst: boolean;
  burstNonce: number;
  onAdd: (potion: Potion) => void;
  onBrew: () => void;
  onReset: () => void;
}) {
  return (
    <div className="room lab">
      <div className="backdrop lab-bg" aria-hidden>
        <Cobweb className="cobweb left" />
        <Cobweb className="cobweb right" />
        <Embers />
        <div className="floor" />
        <div className="fog" />
      </div>
      <div className="diorama lab-grid">
        <article className="scroll" data-testid="recipe">
          <p className="kicker">Ancient recipe</p>
          <h3>{RECIPE.title}</h3>
          <p>{RECIPE.line}</p>
          <p className="note">{RECIPE.note}</p>
        </article>
        <section className={`cauldron-wrap ${burst ? "burst" : ""}`} key={burstNonce} aria-label="Cauldron">
          <div className="cauldron">
            <div className="brew">
              <span className={potions[0] ? potions[0] : ""}>{potions[0] ? potions[0] : "1"}</span>
              <span className={potions[1] ? potions[1] : ""}>{potions[1] ? potions[1] : "2"}</span>
            </div>
            <div className="pot" />
            <div className="smoke" />
            <i className="bubble b1" />
            <i className="bubble b2" />
            <i className="bubble b3" />
          </div>
          <button type="button" className="lever" data-testid="brew" disabled={potions.length !== 2} onClick={onBrew}>
            Brew
          </button>
          <button type="button" className="text-btn" data-testid="reset-potions" onClick={onReset}>
            Dump the cauldron
          </button>
        </section>
        <div className="rack" aria-label="Potions">
          {POTIONS.map((potion) => {
            const badges = marks(potion.id, potions);
            return (
              <button
                key={potion.id}
                type="button"
                className={`potion ${potion.id}`}
                data-testid={`potion-${potion.id}`}
                onClick={() => onAdd(potion.id)}
              >
                <Bottle color={potion.color} label={`${potion.label} potion`} />
                <span>{potion.label}</span>
                {badges.length > 0 && <em className="badge">{badges.join(" · ")}</em>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
