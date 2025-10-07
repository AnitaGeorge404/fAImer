/**
 * Comprehensive test suite for Malayalam Voice Navigation System
 * Tests natural language understanding for agricultural applications
 */

import { routeFromTranscript } from "../lib/voiceNavigation";

interface TestCase {
  query: string;
  expectedTargetId: string;
  expectedSubAction?: string;
  description: string;
  category: string;
}

const malayalamTestCases: TestCase[] = [
  // Disease/Plant Problem Detection
  {
    query: "എന്റെ പയറിന് വെള്ളക്കാശു വന്നിട്ടുണ്ട്",
    expectedTargetId: "diagnose",
    description: "Pest problem on beans",
    category: "Disease Detection",
  },
  {
    query: "തക്കാളിയിൽ പുള്ളികൾ കാണുന്നു",
    expectedTargetId: "diagnose",
    description: "Spots on tomato",
    category: "Disease Detection",
  },
  {
    query: "ചെടിയുടെ ഇലകൾ മഞ്ഞയായി വരുന്നു",
    expectedTargetId: "diagnose",
    description: "Yellowing leaves",
    category: "Disease Detection",
  },
  {
    query: "നെല്ലിന് ഇലപ്പുള്ളി രോഗം വന്നു",
    expectedTargetId: "diagnose",
    description: "Leaf spot disease on rice",
    category: "Disease Detection",
  },
  {
    query: "വാഴയിൽ പുഴു കയറി",
    expectedTargetId: "diagnose",
    description: "Worm infestation on banana",
    category: "Disease Detection",
  },

  // Market Prices
  {
    query: "ഇന്ന് വീട്ടിൽ പച്ചക്കറി വിറ്റാൽ നല്ല വിലകിട്ടുമോ?",
    expectedTargetId: "market",
    description: "Selling vegetables today for good price",
    category: "Market Prices",
  },
  {
    query: "തക്കാളിക്ക് എത്ര വില കിട്ടും ഇന്ന്",
    expectedTargetId: "market",
    description: "Today's tomato price",
    category: "Market Prices",
  },
  {
    query: "കൃഷിച്ചന്തയിലെ വില എത്രയാണ്",
    expectedTargetId: "market",
    description: "Market prices inquiry",
    category: "Market Prices",
  },
  {
    query: "നെല്ല് വിറ്റാൽ എത്ര കിട്ടും",
    expectedTargetId: "market",
    description: "Rice selling price",
    category: "Market Prices",
  },

  // Weather Queries
  {
    query: "ഇന്നത്തെ കാലാവസ്ഥ എങ്ങനെയാണ്?",
    expectedTargetId: "weather",
    expectedSubAction: "current",
    description: "Today's weather",
    category: "Weather",
  },
  {
    query: "നാളെ മഴ ഉണ്ടോ",
    expectedTargetId: "weather",
    expectedSubAction: "forecast",
    description: "Tomorrow's rain forecast",
    category: "Weather",
  },
  {
    query: "കാലാവസ്ഥാ പ്രവചനം കാണിക്കുക",
    expectedTargetId: "weather",
    expectedSubAction: "forecast",
    description: "Weather forecast",
    category: "Weather",
  },
  {
    query: "കൊടുങ്കാറ്റ് വരുമോ",
    expectedTargetId: "weather",
    expectedSubAction: "alerts",
    description: "Storm alerts",
    category: "Weather",
  },

  // Expenses
  {
    query: "എത്ര ചെലവായി ഈ മാസം",
    expectedTargetId: "expense",
    description: "This month's expenses",
    category: "Expenses",
  },
  {
    query: "വളത്തിന് കൊടുത്ത പണം എത്ര",
    expectedTargetId: "expense",
    description: "Money spent on fertilizer",
    category: "Expenses",
  },
  {
    query: "കൃഷിക്ക് എത്ര ചെലവാക്കി",
    expectedTargetId: "expense",
    description: "Total farming expenses",
    category: "Expenses",
  },

  // Crop Recommendations
  {
    query: "വിള ശുപാർശകൾ കാണിക്കുക",
    expectedTargetId: "twin",
    expectedSubAction: "recommendations",
    description: "Show crop recommendations",
    category: "Recommendations",
  },
  {
    query: "ഈ സീസണിൽ എന്ത് വിള നടാം",
    expectedTargetId: "twin",
    expectedSubAction: "recommendations",
    description: "What crop to plant this season",
    category: "Recommendations",
  },
  {
    query: "എന്റെ പ്രദേശത്തിന് ഏത് വിളയാണ് നല്ലത്",
    expectedTargetId: "twin",
    expectedSubAction: "recommendations",
    description: "Best crop for my region",
    category: "Recommendations",
  },

  // Knowledge/Learning
  {
    query: "കീടങ്ങളെ എങ്ങനെ നിയന്ത്രിക്കാം",
    expectedTargetId: "knowledge",
    description: "How to control pests",
    category: "Knowledge",
  },
  {
    query: "വീട്ടിലെ പരിഹാരങ്ങൾ",
    expectedTargetId: "knowledge",
    description: "Home remedies",
    category: "Knowledge",
  },
  {
    query: "എങ്ങനെ കൃഷി ചെയ്യാം",
    expectedTargetId: "knowledge",
    description: "How to farm",
    category: "Knowledge",
  },
  {
    query: "മണ്ണ് പരിശോധന വീട്ടിൽ",
    expectedTargetId: "knowledge",
    description: "Soil testing at home",
    category: "Knowledge",
  },

  // Forum/Community
  {
    query: "കമ്യൂണിറ്റിയോട് ചോദിക്കുക",
    expectedTargetId: "forum",
    description: "Ask community",
    category: "Forum",
  },
  {
    query: "കർഷക ചർച്ച",
    expectedTargetId: "forum",
    description: "Farmer discussion",
    category: "Forum",
  },
  {
    query: "മറ്റു കർഷകരോട് ചോദിക്കുക",
    expectedTargetId: "forum",
    description: "Ask other farmers",
    category: "Forum",
  },

  // Shopping/Buy
  {
    query: "വിത്ത് വാങ്ങുക",
    expectedTargetId: "buy",
    description: "Buy seeds",
    category: "Shopping",
  },
  {
    query: "കൃഷി സാമഗ്രികൾ ഓർഡർ ചെയ്യുക",
    expectedTargetId: "buy",
    description: "Order farming supplies",
    category: "Shopping",
  },
  {
    query: "വളം വാങ്ങാൻ",
    expectedTargetId: "buy",
    description: "Buy fertilizer",
    category: "Shopping",
  },

  // Pest Scanning
  {
    query: "കീടം സ്കാൻ ചെയ്യുക",
    expectedTargetId: "scan",
    description: "Scan pest",
    category: "Scanning",
  },
  {
    query: "ക്യാമറ കൊണ്ട് പ്രാണി കണ്ടെത്തുക",
    expectedTargetId: "scan",
    description: "Detect insect with camera",
    category: "Scanning",
  },
  {
    query: "എന്ത് കീടമാണ് ഇത്",
    expectedTargetId: "scan",
    description: "What pest is this",
    category: "Scanning",
  },

  // Navigation
  {
    query: "പ്രൊഫൈൽ കാണിക്കുക",
    expectedTargetId: "profile",
    description: "Show profile",
    category: "Navigation",
  },
  {
    query: "ഹോമിലേക്ക് പോകാം",
    expectedTargetId: "home",
    description: "Go to home",
    category: "Navigation",
  },
  {
    query: "വാർത്തകൾ",
    expectedTargetId: "news",
    description: "News",
    category: "Navigation",
  },

  // News
  {
    query: "കാർഷിക വാർത്തകൾ",
    expectedTargetId: "news",
    description: "Agriculture news",
    category: "News",
  },
  {
    query: "ഇന്നത്തെ കൃഷി വാർത്തകൾ",
    expectedTargetId: "news",
    description: "Today's farming news",
    category: "News",
  },

  // Planning
  {
    query: "കൃഷി പദ്ധതി",
    expectedTargetId: "planner",
    description: "Farming plan",
    category: "Planning",
  },
  {
    query: "വിളയുടെ ഷെഡ്യൂൾ",
    expectedTargetId: "planner",
    description: "Crop schedule",
    category: "Planning",
  },
];

/**
 * Run comprehensive Malayalam voice navigation tests
 */
export async function runMalayalamVoiceTests(): Promise<void> {
  console.log("🧪 Running Malayalam Voice Navigation Tests...\n");

  let totalTests = malayalamTestCases.length;
  let passedTests = 0;
  let failedTests = 0;

  const results: {
    [category: string]: { passed: number; failed: number; total: number };
  } = {};

  for (const testCase of malayalamTestCases) {
    try {
      // Set language to Malayalam for context
      const result = await routeFromTranscript(testCase.query, "malayalam");

      let passed = false;
      let reason = "";

      if (result.targetId === testCase.expectedTargetId) {
        if (testCase.expectedSubAction) {
          if (result.subAction === testCase.expectedSubAction) {
            passed = true;
          } else {
            reason = `Expected subAction: ${testCase.expectedSubAction}, got: ${result.subAction}`;
          }
        } else {
          passed = true;
        }
      } else {
        reason = `Expected targetId: ${testCase.expectedTargetId}, got: ${result.targetId}`;
      }

      // Update category results
      if (!results[testCase.category]) {
        results[testCase.category] = { passed: 0, failed: 0, total: 0 };
      }
      results[testCase.category].total++;

      if (passed) {
        passedTests++;
        results[testCase.category].passed++;
        console.log(
          `✅ PASS: "${testCase.query}" → ${testCase.expectedTargetId}${testCase.expectedSubAction ? `/${testCase.expectedSubAction}` : ""}`
        );
      } else {
        failedTests++;
        results[testCase.category].failed++;
        console.log(
          `❌ FAIL: "${testCase.query}" → Expected: ${testCase.expectedTargetId}${testCase.expectedSubAction ? `/${testCase.expectedSubAction}` : ""}, Got: ${result.targetId}${result.subAction ? `/${result.subAction}` : ""}`
        );
        console.log(`   Reason: ${reason}`);
      }
    } catch (error) {
      failedTests++;
      if (!results[testCase.category]) {
        results[testCase.category] = { passed: 0, failed: 0, total: 0 };
      }
      results[testCase.category].failed++;
      results[testCase.category].total++;
      console.log(`❌ ERROR: "${testCase.query}" → ${error}`);
    }
  }

  // Print summary by category
  console.log("\n📊 TEST RESULTS BY CATEGORY:");
  console.log("=".repeat(50));

  Object.entries(results).forEach(([category, stats]) => {
    const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(
      `${category}: ${stats.passed}/${stats.total} (${successRate}%) ✅${stats.passed} ❌${stats.failed}`
    );
  });

  console.log("\n🎯 OVERALL TEST SUMMARY:");
  console.log("=".repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(
    `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  if (passedTests === totalTests) {
    console.log("\n🎉 All Malayalam voice navigation tests passed!");
  } else {
    console.log(
      "\n⚠️  Some tests failed. Check the implementation for improvements."
    );
  }
}

// Example usage for testing individual queries
export async function testMalayalamQuery(
  query: string,
  language: string = "malayalam"
): Promise<void> {
  console.log(`\n🧪 Testing: "${query}"`);
  console.log(`Language: ${language}`);

  try {
    const result = await routeFromTranscript(query, language);
    console.log("📍 Result:", {
      targetId: result.targetId,
      subAction: result.subAction || "none",
      confidence: result.confidence || "unknown",
      action: result.action || "navigate",
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run tests if called directly
if (require.main === module) {
  runMalayalamVoiceTests().catch(console.error);
}
