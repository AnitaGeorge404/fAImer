import React, { createContext, useContext, useState, useEffect } from "react";

interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};

interface TranslationProviderProps {
  children: React.ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem("selectedLanguage", language);
  };

  // Create a translations map with inline data to avoid Vite import issues
  const translations = {
    en: {
      welcome: "Welcome to Project Kisan",
      phone_login: "Phone Login",
      enter_phone: "Enter your phone number",
      send_otp: "Send OTP",
      verify_login: "Verify & Login",
      voice_recognition: "Voice Recognition",
      fingerprint_login: "Fingerprint Login",
      back_to_phone: "Back to Phone Number",
      enter_otp: "Enter the 6-digit OTP",
      having_trouble: "Having trouble? Try SMS login instead.",
      home: "Home",
      notifications: "Notifications",
      profile: "Profile",
      chatbot: "Assistant",
      twin: "Farm Twin",
      resources: "Resources",
      updates: "Updates",
      assistant_greeting:
        "Hello! I'm your AI farming assistant powered by Gemini. I can help you with crop management, pest control, weather advice, and general farming questions. How can I assist you today?",
      type_message: "Ask me anything about farming...",
      send: "Send",
      speak: "Voice input",
      listening: "Listening...",
      processing: "Processing...",
      mic_not_supported: "Microphone not supported in this browser",
      tts_not_supported: "Text-to-speech is not supported in this browser",
      tts_error: "Text-to-speech failed",
      api_error: "Sorry, I encountered an error. Please try again.",
      network_error:
        "Network error. Please check your internet connection and try again.",
      error: "Error",
    },
    hi: {
      welcome: "प्रोजेक्ट किसान में आपका स्वागत है",
      phone_login: "फोन लॉगिन",
      enter_phone: "अपना फोन नंबर दर्ज करें",
      send_otp: "ओटीपी भेजें",
      verify_login: "सत्यापन और लॉगिन",
      voice_recognition: "आवाज़ पहचान",
      fingerprint_login: "फिंगरप्रिंट लॉगिन",
      back_to_phone: "फोन नंबर पर वापस जाएं",
      enter_otp: "6-अंकीय ओटीपी दर्ज करें",
      having_trouble: "समस्या हो रही है? एसएमएस लॉगिन आज़माएं।",
      home: "होम",
      notifications: "सूचनाएं",
      profile: "प्रोफ़ाइल",
      chatbot: "सहायक",
      twin: "फार्म ट्विन",
      resources: "संसाधन",
      updates: "अपडेट",
    },
    bn: {
      welcome: "প্রকল্প কিষাণে আপনাকে স্বাগতম",
      phone_login: "ফোন লগিন",
      enter_phone: "আপনার ফোন নম্বর লিখুন",
      send_otp: "ওটিপি পাঠান",
      verify_login: "যাচাই করুন ও লগিন",
      voice_recognition: "ভয়েস রিকগনিশন",
      fingerprint_login: "ফিঙ্গারপ্রিন্ট লগিন",
      back_to_phone: "ফোন নম্বরে ফিরে যান",
      enter_otp: "৬-সংখ্যার ওটিপি লিখুন",
      having_trouble: "সমস্যা হচ্ছে? SMS লগিন চেষ্টা করুন।",
      home: "হোম",
      notifications: "বিজ্ঞপ্তি",
      profile: "প্রোফাইল",
      chatbot: "সহায়ক",
      twin: "ফার্ম টুইন",
      resources: "রিসোর্স",
      updates: "আপডেট",
    },
    ta: {
      welcome: "Welcome to Project Kisan",
      phone_login: "Phone Login",
      enter_phone: "Enter your phone number",
      send_otp: "Send OTP",
      verify_login: "Verify & Login",
      voice_recognition: "Voice Recognition",
      fingerprint_login: "Fingerprint Login",
      back_to_phone: "Back to Phone Number",
      enter_otp: "Enter the 6-digit OTP",
      having_trouble: "Having trouble? Try SMS login instead.",
      home: "Home",
      notifications: "Notifications",
      profile: "Profile",
      chatbot: "Assistant",
      twin: "Farm Twin",
      resources: "Resources",
      updates: "Updates",
    },
    te: {
      welcome: "Welcome to Project Kisan",
      phone_login: "Phone Login",
      enter_phone: "Enter your phone number",
      send_otp: "Send OTP",
      verify_login: "Verify & Login",
      voice_recognition: "Voice Recognition",
      fingerprint_login: "Fingerprint Login",
      back_to_phone: "Back to Phone Number",
      enter_otp: "Enter the 6-digit OTP",
      having_trouble: "Having trouble? Try SMS login instead.",
      home: "Home",
      notifications: "Notifications",
      profile: "Profile",
      chatbot: "Assistant",
      twin: "Farm Twin",
      resources: "Resources",
      updates: "Updates",
    },
    kn: {
      welcome: "Welcome to Project Kisan",
      phone_login: "Phone Login",
      enter_phone: "Enter your phone number",
      send_otp: "Send OTP",
      verify_login: "Verify & Login",
      voice_recognition: "Voice Recognition",
      fingerprint_login: "Fingerprint Login",
      back_to_phone: "Back to Phone Number",
      enter_otp: "Enter the 6-digit OTP",
      having_trouble: "Having trouble? Try SMS login instead.",
      home: "Home",
      notifications: "Notifications",
      profile: "Profile",
      chatbot: "Assistant",
      twin: "Farm Twin",
      resources: "Resources",
      updates: "Updates",
    },
    ml: {
      welcome: "പ്രോജക്ട് കിസാനിലേക്ക് സ്വാഗതം",
      phone_login: "ഫോൺ ലോഗിൻ",
      enter_phone: "നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക",
      send_otp: "OTP അയയ്ക്കുക",
      verify_login: "പരിശോധിച്ച് ലോഗിൻ ചെയ്യുക",
      voice_recognition: "വോയിസ് റെക്കഗ്നിഷൻ",
      fingerprint_login: "ഫിംഗർപ്രിന്റ് ലോഗിൻ",
      back_to_phone: "ഫോൺ നമ്പറിലേക്ക് മടങ്ങുക",
      enter_otp: "6-അക്ക OTP നൽകുക",
      having_trouble: "പ്രശ്നമുണ്ടോ? SMS ലോഗിൻ ശ്രമിക്കുക.",
      home: "ഹോം",
      notifications: "അറിയിപ്പുകൾ",
      profile: "പ്രൊഫൈൽ",
      chatbot: "സഹായി",
      twin: "ഫാം ട്വിൻ",
      resources: "റിസോഴ്സുകൾ",
      updates: "അപ്ഡേറ്റുകൾ",
      assistant_greeting:
        "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI കൃഷി സഹായി ആണ്. വിള പരിപാലനം, കീട നിയന്ത്രണം, കാലാവസ്ഥാ ഉപദേശം, പൊതു കൃഷി ചോദ്യങ്ങൾ എന്നിവയിൽ സഹായിക്കാൻ എനിക്ക് കഴിയും. ഇന്ന് എങ്ങനെ സഹായിക്കാം?",
      type_message: "സന്ദേശം ടൈപ്പ് ചെയ്യുക...",
      send: "അയയ്ക്കുക",
      speak: "സംസാരിക്കുക",
      listening: "കേൾക്കുന്നു...",
      processing: "പ്രോസസ്സിംഗ്...",
      mic_not_supported: "ഈ ബ്രൗസറിൽ മൈക്രോഫോൺ പിന്തുണയില്ല",
      tts_not_supported: "ഈ ബ്രൗസറിൽ ടെക്സ്റ്റ്-ടു-സ്പീച്ച് പിന്തുണയില്ല",
      tts_error: "ടെക്സ്റ്റ്-ടു-സ്പീച്ച് പ്രവർത്തിച്ചില്ല",
      api_error: "AI സേവനത്തിൽ പിശക്",
      network_error: "നെറ്റ്‌വർക്ക് പിശക്. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
      error: "പിശക്",
    },
    mr: {
      welcome: "Welcome to Project Kisan",
      phone_login: "Phone Login",
      enter_phone: "Enter your phone number",
      send_otp: "Send OTP",
      verify_login: "Verify & Login",
      voice_recognition: "Voice Recognition",
      fingerprint_login: "Fingerprint Login",
      back_to_phone: "Back to Phone Number",
      enter_otp: "Enter the 6-digit OTP",
      having_trouble: "Having trouble? Try SMS login instead.",
      home: "Home",
      notifications: "Notifications",
      profile: "Profile",
      chatbot: "Assistant",
      twin: "Farm Twin",
      resources: "Resources",
      updates: "Updates",
    },
  };

  const t = (key: string): string => {
    const currentTranslations =
      translations[currentLanguage as keyof typeof translations] ||
      translations.en;
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};
