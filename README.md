# Escape From Grok Manor

A three-minute Halloween escape room. Three rooms, one clock, and a ghost who will not open the doors for you.

## Run

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173

```bash
npm test
npm run build
```

## Ghost

The game is fully playable with no API key. Grokgeist uses written lines.

To let the ghost answer whispers with Grok, put a key in `.env` (never commit it) and restart the dev server:

```bash
XAI_API_KEY=your_key_here
```

The browser only talks to `/api/ghost`. The key stays on the Vite server.

## Demo script (about 30 seconds)

1. Read Grokgeist's warning and press **Enter the Manor**.
2. Library: open the portrait, read **1847**, dial it, open the cabinet.
3. Laboratory: pour **Blue**, then **Red**, and brew.
4. Crypt: read the stone and step through the **Door of Silence**.
5. The rank card lands. Hit **Share result** if the room wants a laugh.

Optional: press **Hint**, or ask the ghost something rude.

## Stage tools

These are outside normal play.

- `` ` `` opens stage tools
- Shift+V victory
- Shift+T timeout
- Shift+1 / 2 / 3 jump rooms

On the title screen, Enter or Space also starts the clock. In the library, type the year and press Enter.
