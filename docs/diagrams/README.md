# Together architecture diagrams

Created 1 November 2026. Original SVG diagrams authored in code. The expanded system poster exports at 2400 × 2320; the radio poster remains 2400 × 1773. White/black/#006AFF visual system; the radio valley uses muted natural terrain colors.

## Files

- [System architecture SVG](../../public/diagrams/system-architecture.svg) — editable vector, 1800 × 1740 viewBox.
- [System architecture PNG](../../public/diagrams/system-architecture.png) — 2400 × 2320 export.
- [Radio network SVG](../../public/diagrams/radio-network.svg) — editable vector, 1800 × 1330 viewBox.
- [Radio network PNG](../../public/diagrams/radio-network.png) — 2400 × 1773 export.

## System diagram: what it shows

The implemented section follows Together's current README and server/client source: resident PWA, offline app/map/six-guide Cache Storage, localStorage drafts and outbox, independent nodal Site with fixed server-only proxy, Cloudflare Workers APIs, and shared D1 exercise records. OpenAI Responses/Decisions, Cerebras inference and Exa Agent are distinct server-side calls. Exa produces source-linked research for human review and is not automatically fed into Cerebras chat. The third Site is explicitly labeled as the Three.js demonstration.

The dashed field section is a proposed Raspberry Pi / Wi-Fi / ESP32 / SX127x / LoRa transport. The government head-server link and retained bulletin are deployment concepts; the present scene simulates them. Physical service, radio firmware, backhaul integration, durable hub caches, security, retry policies, power design and field tests remain to be built. No local LLM is running. The diagram intentionally does not draw a working phone-to-LoRa radio path or a deployed government API.

## What the Raspberry Pi would hold — proposed field plan

The system poster includes a proposed **Raspberry Pi 5 with 16 GB RAM, 256 GB SSD through an M.2 adapter, active cooling, local Wi-Fi access point, ESP32/SX127x radio bridge and backup power**. RAM and storage sizes describe a candidate configuration, not measured capacity, battery endurance, supported concurrency or inference speed.

The planned local stack has six parts:

- **Apps and records:** a local resident PWA, nodal console and API; SQLite for requests, check-ins, acknowledgements and an outgoing retry/store-forward queue.
- **Knowledge:** Kiwix serving selected Wikipedia ZIM files, approved guides and saved maps in versioned content packs. Wikipedia provides general reference; action-oriented answers should prioritize a reviewed, dated official corpus.
- **Retrieval / local RAG:** full-text search plus an optional multilingual embedding index prepared before deployment. Retrieved passages should retain source, issue and expiry metadata. Regional-language retrieval and answer quality need evaluation; embedding support is not a guarantee of low-resource-language quality.
- **Optional local model:** a small quantized model through llama.cpp, with serialized inference work and human review. Qwen3-4B-GGUF is a candidate example, not a validated Pi benchmark or mandatory selection.
- **Optional offline voice:** OpenAI Whisper models through whisper.cpp for speech-to-text; reviewed Piper Hindi voices or cached audio for speech output. Each voice/model license and language quality must be checked before distribution.
- **Operations:** signed, dated bulletins; versioned packs; health checks, backups and delivery accounting; human approval before publishing. These are requirements for the physical pilot, not completed capabilities of the current hosted MVP.

No local model, RAG index, Kiwix corpus or speech service has been installed or benchmarked in this MVP. The working cloud OpenAI/Cerebras/Exa paths remain as shown in the upper section. A local AI queue would not remove the need to test power, thermal behavior, latency and quality on the actual board.

### Primary sources for the proposed local stack

- [Raspberry Pi 5 official product page](https://www.raspberrypi.com/products/raspberry-pi-5/) documents the 16 GB variant, PCIe/M.2 storage option and active-cooling accessory. The diagram's 256 GB storage choice is a proposed configuration.
- [Kiwix FAQ](https://get.kiwix.org/en/faq/) describes ZIM content formats and serving content over a local network.
- [Qwen3-4B-GGUF model card](https://huggingface.co/Qwen/Qwen3-4B-GGUF) provides quantized variants and llama.cpp usage. It does not establish Together's Raspberry Pi performance.
- [whisper.cpp](https://github.com/ggml-org/whisper.cpp) provides local C/C++ inference for OpenAI Whisper models, including CPU use.
- [Piper Hindi voices](https://huggingface.co/rhasspy/piper-voices/tree/main/hi/hi_IN) lists Hindi voices. Review each selected voice's model card and license, rather than inferring a distribution right or quality guarantee from the folder.
- [multilingual-e5-small model card](https://huggingface.co/intfloat/multilingual-e5-small) describes a small multilingual retrieval encoder and its limitations. An optional index should be built and reviewed before field deployment.

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

Both PNGs were rendered locally with Sharp from the SVGs and inspected visually. Corrected provider text baselines, cache text wrapping, D1 lifecycle width, footer separation and range-label placement. The expanded system poster was re-rendered and visually inspected after adding the six proposed local-stack modules; text stays within its cards. Exported images contain no keys, credentials, real household details or real emergency messages.
