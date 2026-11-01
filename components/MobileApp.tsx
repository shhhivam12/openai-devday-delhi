"use client";
import { useEffect, useState, useRef } from "react";
import {
  LifeBuoy,
  Droplets,
  Utensils,
  Heart,
  Check,
  CheckCircle2,
  Home,
  Users,
  BookOpen,
  Sparkles,
  Send,
  ArrowUpRight,
  ArrowLeft,
  Radio,
  Wifi,
  WifiOff,
  Plus,
  MapPin,
  Bell,
  ChevronRight,
  Download,
  ShieldCheck,
  X,
  Clock,
  RefreshCw,
  MessageCircle,
  Volume2,
  Package,
  User,
  ArrowRight,
  Globe,
  Signal,
  CloudOff,
  CheckCheck,
  Settings2,
} from "lucide-react";
import { knowledge, languages } from "../lib/content";
import "./mobile-app.css";
import NeighbourhoodMap from "./NeighbourhoodMap";
import InstallApp from "./InstallApp";
type Tab = "home" | "community" | "ai" | "guides" | "alerts";
type EventRecord = {
  id: string;
  type: string;
  node: string;
  [key: string]: any;
};
const nodeNames: Record<string, string> = {
  school: "School relief hub",
  riverside: "Riverside hub",
  health: "Health post",
  hill: "Hill centre",
};
function saved<T>(key: string, fallback: T) {
  const [v, set] = useState(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const s = localStorage.getItem(key);
      if (s) set(JSON.parse(s));
    } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {}
  }, [key, v, ready]);
  return [v, set] as const;
}
export default function MobileApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [language, setLanguage] = saved("tg-language", "hi");
  const [name, setName] = saved("tg-name", "Demo family");
  const [node, setNode] = saved("tg-node", "school");
  const [queue, setQueue] = saved<EventRecord[]>("tg-outbox", []);
  const [checkin, setCheckin] = saved("tg-checkin", false);
  const [network, setNetwork] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState(true);
  const [help, setHelp] = useState(false);
  const [settings, setSettings] = useState(false);
  const [toast, setToast] = useState("");
  const [article, setArticle] = useState<(typeof knowledge)[number] | null>(
    null,
  );
  const [pack, setPack] = saved("tg-pack-ready:together-v7", false);
  const [packBusy, setPackBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [question, setQuestion] = useState("");
  const [aiProvider, setAiProvider] = useState<"cerebras" | "openai">("cerebras");
  const [ai, setAi] = useState<{ role: string; text: string; mode?: string; provider?: string }[]>(
    [],
  );
  const [busy, setBusy] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [recent, setRecent] = saved<any[]>("tg-recent", []);
  const [routing, setRouting] = saved<Record<string, string>>("tg-routing", {});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hi = language === "hi";
  const say = (s: string) => {
    setToast(s);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4500);
  };
  async function refresh() {
    try {
      const r = await fetch("/api/network?node=" + node);
      const d: any = await r.json();
      if (!r.ok || !d.ok) throw Error();
      setNetwork(d);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }
  useEffect(() => {
    const chosen = new URLSearchParams(window.location.search).get("node");
    if (chosen && nodeNames[chosen]) setNode(chosen);
  }, []);
  useEffect(() => {
    setOnline(navigator.onLine);
    const change = () => setOnline(navigator.onLine);
    window.addEventListener("online", change);
    window.addEventListener("offline", change);
    refresh();
    const i = setInterval(refresh, 6000);
    return () => {
      clearInterval(i);
      window.removeEventListener("online", change);
      window.removeEventListener("offline", change);
    };
  }, [node]);
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/sw.js")
        .then((r) => r.update())
        .catch(() => {});
  }, []);
  useEffect(() => {
    document.documentElement.lang = ["hi", "en", "ne"].includes(language)
      ? language
      : "hi";
  }, [language]);
  async function transmit(event: EventRecord) {
    try {
      const r = await fetch("/api/network", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event),
      });
      const d: any = await r.json();
      if (!r.ok || !d.ok) throw Error(d.error || "Connection unavailable");
      setQueue((q) => q.filter((e) => e.id !== event.id));
      refresh();
      return true;
    } catch {
      return false;
    }
  }
  async function enqueue(event: EventRecord) {
    setQueue((q) => [...q, event]);
    setRecent((r) =>
      [
        {
          ...event,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...r,
      ].slice(0, 8),
    );
    const ok = await transmit(event);
    say(
      ok
        ? hi
          ? "राहत केंद्र को मिल गया"
          : "Received at the nodal centre"
        : hi
          ? "फ़ोन में सुरक्षित। जुड़ने पर भेजें।"
          : "Saved on this phone. Retry when connected.",
    );
    if (ok && event.type === "request")
      fetch("/api/classify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: event.category + ": " + event.message,
        }),
      })
        .then((r) => r.json())
        .then((data: any) => {
          if (data.ok)
            setRouting((all) => ({
              ...all,
              [event.id]:
                (data.mode === "live" ? "OpenAI Decisions" : "Demo rules") +
                " · " +
                data.category,
            }));
        })
        .catch(() => {});
    return ok;
  }
  async function sync() {
    setSyncBusy(true);
    let sent = 0;
    for (const item of queue) if (await transmit(item)) sent++;
    setSyncBusy(false);
    say(`${sent} sent · ${queue.length - sent} waiting`);
  }
  async function markSafe() {
    setCheckin(true);
    await enqueue({
      id: crypto.randomUUID(),
      type: "checkin",
      node,
      name,
      people: 1,
      location: nodeNames[node],
    });
  }
  async function sendCommunity() {
    if (!message.trim()) return;
    const text = message;
    setMessage("");
    await enqueue({
      id: crypto.randomUUID(),
      type: "message",
      node,
      name,
      message: text,
    });
  }
  async function ask(text = question) {
    if (!text.trim() || busy) return;
    setQuestion("");
    setAi((a) => [...a, { role: "user", text }]);
    setBusy(true);
    try {
      const r = await fetch("/api/assist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: text,
          language:
            language === "hi"
              ? "Hindi"
              : language === "ne"
                ? "Nepali"
                : languages.find((l) => l.code === language)?.label ||
                  "English",
          provider: aiProvider,
        }),
      });
      const d: any = await r.json();
      setAi((a) => [
        ...a,
        {
          role: "assistant",
          text: d.answer || d.error || "Please try again.",
          mode: d.mode,
          provider: d.provider,
        },
      ]);
    } catch {
      setAi((a) => [
        ...a,
        {
          role: "assistant",
          text: hi
            ? "अभी कनेक्शन नहीं है। सहेजे हुए गाइड पढ़ें।"
            : "New AI answers need connectivity in this demo. Your saved guides remain available.",
          mode: "offline",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }
  async function prepare() {
    setPackBusy(true);
    try {
      await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const c = await caches.open("together-v7");
      await c.addAll([
        "/",
        "/manifest.webmanifest",
        "/brand/mark-mono.svg",
        "/icon-192.png",
        "/icon-512.png",
        "/illustrations/helping-people.png",
        "/illustrations/community-people.png",
        "/illustrations/coordinator-people.png",
      ]);
      const assets = [
        ...document.querySelectorAll("script[src],link[rel=stylesheet]"),
      ]
        .map((el) => el.getAttribute("src") || el.getAttribute("href"))
        .filter(
          (s): s is string =>
            !!s && new URL(s, location.href).origin === location.origin,
        );
      await Promise.all(assets.map((u) => c.add(u)));
      setPack(true);
      say("Saved guides and app are ready on this phone.");
    } catch {
      say("Could not finish download. Your requests are still saved.");
    } finally {
      setPackBusy(false);
    }
  }
  const myRequests = (network?.requests || []).filter(
    (r: any) => r.name === name,
  );
  const unread = queue.length;
  return (
    <div className="m-stage">
      <aside className="m-desktop-note">
        <a
          className="m-outer-brand"
          href="https://together-demo.shiiim.chatgpt.site"
        >
          <img src="/brand/mark-mono.svg" alt="" />
          together
        </a>
        <p>The resident app</p>
        <div className="m-side-links">
          <a href="https://together-node.shiiim.chatgpt.site">
            Open nodal centre <ArrowUpRight size={15} />
          </a>
          <a href="https://together-demo.shiiim.chatgpt.site">
            Explore the demo <ArrowUpRight size={15} />
          </a>
        </div>
      </aside>
      <div className="m-phone">
        <header className="m-header">
          <button
            className="m-header-square"
            onClick={() => setSettings(true)}
            aria-label="Language and node settings"
          >
            <Settings2 size={18} />
          </button>
          <a href="/" className="m-brand">
            <img src="/brand/mark-mono.svg" alt="" />
            <span>together</span>
          </a>
          <button
            className="m-header-square"
            onClick={() => setTab("alerts")}
            aria-label="Saved alerts"
          >
            <Bell size={18} />
          </button>
        </header>
        <div className={"m-body " + (tab === "community" ? "m-map-body" : "")}>
          {tab === "home" && (
            <>
              <div className="m-page-title">
                <h2>
                  {hi ? "\u0905\u0928\u0941\u0930\u094b\u0927" : "Requests"}
                </h2>
                <button
                  className="m-text-control"
                  onClick={() => setSettings(true)}
                >
                  <User size={15} />
                  {name.split(" ")[0]}
                </button>
              </div>
              <div className="m-filter-strip">
                <button onClick={() => setSettings(true)}>
                  {nodeNames[node]}
                  <ChevronRight size={12} />
                </button>
                <button
                  className="m-filter-active"
                  onClick={() => setSettings(true)}
                >
                  <span
                    className={"m-node-dot " + (connected ? "connected" : "")}
                  />
                  {connected ? "Connected" : "Device only"}
                  <ChevronRight size={12} />
                </button>
              </div>
              <button className="m-primary-cta" onClick={() => setHelp(true)}>
                <Plus size={18} />
                {hi
                  ? "\u092e\u0926\u0926 \u091a\u093e\u0939\u093f\u090f"
                  : "Request help"}
                <ArrowUpRight size={17} />
              </button>
              <div className="m-shortcuts">
                <button
                  className="m-shortcut-safe"
                  onClick={markSafe}
                  disabled={checkin}
                >
                  <span>
                    <CheckCircle2 size={19} />
                  </span>
                  <div>
                    <strong>
                      {checkin
                        ? "Checked in"
                        : hi
                          ? "\u092e\u0948\u0902 \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0939\u0942\u0901"
                          : "I am safe"}
                    </strong>
                    <small>
                      {checkin ? "Saved check-in" : "Let people know"}
                    </small>
                  </div>
                  {checkin ? <Check size={15} /> : <ChevronRight size={15} />}
                </button>
                <button className="m-shortcut-ai" onClick={() => setTab("ai")}>
                  <span>
                    <Sparkles size={19} />
                  </span>
                  <div>
                    <strong>
                      {hi
                        ? "AI \u0938\u0947 \u092a\u0942\u091b\u0947\u0902"
                        : "Ask AI"}
                    </strong>
                    <small>OpenAI / Cerebras</small>
                  </div>
                  <ChevronRight size={15} />
                </button>
              </div>
              <InstallApp />
              {unread > 0 && (
                <button className="m-outbox" onClick={sync} disabled={syncBusy}>
                  <Clock size={17} />
                  <span>{unread} waiting to send</span>
                  <RefreshCw size={15} className={syncBusy ? "spin" : ""} />
                </button>
              )}
              <section className="m-activity-card" aria-label="Your requests">
                <div className="m-activity-top">
                  <div>
                    <small>Activity</small>
                    <strong>
                      {hi
                        ? "\u0906\u092a\u0915\u0947 \u0905\u0928\u0941\u0930\u094b\u0927"
                        : "Your requests"}
                    </strong>
                  </div>
                  <div>
                    <small>Total</small>
                    <strong>
                      {myRequests.length +
                        queue.filter((q) => q.type === "request").length}
                    </strong>
                  </div>
                </div>
                {[
                  ...queue
                    .filter((q) => q.type === "request")
                    .map((q) => ({ ...q, status: "Saved on phone" })),
                  ...myRequests,
                ].length ? (
                  [
                    ...queue
                      .filter((q) => q.type === "request")
                      .map((q) => ({ ...q, status: "Saved on phone" })),
                    ...myRequests,
                  ]
                    .slice(0, 6)
                    .map((r: any) => (
                      <div className="m-request" key={r.id}>
                        <div
                          className={
                            "m-request-icon " + String(r.category).toLowerCase()
                          }
                        >
                          {String(r.category)
                            .toLowerCase()
                            .includes("water") ? (
                            <Droplets size={19} />
                          ) : String(r.category)
                              .toLowerCase()
                              .includes("food") ? (
                            <Utensils size={18} />
                          ) : (
                            <LifeBuoy size={19} />
                          )}
                        </div>
                        <div className="m-request-copy">
                          <strong>{r.category}</strong>
                          <p>
                            {r.people} people / {r.location}
                          </p>
                          {routing[r.id] && (
                            <small className="m-route-label">
                              {routing[r.id]}
                            </small>
                          )}
                        </div>
                        <div className="m-request-state">
                          <span
                            className={
                              "m-tag " +
                              (["assigned", "done", "acknowledged"].includes(
                                r.status,
                              )
                                ? "lime"
                                : "")
                            }
                          >
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="m-no-requests">
                    <img
                      src="/illustrations/helping-people.png"
                      alt=""
                      width={160}
                      height={160}
                    />
                    <div>
                      <strong>No requests yet</strong>
                      <p>Your help requests will appear here.</p>
                    </div>
                  </div>
                )}
              </section>
              <section className="m-connection-card">
                <img
                  className="m-hub-people"
                  src="/illustrations/helping-people.png"
                  alt=""
                  width={160}
                  height={160}
                />
                <button className="m-place" onClick={() => setTab("community")}>
                  <span className="m-place-icon">
                    <MapPin size={19} />
                  </span>
                  <div>
                    <strong>{nodeNames[node]}</strong>
                    <p>Map and community</p>
                  </div>
                  <ChevronRight size={17} />
                </button>
                <button className="m-place" onClick={() => setTab("guides")}>
                  <span className="m-place-icon">
                    <BookOpen size={19} />
                  </span>
                  <div>
                    <strong>Saved guides</strong>
                    <p>Read without internet / Wi-Fi</p>
                  </div>
                  <span className="m-mini-count">6</span>
                  <ChevronRight size={17} />
                </button>
              </section>
              <div className="m-offline-note">
                <CloudOff size={17} />
                <div>
                  <strong>No internet / Wi-Fi needed for saved guides</strong>
                  <p>Connect to local node Wi-Fi to send messages.</p>
                </div>
              </div>
              <div className="m-demo-foot">
                <span>DEMO</span>
                <p>
                  Shared sync uses internet here. Physical Wi-Fi / LoRa nodes
                  are simulated.
                </p>
              </div>
            </>
          )}
          {tab === "community" && (
            <>
              <div className="m-map-heading">
                <h2>{hi ? "\u0928\u0915\u094d\u0936\u093e" : "Map"}</h2>
                <button
                  className="m-header-square"
                  aria-label="Choose community node"
                  onClick={() => setSettings(true)}
                >
                  <Settings2 size={17} />
                </button>
              </div>
              <div className="m-local-map-frame">
                <NeighbourhoodMap
                  selectedNode={node}
                  onSelectNode={setNode}
                  connected={connected}
                />
              </div>
              <section className="m-map-sheet">
                <div className="m-sheet-handle" />
                <div className="m-page-title">
                  <h2>
                    {hi
                      ? "\u0939\u092e\u093e\u0930\u093e \u0938\u092e\u0941\u0926\u093e\u092f"
                      : "Community"}
                  </h2>
                  <span className="m-tag lime">{nodeNames[node]}</span>
                </div>
                <div className="m-community-people">
                  <span>
                    <Users size={17} />
                    <b>{network?.checkins?.length || 0}</b> check-ins
                  </span>
                  <span>
                    <MessageCircle size={17} />
                    <b>{network?.messages?.length || 0}</b> messages
                  </span>
                </div>
                <form
                  className="m-compose"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendCommunity();
                  }}
                >
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share an update or offer help..."
                    maxLength={500}
                    aria-label="Community message"
                  />
                  <button
                    disabled={!message.trim()}
                    aria-label="Send community message"
                  >
                    <Send size={18} />
                  </button>
                </form>
                {(network?.messages || []).length ? (
                  network.messages.map((p: any) => (
                    <article className="m-post" key={p.id}>
                      <div className="m-post-author">
                        <span>{p.name[0]}</span>
                        <strong>{p.name}</strong>
                        <small>
                          {new Date(p.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                      <p>{p.message}</p>
                    </article>
                  ))
                ) : (
                  <div className="m-empty-vector">
                    <img
                      className="m-state-art"
                      src="/illustrations/community-people.png"
                      alt=""
                      width={180}
                      height={180}
                    />
                    <h3>Start a conversation.</h3>
                    <p>Updates appear on the nodal centre, too.</p>
                  </div>
                )}
              </section>
            </>
          )}
          {tab === "ai" && (
            <>
              <div className="m-page-title">
                <h2>{hi ? "Together से पूछें" : "Ask Together"}</h2>
                <span className="m-tag blue">AI</span>
              </div>
              <div className="m-ai-info">
                <Sparkles size={21} />
                <span>{aiProvider === "cerebras" ? "OpenAI gpt-oss · Cerebras inference" : "OpenAI · GPT-6 Luna"}</span>
              </div>
              <div className="m-provider-options" aria-label="AI provider">
                <button disabled={busy} aria-pressed={aiProvider === "cerebras"} onClick={() => setAiProvider("cerebras")}>Cerebras</button>
                <button disabled={busy} aria-pressed={aiProvider === "openai"} onClick={() => setAiProvider("openai")}>OpenAI</button>
              </div>
              <div className="m-chat" aria-live="polite">
                {!ai.length && (
                  <div className="m-empty-vector">
                    <div className="m-ai-orb">
                      <Sparkles size={36} />
                    </div>
                    <h3>{hi ? "कैसे मदद करें?" : "What would help?"}</h3>
                    <div className="m-suggestions">
                      {(hi
                        ? [
                            "मदद का अनुरोध कैसे लिखें?",
                            "बिना इंटरनेट क्या चलेगा?",
                            "चेतावनी की पुष्टि कैसे करें?",
                          ]
                        : [
                            "Help me write a request",
                            "What works offline?",
                            "How do I verify an alert?",
                          ]
                      ).map((q) => (
                        <button key={q} onClick={() => ask(q)}>
                          {q}
                          <ArrowUpRight size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {ai.map((a, i) => (
                  <div className={"m-bubble " + a.role} key={i}>
                    {a.mode && (
                      <span>
                        {a.mode === "live"
                          ? "LIVE API"
                          : a.mode === "offline"
                            ? "OFFLINE GUIDE"
                            : "SAMPLE ANSWER"}
                        {a.provider ? ` · ${a.provider}` : ""}
                      </span>
                    )}
                    <p>{a.text}</p>
                  </div>
                ))}
                {busy && (
                  <div className="m-thinking">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </div>
              <form
                className="m-ai-input"
                onSubmit={(e) => {
                  e.preventDefault();
                  ask();
                }}
              >
                <input
                  aria-label="Ask AI"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={hi ? "अपना सवाल लिखें…" : "Ask in your words…"}
                  maxLength={1200}
                />
                <button
                  aria-label="Send AI question"
                  disabled={!question.trim() || busy}
                >
                  <ArrowRight size={21} />
                </button>
              </form>
              <p className="m-small-note">
                New AI answers require connectivity in this demo.
              </p>
            </>
          )}
          {tab === "guides" && (
            <>
              <div className="m-page-title">
                <h2>{hi ? "ज़रूरी जानकारी" : "Saved guides"}</h2>
                <BookOpen size={23} />
              </div>
              <button
                className={"m-download " + (pack ? "ready" : "")}
                onClick={prepare}
                disabled={packBusy}
              >
                {pack ? <CheckCircle2 size={24} /> : <Download size={24} />}
                <div>
                  <strong>
                    {packBusy
                      ? "Preparing…"
                      : pack
                        ? hi
                          ? "फ़ोन पर तैयार"
                          : "Ready on this phone"
                        : hi
                          ? "बिना इंटरनेट के लिए सेव करें"
                          : "Save for offline use"}
                  </strong>
                  <span>6 guides · app cache</span>
                </div>
                <ArrowDownIcon />
              </button>
              <input
                className="m-search"
                aria-label="Search guides"
                placeholder={hi ? "गाइड खोजें…" : "Search saved guides…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {knowledge
                .filter((k) =>
                  (k.title + k.category)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((k, i) => (
                  <button
                    className="m-guide-row"
                    key={k.id}
                    onClick={() => setArticle(k)}
                  >
                    <span>
                      {
                        [
                          <Users size={22} />,
                          <CloudOff size={22} />,
                          <MessageCircle size={22} />,
                          <ShieldCheck size={22} />,
                          <Download size={22} />,
                          <Package size={22} />,
                        ][i % 6]
                      }
                    </span>
                    <div>
                      <strong>{k.title}</strong>
                      <small>{k.source}</small>
                    </div>
                    <ChevronRight size={18} />
                  </button>
                ))}
              <p className="m-small-note">
                Included explainers · selected Wikipedia context · source links
              </p>
            </>
          )}
          {tab === "alerts" && (
            <>
              <div className="m-page-title">
                <h2>{hi ? "सूचनाएँ" : "Saved alerts"}</h2>
                <Bell size={23} />
              </div>
              <div className="m-alert-note">
                <ShieldCheck size={22} />
                <span>Check the source and date.</span>
              </div>
              <article className="m-alert-card">
                <span className="m-tag">HISTORICAL</span>
                <h3>Nepal floods · 2024</h3>
                <p>
                  UNICEF’s 1 October 2024 report provides the reference for this
                  demo. This is not an active warning.
                </p>
                <a
                  href="https://www.unicef.org/media/163091/file/Nepal-Humanitarian-SitRep-Floods-01-October-2024.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  UNICEF Nepal <ArrowUpRight size={15} />
                </a>
              </article>
              <article className="m-alert-card">
                <span className="m-tag blue">OFFICIAL SOURCE</span>
                <h3>NDMA SACHET</h3>
                <p>
                  India’s multilingual disaster alert portal. Live alerts are
                  not connected in this version.
                </p>
                <a
                  href="https://sachet.ndma.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open official portal <ArrowUpRight size={15} />
                </a>
              </article>
            </>
          )}
        </div>
        <nav className="m-bottom-nav" aria-label="Resident navigation">
          {(
            [
              {
                id: "home",
                icon: Home,
                label: hi ? "\u0939\u094b\u092e" : "Home",
              },
              {
                id: "community",
                icon: MapPin,
                label: hi ? "\u0928\u0915\u094d\u0936\u093e" : "Map",
              },
              { id: "ai", icon: Sparkles, label: "Ask AI" },
              {
                id: "guides",
                icon: BookOpen,
                label: hi ? "\u0917\u093e\u0907\u0921" : "Guides",
              },
              {
                id: "settings",
                icon: Settings2,
                label: hi ? "\u0938\u0947\u091f\u093f\u0902\u0917" : "Settings",
              },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <button
              className={
                (id === "settings" ? settings : tab === id) ? "active" : ""
              }
              key={id}
              onClick={() => {
                if (id === "settings") setSettings(true);
                else {
                  setTab(id);
                  document.querySelector(".m-body")?.scrollTo(0, 0);
                }
              }}
              aria-label={label}
            >
              <Icon size={21} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
      {help && (
        <div className="m-modal-scrim" onClick={() => setHelp(false)}>
          <section
            className="m-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="m-sheet-top">
              <LifeBuoy size={27} />
              <button onClick={() => setHelp(false)} aria-label="Close request">
                <X size={22} />
              </button>
            </div>
            <h2 id="request-title">
              {hi ? "क्या मदद चाहिए?" : "What do you need?"}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                setName(String(f.get("name")));
                setHelp(false);
                await enqueue({
                  id: crypto.randomUUID(),
                  type: "request",
                  node,
                  name: String(f.get("name")),
                  category: String(f.get("category")),
                  people: Number(f.get("people")),
                  location: String(f.get("location")),
                  message: String(f.get("message")),
                });
              }}
            >
              <div className="m-category-options">
                {[
                  { name: "Water", icon: <Droplets size={23} /> },
                  { name: "Food", icon: <Utensils size={23} /> },
                  { name: "Shelter", icon: <Home size={23} /> },
                  { name: "Rescue", icon: <LifeBuoy size={23} /> },
                ].map((c, i) => (
                  <label key={c.name}>
                    <input
                      type="radio"
                      name="category"
                      value={c.name}
                      defaultChecked={i === 0}
                    />
                    <span>
                      {c.icon}
                      <b>{c.name}</b>
                    </span>
                  </label>
                ))}
              </div>
              <div className="m-form-two">
                <label>
                  {hi ? "नाम" : "Name"}
                  <input
                    name="name"
                    defaultValue={name}
                    required
                    maxLength={60}
                  />
                </label>
                <label>
                  {hi ? "कितने लोग" : "People"}
                  <input
                    name="people"
                    type="number"
                    defaultValue={1}
                    min={1}
                    max={99}
                    required
                  />
                </label>
              </div>
              <label>
                {hi ? "आप कहाँ हैं?" : "Where are you?"}
                <input
                  name="location"
                  placeholder="Building or landmark"
                  required
                  maxLength={120}
                />
              </label>
              <label>
                {hi ? "थोड़ी जानकारी" : "A little detail"}
                <textarea
                  name="message"
                  placeholder="What would help?"
                  required
                  maxLength={800}
                />
              </label>
              <button type="submit" className="m-submit">
                {hi ? "मदद का अनुरोध भेजें" : "Send help request"}
                <ArrowRight size={19} />
              </button>
              <p className="m-small-note">
                Demo request · no emergency service is contacted
              </p>
            </form>
          </section>
        </div>
      )}
      {settings && (
        <div className="m-modal-scrim" onClick={() => setSettings(false)}>
          <section
            className="m-sheet settings"
            role="dialog"
            aria-modal="true"
            aria-label="Your connection"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="m-sheet-top">
              <Radio size={27} />
              <button
                onClick={() => setSettings(false)}
                aria-label="Close settings"
              >
                <X size={22} />
              </button>
            </div>
            <h2>{hi ? "आपका कनेक्शन" : "Your connection"}</h2>
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
            </label>
            <label>
              Community node
              <select value={node} onChange={(e) => setNode(e.target.value)}>
                {Object.entries(nodeNames).map(([id, n]) => (
                  <option value={id} key={id}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Language
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                    {l.label.includes("preview") ? " · preview" : ""}
                  </option>
                ))}
              </select>
            </label>
            {!["hi", "en", "ne"].includes(language) && (
              <p className="m-small-note">
                Regional pack preview. Hindi fallback until native-speaker
                review.
              </p>
            )}
            <InstallApp variant="settings" />
            <div className="m-connect-explainer">
              <Wifi size={23} />
              <div>
                <strong>Local Wi-Fi ≠ internet</strong>
                <p>
                  A physical Together hub creates its own nearby network. Saved
                  guides and requests work with no internet or Wi-Fi. Sending
                  messages needs a local connection.
                </p>
              </div>
            </div>
            <p className="m-small-note">
              This web demo synchronizes through a cloud server. LoRa hardware
              and local AI are deployment concepts.
            </p>
            <button className="m-submit" onClick={() => setSettings(false)}>
              Done <Check size={19} />
            </button>
          </section>
        </div>
      )}
      {article && (
        <div className="m-modal-scrim" onClick={() => setArticle(null)}>
          <section
            className="m-sheet article"
            role="dialog"
            aria-modal="true"
            aria-label={article.title}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="m-sheet-top">
              <BookOpen size={27} />
              <button onClick={() => setArticle(null)} aria-label="Close guide">
                <X size={22} />
              </button>
            </div>
            <h2>{article.title}</h2>
            <p>{article.body}</p>
            <a href={article.url} target="_blank" rel="noreferrer">
              {article.source}
              <ArrowUpRight size={16} />
            </a>
            <span className="m-small-note">
              Included text · readable without internet after download
            </span>
          </section>
        </div>
      )}
      {toast && (
        <div className="m-toast" role="status">
          <CheckCircle2 size={19} />
          <span>{toast}</span>
          <button onClick={() => setToast("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function ArrowDownIcon() {
  return <ChevronRight size={20} />;
}
