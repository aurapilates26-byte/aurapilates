/**
 * Vérifie la fenêtre de marquage présence (avant / pendant / après).
 * Usage: npx tsx lib/admin/presence-window.selftest.ts
 */
import assert from "node:assert/strict";
import {
  getPresenceSessionPhase,
  isPresenceMarkingAllowed,
  minus15Minutes,
  studioNowClock,
} from "./presence-window";

assert.equal(minus15Minutes("18:00"), "17:45");
assert.equal(minus15Minutes("00:10"), "23:55");

const start = "18:00";
const end = "19:00";

// Avant la fenêtre
assert.equal(isPresenceMarkingAllowed(start, "17:44"), false);
assert.equal(getPresenceSessionPhase(start, end, "17:44"), "upcoming");

// Exactement à l'ouverture
assert.equal(isPresenceMarkingAllowed(start, "17:45"), true);
assert.equal(getPresenceSessionPhase(start, end, "17:45"), "active");

// Pendant le cours
assert.equal(isPresenceMarkingAllowed(start, "18:30"), true);
assert.equal(getPresenceSessionPhase(start, end, "18:30"), "active");

// Après la fin (même jour)
assert.equal(isPresenceMarkingAllowed(start, "19:30"), true);
assert.equal(getPresenceSessionPhase(start, end, "19:30"), "ended");

// Séance en cours (ex. 21:00–22:00 à 21:06)
assert.equal(isPresenceMarkingAllowed("21:00", "21:06"), true);
assert.equal(getPresenceSessionPhase("21:00", "22:00", "21:06"), "active");

// Cours près de minuit
assert.equal(isPresenceMarkingAllowed("00:10", "23:56"), true);
assert.equal(isPresenceMarkingAllowed("00:10", "00:05"), true);
assert.equal(isPresenceMarkingAllowed("00:10", "23:00"), false);

const clock = studioNowClock();
assert.match(clock.ymd, /^\d{4}-\d{2}-\d{2}$/);
assert.match(clock.timeHm, /^\d{2}:\d{2}$/);

console.log("presence-window: ok", clock);
