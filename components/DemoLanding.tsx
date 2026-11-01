"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Cpu,
  Globe2,
  HeartHandshake,
  House,
  Laptop,
  MapPin,
  Radio,
  ShieldCheck,
  Smartphone,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import CitySimulation from "./CitySimulation";
import HardwareSimulation from "./HardwareSimulation";
import "./demo-landing.css";

type Props = { appUrl?: string; nodeUrl?: string };

function Neighbour({ variant = 0 }: { variant?: number }) {
  return (
    <svg viewBox="0 0 140 150" aria-hidden="true" className="demo-neighbour">
      <path
        d="M18 145c0-27 14-43 43-43h20c29 0 43 16 43 43"
        fill={variant ? "#4c73ff" : "#21c9c4"}
      />
      <path d="M58 88h25v23c-5 10-20 10-25 0Z" fill="#c39077" />
      <ellipse
        cx="70"
        cy="59"
        rx="31"
        ry="36"
        fill={variant ? "#b67d62" : "#d8aa8b"}
      />
      <path
        d="M38 57c-4-26 10-43 33-43 24 0 38 20 30 49l-8-21c-12 0-21-6-26-12-4 14-13 22-29 27Z"
        fill="#0b1426"
      />
      <path
        d="M45 88c6 14 16 20 25 20s20-7 26-20"
        fill="none"
        stroke="#0b1426"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="59" cy="62" r="2" fill="#0b1426" />
      <circle cx="81" cy="62" r="2" fill="#0b1426" />
      <path
        d="M64 80q6 5 12 0"
        fill="none"
        stroke="#754d42"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {variant === 1 && (
        <path
          d="M40 37 70 16l30 21"
          fill="#eef3ff"
          stroke="#0b1426"
          strokeWidth="3"
        />
      )}
    </svg>
  );
}

export default function DemoLanding({
  appUrl = "https://together-relief.shiiim.chatgpt.site",
  nodeUrl = "https://together-node.shiiim.chatgpt.site",
}: Props) {
  const [mode, setMode] = useState<"city" | "hardware">("city");
  function explore(next: "city" | "hardware") {
    setMode(next);
    document
      .getElementById("explore")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <div className="demo-site">
      <header className="demo-nav">
        <a className="demo-logo" href="#" aria-label="Together home">
          <span>
            <img src="/brand/mark.svg" alt="" />
          </span>
          <b>together</b>
          <i />
        </a>
        <nav aria-label="Demo sections">
          <button onClick={() => explore("city")}>The city</button>
          <button onClick={() => explore("hardware")}>The node</button>
          <a href="#pilot">For districts</a>
        </nav>
        <a className="demo-nav-launch" href={appUrl}>
          Open app <ArrowUpRight size={16} />
        </a>
      </header>

      <main>
        <section className="demo-hero">
          <div className="demo-hero-copy">
            <div className="demo-eyebrow">
              <span /> A COMMUNITY THAT STAYS CONNECTED
            </div>
            <h1>
              When networks stop.
              <br />
              <em>We stay together.</em>
            </h1>
            <p>Help. Trusted information. Each other.</p>
            <div className="demo-hero-actions">
              <a className="demo-btn demo-btn-blue" href={appUrl}>
                <Smartphone size={19} /> Open mobile app{" "}
                <ArrowUpRight size={17} />
              </a>
              <a className="demo-btn demo-btn-outline" href={nodeUrl}>
                <Laptop size={19} /> Open nodal centre{" "}
                <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="demo-hero-facts">
              <span>
                <Check size={13} /> No mobile data for cached essentials
              </span>
              <span>
                <Radio size={13} /> Local connections. Shared strength.
              </span>
            </div>
          </div>
          <div className="demo-hero-art" aria-hidden="true">
            <div className="demo-art-orbit orbit-one" />
            <div className="demo-art-orbit orbit-two" />
            <div className="demo-art-node">
              <Radio size={38} />
              <span>TOGETHER NODE</span>
              <i />
              <i />
              <i />
            </div>
            <div className="demo-neighbour-card neighbour-one">
              <Neighbour />
              <span>
                <i /> Maya’s family
              </span>
            </div>
            <div className="demo-neighbour-card neighbour-two">
              <Neighbour variant={1} />
              <span>
                <i /> Community volunteer
              </span>
            </div>
            <div className="demo-art-message">
              <HeartHandshake size={20} />
              <span>“We’re here for you.”</span>
              <Check size={14} />
            </div>
            <span className="demo-art-spark spark-a">✦</span>
            <span className="demo-art-spark spark-b">✦</span>
          </div>
          <button className="demo-scroll" onClick={() => explore("city")}>
            See the connection <ArrowDown size={16} />
          </button>
        </section>

        <section
          className="demo-explorer"
          id="explore"
          aria-label="Interactive demonstration"
        >
          <div className="demo-explorer-heading">
            <div>
              <span className="demo-eyebrow">
                KATHMANDU, NEPAL · ILLUSTRATIVE SCENARIO
              </span>
              <h2>
                {mode === "city"
                  ? "A city. Four nodes. A way to reach each other."
                  : "Small hardware. A human purpose."}
              </h2>
            </div>
            <div className="demo-mode-tabs" aria-label="Simulation mode">
              <button
                className={mode === "city" ? "selected" : ""}
                onClick={() => setMode("city")}
                aria-pressed={mode === "city"}
              >
                <House size={17} /> City view
              </button>
              <button
                className={mode === "hardware" ? "selected" : ""}
                onClick={() => setMode("hardware")}
                aria-pressed={mode === "hardware"}
              >
                <Cpu size={17} /> Inside the node
              </button>
            </div>
          </div>
          <p className="demo-explorer-hint">
            {mode === "city"
              ? "Hover or tap a home. Meet the family. Follow its connection."
              : "Tap a component. Follow the jumper wires. See what connects to what."}
          </p>
          <div
            className={
              mode === "city" ? "demo-city-frame" : "demo-hardware-frame"
            }
          >
            {mode === "city" ? <CitySimulation /> : <HardwareSimulation />}
          </div>
          <div className="demo-simulation-note">
            <span>
              <Waves size={14} /> Inspired by Nepal’s 2024 floods.
            </span>
            <span>
              Families, floodwater, hardware and radio links are simulated.
            </span>
          </div>
        </section>

        <section
          className="demo-connection"
          aria-label="How Together connects people"
        >
          <div className="demo-connection-step">
            <span className="demo-step-icon">
              <Smartphone size={27} />
            </span>
            <b>Your phone</b>
            <small>Simple, familiar controls</small>
          </div>
          <div className="demo-connection-link">
            <span>LOCAL WI-FI</span>
            <i />
            <ChevronRight size={17} />
          </div>
          <div className="demo-connection-step">
            <span className="demo-step-icon">
              <Cpu size={27} />
            </span>
            <b>Nearby node</b>
            <small>Saved knowledge + requests</small>
          </div>
          <div className="demo-connection-link">
            <span>LoRa RADIO</span>
            <i />
            <ChevronRight size={17} />
          </div>
          <div className="demo-connection-step">
            <span className="demo-step-icon">
              <Radio size={27} />
            </span>
            <b>Relief centre</b>
            <small>People coordinating help</small>
          </div>
        </section>

        <section
          className="demo-launch-grid"
          aria-label="Open Together experiences"
        >
          <a className="demo-launch-card mobile" href={appUrl}>
            <div className="demo-launch-icon">
              <Smartphone size={31} />
            </div>
            <div>
              <span>FOR PEOPLE</span>
              <h3>One tap closer to help.</h3>
              <p>Ask for help. Check in. Find saved information.</p>
            </div>
            <ArrowUpRight size={26} />
          </a>
          <a className="demo-launch-card nodal" href={nodeUrl}>
            <div className="demo-launch-icon">
              <Laptop size={31} />
            </div>
            <div>
              <span>FOR COORDINATORS</span>
              <h3>See needs. Coordinate care.</h3>
              <p>Requests, people and resources in one place.</p>
            </div>
            <ArrowUpRight size={26} />
          </a>
        </section>

        <section className="demo-pilot" id="pilot">
          <div className="demo-pilot-symbol">
            <ShieldCheck size={36} />
          </div>
          <div>
            <span className="demo-eyebrow">
              READY BEFORE THE NEXT EMERGENCY
            </span>
            <h2>A preparedness service for districts.</h2>
            <p>
              Three sites. Eight weeks. Local-language packs, trained teams, one
              readiness drill.
            </p>
            <div className="demo-pilot-tags">
              <span>Deployment + training</span>
              <span>Annual support</span>
              <span>Free for residents</span>
            </div>
          </div>
          <a href={appUrl + "/project#business"} className="demo-pilot-link">
            Explore the proposed pilot <ArrowUpRight size={17} />
          </a>
        </section>

        <section
          className="demo-integrations"
          aria-label="Technology integrations"
        >
          <span>BUILT TO WORK TOGETHER</span>
          <div>
            <b>
              OpenAI<small>Assistance + Decisions</small>
            </b>
            <b>
              Cerebras<small>Fast cloud inference</small>
            </b>
            <b>
              Exa<small>Sourced district research</small>
            </b>
            <b>
              ChatGPT Sites<small>Web delivery</small>
            </b>
            <b>
              Codex<small>Build + test</small>
            </b>
          </div>
          <p>
            This MVP uses cloud APIs for new AI answers. Cached essentials work
            without internet; local Wi-Fi or a radio bridge is needed for
            communication.
          </p>
        </section>
      </main>
      <footer className="demo-footer">
        <a className="demo-logo" href="#">
          <span>
            <img src="/brand/mark.svg" alt="" />
          </span>
          <b>together</b>
          <i />
        </a>
        <p>Technology that keeps people close.</p>
        <span>TEAM SISYPHUS · DEV DAY EXCHANGE 2026</span>
      </footer>
    </div>
  );
}
