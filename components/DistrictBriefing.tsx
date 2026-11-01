"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Clock3,
  FileText,
  Globe2,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import "./district-briefing.css";
type Card = {
  title: string;
  summary?: string;
  sourceUrl: string;
  sourceTitle?: string;
  publishedAt?: string | null;
  retrievedAt?: string;
  reviewStatus?: string;
  kind?: string;
};
type Result = {
  ok: boolean;
  mode?: string;
  error?: string;
  answer?: string;
  cards?: Card[];
  pending?: boolean;
  runId?: string;
  ticket?: string;
  pollAfterMs?: number;
  cached?: boolean;
};
export default function DistrictBriefing({ onClose }: { onClose: () => void }) {
  const [region, setRegion] = useState("nepal");
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const items = Array.from(
          dialog.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),select,a[href]",
          ) || [],
        );
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose]);
  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    setBusy(true);
    setError("");
    setResult(null);
    async function run() {
      try {
        let response = await fetch("/api/briefing", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ region }),
          signal: abort.signal,
        });
        let data = (await response.json()) as Result;
        if (!response.ok || !data.ok)
          throw Error(data.error || "Could not prepare the district brief");
        if (active) setResult(data);
        for (let attempt = 0; data.pending && attempt < 20; attempt++) {
          if (!data.runId || !data.ticket)
            throw Error("Research is still running. Try refreshing shortly.");
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(
              resolve,
              Math.min(Math.max(data.pollAfterMs || 4000, 2000), 8000),
            );
            abort.signal.addEventListener(
              "abort",
              () => {
                clearTimeout(timer);
                reject(new DOMException("Aborted", "AbortError"));
              },
              { once: true },
            );
          });
          if (!active) return;
          response = await fetch(
            "/api/briefing?runId=" +
              encodeURIComponent(data.runId) +
              "&ticket=" +
              encodeURIComponent(data.ticket),
            { signal: abort.signal, cache: "no-store" },
          );
          data = (await response.json()) as Result;
          if (!response.ok || !data.ok)
            throw Error(data.error || "Research could not be completed");
          if (active) setResult(data);
        }
      } catch (e) {
        if (active && !abort.signal.aborted)
          setError(e instanceof Error ? e.message : "Briefing unavailable");
      } finally {
        if (active) setBusy(false);
      }
    }
    run();
    return () => {
      active = false;
      abort.abort();
    };
  }, [region, refresh]);
  return (
    <div className="district-overlay" onClick={onClose}>
      <section
        className="district-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="district-title"
        ref={dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <span className="district-icon">
            <Globe2 size={22} />
          </span>
          <div>
            <h2 id="district-title">District brief</h2>
            <span>Exa Agent · source-linked research</span>
          </div>
          <button aria-label="Close district briefing" onClick={onClose}>
            <X size={21} />
          </button>
        </header>
        <div className="district-toolbar">
          <select
            aria-label="Briefing region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="nepal">Kathmandu Valley, Nepal</option>
            <option value="uttarakhand">Uttarakhand, India</option>
            <option value="himachal">Himachal Pradesh, India</option>
          </select>
          <button
            disabled={busy}
            aria-label="Refresh district brief"
            onClick={() => setRefresh((n) => n + 1)}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="district-body" aria-live="polite">
          {busy && (
            <div className="district-loading">
              <LoaderCircle size={25} />
              <strong>
                {result?.pending
                  ? "Researching official sources…"
                  : "Preparing your brief…"}
              </strong>
              <p>Saved community information stays available.</p>
            </div>
          )}
          {error && (
            <div className="district-error">
              <strong>Could not refresh the brief.</strong>
              <p>{error}</p>
              <button onClick={() => setRefresh((n) => n + 1)}>
                Try again <RefreshCw size={14} />
              </button>
            </div>
          )}
          {result && !error && (
            <>
              <div
                className={
                  "district-mode " + (result.mode === "live" ? "live" : "")
                }
              >
                <span />
                {result.mode === "live"
                  ? result.pending
                    ? "Live research in progress"
                    : "Live Exa research"
                  : "SAMPLE · API KEY NOT ENABLED"}
                {result.cached && <small>Cached</small>}
              </div>
              {!busy && result.pending && (
                <p className="district-pending">
                  <Clock3 size={16} />
                  Still researching. Refresh shortly to check progress.
                </p>
              )}
              {result.cards?.map((card, i) => (
                <article className="district-source" key={card.sourceUrl + i}>
                  <div className="district-source-meta">
                    <FileText size={14} />
                    <span>
                      {card.kind === "historical"
                        ? "Historical reference"
                        : card.reviewStatus === "pending"
                          ? "Pending coordinator review"
                          : "Source reference"}
                    </span>
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.summary}</p>
                  <div className="district-dates">
                    <span>Published: {card.publishedAt || "Not provided"}</span>
                    {card.retrievedAt && (
                      <span>
                        Retrieved:{" "}
                        {new Date(card.retrievedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {card.sourceUrl.startsWith("https://") && (
                    <a href={card.sourceUrl} target="_blank" rel="noreferrer">
                      {card.sourceTitle || new URL(card.sourceUrl).hostname}
                      <ArrowUpRight size={15} />
                    </a>
                  )}
                </article>
              ))}
            </>
          )}
        </div>
        <footer>
          <ShieldCheck size={17} />
          <span>
            Review sources before sharing. Research is not an official warning.
          </span>
        </footer>
      </section>
    </div>
  );
}
