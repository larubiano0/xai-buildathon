# 👻 Escape From Grok Manor

You wake up trapped in a haunted mansion with **300 seconds** to get out. There are five rooms, five secrets and one way out. Your only company is **Grokgeist**, a sarcastic, mischievous ghost who gives hints, mocks your mistakes and counts down your remaining life. It's a five-minute point-and-click Halloween escape room with gothic CSS/SVG art, flickering candles, drifting fog, jumpscares and cinematic endings. Grokgeist's dialogue can optionally come live from the xAI Grok API.

## Setup
```bash
npm install
cp .env.example .env     # optional: add XAI_API_KEY for live AI ghost
npm run dev              # starts Vite (5173) + Express proxy (8787) via concurrently
```
Open **http://localhost:5173**. Run `npm run build` for a production build.

### Environment variables (server-side only, never sent to the browser)
| Var | Default | Purpose |
|---|---|---|
| `XAI_API_KEY` | *(empty)* | Enables live Grokgeist replies through `/api/ghost`. Without it, the game uses built-in contextual lines. |
| `XAI_MODEL` | `grok-3-mini` | xAI model |
| `PORT` | `8787` | Proxy port (Vite proxies `/api` to it) |

The AI only *talks*. All puzzle logic is deterministic in the client. API calls time out after 4s and fall back to the scripted lines.

## Puzzles (spoilers)
1. **Haunted Library:** the books point to the portrait, which is dated **1847**. Dial in 1847 on the cabinet lock, then take the key.
2. **Alchemist's Lab:** the recipe says midnight sky, then a beating heart: **Blue → Red**. A wrong order makes the cauldron explode in smoke and resets.
3. **Cursed Crypt:** "where the dead make no sound" means the **Door of Silence**, which leads up to room 4. A wrong door triggers a jumpscare and the clock keeps running.
4. **Clockwork Observatory (harder):** combine the telescope note (dial I = what rules the night, dial III = the ringed wanderer) with the star atlas (dial II = what the Hunter's belt is made of). The answer is **☽ Moon · ★ Star · ♄ Saturn**. Click **ALIGN**, then climb through the hatch.
5. **Ritual Chamber (hardest):** the candles flash a 5-rune sequence once: **👁️ 💀 🕸️ 🔥 🌙**. Repeat it; a wrong rune resets the sequence. **Replay** costs 10 seconds. Then answer the riddle "The more you take, the more you leave behind": **footsteps**. That wins the game.

## Dev / testing flags
Open `http://localhost:5173/?dev=1` for a dev panel: **⏱ 5s** (set the timer to 5 seconds to test defeat), **R1–R5** (jump to a room), **🏆 win**. The panel is hidden during normal play.
Run the e2e tests with `npm test` while `npm run dev` is running. They use Playwright and save screenshots to `screenshots/`.

## 45-second demo script
1. (0s) Title screen: "This is Grokgeist. He's dead and he's rude." Click **ENTER THE MANOR**. The 5:00 timer starts.
2. (5s) Click the green book, then the portrait (it reads **1847**). Open the cabinet, dial 1-8-4-7, click **UNLOCK** and grab the key.
3. (13s) In the lab, click **Red** first to show the smoke explosion and the ghost's roast. Then click **Blue → Red** and go through the door.
4. (22s) In the crypt, read the inscription. Click **Door of Flames** for the jumpscare (audience screams), then pause on the inscription.
5. (24s) Click **Door of Silence**. "This manor has MORE floors." Point out the 4/5 progress. (Use `?dev=1` → **R4/R5** if time is short.)
6. (30s) Observatory: set the dials to Moon / Star / Saturn and click **ALIGN**. Ritual: watch the candles, repeat 👁️ 💀 🕸️ 🔥 🌙, then type **footsteps**.
7. (45s) Doors burst open and the light floods in. "You escaped? That's embarrassing for the management." Click **SHARE RESULT**.

Built with **Grok Bot** for Grok Bot Build Night 🎃
