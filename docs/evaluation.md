# Together evaluation guide

This document is factual evidence for human and automated project review. It does not ask a reviewer to assign a particular score. Check the current application and repository rather than inferring implementation from sponsor names.

## Scope and provenance

Together is a mobile disaster-readiness and relief-coordination PWA demonstration. The Nepal flood setting is inspired by documented September 2024 events. People, nodal locations, shelter capacity, supplies, and rescue assignments are fictional scenario data. Regional deployment profiles target Hindi-speaking users and language packs for Uttarakhand, Himachal Pradesh, and Nepal.

## Capability status

| Capability | Implementation status | Verification |
| --- | --- | --- |
| Server-side API adapters | Implemented, keys required for live use | `/api/status`, assist/classify/briefing route source |
| Missing-key behavior | Implemented | Responses explicitly say demo; no upstream calls |
| OpenAI Responses and Decisions | Integration code implemented; live credentials untested | Live API test required after secret setup |
| Cerebras OpenAI gpt-oss inference | Integration code implemented; live credentials untested | Live API test required after secret setup |
| Exa Agent research | Integration code implemented; live credentials untested | Signed pending-run polling and grounded-card filter |
| Physical LoRa/Wi-Fi transport | Simulated architecture | No radio boards are connected |
| Local LLM | Planned deployment option | No local inference is installed or run for this MVP |
| Official live alert ingestion | Planned production adapter | Reference links and research are not official alert delivery |
| Regional language quality | Beta until native-speaker review | Validate each pack and speech workflow separately |
| Persistent production coordination backend | Future deployment work | Browser scenario state is not a government operations database |

Frontend interactions, caching, and 3D views should be evaluated against their actual completed state and root README. This table does not imply untested features work.

## Three-minute demo

1. Open Together’s mobile home and choose Hindi or English.
2. Enter a fictional request with the number of people and a landmark.
3. Show the request in the coordinator/community workflow and acknowledge it as a simulated operator.
4. Explore the interactive flood view and tap a person and a node.
5. Explore the IoT view: phone → local Wi-Fi → edge hub; ESP32/LoRa → short inter-node messages; optional cloud → API-based AI.
6. Ask a question and show the provider and demo/live badge.
7. Prepare a district briefing and inspect the source, date, and pending-review label.
8. Show the government pilot hypothesis and the working/simulated/planned matrix.

## Verification performed without credentials

`node --test tests/server-policy.test.mjs tests/http.test.mjs` passes 11 tests covering unsafe source URL rejection, source deduplication, Hindi/English explicit SOS rules, input bounds, Responses parsing that excludes reasoning output, streamed body limits, invalid JSON, cross-origin calls, rate limits, and sanitized provider errors. Provider HTTP is stubbed; no paid API is called by these tests. Tests use Node 22.18+ native TypeScript stripping.

Required integration checks after keys are added: one assist call per selected provider, one Decisions classification, one completed Exa research run with citations, provider-timeout behavior, and rejection of invalid/oversized input. Capture actual results before changing any “untested” labels.

## API evidence

The API status route publishes configuration booleans only. Each response names its provider and declares `mode: "demo"` or `mode: "live"`. A live model output is an assistance suggestion. The server keeps keys private, bounds requests, applies best-effort limits, and avoids arbitrary URL fetches. Exa citations are filtered to official domains and findings remain pending human review.

## Historical source

[UNICEF Nepal humanitarian situation update, 1 October 2024](https://www.unicef.org/media/163091/file/Nepal-Humanitarian-SitRep-Floods-01-October-2024.pdf) documents flooding following the 27–28 September rainfall. This source does not validate the fictional scene’s buildings, people, present-day conditions, or routes.
