import { AudioLines, BookOpen, ChevronDown, Cpu, Database, Search, ShieldCheck, Wifi } from "lucide-react";
import "./node-contents.css";

const modules = [
  { icon: Wifi, title: "Local web apps", copy: "Resident PWA, nodal desk and a local API, served over nearby Wi-Fi." },
  { icon: BookOpen, title: "An offline library", copy: "Selected Wikipedia ZIMs, saved maps, approved guides and dated bulletins." },
  { icon: Search, title: "RAG, with sources", copy: "Search a reviewed local knowledge pack. Keep sources, issue dates and expiry visible." },
  { icon: AudioLines, title: "Optional AI + speech", copy: "A small quantized LLM, Whisper speech input and a reviewed voice pack. AI jobs are queued." },
  { icon: Database, title: "The community queue", copy: "Requests, check-ins, messages and acknowledgements. Unsent items wait for a usable link." },
  { icon: ShieldCheck, title: "Node operations", copy: "Signed content packs, operator access, power and disk checks, and recoverable backups." },
];

function NodeBoard() {
  return (
    <svg viewBox="0 0 320 225" role="img" aria-label="Illustration of a proposed Together single-board computer with processor, GPIO pins and storage">
      <rect x="31" y="42" width="258" height="151" rx="25" fill="#151719" />
      <rect x="40" y="51" width="240" height="133" rx="19" fill="none" stroke="#5c6570" />
      <rect x="109" y="91" width="63" height="62" rx="8" fill="#292e35" stroke="#8290a0" />
      <Cpu x="122" y="104" width="37" height="37" color="white" strokeWidth="1.3" />
      <path d="M82 75h28v14m68 36h48v31m-87 4v17H82m98-94h43V62" fill="none" stroke="#8190a0" strokeWidth="2" />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={73 + i * 12} y="33" width="5" height="25" rx="2" fill="#b8c1cc" />)}
      {[74, 119].map(y => <g key={y}><rect x="17" y={y} width="35" height="32" rx="4" fill="#e7ebef" stroke="#abb5c0" /><path d={`M24 ${y+8}h18v15H24z`} fill="#4d5864" /></g>)}
      <rect x="205" y="96" width="48" height="28" rx="5" fill="#006aff" />
      <rect x="199" y="140" width="58" height="22" rx="4" fill="#eef1f5" />
      <circle cx="263" cy="72" r="6" fill="#006aff" />
      <circle cx="263" cy="72" r="12" fill="none" stroke="#006aff" opacity=".4" />
      <text x="158" y="216" textAnchor="middle" fill="#3e4855" fontSize="12" fontFamily="Arial, sans-serif" letterSpacing="1">TOGETHER / FIELD NODE CONCEPT</text>
    </svg>
  );
}

export default function NodeContents() {
  return (
    <section className="tg-node-contents" id="node-contents" aria-label="What a proposed Raspberry Pi node would hold">
      <div className="tg-node-contents-heading">
        <span>PROPOSED FIELD DEPLOYMENT</span>
        <h2>Inside a Together node.</h2>
        <p>A local knowledge hub, a community queue and a bridge to other centres.</p>
      </div>
      <div className="tg-node-contents-layout">
        <aside className="tg-node-machine">
          <NodeBoard />
          <div className="tg-node-machine-copy">
            <h3>Raspberry Pi 5</h3>
            <p>A proposed starting configuration for a physical prototype.</p>
            <div className="tg-node-specs"><span>16 GB RAM</span><span>256 GB SSD</span><span>Active cooling</span></div>
            <ul>
              <li><Wifi size={17} />Local Wi-Fi access point</li>
              <li><Cpu size={17} />ESP32 + LoRa radio bridge</li>
              <li><ShieldCheck size={17} />Backup power + protected enclosure</li>
            </ul>
          </div>
        </aside>
        <div className="tg-node-module-grid">
          {modules.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="tg-node-module">
              <span className="tg-node-module-icon"><Icon size={25} strokeWidth={1.6} /></span>
              <h3>{title}</h3><p>{copy}</p>
            </article>
          ))}
        </div>
      </div>
      <details className="tg-node-rag">
        <summary><Search size={19} /><span>How an offline answer would work</span><ChevronDown size={18} /></summary>
        <div>
          <ol><li><b>1</b>Ask by text or voice</li><li><b>2</b>Retrieve approved passages</li><li><b>3</b>Explain with a small model</li><li><b>4</b>Show the source and date</li></ol>
          <p>Start with reviewed local guidance. Wikipedia is general reference. If the pack cannot support an answer, show that gap instead of inventing current conditions. A local model and speech service would need hardware and language testing.</p>
        </div>
      </details>
      <p className="tg-node-contents-note">This is the field-node blueprint. Today’s demo uses cloud APIs; no local LLM, Wikipedia server or radio hardware is running. Local AI performance, power endurance and regional-language packs remain to be tested.</p>
    </section>
  );
}
