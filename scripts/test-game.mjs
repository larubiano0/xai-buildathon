import assert from "node:assert/strict";
import { createServer } from "vite";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const logic = await vite.ssrLoadModule("/src/game/logic.ts");
const ghost = await vite.ssrLoadModule("/src/game/ghost.ts");
const { reducer, initialState, GAME_MS, rankFor, formatClock, formatElapsed, shareText } = logic;

function room1(now = 0) {
  return reducer(reducer(initialState(), { type: "ENTER", now }), { type: "FINISH_TRANSITION" });
}

function typeCode(state, code) {
  let next = reducer(state, { type: "CLEAR_CODE" });
  for (const char of code) next = reducer(next, { type: "TYPE_DIGIT", digit: Number(char) });
  return next;
}

function room2(now = 0) {
  let state = typeCode(room1(now), "1847");
  state = reducer(state, { type: "SUBMIT_CODE", now: now + 1000 });
  assert.equal(state.phase, "transition");
  assert.equal(state.room, 2);
  assert.equal(state.deadline, now + GAME_MS);
  state = reducer(state, { type: "FINISH_TRANSITION" });
  assert.equal(state.phase, "playing");
  assert.equal(state.room, 2);
  assert.equal(state.deadline, now + GAME_MS);
  return state;
}

function room3(now = 0) {
  let state = room2(now);
  state = reducer(state, { type: "ADD_POTION", potion: "blue" });
  state = reducer(state, { type: "ADD_POTION", potion: "red" });
  state = reducer(state, { type: "BREW", now: now + 2000 });
  const deadline = state.deadline;
  state = reducer(state, { type: "FINISH_TRANSITION" });
  assert.equal(state.room, 3);
  assert.equal(state.phase, "playing");
  assert.equal(state.deadline, deadline);
  return state;
}

{
  let state = typeCode(room1(0), "0000");
  const deadline = state.deadline;
  state = reducer(state, { type: "SUBMIT_CODE", now: 50 });
  assert.equal(state.phase, "playing");
  assert.equal(state.room, 1);
  assert.equal(state.lockShake, true);
  assert.equal(state.deadline, deadline);
  assert.equal(state.failNonce, 1);
}

{
  let state = room1();
  state = reducer(state, { type: "TYPE_DIGIT", digit: 1 });
  state = reducer(state, { type: "SUBMIT_CODE", now: 1 });
  assert.equal(state.room, 1);
  assert.equal(state.phase, "playing");
}

{
  let state = room1();
  state = reducer(state, { type: "SPIN", index: 0, delta: -1 });
  assert.equal(state.digits[0], 9);
  state = reducer(state, { type: "SPIN", index: 0, delta: 1 });
  assert.equal(state.digits[0], 0);
  state = reducer(state, { type: "TYPE_DIGIT", digit: 9 });
  state = reducer(state, { type: "BACKSPACE" });
  assert.equal(state.digits[0], 0);
  assert.equal(state.digits[1], null);
}

{
  let state = typeCode(room1(0), "1848");
  state = reducer(state, { type: "SUBMIT_CODE", now: 10 });
  assert.equal(state.room, 1);
  state = typeCode(room1(0), "1847");
  const first = reducer(state, { type: "SUBMIT_CODE", now: 10 });
  const second = reducer(first, { type: "SUBMIT_CODE", now: 11 });
  assert.equal(second, first);
  assert.equal(first.room, 2);
  const ignored = reducer(first, { type: "GHOST", line: "nope", mood: "idle" });
  assert.equal(ignored.ghostLine, first.ghostLine);
}

{
  let state = room1(0);
  state = reducer(state, { type: "BREW", now: 1 });
  state = reducer(state, { type: "ENTER_DOOR", now: 1 });
  state = reducer(state, { type: "ADD_POTION", potion: "blue" });
  assert.equal(state.room, 1);
  assert.equal(state.potions.length, 0);
}

{
  let state = room2();
  for (const mix of [
    ["red", "blue"],
    ["blue", "green"],
    ["green", "red"],
    ["blue", "blue"],
    ["red", "red"],
  ]) {
    state = reducer(state, { type: "RESET_POTIONS" });
    state = reducer(state, { type: "ADD_POTION", potion: mix[0] });
    state = reducer(state, { type: "ADD_POTION", potion: mix[1] });
    state = reducer(state, { type: "ADD_POTION", potion: "green" });
    assert.deepEqual(state.potions, mix);
    state = reducer(state, { type: "BREW", now: 5 });
    assert.equal(state.phase, "playing");
    assert.equal(state.room, 2);
    assert.equal(state.burst, true);
    assert.deepEqual(state.potions, []);
    state = reducer(state, { type: "CLEAR_BURST" });
  }
  state = reducer(state, { type: "BREW", now: 6 });
  assert.equal(state.room, 2);
  state = reducer(state, { type: "ADD_POTION", potion: "blue" });
  state = reducer(state, { type: "ADD_POTION", potion: "red" });
  const brewed = reducer(state, { type: "BREW", now: 7 });
  assert.equal(brewed.room, 3);
  assert.equal(brewed.phase, "transition");
  assert.equal(reducer(brewed, { type: "BREW", now: 8 }), brewed);
}

{
  let state = room3(1000);
  assert.equal(state.deadline, 1000 + GAME_MS);
  state = reducer(state, { type: "ENTER_DOOR", now: 2000 });
  assert.equal(state.phase, "playing");
  state = reducer(state, { type: "SELECT_DOOR", door: "flames" });
  state = reducer(state, { type: "ENTER_DOOR", now: 3000 });
  assert.equal(state.jumpscare, true);
  assert.equal(state.door, null);
  assert.equal(state.room, 3);
  assert.equal(reducer(state, { type: "ENTER_DOOR", now: 3100 }).jumpscare, true);
  state = reducer(state, { type: "CLEAR_JUMPSCARE" });
  state = reducer(state, { type: "SELECT_DOOR", door: "shadows" });
  state = reducer(state, { type: "SELECT_DOOR", door: "silence" });
  state = reducer(state, { type: "ENTER_DOOR", now: 4000 });
  assert.equal(state.phase, "victory");
  assert.equal(state.elapsedMs, 3000);
  assert.equal(state.remainingMs, GAME_MS - 3000);
  assert.match(state.ghostLine, /embarrassing/);
}

{
  let state = room1(1000);
  state = reducer(state, { type: "TICK", now: 11000 });
  assert.equal(state.remainingMs, GAME_MS - 10000);
  state = reducer(state, { type: "TICK", now: 1000 + GAME_MS - 60000 });
  assert.equal(state.warned60, true);
  assert.match(state.ghostLine, /One minute/);
  state = reducer(state, { type: "TICK", now: 1000 + GAME_MS - 20000 });
  assert.match(state.ghostLine, /Thirty seconds/);
  const line = state.ghostLine;
  state = reducer(state, { type: "TICK", now: 1000 + GAME_MS - 19000 });
  assert.equal(state.ghostLine, line);
  state = reducer(state, { type: "TICK", now: 1000 + GAME_MS });
  assert.equal(state.phase, "defeat");
  assert.equal(state.remainingMs, 0);
  assert.ok(state.elapsedMs >= GAME_MS);
}

{
  let state = room1(0);
  state = reducer(state, { type: "TICK", now: GAME_MS - 20000 });
  assert.equal(state.warned60, true);
  assert.equal(state.warned30, true);
  assert.match(state.ghostLine, /Thirty seconds/);
}

{
  let state = room1();
  state = reducer(state, { type: "INSPECT", target: "portrait" });
  assert.equal(state.inspected.portrait, true);
  assert.equal(state.inspect, "portrait");
  state = reducer(state, { type: "TOGGLE_MUTE" });
  state = typeCode(state, "1111");
  state = reducer(state, { type: "ENTER", now: 9000 });
  assert.equal(state.muted, true);
  assert.equal(state.phase, "transition");
  assert.equal(state.room, 1);
  assert.equal(state.digits.every((digit) => digit === null), true);
  assert.equal(state.deadline, 9000 + GAME_MS);
  assert.equal(state.warned30, false);
}

{
  const won = reducer(initialState(), { type: "FORCE_WIN", now: 50 });
  assert.equal(won.phase, "victory");
  assert.equal(reducer(won, { type: "FORCE_WIN", now: 80 }), won);
  const lost = reducer(room1(10), { type: "FORCE_LOSE", now: 40 });
  assert.equal(lost.phase, "defeat");
  assert.equal(lost.remainingMs, 0);
}

assert.equal(formatClock(GAME_MS), "3:00");
assert.equal(formatClock(59000), "0:59");
assert.equal(formatClock(1), "0:01");
assert.equal(formatElapsed(125500), "2:06");
assert.equal(rankFor(150000).title, "The Manor's Worst Nightmare");
assert.equal(rankFor(100000).title, "Professional Trespasser");
assert.equal(rankFor(60000).title, "Moderately Haunted");
assert.equal(rankFor(30000).title, "Sweaty Survivor");
assert.equal(rankFor(1000).title, "Fashionably Late to Living");
assert.match(shareText(40000, 140000), /Professional Trespasser/);
assert.ok(ghost.hintFor(room1(), 0).length > 0);
assert.match(ghost.hintFor(room1(), 2), /1847|portrait|brass|books/i);
assert.equal(ghost.extractGhostLine({ output_text: "Boo. **Stop.**" }), "Boo. Stop.");
assert.equal(
  ghost.extractGhostLine({ choices: [{ message: { content: "First sentence. Second sentence. Third." } }] }),
  "First sentence. Second sentence.",
);

await vite.close();
console.log("logic tests passed");
