// Test file to verify trending analysis works
// Run this to test the trending functionality

import { TrendingAnalyzer } from "./src/lib/trendingAnalysis.ts";

async function testTrendingAnalysis() {
  console.log("🔍 Testing Trending Analysis System...");

  try {
    // Test the analysis
    const issues = await TrendingAnalyzer.analyzeTrendingIssues();
    console.log(`✅ Found ${issues.length} trending issues:`, issues);

    // Test announcement generation
    if (issues.length > 0) {
      const announcement = TrendingAnalyzer.generateAnnouncementFromIssue(
        issues[0],
        "en"
      );
      console.log("📢 Generated announcement:", announcement);
    } else {
      console.log("ℹ️  No trending issues found (no recent forum alerts)");
    }
  } catch (error) {
    console.error("❌ Error testing trending analysis:", error);
  }
}

// Only run if this file is executed directly
if (typeof window === "undefined") {
  testTrendingAnalysis();
}

export { testTrendingAnalysis };
