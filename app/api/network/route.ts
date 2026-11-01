import { env } from "cloudflare:workers";
import { action, nodeId, NODES, STATUS } from "@/lib/network/policy.mjs";
import { guard, json, readBody, RouteError } from "@/lib/server/http";
export const dynamic = "force-dynamic";

function database() {
  if (!env.DB)
    throw new RouteError(
      "The shared demo database is not connected. Keep this request on your device and retry.",
      503,
    );
  return env.DB;
}
function failed(error: unknown) {
  const status = error instanceof RouteError ? error.status : 503;
  return json(
    {
      ok: false,
      mode: "shared-demo",
      error:
        error instanceof RouteError
          ? error.message
          : "The shared demo is temporarily unavailable. Your saved request can be retried.",
      connected: false,
    },
    status,
  );
}
function requestRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    node: row.node,
    name: row.name,
    category: row.category,
    people: row.people,
    location: row.location,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
function recordRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    node: row.node,
    name: row.name,
    people: row.people,
    location: row.location,
    message: row.message,
    createdAt: row.created_at,
  };
}

export async function GET(request: Request) {
  try {
    guard(request, "network-read", 240);
    const url = new URL(request.url);
    let node: string;
    try {
      node = nodeId(url.searchParams.get("node") || "school");
    } catch (error) {
      throw new RouteError((error as Error).message);
    }
    const db = database();
    const [requests, checkins, messages, summary] = await db.batch<
      Record<string, unknown>
    >([
      db
        .prepare(
          "SELECT * FROM network_requests WHERE node = ? ORDER BY created_at DESC LIMIT 100",
        )
        .bind(node),
      db
        .prepare(
          "SELECT * FROM network_checkins WHERE node = ? ORDER BY created_at DESC LIMIT 100",
        )
        .bind(node),
      db
        .prepare(
          "SELECT * FROM network_messages WHERE node = ? ORDER BY created_at DESC LIMIT 100",
        )
        .bind(node),
      db
        .prepare(
          "SELECT (SELECT COUNT(*) FROM network_requests WHERE node = ?) AS requests, (SELECT COUNT(*) FROM network_requests WHERE node = ? AND status != 'completed') AS open, (SELECT COALESCE(SUM(people),0) FROM network_checkins WHERE node = ?) AS checked_in, (SELECT COUNT(*) FROM network_messages WHERE node = ?) AS messages",
        )
        .bind(node, node, node, node),
    ]);
    const counts = summary.results?.[0] ?? {};
    return json({
      ok: true,
      mode: "shared-demo",
      connected: true,
      node,
      nodes: NODES,
      requests: requests.results.map(requestRow),
      checkins: checkins.results.map(recordRow),
      messages: messages.results.map(recordRow),
      counts: {
        requests: Number(counts.requests || 0),
        open: Number(counts.open || 0),
        checkedIn: Number(counts.checked_in || 0),
        messages: Number(counts.messages || 0),
      },
      updatedAt: new Date().toISOString(),
      transport:
        "Online demo sync. Physical Wi-Fi/LoRa transport is simulated.",
    });
  } catch (error) {
    return failed(error);
  }
}

export async function POST(request: Request) {
  try {
    guard(request, "network-write", 50);
    const body = await readBody(request);
    let value: ReturnType<typeof action>;
    try {
      value = action(body);
    } catch (error) {
      throw new RouteError((error as Error).message);
    }
    const db = database();
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    const fingerprint = Array.from(digest)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const prior = await db
      .prepare("SELECT fingerprint FROM network_operations WHERE id = ?")
      .bind(value.id)
      .first<{ fingerprint: string }>();
    if (prior) {
      if (prior.fingerprint !== fingerprint)
        throw new RouteError(
          "This operation id was already used for different data.",
          409,
        );
      return json({
        ok: true,
        mode: "shared-demo",
        connected: true,
        id: value.id,
        duplicate: true,
      });
    }
    const now = new Date().toISOString();
    const op = db
      .prepare(
        "INSERT OR IGNORE INTO network_operations (id,fingerprint,created_at) VALUES (?,?,?)",
      )
      .bind(value.id, fingerprint, now);
    let statement: D1PreparedStatement;
    if (value.type === "request")
      statement = db
        .prepare(
          "INSERT OR IGNORE INTO network_requests (id,node,name,category,people,location,message,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'received',?,?)",
        )
        .bind(
          value.id,
          value.node,
          value.name,
          value.category,
          value.people,
          value.location,
          value.message,
          now,
          now,
        );
    else if (value.type === "checkin")
      statement = db
        .prepare(
          "INSERT OR IGNORE INTO network_checkins (id,node,name,people,location,created_at) VALUES (?,?,?,?,?,?)",
        )
        .bind(
          value.id,
          value.node,
          value.name,
          value.people,
          value.location,
          now,
        );
    else if (value.type === "message")
      statement = db
        .prepare(
          "INSERT OR IGNORE INTO network_messages (id,node,name,message,created_at) VALUES (?,?,?,?,?)",
        )
        .bind(value.id, value.node, value.name, value.message, now);
    else {
      const current = await db
        .prepare(
          "SELECT status FROM network_requests WHERE id = ? AND node = ?",
        )
        .bind(value.requestId, value.node)
        .first<{ status: string }>();
      if (!current)
        throw new RouteError(
          "This request is no longer available at this node.",
          404,
        );
      if (STATUS.indexOf(value.status) < STATUS.indexOf(current.status))
        throw new RouteError(
          "Requests cannot move backwards. Refresh the desk.",
          409,
        );
      statement = db
        .prepare(
          "UPDATE network_requests SET status = ?, updated_at = ? WHERE id = ? AND node = ? AND (CASE status WHEN 'received' THEN 0 WHEN 'acknowledged' THEN 1 WHEN 'assigned' THEN 2 ELSE 3 END) <= ?",
        )
        .bind(
          value.status,
          now,
          value.requestId,
          value.node,
          STATUS.indexOf(value.status),
        );
    }
    await db.batch([op, statement]);
    return json(
      {
        ok: true,
        mode: "shared-demo",
        connected: true,
        id: value.id,
        ...(value.type === "update"
          ? { requestId: value.requestId, status: value.status }
          : {}),
        createdAt: now,
        notice:
          "Saved to the shared exercise. No real emergency service was contacted.",
      },
      201,
    );
  } catch (error) {
    return failed(error);
  }
}
