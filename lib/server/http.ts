import { requiredText } from "./policy.mjs";

export class RouteError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
const windows = new Map<string, { count: number; end: number }>();
const MAX_BODY_BYTES = 16_384;

export function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export function liveEnabled() { return process.env.TOGETHER_LIVE_AI === "true"; }
export function configured() { return { openai: Boolean(process.env.OPENAI_API_KEY), cerebras: Boolean(process.env.CEREBRAS_API_KEY), exa: Boolean(process.env.EXA_API_KEY) }; }

export function guard(request: Request, bucket: string, limit = 20) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new RouteError("Use Together from its own app origin.", 403);
  const identity = request.headers.get("oai-authenticated-user-id") || request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "preview";
  const now = Date.now();
  const key = `${bucket}:${identity}`;
  if (windows.size > 2000) for (const [name, window] of windows) if (window.end < now) windows.delete(name);
  const window = windows.get(key);
  if (!window || window.end < now) windows.set(key, { count: 1, end: now + 300_000 });
  else { if (window.count >= limit) throw new RouteError("Demo request limit reached. Please try again in five minutes.", 429); window.count++; }
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new RouteError("Send JSON with Content-Type: application/json.", 415);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) throw new RouteError("Request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RouteError("JSON body is required.");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.byteLength; if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new RouteError("Request is too large.", 413); } chunks.push(chunk.value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("object required");
    return parsed;
  } catch (error) { if (error instanceof RouteError) throw error; throw new RouteError("A valid JSON object is required."); }
}

export function text(value: unknown, max = 1200, label = "message") { try { return requiredText(value, max, label); } catch (error) { throw new RouteError(error instanceof Error ? error.message : "Invalid text."); } }

export async function providerFetch(url: string, key: string, body?: unknown, timeoutMs = 20_000): Promise<any> {
  const response = await fetch(url, { method: body === undefined ? "GET" : "POST", headers: { "Authorization": `Bearer ${key}`, ...(body === undefined ? {} : { "Content-Type": "application/json" }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new RouteError(response.status === 429 ? "The AI provider is busy. Please retry shortly." : "The AI provider could not complete this request. Check its model access and configuration.", response.status === 429 ? 429 : 502);
  return response.json();
}

export function failure(error: unknown, provider: string) {
  const status = error instanceof RouteError ? error.status : 502;
  return json({ ok: false, mode: "demo", provider, error: error instanceof RouteError ? error.message : "The request timed out or could not be completed. Your saved requests remain available.", configured: configured() }, status);
}
