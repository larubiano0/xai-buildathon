import { useEffect, useReducer, useRef, useState } from "react";
import { askGhost } from "./game/api";
import { createAudio, type ManorAudio } from "./game/audio";
import { askFallback, hintFor, quipFor } from "./game/ghost";
import {
  initialState,
  reducer,
  shareText,
  type Door,
  type Inspect,
  type Mood,
  type Potion,
  type RoomId,
} from "./game/logic";
import { CryptRoom } from "./components/CryptRoom";
import { DefeatScreen, DevTools, Jumpscare, TransitionCard, VictoryScreen } from "./components/Cinematics";
import { GhostDock } from "./components/GhostDock";
import { Hud } from "./components/Hud";
import { LabRoom } from "./components/LabRoom";
import { LibraryRoom } from "./components/LibraryRoom";
import { PuzzlePanel } from "./components/PuzzlePanel";
import { TitleScreen } from "./components/TitleScreen";

export default function App() {
  const [state, dispatch] = useReducer(reducer, false, initialState);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [dev, setDev] = useState(false);
  const stateRef = useRef(state);
  const audioRef = useRef<ManorAudio | null>(null);
  const prevRef = useRef(state);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const hintCursor = useRef(0);
  stateRef.current = state;
  if (!audioRef.current) audioRef.current = createAudio();

  const now = () => performance.now();

  function start() {
    setCopied(false);
    setDraft("");
    audioRef.current?.unlock();
    audioRef.current?.setMuted(stateRef.current.muted);
    dispatch({ type: "ENTER", now: now() });
  }

  function speak(line: string, mood: Mood) {
    dispatch({ type: "GHOST", line, mood });
  }

  function beginRequest() {
    const id = ++requestId.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return { id, signal: controller.signal, snapshot: stateRef.current };
  }

  function onHint() {
    audioRef.current?.click();
    const snapshot = stateRef.current;
    if (snapshot.phase !== "playing") return;
    const local = hintFor(snapshot, hintCursor.current);
    hintCursor.current += 1;
    speak(local, "smug");
    const request = beginRequest();
    void askGhost(request.snapshot, "Give me a useful hint for this room.", request.signal).then((line) => {
      if (request.id !== requestId.current || !line) return;
      if (stateRef.current.phase !== "playing") return;
      speak(line, "smug");
    });
  }

  function onAsk(message: string) {
    const trimmed = message.trim();
    if (!trimmed || stateRef.current.phase !== "playing") return;
    audioRef.current?.click();
    setDraft("");
    speak("Mm. I'm listening. Unfortunately.", "idle");
    const request = beginRequest();
    void askGhost(request.snapshot, trimmed, request.signal).then((line) => {
      if (request.id !== requestId.current) return;
      if (stateRef.current.phase !== "playing") return;
      speak(line ?? askFallback(stateRef.current), line ? "laugh" : "smug");
    });
  }

  useEffect(() => {
    if (state.phase !== "playing" && state.phase !== "transition") return;
    const id = window.setInterval(() => dispatch({ type: "TICK", now: performance.now() }), 100);
    return () => window.clearInterval(id);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "transition") return;
    const id = window.setTimeout(() => dispatch({ type: "FINISH_TRANSITION" }), 1500);
    return () => window.clearTimeout(id);
  }, [state.phase, state.room]);

  useEffect(() => {
    if (!state.lockShake) return;
    const id = window.setTimeout(() => dispatch({ type: "CLEAR_SHAKE" }), 650);
    return () => window.clearTimeout(id);
  }, [state.failNonce, state.lockShake]);

  useEffect(() => {
    if (!state.burst) return;
    const id = window.setTimeout(() => dispatch({ type: "CLEAR_BURST" }), 800);
    return () => window.clearTimeout(id);
  }, [state.burstNonce, state.burst]);

  useEffect(() => {
    if (!state.jumpscare) return;
    const id = window.setTimeout(() => dispatch({ type: "CLEAR_JUMPSCARE" }), 820);
    return () => window.clearTimeout(id);
  }, [state.jumpscare]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const room = state.room;
    const id = window.setTimeout(() => {
      dispatch({ type: "GHOST", line: quipFor(room, Math.floor(performance.now() / 1000)), mood: "laugh" });
    }, 26_000);
    return () => window.clearTimeout(id);
  }, [state.phase, state.room, state.ghostLine]);

  useEffect(() => {
    const previous = prevRef.current;
    const audio = audioRef.current;
    if (audio) {
      if (state.phase === "transition" && previous.phase === "playing") audio.success();
      if (state.failNonce !== previous.failNonce) audio.error();
      if (state.burstNonce !== previous.burstNonce) audio.error();
      if (state.jumpscare && !previous.jumpscare) audio.scare();
      if (state.phase === "victory" && previous.phase !== "victory") audio.win();
      if (state.phase === "defeat" && previous.phase !== "defeat") audio.lose();
      if (state.muted !== previous.muted) audio.setMuted(state.muted);
    }
    prevRef.current = state;
  }, [state]);

  const second = Math.ceil(state.remainingMs / 1000);
  useEffect(() => {
    if (state.phase !== "playing" && state.phase !== "transition") return;
    if (state.remainingMs > 30_000) return;
    audioRef.current?.tick();
  }, [second, state.phase]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (event.key === "`" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setDev((open) => !open);
        return;
      }
      if (event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.code === "KeyV") {
          event.preventDefault();
          dispatch({ type: "FORCE_WIN", now: performance.now() });
          return;
        }
        if (event.code === "KeyT") {
          event.preventDefault();
          dispatch({ type: "FORCE_LOSE", now: performance.now() });
          return;
        }
        if (event.code === "Digit1" || event.code === "Digit2" || event.code === "Digit3") {
          event.preventDefault();
          dispatch({
            type: "DEV_ROOM",
            room: Number(event.code.slice(-1)) as RoomId,
            now: performance.now(),
          });
          return;
        }
      }
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const snapshot = stateRef.current;
      if (snapshot.phase === "title" && (event.key === "Enter" || event.key === " ") && tag !== "BUTTON") {
        event.preventDefault();
        start();
        return;
      }
      if (event.key === "Escape" && snapshot.inspect) {
        dispatch({ type: "CLOSE_INSPECT" });
        return;
      }
      if (snapshot.phase !== "playing" || snapshot.room !== 1) return;
      if (/^[0-9]$/.test(event.key)) {
        dispatch({ type: "TYPE_DIGIT", digit: Number(event.key) });
      } else if (event.key === "Backspace") {
        event.preventDefault();
        dispatch({ type: "BACKSPACE" });
      } else if (event.key === "Enter") {
        event.preventDefault();
        dispatch({ type: "SUBMIT_CODE", now: performance.now() });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function share() {
    const text = shareText(state.elapsedMs ?? 0, state.remainingMs);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      window.prompt("Copy your result:", text);
    }
  }

  const playing = state.phase === "playing" || state.phase === "transition";
  const critical = playing && state.remainingMs <= 30_000;
  const urgent = playing && !critical && state.remainingMs <= 60_000;
  const mode = critical ? "critical" : urgent ? "urgent" : "";

  return (
    <div className={`app ${mode} ${state.jumpscare ? "shaking" : ""}`}>
      <div className="grain" />
      {state.phase === "title" && (
        <TitleScreen
          muted={state.muted}
          onEnter={start}
          onMute={() => dispatch({ type: "TOGGLE_MUTE" })}
        />
      )}
      {playing && (
        <main className={`play ${state.phase === "playing" ? "with-dock" : ""}`}>
          <Hud
            room={state.room}
            remainingMs={state.remainingMs}
            muted={state.muted}
            urgent={urgent}
            critical={critical}
            onMute={() => dispatch({ type: "TOGGLE_MUTE" })}
          />
          <div className="scene">
            {state.phase === "transition" ? (
              <TransitionCard room={state.room} line={state.ghostLine} onSkip={() => dispatch({ type: "FINISH_TRANSITION" })} />
            ) : state.room === 1 ? (
              <LibraryRoom
                digits={state.digits}
                shake={state.lockShake}
                failNonce={state.failNonce}
                inspected={state.inspected}
                inspect={state.inspect}
                onInspect={(target: Inspect) => {
                  audioRef.current?.click();
                  dispatch({ type: "INSPECT", target });
                }}
                onClose={() => dispatch({ type: "CLOSE_INSPECT" })}
                onSpin={(index, delta) => {
                  audioRef.current?.click();
                  dispatch({ type: "SPIN", index, delta });
                }}
                onSubmit={() => dispatch({ type: "SUBMIT_CODE", now: now() })}
                onClear={() => dispatch({ type: "CLEAR_CODE" })}
              />
            ) : state.room === 2 ? (
              <LabRoom
                potions={state.potions}
                burst={state.burst}
                burstNonce={state.burstNonce}
                onAdd={(potion: Potion) => {
                  audioRef.current?.click();
                  dispatch({ type: "ADD_POTION", potion });
                }}
                onBrew={() => dispatch({ type: "BREW", now: now() })}
                onReset={() => dispatch({ type: "RESET_POTIONS" })}
              />
            ) : (
              <CryptRoom
                door={state.door}
                onSelect={(door: Door) => {
                  audioRef.current?.click();
                  dispatch({ type: "SELECT_DOOR", door });
                }}
              />
            )}
          </div>
          {state.phase === "playing" && (
            <div className="dock">
              <GhostDock
                line={state.ghostLine}
                mood={state.ghostMood}
                draft={draft}
                onDraft={setDraft}
                onAsk={onAsk}
                onHint={onHint}
              />
              <PuzzlePanel state={state} onEnterDoor={() => dispatch({ type: "ENTER_DOOR", now: now() })} />
            </div>
          )}
        </main>
      )}
      {state.phase === "victory" && (
        <VictoryScreen state={state} copied={copied} onAgain={start} onShare={() => void share()} />
      )}
      {state.phase === "defeat" && <DefeatScreen state={state} onAgain={start} />}
      {state.jumpscare && <Jumpscare />}
      {dev && (
        <DevTools
          onWin={() => dispatch({ type: "FORCE_WIN", now: now() })}
          onLose={() => dispatch({ type: "FORCE_LOSE", now: now() })}
          onRoom={(room) => dispatch({ type: "DEV_ROOM", room, now: now() })}
        />
      )}
    </div>
  );
}
