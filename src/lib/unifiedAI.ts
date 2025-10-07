import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateOfflineResponse, preloadOfflineModel } from "./offlineAI";

// Online/offline detection
let isOnline = navigator.onLine;
let onlineChangeListeners: Array<(online: boolean) => void> = [];

// Update online status and notify listeners
function updateOnlineStatus() {
  const newStatus = navigator.onLine;
  if (newStatus !== isOnline) {
    isOnline = newStatus;
    console.log(
      `🌐 Connection status changed: ${isOnline ? "ONLINE" : "OFFLINE"}`
    );
    onlineChangeListeners.forEach((listener) => listener(isOnline));
  }
}

// Listen for online/offline events
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

/**
 * Add listener for online/offline status changes
 */
export function addOnlineStatusListener(listener: (online: boolean) => void) {
  onlineChangeListeners.push(listener);
  return () => {
    onlineChangeListeners = onlineChangeListeners.filter((l) => l !== listener);
  };
}

/**
 * Get current online status
 */
export function getOnlineStatus(): boolean {
  return isOnline;
}

/**
 * Initialize the unified AI system
 * Preloads offline model when possible
 */
export async function initializeUnifiedAI(): Promise<void> {
  console.log("🤖 Initializing Unified AI system...");

  // Check if offline model is enabled
  const offlineEnabled = import.meta.env.VITE_ENABLE_OFFLINE_MODEL !== "false";

  if (!offlineEnabled) {
    console.log("📴 Offline AI model disabled via environment configuration");
    return;
  }

  // Only attempt to preload if we're online to avoid unnecessary errors
  if (isOnline) {
    // Preload offline model in background with timeout
    const preloadTimeout = setTimeout(() => {
      console.log(
        "⏰ Model preload taking longer than expected, continuing in background..."
      );
    }, 10000); // 10 second timeout

    preloadOfflineModel()
      .then(() => {
        clearTimeout(preloadTimeout);
        console.log("✅ Offline model preloaded successfully");
      })
      .catch((error) => {
        clearTimeout(preloadTimeout);
        console.warn(
          "⚠️ Background model preload failed (will retry on first use):",
          error
        );
      });
  } else {
    console.log("📴 Starting in offline mode - model will load on first use");
  }
}

/**
 * Generate AI response using online Gemini or offline fallback
 * @param prompt - The user prompt
 * @param options - Generation options
 */
export async function getAIResponse(
  prompt: string,
  options: {
    maxTokens?: number;
    model?: string;
    temperature?: number;
    forceOffline?: boolean;
  } = {}
): Promise<{
  text: string;
  source: "online" | "offline";
  error?: string;
}> {
  const {
    maxTokens = 200,
    model = "gemini-2.5-flash",
    forceOffline = false,
  } = options;

  // Check if offline model is enabled
  const offlineEnabled = import.meta.env.VITE_ENABLE_OFFLINE_MODEL !== "false";
  const forceOfflineMode = import.meta.env.VITE_FORCE_OFFLINE_MODE === "true";

  // Force offline mode if requested or configured
  if (forceOffline || forceOfflineMode || !isOnline) {
    console.log("🔄 Using offline LLM...");

    if (!offlineEnabled) {
      console.log(
        "📴 Offline model disabled, using enhanced contextual fallback"
      );
      const { getContextualFallbackResponse } = await import("./offlineAI");
      return {
        text: getContextualFallbackResponse(prompt),
        source: "offline",
      };
    }

    try {
      console.log("🤖 Attempting to load offline model...");
      const response = await generateOfflineResponse(prompt, maxTokens);
      console.log("✅ Offline response generated successfully");
      return {
        text: response,
        source: "offline",
      };
    } catch (error) {
      console.error("❌ Offline AI failed:", error);
      console.log("🔄 Falling back to contextual responses...");
      const { getContextualFallbackResponse } = await import("./offlineAI");
      return {
        text: getContextualFallbackResponse(prompt),
        source: "offline",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Try online Gemini first
  console.log("🌐 Using online Gemini...");
  console.log(`📡 Online status: ${isOnline}`);
  console.log(
    `🔑 API key configured: ${!!import.meta.env.VITE_GEMINI_API_KEY}`
  );

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      throw new Error(
        "Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env.local"
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });

    // Enhanced prompt for farming context with better structure
    const farmingPrompt = `You are an expert agricultural advisor specializing in Indian farming practices. Provide practical, actionable advice.

Context: Indian agriculture, sustainable farming, crop management for small to medium farmers
Task: Answer the farming question with specific guidance and practical steps
Format: Clear, structured response with actionable recommendations

Question: ${prompt}

Please provide:`;

    const result = await genModel.generateContent(farmingPrompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.trim();

    // Ensure response quality
    if (!text || text.length < 20) {
      throw new Error("Generated response too short or empty");
    }

    console.log("✅ Online Gemini response generated successfully");
    return {
      text,
      source: "online",
    };
  } catch (onlineError) {
    console.warn(
      "⚠️ Online Gemini failed, falling back to offline LLM:",
      onlineError
    );

    // Fallback to offline model if enabled
    if (offlineEnabled) {
      try {
        const response = await generateOfflineResponse(prompt, maxTokens);
        return {
          text: response,
          source: "offline",
        };
      } catch (offlineError) {
        console.error("❌ Both online and offline AI failed:", offlineError);
        // Use contextual fallback as last resort
        const { getContextualFallbackResponse } = await import("./offlineAI");
        return {
          text: getContextualFallbackResponse(prompt),
          source: "offline",
          error:
            offlineError instanceof Error
              ? offlineError.message
              : "Unknown error",
        };
      }
    } else {
      console.log("📴 Offline model disabled, using contextual fallback");
      // Use contextual fallback when offline model is disabled
      const { getContextualFallbackResponse } = await import("./offlineAI");
      return {
        text: getContextualFallbackResponse(prompt),
        source: "offline",
        error:
          onlineError instanceof Error ? onlineError.message : "Unknown error",
      };
    }
  }
}

/**
 * Specialized function for expense analysis (maintains compatibility)
 */
export async function getExpenseInsights(
  expenseData: any,
  viewMode: string = "monthly"
): Promise<{
  summary: string;
  recommendations: string[];
  trends: string[];
  budgetAdvice: string;
  source: "online" | "offline";
}> {
  const prompt = `As an AI farming financial advisor, analyze the following farm expense data and provide insights:

Total Expenses: ₹${expenseData.total}
Categories: ${JSON.stringify(expenseData.categories)}
Recent Expenses: ${JSON.stringify(expenseData.recentExpenses?.slice(0, 5) || [])}
${viewMode === "weekly" ? "Weekly" : "Monthly"} Trend: ${JSON.stringify(expenseData.chartTrend || [])}

Please provide:
1. A brief summary of spending patterns (max 20 words)
2. Exactly 3 practical recommendations for better expense management (each max 15 words)
3. Exactly 3 key trends observed in the data (each max 15 words)
4. Specific budget advice for a farmer (max 20 words)

Format the response as a JSON object with keys: summary, recommendations (array), trends (array), budgetAdvice (string).
Keep each point concise and farmer-focused.`;

  try {
    const response = await getAIResponse(prompt, { maxTokens: 300 });

    // Try to parse JSON response
    const cleanText = response.text.replace(/```json\n?|\n?```/g, "").trim();
    let jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        source: response.source,
      };
    } else {
      // Fallback structure if JSON parsing fails
      return {
        summary: "Unable to parse detailed insights",
        recommendations: [
          "Monitor high-cost categories",
          "Track seasonal expenses",
          "Set monthly budgets",
        ],
        trends: [
          "Review spending patterns",
          "Compare with previous periods",
          "Identify cost-saving opportunities",
        ],
        budgetAdvice: "Create detailed expense tracking system",
        source: response.source,
      };
    }
  } catch (error) {
    console.error("❌ Expense insights generation failed:", error);
    return {
      summary: "Analysis temporarily unavailable",
      recommendations: [
        "Track all farm expenses",
        "Review costs monthly",
        "Compare market prices",
      ],
      trends: [
        "Monitor expense categories",
        "Check seasonal patterns",
        "Identify savings",
      ],
      budgetAdvice: "Maintain detailed financial records",
      source: "offline",
    };
  }
}

/**
 * Specialized function for voice navigation (maintains compatibility)
 */
export async function getVoiceNavigationResponse(
  transcript: string,
  language?: string
): Promise<any> {
  const prompt = `You are a voice navigation assistant for a farming app. Analyze this voice command and return a JSON response with navigation instructions.

Voice command: "${transcript}"
Language: ${language || "en"}

Return JSON with: {
  "action": "navigate|chat|weather|error",
  "targetId": "feature_id_or_null",
  "subAction": "specific_action_or_null",
  "confidence": 0.8,
  "reason": "why this decision",
  "language": "${language || "en"}",
  "queryNormalized": "cleaned command"
}

Available features: home, weather, crops, market, schemes, expenses, assistant, todo, inputs, mapping, twin`;

  try {
    const response = await getAIResponse(prompt, { maxTokens: 150 });

    // Try to parse JSON response
    const cleanText = response.text.replace(/```json\n?|\n?```/g, "").trim();
    let jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Fallback to chat if parsing fails
      return {
        action: "chat",
        targetId: null,
        subAction: null,
        confidence: 0.5,
        reason: "Could not parse voice command, defaulting to chat",
        language: language || "en",
        queryNormalized: transcript.toLowerCase(),
      };
    }
  } catch (error) {
    console.error("❌ Voice navigation failed:", error);
    // Return safe default
    return {
      action: "chat",
      targetId: null,
      subAction: null,
      confidence: 0.3,
      reason: "Voice processing error, defaulting to chat",
      language: language || "en",
      queryNormalized: transcript.toLowerCase(),
    };
  }
}
