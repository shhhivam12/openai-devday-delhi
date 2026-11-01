"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Cpu,
  House,
  Laptop,
  Radio,
  Server,
  ShieldCheck,
  Smartphone,
  Waves,
} from "lucide-react";
import "./demo-landing.css";
import ArchitectureDiagrams from "./ArchitectureDiagrams";

function SceneLoading() {
  return <div className="demo-scene-loading" role="status"><Radio size={26} /><span>Preparing the interactive view…</span></div>;
}
const CitySimulation = dynamic(() => import("./CitySimulation"), { ssr: false, loading: SceneLoading });
const HardwareSimulation = dynamic(() => import("./HardwareSimulation"), { ssr: false, loading: SceneLoading });
const LoRaSimulation = dynamic(() => import("./LoRaSimulation"), { ssr: false, loading: SceneLoading });

type Props = { appUrl?: string; nodeUrl?: string };

export default function DemoLanding({
  appUrl = "https://together-relief.shiiim.chatgpt.site",
  nodeUrl = "https://together-node.shiiim.chatgpt.site",
}: Props) {
  const [mode, setMode] = useState<"city" | "hardware" | "radio">("city");
  function explore(next: "city" | "hardware" | "radio") {
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
            <img src="/brand/mark-mono.svg" alt="" />
          </span>
          <b>together</b>
          <i />
        </a>
        <nav aria-label="Demo sections">
          <button onClick={() => explore("city")}>The village</button>
          <button onClick={() => explore("hardware")}>The node</button>
          <button onClick={() => explore("radio")}>LoRa in action</button>
          <a href="#architecture">Architecture</a>
          <a href="#pilot">For districts</a>
        </nav>
        <a className="demo-nav-launch" href={appUrl}>
          Open app <ArrowUpRight size={16} />
        </a>
      </header>

      <main>
        <section className="demo-hero">
          <div className="demo-hero-copy">
            <div className="demo-hero-brand">
              <img src="/brand/mark-mono.svg" alt="" width={96} height={96} />
              <h1 className="demo-hero-wordmark">
                together<span>.</span>
              </h1>
            </div>
            <p className="demo-hero-lead">
              When networks stop, we stay together.
            </p>
            <div className="demo-hero-actions">
              <a className="demo-btn demo-btn-primary" href={appUrl}>
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
          <div className="demo-hero-art">
            <img
              className="demo-community-people"
              src="/illustrations/community-people.png"
              alt="A Himalayan community standing together: families, elders and a relief volunteer."
              width={1024}
              height={1024}
              fetchPriority="high"
            />
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
                NEPAL · A HIMALAYAN VILLAGE SCENARIO
              </span>
              <h2>
                {mode === "city"
                  ? "Across the village. Connected through the nodes."
                  : mode === "hardware"
                    ? "Small hardware. A human purpose."
                    : "Small messages. Across the valley."}
              </h2>
            </div>
            <div className="demo-mode-tabs" aria-label="Simulation mode">
              <button
                className={mode === "city" ? "selected" : ""}
                onClick={() => setMode("city")}
                aria-pressed={mode === "city"}
              >
                <House size={17} /> Village view
              </button>
              <button
                className={mode === "hardware" ? "selected" : ""}
                onClick={() => setMode("hardware")}
                aria-pressed={mode === "hardware"}
              >
                <Cpu size={17} /> Inside the node
              </button>
              <button
                className={mode === "radio" ? "selected" : ""}
                onClick={() => setMode("radio")}
                aria-pressed={mode === "radio"}
              >
                <Radio size={17} /> LoRa in action
              </button>
            </div>
          </div>
          <p className="demo-explorer-hint">
            {mode === "city"
              ? "Meet a family. Explore a distant node. Send a demo bulletin from the government server."
              : mode === "hardware"
                ? "Tap a component. Follow the jumper wires. See what connects to what."
                : "Send an SOS. Explore radio reach and what a ridge changes."}
          </p>
          <div
            className={
              mode === "city" ? "demo-city-frame" : "demo-hardware-frame"
            }
          >
            {mode === "city" ? (
              <CitySimulation />
            ) : mode === "hardware" ? (
              <HardwareSimulation />
            ) : (
              <LoRaSimulation />
            )}
          </div>
          <div className="demo-simulation-note">
            <span>
              <Waves size={14} /> Inspired by Nepal’s 2024 floods.
            </span>
            <span>
              Families, floodwater, radio links and government broadcasts are simulated.
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
            <b>Village node</b>
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
          <div className="demo-connection-link">
            <span>BACKHAUL</span>
            <i />
            <ChevronRight size={17} />
          </div>
          <div className="demo-connection-step">
            <span className="demo-step-icon">
              <Server size={27} />
            </span>
            <b>Government server</b>
            <small>Reviewed updates to local nodes</small>
          </div>
        </section>
        <p className="demo-backhaul-note">Requests travel out. Bulletins travel back when a head-server link is available. Local nodes retain the last saved update.</p>
        <ArchitectureDiagrams />

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
            <img src="/brand/mark-mono.svg" alt="" />
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
