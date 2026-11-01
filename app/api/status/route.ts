import { configured, json, liveEnabled } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET() {
  const keys = configured();
  return json({ ok: true, mode: liveEnabled() && Object.values(keys).some(Boolean) ? "live" : "demo", provider: "Together", configured: keys, enabled: liveEnabled(), localInference: false, radioTransport: "simulated", notice: "API secrets stay on the server. Cloud AI needs internet; cached knowledge and outgoing requests can work offline." });
}
