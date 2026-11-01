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
} from "lucide-react";
import { knowledge, languages } from "../lib/content";
import "./mobile-app.css";
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
  const [pack, setPack] = saved("tg-pack-ready", false);
  const [packBusy, setPackBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [question, setQuestion] = useState("");
  const [ai, setAi] = useState<{ role: string; text: string; mode?: string }[]>(
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
          provider: "cerebras",
        }),
      });
      const d: any = await r.json();
      setAi((a) => [
        ...a,
        {
          role: "assistant",
          text: d.answer || d.error || "Please try again.",
          mode: d.mode,
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
      const c = await caches.open("together-v2");
      await c.addAll([
        "/",
        "/manifest.webmanifest",
        "/brand/mark.svg",
        "/icon-192.png",
        "/icon-512.png",
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
          <img src="/brand/mark.svg" alt="" />
          together
        </a>
        <div className="m-vector-people" aria-hidden="true">
          <svg viewBox="0 0 330 300">
            <circle cx="165" cy="150" r="124" fill="#16284d" />
            <path
              d="M25 234 Q165 110 305 234"
              fill="none"
              stroke="#335bfc"
              strokeWidth="2"
              strokeDasharray="7 8"
            />
            <circle cx="119" cy="83" r="24" fill="#85acff" />
            <path
              d="M77 202V144Q77 114 119 114Q159 114 159 144V202"
              fill="#315afa"
            />
            <path
              d="M97 201L87 269M139 201L149 269"
              stroke="#315afa"
              strokeWidth="23"
              strokeLinecap="round"
            />
            <circle cx="222" cy="116" r="20" fill="#c7e2ff" />
            <path
              d="M188 222V168Q188 141 222 141Q256 141 256 168V222"
              fill="#26c6c6"
            />
            <path
              d="M205 219L199 269M239 219L245 269"
              stroke="#26c6c6"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d="M151 145L181 168L195 161"
              fill="none"
              stroke="#85acff"
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="282" cy="58" r="23" fill="#21365b" />
            <path
              d="M269 58L278 66L295 49"
              fill="none"
              stroke="#29d7c5"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1>{hi ? "हम साथ हैं।" : "We have each other."}</h1>
        <p>
          {hi ? "मदद, जानकारी और अपने लोग।" : "Help. Knowledge. Your people."}
        </p>
        <div className="m-side-links">
          <a href="https://together-node.shiiim.chatgpt.site">
            Open nodal centre <ArrowUpRight size={16} />
          </a>
          <a href="https://together-demo.shiiim.chatgpt.site">
            Explore the demo <ArrowUpRight size={16} />
          </a>
        </div>
      </aside>
      <div className="m-phone">
        <header className="m-header">
          <a href="/" className="m-brand">
            <img src="/brand/mark.svg" alt="" />
            <span>
              together<span>.</span>
            </span>
          </a>
          <div>
            <button
              aria-label="Language and node settings"
              className="m-language"
              onClick={() => setSettings(true)}
            >
              <Globe size={16} />
              {hi
                ? "हिन्दी"
                : language === "en"
                  ? "EN"
                  : languages.find((l) => l.code === language)?.name}
            </button>
            <button
              className="m-icon-button"
              onClick={() => setTab("alerts")}
              aria-label="Saved alerts"
            >
              <Bell size={21} />
            </button>
          </div>
        </header>
        <button
          className={"m-node-status " + (!connected ? "waiting" : "")}
          onClick={() => setSettings(true)}
        >
          <span className="m-node-dot" />
          <Radio size={15} />
          <span>{nodeNames[node]}</span>
          <span>{connected ? "DEMO SYNC" : "DEVICE ONLY"}</span>
          <ChevronRight size={14} />
        </button>
        <div className="m-body">
          {tab === "home" && (
            <>
              <div className="m-greeting">
                <span>
                  {hi ? "नमस्ते" : "HELLO"}, {name.split(" ")[0]}
                </span>
                <h2>{hi ? "आप अकेले नहीं हैं।" : "You’re not alone."}</h2>
                <CommunityPortraits />
              </div>
              <div className="m-offline-note">
                <CloudOff size={23} />
                <div>
                  <strong>
                    {hi
                      ? "सहेजे गाइड के लिए इंटरनेट / Wi-Fi नहीं चाहिए"
                      : "No internet / Wi-Fi needed for saved guides"}
                  </strong>
                  <p>
                    {hi
                      ? "संदेश भेजने के लिए स्थानीय नोड Wi-Fi से जुड़ें।"
                      : "Connect to local node Wi-Fi to send messages."}
                  </p>
                </div>
              </div>
              <div className="m-action-grid">
                <button className="m-help" onClick={() => setHelp(true)}>
                  <LifeBuoy size={31} />
                  <span>{hi ? "मदद चाहिए" : "I need help"}</span>
                  <ArrowUpRight size={20} />
                </button>
                <button
                  className={"m-safe " + (checkin ? "done" : "")}
                  onClick={markSafe}
                  disabled={checkin}
                >
                  {checkin ? <CheckCheck size={29} /> : <Heart size={29} />}
                  <span>
                    {checkin
                      ? hi
                        ? "सुरक्षित दर्ज"
                        : "Checked in"
                      : hi
                        ? "मैं सुरक्षित हूँ"
                        : "I’m safe"}
                  </span>
                  <span className="m-action-sub">
                    {checkin
                      ? "Saved check-in"
                      : hi
                        ? "अपनों को बताएं"
                        : "Let people know"}
                  </span>
                </button>
                <button onClick={() => setTab("ai")} className="m-action">
                  <Sparkles size={26} />
                  <span>{hi ? "AI से पूछें" : "Ask AI"}</span>
                  <ArrowUpRight size={15} />
                </button>
                <button onClick={() => setTab("guides")} className="m-action">
                  <BookOpen size={26} />
                  <span>{hi ? "ज़रूरी जानकारी" : "Saved guides"}</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
              {unread > 0 && (
                <button className="m-outbox" onClick={sync} disabled={syncBusy}>
                  <Clock size={18} />
                  <span>
                    {unread}{" "}
                    {hi ? "संदेश फ़ोन में सुरक्षित" : "saved on your phone"}
                  </span>
                  <RefreshCw size={16} className={syncBusy ? "spin" : ""} />
                </button>
              )}
              <div className="m-section-line">
                <h3>{hi ? "आपके पास" : "Near you"}</h3>
                <button onClick={() => setTab("community")}>
                  {hi ? "सब देखें" : "View all"}
                  <ArrowRight size={14} />
                </button>
              </div>
              <button className="m-place" onClick={() => setSettings(true)}>
                <div className="m-place-icon">
                  <Home size={22} />
                </div>
                <div>
                  <strong>{nodeNames[node]}</strong>
                  <p>Demo community centre</p>
                </div>
                <span className="m-tag">
                  {connected ? "Connected" : "Saved"}
                </span>
              </button>
              <div className="m-section-line">
                <h3>{hi ? "आपके अनुरोध" : "Your requests"}</h3>
                <span>
                  {myRequests.length +
                    queue.filter((q) => q.type === "request").length}
                </span>
              </div>
              {myRequests.length ? (
                myRequests.slice(0, 3).map((r: any) => (
                  <div className="m-request" key={r.id}>
                    <div className="m-request-icon">
                      <LifeBuoy size={19} />
                    </div>
                    <div>
                      <strong>{r.category}</strong>
                      {routing[r.id] && (
                        <small className="m-route-label">{routing[r.id]}</small>
                      )}
                      <p>
                        {r.people} people · {r.location}
                      </p>
                    </div>
                    <span
                      className={
                        "m-tag " + (r.status === "assigned" ? "blue" : "")
                      }
                    >
                      {r.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="m-no-requests">
                  <ShieldCheck size={19} />
                  <span>
                    {hi
                      ? "ज़रूरत पड़ने पर हम यहाँ हैं।"
                      : "Here when you need a hand."}
                  </span>
                </div>
              )}
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
              <div className="m-page-title">
                <h2>{hi ? "हमारा समुदाय" : "Community"}</h2>
                <span className="m-tag">{nodeNames[node]}</span>
              </div>
              <div className="m-community-people">
                <span>
                  <Users size={20} />
                  <b>{network?.checkins?.length || 0}</b> check-ins
                </span>
                <span>
                  <MessageCircle size={20} />
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
                  placeholder={
                    hi
                      ? "कुछ मदद या जानकारी साझा करें…"
                      : "Share an update or offer help…"
                  }
                  maxLength={500}
                  aria-label="Community message"
                />
                <button
                  disabled={!message.trim()}
                  aria-label="Send community message"
                >
                  <Send size={19} />
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
                  <Users size={44} />
                  <h3>{hi ? "बात शुरू करें।" : "Start a conversation."}</h3>
                  <p>
                    {hi
                      ? "आपका संदेश नोड के लोगों तक पहुँचेगा।"
                      : "Updates appear on the nodal centre, too."}
                  </p>
                </div>
              )}
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
                <span>OpenAI model · Cerebras inference</span>
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
              { id: "home", icon: Home, label: hi ? "होम" : "Home" },
              {
                id: "community",
                icon: Users,
                label: hi ? "समुदाय" : "Community",
              },
              { id: "ai", icon: Sparkles, label: "Ask AI" },
              { id: "guides", icon: BookOpen, label: hi ? "गाइड" : "Guides" },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <button
              className={tab === id ? "active" : ""}
              key={id}
              onClick={() => {
                setTab(id);
                document.querySelector(".m-body")?.scrollTo(0, 0);
              }}
              aria-label={label}
            >
              <Icon size={23} />
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

function CommunityPortraits() {
  return (
    <div
      className="m-community-art"
      aria-label="Illustration of neighbours supporting one another"
      role="img"
    >
      <span className="m-community-glow" />
      <svg
        className="m-portrait m-portrait-back"
        viewBox="0 0 80 80"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="tg-avatar-back">
            <circle cx="40" cy="40" r="37" />
          </clipPath>
        </defs>
        <circle
          cx="40"
          cy="40"
          r="39"
          fill="#1c2740"
          stroke="#536a96"
          strokeWidth="2"
        />
        <g clipPath="url(#tg-avatar-back)">
          <path d="M6 85c0-25 12-39 34-39s34 14 34 39" fill="#69b9cf" />
          <path d="M33 44h14v15c-5 5-9 5-14 0Z" fill="#b5816b" />
          <ellipse cx="40" cy="31" rx="18" ry="22" fill="#d4a78b" />
          <path
            d="M21 29c-2-14 5-23 19-23s23 10 19 27l-7-16c-8 3-19 6-31 6Z"
            fill="#11192b"
          />
          <circle cx="34" cy="33" r="1.5" fill="#141c2c" />
          <circle cx="46" cy="33" r="1.5" fill="#141c2c" />
          <path
            d="M35 42q5 4 10 0"
            fill="none"
            stroke="#805547"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <svg
        className="m-portrait m-portrait-main"
        viewBox="0 0 90 90"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="tg-avatar-main">
            <circle cx="45" cy="45" r="41" />
          </clipPath>
        </defs>
        <circle
          cx="45"
          cy="45"
          r="43"
          fill="#263365"
          stroke="#91a0ff"
          strokeWidth="2"
        />
        <g clipPath="url(#tg-avatar-main)">
          <path d="M5 94c0-27 15-42 40-42s40 15 40 42" fill="#8d83ff" />
          <path d="M36 47h18v18c-6 5-12 5-18 0Z" fill="#93644f" />
          <ellipse cx="45" cy="35" rx="20" ry="24" fill="#b78267" />
          <path
            d="M24 38c-5-24 5-32 21-32 17 0 28 13 21 36l-5-22c-12 0-20-4-24-7-2 9-5 15-13 17Z"
            fill="#0c1325"
          />
          <circle cx="37" cy="36" r="1.7" fill="#11192b" />
          <circle cx="52" cy="36" r="1.7" fill="#11192b" />
          <path
            d="M39 46q6 4 12 0"
            fill="none"
            stroke="#6d4438"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="m-portrait-heart">
        <Heart size={11} fill="currentColor" />
      </span>
      <span className="m-portrait-link">
        <Check size={11} />
      </span>
    </div>
  );
}
