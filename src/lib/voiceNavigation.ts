// Voice navigation utilities using Gemini for robust intent parsing
// Also includes an offline fallback matcher when API is unavailable

export type VoiceDecision = {
  action: "navigate" | "chat";
  targetId: string | null; // one of known feature IDs when action === 'navigate'
  confidence: number; // 0..1
  reason?: string;
  language?: string;
  queryNormalized?: string;
};

// Known feature IDs used across the app (must match Index.tsx cases)
export const KNOWN_FEATURE_IDS = [
  "home",
  "twin",
  "chatbot",
  "notifications",
  "profile",
  "diagnose",
  "market",
  "planner",
  "weather",
  "forum",
  "resources",
  "knowledge",
  "buy",
  "scan",
  "expense",
  "news",
  "schemes",
  "labourers",
  "fairfarm",
] as const;

type FeatureId = (typeof KNOWN_FEATURE_IDS)[number];

// A long knowledge base to help Gemini map natural language to app destinations
// Keep it JSON so we can embed directly in prompts
export const FEATURE_KB: Array<{
  id: FeatureId | "support" | "spraying" | "mapping" | "seeding";
  title: string;
  description: string;
  examples: string[];
  synonyms: string[];
  navigatesTo: FeatureId; // normalized target within app
  actions?: string[]; // verbs/intents that are possible under this feature
}> = [
  {
    id: "home",
    title: "Home",
    description:
      "Main dashboard with weather, quick actions, and featured content.",
    examples: [
      "go home",
      "open dashboard",
      "main screen",
      "ഹോമിലേക്ക് പോകുക",
      "ഡാഷ്ബോർഡ് തുറക്കുക",
      "മുഖ്യ സ്ക്രീൻ",
    ],
    synonyms: [
      "dashboard",
      "main",
      "start",
      "homepage",
      "ഡാഷ്ബോർഡ്",
      "ഹോം",
      "മുഖ്യം",
      "തുടക്കം",
    ],
    navigatesTo: "home",
  },
  {
    id: "diagnose",
    title: "Diagnose Crop",
    description: "Identify plant diseases or issues and get remedies.",
    examples: [
      "crop doctor",
      "plant disease help",
      "diagnose my crop",
      "വിള രോഗനിർണയം",
      "ചെടിയുടെ രോഗം കണ്ടെത്തുക",
      "വിള ഡോക്ടർ",
      "my tomato plant has spots",
      "there's something wrong with my leaves",
      "plant looks sick",
      "yellow leaves on my crop",
      "white powder on leaves",
      "insects eating my plants",
      "എന്റെ തക്കാളിയിൽ പുള്ളികൾ",
      "ഇലകളിൽ എന്തോ പ്രശ്നം",
      "ചെടി രോഗിച്ചത് പോലെ",
    ],
    synonyms: [
      "diagnosis",
      "doctor",
      "identify disease",
      "crop issues",
      "plant problems",
      "leaf spots",
      "plant disease",
      "sick plant",
      "crop disease",
      "രോഗനിർണയം",
      "ഡോക്ടർ",
      "രോഗം കണ്ടെത്തുക",
      "വിള പ്രശ്നങ്ങൾ",
      "ചെടിയുടെ പ്രശ്നം",
      "ഇലയിലെ പുള്ളികൾ",
    ],
    navigatesTo: "diagnose",
    actions: ["diagnose", "scan leaves", "upload photo", "get remedy"],
  },
  {
    id: "market",
    title: "Market Prices",
    description: "See mandi prices and market trends for crops.",
    examples: [
      "today price for tomato",
      "mandi rates",
      "market prices",
      "ഇന്നത്തെ തക്കാളി വില",
      "മണ്ഡി നിരക്കുകൾ",
      "വിപണി വിലകൾ",
    ],
    synonyms: [
      "prices",
      "mandi",
      "rate",
      "commodity price",
      "market",
      "വില",
      "മണ്ഡി",
      "നിരക്ക്",
      "വിപണി",
      "വിലകൾ",
    ],
    navigatesTo: "market",
    actions: ["search crop", "set alerts", "compare markets"],
  },
  {
    id: "planner",
    title: "Crop Planner",
    description: "Plan crop calendar, sowing, irrigation, and tasks.",
    examples: [
      "plan my paddy",
      "sowing schedule",
      "what to plant next",
      "നെൽകൃഷി ആസൂത്രണം",
      "വിത്തിടൽ ഷെഡ്യൂൾ",
      "അടുത്തത് എന്ത് നടാം",
    ],
    synonyms: [
      "planning",
      "calendar",
      "schedule",
      "plan crop",
      "ആസൂത്രണം",
      "കലണ്ടർ",
      "ഷെഡ്യൂൾ",
      "വിള ആസൂത്രണം",
    ],
    navigatesTo: "planner",
    actions: ["create plan", "view calendar", "tasks"],
  },
  {
    id: "twin",
    title: "Farming Twin",
    description: "Digital twin of your farm for monitoring and insights.",
    examples: [
      "open farm twin",
      "digital twin",
      "twin dashboard",
      "ഫാം ട്വിൻ തുറക്കുക",
      "ഡിജിറ്റൽ ട്വിൻ",
      "കാർഷിക ട്വിൻ",
    ],
    synonyms: [
      "twin",
      "digital farm",
      "simulation",
      "ട്വിൻ",
      "ഡിജിറ്റൽ ഫാം",
      "സിമുലേഷൻ",
    ],
    navigatesTo: "twin",
  },
  {
    id: "weather",
    title: "Weather Alerts",
    description: "Get weather forecasts and severe alerts.",
    examples: [
      "rain tomorrow",
      "weather today",
      "storm alert",
      "നാളെ മഴ",
      "ഇന്നത്തെ കാലാവസ്ഥ",
      "കൊടുങ്കാറ്റ് അലാറം",
    ],
    synonyms: [
      "forecast",
      "temperature",
      "wind",
      "storm",
      "rain",
      "പ്രവചനം",
      "താപനില",
      "കാറ്റ്",
      "കൊടുങ്കാറ്റ്",
      "മഴ",
      "കാലാവസ്ഥ",
    ],
    navigatesTo: "weather",
    actions: ["set alert", "view forecast"],
  },
  {
    id: "forum",
    title: "Farmer Forum",
    description: "Discuss and ask questions with other farmers.",
    examples: [
      "ask community",
      "farmer discussion",
      "post a question",
      "കമ്യൂണിറ്റിയോട് ചോദിക്കുക",
      "കർഷക ചർച്ച",
      "ചോദ്യം പോസ്റ്റ് ചെയ്യുക",
    ],
    synonyms: [
      "community",
      "group",
      "forum",
      "discussion",
      "കമ്യൂണിറ്റി",
      "ഗ്രൂപ്പ്",
      "ഫോറം",
      "ചർച്ച",
    ],
    navigatesTo: "forum",
    actions: ["create post", "search topic"],
  },
  {
    id: "knowledge",
    title: "Knowledge Center",
    description:
      "Guides, best practices, home remedies, and learning content including soil testing with household items.",
    examples: [
      "how to control pests",
      "best fertilizer",
      "learning center",
      "home remedies",
      "natural solutions",
      "soil testing at home",
      "organic farming tips",
      "kitchen garden remedies",
      "കീടങ്ങളെ എങ്ങനെ നിയന്ത്രിക്കാം",
      "നല്ല വളം",
      "പഠന കേന്ദ്രം",
      "വീട്ടിലെ പരിഹാരങ്ങൾ",
      "പ്രകൃതിദത്ത പരിഹാരം",
      "മണ്ണ് പരിശോധന വീട്ടിൽ",
    ],
    synonyms: [
      "guides",
      "help",
      "tutorial",
      "how to",
      "how can I know",
      "knowledge",
      "home remedies",
      "natural solutions",
      "organic methods",
      "soil testing",
      "diy solutions",
      "kitchen remedies",
      "ഗൈഡുകൾ",
      "സഹായം",
      "ട്യൂട്ടോറിയൽ",
      "എങ്ങനെ",
      "വിജ്ഞാനം",
      "വീട്ടിലെ പരിഹാരം",
      "പ്രകൃതിദത്ത പരിഹാരം",
      "ജൈവിക രീതികൾ",
      "മണ്ണ് പരിശോധന",
    ],
    navigatesTo: "knowledge",
    actions: [
      "search guides",
      "home remedies",
      "soil test methods",
      "organic solutions",
    ],
  },
  {
    id: "buy",
    title: "Buy Inputs",
    description: "Shop for seeds, fertilizers, pesticides, and tools.",
    examples: [
      "buy seeds",
      "order urea",
      "purchase pesticide",
      "വിത്ത് വാങ്ങുക",
      "യൂറിയ ഓർഡർ ചെയ്യുക",
      "കീടനാശിനി വാങ്ങുക",
    ],
    synonyms: [
      "shop",
      "purchase",
      "order",
      "inputs",
      "ഷോപ്പിംഗ്",
      "വാങ്ങുക",
      "ഓർഡർ",
      "ഇൻപുട്ടുകൾ",
    ],
    navigatesTo: "buy",
    actions: ["add to cart", "search product"],
  },
  {
    id: "scan",
    title: "Scan Pest",
    description: "Use camera to detect pests on crops.",
    examples: [
      "scan pest",
      "camera detect insect",
      "identify pest",
      "കീടം സ്കാൻ ചെയ്യുക",
      "ക്യാമറ കൊണ്ട് പ്രാണി കണ്ടെത്തുക",
      "കീടത്തെ തിരിച്ചറിയുക",
    ],
    synonyms: [
      "camera",
      "scan",
      "pest detector",
      "insect",
      "ക്യാമറ",
      "സ്കാൻ",
      "കീട കണ്ടെത്തൽ",
      "പ്രാണി",
      "കീടങ്ങൾ",
    ],
    navigatesTo: "scan",
    actions: ["open camera", "analyze image"],
  },
  {
    id: "expense",
    title: "Expense Tracker",
    description: "Track farming expenses and view totals.",
    examples: [
      "show my expenses",
      "how much I spend",
      "expense report",
      "എന്റെ ചെലവുകൾ കാണിക്കുക",
      "എത്ര ചെലവായി",
      "ചെലവിന്റെ റിപ്പോർട്ട്",
    ],
    synonyms: [
      "costs",
      "accounts",
      "spending",
      "money used",
      "expenditure",
      "ചെലവുകൾ",
      "അക്കൗണ്ടുകൾ",
      "ചെലവ്",
      "പണം ഉപയോഗിച്ചത്",
      "ചിലവുകൾ",
    ],
    navigatesTo: "expense",
    actions: ["add expense", "view summary", "filter by crop"],
  },
  {
    id: "news",
    title: "Agriculture News",
    description: "Latest agri news and updates.",
    examples: [
      "agriculture news",
      "farming news today",
      "കാർഷിക വാർത്തകൾ",
      "ഇന്നത്തെ കൃഷി വാർത്തകൾ",
    ],
    synonyms: [
      "news",
      "updates",
      "headlines",
      "വാർത്തകൾ",
      "അപ്ഡേറ്റുകൾ",
      "തലക്കെട്ടുകൾ",
    ],
    navigatesTo: "news",
  },
  {
    id: "schemes",
    title: "Govt Schemes",
    description: "Government schemes and subsidies for farmers.",
    examples: [
      "PM-Kisan details",
      "govt subsidy",
      "schemes for farmers",
      "പിഎം കിസാൻ വിവരങ്ങൾ",
      "സർക്കാർ സബ്സിഡി",
      "കർഷകർക്കുള്ള പദ്ധതികൾ",
    ],
    synonyms: [
      "government",
      "scheme",
      "subsidy",
      "yojana",
      "സർക്കാർ",
      "പദ്ധതി",
      "സബ്സിഡി",
      "യോജന",
    ],
    navigatesTo: "schemes",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "All notifications and alerts related to your farm.",
    examples: [
      "open alerts",
      "show notifications",
      "അലാറങ്ങൾ തുറക്കുക",
      "അറിയിപ്പുകൾ കാണിക്കുക",
    ],
    synonyms: ["notification", "alert", "അറിയിപ്പ്", "അലാറം"],
    navigatesTo: "notifications",
  },
  {
    id: "profile",
    title: "Profile",
    description: "View and edit your profile and settings.",
    examples: [
      "open profile",
      "settings",
      "my account",
      "പ്രൊഫൈൽ തുറക്കുക",
      "സെറ്റിംഗുകൾ",
      "എന്റെ അക്കൗണ്ട്",
    ],
    synonyms: [
      "account",
      "settings",
      "profile",
      "അക്കൗണ്ട്",
      "സെറ്റിംഗുകൾ",
      "പ്രൊഫൈൽ",
    ],
    navigatesTo: "profile",
  },
  {
    id: "resources",
    title: "Knowledge Center",
    description: "Access to all knowledge resources and learning materials.",
    examples: [
      "knowledge center",
      "resources",
      "learning center",
      "വിജ്ഞാന കേന്ദ്രം",
      "റിസോഴ്സുകൾ",
      "പഠന കേന്ദ്രം",
    ],
    synonyms: [
      "resources",
      "knowledge center",
      "learning",
      "റിസോഴ്സുകൾ",
      "വിജ്ഞാന കേന്ദ്രം",
      "പഠനം",
    ],
    navigatesTo: "resources",
  },
  {
    id: "labourers",
    title: "Labour Hub",
    description: "Find and hire farm laborers, check availability and rates.",
    examples: [
      "find workers",
      "hire labour",
      "need workers",
      "labor availability",
      "വർക്കർമാരെ കണ്ടെത്തുക",
      "തൊഴിലാളികളെ വാടകയ്ക്ക് എടുക്കുക",
      "വർക്കർമാർ വേണം",
      "തൊഴിലാളി ലഭ്യത",
    ],
    synonyms: [
      "workers",
      "labour",
      "laborers",
      "hire",
      "employment",
      "workforce",
      "വർക്കർമാർ",
      "തൊഴിലാളികൾ",
      "വാടകയ്ക്ക്",
      "തൊഴിൽ",
      "ജോലിക്കാർ",
    ],
    navigatesTo: "labourers",
    actions: ["search workers", "check rates", "contact labor", "book workers"],
  },
  {
    id: "fairfarm",
    title: "FairFarm Marketplace",
    description:
      "Direct farmer-to-consumer marketplace for selling and buying farm products.",
    examples: [
      "sell my crops",
      "fair farm marketplace",
      "direct selling",
      "farmer market",
      "എന്റെ വിളകൾ വിൽക്കുക",
      "ഫെയർ ഫാം മാർക്കറ്റ്",
      "നേരിട്ട് വിൽപന",
      "കർഷക മാർക്കറ്റ്",
    ],
    synonyms: [
      "marketplace",
      "sell crops",
      "direct market",
      "fair trade",
      "farm market",
      "മാർക്കറ്റ്പ്ലേസ്",
      "വിള വിൽപന",
      "നേരിട്ട് മാർക്കറ്റ്",
      "ന്യായ വ്യാപാരം",
      "കർഷക മാർക്കറ്റ്",
    ],
    navigatesTo: "fairfarm",
    actions: [
      "list product",
      "browse products",
      "contact farmer",
      "buy direct",
    ],
  },
  // Quick actions mapped to nearest features
  {
    id: "spraying",
    title: "Crop Wise (Spraying)",
    description: "Guidance for spraying schedules and chemicals.",
    examples: [
      "spraying guide",
      "when to spray",
      "sprayer dosage",
      "സ്പ്രേയിംഗ് ഗൈഡ്",
      "എപ്പോൾ സ്പ്രേ ചെയ്യണം",
      "സ്പ്രേയർ ഡോസേജ്",
    ],
    synonyms: [
      "spray",
      "spraying",
      "chemical spray",
      "സ്പ്രേ",
      "സ്പ്രേയിംഗ്",
      "രാസ സ്പ്രേ",
    ],
    navigatesTo: "knowledge",
  },
  {
    id: "mapping",
    title: "Fair Farm (Mapping)",
    description:
      "Farm boundary mapping and fair pricing tools, direct farmer marketplace.",
    examples: [
      "map my field",
      "boundary mapping",
      "fair farm",
      "sell direct",
      "farmer marketplace",
      "എന്റെ വയൽ മാപ്പ് ചെയ്യുക",
      "അതിർത്തി മാപ്പിംഗ്",
      "ഫെയർ ഫാം",
      "നേരിട്ട് വിൽക്കുക",
      "കർഷക മാർക്കറ്റ്പ്ലേസ്",
    ],
    synonyms: [
      "mapping",
      "map field",
      "boundary",
      "fair farm",
      "marketplace",
      "direct selling",
      "മാപ്പിംഗ്",
      "വയൽ മാപ്പ്",
      "അതിർത്തി",
      "ഫെയർ ഫാം",
      "മാർക്കറ്റ്പ്ലേസ്",
      "നേരിട്ട് വിൽപന",
    ],
    navigatesTo: "fairfarm",
  },
  {
    id: "seeding",
    title: "Price Beacon (Seeding)",
    description: "Seeding recommendations and price insights.",
    examples: [
      "best time to sow",
      "seeding rate",
      "നല്ല സമയം വിത്തിടാൻ",
      "വിത്ത് നിരക്ക്",
    ],
    synonyms: [
      "seeding",
      "sowing",
      "seed rate",
      "വിത്തിടൽ",
      "വിതയൽ",
      "വിത്ത് നിരക്ക്",
    ],
    navigatesTo: "planner",
  },
  {
    id: "support",
    title: "Support",
    description:
      "General help via chatbot when tasks are not directly navigable.",
    examples: [
      "help me",
      "I need assistance",
      "talk to assistant",
      "എന്നെ സഹായിക്കുക",
      "എനിക്ക് സഹായം വേണം",
      "അസിസ്റ്റന്റിനോട് സംസാരിക്കുക",
    ],
    synonyms: [
      "help",
      "assistant",
      "chatbot",
      "support",
      "സഹായം",
      "അസിസ്റ്റന്റ്",
      "ചാറ്റ്ബോട്ട്",
      "സപ്പോർട്ട്",
    ],
    navigatesTo: "chatbot",
  },
];

const MODEL_NAME = "gemini-2.0-flash";

function buildPrompt(userQuery: string) {
  const kbJson = JSON.stringify(FEATURE_KB, null, 2);
  return `You are an expert intent router for a farmer mobile web app. Your job is to understand natural conversational speech and map it to the correct app functionality.

Knowledge base of app sections (JSON):\n${kbJson}\n\n

CRITICAL INSTRUCTIONS:
- Understand NATURAL CONVERSATIONAL SPEECH, not just keywords
- The app supports both English and Malayalam. Many users will speak naturally about their farming problems.
- CONTEXT AWARENESS: Understand the underlying need/intent behind what the user is saying

NATURAL LANGUAGE EXAMPLES:
❌ Don't just match keywords → ✅ Understand the real intent:

"My tomato plant leaf has something on it, what should I do?" → INTENT: Plant disease diagnosis → targetId: "diagnose"
"How much did I spend on fertilizer this month?" → INTENT: Check expenses → targetId: "expense"  
"Are the prices good for selling rice today?" → INTENT: Check market prices → targetId: "market"
"It's been raining a lot, will it continue?" → INTENT: Weather forecast → targetId: "weather"
"എന്റെ പയറിന് വെള്ളക്കാശു വന്നിട്ടുണ്ട്" → INTENT: Plant disease → targetId: "diagnose"
"ഇന്ന് വീട്ടിൽ പച്ചക്കറി വിറ്റാൽ നല്ല വിലകിട്ടുമോ?" → INTENT: Market prices → targetId: "market"

CONTEXT PATTERNS TO RECOGNIZE:
- Plant problems/symptoms/diseases → "diagnose"
- Money spent/costs/expenses → "expense"  
- Selling crops/price checking → "market"
- Weather concerns/rain/storm → "weather"
- Learning/guidance/how-to/how can/diy solutions/homemade remedies → "knowledge"
- Buying seeds/fertilizer/tools → "buy"
- Community questions/discussions → "forum"
- Planning next crop/timing → "planner"
- Pest identification/control → "scan" or "diagnose"

ADVANCED REASONING:
- If user describes symptoms (spots, yellowing, wilting, pests) → "diagnose"
- If user asks about timing, scheduling, planning → "planner"
- If user mentions money, costs, spending → "expense"
- If user asks about selling, prices, rates → "market"
- If user needs help but it's complex/conversational → "chat" (send to chatbot)

OUTPUT REQUIREMENTS:
- Think about the core need behind the words
- Don't just keyword match - understand intent
- Be confident with clear intents, use "chat" for ambiguous requests
- Output STRICT JSON only, no markdown, no prose

Output JSON schema:
{
  "action": "navigate" | "chat",
  "targetId": "one of ${KNOWN_FEATURE_IDS.join(" | ")} or null",
  "confidence": number between 0 and 1,
  "reason": string explaining your reasoning,
  "language": string, // detected user language code/name (e.g., "malayalam", "english", "mixed")
  "queryNormalized": string // the core intent in simple words
}

User query: ${userQuery}`;
}

function safeParseJson(text: string): any | null {
  // Try to extract JSON from raw text or code fences
  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) {}
    }
  }
  return null;
}

async function callGemini(prompt: string): Promise<VoiceDecision | null> {
  // Try both environment variable and fallback hardcoded key
  const apiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    "AIzaSyB7u7ECKuSiVP2wHzoi-Ic9haOi2U2dK6Q";
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini API error ${res.status}`);
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = safeParseJson(text);
    if (!parsed) return null;
    const decision: VoiceDecision = {
      action: parsed.action === "navigate" ? "navigate" : "chat",
      targetId:
        parsed.targetId && KNOWN_FEATURE_IDS.includes(parsed.targetId)
          ? parsed.targetId
          : null,
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0.5,
      reason: parsed.reason,
      language: parsed.language,
      queryNormalized: parsed.queryNormalized || undefined,
    };
    return decision;
  } catch (err) {
    console.warn("Gemini call failed:", err);
    return null;
  }
}

// Offline fallback using simple keyword matching in multiple languages
export function offlineMatch(queryRaw: string): VoiceDecision {
  const q = queryRaw.toLowerCase();
  const map: Array<{ keys: string[]; target: FeatureId }> = [
    {
      keys: [
        "expense",
        "spend",
        "spent",
        "cost",
        "expenditure",
        "money",
        "how much",
        "ചെലവ്",
        "ചിലവ്",
        "പണം",
        "accounts",
        "അക്കൗണ്ട്",
        "ചെലവായത്",
        "എത്ര ചിലവായി",
      ],
      target: "expense",
    },
    {
      keys: [
        "market",
        "price",
        "mandi",
        "rate",
        "വില",
        "വിലകൾ",
        "മണ്ഡി",
        "വിപണി",
      ],
      target: "market",
    },
    {
      keys: [
        "weather",
        "rain",
        "storm",
        "കാലാവസ്ഥ",
        "മഴ",
        "കൊടുങ്കാറ്റ്",
        "കാറ്റ്",
      ],
      target: "weather",
    },
    {
      keys: [
        "diagnose",
        "disease",
        "doctor",
        "രോഗ",
        "identify",
        "രോഗനിർണയം",
        "ഡോക്ടർ",
        "രോഗം",
        // Natural problem descriptions
        "something on",
        "spots on",
        "yellow leaves",
        "sick",
        "problem with",
        "wrong with",
        "leaf",
        "leaves",
        "plant",
        "പുള്ളികൾ",
        "മഞ്ഞ ഇലകൾ",
        "രോഗിച്ച",
        "പ്രശ്നം",
        "ഇലകൾ",
        "ചെടി",
      ],
      target: "diagnose",
    },
    {
      keys: [
        "scan",
        "camera",
        "pest",
        "insect",
        "സ്കാൻ",
        "ക്യാമറ",
        "കീടങ്ങൾ",
        "പ്രാണി",
      ],
      target: "scan",
    },
    {
      keys: [
        "plan",
        "calendar",
        "sow",
        "seeding",
        "വിത്ത്",
        "ആസൂത്രണം",
        "കലണ്ടർ",
        "വിത്തിടൽ",
        "വിതയൽ",
      ],
      target: "planner",
    },
    {
      keys: ["twin", "digital", "ട്വിൻ", "ഡിജിറ്റൽ"],
      target: "twin",
    },
    {
      keys: [
        "forum",
        "community",
        "group",
        "ഫോറം",
        "കമ്യൂണിറ്റി",
        "ഗ്രൂപ്പ്",
        "ചർച്ച",
      ],
      target: "forum",
    },
    {
      keys: [
        "knowledge",
        "guide",
        "how to",
        "help",
        "home remedies",
        "natural solutions",
        "soil testing",
        "organic methods",
        "diy solutions",
        "വിജ്ഞാനം",
        "ഗൈഡ്",
        "എങ്ങനെ",
        "സഹായം",
        "വീട്ടിലെ പരിഹാരം",
        "പ്രകൃതിദത്ത പരിഹാരം",
        "മണ്ണ് പരിശോധന",
        "ജൈവിക രീതികൾ",
      ],
      target: "knowledge",
    },
    {
      keys: [
        "resources",
        "knowledge center",
        "learning center",
        "റിസോഴ്സുകൾ",
        "വിജ്ഞാന കേന്ദ്രം",
        "പഠന കേന്ദ്രം",
      ],
      target: "resources",
    },
    {
      keys: [
        "workers",
        "labour",
        "laborers",
        "hire",
        "employment",
        "workforce",
        "find workers",
        "need workers",
        "വർക്കർമാർ",
        "തൊഴിലാളികൾ",
        "വാടകയ്ക്ക്",
        "തൊഴിൽ",
        "ജോലിക്കാർ",
        "വർക്കർമാരെ കണ്ടെത്തുക",
      ],
      target: "labourers",
    },
    {
      keys: [
        "fair farm",
        "marketplace",
        "sell crops",
        "direct market",
        "farmer market",
        "sell direct",
        "ഫെയർ ഫാം",
        "മാർക്കറ്റ്പ്ലേസ്",
        "വിള വിൽപന",
        "നേരിട്ട് മാർക്കറ്റ്",
        "കർഷക മാർക്കറ്റ്",
        "നേരിട്ട് വിൽക്കുക",
      ],
      target: "fairfarm",
    },
    {
      keys: [
        "buy",
        "shop",
        "purchase",
        "order",
        "വാങ്ങുക",
        "ഷോപ്പിംഗ്",
        "ഓർഡർ",
      ],
      target: "buy",
    },
    {
      keys: ["news", "update", "headline", "വാർത്തകൾ", "അപ്ഡേറ്റ്", "വാർത്ത"],
      target: "news",
    },
    {
      keys: [
        "scheme",
        "subsidy",
        "yojana",
        "സർക്കാർ",
        "പദ്ധതി",
        "സബ്സിഡി",
        "യോജന",
      ],
      target: "schemes",
    },
    {
      keys: ["alert", "notification", "അലാറം", "അറിയിപ്പ്"],
      target: "notifications",
    },
    {
      keys: [
        "profile",
        "account",
        "settings",
        "പ്രൊഫൈൽ",
        "അക്കൗണ്ട്",
        "സെറ്റിംഗുകൾ",
      ],
      target: "profile",
    },
    {
      keys: ["home", "dashboard", "main", "ഹോം", "ഡാഷ്ബോർഡ്", "മുഖ്യം"],
      target: "home",
    },
    {
      keys: [
        "assistant",
        "chat",
        "help",
        "support",
        "അസിസ്റ്റന്റ്",
        "ചാറ്റ്",
        "സഹായം",
        "സപ്പോർട്ട്",
      ],
      target: "chatbot",
    },
  ];
  for (const m of map) {
    if (m.keys.some((k) => q.includes(k))) {
      return {
        action: "navigate",
        targetId: m.target,
        confidence: 0.6,
        queryNormalized: q,
      };
    }
  }
  return {
    action: "chat",
    targetId: "chatbot",
    confidence: 0.4,
    queryNormalized: q,
  };
}

export async function routeFromTranscript(
  transcript: string
): Promise<VoiceDecision> {
  const prompt = buildPrompt(transcript);
  const ai = await callGemini(prompt);
  if (ai) {
    // If AI says navigate but target is null, fallback
    if (ai.action === "navigate" && !ai.targetId) {
      const off = offlineMatch(transcript);
      return off;
    }
    return ai;
  }
  return offlineMatch(transcript);
}
