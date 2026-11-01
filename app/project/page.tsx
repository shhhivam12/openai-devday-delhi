import "./project.css";
export const metadata = { title: "Together — Project evidence and pilot" };
export default function Project() {
  return (
    <main className="evidence">
      <a className="evidence-brand" href="/">
        <img src="/brand/mark.svg" alt="" />
        together.
      </a>
      <h1>Community relief, connected.</h1>
      <p>
        Three focused experiences: an interactive demonstration, a laptop nodal
        centre, and a resident PWA.
      </p>
      <div className="evidence-links">
        <a href="https://together-demo.shiiim.chatgpt.site">
          Explore the demo ↗
        </a>
        <a href="https://together-node.shiiim.chatgpt.site">
          Open nodal centre ↗
        </a>
        <a href="/">Open mobile app ↗</a>
      </div>
      <section>
        <h2>Try the complete journey</h2>
        <ol>
          <li>
            Open the mobile app. Choose a node, then submit a fictional help
            request.
          </li>
          <li>
            Open the nodal centre at the same node. Acknowledge or assign the
            request.
          </li>
          <li>
            Watch the mobile status update. Send a community message from either
            view.
          </li>
          <li>
            Download the guides. Disconnect and reload to read saved text;
            requests wait on the device until connectivity returns.
          </li>
          <li>
            Explore 24 Kathmandu-inspired homes, four hubs, family details and
            animated connections. Inspect the Pi, ESP32, SX127x radio and jumper
            wires. Send an illustrated SOS across the LoRa valley.
          </li>
        </ol>
      </section>
      <section>
        <h2>What is implemented</h2>
        <table>
          <thead>
            <tr>
              <th>Capability</th>
              <th>Evidence / boundary</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Shared requests, check-ins and messages",
                "Cloudflare D1 persistence; separate mobile and nodal sites share one backend",
              ],
              [
                "Request acknowledgements and assignments",
                "Real shared demo state; no emergency service is contacted",
              ],
              [
                "Offline essentials",
                "Cached app and six included guides; on-device outgoing queue",
              ],
              [
                "No internet / Wi-Fi claim",
                "Applies to saved guides and drafting requests. Messaging needs a local connection; hosted demo sync uses internet",
              ],
              [
                "Language",
                "Hindi primary actions, English; Nepali selection and regional pack previews remain limited",
              ],
              [
                "3D city and hardware",
                "Interactive illustrations; fictional families and conceptual pin connections",
              ],
              [
                "OpenAI / Cerebras / Exa",
                "Cerebras cloud assistance and Exa source-linked research verified live. OpenAI Responses, Decisions and voice await a server key",
              ],
              [
                "Physical LoRa, local AI and sensor readings",
                "Deployment roadmap; no hardware test or local model running",
              ],
            ].map(([a, b]) => (
              <tr key={a}>
                <td>{a}</td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Meaningful integrations</h2>
        <p>
          <b>ChatGPT Sites</b> hosts all three experiences. <b>Codex</b>{" "}
          implements and verifies the code, original vectors, and 3D scenes.{" "}
          <b>OpenAI</b> supports Decisions, Responses and optional speech
          transcription. <b>Cerebras</b> serves OpenAI gpt-oss-120b for cloud
          assistance. <b>Exa Agent</b> prepares source-linked district
          briefings. Cerebras and Exa have passed live checks; OpenAI awaits its
          server key. Cloud calls need internet.
        </p>
      </section>
      <section id="business">
        <h2>Preparedness as a district service</h2>
        <p>
          Proposed buyers are district and state disaster authorities, NGOs and
          relief operators. Residents access the service free.
        </p>
        <p>
          The proposed first offer is an eight-week, three-site pilot:
          language-pack preparation, operator training, and a supervised
          readiness drill. Hardware is scoped and priced separately. Revenue
          combines deployment and training with annual software, content, drills
          and support.
        </p>
        <p>
          Measure acknowledgement time, information availability, language
          comprehension, training time and cost per maintained site. These are
          proposed pilot measures. No customer, government partnership or
          achieved field outcome is claimed.
        </p>
      </section>
      <section>
        <h2>Deployment architecture</h2>
        <p>
          A phone connects to nearby hub Wi-Fi. A Raspberry Pi or capable edge
          computer serves local content and queues messages. An ESP32 plus a
          separate LoRa transceiver carries compact messages between equipped
          points. Larger information and future local inference stay at the hub.
          Standard LoRaWAN is a gateway-based sensor option; the inter-camp mesh
          is a separate transport concept.
        </p>
        <p>
          The current web demo shares data through a cloud database. It does not
          provide physical radio communication. The wiring view is illustrative
          and requires board-specific validation before construction.
        </p>
      </section>
      <section>
        <h2>Sources and code</h2>
        <a href="https://github.com/shhhivam12/openai-devday-delhi">
          GitHub source and progress commits ↗
        </a>
        <ul>
          <li>
            <a href="https://www.unicef.org/media/163091/file/Nepal-Humanitarian-SitRep-Floods-01-October-2024.pdf">
              UNICEF Nepal flood report · 1 October 2024 ↗
            </a>
          </li>
          <li>
            <a href="https://sachet.ndma.gov.in/">
              NDMA SACHET official alert portal ↗
            </a>
          </li>
          <li>
            <a href="https://usdma.uk.gov.in/">
              Uttarakhand State Disaster Management Authority ↗
            </a>
          </li>
          <li>
            <a href="https://hpsdma.hp.gov.in/">
              Himachal Pradesh State Disaster Management Authority ↗
            </a>
          </li>
        </ul>
      </section>
      <footer>
        Team Sisyphus · DevDay Exchange, New Delhi · 1 November 2026
      </footer>
    </main>
  );
}
