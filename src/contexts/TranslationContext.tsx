import React, { createContext, useContext, useState, useEffect } from "react";

// Import translation files
import enTranslations from "../translations/en.json";
import hiTranslations from "../translations/hi.json";
import mlTranslations from "../translations/ml.json";
import taTranslations from "../translations/ta.json";
import teTranslations from "../translations/te.json";
import knTranslations from "../translations/kn.json";
import mrTranslations from "../translations/mr.json";
import bnTranslations from "../translations/bn.json";

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
    console.log("Language changed to:", language);
  };

  // Load translations from imported JSON files
  const translations: { [key: string]: { [key: string]: string } } = {
    en: enTranslations as { [key: string]: string },
    hi: hiTranslations as { [key: string]: string },
    ml: mlTranslations as { [key: string]: string },
    ta: taTranslations as { [key: string]: string },
    te: teTranslations as { [key: string]: string },
    kn: knTranslations as { [key: string]: string },
    mr: mrTranslations as { [key: string]: string },
    bn: bnTranslations as { [key: string]: string },
  };

  // Fallback translations for keys not in JSON files
  const fallbackTranslations = {
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
      welcome: "ப்ராஜெக்ட் கிஸானில் உங்களை வரவேற்கிறோம்",
      phone_login: "ஃபோன் லாக்இன்",
      enter_phone: "உங்கள் ஃபோன் எண்ணை உள்ளிடுங்கள்",
      send_otp: "OTP அனுப்புங்கள்",
      verify_login: "சரிபார்த்து லாக்இன் செய்யுங்கள்",
      voice_recognition: "குரல் அடையாளம்",
      fingerprint_login: "கைரேகை லாக்இன்",
      back_to_phone: "ஃபோன் எண்ணுக்குத் திரும்பு",
      enter_otp: "6-இலக்க OTP ஐ உள்ளிடுங்கள்",
      having_trouble: "சிக்கல் உள்ளதா? SMS லாக்இன் முயற்சி செய்யுங்கள்।",
      home: "முகப்பு",
      notifications: "அறிவிப்புகள்",
      profile: "சுயவிவரம்",
      chatbot: "உதவியாளர்",
      twin: "பண்ணை இரட்டையர்",
      resources: "வளங்கள்",
      updates: "புதுப்பிப்புகள்",
      assistant_greeting:
        "வணக்கம்! நான் உங்கள் AI விவசாய உதவியாளர். பயிர் மேலாண்மை, பூச்சி கட்டுப்பாடு, வானிலை ஆலோசனை மற்றும் பொதுவான விவசாய கேள்விகளில் உதவ முடியும். இன்று எப்படி உதவ முடியும்?",
      type_message: "விவசாயம் பற்றி கேளுங்கள்...",
      send: "அனுப்பு",
      speak: "குரல் உள்ளீடு",
      listening: "கேட்கிறது...",
      processing: "செயலாக்கம்...",
      mic_not_supported: "இந்த உலாவியில் ஒலிவாங்கி ஆதரவு இல்லை",
      tts_not_supported: "இந்த உலாவியில் டெக்ஸ்ட்-டு-ஸ்பீச் ஆதரவு இல்லை",
      tts_error: "டெக்ஸ்ட்-டு-ஸ்பீச் தோல்வியடைந்தது",
      api_error: "மன்னிக்கவும், பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
      network_error:
        "நெட்வொர்க் பிழை. உங்கள் இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
      error: "பிழை",
    },
    te: {
      welcome: "ప్రాజెక్ట్ కిసాన్‌కు స్వాగతం",
      phone_login: "ఫోన్ లాగిన్",
      enter_phone: "మీ ఫోన్ నంబర్‌ను నమోదు చేయండి",
      send_otp: "OTP పంపండి",
      verify_login: "ధృవీకరించండి & లాగిన్ చేయండి",
      voice_recognition: "వాయిస్ రికగ్నిషన్",
      fingerprint_login: "వేలిముద్ర లాగిన్",
      back_to_phone: "ఫోన్ నంబర్‌కు తిరిగి వెళ్ళండి",
      enter_otp: "6-అంకెల OTP ను నమోదు చేయండి",
      having_trouble: "సమస్య ఉందా? SMS లాగిన్ ప్రయత్నించండి.",
      home: "హోమ్",
      notifications: "నోటిఫికేషన్‌లు",
      profile: "ప్రొఫైల్",
      chatbot: "సహాయకుడు",
      twin: "ఫార్మ్ ట్విన్",
      resources: "వనరులు",
      updates: "అప్‌డేట్‌లు",
      assistant_greeting:
        "నమస్కారం! నేను మీ AI వ్యవసాయ సహాయకుడిని. పంట నిర్వహణ, పురుగుల నియంత్రణ, వాతావరణ సలహా మరియు సాధారణ వ్యవసాయ ప్రశ్నలలో సహాయపడగలను. ఈరోజు ఎలా సహాయం చేయగలను?",
      type_message: "వ్యవసాయం గురించి అడగండి...",
      send: "పంపండి",
      speak: "వాయిస్ ఇన్‌పుట్",
      listening: "వింటున్నాను...",
      processing: "ప్రాసెస్ చేస్తోంది...",
      mic_not_supported: "ఈ బ్రౌజర్‌లో మైక్రోఫోన్ మద్దతు లేదు",
      tts_not_supported: "ఈ బ్రౌజర్‌లో టెక్స్ట్-టు-స్పీచ్ మద్దతు లేదు",
      tts_error: "టెక్స్ట్-టు-స్పీచ్ విఫలమైంది",
      api_error: "క్షమించండి, లోపం సంభవించింది. మళ్లీ ప్రయత్నించండి.",
      network_error:
        "నెట్‌వర్క్ లోపం. మీ ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
      error: "లోపం",
    },
    kn: {
      welcome: "ಪ್ರಾಜೆಕ್ಟ್ ಕಿಸಾನ್‌ಗೆ ಸ್ವಾಗತ",
      phone_login: "ಫೋನ್ ಲಾಗಿನ್",
      enter_phone: "ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
      send_otp: "OTP ಕಳುಹಿಸಿ",
      verify_login: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಲಾಗಿನ್ ಮಾಡಿ",
      voice_recognition: "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ",
      fingerprint_login: "ಫಿಂಗರ್‌ಪ್ರಿಂಟ್ ಲಾಗಿನ್",
      back_to_phone: "ಫೋನ್ ಸಂಖ್ಯೆಗೆ ಹಿಂತಿರುಗಿ",
      enter_otp: "6-ಅಂಕಿಯ OTP ಅನ್ನು ನಮೂದಿಸಿ",
      having_trouble: "ತೊಂದರೆಯಾಗುತ್ತಿದೆಯೇ? SMS ಲಾಗಿನ್ ಪ್ರಯತ್ನಿಸಿ.",
      home: "ಮುಖಪುಟ",
      notifications: "ಅಧಿಸೂಚನೆಗಳು",
      profile: "ಪ್ರೊಫೈಲ್",
      chatbot: "ಸಹಾಯಕ",
      twin: "ಫಾರ್ಮ್ ಟ್ವಿನ್",
      resources: "ಸಂಪನ್ಮೂಲಗಳು",
      updates: "ನವೀಕರಣಗಳು",
      assistant_greeting:
        "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ. ಬೆಳೆ ನಿರ್ವಹಣೆ, ಕೀಟ ನಿಯಂತ್ರಣ, ಹವಾಮಾನ ಸಲಹೆ ಮತ್ತು ಸಾಮಾನ್ಯ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
      type_message: "ಕೃಷಿ ಬಗ್ಗೆ ಕೇಳಿ...",
      send: "ಕಳುಹಿಸಿ",
      speak: "ಧ್ವನಿ ಇನ್‌ಪುಟ್",
      listening: "ಕೇಳುತ್ತಿದೆ...",
      processing: "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
      mic_not_supported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಬೆಂಬಲವಿಲ್ಲ",
      tts_not_supported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್ ಬೆಂಬಲವಿಲ್ಲ",
      tts_error: "ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್ ವಿಫಲವಾಗಿದೆ",
      api_error: "ಕ್ಷಮಿಸಿ, ದೋಷ ಸಂಭವಿಸಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      network_error:
        "ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      error: "ದೋಷ",
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
      welcome: "प्रोजेक्ट किसानमध्ये आपले स्वागत आहे",
      phone_login: "फोन लॉगिन",
      enter_phone: "तुमचा फोन नंबर प्रविष्ट करा",
      send_otp: "OTP पाठवा",
      verify_login: "सत्यापित करा आणि लॉगिन करा",
      voice_recognition: "आवाज ओळख",
      fingerprint_login: "फिंगरप्रिंट लॉगिन",
      back_to_phone: "फोन नंबरवर परत जा",
      enter_otp: "6-अंकी OTP प्रविष्ट करा",
      having_trouble: "समस्या आहे का? SMS लॉगिन प्रयत्न करा.",
      home: "मुख्यपृष्ठ",
      notifications: "सूचना",
      profile: "प्रोफाइल",
      chatbot: "सहाय्यक",
      twin: "फार्म ट्विन",
      resources: "संसाधने",
      updates: "अपडेट",
      assistant_greeting:
        "नमस्कार! मी तुमचा AI शेती सहाय्यक आहे. पीक व्यवस्थापन, कीड नियंत्रण, हवामान सल्ला आणि सामान्य शेती प्रश्नांमध्ये मदत करू शकतो. आज कशी मदत करू?",
      type_message: "शेतीबद्दल विचारा...",
      send: "पाठवा",
      speak: "आवाज इनपुट",
      listening: "ऐकत आहे...",
      processing: "प्रक्रिया करत आहे...",
      mic_not_supported: "या ब्राउझरमध्ये मायक्रोफोन समर्थन नाही",
      tts_not_supported: "या ब्राउझरमध्ये टेक्स्ट-टु-स्पीच समर्थन नाही",
      tts_error: "टेक्स्ट-टु-स्पीच अयशस्वी झाले",
      api_error: "माफ करा, त्रुटी आली. पुन्हा प्रयत्न करा.",
      network_error:
        "नेटवर्क त्रुटी. तुमचे इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.",
      error: "त्रुटी",
    },
  };

  const t = (key: string): string => {
    // First try to get from JSON translations
    const currentTranslations = translations[currentLanguage];
    if (currentTranslations && currentTranslations[key]) {
      return currentTranslations[key];
    }

    // Then try fallback translations for keys not in JSON
    const currentFallback =
      fallbackTranslations[
        currentLanguage as keyof typeof fallbackTranslations
      ];
    if (
      currentFallback &&
      currentFallback[key as keyof typeof currentFallback]
    ) {
      return currentFallback[key as keyof typeof currentFallback];
    }

    // Finally fallback to English
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }

    // If nothing found, return the key itself
    return key;
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};
