export const ROOMS = ['The Haunted Library', "The Alchemist's Laboratory", 'The Cursed Crypt'];
const HINTS: string[][] = [
  ['The books are gossiping about someone on the wall. Eavesdrop.', 'I died here in 1847. But don\'t let that distract you.', 'Portraits remember the year they were painted. Unlike you, who forgets everything.'],
  ['Read the recipe. Yes, reading. Terrifying, I know.', 'Midnight sky. What colour is that? Not green, genius.', 'Blue before red. You humans really do need everything explained.'],
  ['The inscription is a warning, not decoration.', 'Hunters lurk in shadows. Flames burn. Which door is… quiet?', 'Shhh. The dead make no sound. Hint, hint.'],
];
const QUIPS = ['Oh, another human who thinks they\'re clever.', 'Don\'t mind the screaming. That\'s just the plumbing.', 'I\'d help more, but I\'m legally dead.', 'Tick tock. I can hear your heartbeat. It\'s adorable.', 'Remember: don\'t trust the ghost. Except now. Trust me now.'];
export const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
export const localHint = (room: number, n: number) => HINTS[room][Math.min(n, HINTS[room].length - 1)];
export const quip = () => pick(QUIPS);
export const LINES = {
  intro: 'Welcome to Grok Manor. You have three minutes to escape. Three rooms. Three secrets. One way out. And whatever you do… don\'t trust the ghost.',
  enter: ['Oh, another human who thinks they\'re clever.', 'The library. Mind the books, they bite.'],
  wrongCode: ['Wrong. The lock is laughing at you. So am I.', 'Close? No. Not even close.', 'The cabinet sighs in disappointment.'],
  solved1: ['Fine. You can read a date. Gold star.', 'The key! I suppose you want applause.'],
  wrongPotion: ['BOOM. That was my favourite eyebrow of yours.', 'Chemistry is not your strength. Or anything, really.'],
  solved2: ['Blue then red. Even a corpse could do it… and I would know.', 'The door unlocks. I am mildly impressed. Mildly.'],
  wrongDoor: ['AAAAH! …Sorry, that was me. Pick again.', 'Wrong door. Something in there is still hungry.'],
  sixty: 'One minute left. I\'m warming up your eternal bed.',
  thirty: 'Thirty seconds left. I\'ve already prepared your room.',
  win: 'You escaped? That\'s embarrassing for the management.',
  lose: 'Welcome home. Forever. Mind the drafts.',
};
export async function askGhost(room: number, remaining: number, puzzleState: string, message: string, n: number): Promise<{ text: string; ai: boolean }> {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch('/api/ghost', { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room: ROOMS[room], remaining: Math.ceil(remaining), puzzleState, message }) });
    if (!r.ok) throw new Error();
    const j = await r.json(); if (!j.text) throw new Error();
    return { text: j.text, ai: true };
  } catch { return { text: localHint(room, n), ai: false }; } finally { clearTimeout(t); }
}
