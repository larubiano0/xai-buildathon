import { LINES, RANKS, WRONG_BREW, WRONG_CODE } from "./content";

export const GAME_MS = 180_000;
export const CODE = "1847";
export const SAFE_DOOR = "silence" as const;

export type RoomId = 1 | 2 | 3;
export type Phase = "title" | "playing" | "transition" | "victory" | "defeat";
export type Potion = "blue" | "red" | "green";
export type Door = "shadows" | "flames" | "silence";
export type Inspect = "book1" | "book2" | "book3" | "portrait";
export type Mood = "idle" | "smug" | "laugh" | "panic" | "shock" | "angry";
export type Digits = [number | null, number | null, number | null, number | null];

export interface GameState {
  phase: Phase;
  room: RoomId;
  transitionTo: RoomId | null;
  deadline: number | null;
  startedAt: number | null;
  remainingMs: number;
  elapsedMs: number | null;
  digits: Digits;
  inspected: Record<Inspect, boolean>;
  inspect: Inspect | null;
  lockShake: boolean;
  failNonce: number;
  cabinetOpen: boolean;
  potions: Potion[];
  burst: boolean;
  burstNonce: number;
  door: Door | null;
  jumpscare: boolean;
  ghostLine: string;
  ghostMood: Mood;
  warned60: boolean;
  warned30: boolean;
  busy: boolean;
  muted: boolean;
}

export type Action =
  | { type: "ENTER"; now: number }
  | { type: "TICK"; now: number }
  | { type: "FINISH_TRANSITION" }
  | { type: "INSPECT"; target: Inspect }
  | { type: "CLOSE_INSPECT" }
  | { type: "SPIN"; index: number; delta: number }
  | { type: "TYPE_DIGIT"; digit: number }
  | { type: "BACKSPACE" }
  | { type: "CLEAR_CODE" }
  | { type: "SUBMIT_CODE"; now: number }
  | { type: "CLEAR_SHAKE" }
  | { type: "ADD_POTION"; potion: Potion }
  | { type: "RESET_POTIONS" }
  | { type: "BREW"; now: number }
  | { type: "CLEAR_BURST" }
  | { type: "SELECT_DOOR"; door: Door }
  | { type: "ENTER_DOOR"; now: number }
  | { type: "CLEAR_JUMPSCARE" }
  | { type: "GHOST"; line: string; mood: Mood }
  | { type: "TOGGLE_MUTE" }
  | { type: "FORCE_WIN"; now: number }
  | { type: "FORCE_LOSE"; now: number }
  | { type: "DEV_ROOM"; room: RoomId; now: number };

const EMPTY_DIGITS: Digits = [null, null, null, null];

function blankInspect(): Record<Inspect, boolean> {
  return { book1: false, book2: false, book3: false, portrait: false };
}

export function initialState(muted = false): GameState {
  return {
    phase: "title",
    room: 1,
    transitionTo: null,
    deadline: null,
    startedAt: null,
    remainingMs: GAME_MS,
    elapsedMs: null,
    digits: [...EMPTY_DIGITS],
    inspected: blankInspect(),
    inspect: null,
    lockShake: false,
    failNonce: 0,
    cabinetOpen: false,
    potions: [],
    burst: false,
    burstNonce: 0,
    door: null,
    jumpscare: false,
    ghostLine: LINES.clever,
    ghostMood: "idle",
    warned60: false,
    warned30: false,
    busy: false,
    muted,
  };
}

function pick(lines: readonly string[], now: number): string {
  const index = Math.abs(Math.floor(now)) % lines.length;
  return lines[index] ?? lines[0];
}

function codeString(digits: Digits): string | null {
  if (digits.some((digit) => digit === null)) return null;
  return digits.join("");
}

function finish(state: GameState, phase: "victory" | "defeat", now: number): GameState {
  const started = state.startedAt ?? now;
  const remaining = state.deadline == null ? 0 : Math.max(0, state.deadline - now);
  return {
    ...state,
    phase,
    remainingMs: phase === "defeat" ? 0 : remaining,
    elapsedMs: Math.max(0, now - started),
    busy: false,
    jumpscare: false,
    inspect: null,
    lockShake: false,
    burst: false,
    ghostMood: phase === "victory" ? "shock" : "angry",
    ghostLine: phase === "victory" ? LINES.escaped : LINES.defeat,
  };
}

function arrive(room: RoomId): { line: string; mood: Mood } {
  if (room === 1) return { line: LINES.clever, mood: "smug" };
  if (room === 2) return { line: LINES.labArrive, mood: "laugh" };
  return { line: LINES.cryptArrive, mood: "idle" };
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "ENTER": {
      const fresh = initialState(state.muted);
      return {
        ...fresh,
        phase: "transition",
        room: 1,
        transitionTo: 1,
        deadline: action.now + GAME_MS,
        startedAt: action.now,
        remainingMs: GAME_MS,
        ghostLine: LINES.clever,
        ghostMood: "smug",
      };
    }
    case "TICK": {
      if ((state.phase !== "playing" && state.phase !== "transition") || state.deadline == null) {
        return state;
      }
      const remaining = state.deadline - action.now;
      if (remaining <= 0) return finish(state, "defeat", action.now);
      let next = state;
      if (remaining !== state.remainingMs) next = { ...next, remainingMs: remaining };
      if (remaining <= 30_000 && !state.warned30) {
        next = {
          ...next,
          remainingMs: remaining,
          warned30: true,
          warned60: true,
          ghostMood: "panic",
          ghostLine: LINES.thirty,
        };
      } else if (remaining <= 60_000 && !state.warned60) {
        next = {
          ...next,
          remainingMs: remaining,
          warned60: true,
          ghostMood: "laugh",
          ghostLine: LINES.oneMinute,
        };
      }
      return next;
    }
    case "FINISH_TRANSITION": {
      if (state.phase !== "transition" || state.transitionTo == null) return state;
      const room = state.transitionTo;
      const greeting = arrive(room);
      return {
        ...state,
        phase: "playing",
        room,
        transitionTo: null,
        busy: false,
        inspect: null,
        ghostLine: greeting.line,
        ghostMood: greeting.mood,
      };
    }
    case "INSPECT": {
      if (state.phase !== "playing" || state.room !== 1 || state.busy) return state;
      return {
        ...state,
        inspect: action.target,
        inspected: { ...state.inspected, [action.target]: true },
      };
    }
    case "CLOSE_INSPECT":
      return state.inspect == null ? state : { ...state, inspect: null };
    case "SPIN": {
      if (state.phase !== "playing" || state.room !== 1 || state.busy) return state;
      if (action.index < 0 || action.index > 3) return state;
      const digits = [...state.digits] as Digits;
      const current = digits[action.index];
      const base = current == null ? (action.delta > 0 ? -1 : 10) : current;
      digits[action.index] = (base + action.delta + 10) % 10;
      return { ...state, digits, lockShake: false };
    }
    case "TYPE_DIGIT": {
      if (state.phase !== "playing" || state.room !== 1 || state.busy) return state;
      if (!Number.isInteger(action.digit) || action.digit < 0 || action.digit > 9) return state;
      const index = state.digits.findIndex((digit) => digit === null);
      if (index < 0) return state;
      const digits = [...state.digits] as Digits;
      digits[index] = action.digit;
      return { ...state, digits, lockShake: false };
    }
    case "BACKSPACE": {
      if (state.phase !== "playing" || state.room !== 1 || state.busy) return state;
      let index = -1;
      state.digits.forEach((digit, i) => {
        if (digit !== null) index = i;
      });
      if (index < 0) return state;
      const digits = [...state.digits] as Digits;
      digits[index] = null;
      return { ...state, digits, lockShake: false };
    }
    case "CLEAR_CODE": {
      if (state.phase !== "playing" || state.room !== 1 || state.busy) return state;
      return { ...state, digits: [...EMPTY_DIGITS], lockShake: false };
    }
    case "SUBMIT_CODE": {
      if (state.phase !== "playing" || state.room !== 1 || state.busy) return state;
      const code = codeString(state.digits);
      if (code == null) return state;
      if (code === CODE) {
        return {
          ...state,
          busy: true,
          cabinetOpen: true,
          lockShake: false,
          inspect: null,
          phase: "transition",
          room: 2,
          transitionTo: 2,
          ghostMood: "smug",
          ghostLine: LINES.key,
        };
      }
      return {
        ...state,
        lockShake: true,
        failNonce: state.failNonce + 1,
        ghostMood: "laugh",
        ghostLine: pick(WRONG_CODE, action.now),
      };
    }
    case "CLEAR_SHAKE":
      return state.lockShake ? { ...state, lockShake: false } : state;
    case "ADD_POTION": {
      if (state.phase !== "playing" || state.room !== 2 || state.busy) return state;
      if (!state.burst && state.potions.length >= 2) return state;
      const potions = state.burst ? [action.potion] : [...state.potions, action.potion];
      return { ...state, potions, burst: false };
    }
    case "RESET_POTIONS": {
      if (state.phase !== "playing" || state.room !== 2 || state.busy) return state;
      return { ...state, potions: [], burst: false };
    }
    case "BREW": {
      if (state.phase !== "playing" || state.room !== 2 || state.busy || state.burst) return state;
      if (state.potions.length !== 2) return state;
      const correct = state.potions[0] === "blue" && state.potions[1] === "red";
      if (correct) {
        return {
          ...state,
          busy: true,
          phase: "transition",
          room: 3,
          transitionTo: 3,
          ghostMood: "smug",
          ghostLine: LINES.unlocked,
        };
      }
      return {
        ...state,
        potions: [],
        burst: true,
        burstNonce: state.burstNonce + 1,
        ghostMood: "laugh",
        ghostLine: pick(WRONG_BREW, action.now),
      };
    }
    case "CLEAR_BURST":
      return state.burst ? { ...state, burst: false } : state;
    case "SELECT_DOOR": {
      if (state.phase !== "playing" || state.room !== 3 || state.busy || state.jumpscare) return state;
      return { ...state, door: action.door };
    }
    case "ENTER_DOOR": {
      if (state.phase !== "playing" || state.room !== 3 || state.busy || state.jumpscare) return state;
      if (state.door == null) return state;
      if (state.door === SAFE_DOOR) return finish(state, "victory", action.now);
      const line = state.door === "shadows" ? LINES.shadows : LINES.flames;
      return {
        ...state,
        jumpscare: true,
        door: null,
        ghostMood: "angry",
        ghostLine: line,
      };
    }
    case "CLEAR_JUMPSCARE":
      return state.jumpscare ? { ...state, jumpscare: false } : state;
    case "GHOST": {
      if (state.phase === "victory" || state.phase === "defeat" || state.phase === "transition") {
        return state;
      }
      const line = action.line.replace(/\s+/g, " ").trim().slice(0, 280);
      if (!line) return state;
      return { ...state, ghostLine: line, ghostMood: action.mood };
    }
    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };
    case "FORCE_WIN": {
      if (state.phase === "victory") return state;
      const base =
        state.startedAt == null
          ? { ...state, startedAt: action.now, deadline: action.now + GAME_MS, remainingMs: GAME_MS }
          : state;
      return finish(base, "victory", action.now);
    }
    case "FORCE_LOSE": {
      if (state.phase === "defeat") return state;
      const base =
        state.startedAt == null ? { ...state, startedAt: action.now, deadline: action.now } : state;
      return finish(base, "defeat", action.now);
    }
    case "DEV_ROOM": {
      if (state.phase === "victory" || state.phase === "defeat") return state;
      const startedAt = state.startedAt ?? action.now;
      const deadline = state.deadline ?? action.now + GAME_MS;
      return {
        ...state,
        phase: "playing",
        room: action.room,
        transitionTo: null,
        busy: false,
        jumpscare: false,
        inspect: null,
        lockShake: false,
        burst: false,
        startedAt,
        deadline,
        remainingMs: Math.max(0, deadline - action.now),
      };
    }
    default:
      return state;
  }
}

export function rankFor(remainingMs: number): { title: string; blurb: string } {
  const seconds = Math.max(0, remainingMs) / 1000;
  const rank = RANKS.find((entry) => seconds >= entry.min) ?? RANKS[RANKS.length - 1];
  return { title: rank.title, blurb: rank.blurb };
}

export function formatClock(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function shareText(elapsedMs: number, remainingMs: number): string {
  const rank = rankFor(remainingMs);
  return `I escaped Grok Manor in ${formatElapsed(elapsedMs)} — rank: ${rank.title}. ${rank.blurb}`;
}

export function puzzleNotes(state: GameState): string {
  if (state.room === 1) {
    const read = (Object.entries(state.inspected) as [Inspect, boolean][])
      .filter(([, seen]) => seen)
      .map(([name]) => name);
    return `Library. Inspected: ${read.join(", ") || "nothing"}. Code entered: ${
      state.digits.every((digit) => digit !== null) ? "four digits" : "incomplete"
    }.`;
  }
  if (state.room === 2) {
    const mix = state.potions.join(" then ") || "empty";
    return `Laboratory. Current pour: ${mix}. The recipe is visible in the room.`;
  }
  return `Crypt. Selected door: ${state.door ?? "none"}. The stone inscription is visible.`;
}
