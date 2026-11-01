export const languages = [
  { code: "hi", name: "हिन्दी", label: "Hindi" },
  { code: "en", name: "English", label: "English" },
  { code: "ne", name: "नेपाली", label: "Nepali" },
  { code: "gar", name: "गढ़वाली", label: "Garhwali · preview" },
  { code: "kum", name: "कुमाऊँनी", label: "Kumaoni · preview" },
  { code: "kan", name: "कांगड़ी", label: "Kangri · preview" },
];
export const copy: Record<string, Record<string, string>> = {
  en: {
    help: "I need help",
    safe: "I’m safe",
    home: "Overview",
    alerts: "Alerts & advisories",
    community: "Community",
    ask: "Ask Together",
    knowledge: "Saved knowledge",
    simulation: "Explore the network",
    coordinator: "Relief desk",
    title: "When we have each other,\nwe have a way forward.",
    subtitle:
      "A little connection. A lot of hope. Your community’s place for help, trusted information, and looking out for each other.",
    greeting: "Your community, connected.",
  },
  hi: {
    help: "मुझे मदद चाहिए",
    safe: "मैं सुरक्षित हूँ",
    home: "एक नज़र",
    alerts: "चेतावनी और सूचनाएँ",
    community: "हमारा समुदाय",
    ask: "Together से पूछें",
    knowledge: "सहेजी गई जानकारी",
    simulation: "नेटवर्क को समझें",
    coordinator: "राहत केंद्र",
    title: "जब हम साथ हैं,\nतो आगे का रास्ता है।",
    subtitle:
      "मदद, भरोसेमंद जानकारी और एक-दूसरे का साथ। मुश्किल समय में अपने समुदाय से जुड़े रहें।",
    greeting: "आपका समुदाय, एक साथ।",
  },
  ne: {
    help: "मलाई सहयोग चाहिन्छ",
    safe: "म सुरक्षित छु",
    home: "एक नजर",
    alerts: "सूचना र चेतावनी",
    community: "समुदाय",
    ask: "Together लाई सोध्नुहोस्",
    knowledge: "सुरक्षित जानकारी",
    simulation: "नेटवर्क बुझ्नुहोस्",
    coordinator: "राहत केन्द्र",
    title: "हामी साथ हुँदा,\nअगाडि बढ्ने बाटो छ।",
    subtitle:
      "सहयोग, भरपर्दो जानकारी र एकअर्काको साथ। कठिन समयमा आफ्नो समुदायसँग जोडिनुहोस्।",
    greeting: "तपाईंको समुदाय, सँगै।",
  },
};
export type ReliefRequest = {
  id: string;
  name: string;
  category: string;
  people: number;
  location: string;
  message: string;
  status:
    | "Saved on this device"
    | "Received at demo node"
    | "Acknowledged"
    | "Assigned";
  createdAt: string;
};
export const initialRequests: ReliefRequest[] = [
  {
    id: "TG-1042",
    name: "Maya K.",
    category: "Drinking water",
    people: 4,
    location: "Riverside homes · Zone A",
    message:
      "Our drinking water supply is running low. Four people at the upper floor.",
    status: "Received at demo node",
    createdAt: "Scenario · 8 min ago",
  },
  {
    id: "TG-1041",
    name: "Arun S.",
    category: "Shelter",
    people: 2,
    location: "East footbridge · Zone B",
    message:
      "We need a place to stay tonight. We can reach the community school.",
    status: "Acknowledged",
    createdAt: "Scenario · 15 min ago",
  },
  {
    id: "TG-1040",
    name: "Nima R.",
    category: "Rescue assistance",
    people: 3,
    location: "Riverside homes · Zone A",
    message:
      "Three people waiting on the upper floor for responder assistance.",
    status: "Assigned",
    createdAt: "Scenario · 22 min ago",
  },
];
export const knowledge = [
  {
    id: "family",
    category: "STAY CONNECTED",
    title: "Make a family check-in plan",
    description: "Agree on a meeting point and leave a clear message.",
    icon: "users",
    source: "Ready.gov",
    url: "https://www.ready.gov/plan",
    body: "Choose a contact and a meeting place with your family before a disruption. Keep essential contact details written down. In Together, a check-in records the place and time you supplied. It does not confirm that a family member has received it. Ask a camp coordinator to help relay messages when needed.",
  },
  {
    id: "flood",
    category: "WIKIPEDIA EXPLAINER",
    title: "Understand flooding",
    description: "A short introduction, saved for reading without internet.",
    icon: "waves",
    source: "Wikipedia · Flood",
    url: "https://en.wikipedia.org/wiki/Flood",
    body: "A flood is an overflow of water onto land that is normally dry. Flooding can follow heavy rainfall, rivers overflowing, or coastal surges. This concise, Together-authored explainer is a small offline knowledge sample, not a complete Wikipedia archive. Operational instructions should come from the responsible local authority.",
  },
  {
    id: "message",
    category: "COMMUNITY GUIDE",
    title: "Write a useful help request",
    description: "Tell coordinators what you need and where to find you.",
    icon: "message",
    source: "Together demo guide",
    url: "/project",
    body: "Include what you need, the number of people with you, a recognizable location, and the time of the request. Keep the original message available. A received or acknowledged request is not a promise that assistance has been dispatched. You can follow its status in the relief desk.",
  },
  {
    id: "alerts",
    category: "TRUSTED INFORMATION",
    title: "Check where an alert came from",
    description: "Look for the issuer, issue time, and expiry.",
    icon: "shield",
    source: "NDMA SACHET",
    url: "https://sachet.ndma.gov.in/",
    body: "Read the issuing authority, area, timestamp, and expiry before relying on an alert. Saved information may be outdated. Together keeps source links and last-refresh details visible. Translations and AI summaries are aids; preserve the original authority text alongside them.",
  },
  {
    id: "offline",
    category: "HOW TOGETHER WORKS",
    title: "Your offline knowledge pack",
    description: "Understand what stays available when you disconnect.",
    icon: "download",
    source: "Together architecture",
    url: "/project",
    body: "After preparing the pack, selected text articles and the application shell can be read from this browser’s cache. Outgoing requests are saved on the device. This MVP uses cloud APIs for new AI answers and simulates radio transport. Future physical nodes would serve local content over Wi-Fi.",
  },
  {
    id: "camp",
    category: "FOR VOLUNTEERS",
    title: "Keep a simple camp resource log",
    description: "Record stock, commitments, and who acknowledged a request.",
    icon: "package",
    source: "Together demo guide",
    url: "/project",
    body: "Keep incoming supplies, committed quantities, and remaining stock separate. Record who approved an assignment and when it was acknowledged. The Together demo demonstrates a shared workflow within this browser. A production deployment needs authenticated operators and durable synchronization between nodes.",
  },
];
