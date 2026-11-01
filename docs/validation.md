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

## Still to validate after keys

One live request each for OpenAI Responses, OpenAI Decisions, Cerebras and Exa; Exa asynchronous completion/citations; optional microphone transcription; actual account rate limits and charges. Regional-language content beyond the supplied primary interface strings needs native-speaker review.

## Boundaries

Physical LoRa/Wi-Fi deployment, sensors, radio range, flood physics, local LLMs, real rescue dispatch, cross-device synchronization, authenticated coordinator roles, and field outcomes are not validated by this browser MVP. Application records currently persist within one browser. Production business and government pilot are proposals.
