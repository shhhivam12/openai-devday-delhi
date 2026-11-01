/** Small, dependency-free policy helpers shared by server routes and Node tests. */
export const OFFICIAL_DOMAINS = ["ndma.gov.in", "sachet.ndma.gov.in", "usdma.uk.gov.in", "uk.gov.in", "hp.gov.in", "hpsdma.nic.in", "dhm.gov.np", "hydrology.gov.np", "bipadportal.gov.np", "unicef.org"];
export const LANGUAGES = ["English", "Hindi", "Nepali", "Garhwali", "Kumaoni", "Kangri"];
export const REGIONS = {
  nepal: { name: "Kathmandu Valley, Nepal", domains: ["dhm.gov.np", "hydrology.gov.np", "bipadportal.gov.np", "unicef.org"] },
  uttarakhand: { name: "Uttarakhand, India", domains: ["usdma.uk.gov.in", "uk.gov.in", "sachet.ndma.gov.in", "ndma.gov.in"] },
  himachal: { name: "Himachal Pradesh, India", domains: ["hpsdma.hp.gov.in", "hp.gov.in", "hpsdma.nic.in", "sachet.ndma.gov.in", "ndma.gov.in"] },
};

/** @param {unknown} value @param {number} max @param {string} label */
export function requiredText(value, max = 1200, label = "message") {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required.`);
  const text = value.trim();
  if (text.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return text;
}

/** @param {unknown} value */
export function isOfficialUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && OFFICIAL_DOMAINS.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch { return false; }
}

/** @param {string} message */
export function demoClassification(message) {
  const text = message.toLocaleLowerCase();
  const category = /water|पानी|जल/.test(text) ? "water" : /shelter|आश्रय|रहने|tent/.test(text) ? "shelter" : /food|भोजन|खाना|ration/.test(text) ? "food" : /rescue|stranded|trapped|फँस|फंस|बचाओ|sos/.test(text) ? "rescue" : /medicine|medical|दवा|चिकित्सा|injur/.test(text) ? "medical" : "information";
  const explicitSOS = /\bsos\b|rescue|stranded|trapped|फँस|फंस|बचाओ/.test(text);
  return { category, needsAttention: explicitSOS || category === "medical", priority: explicitSOS ? "urgent" : "normal", explicitSOS };
}

/** @param {unknown} data */
export function responseText(data) {
  const value = /** @type {any} */ (data);
  if (typeof value?.output_text === "string") return value.output_text;
  return (value?.output ?? []).filter((item) => item.type === "message").flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text" && typeof item.text === "string").map((item) => item.text).join("\n");
}

/** @param {unknown} value */
export function normalizeSources(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter((item) => item && isOfficialUrl(item.url)).filter((item) => { if (seen.has(item.url)) return false; seen.add(item.url); return true; }).slice(0, 8).map((item) => ({ title: typeof item.title === "string" ? item.title.slice(0, 180) : new URL(item.url).hostname, url: item.url }));
}
