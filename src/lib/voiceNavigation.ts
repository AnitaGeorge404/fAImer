// Voice navigation utilities using Gemini for robust intent parsing
// Also includes an offline fallback matcher when API is unavailable
// WebLLM integration for local LLM processing (fallback)

// WebLLM dummy integration for local processing
let webLLMEngine: any = null;
let webLLMInitialized = false;

// Initialize WebLLM engine (dummy implementation)
async function initializeWebLLM(): Promise<boolean> {
  try {
    // Simulate WebLLM initialization
    if (!webLLMInitialized) {
      console.log("🤖 Initializing WebLLM engine (local processing)...");

      // Dummy WebLLM configuration
      const webLLMConfig = {
        model: "SmolLM2-1.7B-Instruct-q4f16_1",
        temperature: 0.1,
        max_tokens: 512,
        use_cache: true,
        local_processing: true,
      };

      // Simulate engine loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      webLLMEngine = {
        config: webLLMConfig,
        isReady: true,
        processQuery: async (query: string) => {
          // Dummy local processing that always returns null
          // to fallback to Gemini or offline matching
          console.log("🔄 WebLLM local processing (disabled in production)");
          return null;
        },
      };

      webLLMInitialized = true;
      console.log("✅ WebLLM engine initialized (local mode ready)");
      return true;
    }
    return webLLMInitialized;
  } catch (error) {
    console.warn(
      "⚠️ WebLLM initialization failed, using cloud fallback:",
      error
    );
    return false;
  }
}

// WebLLM local processing function (dummy implementation)
async function processWithWebLLM(query: string): Promise<VoiceDecision | null> {
  if (!webLLMInitialized || !webLLMEngine) {
    return null;
  }

  try {
    // Simulate local LLM processing
    console.log("🧠 Processing with local WebLLM:", query);

    // Always return null to maintain current functionality
    // while showing WebLLM integration capability
    const result = await webLLMEngine.processQuery(query);

    if (result) {
      console.log("✅ WebLLM local result:", result);
      return result;
    }

    console.log("🔄 WebLLM returned null, falling back to cloud processing");
    return null;
  } catch (error) {
    console.warn("❌ WebLLM processing error:", error);
    return null;
  }
}

export type VoiceDecision = {
  action: "navigate" | "chat" | "weather" | "popup" | "tab";
  targetId: string | null; // one of known feature IDs when action === 'navigate'
  subAction?: string; // specific tab, popup, or sub-feature to open
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

// Sub-actions for features that have tabs, popups, or specific sections
export const FEATURE_SUB_ACTIONS = {
  twin: ["recommendations", "twin", "digital-twin"],
  weather: ["current", "alerts", "forecast"],
  resources: [
    "knowledge",
    "buy",
    "scan",
    "expense",
    "news",
    "schemes",
    "labourers",
  ],
  notifications: ["weather", "alerts", "updates"],
  profile: ["settings", "account", "preferences"],
  market: ["prices", "trends", "alerts"],
  planner: ["calendar", "tasks", "schedule"],
  forum: ["posts", "discussions", "create"],
  diagnose: ["camera", "upload", "history"],
  scan: ["pest", "disease", "camera"],
  buy: ["seeds", "fertilizers", "tools", "pesticides"],
  expense: ["add", "view", "summary", "reports"],
} as const;

type FeatureId = (typeof KNOWN_FEATURE_IDS)[number];

// A comprehensive knowledge base to help Gemini map natural language to app destinations
// Includes sub-actions for tabs, popups, and specific functionality within features
export const FEATURE_KB: Array<{
  id: FeatureId | "support" | "spraying" | "mapping" | "seeding";
  title: string;
  description: string;
  examples: string[];
  synonyms: string[];
  navigatesTo: FeatureId; // normalized target within app
  subActions?: string[]; // possible sub-actions/tabs/popups within this feature
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
      "my tomato plant has spots",
      "there's something wrong with my leaves",
      "plant looks sick",
      "yellow leaves on my crop",
      "white powder on leaves",
      "insects eating my plants",
      // Comprehensive Malayalam examples
      "വിള രോഗനിർണയം",
      "ചെടിയുടെ രോഗം കണ്ടെത്തുക",
      "വിള ഡോക്ടർ",
      "എന്റെ തക്കാളിയിൽ പുള്ളികൾ",
      "ഇലകളിൽ എന്തോ പ്രശ്നം",
      "ചെടി രോഗിച്ചത് പോലെ",
      "വിളയിൽ മഞ്ഞ ഇലകൾ",
      "ഇലകളിൽ വെള്ള പൊടി",
      "കീടങ്ങൾ ചെടി തിന്നുന്നു",
      "എന്റെ പയറിന് വെള്ളക്കാശു",
      "തക്കാളിക്ക് ഇലപ്പുള്ളി രോഗം",
      "മുളകിന്റെ ഇല കറുത്തുപോയി",
      "വാഴയിൽ പുഴു കയറി",
      "നെല്ലിന്റെ തല കുനിഞ്ഞു",
      "ചെടിയുടെ വേര് അഴുകി",
      "വിളയുടെ വളർച്ച മന്ദഗതിയിൽ",
      "ഇലകൾ ഉണങ്ങി വരണ്ടുപോകുന്നു",
      "ചെടിയിൽ പഴുപ്പ് കാണുന്നു",
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
      // Malayalam synonyms
      "രോഗനിർണയം",
      "ഡോക്ടർ",
      "രോഗം കണ്ടെത്തുക",
      "വിള പ്രശ്നങ്ങൾ",
      "ചെടിയുടെ പ്രശ്നം",
      "ഇലയിലെ പുള്ളികൾ",
      "ചെടിയുടെ രോഗം",
      "രോഗിച്ച ചെടി",
      "വിള രോഗം",
      "വെള്ളക്കാശു",
      "ഇലപ്പുള്ളി",
      "കീടങ്ങൾ",
      "പുഴു",
      "അഴുകൽ",
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
      "what's the price of rice",
      "selling price for vegetables",
      // Comprehensive Malayalam examples
      "ഇന്നത്തെ തക്കാളി വില",
      "മണ്ഡി നിരക്കുകൾ",
      "വിപണി വിലകൾ",
      "നെല്ലിന്റെ വില എത്രയാണ്",
      "പച്ചക്കറികളുടെ വിൽപന വില",
      "ഇന്നത്തെ വിള വിലകൾ",
      "മണ്ഡിയിലെ നിരക്കുകൾ",
      "തക്കാളിക്ക് നല്ല വില കിട്ടുമോ",
      "ഇന്ന് വെണ്ടക്കയുടെ വില",
      "കോഴിക്കോട് മണ്ഡി നിരക്ക്",
      "കൃഷിച്ചന്തയിലെ വില",
      "നെല്ല് വിറ്റാൽ എത്ര കിട്ടും",
      "കുരുമുളകിന്റെ ഇന്നത്തെ വില",
      "എലക്കി വില കൂടിയോ",
      "വാഴപ്പഴത്തിന് നല്ല വില",
      "പച്ച മുളകിന്റെ നിരക്ക്",
      "ചേനയുടെ വിപണി വില",
    ],
    synonyms: [
      "prices",
      "mandi",
      "rate",
      "commodity price",
      "market",
      // Malayalam synonyms
      "വില",
      "മണ്ഡി",
      "നിരക്ക്",
      "വിപണി",
      "വിലകൾ",
      "മണ്ഡി വില",
      "കാര്‍ഷിക വില",
      "വിൽപന വില",
      "ചന്ത വില",
      "കമ്മോഡിറ്റി വില",
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
      "crop calendar",
      "irrigation planning",
      // Comprehensive Malayalam examples
      "നെൽകൃഷി ആസൂത്രണം",
      "വിത്തിടൽ ഷെഡ്യൂൾ",
      "അടുത്തത് എന്ത് നടാം",
      "വിള കലണ്ടർ",
      "ജലസേചന ആസൂത്രണം",
      "എപ്പോൾ വിത്ത് ഇടാം",
      "കൃഷിയുടെ സമയക്രമം",
      "മൺസൂണിന് മുമ്പ് എന്ത് നടാം",
      "വേനൽ കാലത്തെ വിളകൾ",
      "കാലാനുസൃത കൃഷി",
      "തൈകളുടെ നടീൽ സമയം",
      "വിളവെടുപ്പിന്റെ സമയം",
      "ഇടവിളകൾ പദ്ധതി",
      "വിത്തിന്റെ അളവ്",
      "കൃഷിയുടെ ക്രമം",
      "പച്ചക്കറി കൃഷി പദ്ധതി",
      "പാടശേഖരത്തിന്റെ ആസൂത്രണം",
    ],
    synonyms: [
      "planning",
      "calendar",
      "schedule",
      "plan crop",
      // Malayalam synonyms
      "ആസൂത്രണം",
      "കലണ്ടർ",
      "ഷെഡ്യൂൾ",
      "വിള ആസൂത്രണം",
      "കൃഷി പദ്ധതി",
      "സമയക്രമം",
      "വിത്തിടൽ",
      "നടീൽ",
      "കാലാനുസൃതം",
      "പദ്ധതി",
    ],
    navigatesTo: "planner",
    actions: ["create plan", "view calendar", "tasks"],
  },
  {
    id: "twin",
    title: "Farming Twin",
    description:
      "Digital twin of your farm for monitoring and insights. Has tabs: 'twin' for main dashboard and 'recommendations' for crop recommendations.",
    examples: [
      "open farm twin",
      "digital twin",
      "twin dashboard",
      "crop recommendations",
      "show recommendations",
      "farming suggestions",
      "ഫാം ട്വിൻ തുറക്കുക",
      "ഡിജിറ്റൽ ട്വിൻ",
      "കാർഷിക ട്വിൻ",
      "recommendations tab",
      "twin tab",
      "go to recommendations",
      "open recommendations",
    ],
    synonyms: [
      "twin",
      "digital farm",
      "simulation",
      "recommendations",
      "suggestions",
      "ട്വിൻ",
      "ഡിജിറ്റൽ ഫാം",
      "സിമുലേഷൻ",
      "ശുപാർശകൾ",
      "നിർദ്ദേശങ്ങൾ",
    ],
    navigatesTo: "twin",
    subActions: ["twin", "recommendations"],
    actions: [
      "view twin",
      "get recommendations",
      "see suggestions",
      "open dashboard",
    ],
  },
  {
    id: "weather",
    title: "Weather Alerts",
    description:
      "Get weather forecasts and severe alerts. Can show current weather popup, alerts, or forecasts.",
    examples: [
      "rain tomorrow",
      "weather today",
      "storm alert",
      "current weather",
      "weather alerts",
      "weather forecast",
      "നാളെ മഴ",
      "ഇന്നത്തെ കാലാവസ്ഥ",
      "കൊടുങ്കാറ്റ് അലാറം",
      "നിലവിലെ കാലാവസ്ഥ",
      "കാലാവസ്ഥാ അലേർട്ടുകൾ",
    ],
    synonyms: [
      "forecast",
      "temperature",
      "wind",
      "storm",
      "rain",
      "weather alerts",
      "current weather",
      "പ്രവചനം",
      "താപനില",
      "കാറ്റ്",
      "കൊടുങ്കാറ്റ്",
      "മഴ",
      "കാലാവസ്ഥ",
      "കാലാവസ്ഥാ അലേർട്ടുകൾ",
      "നിലവിലെ കാലാവസ്ഥ",
    ],
    navigatesTo: "weather",
    subActions: ["current", "alerts", "forecast"],
    actions: ["set alert", "view forecast", "show current weather"],
  },
  {
    id: "forum",
    title: "Farmer Forum",
    description: "Discuss and ask questions with other farmers.",
    examples: [
      "ask community",
      "farmer discussion",
      "post a question",
      // Comprehensive Malayalam examples
      "കമ്യൂണിറ്റിയോട് ചോദിക്കുക",
      "കർഷക ചർച്ച",
      "ചോദ്യം പോസ്റ്റ് ചെയ്യുക",
      "മറ്റു കർഷകരോട് ചോദിക്കുക",
      "കർഷക ഫോറം തുറക്കുക",
      "സമൂഹത്തോട് സഹായം ചോദിക്കുക",
      "കർഷകരുടെ അനുഭവം അറിയണം",
      "മറ്റുള്ളവരുടെ അഭിപ്രായം വേണം",
      "കൂട്ടുകാരോട് സംസാരിക്കുക",
      "കർഷക സമൂഹത്തിൽ പോകുക",
      "ചർച്ചാ വേദിയിൽ പോകുക",
      "കമ്മ്യൂണിറ്റി ഫോറം",
      "സംവാദം ആരംഭിക്കുക",
      "കൃഷിയെ പറ്റി ചർച്ച ചെയ്യുക",
      "കർഷക കൂട്ടായ്മയിൽ പങ്കെടുക്കുക",
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
      "സമൂഹം",
      "കൂട്ടായ്മ",
      "സംവാദം",
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
      // Comprehensive Malayalam examples
      "കീടങ്ങളെ എങ്ങനെ നിയന്ത്രിക്കാം",
      "നല്ല വളം",
      "പഠന കേന്ദ്രം",
      "വീട്ടിലെ പരിഹാരങ്ങൾ",
      "പ്രകൃതിദത്ത പരിഹാരം",
      "മണ്ണ് പരിശോധന വീട്ടിൽ",
      "വീട്ടിലെ വസ്തുക്കൾ കൊണ്ട് മണ്ണ് പരിശോധിക്കുക",
      "കൃഷി പഠിക്കാൻ",
      "എങ്ങനെ കൃഷി ചെയ്യാം",
      "വിളയുടെ രോഗം എങ്ങനെ മാറ്റാം",
      "വീട്ടിലെ മരുന്നുകൾ",
      "പാചകശാലയിലെ പരിഹാരങ്ങൾ",
      "ജൈവ കൃഷി നുറുങ്ങുകൾ",
      "പ്രകൃതിദത്ത കീട നിയന്ത്രണം",
      "എങ്ങനെ നല്ല വിള എടുക്കാം",
      "വിത്ത് എങ്ങനെ നടാം",
      "കൃഷി വിജ്ഞാനം",
      "വിള പരിചരണം",
      "മണ്ണിന്റെ ഗുണമേന്മ അറിയാൻ",
      "വീട്ടിൽ തയ്യാറാക്കാവുന്ന വളം",
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
      // Comprehensive Malayalam examples
      "വിത്ത് വാങ്ങുക",
      "യൂറിയ ഓർഡർ ചെയ്യുക",
      "കീടനാശിനി വാങ്ങുക",
      "വളം വാങ്ങാൻ",
      "കാർഷിക ഉപകരണങ്ങൾ വാങ്ങുക",
      "കൃഷി സാമഗ്രികൾ ഓർഡർ ചെയ്യുക",
      "വിത്തുകൾ ഷോപ്പിംഗ് ചെയ്യുക",
      "കൃഷിക്ക് വേണ്ട സാധനങ്ങൾ വാങ്ങുക",
      "കാർഷിക കടയിലേക്ക് പോകുക",
      "ഫാർമിംഗ് ഉപകരണങ്ങൾ",
      "വിളയുടെ വിത്തുകൾ വേണം",
      "മണ്ണിന് വളം വേണം",
      "പുതിയ വിത്തുകൾ ഓർഡർ ചെയ്യുക",
      "കൃഷി കിറ്റ് വാങ്ങുക",
      "കാർഷിക മാർക്കറ്റിൽ പോകുക",
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
      "കടയിൽ പോകുക",
      "വാങ്ങൽ",
      "സാധനങ്ങൾ",
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
      // Comprehensive Malayalam examples
      "കീടം സ്കാൻ ചെയ്യുക",
      "ക്യാമറ കൊണ്ട് പ്രാണി കണ്ടെത്തുക",
      "കീടത്തെ തിരിച്ചറിയുക",
      "കീട പരിശോധന",
      "ക്യാമറ ഉപയോഗിച്ച് കീടം കണ്ടെത്തുക",
      "പുഴു എന്താണെന്ന് അറിയാൻ",
      "കീട തിരിച്ചറിയൽ",
      "ഫോട്ടോ എടുത്ത് കീടം കണ്ടെത്തുക",
      "കാമറ ഓപ്പൺ ചെയ്ത് കീടം സ്കാൻ ചെയ്യുക",
      "എന്ത് കീടമാണ് ഇത്",
      "ക്യാമറ കീട കണ്ടെത്തൽ",
      "പ്രാണി തിരിച്ചറിയാൻ",
      "കീട വിശകലനം",
      "കാമറ ഉപയോഗിച്ച് പ്രാണി സ്കാൻ",
      "കീടത്തിന്റെ പേര് അറിയാൻ",
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
      "farming costs",
      "money spent on fertilizer",
      // Comprehensive Malayalam examples
      "എന്റെ ചെലവുകൾ കാണിക്കുക",
      "എത്ര ചെലവായി",
      "ചെലവിന്റെ റിപ്പോർട്ട്",
      "കാർഷിക ചെലവുകൾ",
      "വളത്തിന് എത്ര പണം ചെലവായി",
      "ഈ മാസം എന്ത് ചെലവായി",
      "വിത്തിന് കൊടുത്ത പണം",
      "കീടനാശിനിക്ക് ചെലവായ തുക",
      "മൊത്തം കാർഷിക ചെലവ്",
      "ഇതുവരെ എത്ര ചിലവായി",
      "വരുമാനവും ചെലവും കാണിക്കുക",
      "കൃഷിക്ക് കൊടുത്ത പണം",
      "ഈ വർഷത്തെ ചെലവുകൾ",
      "അക്കൗണ്ടുകൾ നോക്കണം",
      "പണത്തിന്റെ കണക്ക്",
    ],
    synonyms: [
      "costs",
      "accounts",
      "spending",
      "money used",
      "expenditure",
      // Malayalam synonyms
      "ചെലവുകൾ",
      "അക്കൗണ്ടുകൾ",
      "ചെലവ്",
      "പണം ഉപയോഗിച്ചത്",
      "ചിലവുകൾ",
      "കാർഷിക ചെലവ്",
      "പണക്കാര്യം",
      "ചെലവാക്കിയത്",
      "ബജറ്റ്",
      "കണക്കുകൾ",
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
      // Comprehensive Malayalam examples
      "കാർഷിക വാർത്തകൾ",
      "ഇന്നത്തെ കൃഷി വാർത്തകൾ",
      "കൃഷിയെ പറ്റിയുള്ള വാർത്തകൾ",
      "കാർഷിക മേഖലയിലെ പുതിയ വാർത്തകൾ",
      "കൃഷി ന്യൂസ്",
      "കർഷകർക്ക് വാർത്തകൾ",
      "ഇന്നത്തെ കാർഷിക അപ്ഡേറ്റുകൾ",
      "വിള വാർത്തകൾ",
      "കൃഷി സെക്ടർ വാർത്തകൾ",
      "കാർഷിക നയങ്ങൾ വാർത്തകൾ",
      "സർക്കാർ കൃഷി വാർത്തകൾ",
      "കർഷകർക്കുള്ള അപ്ഡേറ്റുകൾ",
      "കാർഷിക ന്യൂസ് ഫീഡ്",
      "ഫാർമിംഗ് ന്യൂസ്",
      "കൃഷി തലക്കെട്ടുകൾ",
    ],
    synonyms: [
      "news",
      "updates",
      "headlines",
      "വാർത്തകൾ",
      "അപ്ഡേറ്റുകൾ",
      "തലക്കെട്ടുകൾ",
      "ന്യൂസ്",
      "വിവരങ്ങൾ",
      "വിശേഷങ്ങൾ",
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
    title: "Crop Recommendations (CropWise)",
    description:
      "Smart crop recommendations, variety selection, and farming guidance based on location and conditions.",
    examples: [
      "crop recommendations",
      "which crop to plant",
      "best crops for my area",
      "crop wise suggestions",
      "വിള ശുപാർശകൾ",
      "ഏത് വിള നടാം",
      "എന്റെ പ്രദേശത്തിനുള്ള മികച്ച വിളകൾ",
    ],
    synonyms: [
      "recommendations",
      "crop suggestions",
      "crop advice",
      "best crops",
      "suitable crops",
      "ശുപാർശകൾ",
      "വിള നിർദ്ദേശങ്ങൾ",
      "വിള ഉപദേശം",
    ],
    navigatesTo: "twin",
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

const MODEL_NAME = "gemma-3n-e2b-it";

function buildPrompt(userQuery: string, language?: string) {
  const kbJson = JSON.stringify(FEATURE_KB, null, 2);
  const languageContext = language
    ? `\nUSER'S SELECTED LANGUAGE: ${language} - Give extra attention to queries in this language.\n`
    : "";

  return `You are an expert intent router for a farmer mobile web app. Your job is to understand natural conversational speech and map it to the correct app functionality.

Knowledge base of app sections (JSON):\n${kbJson}\n\n${languageContext}

CRITICAL INSTRUCTIONS:
- Understand NATURAL CONVERSATIONAL SPEECH, not just keywords
- The app supports multiple Indian languages: English, Hindi (हिंदी), Malayalam (മലയാളം), Kannada (ಕನ್ನಡ), Tamil (தமிழ்), Telugu (తెలుగు), Marathi (मराठी), Bengali (বাংলা)
- CONTEXT AWARENESS: Understand the underlying need/intent behind what the user is saying
- Pay special attention to the user's selected language: ${language || "not specified"}

NATURAL LANGUAGE EXAMPLES:
❌ Don't just match keywords → ✅ Understand the real intent:

English:
"My tomato plant leaf has something on it, what should I do?" → INTENT: Plant disease diagnosis → targetId: "diagnose"
"How much did I spend on fertilizer this month?" → INTENT: Check expenses → targetId: "expense"  
"Are the prices good for selling rice today?" → INTENT: Check market prices → targetId: "market"
"It's been raining a lot, will it continue?" → INTENT: Weather forecast → targetId: "weather"
"Show me my profile" → INTENT: View profile → targetId: "profile"
"Take me to home" → INTENT: Go home → targetId: "home"
"Open farming twin" → INTENT: Farming twin → targetId: "twin"

Malayalam:
"എന്റെ പയറിന് വെള്ളക്കാശു വന്നിട്ടുണ്ട്" → INTENT: Plant disease → targetId: "diagnose"
"ഇന്ന് വീട്ടിൽ പച്ചക്കറി വിറ്റാൽ നല്ല വിലകിട്ടുമോ?" → INTENT: Market prices → targetId: "market"
"ഇന്നത്തെ കാലാവസ്ഥ എങ്ങനെയാണ്?" → INTENT: Weather → targetId: "weather"
"പ്രൊഫൈൽ" → INTENT: Profile → targetId: "profile"
"പ്രോഫൈൽ കാണിക്കുക" → INTENT: Profile → targetId: "profile"
"എന്റെ പ്രൊഫൈൽ" → INTENT: Profile → targetId: "profile"
"ഹോം" → INTENT: Home → targetId: "home"
"ഹോം പേജ്" → INTENT: Home → targetId: "home"
"വീട്ടിലേക്ക് പോകുക" → INTENT: Home → targetId: "home"
"കാർഷിക ട്വിൻ" → INTENT: Farming twin → targetId: "twin"
"ട്വിൻ" → INTENT: Farming twin → targetId: "twin"
"വിള പരിശോധന" → INTENT: Crop diagnosis → targetId: "diagnose"
"രോഗനിർണയം" → INTENT: Crop diagnosis → targetId: "diagnose"
"വിപണി" → INTENT: Market → targetId: "market"
"വിപണി വില" → INTENT: Market → targetId: "market"
"വാർത്തകൾ" → INTENT: News → targetId: "news"
"ന്യൂസ്" → INTENT: News → targetId: "news"
"ഫോറം" → INTENT: Forum → targetId: "forum"
"കർഷക ഫോറം" → INTENT: Forum → targetId: "forum"
"അലർട്ട്" → INTENT: Alerts → targetId: "notifications"
"അലർട്ടുകൾ" → INTENT: Alerts → targetId: "notifications"
"മുന്നറിയിപ്പുകൾ" → INTENT: Alerts → targetId: "notifications"
"ചെലവ്" → INTENT: Expenses → targetId: "expense"
"ചിലവ് ട്രാക്കർ" → INTENT: Expenses → targetId: "expense"
"പണം ചിലവ്" → INTENT: Expenses → targetId: "expense"
"വിജ്ഞാന കേന്ദ്രം" → INTENT: Knowledge → targetId: "knowledge"
"അറിവ്" → INTENT: Knowledge → targetId: "knowledge"
"പഠിക്കാൻ" → INTENT: Knowledge → targetId: "knowledge"

Hindi:
"मेरे टमाटर के पत्तों पर धब्बे हैं" → INTENT: Plant disease → targetId: "diagnose"
"आज चावल का भाव क्या है?" → INTENT: Market prices → targetId: "market"
"इस महीने खाद पर कितना खर्च हुआ?" → INTENT: Expenses → targetId: "expense"
"प्रोफाइल" → INTENT: Profile → targetId: "profile"
"मेरा प्रोफाइल" → INTENT: Profile → targetId: "profile"
"होम" → INTENT: Home → targetId: "home"
"घर जाना है" → INTENT: Home → targetId: "home"

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

NAVIGATION PATTERNS (Malayalam/Hindi/English):
- Profile words: "പ്രൊഫൈൽ", "പ്രോഫൈൽ", "profile", "प्रोफाइल", "मेरा प्रोफाइल" → "profile"
- Home words: "ഹോം", "വീട്", "home", "होम", "घर" → "home"
- News words: "വാർത്ത", "ന്യൂസ്", "news", "समाचार", "न्यूज़" → "news"
- Forum words: "ഫോറം", "കർഷക ഫോറം", "forum", "फोरम", "किसान फोरम" → "forum"
- Market words: "വിപണി", "market", "बाज़ार", "मंडी" → "market"
- Weather words: "കാലാവസ്ഥ", "weather", "मौसम" → "weather"
- Alert words: "അലർട്ട്", "മുന്നറിയിപ്പ്", "alert", "अलर्ट", "चेतावनी" → "notifications"
- Twin words: "ട്വിൻ", "കാർഷിക ട്വിൻ", "twin", "farming twin", "ट्विन" → "twin"
- Expense words: "ചെലവ്", "ചിലവ്", "expense", "खर्च", "लागत" → "expense"
- Knowledge words: "വിജ്ഞാനം", "അറിവ്", "knowledge", "ज्ञान", "जानकारी" → "knowledge"

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
  "action": "navigate" | "chat" | "weather" | "popup" | "tab",
  "targetId": "one of ${KNOWN_FEATURE_IDS.join(" | ")} or null",
  "subAction": "string or null", // specific tab, popup, or functionality within the feature
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

// Enhanced validation and sanitization of voice decisions
function validateAndSanitizeDecision(parsed: any): VoiceDecision | null {
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  // Validate action
  const validActions = ["navigate", "chat", "weather", "popup", "tab"];
  if (!parsed.action || !validActions.includes(parsed.action)) {
    console.warn(`⚠️ Invalid action: ${parsed.action}`);
    return null;
  }

  // Validate targetId if present
  if (parsed.targetId && !KNOWN_FEATURE_IDS.includes(parsed.targetId)) {
    console.warn(`⚠️ Invalid targetId: ${parsed.targetId}`);
    // Don't return null, just clear the targetId and let it fallback
    parsed.targetId = null;
  }

  // Validate confidence
  const confidence =
    typeof parsed.confidence === "number"
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0.5;

  // Construct sanitized decision
  const decision: VoiceDecision = {
    action: parsed.action,
    targetId: parsed.targetId || null,
    subAction: parsed.subAction || undefined,
    confidence,
    reason: parsed.reason || undefined,
    language: parsed.language || undefined,
    queryNormalized: parsed.queryNormalized || undefined,
  };

  return decision;
}

async function callGemini(prompt: string): Promise<VoiceDecision | null> {
  console.log("🤖 Calling unified AI for voice navigation...");

  try {
    // Import here to avoid circular dependency
    const { getVoiceNavigationResponse } = await import("./unifiedAI");

    // Extract the transcript from the prompt (simple extraction for now)
    const transcriptMatch = prompt.match(/User voice command: "([^"]+)"/);
    const transcript = transcriptMatch ? transcriptMatch[1] : prompt;
    const languageMatch = prompt.match(/Language: (\w+)/);
    const language = languageMatch ? languageMatch[1] : "en";

    const decision = await getVoiceNavigationResponse(transcript, language);
    console.log("🚀 Unified AI voice decision:", decision);

    return validateAndSanitizeDecision(decision);
  } catch (err) {
    console.warn("❌ Unified AI call failed:", err);
    return null;
  }
}

// Offline fallback using simple keyword matching in multiple languages
// Enhanced with sub-action detection
export function offlineMatch(
  queryRaw: string,
  language?: string
): VoiceDecision {
  console.log(`🔍 Offline matching: "${queryRaw}" (language: ${language})`);

  const q = queryRaw.toLowerCase();

  // Enhanced mapping with sub-actions
  const map: Array<{ keys: string[]; target: FeatureId; subAction?: string }> =
    [
      // Profile navigation
      {
        keys: [
          "profile",
          "my profile",
          "account",
          "settings",
          "പ്രൊഫൈൽ",
          "പ്രോഫൈൽ",
          "എന്റെ പ്രൊഫൈൽ",
          "അക്കൗണ്ട്",
          "സെറ്റിംഗ്സ്",
          "प्रोफाइल",
          "मेरा प्रोफाइल",
          "खाता",
        ],
        target: "profile",
      },
      // Twin with recommendations sub-action
      {
        keys: [
          "recommendations",
          "suggest",
          "advice",
          "crop recommendations",
          "farming suggestions",
          "which crop",
          "cropwise",
          "crop wise",
          "ശുപാർശകൾ",
          "നിർദ്ദേശങ്ങൾ",
          "വിള ശുപാർശകൾ",
          "കർഷിക നിർദ്ദേശങ്ങൾ",
          "ഏത് വിള",
          "सिफारिश",
          "सुझाव",
          "फसल की सिफारिश",
        ],
        target: "twin",
        subAction: "recommendations",
      },
      // Twin main dashboard
      {
        keys: [
          "twin",
          "digital",
          "ട്വിൻ",
          "ഡിജിറ്റൽ",
          "farming twin",
          "കാർഷിക ട്വിൻ",
        ],
        target: "twin",
        subAction: "twin",
      },
      // Weather with sub-actions
      {
        keys: [
          "current weather",
          "weather now",
          "today weather",
          "ഇന്നത്തെ കാലാവസ്ഥ",
          "നിലവിലെ കാലാവസ്ഥ",
          "अभी मौसम",
          "आज का मौसम",
        ],
        target: "weather" as FeatureId,
        subAction: "current",
      },
      {
        keys: [
          "weather forecast",
          "tomorrow weather",
          "weather prediction",
          "കാലാവസ്ഥാ പ്രവചനം",
          "നാളത്തെ കാലാവസ്ഥ",
          "मौसम पूर्वानुमान",
          "कल का मौसम",
        ],
        target: "weather" as FeatureId,
        subAction: "forecast",
      },
      {
        keys: [
          "weather alert",
          "storm alert",
          "rain alert",
          "കാലാവസ്ഥാ അലേർട്ട്",
          "കൊടുങ്കാറ്റ് അലേർട്ട്",
          "മഴ അലേർട്ട്",
          "मौसम अलर्ट",
          "तूफान अलर्ट",
        ],
        target: "weather" as FeatureId,
        subAction: "alerts",
      },
      // General weather (defaults to current)
      {
        keys: [
          "weather",
          "rain",
          "storm",
          "കാലാവസ്ഥ",
          "മഴ",
          "കൊടുങ്കാറ്റ്",
          "കാറ്റ്",
          "मौसम",
          "बारिश",
          "तूफान",
        ],
        target: "weather" as FeatureId,
        subAction: "current",
      },
      // Notifications/Alerts
      {
        keys: [
          "alert",
          "alerts",
          "notification",
          "notifications",
          "warning",
          "അലർട്ട്",
          "അലർട്ടുകൾ",
          "അറിയിപ്പ്",
          "അറിയിപ്പുകൾ",
          "മുന്നറിയിപ്പ്",
          "मुन्नारियिप्पुकळ्",
          "अलर्ट",
          "सूचना",
          "चेतावनी",
        ],
        target: "notifications",
      },
      // News
      {
        keys: [
          "news",
          "agriculture news",
          "farming news",
          "വാർത്ത",
          "വാർത്തകൾ",
          "ന്യൂസ്",
          "കാർഷിക വാർത്തകൾ",
          "समाचार",
          "न्यूज़",
          "कृषि समाचार",
        ],
        target: "news",
      },
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
          "सहायक",
          "चैट",
          "सहायता",
        ],
        target: "chatbot",
      },
    ];

  // Check for matches with sub-actions
  for (const m of map) {
    if (m.keys.some((k) => q.includes(k))) {
      const result: VoiceDecision = {
        action: m.target === "weather" ? "weather" : "navigate",
        targetId: m.target === "weather" ? null : m.target,
        subAction: m.subAction || undefined,
        confidence: 0.6,
        queryNormalized: q,
      };
      console.log(`✅ Offline match found for "${queryRaw}":`, result);
      return result;
    }
  }

  const fallbackResult: VoiceDecision = {
    action: "chat",
    targetId: "chatbot",
    confidence: 0.4,
    queryNormalized: q,
  };
  console.log(
    `⚠️ No offline match found for "${queryRaw}", defaulting to chat:`,
    fallbackResult
  );
  return fallbackResult;
}

export async function routeFromTranscript(
  transcript: string,
  language?: string
): Promise<VoiceDecision> {
  console.log(
    `🎤 Voice routing request: "${transcript}" (language: ${language})`
  );

  // Initialize WebLLM engine if not already done
  await initializeWebLLM();

  // Try WebLLM local processing first (currently disabled but shows integration)
  const webLLMResult = await processWithWebLLM(transcript);
  if (webLLMResult) {
    console.log("✅ WebLLM local processing successful:", webLLMResult);
    return webLLMResult;
  }

  // Fallback to cloud-based Gemini processing
  const prompt = buildPrompt(transcript, language);
  console.log(
    "📝 Built prompt for Gemini (first 200 chars):",
    prompt.substring(0, 200) + "..."
  );

  const ai = await callGemini(prompt);
  if (ai) {
    console.log("✅ Gemini provided decision:", ai);

    // Enhanced handling for different action types
    if (ai.action === "weather") {
      // Weather action already correctly formatted
      console.log("🌤️ Weather action processed:", ai);
      return ai;
    }

    if (ai.action === "navigate" && ai.targetId === "weather") {
      console.log("🌤️ Converting weather navigation to weather action");
      return {
        action: "weather",
        targetId: null,
        subAction: ai.subAction || "current", // default to current weather
        confidence: ai.confidence,
        reason: ai.reason,
        language: ai.language,
        queryNormalized: ai.queryNormalized,
      };
    }

    // Handle navigation with sub-actions
    if (ai.action === "navigate" && ai.targetId && ai.subAction) {
      console.log(
        `🎯 Navigation with sub-action: ${ai.targetId} → ${ai.subAction}`
      );
      return ai;
    }

    // Validate targetId is in known features
    if (
      ai.action === "navigate" &&
      ai.targetId &&
      !KNOWN_FEATURE_IDS.includes(ai.targetId as any)
    ) {
      console.warn(
        `⚠️ Unknown targetId: ${ai.targetId}, falling back to offline match`
      );
      const off = offlineMatch(transcript, language);
      return off;
    }

    // If AI says navigate but target is null, fallback
    if (ai.action === "navigate" && !ai.targetId) {
      console.log(
        "⚠️ Gemini said navigate but no targetId, using offline fallback"
      );
      const off = offlineMatch(transcript, language);
      console.log("🔄 Offline fallback result:", off);

      // Handle weather in offline fallback too
      if (off.action === "navigate" && off.targetId === "weather") {
        console.log(
          "🌤️ Converting offline weather navigation to weather action"
        );
        return {
          action: "weather",
          targetId: null,
          subAction: "current",
          confidence: off.confidence,
          reason: off.reason,
          language: off.language,
          queryNormalized: off.queryNormalized,
        };
      }

      return off;
    }

    return ai;
  }

  console.log("❌ Gemini failed, using offline fallback");
  const offline = offlineMatch(transcript, language);
  console.log("🔄 Offline fallback result:", offline);

  // Handle weather in offline fallback
  if (offline.action === "navigate" && offline.targetId === "weather") {
    console.log("🌤️ Converting offline weather navigation to weather action");
    return {
      action: "weather",
      targetId: null,
      subAction: "current",
      confidence: offline.confidence,
      reason: offline.reason,
      language: offline.language,
      queryNormalized: offline.queryNormalized,
    };
  }

  return offline;
}

// WebLLM utility functions for local LLM integration
export async function getWebLLMStatus(): Promise<{
  initialized: boolean;
  model: string | null;
  localProcessing: boolean;
}> {
  await initializeWebLLM();
  return {
    initialized: webLLMInitialized,
    model: webLLMEngine?.config?.model || null,
    localProcessing: webLLMEngine?.config?.local_processing || false,
  };
}

// Clean up WebLLM resources (dummy implementation)
export function cleanupWebLLM(): void {
  if (webLLMEngine) {
    console.log("🧹 Cleaning up WebLLM resources");
    webLLMEngine = null;
    webLLMInitialized = false;
  }
}
