# Together architecture diagrams

Created 1 November 2026. Original SVG diagrams authored in code, with matching 2400 × 1773 PNG exports. White/black/#006AFF visual system; the radio valley uses muted natural terrain colors.

## Files

- [System architecture SVG](../../public/diagrams/system-architecture.svg) — editable vector, 1800 × 1330 viewBox.
- [System architecture PNG](../../public/diagrams/system-architecture.png) — 2400 × 1773 export.
- [Radio network SVG](../../public/diagrams/radio-network.svg) — editable vector, 1800 × 1330 viewBox.
- [Radio network PNG](../../public/diagrams/radio-network.png) — 2400 × 1773 export.

## System diagram: what it shows

The implemented section follows Together's current README and server/client source: resident PWA, offline app/map/six-guide Cache Storage, localStorage drafts and outbox, independent nodal Site with fixed server-only proxy, Cloudflare Workers APIs, and shared D1 exercise records. OpenAI Responses/Decisions, Cerebras inference and Exa Agent are distinct server-side calls. Exa produces source-linked research for human review and is not automatically fed into Cerebras chat. The third Site is explicitly labeled as the Three.js demonstration.

The dashed field section is a proposed Raspberry Pi / Wi-Fi / ESP32 / SX127x / LoRa transport. The government head-server link and retained bulletin are deployment concepts; the present scene simulates them. Physical service, radio firmware, backhaul integration, durable hub caches, security, retry policies, power design and field tests remain to be built. No local LLM is running. The diagram intentionally does not draw a working phone-to-LoRa radio path or a deployed government API.

## Radio diagram: interpretation

The upper section depicts a proposed LoRa mesh messaging design between dedicated radios. Phones reach a local Pi/AP over Wi-Fi; the Pi needs an embedded radio bridge. A ridge radio can forward compact messages in the proposed design. Together has not integrated Meshtastic, deployed a mesh protocol or measured RF performance.

The separate lower section depicts conventional LoRaWAN telemetry: end devices communicate with gateway(s); gateways use IP backhaul to a network server; application data reaches an application service. A conventional LoRaWAN gateway network is not a hub-to-hub mesh. A multi-channel LoRaWAN gateway/concentrator and a simple SX127x message bridge are distinct roles.

**The 1 km, 3 km and 5 km circles are illustrative planning distances only.** They are not actual coverage, measured range, guaranteed reach, a geographic map, or derived from a link-budget calculation. The concentric radii use 1:3:5 proportions. Terrain, foliage, antenna height/performance, radio configuration, power and interference affect the actual link. Range and airtime/capacity should be measured in the intended terrain and allowed regional configuration before a deployment claim.

## Primary technical sources checked

1. [LoRa Alliance — About LoRaWAN](https://lora-alliance.org/about-lorawan/). The architecture section specifies star-of-stars, end devices, gateways, network servers and standard IP connections. It describes single-hop radio links between end devices and gateways. Its generic rural-range description is not used as a Together range promise.
2. [Semtech — What is LoRa](https://www.semtech.com/lora/what-is-lora). Distinguishes the LoRa physical layer from the LoRaWAN interoperability standard and notes that alternative networking implementations can be built over LoRa. Describes IP backhaul and network/application server roles.
3. [Murata — Realistic LoRa range FAQ](https://www.murata.com/support/faqs/lpwa/lora/hardware/0008). Supports the dependence of achieved range on placement, obstacles, antenna performance and transmit-power settings. Its vendor test distances are not represented as Together results.
4. [Meshtastic — Introduction](https://meshtastic.org/docs/introduction/). Gives a primary-source example of dedicated LoRa radios rebroadcasting messages to form a mesh. Included as an existing example, not an implemented Together dependency or compatibility claim.

## QA

Both PNGs were rendered locally with Sharp from the SVGs and inspected visually. Corrected provider text baselines, cache text wrapping, D1 lifecycle width, footer separation and range-label placement. Exported images contain no keys, credentials, real household details or real emergency messages.
