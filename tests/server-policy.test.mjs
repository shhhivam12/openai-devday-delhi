import test from "node:test";
import assert from "node:assert/strict";
import { demoClassification, isOfficialUrl, normalizeSources, requiredText, responseText } from "../lib/server/policy.mjs";

test("official source checks reject lookalike domains and unsafe schemes", () => {
  assert.equal(isOfficialUrl("https://sachet.ndma.gov.in/"), true);
  assert.equal(isOfficialUrl("https://usdma.uk.gov.in/updates"), true);
  for (const url of ["https://ndma.gov.in.attacker.example/", "http://ndma.gov.in/", "javascript:alert(1)", "https://ndma.gov.in@attacker.example/", "https://attacker.example/?next=https://ndma.gov.in"]) assert.equal(isOfficialUrl(url), false, url);
});
test("sources exclude unapproved URLs and duplicates", () => {
  assert.deepEqual(normalizeSources([{ url: "https://sachet.ndma.gov.in/", title: "SACHET" }, { url: "https://sachet.ndma.gov.in/", title: "Duplicate" }, { url: "https://example.com/", title: "Other" }]), [{ url: "https://sachet.ndma.gov.in/", title: "SACHET" }]);
});
test("explicit SOS stays urgent even when resource category is water", () => {
  const result = demoClassification("SOS: 4 people trapped, need water");
  assert.equal(result.category, "water"); assert.equal(result.priority, "urgent"); assert.equal(result.needsAttention, true);
  assert.equal(demoClassification("हम फंसे हैं, पानी चाहिए").priority, "urgent");
});
test("routine requests are not presented as emergency triage", () => {
  assert.equal(demoClassification("What is Together?").priority, "normal");
  assert.equal(demoClassification("We need shelter").category, "shelter");
});
test("required text rejects missing and oversize inputs", () => {
  assert.throws(() => requiredText(null)); assert.throws(() => requiredText(" "));
  assert.throws(() => requiredText("x".repeat(1201))); assert.equal(requiredText(" hello "), "hello");
});
test("Responses parser returns only assistant output text, never reasoning", () => {
  assert.equal(responseText({ output: [{ type: "reasoning", content: [{ type: "output_text", text: "hidden" }] }, { type: "message", content: [{ type: "output_text", text: "Visible answer" }] }] }), "Visible answer");
  assert.equal(responseText({}), "");
});
