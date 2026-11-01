# Together

A multilingual disaster-readiness and relief-coordination demonstration, built with Codex and ChatGPT Sites for DevDay Exchange New Delhi. Team Sisyphus.

## Three separate experiences

| Site | Purpose |
| --- | --- |
| https://together-demo.shiiim.chatgpt.site | Demo landing: Kathmandu-inspired 3D city, fictional families, four hubs, jumper-wire hardware model and interactive LoRa valley |
| https://together-node.shiiim.chatgpt.site | Laptop nodal centre: shared requests, acknowledgement, assignment, check-ins, community messages and Exa district briefing |
| https://together-relief.shiiim.chatgpt.site | Resident PWA: help, safe check-in, community, AI and saved guides |

Sharing follows each Site's current access policy. These previews are private. Cerebras and Exa are live with server-side secrets; OpenAI key activation is pending.

## Working now

- Dark, high-contrast navy/blue/violet resident interface, original bold fist logo, vector neighbours and large mobile controls. Layout inspiration: the user-supplied Nixtio dark collaboration design; original Together assets and relief workflow.
- Shared request, check-in and message state in Cloudflare D1. Separate phone and laptop sessions see updates through polling.
- UUID-based retries and bounded inputs. Coordinator status advances from received to acknowledged, assigned and completed.
- Device-local outgoing queue and cached app/guide preparation. Saved guides and drafting requests need no internet or Wi-Fi after preparation.
- Hindi primary actions and English; Nepali and Garhwali/Kumaoni/Kangri selections have limited or preview coverage.
- 24 illustrated homes and four hubs in a Kathmandu-inspired scene. Hover or tap homes to inspect fictional family details and animated connections. Water levels are visual, not a flood forecast.
- Raspberry Pi hub, ESP32, separate SX127x LoRa radio, breadboard, antenna and power model. Eight selectable colored jumper connections with illustrative pin labels.
- Interactive LoRa valley: qualitative reach, terrain attenuation, local Wi-Fi versus radio, animated short SOS and acknowledgement, and an explanation of large-payload limits. No measured coverage is claimed.
- OpenAI Responses/Decisions/transcription, Cerebras gpt-oss-120b and Exa Agent adapters. Samples are clearly labeled before keys. Live calls require keys plus TOGETHER_LIVE_AI=true.

## Important product boundary

Physical communication requires local Wi-Fi or a radio bridge. Ordinary phones do not talk to LoRa directly. This hosted exercise synchronizes through internet-backed server routes; physical radios, local Wi-Fi coverage, floodwater and local inference are simulated. No local model is running on the development Mac. No real emergency service receives a request.

The PWA's no-internet/no-Wi-Fi wording is explicitly scoped to saved guides and storing outgoing requests. New cloud AI and web research need connectivity. Full Wikipedia/Kiwix hosting is a deployment roadmap; this app includes selected original explainers and source links.

## Source layout

- `components/MobileApp.tsx`: resident entry at `/`.
- `components/NodeConsole.tsx`: nodal dashboard, also available at `/node` for local integration QA.
- `components/DemoLanding.tsx`: landing, also at `/demo` locally.
- `components/CitySimulation.tsx`, `HardwareSimulation.tsx`, `LoRaSimulation.tsx`: Three.js scenes.
- `app/api/network`: shared D1 backend; `db/schema.ts` and `drizzle/` contain its schema.
- `components/DistrictBriefing.tsx`: Exa panel with signed asynchronous polling.
- `deployments/nodal-*-proxy.ts`: source of fixed server-only proxies used by the independent nodal Site.
- `/project`: readable problem, evidence, architecture and government pilot.

The independent demo and nodal Sites have separate checkouts and hosting identities. Their frontends are copied from these shared components. The nodal server forwards only network and briefing endpoints to the PWA backend with a private runtime credential. Never put that credential in source, a URL or browser code.

## Run and verify

Requires Node >=22.13 and npm.

```sh
npm ci
npm run typecheck
npm test
npm run dev
```

For shared-data testing, build once and apply the generated SQL to local D1 before starting the Worker preview. See `docs/network.md`. ChatGPT Sites applies schema migrations during hosted deployment.

Validation: 14 server-policy tests, TypeScript checks and production builds; browser verification of request submission, nodal acknowledgement, mobile status refresh, family selection, jumper-pin selection and LoRa SOS/acknowledgement. Hosted Cerebras assistance returned a live answer; Exa Agent completed asynchronous research with three supported official-source cards. OpenAI calls await its key.

## Three-minute demo

1. Open the landing, choose a home, follow its animated connection and inspect a family card.
2. Switch to the IoT node and select a colored jumper connection.
   Explore “LoRa in action,” send a short SOS, and compare its reach with nearby Wi-Fi.
3. Open the mobile app and nodal dashboard at the same selected hub.
4. Submit a fictional water request from the phone; acknowledge it on the laptop; watch the phone update.
5. Try AI or the district brief and inspect its sample/live label. Prepare saved guides for the offline explanation.

## Government pilot

Proposed buyers: district/state disaster authorities, NGOs and relief operators. Residents use the service free. Proposed revenue: deployment/training plus annual software, content, readiness drills and support; hardware separately scoped. Start with an eight-week, three-site pilot. Measure acknowledgement time, information availability, language comprehension, training time and maintained-site cost. No customer, government partnership, field performance or revenue is claimed.

## Sources

- [UNICEF Nepal flood report, 1 October 2024](https://www.unicef.org/media/163091/file/Nepal-Humanitarian-SitRep-Floods-01-October-2024.pdf)
- [NDMA SACHET](https://sachet.ndma.gov.in/), [USDMA](https://usdma.uk.gov.in/), [HPSDMA](https://hpsdma.hp.gov.in/)
- [OpenAI Decisions](https://developers.openai.com/api/docs/guides/decisions)
- [Cerebras compatibility](https://inference-docs.cerebras.ai/resources/openai)
- [Exa Agent](https://exa.ai/docs/agent/quickstart)

Original Together code and vector assets are supplied for the hackathon. Vendored libraries retain their licenses.
