import { isOfficialUrl } from "./policy.mjs";

const encoder = new TextEncoder();
async function mac(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)))).map(b => b.toString(16).padStart(2, "0")).join("");
}
function payload(pack) {
  if (!pack || pack.v !== 1 || !["nepal", "uttarakhand", "himachal"].includes(pack.region) || !Number.isSafeInteger(pack.expiresAt) || !Array.isArray(pack.cards) || !pack.cards.length || pack.cards.length > 4) throw Error("Invalid research pack. Research the district again.");
  const cards = pack.cards.map(card => {
    if (!card || typeof card.title !== "string" || !card.title.trim() || card.title.length > 160 || typeof card.summary !== "string" || card.summary.length > 1000 || !isOfficialUrl(card.sourceUrl) || card.sourceUrl.length > 2000 || !(card.publishedAt === null || typeof card.publishedAt === "string" && card.publishedAt.length <= 40) || typeof card.retrievedAt !== "string" || card.retrievedAt.length > 40) throw Error("Invalid research source. Research the district again.");
    return { title: card.title, summary: card.summary, sourceUrl: card.sourceUrl, publishedAt: card.publishedAt, retrievedAt: card.retrievedAt };
  });
  return { v: 1, region: pack.region, expiresAt: pack.expiresAt, cards };
}
/** Bind the actual Exa findings to subsequent drafting calls, without trusting browser-supplied context. */
export async function sealBriefingPack(region, cards, secret) {
  const data = payload({ v: 1, region, expiresAt: Date.now() + 60 * 60_000, cards });
  return { ...data, signature: await mac(JSON.stringify(data), secret) };
}
export async function verifyBriefingPack(pack, secret, now = Date.now()) {
  const data = payload(pack);
  if (data.expiresAt <= now || data.expiresAt > now + 61 * 60_000) throw Error("Research pack expired. Research the district again.");
  if (typeof pack.signature !== "string" || !/^[a-f0-9]{64}$/.test(pack.signature)) throw Error("Research pack is not signed.");
  const expected = await mac(JSON.stringify(data), secret);
  let diff = 0; for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ pack.signature.charCodeAt(i);
  if (diff) throw Error("Research pack changed. Research the district again.");
  return data;
}
