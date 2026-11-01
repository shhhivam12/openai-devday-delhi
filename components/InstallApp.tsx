"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDownToLine,
  Check,
  MoreVertical,
  Share,
  Smartphone,
  X,
} from "lucide-react";
import "./install-app.css";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
let pendingPrompt: InstallPromptEvent | null = null;
let installed = false;
let listening = false;
const subscribers = new Set<() => void>();
const notify = () => subscribers.forEach((subscriber) => subscriber());
function standalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
function listen() {
  if (listening) return;
  listening = true;
  installed = standalone();
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    pendingPrompt = event as InstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    pendingPrompt = null;
    notify();
  });
  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", () => {
      installed = standalone();
      notify();
    });
}

export default function InstallApp({
  variant = "banner",
}: {
  variant?: "banner" | "settings";
}) {
  const [ready, setReady] = useState(false);
  const [isInstalled, setInstalled] = useState(false);
  const [phone, setPhone] = useState(false);
  const [ios, setIos] = useState(false);
  const [guide, setGuide] = useState(false);
  const [busy, setBusy] = useState(false);
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const dialog = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    listen();
    const sync = () => {
      setInstalled(installed || standalone());
      setNativeAvailable(!!pendingPrompt);
    };
    const apple =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    setIos(apple);
    setPhone(
      apple ||
        /Android|Mobile/.test(navigator.userAgent) ||
        (window.matchMedia("(pointer: coarse)").matches &&
          window.innerWidth <= 820),
    );
    subscribers.add(sync);
    sync();
    setReady(true);
    return () => {
      subscribers.delete(sync);
    };
  }, []);
  useEffect(() => {
    if (!guide) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setGuide(false);
      }
      if (event.key !== "Tab") return;
      const focusable = dialog.current?.querySelectorAll<HTMLElement>(
        "button, a[href], [tabindex='0']",
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      previousFocus?.focus();
    };
  }, [guide]);
  if (
    !ready ||
    isInstalled ||
    (variant === "banner" && !phone && !nativeAvailable)
  )
    return null;
  async function install() {
    const prompt = pendingPrompt;
    if (!prompt) {
      setGuide(true);
      return;
    }
    pendingPrompt = null;
    notify();
    setBusy(true);
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      setGuide(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className={"tg-install-entry " + variant}>
        <span className="tg-install-icon">
          <Smartphone size={20} />
        </span>
        <div>
          <strong>Install Together</strong>
          <p>Keep it on your home screen.</p>
        </div>
        <button
          ref={trigger}
          onClick={install}
          disabled={busy}
          aria-label="Install Together app"
        >
          <ArrowDownToLine size={15} />
          <span>{busy ? "Opening…" : "Install"}</span>
        </button>
      </div>
      {guide &&
        createPortal(
          <div className="tg-install-overlay" onClick={() => setGuide(false)}>
            <section
              className="tg-install-dialog"
              ref={dialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tg-install-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="tg-install-top">
                <span className="tg-install-icon">
                  <Smartphone size={23} />
                </span>
                <button
                  aria-label="Close install instructions"
                  onClick={() => setGuide(false)}
                >
                  <X size={21} />
                </button>
              </div>
              <h2 id="tg-install-title">Together, one tap away.</h2>
              <p>
                Add this app to your home screen. Prepare the offline pack in
                Guides to keep saved information available without internet.
              </p>
              <ol>
                {ios ? (
                  <>
                    <li>
                      <span>1</span>Open this page in Safari.
                    </li>
                    <li>
                      <span>2</span>Tap <Share size={17} />{" "}
                      <strong>Share</strong>.
                    </li>
                    <li>
                      <span>3</span>Choose <strong>Add to Home Screen</strong>,
                      then <strong>Add</strong>.
                    </li>
                  </>
                ) : phone ? (
                  <>
                    <li>
                      <span>1</span>Open your browser menu{" "}
                      <MoreVertical size={17} />.
                    </li>
                    <li>
                      <span>2</span>Choose <strong>Install app</strong> or{" "}
                      <strong>Add to Home screen</strong>.
                    </li>
                    <li>
                      <span>3</span>Confirm <strong>Install</strong> or{" "}
                      <strong>Add</strong>.
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <span>1</span>Look for the install icon in your browser’s
                      address bar.
                    </li>
                    <li>
                      <span>2</span>Or open the browser menu and choose{" "}
                      <strong>Install Together</strong>.
                    </li>
                  </>
                )}
              </ol>
              <p className="tg-install-note">
                Menu names vary by browser. If install is unavailable, open this
                link in Safari on iPhone or Chrome on Android.
              </p>
              <button
                className="tg-install-done"
                onClick={() => setGuide(false)}
              >
                Got it <Check size={17} />
              </button>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
