import type { GameState } from "./logic";
import { puzzleNotes } from "./logic";

export async function askGhost(state: GameState, message: string, signal: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch("/api/ghost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        room: state.room,
        remainingSec: Math.max(0, Math.ceil(state.remainingMs / 1000)),
        message: message.slice(0, 240),
        notes: puzzleNotes(state),
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { line?: unknown };
    if (typeof data.line !== "string") return null;
    const line = data.line.replace(/\s+/g, " ").trim();
    return line ? line.slice(0, 280) : null;
  } catch {
    return null;
  }
}
