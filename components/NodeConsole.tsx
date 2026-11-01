"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  Clock3,
  Droplets,
  ExternalLink,
  Home,
  Globe2,
  MapPin,
  MessageCircle,
  Package,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import "./node-console.css";
import CoordinatorWorkspace from "./CoordinatorWorkspace";

type RequestItem = {
  id: string;
  node: string;
  name: string;
  category: string;
  people: number;
  location: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
type MessageItem = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};
type Checkin = {
  id: string;
  name: string;
  people: number;
  location: string;
  createdAt: string;
};
type NodeInfo = { id: string; name: string; code: string; place: string };
type Snapshot = {
  ok: boolean;
  error?: string;
  connected?: boolean;
  node: string;
  nodes: NodeInfo[];
  requests: RequestItem[];
  messages: MessageItem[];
  checkins: Checkin[];
  counts: {
    requests: number;
    open: number;
    checkedIn: number;
    messages: number;
  };
  updatedAt: string;
};
const NODES: NodeInfo[] = [
  {
    id: "school",
    name: "School hub",
    code: "SCHOOL-01",
    place: "Community school",
  },
  {
    id: "riverside",
    name: "Riverside hub",
    code: "RIVER-02",
    place: "Riverside community centre",
  },
  {
    id: "health",
    name: "Health post",
    code: "HEALTH-03",
    place: "Health centre",
  },
  {
    id: "hill",
    name: "Hill shelter",
    code: "HILL-04",
    place: "Upper neighbourhood shelter",
  },
];
const empty: Snapshot = {
  ok: false,
  node: "school",
  nodes: NODES,
  requests: [],
  messages: [],
  checkins: [],
  counts: { requests: 0, open: 0, checkedIn: 0, messages: 0 },
  updatedAt: "",
};
const nextStatus: Record<string, string> = {
  received: "acknowledged",
  acknowledged: "assigned",
  assigned: "completed",
};
const actionLabel: Record<string, string> = {
  received: "Acknowledge",
  acknowledged: "Assign help",
  assigned: "Complete",
};
const label: Record<string, string> = {
  water: "Water",
  food: "Food",
  shelter: "Shelter",
  rescue: "Rescue",
  medical: "Medical",
  supplies: "Supplies",
  information: "Information",
};
function time(value: string) {
  return value
    ? new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
}
function RequestIcon({ category }: { category: string }) {
  return category === "water" ? (
    <Droplets size={21} />
  ) : category === "shelter" ? (
    <Home size={21} />
  ) : category === "food" || category === "supplies" ? (
    <Package size={21} />
  ) : (
    <CircleHelp size={21} />
  );
}
export default function NodeConsole({
  appUrl = "https://together-relief.shiiim.chatgpt.site",
}: {
  appUrl?: string;
}) {
  const [node, setNode] = useState("school");
  const [snapshot, setSnapshot] = useState<Snapshot>(empty);
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("open");
  const [message, setMessage] = useState("");
  const [stock, setStock] = useState([24, 12, 18]);
  const selected = NODES.find((n) => n.id === node)!;
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/network?node=" + encodeURIComponent(node),
        { cache: "no-store" },
      );
      const data = (await response.json()) as Snapshot;
      if (!response.ok || !data.ok)
        throw Error(data.error || "Shared demo unavailable");
      setSnapshot(data);
      setConnected(true);
      setError("");
    } catch (e) {
      setConnected(false);
      setError(
        e instanceof Error ? e.message : "Could not reach the shared demo",
      );
    } finally {
      setLoading(false);
    }
  }, [node]);
  useEffect(() => {
    setSnapshot({ ...empty, node });
    setLoading(true);
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [node, refresh]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  async function update(item: RequestItem) {
    const status = nextStatus[item.status];
    if (!status) return;
    setBusy(item.id);
    try {
      const response = await fetch("/api/network", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "update",
          id: crypto.randomUUID(),
          node,
          requestId: item.id,
          status,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok)
        throw Error(data.error || "Could not update request");
      setToast(
        status === "assigned"
          ? "Exercise assignment recorded. No real responder dispatched."
          : "Request " + status,
      );
      await refresh();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy("");
    }
  }
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    if (message.trim().length > 800) { setToast("Shorten this draft to 800 characters before sharing."); return; }
    setBusy("message");
    try {
      const response = await fetch("/api/network", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "message",
          id: crypto.randomUUID(),
          node,
          name: selected.name + " coordinator",
          message,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok)
        throw Error(data.error || "Could not send update");
      setMessage("");
      await refresh();
      setToast("Update shared with this exercise node.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Could not send update");
    } finally {
      setBusy("");
    }
  }
  const requests = snapshot.requests.filter(
    (r) =>
      filter === "all" ||
      (filter === "completed"
        ? r.status === "completed"
        : r.status !== "completed"),
  );
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ mode: "exercise", ...snapshot }, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "together-" + node + "-exercise.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="node-app">
      <aside className="node-sidebar">
        <a className="node-brand" href="/">
          <img src="/brand/mark-mono.svg" alt="" />
          <strong>
            together
            <span className="node-brand-dot" aria-hidden="true" />
          </strong>
        </a>
        <span className="node-side-label">NODE CONSOLE</span>
        <nav aria-label="Nodal centre navigation">
          {[
            { id: "overview", name: "Overview", icon: Activity },
            { id: "requests", name: "Requests", icon: Bell },
            { id: "community", name: "Community", icon: MessageCircle },
            { id: "copilot", name: "AI workspace", icon: Globe2 },
            { id: "resources", name: "Resources", icon: Package },
          ].map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => setView(id)}
            >
              <Icon size={19} />
              <span>{name}</span>
              {id === "requests" && snapshot.counts.open > 0 && (
                <b>{snapshot.counts.open}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="node-sidebar-bottom">
          <Radio size={27} />
          <strong>{selected.code}</strong>
          <span>Shared exercise room</span>
          <p>
            Online sync in this demo.
            <br />
            LoRa hardware is illustrated.
          </p>
          <a href={appUrl} target="_blank" rel="noreferrer">
            Open mobile app <ExternalLink size={14} />
          </a>
        </div>
        <a
          className="node-doc-link"
          href={appUrl + "/project"}
          target="_blank"
          rel="noreferrer"
        >
          <ShieldCheck size={15} /> Project evidence <ArrowRight size={14} />
        </a>
      </aside>
      <div className="node-main">
        <header className="node-header">
          <div className="node-breadcrumb">
            <span>Nepal exercise</span>
            <ChevronRight size={14} />
            <strong>{selected.name}</strong>
          </div>
          <div className="node-header-actions">
            <button
              className="node-brief-trigger"
              aria-label="Open AI workspace"
              onClick={() => setView("copilot")}
            >
              <Globe2 size={15} />
              <span>AI workspace</span>
            </button>
            <span
              className={"node-live " + (!connected ? "node-disconnected" : "")}
            >
              {connected ? <Wifi size={13} /> : <WifiOff size={13} />}{" "}
              {loading
                ? "Connecting"
                : connected
                  ? "Shared demo online"
                  : "Sync unavailable"}
            </span>
            <span className="node-demo">DEMO</span>
            <button
              className="node-round"
              onClick={refresh}
              aria-label="Refresh shared requests"
            >
              <RefreshCw size={18} />
            </button>
            <span className="node-profile">NC</span>
          </div>
        </header>
        <main className="node-content">
          <div className="node-titlebar">
            <div>
              <span className="node-eyebrow">{selected.code}</span>
              <h1>
                {view === "copilot" ? "Your coordination copilot." : view === "community"
                  ? "Community updates"
                  : view === "resources"
                    ? "Resource board"
                    : view === "requests"
                      ? "Help requests"
                      : "Your relief centre."}
              </h1>
            </div>
            <select
              aria-label="Select nodal centre"
              value={node}
              onChange={(e) => setNode(e.target.value)}
            >
              {NODES.map((n) => (
                <option value={n.id} key={n.id}>
                  {n.name} · {n.code}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <div className="node-error" role="status">
              <WifiOff size={17} />
              <span>{error}</span>
              <button onClick={refresh}>Retry</button>
            </div>
          )}
          <div hidden={view !== "copilot"}>
            <CoordinatorWorkspace key={node} nodeName={selected.name} counts={{ open: snapshot.counts.open, checkedIn: snapshot.counts.checkedIn, messages: snapshot.counts.messages, byCategory: snapshot.requests.filter(r => r.status !== "completed").reduce<Record<string, number>>((total, r) => { total[r.category] = (total[r.category] || 0) + 1; return total; }, {}) }} onUseDraft={text => { setMessage(text); setView("community"); setToast("Draft added to the community composer. Review and edit before sending."); }}/>
          </div>
          {view === "overview" && <section className="node-copilot-entry" aria-label="Coordinator research and drafting"><span className="node-copilot-entry-icon"><Globe2 size={25}/></span><div><h2>Turn evidence into a useful update.</h2><p>Research with Exa. Draft with Cerebras. Review before sharing.</p></div><button onClick={() => setView("copilot")}>Open AI workspace <ArrowRight size={17}/></button></section>}
          {(view === "overview" || view === "requests") && (
            <>
              <section
                className="node-stats"
                aria-label="Shared exercise counts"
              >
                <div>
                  <span className="node-stat-icon blue">
                    <Bell size={21} />
                  </span>
                  <span>Open requests</span>
                  <strong>
                    {snapshot.counts.open.toString().padStart(2, "0")}
                  </strong>
                  <small>Awaiting completion</small>
                </div>
                <div>
                  <span className="node-stat-icon cyan">
                    <ShieldCheck size={21} />
                  </span>
                  <span>People checked in</span>
                  <strong>
                    {snapshot.counts.checkedIn.toString().padStart(2, "0")}
                  </strong>
                  <small>Self-reported in this room</small>
                </div>
                <div>
                  <span className="node-stat-icon violet">
                    <MessageCircle size={21} />
                  </span>
                  <span>Community updates</span>
                  <strong>
                    {snapshot.counts.messages.toString().padStart(2, "0")}
                  </strong>
                  <small>Shared across devices</small>
                </div>
                <div>
                  <span className="node-stat-icon dark">
                    <Radio size={21} />
                  </span>
                  <span>Selected node</span>
                  <strong className="node-stat-name">{selected.name}</strong>
                  <small>{selected.code}</small>
                </div>
              </section>
              <div className="node-workspace">
                <section className="node-panel node-requests">
                  <div className="node-panel-title">
                    <h2>People need a hand.</h2>
                    <button
                      className="node-icon-button"
                      aria-label="Export exercise requests"
                      onClick={exportData}
                    >
                      <ArrowDownToLine size={18} />
                    </button>
                  </div>
                  <div className="node-filters">
                    {[
                      ["open", "Open"],
                      ["completed", "Completed"],
                      ["all", "All"],
                    ].map(([key, name]) => (
                      <button
                        key={key}
                        className={filter === key ? "selected" : ""}
                        onClick={() => setFilter(key)}
                      >
                        {name}
                      </button>
                    ))}
                    <span>{requests.length} requests</span>
                  </div>
                  <div className="node-request-list">
                    {requests.length ? (
                      requests.map((item) => (
                        <article className="node-request" key={item.id}>
                          <div className={"node-request-icon " + item.category}>
                            <RequestIcon category={item.category} />
                          </div>
                          <div className="node-request-detail">
                            <div>
                              <strong>{item.name}</strong>
                              <span className={"node-status " + item.status}>
                                {item.status}
                              </span>
                            </div>
                            <p>{item.message}</p>
                            <span className="node-request-location">
                              <MapPin size={12} />
                              {item.location}
                              <i /> <Users size={12} />
                              {item.people} <i />
                              <Clock3 size={12} />
                              {time(item.createdAt)}
                            </span>
                          </div>
                          <button
                            className="node-action"
                            disabled={
                              busy === item.id || !nextStatus[item.status]
                            }
                            onClick={() => update(item)}
                          >
                            {busy === item.id ? (
                              "Saving…"
                            ) : item.status === "completed" ? (
                              <>
                                <CheckCheck size={16} />
                                Done
                              </>
                            ) : (
                              <>
                                {actionLabel[item.status]}
                                <ArrowRight size={14} />
                              </>
                            )}
                          </button>
                        </article>
                      ))
                    ) : (
                      <div className="node-empty">
                        <img
                          className="node-state-art"
                          src="/illustrations/coordinator-people.png"
                          alt=""
                          width={180}
                          height={180}
                        />
                        <h3>
                          {loading
                            ? "Connecting to your room…"
                            : filter === "completed"
                              ? "No completed requests yet."
                              : "Ready when someone needs you."}
                        </h3>
                        <p>
                          Open the mobile app on another device and send a demo
                          request to {selected.code}.
                        </p>
                        <a
                          className="node-primary"
                          href={appUrl + "/?node=" + node}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open mobile app <ExternalLink size={15} />
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="node-list-footer">
                    <span>
                      <span
                        className={"node-dot " + (!connected ? "offline" : "")}
                      />
                      {connected
                        ? "Synced " + time(snapshot.updatedAt)
                        : "Waiting to sync"}
                    </span>
                    <span>Refreshes every 5 seconds</span>
                  </div>
                </section>
                <aside className="node-right">
                  <section className="node-join">
                    <img
                      className="node-join-people"
                      src="/illustrations/coordinator-people.png"
                      alt=""
                      width={180}
                      height={180}
                    />
                    <span>CONNECT TO THIS DEMO</span>
                    <h2>{selected.code}</h2>
                    <p>
                      Open Together on a phone.
                      <br />
                      Choose this nodal centre.
                    </p>
                    <a
                      href={appUrl + "/?node=" + node}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Launch mobile app <ArrowRight size={16} />
                    </a>
                    <small>
                      Internet powers this hosted exercise.
                      <br />
                      Physical local Wi-Fi / LoRa is simulated.
                    </small>
                  </section>
                  <section className="node-panel node-checkins">
                    <div className="node-panel-title">
                      <h2>Safe check-ins</h2>
                      <ShieldCheck size={18} />
                    </div>
                    {snapshot.checkins.length ? (
                      snapshot.checkins.slice(0, 4).map((c) => (
                        <div className="node-checkin" key={c.id}>
                          <span>{c.name.slice(0, 1).toUpperCase()}</span>
                          <div>
                            <strong>{c.name}</strong>
                            <small>
                              {c.people} people · {c.location}
                            </small>
                          </div>
                          <Check size={15} />
                        </div>
                      ))
                    ) : (
                      <p className="node-subtle">
                        Check-ins will appear here when residents share them.
                      </p>
                    )}
                  </section>
                </aside>
              </div>
            </>
          )}
          {view === "community" && (
            <div className="node-community">
              <section className="node-panel">
                <div className="node-panel-title">
                  <h2>One room. Every voice.</h2>
                  <span className="node-count">{snapshot.messages.length}</span>
                </div>
                <div className="node-messages">
                  {snapshot.messages.length ? (
                    snapshot.messages.map((m) => (
                      <article key={m.id}>
                        <span className="node-message-avatar">
                          {m.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <strong>
                            {m.name}
                            <small>{time(m.createdAt)}</small>
                          </strong>
                          <p>{m.message}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="node-empty">
                      <img
                        className="node-state-art"
                        src="/illustrations/community-people.png"
                        alt=""
                        width={180}
                        height={180}
                      />
                      <h3>Your community starts here.</h3>
                      <p>
                        Post a short update for people in this exercise room.
                      </p>
                    </div>
                  )}
                </div>
                <form className="node-compose" onSubmit={sendMessage}>
                  <textarea
                    aria-label="Community update"
                    value={message}
                    rows={3}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share a useful update…"
                  />
                  <span className={"node-compose-count " + (message.length > 800 ? "over-limit" : "")} aria-live="polite">{message.length}/800{message.length > 800 ? " · Shorten draft" : ""}</span>
                  <button
                    type="submit"
                    aria-label="Send community update"
                    disabled={!message.trim() || message.trim().length > 800 || busy === "message"}
                  >
                    <Send size={19} />
                  </button>
                </form>
              </section>
              <section className="node-panel node-community-help">
                <Users size={30} />
                <h2>Clear. Kind. Useful.</h2>
                <p>
                  Share confirmed information. Keep personal details to a
                  minimum.
                </p>
                <span>Demo room · {selected.code}</span>
              </section>
            </div>
          )}
          {view === "resources" && (
            <>
              <div className="node-resource-note">
                <Package size={21} />
                <span>
                  Exercise planning stock. Counts are local to this dashboard
                  and do not represent available real-world supplies.
                </span>
              </div>
              <div className="node-resource-grid">
                {[
                  { name: "Blankets", icon: Package, unit: "items" },
                  {
                    name: "Water containers",
                    icon: Droplets,
                    unit: "containers",
                  },
                  { name: "Shelter spaces", icon: Home, unit: "spaces" },
                ].map((r, i) => (
                  <section className="node-panel node-stock" key={r.name}>
                    <r.icon size={30} />
                    <h2>{r.name}</h2>
                    <strong>{stock[i]}</strong>
                    <span>{r.unit} · example stock</span>
                    <div>
                      <button
                        aria-label={"Remove one " + r.name}
                        onClick={() =>
                          setStock((s) =>
                            s.map((n, j) => (j === i ? Math.max(0, n - 1) : n)),
                          )
                        }
                      >
                        −
                      </button>
                      <button
                        aria-label={"Add one " + r.name}
                        onClick={() =>
                          setStock((s) =>
                            s.map((n, j) => (j === i ? n + 1 : n)),
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
          <footer className="node-footer">
            <span>
              <ShieldCheck size={13} /> Shared exercise · human decisions
            </span>
            <span>ChatGPT Sites · Codex · OpenAI · Cerebras · Exa</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="node-toast" role="status">
          <Check size={18} />
          <span>{toast}</span>
          <button onClick={() => setToast("")} aria-label="Close notification">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
