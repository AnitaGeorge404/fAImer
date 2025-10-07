import { pipeline, env } from "@xenova/transformers";

// Configure transformers.js environment for better browser compatibility
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.backends.onnx.wasm.wasmPaths =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/";
env.backends.onnx.wasm.numThreads = 1;

let offlineModel: any = null;
let isLoading = false;
let loadingPromise: Promise<any> | null = null;

// Configuration to disable offline model in development if needed
const ENABLE_OFFLINE_MODEL =
  import.meta.env.VITE_ENABLE_OFFLINE_MODEL !== "false";

// Check if we're in a problematic environment (like dev server proxy)
const isProblematicEnvironment = () => {
  return import.meta.env.DEV && window.location.hostname === "localhost";
};

/**
 * Load the offline LLM model (LaMini-Flan-T5-77M)
 * Uses caching to avoid reloading
 */
async function loadOfflineModel(): Promise<any> {
  if (!ENABLE_OFFLINE_MODEL) {
    throw new Error("Offline model is disabled");
  }

  // Skip model loading in problematic dev environments
  if (isProblematicEnvironment()) {
    console.warn(
      "🚫 Skipping model load in dev environment - using fallback responses"
    );
    throw new Error("Model loading skipped in development environment");
  }

  if (offlineModel) {
    return offlineModel;
  }

  if (isLoading && loadingPromise) {
    return loadingPromise;
  }

  isLoading = true;
  console.log("🤖 Loading offline LLM model...");

  try {
    // Try different model configurations for better reliability
    const modelOptions = [
      {
        model: "Xenova/LaMini-Flan-T5-77M",
        config: {
          local_files_only: false,
          revision: "main",
          device: "webgpu",
          dtype: "fp16",
        },
      },
      {
        model: "Xenova/flan-t5-small",
        config: {
          local_files_only: false,
          revision: "main",
          device: "wasm",
          dtype: "q8",
        },
      },
      {
        model: "Xenova/t5-small",
        config: {
          local_files_only: false,
          revision: "main",
          device: "wasm",
          dtype: "q8",
        },
      },
    ];

    let lastError = null;

    for (const { model, config } of modelOptions) {
      try {
        console.log(`🔄 Trying model: ${model}`);

        // Add timeout and better error handling
        const modelLoadPromise = pipeline("text2text-generation", model, {
          ...config,
          progress_callback: (progress: any) => {
            if (progress.status === "progress") {
              console.log(
                `📥 Downloading ${model}: ${Math.round(progress.progress || 0)}%`
              );
            } else if (progress.status === "ready") {
              console.log(`✅ ${model} download completed`);
            }
          },
        });

        // Add timeout to prevent hanging
        loadingPromise = Promise.race([
          modelLoadPromise,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Model loading timeout after 30s`)),
              30000
            )
          ),
        ]);

        break; // If successful, break out of loop
      } catch (error) {
        console.warn(`⚠️ Failed to load ${model}:`, error);
        lastError = error;
        loadingPromise = null;
        continue; // Try next model
      }
    }

    if (!loadingPromise) {
      throw new Error(
        `All model loading attempts failed. Last error: ${lastError}`
      );
    }

    offlineModel = await loadingPromise;
    console.log("✅ Offline LLM model loaded successfully");
    return offlineModel;
  } catch (error) {
    console.error("❌ Failed to load offline LLM model:", error);
    // Reset state on error
    offlineModel = null;
    throw error;
  } finally {
    isLoading = false;
    loadingPromise = null;
  }
}

/**
 * Generate response using offline LLM
 * @param prompt - The input prompt
 * @param maxTokens - Maximum tokens to generate (default: 100)
 */
export async function generateOfflineResponse(
  prompt: string,
  maxTokens: number = 100
): Promise<string> {
  try {
    const generator = await loadOfflineModel();

    // Enhanced prompt engineering for better farming responses
    const farmingPrompt = `You are an expert farming advisor for Indian farmers. Provide practical, actionable advice in simple language.

Context: Indian agriculture, sustainable farming practices, crop management
Task: Answer the farming question with specific, helpful guidance
Format: Clear, concise response with actionable steps

Question: ${prompt}

Answer:`;

    const output = await generator(farmingPrompt, {
      max_new_tokens: maxTokens,
      do_sample: true,
      temperature: 0.6,
      top_p: 0.9,
      repetition_penalty: 1.1,
      pad_token_id: 0,
    });

    console.log("✅ Offline LLM response generated");

    // Extract and clean the response
    let responseText = output[0]?.generated_text || "";

    // Remove the original prompt from the response if it's included
    if (responseText.includes(farmingPrompt)) {
      responseText = responseText.replace(farmingPrompt, "").trim();
    }

    // Clean up response
    responseText = responseText
      .replace(/^Answer:\s*/i, "")
      .replace(/^\s*[-•]\s*/, "")
      .trim();

    // Ensure we have a meaningful response
    if (!responseText || responseText.length < 10) {
      return getContextualFallbackResponse(prompt);
    }

    return responseText;
  } catch (error) {
    console.error("❌ Offline LLM generation failed:", error);
    return getContextualFallbackResponse(prompt);
  }
}

/**
 * Provide contextual fallback responses when offline AI fails
 */
export function getContextualFallbackResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  // Crop and plant management
  if (
    lowerPrompt.includes("crop") ||
    lowerPrompt.includes("plant") ||
    lowerPrompt.includes("grow")
  ) {
    if (lowerPrompt.includes("tomato")) {
      return "For tomato cultivation: Plant in well-drained soil with pH 6.0-7.0. Provide support stakes, water regularly but avoid overwatering. Apply balanced NPK fertilizer and watch for common pests like aphids and whiteflies.";
    }
    if (lowerPrompt.includes("rice") || lowerPrompt.includes("paddy")) {
      return "For rice cultivation: Prepare fields with proper puddling, transplant seedlings at 15-20cm spacing. Maintain 2-5cm water level, apply urea in 3 splits, and watch for blast and brown spot diseases.";
    }
    if (lowerPrompt.includes("wheat")) {
      return "For wheat cultivation: Sow during optimal window (Nov-Dec), use recommended varieties, apply DAP at sowing and urea in 2-3 splits. Monitor for rust diseases and aphid attacks.";
    }
    return "For successful crop cultivation: Test soil first, choose appropriate varieties for your region, maintain proper spacing, provide adequate nutrition, and monitor for pests and diseases regularly.";
  }

  // Pest and disease management
  if (
    lowerPrompt.includes("pest") ||
    lowerPrompt.includes("disease") ||
    lowerPrompt.includes("insect")
  ) {
    if (lowerPrompt.includes("aphid")) {
      return "For aphid control: Use neem oil spray (5ml/liter), introduce beneficial insects like ladybugs, remove affected plant parts, and avoid excessive nitrogen fertilization.";
    }
    if (lowerPrompt.includes("fungus") || lowerPrompt.includes("blight")) {
      return "For fungal diseases: Improve air circulation, avoid overhead watering, apply copper-based fungicides, remove infected plant debris, and use resistant varieties.";
    }
    return "For pest management: Follow IPM practices - monitor regularly, use biological controls first, apply neem-based pesticides, maintain field hygiene, and use chemical pesticides only when necessary.";
  }

  // Weather and climate
  if (
    lowerPrompt.includes("weather") ||
    lowerPrompt.includes("rain") ||
    lowerPrompt.includes("drought")
  ) {
    return "For weather management: Monitor weather forecasts daily, prepare drainage for excess rain, conserve water through mulching, have contingency crops ready, and adjust planting dates based on seasonal predictions.";
  }

  // Soil and fertilizer
  if (
    lowerPrompt.includes("fertilizer") ||
    lowerPrompt.includes("nutrient") ||
    lowerPrompt.includes("soil")
  ) {
    return "For soil nutrition: Conduct soil testing every 2-3 years, use organic matter like FYM/compost, apply balanced NPK based on crop needs, consider micronutrients, and maintain proper soil pH (6.0-7.5).";
  }

  // Water and irrigation
  if (lowerPrompt.includes("water") || lowerPrompt.includes("irrigation")) {
    return "For water management: Use drip irrigation for efficient water use, mulch to reduce evaporation, monitor soil moisture with finger test, water during early morning/evening, and collect rainwater when possible.";
  }

  // Seeds and planting
  if (
    lowerPrompt.includes("seed") ||
    lowerPrompt.includes("planting") ||
    lowerPrompt.includes("sowing")
  ) {
    return "For seed management: Use certified quality seeds, treat seeds with fungicide/Trichoderma, maintain proper sowing depth (2-3 times seed diameter), ensure adequate spacing, and sow at optimal time.";
  }

  // Harvesting
  if (lowerPrompt.includes("harvest") || lowerPrompt.includes("yield")) {
    return "For harvesting: Monitor crop maturity indicators, harvest during dry weather, use proper tools to minimize damage, dry produce adequately, and store in clean, dry conditions.";
  }

  // Marketing and economics
  if (
    lowerPrompt.includes("price") ||
    lowerPrompt.includes("market") ||
    lowerPrompt.includes("sell")
  ) {
    return "For marketing: Check local mandi prices, consider direct selling to consumers, form farmer groups for better negotiation, add value through processing, and diversify crops to spread risk.";
  }

  return "I'm currently in basic offline mode. For detailed farming guidance, connect to the internet for enhanced AI assistance, or consult your local agricultural extension officer for region-specific advice.";
}

/**
 * Check if offline model is available/loaded
 */
export function isOfflineModelAvailable(): boolean {
  return offlineModel !== null;
}

/**
 * Preload the offline model (call this early in app lifecycle)
 */
export async function preloadOfflineModel(): Promise<void> {
  try {
    await loadOfflineModel();
    console.log("🚀 Offline model preloaded");

    // Test the model with a simple prompt
    try {
      const testResponse = await generateOfflineResponse(
        "What is farming?",
        50
      );
      console.log(
        "🧪 Model test successful:",
        testResponse.substring(0, 100) + "..."
      );
    } catch (testError) {
      console.warn("⚠️ Model test failed:", testError);
    }
  } catch (error) {
    console.warn("⚠️ Failed to preload offline model:", error);
  }
}

/**
 * Test the offline model with a simple prompt
 */
export async function testOfflineModel(): Promise<string> {
  try {
    const response = await generateOfflineResponse(
      "How to grow tomatoes?",
      100
    );
    return response;
  } catch (error) {
    console.error("❌ Offline model test failed:", error);
    return (
      "Test failed: " +
      (error instanceof Error ? error.message : "Unknown error")
    );
  }
}
