import { extractGhostLine, ghostPrompt } from "../src/game/ghost";

type GhostRequest = {
  method?: string;
  on(event: "data", listener: (chunk: Buffer | string) => void): void;
  on(event: "end", listener: () => void): void;
  on(event: "error", listener: (error: Error) => void): void;
};

type GhostResponse = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
};

function send(res: GhostResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function readBody(req: GhostRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk) => {
      const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
      size += buffer.length;
      if (size > 8_000) {
        reject(new Error("too_large"));
        return;
      }
      chunks.push(buffer);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function asRoom(value: unknown): 1 | 2 | 3 {
  return value === 2 || value === 3 ? value : 1;
}

async function callModel(apiKey: string, system: string, user: string): Promise<string> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const responses = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(8_000),
    body: JSON.stringify({
      model: "grok-4.7",
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (responses.ok) {
    const line = extractGhostLine(await responses.json());
    if (line) return line;
  }
  const chat = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(8_000),
    body: JSON.stringify({
      model: "grok-4.7",
      temperature: 0.9,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!chat.ok) throw new Error(`grok_${chat.status}`);
  const line = extractGhostLine(await chat.json());
  if (!line) throw new Error("empty_ghost");
  return line;
}

export function ghostMiddleware(apiKey: string) {
  return (req: GhostRequest, res: GhostResponse, next: () => void) => {
    const url = (req as GhostRequest & { url?: string }).url?.split("?")[0] ?? "";
    if (url !== "/api/ghost") {
      next();
      return;
    }
    if (req.method !== "POST") {
      send(res, 405, { error: "method" });
      return;
    }
    void (async () => {
      try {
        if (!apiKey) {
          send(res, 200, { line: null });
          return;
        }
        const raw = await readBody(req);
        const body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
        const room = asRoom(body.room);
        const remainingSec = Math.max(0, Math.min(180, Number(body.remainingSec) || 0));
        const message = String(body.message ?? "Give me a hint.")
          .replace(/[\u0000-\u001F]/g, "")
          .slice(0, 240);
        const notes = String(body.notes ?? "").replace(/[\u0000-\u001F]/g, "").slice(0, 400);
        const prompt = ghostPrompt(room, remainingSec, notes, message);
        const line = await callModel(apiKey, prompt.system, prompt.user);
        send(res, 200, { line });
      } catch (error) {
        console.error("ghost fallback:", error instanceof Error ? error.message : "failed");
        send(res, 200, { line: null });
      }
    })();
  };
}
