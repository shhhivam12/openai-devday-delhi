export const knowledgeSources = [
  { title: "NDMA SACHET — official disaster alerts", url: "https://sachet.ndma.gov.in/" },
  { title: "UNICEF — Nepal floods, October 2024 historical report", url: "https://www.unicef.org/media/163091/file/Nepal-Humanitarian-SitRep-Floods-01-October-2024.pdf" },
];

export function demoAnswer(message: string, language: string) {
  const hindi = language === "Hindi" || language === "hi";
  if (/water|पानी|जल/i.test(message)) return hindi
    ? "यह सहेजा हुआ डेमो उत्तर है। ‘मदद चाहिए’ में पानी चुनें, लोगों की संख्या और पास का पहचान-चिह्न लिखें। अनुरोध को राहत शिविर के संयोजक तक पहुँचते हुए देखें। डेमो में दिखाया गया शिविर और उसका स्टॉक काल्पनिक है। पुष्टि होने पर ही संसाधन उपलब्ध मानें।"
    : "Saved demo guidance: choose Water in ‘I need help’, add the number of people and a nearby landmark, and follow the request in the community feed. The shelter and supply counts in this scenario are fictional; a coordinator must confirm availability. Open the saved knowledge cards for source information.";
  return hindi
    ? "यह सहेजा हुआ डेमो उत्तर है। मदद के लिए अपनी ज़रूरत, लोगों की संख्या और पहचान-चिह्न लिखें। अनुरोध की स्थिति समुदाय स्क्रीन पर देखें। इस संस्करण में लाइव AI के लिए इंटरनेट चाहिए; ऑफलाइन जानकारी और सहेजे गए अनुरोध उपलब्ध रहते हैं।"
    : "Saved demo guidance: describe what you need, how many people are with you, and a nearby landmark. Track the request in the community view and wait for a coordinator’s acknowledgement. This MVP uses cloud APIs for new AI answers; saved knowledge and your outgoing queue remain available offline.";
}

export const demoCards = [
  { title: "Nepal flood reference", summary: "Historical reference: UNICEF documented severe flooding following rainfall on 27–28 September 2024. The people, shelters and resources in Together’s scene are fictional.", sourceUrl: knowledgeSources[1].url, sourceTitle: knowledgeSources[1].title, publishedAt: "2024-10-01", reviewStatus: "reference", kind: "historical" },
  { title: "India alert source", summary: "SACHET publishes official multilingual, geographically targeted disaster alerts. Together’s deployment vision is to save approved alerts locally and show when they were last refreshed.", sourceUrl: knowledgeSources[0].url, sourceTitle: knowledgeSources[0].title, publishedAt: null, reviewStatus: "reference", kind: "preparedness" },
];
