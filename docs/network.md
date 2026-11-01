# Shared exercise network

The mobile app and nodal console share one D1-backed exercise room per node. These are online demonstration records. Physical LoRa, local Wi-Fi, power systems and disconnected transport are illustrated separately. No real responder is contacted.

## Storage

`.openai/hosting.json` declares `d1: "DB"`. The schema is `db/schema.ts`. The generated Drizzle migration must be applied before the Worker is used. Hosted Sites publication applies migrations. Local D1 previews need the SQL migration applied with Wrangler. No schema creation occurs in request handlers.

Tables: `network_requests`, `network_checkins`, `network_messages`, `network_operations`. Client-generated UUIDs make normal retry operations idempotent. Request status advances from received to acknowledged, assigned and completed. No transition goes backwards. The demo has no operator-role model beyond Sites access; it is not a production dispatch system.

## API

`GET /api/network?node=school` returns `{ok,mode:"shared-demo",connected,node,nodes,requests,checkins,messages,counts,updatedAt}`. Node IDs: school, riverside, health, hill. Counts represent saved exercise records, never actual connected devices.

`POST /api/network` requires JSON, a UUID `id`, and a node. Supported actions:

- `{type:"request",id,node,name,category,people,location,message}`. Categories: water, food, shelter, rescue, medical, supplies, information. Status begins `received`.
- `{type:"checkin",id,node,name,people,location}`.
- `{type:"message",id,node,name,message}`.
- `{type:"update",id,node,requestId,status:"acknowledged"|"assigned"|"completed"}`.

Messages are bounded to 800 characters, names to 60, location to 120, and people to 1–99. JSON bodies are capped by the shared helper. Missing D1 binding and service failures return an explicit 503 with `connected:false`, never a fictional synced state. Empty rooms stay empty.

The nodal dashboard uses relative `/api/network` calls. A separate nodal Site can forward fixed network requests to the mobile Site using server-side private service access. Credentials must not reach the browser. All shared state remains in the mobile Site's D1 database.

The independent nodal Worker enables Cloudflare's `global_fetch_strictly_public` compatibility flag so outbound requests use public hostname routing, including another Site in the same zone. Both network and briefing proxies allow only the configured Together backend. Sanitized failure codes distinguish upstream access, redirects, timeouts and fetch failures.

## Validation and deployment boundary

Test the three actions from a phone or separate browser and observe them in the laptop console. The console polls every five seconds. Real disconnected operation needs a physical local server and transport adapter. A cloud deployment cannot communicate without a working network path. Resource planning quantities on the nodal dashboard are explicitly local illustrative values and are not shared stock records.
