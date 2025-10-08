/**
 * Google Translate Integration Utility
 * Provides programmatic control over Google Translate widget
 */

// Language code mapping for Google Translate
export const GOOGLE_TRANSLATE_LANGUAGES = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
} as const;

export type GoogleTranslateLanguageCode =
  keyof typeof GOOGLE_TRANSLATE_LANGUAGES;

/**
 * Auto-translate the page to the specified language using Google Translate
 * @param langCode - Language code (e.g., 'ta' for Tamil, 'hi' for Hindi)
 */
export function autoTranslateTo(langCode: GoogleTranslateLanguageCode): void {
  try {
    // Check if Google Translate is loaded
    if (!window.google || !(window.google as any).translate) {
      console.warn("Google Translate is not loaded yet");
      return;
    }

    // Find the Google Translate iframe
    const frame = document.querySelector(
      "iframe.goog-te-menu-frame"
    ) as HTMLIFrameElement;
    if (!frame) {
      console.warn("Google Translate iframe not found");
      return;
    }

    // Access the iframe's document
    const frameDoc = frame.contentDocument || frame.contentWindow?.document;
    if (!frameDoc) {
      console.warn("Cannot access Google Translate iframe document");
      return;
    }

    // Find the language button in the translate menu
    const langButtons = Array.from(
      frameDoc.querySelectorAll(".goog-te-menu2-item span.text")
    );

    const langBtn = langButtons.find((el) => {
      const text = (el as HTMLElement).innerText;
      return text.toLowerCase().includes(langCode.toLowerCase());
    });

    if (langBtn) {
      (langBtn as HTMLElement).click();
      console.log(`Translated page to ${GOOGLE_TRANSLATE_LANGUAGES[langCode]}`);
    } else {
      console.warn(`Language button for '${langCode}' not found`);
    }
  } catch (error) {
    console.error("Error during auto-translation:", error);
  }
}

/**
 * Reset translation to original language (English)
 */
export function resetTranslation(): void {
  try {
    if (!window.google || !(window.google as any).translate) {
      return;
    }

    const frame = document.querySelector(
      "iframe.goog-te-menu-frame"
    ) as HTMLIFrameElement;
    if (!frame) return;

    const frameDoc = frame.contentDocument || frame.contentWindow?.document;
    if (!frameDoc) return;

    // Click the "Show original" button or English option
    const originalBtn = frameDoc.querySelector(
      ".goog-te-menu2-item .goog-te-menu2-item-selected"
    );
    if (originalBtn) {
      (originalBtn as HTMLElement).click();
    } else {
      // Fallback: try to find and click English
      autoTranslateTo("en");
    }
  } catch (error) {
    console.error("Error resetting translation:", error);
  }
}

/**
 * Check if Google Translate is ready
 */
export function isGoogleTranslateReady(): boolean {
  return !!(window.google && (window.google as any).translate);
}

/**
 * Wait for Google Translate to be ready
 * @param timeout - Maximum wait time in milliseconds (default: 5000)
 */
export function waitForGoogleTranslate(
  timeout: number = 5000
): Promise<boolean> {
  return new Promise((resolve) => {
    if (isGoogleTranslateReady()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isGoogleTranslateReady()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Get the current active translation language
 */
export function getCurrentTranslationLanguage(): string | null {
  try {
    const frame = document.querySelector(
      "iframe.goog-te-menu-frame"
    ) as HTMLIFrameElement;
    if (!frame) return null;

    const frameDoc = frame.contentDocument || frame.contentWindow?.document;
    if (!frameDoc) return null;

    const selectedItem = frameDoc.querySelector(
      ".goog-te-menu2-item-selected span.text"
    );
    if (selectedItem) {
      const text = (selectedItem as HTMLElement).innerText.toLowerCase();
      // Match against our language codes
      for (const [code, name] of Object.entries(GOOGLE_TRANSLATE_LANGUAGES)) {
        if (text.includes(code) || text.includes(name.toLowerCase())) {
          return code;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting current translation language:", error);
    return null;
  }
}

// Declare global window types for Google Translate
declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}
