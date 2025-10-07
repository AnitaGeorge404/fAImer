# Offline AI Configuration

This project includes an offline AI system that provides farming assistance even without internet connectivity. The system uses Hugging Face's Transformers.js with the LaMini-Flan-T5-77M model.

## Configuration

### Environment Variables

Create a `.env.local` file in the project root to configure the offline AI behavior:

```bash
# Disable offline model during development (recommended)
VITE_ENABLE_OFFLINE_MODEL=false

# Enable offline model (default)
# VITE_ENABLE_OFFLINE_MODEL=true

# Your Gemini API key for online functionality
VITE_GEMINI_API_KEY=your_api_key_here
```

### Development vs Production

**During Development:**

- Set `VITE_ENABLE_OFFLINE_MODEL=false` to avoid model download issues
- The system will provide contextual fallback responses
- Faster startup and testing

**In Production:**

- Set `VITE_ENABLE_OFFLINE_MODEL=true` or omit the variable
- The model will download once and be cached for offline use
- Full offline AI capabilities

## How It Works

### Online Mode

- Uses Google Gemini API for enhanced AI responses
- Provides detailed, context-aware farming advice
- Supports multiple languages (English, Malayalam, etc.)

### Offline Mode (when enabled)

- Downloads and caches Hugging Face model (~77MB)
- Provides basic farming assistance without internet
- Falls back to contextual responses if model fails

### Hybrid Mode

- Automatically switches between online/offline based on connectivity
- Shows user notifications about current mode
- Graceful fallbacks ensure system never breaks

## Troubleshooting

### Model Download Issues

If you see HTML parsing errors during development:

1. **Disable offline model:**

   ```bash
   echo "VITE_ENABLE_OFFLINE_MODEL=false" > .env.local
   ```

2. **Restart development server:**

   ```bash
   npm run dev
   ```

3. **For production, ensure proper CORS and model access**

### Error: "Offline model is disabled"

This is expected behavior when `VITE_ENABLE_OFFLINE_MODEL=false`. The system will:

- Use contextual fallback responses instead of loading the model
- Provide farming advice based on keyword detection
- Show "offline mode" status in the UI
- Work perfectly for development and testing

### Performance Considerations

- **First Load:** Model downloads once (~77MB)
- **Subsequent Loads:** Cached locally, instant access
- **Memory Usage:** ~200MB when model is active
- **Response Time:** 1-3 seconds for offline generation

## Implementation Details

### Key Files

- `src/lib/offlineAI.ts` - Offline model loading and generation
- `src/lib/unifiedAI.ts` - Unified online/offline AI interface
- `src/components/FarmerAssistantScreen.tsx` - Main chat interface
- `public/sw.js` - Service worker for model caching

### Fallback Responses

When offline model fails, the system provides contextual responses for:

- Crop management questions
- Pest and disease control
- Weather and irrigation planning
- Fertilizer and nutrient advice
- General farming guidance

## Testing

### Force Offline Mode

```javascript
const response = await getAIResponse("How to grow tomatoes?", {
  forceOffline: true,
});
```

### Check Model Status

```javascript
import { isOfflineModelAvailable } from "./lib/offlineAI";
console.log("Model available:", isOfflineModelAvailable());
```

## Security & Privacy

- All model processing happens locally in the browser
- No farming data sent to external servers when offline
- Model files cached locally for privacy
- Gemini API used only when online and explicitly enabled
