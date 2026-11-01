import test from "node:test";
import assert from "node:assert/strict";
import { sealBriefingPack, verifyBriefingPack } from "../lib/server/briefing-pack.mjs";
import { coordinatorContext } from "../lib/server/coordinator.mjs";
const secret = "test-signing-key-not-a-provider-credential";
const cards = [{ title: "Flood preparedness", summary: "A historical preparedness document, not a current alert.", sourceUrl: "https://ndma.gov.in/example", publishedAt: "2024-01-01", retrievedAt: "2026-11-01T00:00:00Z" }, { title: "Second document", summary: "An explicitly selected second source.", sourceUrl: "https://www.unicef.org/example", publishedAt: null, retrievedAt: "2026-11-01T00:00:00Z" }];
const counts = { open: 3, checkedIn: 9, messages: 2, byCategory: { water: 2, rescue: 1 } };
test("only unmodified, unexpired server-signed research can enter the drafting context", async () => {
  const pack = await sealBriefingPack("nepal", cards, secret);
  assert.equal((await verifyBriefingPack(pack, secret)).cards.length, 2);
  await assert.rejects(verifyBriefingPack({ ...pack, cards: [{ ...cards[0], summary: "Invented current warning" }, cards[1]] }, secret), /changed/);
  await assert.rejects(verifyBriefingPack(pack, "another-key"), /changed/);
  await assert.rejects(verifyBriefingPack(pack, secret, pack.expiresAt + 1), /expired/);
  await assert.rejects(verifyBriefingPack({ ...pack, signature: undefined }, secret), /signed/);
  await assert.rejects(sealBriefingPack("nepal", [{ ...cards[0], sourceUrl: "https://untrusted.example/" }], secret), /source/);
});
test("drafts use the selected signed excerpts and exclude unselected findings", async () => {
  const pack = await sealBriefingPack("nepal", cards, secret);
  const context = await coordinatorContext({ task: "brief", counts, pack, selected: [1] }, secret);
  assert.deepEqual(context.sources, [cards[1]]);
  for (const selected of [[], [-1], [2], [0, 0], ["0"]]) await assert.rejects(coordinatorContext({ task: "brief", counts, pack, selected }, secret), /Select/);
  await assert.rejects(coordinatorContext({ task: "chat", counts, pack: null, selected: [0] }, secret), /pack/);
});
test("handover strips identities, validates counts, and requires no research pack", async () => {
  const context = await coordinatorContext({ task: "handover", counts: { ...counts, residentName: "PRIVATE", byCategory: { ...counts.byCategory, residentName: "PRIVATE" } } }, undefined);
  assert.equal(context.sources.length, 0);
  assert.equal(context.counts.byCategory.water, 2);
  assert.ok(!JSON.stringify(context).includes("PRIVATE"));
  await assert.rejects(coordinatorContext({ task: "handover", counts: { ...counts, open: -1 } }, secret), /counts/);
  await assert.rejects(coordinatorContext({ task: "dispatch", counts }, secret), /supported/);
});
