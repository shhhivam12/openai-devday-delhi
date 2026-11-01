<p align="center">
  <img src="public/brand/banner.png" alt="Together — community disaster readiness and relief coordination" width="100%" />
</p>

# Together

**A little connection. A lot of hope.**

Together helps a resident say **“I need help,” “I’m safe,” or “Here is what our community needs”** and gives a coordinator a shared place to acknowledge and follow up. It combines a mobile-first Progressive Web App (PWA), saved knowledge, multilingual assistance, and a nodal relief dashboard with an interactive vision of community Wi-Fi, Raspberry Pi hubs, and LoRa communication.

Built by **Team Sisyphus** for **DevDay Exchange New Delhi**, using **Codex and ChatGPT Sites**, with live **OpenAI, Cerebras, and Exa AI** integrations.

[Explore the demo](https://together-demo.shiiim.chatgpt.site) · [Resident PWA](https://together-relief.shiiim.chatgpt.site) · [Nodal console](https://together-node.shiiim.chatgpt.site) · [Source repository](https://github.com/shhhivam12/openai-devday-delhi)

> **Prototype status — 1 November 2026:** the three hosted experiences work together through a shared cloud database. Physical radios, disconnected inter-site delivery, local AI, and field deployment are a roadmap. The Sites previews are currently private; reviewers need appropriate access. This is an exercise environment and does not contact emergency responders.

![Together landing experience](docs/images/hero.jpg)

## What a reviewer can verify today

| Capability | Working in this MVP | Next deployment milestone |
| --- | --- | --- |
| Resident-to-coordinator workflow | Help requests, check-ins and community messages persist in shared Cloudflare D1; the independent nodal Site reads and updates the same records | Authenticated operator roles, auditability, retention policy and field drills |
| Request progress | `received → acknowledged → assigned → completed`, with UUID-based retries and forward-only transitions | Verified responder handoffs and district operating procedures |
| Offline PWA | After preparation: cached app, six authored guides, original illustrated local map and device-local outgoing queue | Browser/device coverage testing, durable local hub services and reviewed content distribution |
| Cloud AI | OpenAI Responses and Decisions, Cerebras `gpt-oss-120b`, and Exa Agent verified live | Measured quality, latency, cost and language evaluations |
| Language access | Hindi primary actions and English; limited Nepali strings; Garhwali, Kumaoni and Kangri preview choices | Native-speaker review and complete regional language packs |
| Community network explanation | Three.js village, interactive IoT bench and qualitative LoRa reach simulation | Real Raspberry Pi/ESP32/radio assembly, transport adapter and measured RF/power tests |
| Offline knowledge hub | Small saved information pack and source links | Kiwix/ZIM content on a physical community hotspot |

The engineering evidence is the shared workflow, offline preparation and live provider calls. The hardware scenes explain the intended system; they do not establish radio range, electrical correctness or flood prediction.

## Why this problem matters

When floods separate a family, the immediate information needs are concrete: **Who has checked in? What is needed? Where was the request recorded? Has anyone acknowledged it?** A coordinator also needs to distinguish a new request from a retry, a sourced document from a rumor, and an assignment from a completed response.

This motivation is grounded in dated reporting:

- **9 October 2026:** a UN Geneva update from UNICEF and IFRC reported **nearly 5,300 people still missing** after Nepal’s late-August flooding disaster. It described isolated communities receiving airlifted relief and roads and communications still being restored. This is an **October report about an August disaster**, not a claim that the flood began in October. [UN Geneva, UNICEF/IFRC update](https://www.unognewsroom.org/story/en/3294/nepal-disaster-update-unicef-ifrc)
- **1 September 2026:** UNDP dated the flash flood to **26 August** and described damaged energy infrastructure and communities struggling to reconnect with essential services. These observations motivate preparedness for disrupted power and communications. [UNDP Nepal assessment](https://www.undp.org/nepal/press-releases/nepal-floods-hit-vulnerable-communities-undp-estimates-22-million-tonnes-debris)
- **4 October 2024:** UNICEF’s report on the **27–28 September 2024 Nepal floods** estimated **over 80,000 people affected and 50,000 displaced**. This earlier event also informs the project’s Kathmandu-inspired demonstration. Counts are the reporting agency’s estimates at the stated date, not live figures. [UNICEF situation report No. 2](https://www.unicef.org/media/163096/file/Nepal-Humanitarian-SitRep-Floods-04-October-2024.pdf)

Together’s hypothesis is that **prepared local information, a clear request-and-acknowledgement loop, and accountable human coordination can reduce information gaps during disruption**. That hypothesis still needs field evaluation. We do not claim that this prototype found missing people, saved lives, reached affected communities or improved response times.

The community purpose shapes the product: residents should use it free, a volunteer should be able to help someone without technical knowledge, and language or unstable connectivity should not erase a drafted request. Check-ins are self-reports; they are not a verified missing-person registry or proof that a relative received a message.

## Three connected experiences

| Experience | Intended user | What to try |
| --- | --- | --- |
| [Demo landing](https://together-demo.shiiim.chatgpt.site) | Reviewers, district teams, community partners | Explore a home, a relief hub, the electronics bench and the LoRa explanation |
| [Resident PWA](https://together-relief.shiiim.chatgpt.site) | A resident or volunteer on a phone | Request help, record a safe check-in, post a community message, prepare guides and inspect the local map |
| [Nodal console](https://together-node.shiiim.chatgpt.site) | A coordinator on a laptop | Review the shared queue, acknowledge a request, advance its status and prepare a sourced district briefing |

The independent Sites have separate hosting identities. The nodal server uses a fixed, server-only proxy to the resident Site’s backend. Credentials stay on the server; both experiences use the same D1 records.

<table>
  <tr>
    <td width="34%"><img src="docs/images/mobile-app.jpg" alt="Resident mobile app with help and check-in actions" /></td>
    <td width="66%"><img src="docs/images/nodal-console.jpg" alt="Laptop nodal console with shared relief requests" /></td>
  </tr>
  <tr>
    <td><em>Resident: a small number of clear actions.</em></td>
    <td><em>Coordinator: a shared queue and visible acknowledgement.</em></td>
  </tr>
</table>

### A five-minute demonstration

1. **Meet the community.** Open the landing and select a house. The Kathmandu-inspired scene has **24 selectable fictional families, 125 context buildings and four hubs**, with winding roads, a curved river, highlighted homes and animated connections. The people, locations and water levels are illustrative.
2. **Inspect the proposed node.** Open the IoT bench and select a colored jumper wire or pin. Identify the Raspberry Pi, ESP32, SX127x radio, breadboard and antenna. Switch to “LoRa in action,” send the simulated short SOS and watch the acknowledgement.
3. **Send a real exercise record.** Open the PWA and nodal console at the same hub, such as School. Submit a fictional four-person drinking-water request. It should appear in the laptop queue.
4. **Close the loop.** Acknowledge the request on the laptop and watch the phone refresh. Continue to assigned/completed to inspect the lifecycle. A database acknowledgement is not a promise of rescue.
5. **Inspect AI provenance.** Ask a brief question using OpenAI or Cerebras. Prepare a district briefing with Exa; open its source links and check issue/retrieval dates and pending review status.
6. **Demonstrate the offline boundary.** Prepare the app and guides while connected. Disconnect the device or make the origin unavailable, reload, read a saved guide, inspect the map and draft a request. Restore connectivity and use the outgoing queue’s sync control. Offline drafts should remain visibly unsent until delivery succeeds.

Use fictional names and needs throughout. No physical radio is needed to review the web MVP.

## PWA: prepare once, keep useful information nearby

The resident experience uses a web manifest, app icons, a versioned service-worker cache and `localStorage` for preferences, recent activity and pending outgoing events. The preparation state is tied to the cache version so an older download does not claim a new pack is ready. API routes are excluded from the service-worker cache.

Installation uses the browser’s native install prompt when `beforeinstallprompt` is available. Otherwise, the app presents iPhone/browser instructions. Installation support depends on the browser; opening the web app remains an option.

| Situation | Available behavior |
| --- | --- |
| Internet available | Shared requests, check-ins, messages, cloud AI and online district research |
| No internet and no Wi-Fi, **after preparation** | Saved app/guides/map and storing outgoing requests on that device |
| Internet restored | Explicit retry/sync of queued events using the same UUIDs |
| Local Wi-Fi only, in today’s hosted demo | Cached content remains available; reaching the cloud backend still requires an internet path |
| Future physical community hub | Phones could reach locally hosted content and services over local Wi-Fi; compact messages could cross a radio bridge |

**“Offline” does not mean that an ordinary phone can transmit to LoRa without hardware.** Device-local storage is also not a guaranteed backup: clearing browser data or losing the phone can lose unsent records. The current app does not promise background delivery while closed.

The illustrated neighbourhood map is an original local asset with selectable hubs and fictional homes. It needs no external map tiles or GPS permission and is not navigation or safe-route guidance. The knowledge library contains **six short Together-authored guides and source links**, including a small flood explainer; it is not a complete Wikipedia download. A future “internet-in-a-box” style hub could distribute larger Kiwix/ZIM libraries over community Wi-Fi, following the approach documented by [Kiwix Hotspots](https://get.kiwix.org/en/solutions/hotspots/).

<table>
  <tr>
    <td width="60%"><img src="docs/images/local-map.jpg" alt="Saved illustrated neighbourhood map with community hubs" /></td>
    <td width="40%"><img src="docs/images/install.jpg" alt="Together app installation and offline preparation interface" /></td>
  </tr>
  <tr>
    <td><em>A saved, fictional neighbourhood map.</em></td>
    <td><em>Install and prepare while connected.</em></td>
  </tr>
</table>

## Architecture and data flow

```mermaid
flowchart TB
  subgraph Phone[Resident phone]
    PWA[React PWA]
    CACHE[Versioned app and guide cache]
    OUTBOX[Device-local outgoing queue]
    PWA --- CACHE
    PWA --- OUTBOX
  end
  subgraph Hosted[Working hosted MVP — internet required for sync]
    API[Resident Site server routes]
    DB[(Cloudflare D1)]
    NODE[Independent nodal Site]
    PROXY[Fixed server-only proxy]
    POLICY[Input, origin, rate and provider policies]
    PWA -->|UUID event and retry| API
    NODE --> PROXY --> API
    API <--> DB
    API --> POLICY
  end
  POLICY --> OA[OpenAI Responses and Decisions]
  POLICY --> CB[Cerebras cloud inference]
  POLICY --> EXA[Exa Agent asynchronous research]
  EXA --> CARDS[Source-linked cards with dates]
  CARDS --> REVIEW[Human coordinator review]
```

### The shared network is implemented

- **Persistence:** `network_requests`, `network_checkins`, `network_messages` and `network_operations` tables, with indexed node/time access. Hub IDs are `school`, `riverside`, `health` and `hill`.
- **Retry behavior:** the client creates UUIDs before transmission; operation records support idempotent retries. A failed send remains in the phone’s outbox instead of becoming a fictional received record.
- **State transitions:** requests advance from received to acknowledged, assigned and completed; transitions cannot go backwards.
- **Separate clients:** the console polls every five seconds and the resident view every six seconds. This is shared polling, not a radio connection or a claimed real-time push network.
- **Bounded requests:** network messages are limited to 800 characters, names to 60, locations to 120 and people counts to 1–99. Shared JSON helpers cap request bodies at 16 KiB.
- **Honest failures:** unavailable D1 returns a service error and disconnected state. Empty exercise rooms remain empty. The console’s planning quantities are illustrative local values, not a shared inventory ledger.

See [network architecture and API](docs/network.md), [database schema](db/schema.ts), [network route](app/api/network/route.ts) and [policy tests](tests/server-policy.test.mjs).

### Main technologies

| Layer | Implementation | Why it is useful here |
| --- | --- | --- |
| Application | Next.js 16 application structure, React 19, TypeScript | Shared typed components for resident, coordinator and demo experiences |
| Build/runtime | Vinext/Vite, Cloudflare Workers, ChatGPT Sites | Three independently hosted web experiences with server-side integrations |
| Shared data | Cloudflare D1, Drizzle schema/migrations | Durable exercise records across independent browser sessions |
| Device continuity | Service worker, Cache Storage, `localStorage` | Prepared information and recoverable outgoing attempts on a phone |
| Interaction | Three.js | Inspectable village, IoT hardware concept and radio explanation |
| Assistance | OpenAI Responses and Decisions; Cerebras Chat Completions | Short language assistance and routing suggestions with clear provenance |
| Research | Exa Agent, structured output, grounding checks | Dated source cards for a coordinator to review |

## Exa AI and Cerebras: accelerating useful work

The integrations address two different delays: **assembling trustworthy context** and **turning context into a short, understandable answer**. They are live cloud integrations in this build. They do not provide off-grid inference or establish current field conditions.

### Exa AI: prepare a source-linked district briefing

A coordinator should not have to repeatedly search disconnected agency websites while maintaining a relief queue. Together uses **Exa Agent** to assemble a small district readiness pack for Nepal, Uttarakhand or Himachal Pradesh.

The implemented flow in [`app/api/briefing/route.ts`](app/api/briefing/route.ts) is:

1. Start a research run with fixed `effort: "low"` and a structured card schema.
2. Restrict the research request to selected government or humanitarian domains, including relevant weather/disaster authorities and UNICEF.
3. Ask for document issue dates, explicit identification of historical material, and a citation for each finding.
4. Handle the asynchronous run with a pending state and signed polling ticket. The ticket is HMAC-SHA256 signed, region-bound and expires after 30 minutes; it is not an API credential.
5. Accept only HTTPS source URLs on the approved domain list that also appear in the returned grounding citations. Exclude unsupported cards.
6. Return each accepted card with a title, summary, source URL, issue date when known, retrieval timestamp and **`reviewStatus: "pending"`**.

Completed briefings are cached for one hour within the server isolate; that cache is an optimization, not durable district-pack storage. The interface keeps saved reference material available while research runs. Exa documents Agent as an asynchronous research API; it is not treated as an instant warning feed. [Exa Agent documentation](https://exa.ai/docs/agent/quickstart)

**Verified:** a hosted run completed with **three supported official-source cards**. **Proposed benefit:** less manual source gathering and easier inspection of provenance. Research time saved and factual accuracy have not yet been benchmarked.

A future physical deployment could let an authorized coordinator approve and publish a dated pack to local hubs during connectivity windows. That approval-and-distribution pipeline is a next step; the current `pending` label must not be interpreted as approval. Exa findings never become official warnings merely because the source domain is official.

### Cerebras: short cloud answers during connectivity windows

Together’s assistance route can call **Cerebras Inference** with **OpenAI’s open-weight `gpt-oss-120b` model**. The current integration uses the OpenAI-compatible `/v1/chat/completions` endpoint, a bounded completion, and low reasoning effort. The UI identifies the selected provider and whether the result is live or a saved demonstration answer. [Cerebras OpenAI compatibility](https://inference-docs.cerebras.ai/resources/openai)

The intended benefit is responsive assistance when a resident or volunteer has a working connection: clarify the details needed in a help request, explain supplied information in plain language, and keep the answer short enough to use on a phone. The integration has returned a readable live answer with HTTP 200. **We have not measured a latency improvement or tokens-per-second result**, and no on-device Cerebras service is running.

Exa and Cerebras are currently separate features. The next integration milestone is an explicit, reviewed flow from a sourced briefing into a concise, translated information pack. Merely connecting both APIs does not prove that all answers are grounded in the latest Exa results.

### OpenAI: assistance and accountable routing

- **Responses API:** `gpt-6-luna` produces bounded assistance using supplied context, with `store: false`. The prompt prohibits invented alerts, emergency numbers, available shelters, safe routes and rescue confirmations.
- **Decisions API:** a resource-category choice and an attention predicate suggest how to route a report. Deterministic SOS handling keeps an explicit SOS urgent independently of model output. A person remains responsible for reviewing and acting on requests.
- **Live evidence:** Responses and Decisions returned HTTP 200. One demonstration water request was categorized as `water` with confidence `0.8`; that is one smoke-test result, not a quality benchmark.
- **Optional adapter:** a transcription API route exists, but resident microphone interaction has not been verified and is not presented as a completed accessibility feature.

The project uses Codex for implementation, debugging and validation and ChatGPT Sites for the three hosted experiences. The runtime AI is called through server routes. Details and configuration are in [integrations](docs/integrations.md).

### Common provider controls

Live calls require both server-side credentials and `TOGETHER_LIVE_AI=true`. Without activation, routes return labeled saved examples and make no external AI call. Input/output bounds, same-origin checks, provider timeouts, fixed provider URLs and sanitized failures help keep the demo predictable.

Best-effort per-client limits apply within each server isolate. They are **not** a durable global quota or hard billing cap. Public deployment needs persistent limits, usage accounting and provider spending controls. No key belongs in browser JavaScript, source control, screenshots or a URL.

## IoT deployment vision: community Wi-Fi plus compact radio messages

![Kathmandu-inspired community and four proposed hubs](docs/images/village.jpg)

A future node could sit at a designated school, health centre, panchayat building or shelter. The goal is a local service people can reach even when the wider internet is unavailable, backed by a compact transport for messages between sites.

```mermaid
flowchart LR
  PHONE[Resident phones] -->|Local Wi-Fi| HUB[Raspberry Pi local hub]
  HUB --- CONTENT[Approved guides and local queue]
  HUB --> BRIDGE[ESP32 and LoRa radio bridge]
  BRIDGE -.->|Short packets over a proposed LoRa mesh| OTHER[Other community hubs]
  HUB -.->|When internet returns| CLOUD[Cloud sync and research]
  SENSOR[Optional IoT sensor] -.->|Separate LoRaWAN option| GATEWAY[LoRaWAN gateway and network server]
```

**Dashed links are proposed physical integrations.** Neither diagram implies that the hosted server can directly access a radio or a visitor’s laptop.

| Part | Proposed responsibility | MVP status |
| --- | --- | --- |
| Raspberry Pi | Local web service, content store and site queue | Interactive 3D representation; no physical hub service deployed |
| ESP32 | Embedded interface between a local service and radio hardware | Concept shown; firmware/transport integration remains future work |
| SX127x LoRa radio and antenna | Carry compact inter-site packets | Visual model and qualitative explanation; no tested RF link |
| Local Wi-Fi | Let ordinary phones reach nearby rich content and forms | Deployment concept; hosted MVP uses the device’s existing network |
| Backup power and enclosure | Keep a field node operating safely | Bill of materials, weather protection and endurance tests still required |
| Optional sensors | Future measured environmental telemetry | No live sensor measurements or flood prediction |

![Interactive Raspberry Pi, ESP32 and LoRa hardware concept](docs/images/iot-bench.jpg)

The electronics scene includes a green Raspberry Pi, teal ESP32, blue radio board, white breadboard, antenna, metallic ports, colored jumper wires and selectable pin explanations. LED/power controls are educational interactions. **This is not validated wiring, a schematic or an electrical simulator.** Hardware selection, voltage compatibility, antenna placement, regional radio requirements, power design and field testing must precede deployment.

### LoRa, LoRa mesh and LoRaWAN are different layers

| Term | What it means | Together’s intended use |
| --- | --- | --- |
| **LoRa** | A long-range, low-power radio physical layer | Short text/status packets through dedicated radio hardware |
| **LoRa mesh** | A networking design that relays packets between radio nodes | A proposed inter-hub transport requiring its own routing, security, retries and congestion controls |
| **LoRaWAN** | A standardized network architecture whose conventional topology is star-of-stars: devices, gateways and network server | A possible separate path for IoT telemetry; not the default mesh between Together hubs |
| **Wi-Fi** | A local network that phones can join directly | Rich local app/content access near a physical hub |

These distinctions follow [Semtech’s LoRa overview](https://www.semtech.com/lora/what-is-lora) and the [LoRa Alliance’s architecture description](https://lora-alliance.org/about-lorawan/). [Meshtastic](https://meshtastic.org/docs/introduction/) is an existing example of LoRa-based mesh messaging; Together has not integrated or claimed compatibility with it.

The payload design matters more than a large range number. A compact request ID, hub, category, people count and acknowledgement are better candidates for radio transport than photos, maps, video or a Wikipedia archive. Actual capacity and range depend on radio configuration, terrain, antenna placement, interference and applicable limits. The LoRa scene is a qualitative teaching model, **not a coverage forecast**. Packet encoding, encryption/key management, duplicate suppression across hubs and delivery accounting remain physical-prototype work.

## Multilingual community access

The product starts with understandable actions, large controls and familiar community concepts. Hindi and English are the primary demonstrated interface paths. Nepali includes some translated strings but is incomplete. Garhwali, Kumaoni and Kangri are **preview selections with Hindi fallback**, not fully localized products.

Cloud assistance can request the selected language; the model is instructed to retain Hindi alongside uncertain regional translations. That is a guardrail, not a translation-quality guarantee. Before field use, native speakers and local coordinators should review essential phrases, terminology, comprehension and accessibility. The proposed pilot includes assisted use for residents who cannot comfortably read or type.

## How Together complements existing systems

| Existing approach | What it already contributes | Together’s proposed contribution |
| --- | --- | --- |
| Official warning systems such as [NDMA SACHET](https://sachet.ndma.gov.in/) | Authoritative, multilingual and geographically targeted alerts | Help residents inspect dated source material and connect it to a human-managed request workflow |
| [Kiwix hotspots](https://get.kiwix.org/en/solutions/hotspots/) | Large offline knowledge collections over local Wi-Fi | A possible knowledge layer beside community check-ins and relief coordination |
| [Meshtastic](https://meshtastic.org/docs/introduction/) and other radio tools | Dedicated off-grid messaging hardware/software | A candidate transport to evaluate for compact requests, subject to integration and field tests |
| Calls, messaging groups and volunteer registers | Familiar human communication and existing trust | Structured categories, request IDs, visible acknowledgement and a shared exercise queue |

The proposal is to fit into local operating practices. Together does not issue official alerts, replace rescue services, or imply endorsement by these organizations.

## Proposed B2G and NGO pilot

The buyer hypothesis is a **District Disaster Management Authority, state agency, NGO or relief operator**. Residents would use the service free. The proposed offer combines deployment and training with annual software maintenance, reviewed local content, preparedness drills and support. Hardware, power, installation and field maintenance would be scoped separately.

Start with an **eight-week, three-site preparedness pilot**, subject to a willing partner:

| Period | Proposed work | Evidence to collect |
| --- | --- | --- |
| Weeks 1–2 | Understand current workflows, select sites/operators and define privacy/source-review responsibilities | Baseline acknowledgement process, risks and operator requirements |
| Weeks 3–4 | Review Hindi/English content and a local-language phrase pack; train volunteers; run the online workflow | Comprehension, training time, usability and request completion |
| Weeks 5–6 | Validate a separate physical hub/radio prototype and conduct controlled connectivity-loss drills | Retained/reconciled messages, packet delivery, observed coverage and power endurance |
| Weeks 7–8 | Repeat drills, review costs and operational ownership, decide on expansion | Comparison with baseline and documented deployment gaps |

Proposed success measures include time to acknowledgement, proportion of requests acknowledged, unsent records preserved through reconnection, age of approved information, resident comprehension, operator workload and cost per maintained site. These are **future measurements, not achieved results**. Radio testing should report actual terrain/configuration and failed deliveries, not only successful range demonstrations.

No contracts, government endorsement, revenue, pricing, field outcomes or procurement approval are claimed. See the [business proposal](docs/business.md) and [evaluation plan](docs/evaluation.md).

## Run locally

Requires **Node.js 22.13+** and npm. The tracked lockfile supports a reproducible install.

```sh
git clone https://github.com/shhhivam12/openai-devday-delhi.git
cd openai-devday-delhi
npm ci
npm run typecheck
npm test
npm run dev
```

The local development entry normally uses port `5173`. Open `/` for the resident app, `/node` for the integrated console, `/demo` for the landing and `/project` for the project narrative. The published demo and nodal Sites use independent entry points built from the shared components.

### Test the D1-backed workflow

A Worker preview needs the generated migration applied to its local D1 binding. Build first, then use the generated Wrangler configuration:

```sh
npm run build
npx wrangler d1 execute DB --local \
  --config dist/server/wrangler.json \
  --persist-to .wrangler/state \
  --file drizzle/0000_dizzy_lenny_balinger.sql
npm start
```

Use the preview URL printed by Wrangler. Apply this initial SQL once to a new local database. Hosted ChatGPT Sites deployment applies schema migrations; no table creation happens inside request handlers. See [network setup](docs/network.md).

### Enable providers deliberately

[`.env.example`](.env.example) documents the names and safe defaults:

```dotenv
OPENAI_API_KEY=
CEREBRAS_API_KEY=
EXA_API_KEY=
TOGETHER_LIVE_AI=false
OPENAI_MODEL=gpt-6-luna
CEREBRAS_MODEL=gpt-oss-120b
```

Use a gitignored environment file supported by the local runtime, or server-side runtime secrets for hosted Sites. Set `TOGETHER_LIVE_AI=true` only when live calls are intended. `GET /api/status` exposes configuration booleans and transport status, never credentials. Confirm `mode: "live"` in each response; a successful sample response does not prove provider activation. The optional transcription route also requires its relevant provider configuration.

### API overview

| Endpoint | Purpose |
| --- | --- |
| `GET /api/status` | Configuration and live-mode status |
| `GET /api/network?node=school` | Shared exercise room and records |
| `POST /api/network` | UUID-based request, check-in, message or status update |
| `POST /api/assist` | OpenAI or Cerebras assistance |
| `POST /api/classify` | OpenAI routing suggestion with deterministic SOS protection |
| `POST /api/briefing` | Start or retrieve a cached district research run |
| `GET /api/briefing?runId=…&ticket=…` | Signed polling for an Exa research result |

## Validation and known limits

As recorded on **1 November 2026**:

- **14 server-policy tests passed**, with TypeScript checks and production builds across the three source trees.
- A resident request appeared in the separate nodal console, was acknowledged there, and refreshed on the resident screen.
- Prepared guides and the local map remained readable after the local preview server was stopped; sync correctly showed device-only status. This verifies the tested browser scenario, not every phone/browser combination.
- OpenAI Responses/Decisions and Cerebras returned live HTTP 200 results; Exa completed signed asynchronous polling with three supported source cards.
- Browser checks exercised family selection, jumper-pin selection, the simulated LoRa SOS/acknowledgement and a narrow phone viewport.

Detailed evidence and chronology: [validation record](docs/validation.md).

The remaining deployment work is substantial and explicit:

- **Operator access:** current private Sites access is not a production role model. Shared endpoints do not yet distinguish authorized dispatchers from other admitted users.
- **Privacy:** names, locations and messages can be sensitive. Production needs data minimization, consent, access scopes, retention/deletion, secure device handling and audit logs. Use fictional data in this demo.
- **AI assurance:** official-domain filtering and citations do not prove factual completeness or freshness. Human review remains necessary. AI does not approve routes, determine shelter availability, dispatch rescue or deny assistance.
- **Disconnected delivery:** the browser outbox is implemented; physical local services and inter-hub transport are not. No local LLM is running on the development Mac or a Raspberry Pi.
- **Field reliability:** radio range, battery life, weather resistance, real sensor accuracy and rescue outcomes are unmeasured.

## Repository guide

```text
app/                       Resident, demo, node and project routes
  api/                     Shared network and provider server routes
components/
  MobileApp.tsx            Resident PWA and outgoing queue
  NodeConsole.tsx          Coordinator dashboard
  DistrictBriefing.tsx     Exa research UI
  DemoLanding.tsx          Demo entry and walkthrough
  CitySimulation.tsx       Fictional community scene
  HardwareSimulation.tsx   Interactive electronics concept
  LoRaSimulation.tsx       Qualitative radio explanation
db/                        Drizzle schema
drizzle/                   SQL migration
deployments/               Fixed server-only nodal proxy sources
lib/server/                Provider policy and saved demo responses
public/sw.js               Versioned offline cache
public/brand/              Together identity assets
public/illustrations/      Original community artwork and map
docs/                      Integration, network, business and test evidence
tests/                     Dependency-light Node policy tests
```

Original community artwork is documented in [character art prompts](docs/character-art-prompts.md). Screenshots show the prototype and fictional demonstration content, not a real disaster deployment. Original Together code and visual assets are supplied for the hackathon; vendored libraries retain their respective licenses.

**Together’s next proof is a careful community drill:** can residents explain their needs, can an accountable coordinator acknowledge them, and can the system preserve that information through a measured connectivity interruption?
