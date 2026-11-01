import test from "node:test";
import assert from "node:assert/strict";
import { guard, providerFetch, readBody, RouteError } from "../lib/server/http.ts";

test("JSON reader rejects arrays, invalid JSON, and non-JSON bodies", async () => {
  for (const body of ["[]", "null", "not json"]) {
    await assert.rejects(readBody(new Request("https://together.example/api/assist", { method: "POST", headers: { "Content-Type": "application/json" }, body })), RouteError);
  }
  await assert.rejects(readBody(new Request("https://together.example/api/assist", { method: "POST", body: "message=hello" })), (error) => error.status === 415);
});
test("JSON reader bounds streamed payloads even without Content-Length", async () => {
  const request = new Request("https://together.example/api/assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "x".repeat(17_000) }) });
  await assert.rejects(readBody(request), (error) => error.status === 413);
});
test("JSON reader accepts a bounded request object", async () => {
  const result = await readBody(new Request("https://together.example/api/assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "Need water" }) }));
  assert.deepEqual(result, { message: "Need water" });
});
test("origin checks reject another website and same-client bursts are limited", () => {
  assert.throws(() => guard(new Request("https://together.example/api/assist", { headers: { Origin: "https://other.example" } }), "origin-test"), (error) => error.status === 403);
  const request = new Request("https://together.example/api/assist", { headers: { Origin: "https://together.example", "cf-connecting-ip": "192.0.2.8" } });
  guard(request, "rate-test", 1);
  assert.throws(() => guard(request, "rate-test", 1), (error) => error.status === 429);
});
test("provider errors are sanitized instead of exposing provider response bodies", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response("sensitive provider diagnostic", { status: 401 });
  try { await assert.rejects(providerFetch("https://provider.example/", "not-a-real-key", {}), (error) => error.status === 502 && !error.message.includes("sensitive")); }
  finally { globalThis.fetch = original; }
});
