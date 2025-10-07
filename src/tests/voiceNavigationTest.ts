/**
 * Voice Navigation System Test Cases
 * This file contains test scenarios to verify the enhanced agentic voice navigation system
 */

import {
  routeFromTranscript,
  offlineMatch,
  VoiceDecision,
} from "../lib/voiceNavigation";

// Test cases for different voice commands
export const testCases = [
  // Basic Navigation Tests
  {
    input: "go home",
    expected: { action: "navigate", targetId: "home" },
    description: "Basic home navigation",
  },
  {
    input: "open profile",
    expected: { action: "navigate", targetId: "profile" },
    description: "Profile navigation",
  },

  // Twin Feature with Sub-Actions
  {
    input: "show me crop recommendations",
    expected: {
      action: "navigate",
      targetId: "twin",
      subAction: "recommendations",
    },
    description: "Twin recommendations tab",
  },
  {
    input: "open farming twin",
    expected: { action: "navigate", targetId: "twin" },
    description: "Main twin dashboard",
  },
  {
    input: "വിള ശുപാർശകൾ കാണിക്കുക",
    expected: {
      action: "navigate",
      targetId: "twin",
      subAction: "recommendations",
    },
    description: "Malayalam crop recommendations",
  },

  // Weather with Sub-Actions
  {
    input: "what's the current weather",
    expected: { action: "weather", subAction: "current" },
    description: "Current weather query",
  },
  {
    input: "weather forecast for tomorrow",
    expected: { action: "weather", subAction: "forecast" },
    description: "Weather forecast query",
  },
  {
    input: "any weather alerts",
    expected: { action: "weather", subAction: "alerts" },
    description: "Weather alerts query",
  },
  {
    input: "ഇന്നത്തെ കാലാവസ്ഥ",
    expected: { action: "weather", subAction: "current" },
    description: "Malayalam current weather",
  },

  // Natural Language Disease Diagnosis
  {
    input: "my tomato plant has yellow spots",
    expected: { action: "navigate", targetId: "diagnose" },
    description: "Natural disease description",
  },
  {
    input: "എന്റെ തക്കാളിയിൽ പുള്ളികൾ ഉണ്ട്",
    expected: { action: "navigate", targetId: "diagnose" },
    description: "Malayalam disease description",
  },

  // Market Price Queries
  {
    input: "what's the price of rice today",
    expected: { action: "navigate", targetId: "market" },
    description: "Market price query",
  },

  // Expense Tracking
  {
    input: "how much did I spend this month",
    expected: { action: "navigate", targetId: "expense" },
    description: "Expense tracking query",
  },

  // Complex Queries (should route to chatbot)
  {
    input:
      "help me plan my entire farming season and suggest the best fertilizers",
    expected: { action: "chat", targetId: "chatbot" },
    description: "Complex planning query",
  },

  // Fallback Cases
  {
    input: "I need assistance with something complex",
    expected: { action: "chat", targetId: "chatbot" },
    description: "General help request",
  },
];

// Test function to validate the voice navigation system
export async function runVoiceNavigationTests() {
  console.log("🧪 Running Voice Navigation Tests...\n");

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      console.log(`Testing: "${testCase.input}"`);
      console.log(`Expected: ${JSON.stringify(testCase.expected)}`);

      // Test with offline match first (faster)
      const offlineResult = offlineMatch(testCase.input, "en");
      console.log(
        `Offline Result: ${JSON.stringify({
          action: offlineResult.action,
          targetId: offlineResult.targetId,
          subAction: offlineResult.subAction,
        })}`
      );

      // Test with full routing (including Gemini AI)
      const fullResult = await routeFromTranscript(testCase.input, "en");
      console.log(
        `Full Result: ${JSON.stringify({
          action: fullResult.action,
          targetId: fullResult.targetId,
          subAction: fullResult.subAction,
          confidence: fullResult.confidence,
        })}`
      );

      // Basic validation (can be enhanced)
      const isValid =
        fullResult.action === testCase.expected.action &&
        (!testCase.expected.targetId ||
          fullResult.targetId === testCase.expected.targetId);

      if (isValid) {
        console.log("✅ PASSED");
        passed++;
      } else {
        console.log("❌ FAILED");
        failed++;
      }

      console.log("-".repeat(50));
    } catch (error) {
      console.error(`❌ ERROR testing "${testCase.input}":`, error);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

// Utility function to test a single voice command
export async function testVoiceCommand(
  command: string,
  language: string = "en"
): Promise<VoiceDecision> {
  console.log(`🎤 Testing voice command: "${command}" (${language})`);

  try {
    const result = await routeFromTranscript(command, language);
    console.log("Result:", result);
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Example usage:
// import { testVoiceCommand } from './tests/voiceNavigationTest';
// testVoiceCommand("show me crop recommendations");
// testVoiceCommand("വിള ശുപാർശകൾ കാണിക്കുക", "ml");
