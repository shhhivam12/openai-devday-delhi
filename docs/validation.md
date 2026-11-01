# Validation evidence — 1 November 2026

## Passed before initial API-key activation

- TypeScript: `npm run typecheck`.
- Server tests: `npm test` — 11 passing tests for bounded JSON, origin/rate checks, sanitized provider failures, official-source filtering, SOS preservation and Responses text parsing.
- Production build: Sites build helper completed all five Vinext build stages.
- API smoke checks on local server: `/api/status`, `/api/assist`, `/api/classify`, `/api/briefing` returned HTTP 200 with `mode: demo`; blank assistance input returned HTTP 400. Status confirmed all keys absent and live AI disabled.
- Browser workflow: submitted a four-person water request, saw it in Relief desk, acknowledged it, then recorded an assignment. Demo rule-routing provenance appeared.
- Browser AI: a suggested question returned a sample answer with provider and source links; no live inference was claimed.
- Browser 3D: inspected flood scene and hardware assembly; selected ESP32 + LoRa and activated component-lifting control.
- Responsive check: desktop and narrow phone view rendered; observed no document-level horizontal overflow.
- Production offline-cache check: prepared the pack on built Worker preview, stopped the preview server, reloaded the cached app, then opened the saved flood explainer successfully. This verifies origin-unavailable behavior in this browser, not every mobile OS/browser.
- Vector logo assets and 192/512 px PNG PWA icons rendered and checked by the logo task.

## Live provider validation

- Hosted status confirmed live mode, Cerebras and Exa configured, OpenAI absent.
- Cerebras returned HTTP 200, `mode: live`, with a readable gpt-oss-120b answer.
- Exa Agent accepted a low-effort asynchronous research run. Signed polling completed with three cards, official-domain source links, preserved issue dates and pending human-review status.
- A hosted D1 request was saved successfully with HTTP 201. No real emergency service was contacted.
- The separate hosted nodal Site read that same record and acknowledged it through its fixed server-side proxy (HTTP 200 read; HTTP 201 update). Cloudflare public-hostname routing was enabled to support cross-Site requests.

OpenAI Responses, OpenAI Decisions and optional microphone transcription still await an OpenAI key. Regional-language content beyond the supplied primary interface strings needs native-speaker review. Account billing totals and field outcomes are not measured.

## Boundaries

Physical LoRa/Wi-Fi deployment, sensors, radio range, flood physics, local LLMs, real rescue dispatch, authenticated coordinator roles and field outcomes are not validated by this browser MVP. Exercise requests, check-ins and messages persist in shared D1; outgoing retries and prepared guides remain device-local. Production business and government pilot are proposals.

## Three-site redesign verification

- Three separate source checkouts and Site identities created for demo, nodal centre and resident PWA.
- TypeScript checks passed across all three source trees during integration.
- 14 server tests now pass, including shared-network input and action validation.
- Applied the generated seven-statement schema migration to local D1.
- In separate browser tabs, created a four-person water request in the resident PWA, observed it in the nodal console, acknowledged it, and observed the acknowledgement refresh in the resident PWA.
- Selected Home 12 in the city: fictional Basnet family details and assigned connection updated.
- Selected DIO0 in the wiring view: GPIO26 mapping and explanation updated.
- New PWA uses a bold fist, large icon controls and scoped offline wording. Saved guides and drafting requests need no internet/Wi-Fi; communication still needs a local link.
- Resident controls, vector neighbours and floating icon navigation were reviewed at desktop and 390 × 844 phone viewport, including the help form. Final warm-white/forest-green palette verified after integration on the resident screen, nodal console, landing and LoRa scene. Canvas label color handling and font size were adjusted for legibility on light backgrounds.
- LoRa valley view completed a simulated SOS/acknowledgement. Selecting a photo explained why the demonstration uses short text. Reach and terrain are qualitative controls, not measured RF predictions.

## Final light-theme check

- Prepared the light PWA cache, stopped its local Worker server, reloaded the app and opened the saved flood explainer successfully. Shared sync correctly displayed device-only status.
- Cache version and readiness state are versioned together so a previous download does not claim the updated pack is ready.
- Green fist SVG, app icons, wordmark and submission banner regenerated; no API/network workflow changed in the theme pass.

## Reference-layout rebuild and local map

- Rebuilt resident structure with compact header controls, grey/white grouped lists, black pill actions, restrained lime status chips and five-icon navigation. Home artwork was removed.
- Saved SVG neighbourhood map includes four selectable hubs and three fictional family homes, a layer toggle, zoom and a selected-hub card. It loads no external tiles and does not request GPS.
- Browser: selecting Home 12 displayed the fictional Basnet family and Riverside hub; selecting that hub updated the app connection settings. Switched back to School and submitted a four-person demonstration request successfully.
- After preparing the updated app cache, stopped the local Worker, reloaded the app and opened the Map tab. Hubs, homes, controls and the selected-hub card remained available; connection status correctly changed to device-only.
- Original solid fist, wordmark, lime app icon and banner replaced the previous logo; checked at 16, 24 and 32 pixels by the logo task.
