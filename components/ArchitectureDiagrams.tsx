import { ArrowUpRight, Download, Radio, Server } from "lucide-react";
import "./architecture-diagrams.css";

const diagrams = [
  {
    file: "system-architecture",
    title: "The whole system",
    description: "Mobile PWA, nodal console, caching, cloud services and proposed field hardware.",
    alt: "Together system architecture: resident PWA, nodal website, shared API and D1, cloud AI providers, and a proposed Raspberry Pi node with local knowledge, RAG, optional language and speech models, queues and a LoRa bridge.",
    icon: Server,
  },
  {
    file: "radio-network",
    title: "Across the valley",
    description: "LoRa mesh links, local Wi-Fi, illustrative distances and the separate LoRaWAN gateway path.",
    alt: "Together proposed radio architecture: village LoRa mesh bridges, ordinary phones using local Wi-Fi, illustrative range rings, and a separate LoRaWAN star-of-stars telemetry network with gateways and a network server.",
    icon: Radio,
  },
];

export default function ArchitectureDiagrams() {
  return (
    <section className="tg-architecture" id="architecture" aria-label="Technical architecture diagrams">
      <div className="tg-architecture-heading">
        <span>SYSTEM DESIGN</span>
        <h2>From a phone to a whole community.</h2>
        <p>See what runs today and how the proposed field network would connect.</p>
      </div>
      <div className="tg-architecture-grid">
        {diagrams.map(({ file, title, description, alt, icon: Icon }) => (
          <article className="tg-architecture-card" key={file}>
            <a className="tg-architecture-preview" href={`/diagrams/${file}.svg?v=node-stack-2`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title} diagram full size`}>
              <img src={`/diagrams/${file}.svg?v=node-stack-2`} alt={alt} width={1800} height={file === "system-architecture" ? 1740 : 1330} loading="lazy" />
              <span><ArrowUpRight size={18} /> Enlarge</span>
            </a>
            <div className="tg-architecture-card-body">
              <h3><Icon size={21} />{title}</h3>
              <p>{description}</p>
              <div className="tg-architecture-links">
                <a href={`/diagrams/${file}.svg?v=node-stack-2`} target="_blank" rel="noopener noreferrer">View full size <ArrowUpRight size={15} /></a>
                <a href={`/diagrams/${file}.png?v=node-stack-2`} download><Download size={15} /> PNG</a>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="tg-architecture-note">Solid and dashed boundaries distinguish the working web MVP from simulated and proposed hardware. Radio distances illustrate a scenario; they are not measured coverage.</p>
    </section>
  );
}
