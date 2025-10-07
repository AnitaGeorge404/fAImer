# Enhanced Agentic Voice Navigation System

## Overview

This is a comprehensive, AI-powered voice navigation system for the fAImer agricultural app. It uses natural language processing with Google's Gemini AI to understand user intent and navigate to the correct features, tabs, and popups within the app.

## Key Features

### 🤖 Agentic AI Navigation

- **Gemini AI Integration**: Uses Google's Gemini 2.0 Flash model for advanced natural language understanding
- **Intent Recognition**: Understands the underlying need behind what users say, not just keywords
- **Context Awareness**: Recognizes patterns like plant disease symptoms, expense queries, market price requests, etc.

### 🌐 Multilingual Support

Supports 8 Indian languages with natural speech recognition:

- English
- Hindi (हिंदी)
- Malayalam (മലയാളം)
- Kannada (ಕನ್ನಡ)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Marathi (मराठी)
- Bengali (বাংলা)

### 🎯 Sub-Action Navigation

Goes beyond simple screen navigation to handle:

- **Tabs within features** (e.g., "recommendations" tab in Farming Twin)
- **Popups and modals** (e.g., current weather popup)
- **Specific functionality** within screens

### 🔄 Robust Fallback System

- **Online-First**: Uses Gemini AI for best results
- **Offline Fallback**: Local keyword matching when AI is unavailable
- **Graceful Degradation**: Always provides a response, routing complex queries to chatbot

## Architecture

### Core Components

1. **VoiceDecision Interface**

```typescript
export type VoiceDecision = {
  action: "navigate" | "chat" | "weather" | "popup" | "tab";
  targetId: string | null;
  subAction?: string; // NEW: specific tab/popup/functionality
  confidence: number;
  reason?: string;
  language?: string;
  queryNormalized?: string;
};
```

2. **Feature Knowledge Base**

- Comprehensive mapping of app features
- Natural language examples in multiple languages
- Sub-actions for features with tabs/popups
- Context patterns for different user intents

3. **Enhanced Routing Logic**

- Handles navigate, weather, chat, popup, and tab actions
- Special sub-action processing for complex features
- Intelligent fallback to chatbot for ambiguous queries

## Usage Examples

### Basic Navigation

```
User: "go home" → Home screen
User: "open profile" → Profile screen
User: "ഹോം" → Home screen (Malayalam)
```

### Sub-Action Navigation

```
User: "show me crop recommendations" → Twin screen, Recommendations tab
User: "വിള ശുപാർശകൾ കാണിക്കുക" → Twin screen, Recommendations tab (Malayalam)
User: "open farming twin" → Twin screen, main dashboard
```

### Weather Queries

```
User: "what's the weather today" → Weather popup, current weather
User: "weather forecast tomorrow" → Weather popup, forecast view
User: "any storm alerts" → Weather popup, alerts view
User: "ഇന്നത്തെ കാലാവസ്ഥ" → Weather popup, current weather (Malayalam)
```

### Natural Disease Queries

```
User: "my tomato plant has yellow spots" → Crop Diagnosis screen
User: "something is wrong with my leaves" → Crop Diagnosis screen
User: "എന്റെ തക്കാളിയിൽ പുള്ളികൾ" → Crop Diagnosis screen (Malayalam)
```

### Complex Queries (Routed to Chatbot)

```
User: "help me plan my entire farming season" → Chatbot with initial question
User: "I need advice on multiple topics" → Chatbot
```

## Implementation Details

### Voice Recognition Setup

```typescript
const getLanguageLocale = (langCode: string): string => {
  const localeMap = {
    en: "en-IN",
    hi: "hi-IN",
    ml: "ml-IN",
    kn: "kn-IN",
    ta: "ta-IN",
    te: "te-IN",
    mr: "mr-IN",
    bn: "bn-IN",
  };
  return localeMap[langCode] || "en-IN";
};
```

### Enhanced Navigation Handler

```typescript
const handleVoiceNavigation = async (decision: VoiceDecision) => {
  switch (decision.action) {
    case "navigate":
      // Handle sub-actions for specific features
      if (
        decision.targetId === "twin" &&
        decision.subAction === "recommendations"
      ) {
        onRecommendationsClick(); // Navigate to recommendations tab
      }
      break;
    case "weather":
      // Handle weather sub-actions (current/forecast/alerts)
      break;
    case "chat":
      // Route to chatbot with context
      break;
  }
};
```

## Feature Mappings

### Main Features

- **home**: Dashboard and main screen
- **twin**: Farming Twin (digital farm simulation)
  - Sub-actions: `twin`, `recommendations`
- **profile**: User profile and settings
- **diagnose**: Crop disease diagnosis
- **market**: Market prices and trends
- **planner**: Crop planning and calendar
- **weather**: Weather information
  - Sub-actions: `current`, `forecast`, `alerts`
- **forum**: Farmer community discussions
- **knowledge**: Learning center and guides
- **buy**: Input purchasing (seeds, fertilizers)
- **scan**: Pest scanning with camera
- **expense**: Expense tracking
- **news**: Agriculture news
- **schemes**: Government schemes
- **labourers**: Labour hub
- **fairfarm**: Direct farmer marketplace
- **notifications**: Alerts and notifications

## Error Handling

1. **API Failures**: Falls back to offline keyword matching
2. **Ambiguous Queries**: Routes to chatbot for clarification
3. **No Match Found**: Default fallback to chatbot
4. **Voice Recognition Errors**: User-friendly error messages

## Testing

Use the test file `src/tests/voiceNavigationTest.ts`:

```typescript
import { testVoiceCommand } from "./tests/voiceNavigationTest";

// Test single command
await testVoiceCommand("show me crop recommendations");
await testVoiceCommand("വിള ശുപാർശകൾ കാണിക്കുക", "ml");

// Run full test suite
await runVoiceNavigationTests();
```

## Future Enhancements

1. **More Sub-Actions**: Add support for more granular navigation within screens
2. **Voice Responses**: Add speech synthesis for confirmations
3. **Learning System**: Improve recognition based on user patterns
4. **Offline AI**: Local AI models for better offline functionality
5. **Voice Shortcuts**: Custom voice commands for frequent actions

## Configuration

### Gemini API Key

Set in environment variables:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Language Priority

The system uses the user's selected language for:

- Speech recognition locale
- Response localization
- Intent matching priority

## Troubleshooting

### Common Issues

1. **Voice not recognized**: Check microphone permissions and browser support
2. **Wrong navigation**: May need to add more examples to knowledge base
3. **AI offline**: System automatically falls back to keyword matching

### Debug Information

Enable detailed logging by checking browser console for:

- `🎤 Voice routing request`
- `🤖 Calling Gemini API`
- `✅ Gemini provided decision`
- `🎯 Voice decision received`

## Conclusion

This enhanced voice navigation system provides a robust, intelligent, and user-friendly way to navigate the fAImer app using natural language in multiple Indian languages. It handles complex navigation patterns, provides appropriate fallbacks, and ensures users can always reach their intended destination or get help through the chatbot.
