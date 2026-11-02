import { BOOKS, PORTRAIT } from "../game/content";
import type { Digits, Inspect } from "../game/logic";
import { Candles, Cobweb, Embers, Face } from "./art";

export function LibraryRoom({
  digits,
  shake,
  failNonce,
  inspected,
  inspect,
  onInspect,
  onClose,
  onSpin,
  onSubmit,
  onClear,
}: {
  digits: Digits;
  shake: boolean;
  failNonce: number;
  inspected: Record<Inspect, boolean>;
  inspect: Inspect | null;
  onInspect: (target: Inspect) => void;
  onClose: () => void;
  onSpin: (index: number, delta: number) => void;
  onSubmit: () => void;
  onClear: () => void;
}) {
  const ready = digits.every((digit) => digit !== null);
  const reading = inspect ? (inspect === "portrait" ? null : BOOKS[inspect]) : null;
  return (
    <div className="room library">
      <div className="backdrop library-bg" aria-hidden>
        <div className="window-moon" />
        <Cobweb className="cobweb left" />
        <Cobweb className="cobweb right" />
        <Embers />
        <div className="floor" />
        <div className="fog" />
      </div>
      <div className="diorama library-grid">
        <section className="shelf" aria-label="Bookshelves">
          <div className="shelf-wood">
            <button type="button" className={`book rust ${inspected.book1 ? "read" : "hot"}`} data-testid="book-1" onClick={() => onInspect("book1")}>
              <span>{BOOKS.book1.spine}</span>
            </button>
            <span className="filler f1" />
            <button type="button" className={`book moss ${inspected.book2 ? "read" : "hot"}`} data-testid="book-2" onClick={() => onInspect("book2")}>
              <span>{BOOKS.book2.spine}</span>
            </button>
            <span className="filler f2" />
            <button type="button" className={`book wine ${inspected.book3 ? "read" : "hot"}`} data-testid="book-3" onClick={() => onInspect("book3")}>
              <span>{BOOKS.book3.spine}</span>
            </button>
            <span className="filler f3" />
          </div>
          <p className="prop-caption">Pull a glowing spine</p>
        </section>
        <button
          type="button"
          className={`portrait-card ${inspected.portrait ? "read" : "hot"}`}
          data-testid="portrait"
          onClick={() => onInspect("portrait")}
        >
          <div className="frame">
            <div className="painting">
              <Face />
            </div>
            <div className="plaque">
              <span>{PORTRAIT.name}</span>
              <strong data-testid="plaque-year">{inspected.portrait ? PORTRAIT.year : "• • • •"}</strong>
            </div>
          </div>
          <p className="prop-caption">The portrait watches</p>
        </button>
        <section className={`cabinet ${shake ? "shake" : ""}`} key={failNonce} aria-label="Combination cabinet">
          <div className="cabinet-body">
            <p className="cabinet-title">Iron cabinet</p>
            <div className="lock" aria-invalid={shake}>
              {digits.map((digit, index) => (
                <div className="wheel" key={index}>
                  <button type="button" aria-label={`Increase digit ${index + 1}`} data-testid={`spin-up-${index}`} onClick={() => onSpin(index, 1)}>
                    ▴
                  </button>
                  <div className="num" data-testid={`digit-${index}`}>
                    {digit ?? "–"}
                  </div>
                  <button type="button" aria-label={`Decrease digit ${index + 1}`} data-testid={`spin-down-${index}`} onClick={() => onSpin(index, -1)}>
                    ▾
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="lever" data-testid="submit-code" disabled={!ready} onClick={onSubmit}>
              Open the cabinet
            </button>
            <button type="button" className="text-btn" onClick={onClear}>
              Clear wheels
            </button>
          </div>
          <Candles />
        </section>
      </div>
      {inspect && (
        <div className="parchment" data-testid="inspect-modal" onClick={onClose} role="presentation">
          <article
            className="parchment-card"
            role="dialog"
            aria-modal="true"
            aria-label={reading ? reading.title : "Portrait plaque"}
            onClick={(event) => event.stopPropagation()}
          >
            {reading ? (
              <>
                <p className="kicker">From the shelf</p>
                <h3>{reading.title}</h3>
                <p>{reading.body}</p>
              </>
            ) : (
              <>
                <p className="kicker">Brass plaque</p>
                <h3>{PORTRAIT.name}</h3>
                <p>{PORTRAIT.epitaph}</p>
                <p className="year" data-testid="portrait-year">
                  {PORTRAIT.year}
                </p>
              </>
            )}
            <button type="button" className="lever dark" data-testid="close-inspect" onClick={onClose}>
              Close
            </button>
          </article>
        </div>
      )}
    </div>
  );
}
