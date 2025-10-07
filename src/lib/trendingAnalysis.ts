import { supabase } from "./supabase";
import type { Alert, Post } from "./supabase";

export interface TrendingAlert {
  id: string;
  type: "Community Alert" | "Critical Issue" | "Regional Warning";
  title: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  date: string;
  icon: any; // Will be set dynamically based on type
  bgColor: string;
  borderColor: string;
  textColor: string;
  locations: string[];
  alertCount: number;
  affectedFarmers: number;
  trendScore: number;
}

export interface TrendingIssue {
  keyword: string;
  category: string;
  count: number;
  locations: string[];
  severity: "High" | "Medium" | "Low";
  lastReported: string;
  averageVotes: number;
  urgencyLevel: "high" | "medium" | "low";
}

// Keywords and patterns to identify critical farming issues
const CRITICAL_KEYWORDS = {
  pests: [
    "aphid",
    "aphids",
    "pest attack",
    "insect",
    "bug",
    "locust",
    "locusts", // ✅ Added missing plural form
    "locust attack", // ✅ Added specific phrase
    "locusts attack", // ✅ Added your exact phrase
    "swarm", // ✅ Added for locust swarms
    "caterpillar",
    "brown plant hopper",
    "whitefly",
    "thrips",
    "bollworm",
    "armyworm",
  ],
  diseases: [
    "blight",
    "wilt",
    "rust",
    "rot",
    "mildew",
    "fungus",
    "disease",
    "infection",
    "bacterial",
    "viral",
    "leaf spot",
    "crown rot",
    "root rot",
  ],
  weather: [
    "drought",
    "flood",
    "heavy rain",
    "hail",
    "storm",
    "cyclone",
    "heat wave",
    "cold wave",
    "frost",
    "waterlogging",
    "excessive rainfall",
  ],
  market: [
    "price drop",
    "price fall",
    "market crash",
    "low price",
    "price decline",
    "selling difficulty",
    "buyer shortage",
    "export ban",
  ],
  resources: [
    "water shortage",
    "fertilizer shortage",
    "seed shortage",
    "labour shortage",
    "equipment failure",
    "power cut",
    "fuel shortage",
  ],
};

const LOCATION_KEYWORDS = [
  "Punjab",
  "Haryana",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Rajasthan",
  "Gujarat",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Telangana",
  "Kerala",
  "West Bengal",
  "Bihar",
  "Odisha",
  "Jharkhand",
  "Chhattisgarh",
  "Assam",
  "National",
  "Regional",
];

// Severity thresholds - Made more sensitive for real-world usage
const SEVERITY_THRESHOLDS = {
  HIGH: { minCount: 3, minScore: 15, minUrgency: "high" }, // ✅ Lowered from 5 to 3
  MEDIUM: { minCount: 2, minScore: 8, minUrgency: "medium" }, // ✅ Lowered thresholds
  LOW: { minCount: 1, minScore: 3, minUrgency: "low" }, // ✅ More sensitive
};

export class TrendingAnalyzer {
  // Analyze alerts from farmer forum to find trending issues
  static async analyzeTrendingIssues(): Promise<TrendingIssue[]> {
    try {
      console.log("🔍 Starting trending analysis...");

      // Get recent alerts (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: alerts, error } = await supabase
        .from("alerts")
        .select("*")
        .gte("created_at", weekAgo.toISOString())
        .order("created_at", { ascending: false });

      if (error || !alerts) {
        console.error("❌ Error fetching alerts:", error);
        return [];
      }

      console.log(`📊 Found ${alerts.length} recent alerts`);
      console.log("📋 Alert data:", alerts);

      // Group and analyze issues
      const issueMap = new Map<string, TrendingIssue>();

      for (const alert of alerts) {
        console.log(`\n🔎 Analyzing alert: "${alert.title}"`);
        console.log(`Location: ${alert.location}, Urgency: ${alert.urgency}`);

        const issues = this.extractIssues(alert);
        console.log(`🎯 Extracted issues:`, issues);

        for (const issue of issues) {
          const key = `${issue.keyword}-${issue.category}`;
          console.log(`🔑 Issue key: ${key}`);

          if (issueMap.has(key)) {
            const existing = issueMap.get(key)!;
            existing.count += 1;
            existing.locations = [
              ...new Set([...existing.locations, alert.location]),
            ];
            existing.averageVotes =
              (existing.averageVotes + (alert.likes - alert.dislikes)) / 2;

            // Update severity based on urgency and votes
            const currentSeverity = this.calculateSeverity(
              existing.count,
              existing.averageVotes,
              alert.urgency
            );
            if (this.isHigherSeverity(currentSeverity, existing.severity)) {
              existing.severity = currentSeverity;
            }

            console.log(
              `📈 Updated existing issue - Count: ${existing.count}, Locations: ${existing.locations.join(", ")}`
            );
          } else {
            const newIssue = {
              keyword: issue.keyword,
              category: issue.category,
              count: 1,
              locations: [alert.location],
              severity: this.calculateSeverity(
                1,
                alert.likes - alert.dislikes,
                alert.urgency
              ),
              lastReported: alert.created_at,
              averageVotes: alert.likes - alert.dislikes,
              urgencyLevel: alert.urgency,
            };
            issueMap.set(key, newIssue);
            console.log(`🆕 Created new issue:`, newIssue);
          }
        }
      }

      console.log(`\n📊 Total unique issues found: ${issueMap.size}`);

      // Convert to array and sort by trending score
      const trendingIssues = Array.from(issueMap.values());

      // Calculate trend scores and filter significant issues
      const scoredIssues = trendingIssues
        .map((issue) => {
          const trendScore = this.calculateTrendScore(issue);
          const issueWithScore = { ...issue, trendScore };
          const isSignificant = this.isSignificantIssue(issue);

          console.log(`\n📊 Issue: ${issue.keyword}`);
          console.log(
            `   Count: ${issue.count}, Locations: ${issue.locations.length}`
          );
          console.log(
            `   Severity: ${issue.severity}, Trend Score: ${trendScore}`
          );
          console.log(
            `   Is Significant: ${isSignificant ? "✅ YES" : "❌ NO"}`
          );

          return issueWithScore;
        })
        .filter((issue) => this.isSignificantIssue(issue))
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, 10); // Top 10 trending issues

      console.log(`\n🔥 Final trending issues: ${scoredIssues.length}`);
      console.log("🎯 Top trending issues:", scoredIssues);

      return scoredIssues;
    } catch (error) {
      console.error("❌ Error analyzing trending issues:", error);
      return [];
    }
  }

  // Generate announcement from trending issue
  static generateAnnouncementFromIssue(
    issue: TrendingIssue,
    currentLanguage: string = "en"
  ): TrendingAlert {
    const now = new Date();
    const issueAge = Math.floor(
      (now.getTime() - new Date(issue.lastReported).getTime()) /
        (1000 * 60 * 60)
    );

    const timeAgo =
      issueAge < 1
        ? "just now"
        : issueAge < 24
          ? `${issueAge} hours ago`
          : `${Math.floor(issueAge / 24)} days ago`;

    const locationText =
      issue.locations.length > 3
        ? `${issue.locations.slice(0, 3).join(", ")} +${issue.locations.length - 3} more`
        : issue.locations.join(", ");

    // Generate title and description based on category and language
    const titles = this.generateTitleAndDescription(
      issue,
      currentLanguage,
      locationText
    );

    const colors = this.getSeverityColors(issue.severity);

    return {
      id: `trending-${issue.category}-${Date.now()}`,
      type:
        issue.severity === "High"
          ? "Critical Issue"
          : issue.locations.length > 2
            ? "Regional Warning"
            : "Community Alert",
      title: titles.title,
      description: titles.description,
      severity: issue.severity,
      date: timeAgo,
      icon: this.getCategoryIcon(issue.category),
      ...colors,
      locations: issue.locations,
      alertCount: issue.count,
      affectedFarmers: issue.count * 2, // Estimate
      trendScore: this.calculateTrendScore(issue),
    };
  }

  // Extract potential issues from alert text
  private static extractIssues(
    alert: Alert
  ): Array<{ keyword: string; category: string }> {
    const issues: Array<{ keyword: string; category: string }> = [];
    const searchText = `${alert.title} ${alert.description}`.toLowerCase();

    console.log(`🔍 Searching in text: "${searchText}"`);

    // Check each category for keywords
    for (const [category, keywords] of Object.entries(CRITICAL_KEYWORDS)) {
      for (const keyword of keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          console.log(
            `✅ Found keyword "${keyword}" in category "${category}"`
          );
          issues.push({ keyword, category });

          // For locusts, also add a normalized version
          if (keyword.includes("locust")) {
            issues.push({ keyword: "locusts attack", category });
          }
        }
      }
    }

    console.log(`🎯 Total extracted issues: ${issues.length}`);
    return issues;
  }

  // Calculate severity based on multiple factors
  private static calculateSeverity(
    count: number,
    votes: number,
    urgency: string
  ): "High" | "Medium" | "Low" {
    const urgencyWeight = urgency === "high" ? 3 : urgency === "medium" ? 2 : 1;
    const score = count * 2 + votes * 0.5 + urgencyWeight * 5;

    if (score >= 20) return "High";
    if (score >= 10) return "Medium";
    return "Low";
  }

  // Calculate trending score
  private static calculateTrendScore(issue: TrendingIssue): number {
    const severityWeight =
      issue.severity === "High" ? 3 : issue.severity === "Medium" ? 2 : 1;
    const locationWeight = Math.min(issue.locations.length, 5); // Cap at 5
    const timeWeight = this.getTimeWeight(issue.lastReported);
    const voteWeight = Math.max(issue.averageVotes, 0) * 0.1;

    return (
      issue.count * 10 +
      severityWeight * 5 +
      locationWeight * 3 +
      timeWeight * 2 +
      voteWeight
    );
  }

  // Check if issue is significant enough to show
  private static isSignificantIssue(issue: TrendingIssue): boolean {
    const threshold =
      SEVERITY_THRESHOLDS[
        issue.severity.toUpperCase() as keyof typeof SEVERITY_THRESHOLDS
      ];
    return (
      issue.count >= threshold.minCount &&
      this.calculateTrendScore(issue) >= threshold.minScore
    );
  }

  // Get time-based weight (recent issues get higher weight)
  private static getTimeWeight(timestamp: string): number {
    const now = new Date();
    const reported = new Date(timestamp);
    const hoursAgo = (now.getTime() - reported.getTime()) / (1000 * 60 * 60);

    if (hoursAgo < 6) return 10; // Very recent
    if (hoursAgo < 24) return 7; // Recent
    if (hoursAgo < 72) return 5; // Somewhat recent
    return 2; // Older
  }

  // Compare severity levels
  private static isHigherSeverity(newSev: string, currentSev: string): boolean {
    const levels = { High: 3, Medium: 2, Low: 1 };
    return (
      levels[newSev as keyof typeof levels] >
      levels[currentSev as keyof typeof levels]
    );
  }

  // Generate localized titles and descriptions
  private static generateTitleAndDescription(
    issue: TrendingIssue,
    lang: string,
    locations: string
  ) {
    const templates = {
      en: {
        pests: {
          title: `${issue.keyword.charAt(0).toUpperCase() + issue.keyword.slice(1)} Alert`,
          desc: `Multiple reports of ${issue.keyword} in ${locations}. ${issue.count} farmers affected. Take immediate protective measures.`,
        },
        diseases: {
          title: `${issue.keyword.charAt(0).toUpperCase() + issue.keyword.slice(1)} Outbreak`,
          desc: `${issue.keyword} reported across ${locations}. ${issue.count} cases confirmed. Apply treatment protocols immediately.`,
        },
        weather: {
          title: `${issue.keyword.charAt(0).toUpperCase() + issue.keyword.slice(1)} Warning`,
          desc: `${issue.keyword} affecting ${locations}. ${issue.count} areas impacted. Protect crops and livestock.`,
        },
        market: {
          title: `Market Alert: ${issue.keyword.charAt(0).toUpperCase() + issue.keyword.slice(1)}`,
          desc: `${issue.keyword} reported in ${locations}. ${issue.count} farmers experiencing issues. Consider alternative markets.`,
        },
        resources: {
          title: `Resource Alert: ${issue.keyword.charAt(0).toUpperCase() + issue.keyword.slice(1)}`,
          desc: `${issue.keyword} affecting ${locations}. ${issue.count} reports received. Plan accordingly.`,
        },
      },
      ml: {
        pests: {
          title: `${issue.keyword} മുന്നറിയിപ്പ്`,
          desc: `${locations} പ്രദേശങ്ങളിൽ ${issue.keyword} ആക്രമണം. ${issue.count} കർഷകർ ബാധിതർ. ഉടനടി സംരക്ഷണ നടപടികൾ എടുക്കുക.`,
        },
        diseases: {
          title: `${issue.keyword} പകർച്ചവ്യാധി`,
          desc: `${locations} പ്രദേശങ്ങളിൽ ${issue.keyword} റിപ്പോർട്ട്. ${issue.count} കേസുകൾ സ്ഥിരീകരിച്ചു. ഉടനടി ചികിത്സ നടപടികൾ സ്വീകരിക്കുക.`,
        },
        weather: {
          title: `${issue.keyword} മുന്നറിയിപ്പ്`,
          desc: `${locations} പ്രദേശങ്ങളെ ${issue.keyword} ബാധിക്കുന്നു. ${issue.count} പ്രദേശങ്ങളിൽ സ്വാധീനം. വിളകളും കന്നുകാലികളും സംരക്ഷിക്കുക.`,
        },
        market: {
          title: `മാർക്കറ്റ് അലേർട്ട്: ${issue.keyword}`,
          desc: `${locations} പ്രദേശങ്ങളിൽ ${issue.keyword} റിപ്പോർട്ട്. ${issue.count} കർഷകർക്ക് പ്രശ്നം. ബദൽ വിപണികൾ പരിഗണിക്കുക.`,
        },
        resources: {
          title: `റിസോഴ്സ് അലേർട്ട്: ${issue.keyword}`,
          desc: `${locations} പ്രദേശങ്ങളെ ${issue.keyword} ബാധിക്കുന്നു. ${issue.count} റിപ്പോർട്ടുകൾ ലഭിച്ചു. അനുസരിച്ച് ആസൂത്രണം ചെയ്യുക.`,
        },
      },
    };

    const template =
      templates[lang as keyof typeof templates]?.[
        issue.category as keyof typeof templates.en
      ] ||
      templates.en[issue.category as keyof typeof templates.en] ||
      templates.en.pests;

    return {
      title: template.title,
      description: template.desc,
    };
  }

  // Get severity-based colors
  private static getSeverityColors(severity: string) {
    switch (severity) {
      case "High":
        return {
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-700 dark:text-red-300",
        };
      case "Medium":
        return {
          bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          textColor: "text-yellow-700 dark:text-yellow-300",
        };
      default:
        return {
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-700 dark:text-blue-300",
        };
    }
  }

  // Get category-appropriate icon (placeholder - will be set in component)
  private static getCategoryIcon(category: string) {
    // This will be mapped to actual icons in the component
    return category;
  }
}
