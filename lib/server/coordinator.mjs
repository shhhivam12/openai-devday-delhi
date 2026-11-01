import { verifyBriefingPack } from "./briefing-pack.mjs";

export const TASKS = {
  brief: "Summarise the selected documents in plain language for a coordinator. Separate dated findings from information that still needs checking. Cite source numbers [1], [2] beside supported claims.",
  translate: "Draft a short Hindi community information message using only the selected documents. Mark it DRAFT — coordinator review required. Retain issue dates and source numbers. Do not turn historical guidance into a current warning. Aim for 100 words.",
  gaps: "Identify what these selected documents do NOT establish, and produce a short checklist for a coordinator to verify with the relevant authority. Cite the documents where useful. Never fill missing facts with guesses.",
  handover: "Write ONLY 3 to 5 neutral follow-up questions for the incoming coordinator. The server will display the recorded counts separately. Do not restate or interpret counts as factual conditions. Check-ins are self-reported resident records, not staff attendance. Zero check-ins does not establish that no people or staff are present. A missing category does not establish no need. Do not infer availability, priority, safe routes, identities or dispatch. All counts describe a demonstration room.",
  chat: "Answer the coordinator's question using the selected source excerpts and aggregate exercise counts. Cite source numbers beside document claims. Ask for verification when evidence is missing.",
};
export async function coordinatorContext(body, secret) {
  if (!Object.hasOwn(TASKS, body.task)) throw Error("Choose a supported workspace action.");
  const counts = body.counts;
  const integer = value => Number.isSafeInteger(value) && value >= 0 && value <= 100000;
  if (!counts || ![counts.open, counts.checkedIn, counts.messages].every(integer) || !counts.byCategory || typeof counts.byCategory !== "object") throw Error("Valid exercise-room counts are required.");
  const byCategory = Object.fromEntries(["water", "food", "shelter", "rescue", "medical", "supplies", "information"].map(key => [key, counts.byCategory[key] ?? 0]));
  if (!Object.values(byCategory).every(integer)) throw Error("Invalid request counts.");
  const safeCounts = { open: counts.open, checkedIn: counts.checkedIn, messages: counts.messages, byCategory, categoryScope: "Category counts cover loaded request records only and can be a subset of the open total." };
  let sources = [];
  let region = "Exercise room";
  if (body.task !== "handover") {
    if (!secret) throw Error("Exa research is not configured.");
    const pack = await verifyBriefingPack(body.pack, secret);
    region = pack.region;
    if (!Array.isArray(body.selected) || !body.selected.length || body.selected.length > 4 || body.selected.some(i => !Number.isInteger(i) || i < 0 || i >= pack.cards.length) || new Set(body.selected).size !== body.selected.length) throw Error("Select at least one research source.");
    sources = body.selected.map(i => pack.cards[i]);
  }
  return { task: body.task, counts: safeCounts, sources, region, instruction: TASKS[body.task] };
}
