# Together — when we have each other

Together is a mobile-first, multilingual disaster-readiness and community-relief PWA. It helps residents record needs, check in as safe, read saved information, and follow coordinator acknowledgements. A lightweight interactive 3D flood story and an explorable Raspberry Pi / ESP32 / LoRa node explain the deployment vision.

Built for DevDay Exchange Community Hackathon, New Delhi, 1 November 2026. Team Sisyphus. Built with Codex and ChatGPT Sites, with OpenAI, Cerebras and Exa API adapters.

## Start here

- App: https://together-relief.shiiim.chatgpt.site (hosting access follows Sites sharing settings)
- Plain HTML project overview: `/project` — problem, demonstration, implementation status, business, architecture and sources.
- API readiness: `GET /api/status` — configuration booleans only, never secrets.
- Integration/setup details: [docs/integrations.md](docs/integrations.md)
- Government pilot: [docs/business.md](docs/business.md)
- Evaluation walkthrough: [docs/evaluation.md](docs/evaluation.md)

## What works

| Capability | Status |
| --- | --- |
| Help requests, safe check-in, community posts | Working browser-local persistence |
| Coordinator acknowledgement and assignment | Working scenario workflow; no real dispatch |
| Saved knowledge | Six concise, attributed guides and explainers |
| PWA | Manifest, icons, cache preparation, offline outgoing records |
| Languages | Hindi primary actions, English/Nepali interface strings; Garhwali/Kumaoni/Kangri preview selections with Hindi fallback |
| Flood and IoT hardware views | Interactive Three.js illustrations with accessible DOM controls |
| OpenAI Responses/Decisions, Cerebras, Exa | Server adapters implemented, clearly labeled sample responses before keys |
| OpenAI voice | Optional bounded transcription endpoint, disabled before keys |
| Physical Wi-Fi/LoRa, sensors, local inference | Conceptual deployment roadmap, not tested hardware |

The Nepal September 2024 flood is a historical reference. People, locations, shelter capacity, inventories, water levels, and responses are fictional. This is not a forecast, navigation system or emergency dispatch service. No local model runs on the development laptop.

## Meaningful sponsor integrations

- **ChatGPT Sites:** mobile website, Worker server routes, hosted deployment.
- **Codex:** implementation, original vector assets, 3D scenes, tests, integration and commits.
- **OpenAI:** Decisions for report categorization and human-review flags; Responses for concise grounded assistance; optional gpt-transcribe voice input.
- **Cerebras:** OpenAI gpt-oss-120b cloud inference through Chat Completions.
- **Exa Agent:** fixed low-effort official-source district research with citations and coordinator review.

All live calls require server secrets AND `TOGETHER_LIVE_AI=true`. Missing keys produce labeled sample responses. New inference and research require internet; cached guides and saved requests remain available offline. Keys will be added after the initial build. Provider behavior remains untested until activation.

## Run locally

Requires Node >=22.13 and npm.

```sh
npm ci
npm run dev
```

Use the Local URL printed by the server. `npm run typecheck`, `npm test`, and `npm run build` validate the project. Deployment uses the ChatGPT Sites workflow with `.openai/hosting.json`; preserve its project ID and Sites Vite integration.

Copy `.env.example` to an untracked local environment file only when activating APIs. For hosting, use Sites runtime secrets. Never commit key values.

## Demo in three minutes

1. Open Overview, choose a language and submit a help request.
2. At Relief desk, acknowledge the request, then assign support. Observe the rule-based or live OpenAI routing label.
3. Open Ask Together; try a suggested question and read its provider/mode label.
4. Prepare the offline pack, read a guide and try offline mode. This switch pauses cloud calls; an actual offline reload is a separate cache check.
5. Explore the flood slider and tap people/nodes. Show the conceptual Raspberry Pi, ESP32 + LoRa, power and phone assembly.
6. Prepare an Exa district briefing. Before keys, show the clearly labeled historical/preparedness reference pack.
7. Open `/project#business` for the proposed district pilot and annual preparedness service.

## Architecture and business

Phones use local Wi-Fi to access a community hub; ESP32/LoRa radios could relay short coordination messages between equipped points. Large information packs and future local inference stay at the hub. Cloud APIs assist during connectivity windows. Standard LoRaWAN is a gateway-based sensor architecture; inter-camp multi-hop is a LoRa mesh concept.

Proposed customer: district/state disaster authorities and relief organizations. Proposed revenue: deployment/training plus annual software, content, readiness drills and support, with separately costed hardware. Residents access the service free. Start with a supervised eight-week, three-site pilot. No paid customer or government partnership is claimed.

## Sources

- [UNICEF Nepal floods, 1 October 2024](https://www.unicef.org/media/163091/file/Nepal-Humanitarian-SitRep-Floods-01-October-2024.pdf)
- [NDMA SACHET](https://sachet.ndma.gov.in/)
- [USDMA](https://usdma.uk.gov.in/), [HPSDMA](https://hpsdma.hp.gov.in/), [Nepal DHM](https://dhm.gov.np/)
- [OpenAI Decisions](https://developers.openai.com/api/docs/guides/decisions)
- [Cerebras compatibility](https://inference-docs.cerebras.ai/resources/openai)
- [Exa Agent](https://exa.ai/docs/agent/quickstart)

Original Together code and vector assets are supplied for the hackathon. Vendored starter libraries retain their own licenses.
