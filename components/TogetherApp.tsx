"use client";
import { useState, useEffect, lazy, Suspense, useRef } from "react";
import {
  House,
  Users,
  Heart,
  ArrowUpRight,
  ArrowRight,
  Radio,
  Wifi,
  WifiOff,
  MapPin,
  ChevronDown,
  Globe,
  Check,
  Plus,
  Send,
  BookOpen,
  Download,
  ShieldCheck,
  MessageCircle,
  Package,
  LifeBuoy,
  Search,
  X,
  CheckCircle2,
  Clock,
  Volume2,
  CloudSun,
  Layers,
  Activity,
  ExternalLink,
  Menu,
  Leaf,
  Sparkles,
  Mic,
  Square,
  RefreshCw,
  Settings2,
  Building2,
  Flag,
  Info,
  Bell,
} from "lucide-react";
import {
  languages,
  copy,
  knowledge,
  initialRequests,
  ReliefRequest,
} from "../lib/content";
const Simulation = lazy(() => import("./Simulation"));
type View =
  | "home"
  | "community"
  | "ask"
  | "alerts"
  | "knowledge"
  | "simulation"
  | "coordinator";
type Chat = {
  role: "user" | "assistant";
  text: string;
  mode?: string;
  provider?: string;
  sources?: { title?: string; url: string }[];
};
const navItems = [
  { id: "home", icon: House },
  { id: "community", icon: Users },
  { id: "ask", icon: Sparkles },
  { id: "knowledge", icon: BookOpen },
  { id: "alerts", icon: Bell },
  { id: "simulation", icon: Layers },
  { id: "coordinator", icon: LifeBuoy },
] as const;
function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setValue(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
  }, [value, key, ready]);
  return [value, setValue] as const;
}
export default function TogetherApp() {
  const [view, setView] = useState<View>("home");
  const [language, setLanguage] = useStored("together-language", "hi");
  const [region, setRegion] = useState("nepal");
  const [offline, setOffline] = useState(false);
  const [actualOnline, setActualOnline] = useState(true);
  const [requests, setRequests] = useStored<ReliefRequest[]>(
    "together-requests",
    initialRequests,
  );
  const [safe, setSafe] = useStored("together-safe", false);
  const [help, setHelp] = useState(false);
  const [article, setArticle] = useState<(typeof knowledge)[number] | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [pack, setPack] = useStored("together-pack", false);
  const [packBusy, setPackBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [hardware, setHardware] = useState(false);
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState("All");
  const [routing, setRouting] = useStored<Record<string, string>>(
    "together-routing",
    {},
  );
  const [communityText, setCommunityText] = useState("");
  const [posts, setPosts] = useStored("together-posts", [
    {
      name: "Relief desk",
      text: "The community school is the shelter in this demonstration. Tap a person in the 3D scene to follow their journey.",
      tag: "Coordinator · scenario",
    },
    {
      name: "Suman · volunteer",
      text: "We have blankets available at the demo relief desk. Add a request so we can coordinate distribution.",
      tag: "Offering help · scenario",
    },
  ]);
  const [chat, setChat] = useState<Chat[]>([]);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState("cerebras");
  const [brief, setBrief] = useState<any>(null);
  const [briefBusy, setBriefBusy] = useState(false);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = copy[language] || copy.hi;
  const disconnected = offline || !actualOnline;
  const currentRegion =
    region === "nepal"
      ? "Kathmandu Valley, Nepal"
      : region === "uttarakhand"
        ? "Uttarakhand, India"
        : "Himachal Pradesh, India";
  function toast(text: string) {
    setNotice(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setNotice(""), 5500);
  }
  function go(v: View) {
    setView(v);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  useEffect(() => {
    const update = () => setActualOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    fetch("/api/status")
      .then((r) => r.json())
      .then(setApiStatus)
      .catch(() => {});
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = ["hi", "en", "ne"].includes(language)
      ? language
      : "hi";
  }, [language]);
  async function preparePack() {
    setPackBusy(true);
    try {
      if (!("serviceWorker" in navigator))
        throw Error("Service worker unavailable");
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const cache = await caches.open("together-v1");
      await cache.addAll(["/", "/brand/mark.svg", "/manifest.webmanifest"]);
      const assets = [
        ...document.querySelectorAll("script[src],link[rel=stylesheet]"),
      ]
        .map((el) => el.getAttribute("src") || el.getAttribute("href"))
        .filter(
          (u): u is string =>
            !!u && new URL(u, location.href).origin === location.origin,
        );
      await Promise.allSettled(assets.map((u) => cache.add(u)));
      setPack(true);
      toast(
        "Knowledge pack prepared. Open the articles once, then try an offline reload.",
      );
    } catch {
      toast(
        "Could not finish preparing offline cache. Keep this page open; your requests are still saved locally.",
      );
    } finally {
      setPackBusy(false);
    }
  }
  function checkIn() {
    setSafe(true);
    toast(
      "Your check-in is saved on this device. Demo node delivery is simulated.",
    );
  }
  async function sendChat(message = prompt) {
    if (!message.trim() || busy) return;
    setChat((c) => [...c, { role: "user", text: message }]);
    setPrompt("");
    setBusy(true);
    try {
      if (disconnected) {
        setChat((c) => [
          ...c,
          {
            role: "assistant",
            text: "You are viewing the offline demonstration. New AI inference needs internet in this MVP. Your saved knowledge pack remains available; open “Write a useful help request” or “Check where an alert came from”.",
            mode: "offline",
            provider: "Saved knowledge",
          },
        ]);
        return;
      }
      const r = await fetch("/api/assist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          language:
            languages.find((l) => l.code === language)?.label || "Hindi",
          provider,
        }),
      });
      const data: any = await r.json();
      if (!r.ok && !data.answer)
        throw Error(data.error || "AI service unavailable");
      setChat((c) => [
        ...c,
        {
          role: "assistant",
          text: data.answer || data.error,
          mode: data.mode,
          provider: data.provider,
          sources: data.sources,
        },
      ]);
    } catch (e) {
      setChat((c) => [
        ...c,
        {
          role: "assistant",
          text: "The AI service is unavailable. Your request was not sent to a local model. Please use the saved articles or contact the demo relief desk.",
          mode: "unavailable",
          provider: "Together",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }
  async function makeBrief() {
    if (disconnected) {
      toast("Web research needs internet. Saved sources are still available.");
      return;
    }
    setBriefBusy(true);
    try {
      let r = await fetch("/api/briefing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ region }),
      });
      let data: any = await r.json();
      for (let i = 0; data.pending && i < 12; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        r = await fetch(
          "/api/briefing?runId=" +
            encodeURIComponent(data.runId) +
            "&ticket=" +
            encodeURIComponent(data.ticket),
        );
        data = await r.json();
      }
      setBrief(data);
      if (data.pending)
        toast(
          "Research is still running. You can refresh the briefing shortly.",
        );
    } catch {
      toast("Briefing service unavailable. Please try again later.");
    } finally {
      setBriefBusy(false);
    }
  }
  async function toggleRecord() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    if (!apiStatus?.configured?.openai || !apiStatus?.enabled) {
      toast("Add and enable the OpenAI API key to use voice transcription.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorder.current = rec;
      chunks.current = [];
      rec.ondataavailable = (e) => chunks.current.push(e.data);
      rec.onstop = async () => {
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        const form = new FormData();
        form.append(
          "file",
          new Blob(chunks.current, { type: rec.mimeType }),
          "request.webm",
        );
        try {
          const r = await fetch("/api/transcribe", {
            method: "POST",
            body: form,
          });
          const d: any = await r.json();
          if (d.text) setPrompt(d.text);
          else toast(d.error || "Transcription unavailable");
        } catch {
          toast("Transcription failed. You can type your message instead.");
        }
      };
      rec.start();
      setRecording(true);
      setTimeout(() => {
        if (rec.state === "recording") rec.stop();
      }, 15000);
    } catch {
      toast("Microphone unavailable. Type your request in the message box.");
    }
  }
  function exportRequests() {
    const data = new Blob(
      [
        JSON.stringify(
          { project: "Together", mode: "scenario", requests },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(data);
    a.download = "together-demo-requests.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function saveRequest(r: ReliefRequest) {
    setRequests((all) => [r, ...all]);
    setHelp(false);
    toast(
      disconnected
        ? "Request saved on your device. Delivery will need a connection."
        : "Request added to the demo relief desk. No real emergency service was contacted.",
    );
    go("coordinator");
    if (!disconnected)
      try {
        const res = await fetch("/api/classify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: r.category + ": " + r.message }),
        });
        const d: any = await res.json();
        if (d.ok)
          setRouting((all) => ({
            ...all,
            [r.id]:
              (d.mode === "live" ? "OpenAI Decisions" : "Demo rules") +
              " · " +
              d.category +
              (d.needsAttention ? " · review requested" : ""),
          }));
      } catch {}
  }
  const filtered = knowledge.filter((k) =>
    (k.title + " " + k.category + " " + k.description)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="app-shell">
      <aside className={"sidebar " + (menu ? "is-open" : "")}>
        <a className="brand" href="/" aria-label="Together home">
          <img src="/brand/mark.svg" alt="" />
          <span>
            together<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="sidebar-caption">
          A LITTLE CONNECTION. A LOT OF HOPE.
        </div>
        <nav aria-label="Main navigation">
          {navItems.map(({ id, icon: Icon }) => (
            <button
              key={id}
              className={"nav-item " + (view === id ? "active" : "")}
              onClick={() => go(id)}
            >
              <Icon size={19} />
              <span>{t[id]}</span>
              {id === "ask" && <span className="tiny-ai">AI</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="node-orbit">
            <Radio size={23} />
            <i />
            <i />
          </div>
          <strong>
            Small nodes.
            <br />
            Stronger communities.
          </strong>
          <p>See the people and technology behind a connected relief camp.</p>
          <button
            className="text-link"
            onClick={() => {
              setHardware(true);
              go("simulation");
            }}
          >
            Meet a Together node <ArrowUpRight size={15} />
          </button>
        </div>
        <a className="sidebar-footer" href="/project">
          <Info size={15} /> About this project <ArrowUpRight size={14} />
        </a>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle navigation"
          >
            <Menu />
          </button>
          <a className="mobile-brand" href="/" aria-label="Together home">
            <img src="/brand/mark.svg" alt="Together" />
          </a>
          <div className="location">
            <MapPin size={17} />
            <select
              aria-label="Scenario region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="nepal">Kathmandu Valley, Nepal</option>
              <option value="uttarakhand">Uttarakhand, India</option>
              <option value="himachal">Himachal Pradesh, India</option>
            </select>
            <ChevronDown size={13} />
          </div>
          <div className="top-actions">
            <span className="demo-pill">
              <span /> DEMO
            </span>
            <div className="language">
              <Globe size={16} />
              <select
                aria-label="Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((l) => (
                  <option value={l.code} key={l.code}>
                    {l.name}
                    {l.label.includes("preview") ? " · preview" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="avatar" title="Demo resident">
              S
            </div>
          </div>
        </header>
        <main className="page-content">
          <div
            className={"connection-strip " + (disconnected ? "offline" : "")}
          >
            <div>
              {disconnected ? <WifiOff size={16} /> : <Wifi size={16} />}
              <span>
                {disconnected
                  ? "Offline experience · requests stay on this device"
                  : "Together node · community connection simulated"}
              </span>
            </div>
            <button
              onClick={() => {
                setOffline(!offline);
                toast(
                  !offline
                    ? "Offline experience enabled. API requests are paused."
                    : "Online demo restored. Your saved requests remain available.",
                );
              }}
            >
              {offline ? "Return online" : "Try offline"}{" "}
              <ArrowRight size={13} />
            </button>
          </div>
          {!copy[language] && (
            <div className="language-note">
              {languages.find((l) => l.code === language)?.label}: regional pack
              preview. Hindi interface is shown while translations await
              native-speaker review. AI can attempt this language when
              configured.
            </div>
          )}
          {view === "home" && (
            <>
              <section className="hero-grid">
                <div className="hero-copy">
                  <div className="eyebrow">
                    <span className="orange-dash" /> PEOPLE FIRST. ALWAYS.
                  </div>
                  <h1>
                    {t.title.split("\n").map((line, i) => (
                      <span key={i}>{line}</span>
                    ))}
                  </h1>
                  <p>{t.subtitle}</p>
                  <div className="hero-buttons">
                    <button
                      className="button primary"
                      onClick={() => setHelp(true)}
                    >
                      <LifeBuoy size={19} />
                      {t.help}
                      <ArrowUpRight size={17} />
                    </button>
                    <button
                      className={"button secondary " + (safe ? "checked" : "")}
                      onClick={checkIn}
                    >
                      {safe ? <CheckCircle2 size={18} /> : <Heart size={18} />}{" "}
                      {safe ? "Check-in saved" : t.safe}
                    </button>
                  </div>
                  <div className="reassurance">
                    <ShieldCheck size={15} />
                    <span>Your requests stay saved on this device.</span>
                  </div>
                </div>
                <div className="hero-world">
                  <div className="world-label">
                    <span className="live-dot" /> COMMUNITY IN ACTION{" "}
                    <span>INTERACTIVE 3D</span>
                  </div>
                  <Suspense
                    fallback={
                      <div className="scene-loading">
                        <Radio />
                        Your community is taking shape…
                      </div>
                    }
                  >
                    <Simulation
                      mode="flood"
                      onRequestHelp={() => setHelp(true)}
                    />
                  </Suspense>
                  <button
                    className="world-expand"
                    onClick={() => {
                      setHardware(false);
                      go("simulation");
                    }}
                  >
                    Explore the flood scenario <ArrowUpRight size={15} />
                  </button>
                </div>
              </section>
              <section className="stat-grid" aria-label="Scenario overview">
                <div>
                  <span className="stat-icon sage">
                    <Radio size={21} />
                  </span>
                  <div>
                    <strong>
                      03 <small>demo nodes</small>
                    </strong>
                    <p>One community network</p>
                  </div>
                </div>
                <div>
                  <span className="stat-icon peach">
                    <Users size={21} />
                  </span>
                  <div>
                    <strong>
                      {requests.reduce((n, r) => n + r.people, 0)}{" "}
                      <small>people in requests</small>
                    </strong>
                    <p>Illustrative scenario data</p>
                  </div>
                </div>
                <div>
                  <span className="stat-icon sand">
                    <BookOpen size={21} />
                  </span>
                  <div>
                    <strong>
                      06 <small>saved guides</small>
                    </strong>
                    <p>Knowledge that stays close</p>
                  </div>
                </div>
              </section>
              <section className="dashboard-grid">
                <div className="card community-card">
                  <div className="section-heading">
                    <div>
                      <div className="eyebrow">LOOKING OUT FOR EACH OTHER</div>
                      <h2>{t.greeting}</h2>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="View community"
                      onClick={() => go("community")}
                    >
                      <ArrowUpRight size={20} />
                    </button>
                  </div>
                  {requests.slice(0, 2).map((r, i) => (
                    <div className="request-row" key={r.id}>
                      <div className={"person-avatar a" + i}>
                        {r.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <strong>
                          {r.name}{" "}
                          <span className="muted">
                            needs {r.category.toLowerCase()}
                          </span>
                        </strong>
                        <p>
                          <MapPin size={12} />
                          {r.location}
                        </p>
                      </div>
                      <span className="request-tag">{r.people} people</span>
                    </div>
                  ))}
                  <button className="text-link" onClick={() => go("community")}>
                    Visit your community <ArrowRight size={15} />
                  </button>
                </div>
                <div className="card knowledge-promo">
                  <div className="book-illustration">
                    <BookOpen size={47} />
                    <span className="spark one">✦</span>
                    <span className="spark two">✧</span>
                  </div>
                  <div>
                    <div className="eyebrow">INFORMATION YOU CAN KEEP</div>
                    <h2>
                      A little knowledge.
                      <br />A little more certainty.
                    </h2>
                    <p>
                      Simple guides and source-linked information, prepared for
                      this device.
                    </p>
                    <button
                      className="text-link"
                      onClick={() => go("knowledge")}
                    >
                      Open your knowledge pack <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </section>
              <section className="alert-strip">
                <div className="alert-symbol">
                  <CloudSun size={23} />
                </div>
                <div>
                  <strong>
                    A real setting. A clearly labeled demonstration.
                  </strong>
                  <p>
                    Inspired by Nepal’s September 2024 floods. People, shelters,
                    requests, and radio connections are simulated.
                  </p>
                </div>
                <button onClick={() => go("alerts")}>
                  View saved alerts <ArrowRight size={14} />
                </button>
              </section>
            </>
          )}
          {view === "community" && (
            <>
              <PageTitle
                eyebrow="NO ONE SHOULD FACE IT ALONE"
                title="Your community"
                text="Share what you need. Offer what you can. Every small act brings us closer."
              />
              <div className="tabs">
                {["All", "Requests", "Offering help"].map((f) => (
                  <button
                    key={f}
                    className={filter === f ? "selected" : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
                <button
                  className="button primary small"
                  onClick={() => setHelp(true)}
                >
                  <Plus size={16} /> Ask for help
                </button>
              </div>
              <div className="community-grid">
                <section className="feed">
                  {filter !== "Offering help" &&
                    requests.map((r, i) => (
                      <div className="card feed-card" key={r.id}>
                        <div className="feed-author">
                          <div className={"person-avatar a" + (i % 3)}>
                            {r.name[0]}
                          </div>
                          <div>
                            <strong>{r.name}</strong>
                            <p>{r.createdAt}</p>
                          </div>
                          <span className="tag orange">{r.category}</span>
                        </div>
                        <p className="feed-message">{r.message}</p>
                        <div className="feed-meta">
                          <span>
                            <MapPin size={14} />
                            {r.location}
                          </span>
                          <span>
                            <Users size={14} />
                            {r.people} people
                          </span>
                        </div>
                        <div className="feed-bottom">
                          <span className="status-badge">
                            <Clock size={13} />
                            {r.status}
                          </span>
                          <button
                            onClick={() => {
                              go("coordinator");
                              toast(
                                "Open the relief desk to acknowledge or assign this scenario request.",
                              );
                            }}
                          >
                            View at relief desk <ArrowUpRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  {filter !== "Requests" &&
                    posts.map((p, i) => (
                      <div className="card feed-card" key={i}>
                        <div className="feed-author">
                          <div className="person-avatar a2">
                            <Heart size={18} />
                          </div>
                          <div>
                            <strong>{p.name}</strong>
                            <p>{p.tag}</p>
                          </div>
                        </div>
                        <p className="feed-message">{p.text}</p>
                        <span className="tag green">Community update</span>
                      </div>
                    ))}
                </section>
                <aside>
                  <div className="card compose">
                    <span className="eyebrow">SOMETHING TO SHARE?</span>
                    <h2>Start with a small act.</h2>
                    <textarea
                      aria-label="Community update"
                      value={communityText}
                      onChange={(e) => setCommunityText(e.target.value)}
                      placeholder="I can offer blankets, share an update…"
                      maxLength={400}
                    />
                    <button
                      className="button primary"
                      disabled={!communityText.trim()}
                      onClick={() => {
                        setPosts((p) => [
                          {
                            name: "You",
                            text: communityText,
                            tag: "Saved in this browser · demo",
                          },
                          ...p,
                        ]);
                        setCommunityText("");
                        toast("Community update saved in this browser.");
                      }}
                    >
                      Share an update <Send size={15} />
                    </button>
                    <p className="fine-print">
                      Scenario feed. This version stores updates in your
                      browser; radio and multi-device delivery are simulated.
                    </p>
                  </div>
                  <div className="kind-note">
                    <Heart size={21} />
                    <h3>Kindness travels.</h3>
                    <p>
                      Keep messages clear. Share only information you have
                      permission to share.
                    </p>
                  </div>
                </aside>
              </div>
            </>
          )}
          {view === "ask" && (
            <>
              <PageTitle
                eyebrow="A LITTLE CLARITY GOES A LONG WAY"
                title="Ask Together"
                text="Find your way through saved information, ask a question, or turn a long message into a clear request."
              />
              <div className="chat-layout">
                <section className="card chat-panel">
                  <div className="chat-header">
                    <div className="ai-mark">
                      <Sparkles size={21} />
                    </div>
                    <div>
                      <strong>A helping hand, in your language</strong>
                      <p>
                        {disconnected
                          ? "Saved knowledge only"
                          : apiStatus?.enabled
                            ? "API connections enabled"
                            : "Sample answers · API keys coming next"}
                      </p>
                    </div>
                    <select
                      aria-label="AI provider"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                    >
                      <option value="cerebras">
                        Cerebras · OpenAI gpt-oss
                      </option>
                      <option value="openai">OpenAI</option>
                    </select>
                  </div>
                  <div className="chat-messages" aria-live="polite">
                    {chat.length === 0 ? (
                      <div className="chat-welcome">
                        <div className="large-ai">
                          <Sparkles size={35} />
                        </div>
                        <h2>What would help right now?</h2>
                        <p>
                          Start with a question. Answers show their source and
                          whether they came from a live API or a sample.
                        </p>
                        <div className="suggestions">
                          {[
                            "Help me write a clear request",
                            "What works without internet?",
                            "How do I verify an alert?",
                          ].map((s) => (
                            <button key={s} onClick={() => sendChat(s)}>
                              {s}
                              <ArrowUpRight size={15} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      chat.map((m, i) => (
                        <div className={"chat-bubble " + m.role} key={i}>
                          {m.role === "assistant" && (
                            <span className="response-source">
                              <Sparkles size={12} />
                              {m.provider} ·{" "}
                              {m.mode === "live"
                                ? "Live API"
                                : m.mode === "offline"
                                  ? "Offline guide"
                                  : "Sample / unavailable"}
                            </span>
                          )}
                          <p>{m.text}</p>
                          {m.sources?.map((s, i) => (
                            <a
                              key={i}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {s.title || "Source"} <ExternalLink size={12} />
                            </a>
                          ))}
                        </div>
                      ))
                    )}
                    {busy && (
                      <div className="thinking">
                        Finding a little clarity<span>•••</span>
                      </div>
                    )}
                  </div>
                  <form
                    className="chat-input"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendChat();
                    }}
                  >
                    <button
                      type="button"
                      className={
                        "icon-button " + (recording ? "recording" : "")
                      }
                      aria-label={
                        recording ? "Stop recording" : "Record voice message"
                      }
                      onClick={toggleRecord}
                    >
                      {recording ? <Square size={17} /> : <Mic size={19} />}
                    </button>
                    <input
                      aria-label="Ask Together"
                      placeholder={
                        language === "hi"
                          ? "अपना सवाल यहाँ लिखें…"
                          : "Ask a question, in your words…"
                      }
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      maxLength={1200}
                    />
                    <button
                      className="send-button"
                      aria-label="Send question"
                      disabled={busy || !prompt.trim()}
                    >
                      <ArrowRight size={20} />
                    </button>
                  </form>
                  <p className="chat-disclaimer">
                    AI can make mistakes. Confirm operational information with
                    an authorized coordinator. New AI answers need internet in
                    this MVP.
                  </p>
                </section>
                <aside className="ask-aside">
                  <div className="card">
                    <ShieldCheck size={26} />
                    <h3>Sources, not guesswork.</h3>
                    <p>
                      The demo uses a small curated knowledge pack. Live answers
                      stay grounded in supplied context.
                    </p>
                    <button
                      className="text-link"
                      onClick={() => go("knowledge")}
                    >
                      Browse the guides <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="card warm">
                    <Radio size={26} />
                    <h3>The future is closer.</h3>
                    <p>
                      A physical relief node could serve local AI and knowledge
                      over Wi-Fi. Here, AI inference runs through cloud APIs.
                    </p>
                    <button
                      className="text-link"
                      onClick={() => {
                        setHardware(true);
                        go("simulation");
                      }}
                    >
                      See the node <ArrowRight size={14} />
                    </button>
                  </div>
                </aside>
              </div>
            </>
          )}
          {view === "alerts" && (
            <>
              <PageTitle
                eyebrow="KNOW THE SOURCE. KNOW THE TIME."
                title="Alerts & authority updates"
                text="Keep the original source close. Saved information includes its date and review status so an old update never looks like a new warning."
              />
              <div className="alert-source-banner">
                <ShieldCheck size={23} />
                <div>
                  <strong>Reference pack · no live alert feed connected</strong>
                  <p>
                    These cards demonstrate saved official-source information.
                    Exa research findings are reviewed separately at the relief
                    desk.
                  </p>
                </div>
              </div>
              <div className="authority-grid">
                <article className="card authority-card">
                  <span className="tag orange">HISTORICAL REFERENCE</span>
                  <h2>Nepal floods · September 2024</h2>
                  <p>
                    UNICEF documented flooding after heavy rainfall on 27–28
                    September 2024, with damaged infrastructure and roads
                    obstructing access. This is the historical setting for our
                    illustrated scenario.
                  </p>
                  <dl>
                    <div>
                      <dt>Source</dt>
                      <dd>UNICEF Nepal</dd>
                    </div>
                    <div>
                      <dt>Published</dt>
                      <dd>1 October 2024</dd>
                    </div>
                    <div>
                      <dt>Validity</dt>
                      <dd>Historical context · not an active warning</dd>
                    </div>
                  </dl>
                  <a
                    className="text-link"
                    href="https://www.unicef.org/media/163091/file/Nepal-Humanitarian-SitRep-Floods-01-October-2024.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read the original report <ExternalLink size={14} />
                  </a>
                </article>
                <article className="card authority-card">
                  <span className="tag green">GOVERNMENT SOURCE DIRECTORY</span>
                  <h2>India · NDMA SACHET</h2>
                  <p>
                    SACHET is the official national disaster alert portal. It
                    supports multilingual, geographically targeted alerts. This
                    saved card identifies the source; it does not claim that a
                    current warning has been fetched.
                  </p>
                  <dl>
                    <div>
                      <dt>Issuer</dt>
                      <dd>National Disaster Management Authority</dd>
                    </div>
                    <div>
                      <dt>Feed status</dt>
                      <dd>Live feed integration planned</dd>
                    </div>
                    <div>
                      <dt>Offline behavior</dt>
                      <dd>Previously saved card only</dd>
                    </div>
                  </dl>
                  <a
                    className="text-link"
                    href="https://sachet.ndma.gov.in/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open official alert portal <ExternalLink size={14} />
                  </a>
                </article>
              </div>
              <div className="gov-callout">
                <Globe size={27} />
                <div>
                  <h2>Prepare a district information pack.</h2>
                  <p>
                    Use Exa to gather source-linked government and humanitarian
                    information for coordinator review.
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => go("coordinator")}
                >
                  Open relief desk <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}
          {view === "knowledge" && (
            <>
              <PageTitle
                eyebrow="GOOD INFORMATION STAYS WITH YOU"
                title="Your knowledge pack"
                text="A small library for uncertain moments. Clear sources, simple words, and information you can keep close."
              />
              <div className="pack-banner">
                <div className="stat-icon sage">
                  <Download size={25} />
                </div>
                <div>
                  <h3>
                    {pack
                      ? "Your device pack is prepared"
                      : "Take a little certainty with you."}
                  </h3>
                  <p>
                    6 concise guides · source links · application cache ·
                    text-first, lightweight
                  </p>
                </div>
                <button
                  className="button dark"
                  onClick={preparePack}
                  disabled={packBusy}
                >
                  {packBusy
                    ? "Preparing…"
                    : pack
                      ? "Refresh offline pack"
                      : "Prepare offline pack"}
                  {pack ? <RefreshCw size={16} /> : <Download size={16} />}
                </button>
              </div>
              <div className="search-field">
                <Search size={18} />
                <input
                  aria-label="Search saved guides"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your saved guides…"
                />
              </div>
              <div className="knowledge-grid">
                {filtered.map((k, i) => (
                  <button
                    className="card knowledge-card"
                    key={k.id}
                    onClick={() => setArticle(k)}
                  >
                    <span className={"guide-icon guide-" + i}>
                      {
                        [
                          <Users />,
                          <CloudSun />,
                          <MessageCircle />,
                          <ShieldCheck />,
                          <Download />,
                          <Package />,
                        ][i]
                      }
                    </span>
                    <span className="eyebrow">{k.category}</span>
                    <h2>{k.title}</h2>
                    <p>{k.description}</p>
                    <div>
                      <span>
                        <Check size={13} /> Included in this app
                      </span>
                      <ArrowUpRight size={18} />
                    </div>
                  </button>
                ))}
              </div>
              {!filtered.length && (
                <div className="empty-state">
                  No saved guide matches that search.
                </div>
              )}
              <p className="fine-print">
                Selected original explainers and guides, not a full Wikipedia
                archive. Source pages require connectivity; included text is
                available in the prepared app.
              </p>
            </>
          )}
          {view === "simulation" && (
            <>
              <PageTitle
                eyebrow="THE BIG PICTURE, MADE HUMAN"
                title={
                  hardware
                    ? "Meet a Together node."
                    : "A community. A connection. A way forward."
                }
                text={
                  hardware
                    ? "Explore the Raspberry Pi hub, ESP32 radio, LoRa antenna, and the people they connect."
                    : "Explore a Himalayan flood scenario. Tap a person or node and see how help can move through a community."
                }
              />
              <div className="tabs simulation-tabs">
                <button
                  className={!hardware ? "selected" : ""}
                  onClick={() => setHardware(false)}
                >
                  <CloudSun size={16} /> Flood story
                </button>
                <button
                  className={hardware ? "selected" : ""}
                  onClick={() => setHardware(true)}
                >
                  <Radio size={16} /> Inside the IoT node
                </button>
                <span className="tag">Interactive 3D · illustrative</span>
              </div>
              <div className="full-simulation">
                <Suspense
                  fallback={
                    <div className="scene-loading">Building the view…</div>
                  }
                >
                  <Simulation
                    mode={hardware ? "hardware" : "flood"}
                    onRequestHelp={() => setHelp(true)}
                  />
                </Suspense>
              </div>
              <div className="architecture-cards">
                <div className="card">
                  <span>01 / NEARBY</span>
                  <h3>Your phone → local Wi-Fi</h3>
                  <p>
                    People join a relief node’s network to use the app and
                    access information nearby.
                  </p>
                </div>
                <div className="card">
                  <span>02 / BETWEEN CAMPS</span>
                  <h3>ESP32 + LoRa radio</h3>
                  <p>
                    Short text requests can travel between equipped nodes.
                    Physical radios are simulated here.
                  </p>
                </div>
                <div className="card">
                  <span>03 / WHEN CONNECTED</span>
                  <h3>OpenAI · Cerebras · Exa</h3>
                  <p>
                    Cloud AI and sourced web research prepare useful answers and
                    coordination briefings.
                  </p>
                </div>
              </div>
            </>
          )}
          {view === "coordinator" && (
            <>
              <PageTitle
                eyebrow="HELPING THE HELPERS"
                title="The relief desk"
                text="A shared picture of community needs. Acknowledge requests, coordinate resources, and prepare a sourced district briefing."
              />
              <div className="coordinator-summary">
                <div className="card">
                  <span>REQUESTS IN THIS DEMO</span>
                  <strong>{requests.length}</strong>
                </div>
                <div className="card">
                  <span>AWAITING ACKNOWLEDGEMENT</span>
                  <strong>
                    {
                      requests.filter(
                        (r) => !["Assigned", "Acknowledged"].includes(r.status),
                      ).length
                    }
                  </strong>
                </div>
                <div className="card">
                  <span>PEOPLE CHECKED IN</span>
                  <strong>
                    {safe ? "1" : "0"}
                    <small> on this device</small>
                  </strong>
                </div>
              </div>
              <div className="section-heading">
                <h2>Every request is a person.</h2>
                <button
                  className="button secondary small"
                  onClick={exportRequests}
                >
                  <Download size={15} /> Export demo data
                </button>
              </div>
              <div className="request-table card">
                <table>
                  <thead>
                    <tr>
                      <th>PERSON & REQUEST</th>
                      <th>LOCATION</th>
                      <th>PEOPLE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.name}</strong>
                          <span>
                            {r.category} · {r.id}
                          </span>
                          {routing[r.id] && <span>{routing[r.id]}</span>}
                        </td>
                        <td>{r.location}</td>
                        <td>{r.people}</td>
                        <td>
                          <span
                            className={
                              "tag " + (r.status === "Assigned" ? "green" : "")
                            }
                          >
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <button
                            disabled={r.status === "Assigned"}
                            onClick={() => {
                              setRequests((all) =>
                                all.map((item) =>
                                  item.id === r.id
                                    ? {
                                        ...item,
                                        status:
                                          r.status === "Acknowledged"
                                            ? "Assigned"
                                            : "Acknowledged",
                                      }
                                    : item,
                                ),
                              );
                              toast(
                                r.status === "Acknowledged"
                                  ? "Demo resource assignment recorded. No real responder has been dispatched."
                                  : "Acknowledgement recorded in this browser.",
                              );
                            }}
                          >
                            {r.status === "Assigned" ? (
                              <Check size={16} />
                            ) : r.status === "Acknowledged" ? (
                              "Assign support"
                            ) : (
                              "Acknowledge"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="briefing-grid">
                <section className="card briefing">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        EXA RESEARCH · OFFICIAL SOURCES
                      </span>
                      <h2>A clearer picture of your district.</h2>
                    </div>
                    <Globe size={27} />
                  </div>
                  <p>
                    Prepare a source-linked briefing for {currentRegion}. Review
                    findings before including them in a community information
                    pack.
                  </p>
                  <button
                    className="button dark"
                    onClick={makeBrief}
                    disabled={briefBusy}
                  >
                    {briefBusy
                      ? "Researching official sources…"
                      : "Prepare district briefing"}{" "}
                    <ArrowUpRight size={16} />
                  </button>
                  {brief && (
                    <div className="brief-output">
                      <span className="tag">
                        {brief.mode === "live"
                          ? "Live Exa research"
                          : "Sample briefing · API key needed"}
                      </span>
                      <p>
                        {brief.answer ||
                          brief.error ||
                          "Research is in progress."}
                      </p>
                      {(brief.sources || []).map((s: any, i: number) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.title || s.url} <ExternalLink size={12} />
                        </a>
                      ))}
                      {brief.cards?.map((c: any, i: number) => (
                        <div key={i}>
                          <strong>{c.title}</strong>
                          <p>{c.summary || c.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                <section className="card resource-card">
                  <span className="eyebrow">SCENARIO RESOURCE BOARD</span>
                  <h2>Small supplies. Big difference.</h2>
                  {[
                    ["Blankets", "24 available"],
                    ["Water containers", "12 available"],
                    ["Shelter spaces", "18 available"],
                  ].map(([a, b]) => (
                    <div className="resource-row" key={a}>
                      <Package size={17} />
                      <strong>{a}</strong>
                      <span>{b}</span>
                    </div>
                  ))}
                  <p className="fine-print">
                    Illustrative inventory. Assignments require a coordinator.
                    This browser demo does not connect to real emergency
                    services.
                  </p>
                </section>
              </div>
              <div className="gov-callout">
                <Building2 size={28} />
                <div>
                  <h2>Prepared before the next emergency.</h2>
                  <p>
                    Designed for district authorities: pre-positioned hubs,
                    local-language information packs, readiness drills, and
                    annual support.
                  </p>
                </div>
                <a href="/project#business">
                  Explore the pilot <ArrowUpRight size={17} />
                </a>
              </div>
            </>
          )}
          <footer className="page-footer">
            <span>
              <img src="/brand/mark.svg" alt="" /> Built for the moments we need
              each other.
            </span>
            <span>
              Built with <b>Codex</b> · <b>ChatGPT Sites</b> · OpenAI · Cerebras
              · Exa
            </span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems
          .filter((n) => n.id !== "coordinator" && n.id !== "alerts")
          .map(({ id, icon: Icon }) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              aria-label={t[id]}
              onClick={() => go(id)}
            >
              <Icon size={20} />
              <span>
                {id === "home"
                  ? "Home"
                  : id === "simulation"
                    ? "Explore"
                    : id === "knowledge"
                      ? "Guides"
                      : id === "ask"
                        ? "Ask AI"
                        : "Community"}
              </span>
            </button>
          ))}
      </nav>
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {help && (
        <HelpModal
          disconnected={disconnected}
          onClose={() => setHelp(false)}
          onSubmit={saveRequest}
        />
      )}
      {article && (
        <div className="modal-backdrop" onClick={() => setArticle(null)}>
          <section
            className="modal article-modal"
            role="dialog"
            aria-modal="true"
            aria-label={article.title}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close article"
              onClick={() => setArticle(null)}
            >
              <X />
            </button>
            <span className="eyebrow">{article.category}</span>
            <h2>{article.title}</h2>
            <p className="article-body">{article.body}</p>
            <div className="source-box">
              <ShieldCheck size={19} />
              <div>
                <strong>{article.source}</strong>
                <p>Included text · prepared for the hackathon demo</p>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                aria-label="Open source"
              >
                <ExternalLink size={18} />
              </a>
            </div>
            <button className="button dark" onClick={() => setArticle(null)}>
              Got it <Check size={16} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
function PageTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="page-title">
      <div className="eyebrow">
        <span className="orange-dash" />
        {eyebrow}
      </div>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}
function HelpModal({
  onClose,
  onSubmit,
  disconnected,
}: {
  onClose: () => void;
  onSubmit: (r: ReliefRequest) => void;
  disconnected: boolean;
}) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    ref.current?.querySelector("input")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          aria-label="Close help request"
          onClick={onClose}
        >
          <X />
        </button>
        <div className="modal-icon">
          <LifeBuoy size={26} />
        </div>
        <span className="eyebrow">WE’RE HERE TO LISTEN</span>
        <h2 id="help-title">What do you need?</h2>
        <p>A clear request helps coordinators understand your situation.</p>
        <form
          ref={ref}
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            onSubmit({
              id: "TG-" + Date.now().toString(36).toUpperCase(),
              name: String(d.get("name") || "You"),
              category: String(d.get("category")),
              people: Number(d.get("people")),
              location: String(d.get("location")),
              message: String(d.get("message")),
              status: disconnected
                ? "Saved on this device"
                : "Received at demo node",
              createdAt: new Date().toLocaleString(),
            });
          }}
        >
          <div className="form-grid">
            <label>
              Your name
              <input
                name="name"
                placeholder="Name or initials"
                maxLength={40}
                required
              />
            </label>
            <label>
              People with you
              <input
                type="number"
                name="people"
                min={1}
                max={99}
                defaultValue={1}
                required
              />
            </label>
          </div>
          <label>
            What kind of help?
            <select name="category">
              <option>Drinking water</option>
              <option>Shelter</option>
              <option>Rescue assistance</option>
              <option>Food and supplies</option>
              <option>Family check-in</option>
            </select>
          </label>
          <label>
            Where are you?
            <input
              name="location"
              placeholder="A landmark, building, or demo zone"
              maxLength={100}
              required
            />
          </label>
          <label>
            Tell us a little more
            <textarea
              name="message"
              placeholder="What would help? Keep important details clear."
              maxLength={500}
              required
            />
          </label>
          <div className="form-notice">
            <Info size={17} />
            <span>
              This is a demonstration. Requests are saved in this browser; no
              real responder is contacted.
            </span>
          </div>
          <button className="button primary" type="submit">
            {disconnected
              ? "Save request on device"
              : "Send to demo relief desk"}
            <ArrowRight size={17} />
          </button>
        </form>
      </section>
    </div>
  );
}
