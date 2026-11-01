export const NODES = [
  { id: "school", name: "School hub", code: "SCHOOL-01", place: "Community school" },
  { id: "riverside", name: "Riverside hub", code: "RIVER-02", place: "Riverside community centre" },
  { id: "health", name: "Health post", code: "HEALTH-03", place: "Health centre" },
  { id: "hill", name: "Hill shelter", code: "HILL-04", place: "Upper neighbourhood shelter" },
];
export const CATEGORIES = ["water", "food", "shelter", "rescue", "medical", "supplies", "information"];
export const STATUS = ["received", "acknowledged", "assigned", "completed"];
export function nodeId(value) { if (!NODES.some(node => node.id === value)) throw new Error("Choose school, riverside, health or hill."); return value; }
function string(value, limit, label) { if (typeof value !== "string" || !value.trim() || value.trim().length > limit) throw new Error(`${label} is required and must be at most ${limit} characters.`); return value.trim(); }
function uuid(value) { if (typeof value !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value)) throw new Error("A UUID operation id is required."); return value; }
export function action(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("A request object is required.");
  const id = uuid(input.id), node = nodeId(input.node ?? "school");
  if (input.type === "update") {
    const requestId = uuid(input.requestId);
    if (!["acknowledged", "assigned", "completed"].includes(input.status)) throw new Error("Choose acknowledged, assigned or completed.");
    return { type: "update", id, node, requestId, status: input.status };
  }
  const name = string(input.name, 60, "Name");
  if (input.type === "message") return { type: "message", id, node, name, message: string(input.message, 800, "Message") };
  const people = Number(input.people);
  if (!Number.isInteger(people) || people < 1 || people > 99) throw new Error("People must be a whole number from 1 to 99.");
  const location = string(input.location, 120, "Location");
  if (input.type === "checkin") return { type: "checkin", id, node, name, people, location };
  if (input.type !== "request") throw new Error("Choose request, checkin, message or update.");
  const category = String(input.category ?? "information").toLowerCase();
  if (!CATEGORIES.includes(category)) throw new Error("Choose an available resource category.");
  return { type: "request", id, node, name, people, location, category, message: string(input.message, 800, "Message") };
}
export function nextStatus(current) { const i = STATUS.indexOf(current); return i < 0 || i >= STATUS.length - 1 ? null : STATUS[i + 1]; }
