import { LINES, QUIPS } from "./content";
import type { GameState, RoomId } from "./logic";

export function hintFor(state: GameState, salt: number): string {
  if (state.room === 1) {
    const pool = state.inspected.portrait
      ? [
          "You looked at the plaque and came back to me. I'm flattered. And ashamed.",
          "The year under that gloomy face. Turn it into the lock.",
          LINES.died,
        ]
      : [
          "The books are gossips. The portrait is a snitch.",
          "Four digits, brass plaque, terrible portrait manners.",
          LINES.died,
        ];
    return pool[Math.abs(salt) % pool.length] ?? pool[0];
  }
  if (state.room === 2) {
    const pool = [
      "Midnight first. The sky, not the mold.",
      LINES.blueBeforeRed,
      "A beating heart is not green. Green is showing off.",
    ];
    return pool[Math.abs(salt) % pool.length] ?? pool[0];
  }
  const pool = [
    "Hunters like the dark. Fire likes everyone. The quiet door is the rude one, which is why it works.",
    "Only where the dead make no sound. I am being extremely unsubtle.",
    "If a door is performing, it is lying.",
  ];
  return pool[Math.abs(salt) % pool.length] ?? pool[0];
}

export function quipFor(room: RoomId, salt: number): string {
  const pool = QUIPS[room];
  return pool[Math.abs(salt) % pool.length] ?? pool[0];
}

export function askFallback(state: GameState): string {
  if (state.room === 1 && !state.inspected.portrait) {
    return "Ask the painting. It has been dying to talk. I already did the dying.";
  }
  return hintFor(state, state.failNonce + state.burstNonce + 1);
}

export function extractGhostLine(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  if (typeof record.output_text === "string") return clampLine(record.output_text);
  const choices = record.choices;
  if (Array.isArray(choices) && choices[0] && typeof choices[0] === "object") {
    const message = (choices[0] as { message?: { content?: unknown } }).message;
    if (typeof message?.content === "string") return clampLine(message.content);
    if (Array.isArray(message?.content)) {
      const text = message.content
        .map((part) =>
          part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string"
            ? (part as { text: string }).text
            : "",
        )
        .join(" ");
      return clampLine(text);
    }
  }
  if (!Array.isArray(record.output)) return "";
  const bits: string[] = [];
  for (const item of record.output) {
    if (!item || typeof item !== "object") continue;
    const entry = item as { text?: unknown; content?: unknown };
    if (typeof entry.text === "string") bits.push(entry.text);
    if (!Array.isArray(entry.content)) continue;
    for (const part of entry.content) {
      if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
        bits.push((part as { text: string }).text);
      }
    }
  }
  return clampLine(bits.join(" "));
}

export function clampLine(text: string): string {
  const clean = text.replace(/[*_`#]/g, "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const sentences = clean.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  return sentences.slice(0, 280);
}

export function ghostPrompt(room: RoomId, remainingSec: number, notes: string, message: string): {
  system: string;
  user: string;
} {
  const system = [
    "You are Grokgeist, the resident ghost of Grok Manor: sarcastic, spooky, and mischievous.",
    "Speak in one or two short sentences. No markdown, no lists, no stage directions.",
    "Never say you are an AI, a model, or a language model. You died in this house and you enjoy company.",
    "You only speak. You cannot open locks, pour potions, choose doors, or decide whether a puzzle is solved.",
    "Never give a wrong solution. If you spoil something, spoil the truth and sound annoyed about it.",
    "Truth: the library cabinet code is 1847, on Lord Grok's portrait plaque. The books only point there.",
    "Truth: in the laboratory, pour blue first (midnight sky), then red (a beating heart). Green is never correct. Order matters.",
    "Truth: in the crypt, the Door of Silence is the only safe door. Shadows hide a hunter. Flames consume whoever enters.",
    "If they ask directly, you may give the true answer wrapped in sarcasm. Keep it funny.",
  ].join(" ");
  const user = `Room ${room} of 3. Seconds left: ${remainingSec}. Puzzle notes: ${notes}. The player says: ${message}`;
  return { system, user };
}
