import { demoCards } from "@/lib/server/demo";
import { configured, failure, guard, json, liveEnabled, providerFetch, readBody, RouteError } from "@/lib/server/http";
import { isOfficialUrl, normalizeSources, REGIONS } from "@/lib/server/policy.mjs";
export const dynamic = "force-dynamic";

type Region = keyof typeof REGIONS;
const completed = new Map<string, { expires: number; response: Record<string, unknown> }>();
const runs = new Map<string, { id: string; ticket: string; expires: number }>();
const encoder = new TextEncoder();

async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function ticketFor(id: string, region: string, secret: string) {
  const expires = Date.now() + 30 * 60_000;
  return `${expires}.${region}.${await signature(`${id}.${expires}.${region}`, secret)}`;
}

async function verifyTicket(id: string, ticket: string, secret: string): Promise<Region> {
  const [expiry, region, mac] = ticket.split(".");
  if (!/^\d+$/.test(expiry ?? "") || Number(expiry) < Date.now() || !Object.hasOwn(REGIONS, region ?? "") || !/^[a-f0-9]{64}$/.test(mac ?? "")) throw new RouteError("Briefing access expired. Prepare the district briefing again.", 403);
  const expected = await signature(`${id}.${expiry}.${region}`, secret);
  let difference = 0; for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ mac.charCodeAt(i);
  if (difference !== 0) throw new RouteError("This briefing ticket is invalid.", 403);
  return region as Region;
}

function normalizeRun(run: any, region: Region) {
  const sources = normalizeSources((run.output?.grounding ?? []).flatMap((entry: any) => entry.citations ?? []));
  const groundedUrls = new Set(sources.map((source: { url: string }) => source.url));
  const cards = (Array.isArray(run.output?.structured?.cards) ? run.output.structured.cards : []).filter((card: any) => typeof card.title === "string" && typeof card.summary === "string" && isOfficialUrl(card.sourceUrl) && groundedUrls.has(card.sourceUrl)).slice(0, 5).map((card: any) => ({ title: card.title.slice(0, 160), summary: card.summary.slice(0, 1000), sourceUrl: card.sourceUrl, sourceTitle: sources.find((source: { url: string }) => source.url === card.sourceUrl)?.title ?? "Official source", publishedAt: typeof card.publishedAt === "string" ? card.publishedAt.slice(0, 40) : null, retrievedAt: new Date().toISOString(), reviewStatus: "pending", kind: "research" }));
  if (!cards.length) throw new RouteError("Exa returned no supported official-source cards. Use the reference pack and retry later.", 502);
  const response = { ok: true, mode: "live", provider: "Exa Agent", configured: true, region: REGIONS[region].name, answer: `${cards.length} source-linked findings prepared for coordinator review. These findings are not an official alert or a confirmation of current shelter availability.`, cards, sources, pending: false, notice: "Web research gathered online. A coordinator must approve findings before adding them to a community’s saved pack." };
  completed.set(region, { expires: Date.now() + 60 * 60_000, response });
  return response;
}

function pending(runId: string, ticket: string) { return { ok: true, mode: "live", provider: "Exa Agent", configured: true, pending: true, runId, ticket, answer: "Exa is preparing the district briefing. Research can take a little while; the saved reference pack remains available.", sources: [], pollAfterMs: 4000 }; }

export async function POST(request: Request) {
  try {
    guard(request, "briefing", 6);
    const body = await readBody(request);
    const region = (body.region ?? "nepal") as Region;
    if (typeof region !== "string" || !Object.hasOwn(REGIONS, region)) throw new RouteError("Choose nepal, uttarakhand or himachal.");
    const key = process.env.EXA_API_KEY;
    if (!key || !liveEnabled()) return json({ ok: true, mode: "demo", provider: "Exa Agent", configured: Boolean(key), region: REGIONS[region].name, pending: false, answer: "Saved source pack preview. This is a historical/preparedness reference pack; no live web research has been performed.", cards: demoCards, sources: demoCards.map((card) => ({ title: card.sourceTitle, url: card.sourceUrl })), notice: "Add an Exa server key and enable live AI to prepare a fresh district briefing." });
    const cached = completed.get(region);
    if (cached && cached.expires > Date.now()) return json({ ...cached.response, cached: true });
    const existing = runs.get(region);
    if (existing && existing.expires > Date.now()) return json(pending(existing.id, existing.ticket));
    const selected = REGIONS[region];
    const query = `Prepare a brief disaster-readiness information pack for ${selected.name}. Today is ${new Date().toISOString().slice(0, 10)}. Search ONLY these official domains: ${selected.domains.join(", ")}. Find up to 4 authoritative preparedness documents or issued flood/weather bulletins. Preserve document issue dates. Clearly identify historical material. Return only verifiable claims supported by the linked page and a citation for every card. Do not infer current safe routes, emergency contact numbers, open shelters, resource availability or official approval. No personal data or contact enrichment. Each card needs title, a brief factual summary, sourceUrl and publishedAt (null if unknown). This is research for human review, never an official warning.`;
    const run = await providerFetch("https://api.exa.ai/agent/runs", key, { query, effort: "low", outputSchema: { type: "object", properties: { cards: { type: "array", maxItems: 4, items: { type: "object", properties: { title: { type: "string" }, summary: { type: "string" }, sourceUrl: { type: "string" }, publishedAt: { type: ["string", "null"] } }, required: ["title", "summary", "sourceUrl", "publishedAt"] } } }, required: ["cards"] } }, 25_000);
    if (run.status === "completed") return json(normalizeRun(run, region));
    if (run.status === "failed" || run.status === "cancelled" || typeof run.id !== "string" || !/^[a-zA-Z0-9_-]{1,160}$/.test(run.id)) throw new RouteError("The research provider could not prepare this briefing. Please retry later.", 502);
    const ticket = await ticketFor(run.id, region, key);
    runs.set(region, { id: run.id, ticket, expires: Date.now() + 30 * 60_000 });
    return json(pending(run.id, ticket));
  } catch (error) { return failure(error, "Exa Agent"); }
}

export async function GET(request: Request) {
  try {
    guard(request, "briefing-poll", 90);
    const key = process.env.EXA_API_KEY;
    if (!key || !liveEnabled()) return json({ ok: false, mode: "demo", provider: "Exa Agent", configured: configured().exa, error: "Live research is not enabled." }, 409);
    const params = new URL(request.url).searchParams;
    const id = params.get("runId") ?? "";
    const ticket = params.get("ticket") ?? "";
    if (!/^[a-zA-Z0-9_-]{1,160}$/.test(id)) throw new RouteError("A valid runId is required.");
    const region = await verifyTicket(id, ticket, key);
    const run = await providerFetch(`https://api.exa.ai/agent/runs/${encodeURIComponent(id)}`, key);
    if (run.status === "completed") { runs.delete(region); return json(normalizeRun(run, region)); }
    if (run.status === "failed" || run.status === "cancelled") { runs.delete(region); throw new RouteError("Research could not be completed. Please prepare the briefing again.", 502); }
    return json(pending(id, ticket));
  } catch (error) { return failure(error, "Exa Agent"); }
}
