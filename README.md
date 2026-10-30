# 👻 Escape From Grok Manor

You wake up trapped in a haunted mansion with **180 seconds** to get out. There are three rooms, three secrets and one way out. Your only company is **Grokgeist**, a sarcastic, mischievous ghost who gives hints, mocks your mistakes and counts down your remaining life. It's a three-minute point-and-click Halloween escape room with gothic CSS/SVG art, flickering candles, drifting fog, jumpscares and cinematic endings. Grokgeist's dialogue can optionally come live from the xAI Grok API.

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
3. **Cursed Crypt:** "where the dead make no sound" means the **Door of Silence**. A wrong door triggers a jumpscare and the clock keeps running.

## Dev / testing flags
Open `http://localhost:5173/?dev=1` for a dev panel: **⏱ 5s** (set the timer to 5 seconds to test defeat), **R1/R2/R3** (jump to a room), **🏆 win**. The panel is hidden during normal play.
Run the e2e tests with `npm test` while `npm run dev` is running. They use Playwright and save screenshots to `screenshots/`.

## 30-second demo script
1. (0s) Title screen: "This is Grokgeist. He's dead and he's rude." Click **ENTER THE MANOR**. The 3:00 timer starts.
2. (5s) Click the green book, then the portrait (it reads **1847**). Open the cabinet, dial 1-8-4-7, click **UNLOCK** and grab the key.
3. (13s) In the lab, click **Red** first to show the smoke explosion and the ghost's roast. Then click **Blue → Red** and go through the door.
4. (22s) In the crypt, read the inscription. Click **Door of Flames** for the jumpscare (audience screams), then **Door of Silence** to escape.
5. (28s) Doors burst open and the light floods in. "You escaped? That's embarrassing for the management." Click **SHARE RESULT**.

Built with **Grok Bot** for Grok Bot Build Night 🎃
