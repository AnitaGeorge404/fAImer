/**
 * Development utility to test offline AI functionality
 */

import { testOfflineModel, isOfflineModelAvailable } from "../lib/offlineAI";
import { getAIResponse, getOnlineStatus } from "../lib/unifiedAI";

/**
 * Test offline AI model functionality
 */
export async function runOfflineAITests(): Promise<void> {
  console.log("🧪 Running Comprehensive Offline AI Tests...");
  console.log(`📱 Environment: ${import.meta.env.MODE}`);
  console.log(`🌐 Online Status: ${getOnlineStatus()}`);
  console.log(
    `⚡ Offline Model Enabled: ${import.meta.env.VITE_ENABLE_OFFLINE_MODEL !== "false"}`
  );

  // Test 1: Check if model is available
  console.log("\n=== Test 1: Model Availability ===");
  const isAvailable = isOfflineModelAvailable();
  console.log(`✅ Model loaded: ${isAvailable}`);

  // Test 2: Test direct offline model
  console.log("\n=== Test 2: Direct Offline Model ===");
  try {
    const directResponse = await testOfflineModel();
    console.log(
      "✅ Direct model response:",
      directResponse.substring(0, 150) + "..."
    );
  } catch (error) {
    console.error("❌ Direct model test failed:", error);
  }

  // Test 3: Test unified AI with force offline
  console.log("\n=== Test 3: Unified AI (Force Offline) ===");
  try {
    const unifiedResponse = await getAIResponse(
      "How to grow tomatoes organically in India?",
      {
        forceOffline: true,
        maxTokens: 150,
      }
    );
    console.log("✅ Unified AI response:");
    console.log(`Source: ${unifiedResponse.source}`);
    console.log(`Text: ${unifiedResponse.text}`);
    if (unifiedResponse.error) {
      console.log(`Error: ${unifiedResponse.error}`);
    }
  } catch (error) {
    console.error("❌ Unified AI test failed:", error);
  }

  // Test 4: Different farming topics
  const testPrompts = [
    "What fertilizer is best for tomatoes?",
    "How to control aphids naturally?",
    "When to plant rice in India?",
    "Best irrigation techniques for vegetables",
    "How to prepare soil for wheat cultivation?",
    "Organic pest control methods",
  ];

  console.log("\n=== Test 4: Multiple Farming Topics ===");
  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    try {
      console.log(`\n--- Topic ${i + 1}: ${prompt} ---`);
      const response = await getAIResponse(prompt, {
        forceOffline: true,
        maxTokens: 100,
      });
      console.log(`✅ Source: ${response.source}`);
      console.log(`Response: ${response.text}`);
    } catch (error) {
      console.error(`❌ "${prompt}" failed:`, error);
    }
  }

  console.log("\n=== Test 5: Fallback Response Quality ===");
  const fallbackTestPrompts = [
    "tomato disease management",
    "rice fertilizer application",
    "wheat seed treatment",
    "random farming question",
  ];

  for (const prompt of fallbackTestPrompts) {
    try {
      const response = await getAIResponse(prompt, {
        forceOffline: true,
        maxTokens: 50,
      });
      console.log(
        `✅ "${prompt}" → Quality: ${response.text.length > 50 ? "Good" : "Basic"}`
      );
    } catch (error) {
      console.error(`❌ "${prompt}" failed:`, error);
    }
  }

  console.log("\n🏁 Comprehensive Offline AI tests completed!");
  console.log("📋 Summary:");
  console.log("- Check console above for detailed results");
  console.log("- Model availability and response quality");
  console.log("- Fallback mechanisms working properly");
}

/**
 * Quick test for specific farming question
 */
export async function testSpecificQuestion(question: string): Promise<void> {
  console.log(`🧪 Testing specific question: "${question}"`);

  try {
    const response = await getAIResponse(question, {
      forceOffline: true,
      maxTokens: 200,
    });

    console.log("✅ Response received:");
    console.log(`Source: ${response.source}`);
    console.log(`Text: ${response.text}`);
    console.log(`Length: ${response.text.length} characters`);

    if (response.error) {
      console.log(`⚠️ Error: ${response.error}`);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

/**
 * Add test functions to global scope for easy console access
 */
if (import.meta.env.MODE === "development") {
  (window as any).testOfflineAI = runOfflineAITests;
  (window as any).testQuestion = testSpecificQuestion;
  (window as any).checkOfflineAI = () => {
    console.log("🔍 Offline AI Status:");
    console.log(`Model available: ${isOfflineModelAvailable()}`);
    console.log(`Online status: ${getOnlineStatus()}`);
    console.log(
      `Offline enabled: ${import.meta.env.VITE_ENABLE_OFFLINE_MODEL !== "false"}`
    );
  };

  console.log("🔧 Development mode - Available commands:");
  console.log("- testOfflineAI() - Run comprehensive tests");
  console.log("- testQuestion('your question') - Test specific question");
  console.log("- checkOfflineAI() - Check system status");
}
