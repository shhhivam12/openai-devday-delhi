"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Eye, Maximize2, Minimize2, SlidersHorizontal } from "lucide-react";
import "./scene-frame.css";

export default function SceneFrame({ title, children }: { title: string; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const native = useRef(false);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function close() {
    if (document.fullscreenElement === frame.current) {
      try { await document.exitFullscreen(); } catch { /* The expanded page can still close. */ }
    }
    native.current = false;
    setExpanded(false);
  }

  async function expand() {
    const element = frame.current;
    if (!element) return;
    restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : toggle.current;
    setExpanded(true);
    if (element.requestFullscreen) {
      try {
        await element.requestFullscreen();
        native.current = document.fullscreenElement === element;
      } catch {
        // Embedded browsers and iPhone Safari use the same controls in an expanded overlay.
        native.current = false;
      }
    }
  }

  useEffect(() => {
    const changed = () => {
      if (native.current && document.fullscreenElement !== frame.current) {
        native.current = false;
        setExpanded(false);
      }
    };
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => {
      if (frame.current) frame.current.scrollTop = 0;
      toggle.current?.focus({ preventScroll: true });
    });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        void close();
      }
      if (event.key !== "Tab" || !frame.current) return;
      const controls = Array.from(frame.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
      )).filter((element) => element.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || !frame.current.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !frame.current.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (restoreFocus.current?.isConnected) restoreFocus.current.focus({ preventScroll: true });
    };
  }, [expanded]);

  function show(which: "scene" | "controls") {
    const selector = which === "scene" ? "canvas" : "[data-scene-controls]";
    const target = frame.current?.querySelector(selector);
    target?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  return (
    <div ref={frame} className={`tg-scene-frame${expanded ? " is-expanded" : ""}`} role={expanded ? "dialog" : "region"} aria-modal={expanded || undefined} aria-label={expanded ? `${title} full screen` : title}>
      <div className="tg-scene-toolbar">
        <span className="tg-scene-title">{title}</span>
        <div className="tg-scene-actions">
          {expanded && <>
            <button type="button" className="tg-scene-jump" onClick={() => show("scene")} aria-label="Show 3D scene"><Eye size={17} /><span>Scene</span></button>
            <button type="button" className="tg-scene-jump" onClick={() => show("controls")} aria-label="Show simulation controls"><SlidersHorizontal size={17} /><span>Controls</span></button>
          </>}
          <button ref={toggle} type="button" className="tg-scene-expand" onClick={() => void (expanded ? close() : expand())} aria-expanded={expanded} aria-label={`${expanded ? "Exit" : "Enter"} full screen ${title}`}>
            {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            <span>{expanded ? "Exit" : "Full screen"}</span>
          </button>
        </div>
      </div>
      <div className="tg-scene-content">{children}</div>
    </div>
  );
}
