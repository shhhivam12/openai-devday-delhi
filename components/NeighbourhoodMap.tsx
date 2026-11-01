"use client";

import { useState } from "react";
import { ArrowUpRight, Check, House, LocateFixed, MapPin, Minus, Plus, Radio, School, WifiOff } from "lucide-react";
import "./neighbourhood-map.css";

type Props = { selectedNode: string; onSelectNode: (id: string) => void; connected: boolean };
const hubs = [
  { id: "school", name: "School relief hub", short: "School", x: 326, y: 137, icon: School },
  { id: "riverside", name: "Riverside hub", short: "Riverside", x: 442, y: 271, icon: Radio },
  { id: "health", name: "Health post", short: "Health", x: 154, y: 258, icon: Plus },
  { id: "hill", name: "Hill centre", short: "Hill", x: 114, y: 104, icon: House },
];
const homes = [
  { id: "home-1", label: "Home 01", family: "Shrestha family", people: 2, hub: "school", x: 245, y: 172 },
  { id: "home-12", label: "Home 12", family: "Basnet family", people: 3, hub: "riverside", x: 400, y: 197 },
  { id: "home-18", label: "Home 18", family: "Magar family", people: 4, hub: "hill", x: 202, y: 108 },
];
const blocks = [
  [23, 59, 54, 58], [27, 135, 57, 57], [35, 211, 67, 52], [48, 286, 59, 44],
  [111, 32, 58, 37], [116, 143, 66, 48], [116, 208, 69, 27], [128, 294, 54, 38],
  [201, 29, 60, 39], [206, 131, 70, 23], [211, 196, 65, 46], [211, 270, 62, 40],
  [291, 44, 59, 40], [293, 174, 61, 36], [292, 237, 65, 57],
  [380, 51, 57, 48], [385, 126, 66, 35], [377, 223, 37, 50], [475, 69, 61, 46],
  [480, 142, 61, 39], [477, 211, 59, 38], [486, 284, 52, 37],
];

export default function NeighbourhoodMap({ selectedNode, onSelectNode, connected }: Props) {
  const [showHomes, setShowHomes] = useState(true);
  const [focus, setFocus] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const activeHub = hubs.find(hub => hub.id === selectedNode) || hubs[0];
  const home = homes.find(item => item.id === focus);
  const hub = hubs.find(item => item.id === focus) || activeHub;
  const target = home ? hubs.find(item => item.id === home.hub)! : hub;
  const selected = target.id === selectedNode;
  const CardIcon = home ? House : target.icon;

  return (
    <section className="local-map-section" aria-label="Saved Kathmandu demonstration map">
      <div className="local-map">
        <div className="local-map-world" style={{ transform: `scale(${zoom})` }}>
          <svg className="local-map-drawing" viewBox="0 0 560 420" preserveAspectRatio="none" aria-hidden="true">
            <rect width="560" height="420" fill="#f0f2f4" />
            <path d="M0 345C116 278 151 371 269 329S438 346 560 306V420H0Z" fill="#d7e8f9" />
            <path d="M0 365C116 298 151 391 269 349S438 366 560 326" fill="none" stroke="#edf5ff" strokeWidth="3" />
            <g fill="#fafbfc" stroke="#d4dae1" strokeWidth="1.5">
              {blocks.map(([x,y,w,h], index) => <rect key={index} x={x} y={y} width={w} height={h} rx="3" />)}
            </g>
            <g fill="none" stroke="#cfd5dc" strokeWidth="20" strokeLinecap="round">
              <path d="M92-10L101 337M187-10L195 345M278-10L280 339M365-10L366 334M463-10L461 344" />
              <path d="M-10 124L575 117M-10 202L575 190M-10 282L570 260" />
              <path d="M-10 35L571 70" />
            </g>
            <g fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round">
              <path d="M92-10L101 337M187-10L195 345M278-10L280 339M365-10L366 334M463-10L461 344" />
              <path d="M-10 124L575 117M-10 202L575 190M-10 282L570 260" />
              <path d="M-10 35L571 70" />
            </g>
            <path d="M327 144L249 171" fill="none" stroke="#006AFF" strokeWidth="2" strokeDasharray="4 5" />
            <g fill="#a5adb7">
              {[[43,77],[56,90],[134,49],[144,164],[228,45],[225,215],[243,226],[309,66],[313,190],[403,72],[416,143],[497,90],[497,163],[507,231],[227,287],[308,260],[148,311]].map(([x,y], i) => <rect key={i} x={x} y={y} width="12" height="9" rx="1" opacity=".5" />)}
            </g>
            <g fill="#4b5057" fontFamily="Arial, sans-serif" fontSize="15">
              <text x="210" y="119" transform="rotate(-1 210 119)">School road</text>
              <text x="307" y="194" transform="rotate(-2 307 194)">Market lane</text>
              <text x="72" y="274" transform="rotate(-2 72 274)">Community road</text>
              <text x="184" y="87" transform="rotate(89 184 87)">Hill lane</text>
              <text x="379" y="355">River</text>
            </g>
          </svg>
          {hubs.map(item => {
            const Icon = item.icon;
            const isActive = target.id === item.id;
            return <button key={item.id} className={`local-map-pin hub ${isActive ? "active" : ""}`} style={{left:`${item.x/5.6}%`,top:`${item.y/4.2}%`}} onClick={() => setFocus(item.id)} aria-label={`Inspect ${item.name}`} aria-pressed={isActive}>
              <span><Icon size={17} strokeWidth={1.7} /></span><small>{item.short}</small>
            </button>;
          })}
          {showHomes && homes.map(item => <button key={item.id} className={`local-map-pin home ${focus === item.id ? "active" : ""}`} style={{left:`${item.x/5.6}%`,top:`${item.y/4.2}%`}} onClick={() => setFocus(item.id)} aria-label={`Inspect ${item.label}, ${item.family}`} aria-pressed={focus === item.id}>
            <span><House size={13} strokeWidth={1.6} /></span>
          </button>)}
        </div>
        <div className="local-map-filters">
          <span className="local-map-chip dark"><MapPin size={12} /> Hubs</span>
          <button className={`local-map-chip ${showHomes ? "selected" : ""}`} onClick={() => setShowHomes(!showHomes)} aria-pressed={showHomes}>Homes {showHomes ? <Check size={11} /> : <Plus size={11} />}</button>
        </div>
        <div className="local-map-zoom" aria-label="Map view controls">
          <button onClick={() => setZoom(Math.min(1.7, zoom + .2))} disabled={zoom >= 1.7} aria-label="Zoom in on local map"><Plus size={15} /></button>
          <button onClick={() => setZoom(Math.max(1, zoom - .2))} disabled={zoom <= 1} aria-label="Zoom out from local map"><Minus size={15} /></button>
          <button onClick={() => {setZoom(1);setFocus(null);}} aria-label="Show selected hub"><LocateFixed size={15} /></button>
        </div>
        <div className="local-map-card" aria-live="polite">
          <span className="local-map-card-icon"><CardIcon size={19} strokeWidth={1.7} /></span>
          <div><strong>{home ? home.label : target.name}</strong><p>{home ? `${home.family} · ${home.people} people` : "Saved demo location"}</p><small>{home ? `Connected to ${target.short}` : selected ? connected ? "Selected · shared demo" : "Selected · device only" : "Choose your community hub"}</small></div>
          <button onClick={() => {onSelectNode(target.id);setFocus(target.id);}} disabled={selected && !home} aria-label={`Use ${target.name}`}>{selected && !home ? <Check size={16} /> : <ArrowUpRight size={16} />}</button>
        </div>
      </div>
      <p className="local-map-note"><WifiOff size={11} /> Saved demo map · Kathmandu-inspired, not a navigation map.</p>
    </section>
  );
}
