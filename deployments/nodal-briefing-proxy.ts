export const dynamic = "force-dynamic";
const origin = "https://together-relief.shiiim.chatgpt.site";
const route = "briefing";
function failed(code: string, status = 503, upstreamStatus?: number) {
  console.warn("Together proxy", { route, code, ...(upstreamStatus === undefined ? {} : { upstreamStatus }) });
  return Response.json({ ok: false, error: code === "backend_not_configured" ? "The nodal centre connection is not configured." : "The community hub is unavailable. Retry shortly.", code, route, ...(upstreamStatus === undefined ? {} : { upstreamStatus }) }, { status, headers: { "cache-control": "no-store" } });
}
async function forward(request: Request) {
  const incomingOrigin = request.headers.get("origin");
  if (incomingOrigin && incomingOrigin !== new URL(request.url).origin)
    return Response.json({ ok: false, error: "Use this dashboard from its own origin." }, { status: 403, headers: { "cache-control": "no-store" } });
  const incoming = new URL(request.url);
  const key = process.env.TOGETHER_SERVICE_TOKEN;
  const target = (process.env.TOGETHER_BACKEND_ORIGIN || origin).replace(/\/$/, "");
  let targetUrl: URL;
  try { targetUrl = new URL(target); } catch { return failed("backend_invalid_origin"); }
  const localPreview = targetUrl.protocol === "http:" && ["127.0.0.1", "localhost"].includes(targetUrl.hostname);
  if (target !== origin && !localPreview) return failed("backend_invalid_origin");
  if (!key && !localPreview) return failed("backend_not_configured");
  const headers: Record<string, string> = { "content-type": "application/json", origin: target };
  // Private Sites service access stays on the server and goes only to the bound PWA.
  if (key && target === origin) headers["OAI-Sites-Authorization"] = "Bearer " + key;
  let body: Uint8Array | undefined;
  if (request.method === "POST") {
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ ok: false, error: "Request body required." }, { status: 400 });
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      size += chunk.value.length;
      if (size > 16384) { await reader.cancel(); return Response.json({ ok: false, error: "Request too large." }, { status: 413 }); }
      chunks.push(chunk.value);
    }
    body = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  }
  try {
    const response = await fetch(target + "/api/briefing" + incoming.search, {
      method: request.method, headers, body: body?.buffer as ArrayBuffer | undefined,
      signal: AbortSignal.timeout(35000), redirect: "manual",
    });
    if (response.status >= 300 && response.status < 400) return failed("backend_auth_redirect", 502, response.status);
    if (!response.headers.get("content-type")?.includes("application/json")) return failed(response.status === 401 || response.status === 403 ? "backend_access_denied" : "backend_non_json", 502, response.status);
    return new Response(await response.text(), { status: response.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch (error) {
    return failed(error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "backend_timeout" : "backend_fetch_failed");
  }
}
export const GET = forward;
export const POST = forward;
