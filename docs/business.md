# Together: proposed government business

## Buyer and problem

Together is proposed disaster-readiness infrastructure for district authorities and relief organizations. The product gives residents an understandable way to request help, access saved information in their language, and see whether a coordinator has acknowledged a request. Camp operators get a shared queue for people’s needs and resource coordination.

The proposed buyer is a District Disaster Management Authority or a state disaster-management agency. Camp operators, trained volunteers, panchayat staff, and residents are the users. Residents would access the service free at the point of use. No government partnership, paid pilot, procurement approval, or commercial traction is claimed.

Uttarakhand’s state authority describes responsibilities around preparedness, coordination, capacity building, and disaster-management planning. This makes the buyer hypothesis relevant; it does not establish purchase intent. [USDMA responsibilities](https://usdma.uk.gov.in/about-department/functions-and-responsibilities/)

## Offer

An annual district service would include a coordinator dashboard, maintained district information packs, approved language packs, training, preparedness drills, support, and reports on readiness. Deployment and initial training would be a one-time charge. Hardware procurement, installation, power backup, and field maintenance would be quoted separately through partners.

Nodes would be pre-positioned at designated shelters, schools, panchayat buildings, or health centres. The future architecture combines local Wi-Fi for phones and rich content, an edge computer for locally stored services, and short LoRa messages between sites. LoRaWAN may serve sensor-to-gateway telemetry; standard LoRaWAN is not being represented as a general-purpose mesh.

The hackathon prototype validates a digital workflow and explains the deployment vision. It does not establish physical radio reliability, resilience, energy requirements, or medical effectiveness.

## First pilot hypothesis

Propose an eight-week, three-site preparedness pilot with a district or NGO partner. Select a small area, identify accountable operators, prepare approved content, translate essential phrases with native speakers, run drills, and compare results with the existing coordination process.

Suggested pilot milestones:

1. Document the district’s current alert and request workflows.
2. Agree on three locations, operator roles, and a source-review process.
3. Prepare Hindi and English content plus a reviewed local-language phrase pack.
4. Run an online workflow drill using the prototype.
5. Validate a separate physical connectivity prototype before any off-grid claims.
6. Review metrics and decide whether a larger deployment is justified.

## Metrics that can be measured

| Metric | Evidence |
| --- | --- |
| Request acknowledgement | Proportion acknowledged by an operator and time to acknowledgement in drills |
| Message continuity | Locally saved requests retained across reload/reconnection tests |
| Information freshness | Age and source of saved alerts and documents |
| Language comprehension | Resident comprehension tests using native-speaker-reviewed content |
| Operational effort | Training time, maintenance hours, and cost per supported site |
| Deployment readiness | Physical range, power, weather resistance, and coverage measured in a future hardware pilot |

Lives saved, guaranteed rescue times, radio range, and avoided economic losses are not claimed without evidence. Pricing and unit economics remain hypotheses until a hardware bill of materials, installation costs, support requirements, and buyer interviews are complete.

## Fit with existing infrastructure

Together complements official warning systems and existing volunteer/radio tools. NDMA SACHET already publishes multilingual, geographically targeted alerts. Exa can help research a source-linked district pack; it does not replace the warning issuer. OpenAI helps interpret residents’ language and route reports. Cerebras can accelerate summaries during connectivity windows. Human coordinators approve operational assignments.

Sources: [SACHET](https://sachet.ndma.gov.in/), [Kiwix offline hotspots](https://get.kiwix.org/en/solutions/hotspots/), [Meshtastic](https://meshtastic.org/docs/introduction/).

## Pitch

“Together helps district authorities keep communities informed and relief camps coordinated when normal connectivity becomes unreliable. Built with Codex and delivered through ChatGPT Sites, it combines Exa’s sourced research, OpenAI’s language and classification capabilities, and Cerebras inference with a deployment vision of community Wi-Fi and LoRa-connected relief nodes.”
