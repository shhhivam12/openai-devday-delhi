"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCheck, ChevronRight, CircleHelp, FileText, Globe2, Languages, LoaderCircle, MessageCircle, Search, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import "./coordinator-workspace.css";

type Source = { title: string; summary: string; sourceUrl: string; publishedAt: string | null; retrievedAt?: string };
type Counts = { open: number; checkedIn: number; messages: number; byCategory: Record<string, number> };
type Pack = { v: number; region: string; expiresAt: number; cards: Source[]; signature: string };
type Research = { ok: boolean; error?: string; pending?: boolean; runId?: string; ticket?: string; pollAfterMs?: number; cards?: Source[]; pack?: Pack; mode?: string; cached?: boolean };
type AssistantResult = { ok: boolean; error?: string; answer: string; sources?: Source[]; mode?: string; elapsedMs?: number };
type Task = "brief" | "translate" | "gaps" | "handover" | "chat";
type Turn = { id: string; role: "user" | "assistant"; text: string; sources?: Source[]; mode?: string; elapsedMs?: number; task?: Task; region?: string };
const actions: { task: Task; label: string; prompt: string; icon: typeof FileText; needsSources: boolean }[] = [
  { task: "brief", label: "Summarise sources", prompt: "Give me a concise coordinator briefing from the selected sources, with dates and citations.", icon: FileText, needsSources: true },
  { task: "translate", label: "Draft a Hindi update", prompt: "Draft a short Hindi community information update from these sources. Make its dates and draft status clear.", icon: Languages, needsSources: true },
  { task: "gaps", label: "What needs checking?", prompt: "What do these documents leave unknown? Give me a verification checklist before sharing anything.", icon: CircleHelp, needsSources: true },
  { task: "handover", label: "Prepare shift handover", prompt: "Prepare a handover from this hub’s aggregate exercise-room counts, with follow-up questions for the next coordinator.", icon: CheckCheck, needsSources: false },
];
const regions: Record<string, string> = { nepal: "Kathmandu Valley, Nepal", uttarakhand: "Uttarakhand, India", himachal: "Himachal Pradesh, India" };
function readableDate(value?: string | null) {
  if (!value) return "Issue date unknown";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
export default function CoordinatorWorkspace({ counts, nodeName, onUseDraft }: { counts: Counts; nodeName: string; onUseDraft: (text: string) => void }) {
  const [region, setRegion] = useState("nepal");
  const [purpose, setPurpose] = useState("preparedness");
  const [research, setResearch] = useState<Research | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [researching, setResearching] = useState(false);
  const [researchError, setResearchError] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chatError, setChatError] = useState("");
  const [saved, setSaved] = useState("");
  const researchAbort = useRef<AbortController | null>(null);
  const chatAbort = useRef<AbortController | null>(null);
  const chatBottom = useRef<HTMLDivElement>(null);
  const canUseSources = !!research?.pack && selected.length > 0 && research.mode === "live";
  useEffect(() => () => { researchAbort.current?.abort(); chatAbort.current?.abort(); }, []);
  useEffect(() => { if (turns.length || thinking) chatBottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [turns.length, thinking]);
  function clearResearch() { researchAbort.current?.abort(); setResearch(null); setSelected([]); setResearchError(""); setResearching(false); }
  async function runResearch() {
    if (researching || thinking) return;
    const abort = new AbortController(); researchAbort.current?.abort(); researchAbort.current = abort;
    setResearching(true); setResearchError(""); setResearch(null); setSelected([]);
    try {
      async function accept(response: Response) {
        const data = await response.json() as Research;
        if (!response.ok || !data.ok) throw Error(data.error || "Could not research this district.");
        if (abort.signal.aborted) return data;
        setResearch(data);
        if (data.cards) setSelected(data.cards.map((_, i) => i));
        return data;
      }
      let data = await accept(await fetch("/api/briefing", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ region, purpose }), signal: abort.signal }));
      for (let attempt = 0; data.pending && attempt < 30; attempt++) {
        if (!data.runId || !data.ticket) throw Error("Research is still running. Try again shortly.");
        await new Promise<void>((resolve, reject) => {
          const finish = () => { abort.signal.removeEventListener("abort", cancel); resolve(); };
          const timer = setTimeout(finish, Math.min(Math.max(data.pollAfterMs || 4000, 2000), 8000));
          const cancel = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
          abort.signal.addEventListener("abort", cancel, { once: true });
        });
        data = await accept(await fetch("/api/briefing?runId=" + encodeURIComponent(data.runId) + "&ticket=" + encodeURIComponent(data.ticket), { signal: abort.signal, cache: "no-store" }));
      }
      if (data.pending) throw Error("Exa is still researching. Try research again shortly to resume this run.");
    } catch (e) { if (!abort.signal.aborted) setResearchError(e instanceof Error ? e.message : "Research unavailable."); }
    finally { if (!abort.signal.aborted) setResearching(false); }
  }
  async function ask(task: Task, prompt: string) {
    if (thinking || researching || !prompt.trim() || task !== "handover" && !canUseSources) return;
    const abort = new AbortController(); chatAbort.current = abort;
    const userTurn: Turn = { id: crypto.randomUUID(), role: "user", text: prompt, task };
    setTurns(old => [...old, userTurn]); setQuestion(""); setThinking(true); setChatError("");
    try {
      const response = await fetch("/api/coordinator", { method: "POST", headers: { "content-type": "application/json" }, signal: abort.signal, body: JSON.stringify({ task, message: prompt, pack: research?.pack, selected, counts, history: turns.slice(-4).map(t => ({ role: t.role, content: t.text.slice(0, 1000) })) }) });
      const data = await response.json() as AssistantResult;
      if (!response.ok || !data.ok) throw Error(data.error || "Could not prepare a draft.");
      if (!abort.signal.aborted) setTurns(old => [...old, { id: crypto.randomUUID(), role: "assistant", text: data.answer, sources: data.sources, mode: data.mode, elapsedMs: data.elapsedMs, task, region }]);
    } catch (e) { if (!abort.signal.aborted) { setChatError(e instanceof Error ? e.message : "Assistant unavailable."); setQuestion(prompt); } }
    finally { if (!abort.signal.aborted) setThinking(false); }
  }
  function draftText(turn: Turn) {
    return `DRAFT — COORDINATOR REVIEW REQUIRED\n${nodeName}${turn.task !== "handover" ? " · " + regions[turn.region || region] : ""}\n\n${turn.text}\n\n${turn.sources?.length ? "Sources supplied:\n" + turn.sources.map((s, i) => `[${i + 1}] ${s.title} · ${s.publishedAt || "date unknown"}\n${s.sourceUrl}`).join("\n") : "Based on aggregate exercise-room counts."}\n\nGenerated with Cerebras. No alert or dispatch has been published.`;
  }
  function download(turn: Turn) {
    const url = URL.createObjectURL(new Blob([draftText(turn)], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "together-coordinator-draft.txt"; a.click(); URL.revokeObjectURL(url); setSaved("Draft downloaded. Review before sharing.");
  }
  return <section className="cw" aria-label="Coordinator AI workspace">
    <div className="cw-flow" aria-label="Research and drafting workflow">
      <div><span className="cw-flow-icon"><Globe2 size={22}/></span><span><strong>Find the evidence</strong><small>Exa · official-source research</small></span></div>
      <ArrowRight className="cw-flow-arrow" size={19}/>
      <div><span className="cw-flow-icon"><Sparkles size={22}/></span><span><strong>Make it useful</strong><small>Cerebras · grounded drafts</small></span></div>
      <ArrowRight className="cw-flow-arrow" size={19}/>
      <div><span className="cw-flow-icon"><ShieldCheck size={22}/></span><span><strong>You review. You decide.</strong><small>Nothing is automatically published</small></span></div>
    </div>
    <div className="cw-grid">
      <aside className="cw-research" aria-label="Exa research desk">
        <div className="cw-panel-heading"><span className="cw-provider-icon"><Search size={21}/></span><div><h2>Research desk</h2><p>Exa Agent</p></div><span className="cw-cloud-label">Internet</span></div>
        <label className="cw-field">District<select aria-label="Research district" value={region} disabled={thinking || researching} onChange={e => { clearResearch(); setRegion(e.target.value); }}>
          {Object.entries(regions).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select></label>
        <div className="cw-research-tabs" aria-label="Research focus">{[{ id: "preparedness", label: "Readiness guides", icon: BookOpen }, { id: "bulletins", label: "Issued bulletins", icon: Globe2 }].map(({ id, label, icon: Icon }) => <button key={id} aria-pressed={purpose === id} disabled={researching || thinking} onClick={() => { clearResearch(); setPurpose(id); }}><Icon size={16}/>{label}</button>)}</div>
        <button className="cw-primary cw-research-button" disabled={researching || thinking} onClick={runResearch}>{researching ? <LoaderCircle className="cw-spin" size={18}/> : <Search size={18}/>} {researching ? "Researching with Exa…" : research?.cards?.length ? "Research again" : "Research this district"}<ArrowUpRight size={17}/></button>
        {researching && <div className="cw-research-progress" role="status"><span className="cw-pulse"/><strong>{research?.pending ? "Exa research is running" : "Starting a research run"}</strong><p>Gathering source-linked findings. You can stop this view and continue coordinating.</p><button onClick={clearResearch}><X size={14}/> Stop waiting</button></div>}
        {researchError && <div className="cw-error" role="alert">{researchError}<button onClick={runResearch}>Try again</button></div>}
        {!!research?.cards?.length && <>
          <div className="cw-source-heading"><strong>{research.cards.length} findings</strong><span>{research.mode === "live" ? research.cached ? "Live research · cached" : "Live Exa research" : "Sample research"}</span></div>
          <p className="cw-selection-hint">Select the sources Cerebras should use.</p>
          <div className="cw-sources">{research.cards.map((source, i) => <article className={"cw-source " + (selected.includes(i) ? "is-selected" : "")} key={source.sourceUrl + i}>
            <label className="cw-source-select"><input type="checkbox" checked={selected.includes(i)} disabled={thinking} onChange={() => setSelected(old => old.includes(i) ? old.filter(n => n !== i) : [...old, i])}/><span>Source {i + 1}</span><small>Pending review</small></label>
            <h3>{source.title}</h3><p>{source.summary}</p>
            <span className="cw-source-date">Issued: {readableDate(source.publishedAt)}</span>
            {source.retrievedAt && <span className="cw-source-date">Retrieved: {readableDate(source.retrievedAt)}</span>}
            <a href={source.sourceUrl} target="_blank" rel="noreferrer">{new URL(source.sourceUrl).hostname}<ArrowUpRight size={14}/></a>
          </article>)}</div>
        </>}
        {!researching && !research?.cards?.length && !researchError && <div className="cw-research-empty"><div className="cw-document-art" aria-hidden="true"><FileText size={37}/><span><Check size={16}/></span></div><h3>Start with a source.</h3><p>Find dated guidance and bulletins from selected government and humanitarian websites.</p><span>Source links · Dates · Human review</span></div>}
        <p className="cw-research-note"><ShieldCheck size={15}/> Research findings are not official alerts. Current local conditions still need verification.</p>
      </aside>
      <section className="cw-assistant" aria-label="Cerebras coordinator chat">
        <div className="cw-panel-heading"><span className="cw-provider-icon"><Sparkles size={21}/></span><div><h2>Coordinator copilot</h2><p>OpenAI gpt-oss · Cerebras inference</p></div><span className="cw-cloud-label">Internet</span></div>
        <div className="cw-context-strip"><span><span className={"cw-context-dot " + (canUseSources ? "ready" : "")}/>{canUseSources ? `${selected.length} Exa sources selected` : "Select Exa sources for grounded drafting"}</span><span>{counts.open} open requests · {counts.checkedIn} people checked in</span></div>
        <div className="cw-chat-log" role="log" aria-label="Coordinator conversation" aria-live="polite">
          {!turns.length && <div className="cw-chat-empty"><span className="cw-chat-orb"><MessageCircle size={31}/><Sparkles size={18}/></span><h3>Less searching.<br/>More time for people.</h3><p>Turn selected evidence into a clear briefing, or prepare the next team’s handover.</p><div className="cw-starter-grid">{actions.map(({ task, label, prompt, icon: Icon, needsSources }) => <button key={task} disabled={thinking || researching || needsSources && !canUseSources} onClick={() => ask(task, prompt)}><Icon size={21}/><span>{label}<small>{needsSources ? "Uses selected Exa sources" : "Uses this hub’s exercise counts"}</small></span><ChevronRight size={17}/></button>)}</div></div>}
          {turns.map(turn => <article key={turn.id} className={"cw-turn cw-turn-" + turn.role}>
            <div className="cw-turn-label">{turn.role === "assistant" ? <><Sparkles size={15}/>{turn.mode === "live" ? "Cerebras · live draft" : "Sample workflow"}{typeof turn.elapsedMs === "number" && <small>{(turn.elapsedMs / 1000).toFixed(1)}s API response</small>}</> : <>You · coordinator</>}</div>
            <div className="cw-turn-text">{turn.text}</div>
            {!!turn.sources?.length && <div className="cw-answer-sources"><span>Sources supplied to this answer</span>{turn.sources.map((source, i) => <a href={source.sourceUrl} key={source.sourceUrl + i} target="_blank" rel="noreferrer">[{i + 1}] {source.title}<ArrowUpRight size={13}/></a>)}</div>}
            {turn.role === "assistant" && turn.mode === "live" && <div className="cw-draft-actions"><span><ShieldCheck size={13}/> Review required</span><button onClick={() => download(turn)}><ArrowDownToLine size={15}/>Save draft</button>{turn.task === "translate" && <button onClick={() => onUseDraft(draftText(turn))}><MessageCircle size={15}/>Use in community composer</button>}</div>}
          </article>)}
          {thinking && <div className="cw-thinking" role="status"><LoaderCircle className="cw-spin" size={18}/><span>Cerebras is preparing your draft…</span></div>}
          {chatError && <div className="cw-error" role="alert">{chatError}<span>Your question is back in the composer.</span></div>}
          <div ref={chatBottom}/>
        </div>
        <div className="cw-compose-area">
          {!!turns.length && <div className="cw-followups">{actions.map(({ task, label, prompt, icon: Icon, needsSources }) => <button key={task} disabled={thinking || researching || needsSources && !canUseSources} onClick={() => ask(task, prompt)}><Icon size={14}/>{label}</button>)}</div>}
          <form className="cw-composer" onSubmit={e => { e.preventDefault(); ask("chat", question); }}><label className="cw-sr-only" htmlFor="coordinator-question">Ask about the selected sources</label><textarea id="coordinator-question" value={question} onChange={e => setQuestion(e.target.value)} maxLength={1200} rows={2} disabled={thinking} placeholder={canUseSources ? "Ask about the selected evidence…" : "Research and select sources to ask a question…"} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask("chat", question); } }}/><button className="cw-send" type="submit" aria-label="Send coordinator question" disabled={thinking || researching || !canUseSources || !question.trim()}><Send size={20}/></button></form>
          <p className="cw-compose-note">Cloud AI for connected coordinators. Drafts stay here until you review them.</p>
          {saved && <div className="cw-save-status" role="status"><Check size={15}/>{saved}<button aria-label="Dismiss draft status" onClick={() => setSaved("")}><X size={14}/></button></div>}
        </div>
      </section>
    </div>
  </section>;
}
