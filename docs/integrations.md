# Together integrations

Together is a mobile disaster-readiness and community-coordination demonstration. It is built with Codex and intended for publication through ChatGPT Sites. Radio hardware and the physical disaster environment are simulated. This MVP does **not** run a local language model.

## Activation

1. Add `OPENAI_API_KEY`, `CEREBRAS_API_KEY`, and `EXA_API_KEY` as server-side ChatGPT Sites runtime secrets.
2. Set `TOGETHER_LIVE_AI=true` only after the keys, model access, and intended spend have been confirmed.
3. Check `GET /api/status`. It exposes configuration booleans, never key values.
4. Exercise one short request per provider and verify the returned `mode: "live"` and provider badge.

Until activation, routes return useful canned examples labeled `mode: "demo"`. These responses make **zero external AI calls**. Keys must never be placed in browser JavaScript, `.openai/hosting.json`, tracked environment files, or a public form.

Local development can use a gitignored environment file supported by the project runtime. `.env.example` contains names and defaults only. Hosted values belong in Sites runtime secrets. The exact secret-loading behavior should be checked in the deployed environment before enabling live traffic.

## API contract

All routes return JSON and `Cache-Control: no-store`. The common envelope is `{ ok, mode, provider, configured?, answer?, sources?, error? }`. Consumers must check `ok`, the HTTP status, and `mode`; a demo answer must not be presented as a live provider result.

| Endpoint | Request | Result |
| --- | --- | --- |
| `GET /api/status` | No body | Provider configuration booleans, live opt-in, physical transport status |
| `POST /api/assist` | `{ message, language?, provider?: "openai" \| "cerebras", context? }` | Short answer and supplied reference links |
| `POST /api/classify` | `{ message }` | Resource category, attention flag, priority, provenance |
| `POST /api/briefing` | `{ region?: "nepal" \| "uttarakhand" \| "himachal" }` | Saved example pack or live research run |
| `GET /api/briefing?runId=…&ticket=…` | Signed ticket returned by the POST | Pending or completed Exa research |

Message text is limited to 1,200 characters and optional context to 3,000 characters. Bodies are capped at 16 KiB. Cross-origin browser calls are rejected. Requests time out rather than hang. The server fetches only fixed provider endpoints; callers cannot supply an arbitrary fetch URL.

### OpenAI

`/api/assist` uses the Responses API with `gpt-6-luna`, `reasoning.effort: "none"`, a bounded output, and `store: false`. The model can be selected server-side through `OPENAI_MODEL`.

`/api/classify` uses the Decisions API with `gpt-6-luna`, its documented supported model. A `choice` question routes a report into water, food, shelter, rescue, medical assistance, or information. A separate `predicate` flags reports for a coordinator’s attention. An explicit SOS stays urgent through a deterministic rule independently of model output. Classification does not allocate rescue resources or deny assistance.

Sources: [Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create), [Decisions](https://developers.openai.com/api/docs/guides/decisions), [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna).

### Cerebras

The assist route accepts `provider: "cerebras"` and calls OpenAI-compatible Chat Completions at `https://api.cerebras.ai/v1` using OpenAI’s `gpt-oss-120b` model on Cerebras. This is cloud inference. It is intended for rapid summaries and question answering during available connectivity windows. `CEREBRAS_MODEL` is a server-side override.

The current implementation sends a short context and bounds total completion tokens. It does not claim identical support between the OpenAI Responses API and Cerebras Chat Completions.

Sources: [Cerebras OpenAI compatibility](https://inference-docs.cerebras.ai/resources/openai), [Cerebras pricing](https://www.cerebras.ai/pricing).

### Exa

The district-briefing route calls Exa Agent at fixed `effort: "low"`, with a structured card schema. It requests government and humanitarian source material for Nepal, Uttarakhand, or Himachal Pradesh. Research output is filtered to approved HTTPS domains and matched against returned grounding citations. Uncited or unsupported cards are excluded. Accepted cards remain `reviewStatus: "pending"`; a person must approve them before operational use.

Runs are asynchronous. The POST returns `pending: true`, `runId`, `ticket`, and `pollAfterMs: 4000` when needed. Poll with **both** runId and ticket. Tickets are HMAC-signed, expire after 30 minutes, and do not contain credentials. Finished briefings are cached per region for one hour within the current server isolate. The cache is an optimization, not durable storage.

Sources: [Exa Agent quickstart](https://exa.ai/docs/agent/quickstart), [Exa pricing](https://exa.ai/pricing).

## Cost controls and deployment limits

Live calls require an explicit opt-in as well as provider keys. Inputs and outputs are bounded; Exa uses fixed low effort. Best-effort per-client limits apply in each isolate: 20 assist requests, 30 classifications, 6 briefing starts, and 90 briefing polls per five minutes.

These in-memory limits and research caches can reset on restart and do not coordinate across isolates. They are **not a global billing cap**. Before enabling an unrestricted public deployment, add persistent rate limiting, provider spending limits, a global usage ledger, and production authentication/authorization for coordinator actions. The app does not claim to enforce a $5 hard budget.

ChatGPT Sites server code runs on Cloudflare Workers. It can call external APIs over HTTP. It cannot communicate directly with LoRa radios or access a visitor’s laptop through server-side `localhost`. A future physical deployment needs a local gateway service and an explicit transport adapter.

## Offline meaning

New OpenAI, Cerebras, and Exa results need internet in this build. A cached app can show previously saved knowledge and keep outgoing requests on a phone. Physical phone-to-node Wi-Fi, inter-node LoRa, real sensor readings, and inference running on Raspberry Pi or another edge computer are deployment concepts demonstrated visually. They must not be described as tested physical integrations.

## Operational data

The demo scene contains fictional people, shelters, supplies, and response assignments. Historical Nepal material is dated explicitly. Official-source research is not automatically an official warning. An answer must never invent safe routes, shelter opening status, rescue confirmation, or current local conditions. Production deployment needs source governance, translated-content review, verified operator identity, privacy controls, and field validation.
