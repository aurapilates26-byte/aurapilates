/**
 * Assertions sans vitest (évite npx install).
 * Usage: npx tsx lib/admin/planning-operational-scopes.selftest.ts
 */
import assert from "node:assert/strict";
import {
  isAdminOperationalSlotInScope,
  resolveAdminOperationalScopesForDate,
} from "./planning-operational-scopes";

const published = { periodStartYmd: "2026-07-27", periodEndYmd: "2026-08-02" };
const draft = { periodStartYmd: "2026-08-03", periodEndYmd: "2026-08-09" };

assert.deepEqual(resolveAdminOperationalScopesForDate("2026-07-30", published, draft), [
  "published",
]);
assert.deepEqual(resolveAdminOperationalScopesForDate("2026-08-06", published, draft), ["draft"]);
assert.deepEqual(resolveAdminOperationalScopesForDate("2026-08-13", published, draft), []);
assert.deepEqual(resolveAdminOperationalScopesForDate("2026-08-06", published, null), []);

assert.equal(
  isAdminOperationalSlotInScope(
    { isDraft: true, anchorSessionYmd: "2026-08-06" },
    ["draft"],
    published,
    draft,
  ),
  true,
);
assert.equal(
  isAdminOperationalSlotInScope(
    { isDraft: false, anchorSessionYmd: "2026-07-30" },
    ["draft"],
    published,
    draft,
  ),
  false,
);

console.log("planning-operational-scopes: ok");
