import { guard, json, liveEnabled, RouteError } from "@/lib/server/http";

export const dynamic = "force-dynamic";
const MAX_FILE_BYTES = 1_000_000;
const MAX_MULTIPART_BYTES = MAX_FILE_BYTES + 16_384;
const FORMATS: Record<string, string> = {
  "audio/webm": "webm", "video/webm": "webm", "audio/ogg": "ogg",
  "audio/mp4": "m4a", "video/mp4": "mp4", "audio/x-m4a": "m4a",
  "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/wav": "wav", "audio/x-wav": "wav",
};

/** Bound the entire upload before parsing multipart data, including streamed requests. */
async function audioForm(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data;")) throw new RouteError("Upload audio as multipart form data.", 415);
  if (Number(request.headers.get("content-length") ?? 0) > MAX_MULTIPART_BYTES) throw new RouteError("Audio must be 1 MB or smaller.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RouteError("An audio file is required.");
  let total = 0;
  const parts: Uint8Array[] = [];
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    total += part.value.byteLength;
    if (total > MAX_MULTIPART_BYTES) { await reader.cancel(); throw new RouteError("Audio must be 1 MB or smaller.", 413); }
    parts.push(part.value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  try { return await new Response(bytes, { headers: { "Content-Type": contentType } }).formData(); }
  catch { throw new RouteError("The audio upload could not be read."); }
}

export async function POST(request: Request) {
  const provider = "OpenAI · gpt-transcribe";
  try {
    guard(request, "transcribe", 10);
    const key = process.env.OPENAI_API_KEY;
    if (!key || !liveEnabled()) return json({ ok: false, mode: "demo", provider, text: "", configured: Boolean(key), error: "Voice transcription is not connected yet. Add the OpenAI server key and enable live AI, or type your message." }, 503);
    const form = await audioForm(request);
    const file = form.get("file");
    if (!file || typeof file === "string" || !file.size) throw new RouteError("A nonempty audio file is required.");
    if (file.size > MAX_FILE_BYTES) throw new RouteError("Audio must be 1 MB or smaller.", 413);
    const type = file.type.toLowerCase().split(";")[0].trim();
    const extension = FORMATS[type];
    if (!extension) throw new RouteError("Use a WebM, Ogg, MP4, MP3 or WAV audio recording.", 415);
    const duration = form.get("durationSeconds");
    if (duration !== null && (!Number.isFinite(Number(duration)) || Number(duration) <= 0 || Number(duration) > 15)) throw new RouteError("Record a clip of 15 seconds or less.");
    const body = new FormData();
    body.set("file", new File([await file.arrayBuffer()], `together-message.${extension}`, { type }));
    body.set("model", "gpt-transcribe");
    body.set("response_format", "json");
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { "Authorization": `Bearer ${key}` }, body, signal: AbortSignal.timeout(25_000) });
    if (!response.ok) throw new RouteError(response.status === 429 ? "Voice transcription is busy. Please type your message or retry shortly." : "Voice transcription could not complete. Please type your message or check the OpenAI configuration.", response.status === 429 ? 429 : 502);
    const data: any = await response.json();
    if (typeof data.text !== "string" || !data.text.trim()) throw new RouteError("No speech was recognized. Please type your message or try a clearer recording.", 502);
    return json({ ok: true, mode: "live", provider, configured: true, text: data.text.trim().slice(0, 4000), notice: "Check the transcript before sending. Voice recognition may make mistakes in names, numbers and regional languages." });
  } catch (error) {
    return json({ ok: false, mode: "demo", provider, text: "", error: error instanceof RouteError ? error.message : "Voice transcription timed out. Please type your message or try again." }, error instanceof RouteError ? error.status : 502);
  }
}
