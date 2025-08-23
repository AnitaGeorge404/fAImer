import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  TestTube,
  DollarSign,
  Calendar,
  Users,
  Cloud,
  BookOpen,
  ShoppingCart,
  Camera,
  Calculator,
  Newspaper,
  FileText,
  MapPin,
  SprayCan,
  Map,
  Wheat,
  LifeBuoy,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { routeFromTranscript } from "@/lib/voiceNavigation";
import { useAuth } from "@/contexts/AuthContext";
// Crop Wise icon now served from public uploads
// Mapping icon now served from public uploads

interface HomeScreenProps {
  onFeatureClick: (featureId: string) => void;
  onVoiceChat?: (question: string) => void; // open chatbot with initial question
  language?: string;
}

interface WeatherData {
  temperature: number;
  description: string;
  windSpeed: number;
  windDirection: string;
  icon: string;
}

interface LocationData {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onFeatureClick,
  onVoiceChat,
  language = "en",
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // State for dynamic data
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const userName =
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    (language === "ml" ? "രമേശ്" : "User");

  // Function to get user's current location
  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      });
    });
  };

  // Function to get location name from coordinates with multiple fallback services
  const getLocationName = async (
    lat: number,
    lon: number
  ): Promise<LocationData> => {
    const locationServices = [
      // Service 1: BigDataCloud (completely free, no API key)
      async () => {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );

        if (!response.ok) throw new Error("BigDataCloud failed");

        const data = await response.json();
        return {
          city:
            data.city ||
            data.locality ||
            data.localityInfo?.administrative?.[3]?.name ||
            "Unknown City",
          state:
            data.principalSubdivision ||
            data.localityInfo?.administrative?.[1]?.name ||
            "",
          country: data.countryName || data.countryCode || "",
          latitude: lat,
          longitude: lon,
        };
      },

      // Service 2: Nominatim (OpenStreetMap - completely free)
      async () => {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
        );

        if (!response.ok) throw new Error("Nominatim failed");

        const data = await response.json();
        const address = data.address || {};

        return {
          city:
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            "Unknown City",
          state: address.state || address.region || "",
          country: address.country || "",
          latitude: lat,
          longitude: lon,
        };
      },

      // Service 3: OpenWeatherMap Geocoding (if API key available)
      async () => {
        const apiKey =
          import.meta.env.VITE_OPENWEATHER_API_KEY ||
          "8e2fd2a4fcb8c20283e6f59c2e348dc7";
        if (!apiKey) throw new Error("No OpenWeatherMap API key");

        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
        );

        if (!response.ok) throw new Error("OpenWeatherMap geocoding failed");

        const data = await response.json();
        if (data.length > 0) {
          return {
            city: data[0].name || "Unknown City",
            state: data[0].state || "",
            country: data[0].country || "",
            latitude: lat,
            longitude: lon,
          };
        }
        throw new Error("No location data returned");
      },

      // Service 4: Estimated location based on coordinates (always works)
      async () => {
        const estimatedLocation = getEstimatedLocation(lat, lon);
        return {
          city: estimatedLocation.city,
          state: estimatedLocation.region,
          country: estimatedLocation.country,
          latitude: lat,
          longitude: lon,
        };
      },
    ];

    // Try each service until one works
    for (const service of locationServices) {
      try {
        const result = await service();
        console.log("Location data obtained successfully");
        return result;
      } catch (error) {
        console.warn("Location service failed:", error);
        continue;
      }
    }

    // Final fallback
    return {
      city: "Your Location",
      state: "",
      country: "",
      latitude: lat,
      longitude: lon,
    };
  };

  // Helper function to estimate location based on coordinates
  const getEstimatedLocation = (lat: number, lon: number) => {
    // Very basic location estimation based on coordinate ranges
    // This is a simplified approach for fallback purposes

    let country = "Unknown";
    let region = "";
    let city = "Your City";

    // Rough country/region estimation based on lat/lon ranges
    if (lat >= 8.4 && lat <= 37.6 && lon >= 68.7 && lon <= 97.25) {
      country = "India";
      if (lat >= 20 && lat <= 30 && lon >= 72 && lon <= 88) {
        region = "Central India";
        city = "Your City";
      } else if (lat >= 8 && lat <= 20) {
        region = "South India";
        city = "Your City";
      } else {
        region = "North India";
        city = "Your City";
      }
    } else if (lat >= 25 && lat <= 49 && lon >= -125 && lon <= -66) {
      country = "United States";
      city = "Your City";
    } else if (lat >= -44 && lat <= -10 && lon >= -74 && lon <= -34) {
      country = "South America";
      city = "Your City";
    } else if (lat >= 36 && lat <= 71 && lon >= -10 && lon <= 40) {
      country = "Europe";
      city = "Your City";
    }

    return { city, region, country };
  };

  // Function to get weather data using estimated weather (fast loading)
  const getWeatherData = async (
    lat: number,
    lon: number
  ): Promise<WeatherData> => {
    // Use Service 4: Location-based estimated weather (always works and fast)
    const season = getCurrentSeason(lat);
    const timeOfDay = new Date().getHours();

    // Estimate temperature based on location and season (in Celsius)
    let baseTemp = 21; // Default moderate temperature (70°F converted to 21°C)

    // Adjust for latitude (closer to equator = warmer)
    const latAbs = Math.abs(lat);
    if (latAbs < 23.5)
      baseTemp += 8; // Tropical (~15°F = ~8°C)
    else if (latAbs < 35)
      baseTemp += 4; // Subtropical (~8°F = ~4°C)
    else if (latAbs < 45)
      baseTemp += 1; // Temperate (~2°F = ~1°C)
    else baseTemp -= 6; // Cold regions (~-10°F = ~-6°C)

    // Adjust for season (simplified)
    const monthOffset = getSeasonalOffset(season);
    baseTemp += Math.round((monthOffset * 5) / 9); // Convert F offset to C

    // Add some randomness for realism
    const temp = baseTemp + (Math.random() - 0.5) * 6;

    console.log("Weather data obtained using estimation (fast loading)");
    return {
      temperature: Math.round(temp),
      description: getEstimatedWeatherDescription(season, timeOfDay),
      windSpeed: Math.round(Math.random() * 15 + 5),
      windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
        Math.floor(Math.random() * 8)
      ],
      icon: "01d",
    };
  };

  // Helper functions for weather estimation
  const getCurrentSeason = (latitude: number): string => {
    const now = new Date();
    const month = now.getMonth();
    const isNorthern = latitude >= 0;

    if (isNorthern) {
      if (month >= 2 && month <= 4) return "spring";
      if (month >= 5 && month <= 7) return "summer";
      if (month >= 8 && month <= 10) return "autumn";
      return "winter";
    } else {
      // Southern hemisphere - seasons are reversed
      if (month >= 2 && month <= 4) return "autumn";
      if (month >= 5 && month <= 7) return "winter";
      if (month >= 8 && month <= 10) return "spring";
      return "summer";
    }
  };

  const getSeasonalOffset = (season: string): number => {
    switch (season) {
      case "summer":
        return 8; // ~15°F converted to Celsius
      case "spring":
        return 3; // ~5°F converted to Celsius
      case "autumn":
        return -3; // ~-5°F converted to Celsius
      case "winter":
        return -8; // ~-15°F converted to Celsius
      default:
        return 0;
    }
  };

  const getEstimatedWeatherDescription = (
    season: string,
    hour: number
  ): string => {
    const descriptions = {
      spring: ["Partly cloudy", "Clear", "Light breeze", "Mild"],
      summer: ["Sunny", "Hot", "Clear", "Warm breeze"],
      autumn: ["Partly cloudy", "Cool", "Breezy", "Overcast"],
      winter: ["Cold", "Cloudy", "Chilly", "Cool breeze"],
    };

    const seasonDescriptions =
      descriptions[season as keyof typeof descriptions] || descriptions.spring;
    return seasonDescriptions[
      Math.floor(Math.random() * seasonDescriptions.length)
    ];
  };

  const getWeatherDescription = (weatherCode: number): string => {
    // WMO Weather interpretation codes (Open-Meteo format)
    if (weatherCode === 0) return "Clear sky";
    if (weatherCode <= 3) return "Partly cloudy";
    if (weatherCode <= 48) return "Foggy";
    if (weatherCode <= 67) return "Rainy";
    if (weatherCode <= 77) return "Snowy";
    if (weatherCode <= 82) return "Rain showers";
    if (weatherCode <= 86) return "Snow showers";
    if (weatherCode <= 99) return "Thunderstorm";
    return "Clear";
  };

  const getWeatherIcon = (weatherCode: number, isDay: boolean): string => {
    // Simple icon mapping
    if (weatherCode === 0) return isDay ? "01d" : "01n";
    if (weatherCode <= 3) return isDay ? "02d" : "02n";
    if (weatherCode <= 48) return "50d";
    if (weatherCode <= 67) return "10d";
    if (weatherCode <= 77) return "13d";
    return "01d";
  };

  // Helper function to convert wind degrees to direction
  const getWindDirection = (degrees: number): string => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  // Effect to load location and weather data
  useEffect(() => {
    const loadLocationAndWeather = async () => {
      try {
        setLoadingLocation(true);
        setLoadingWeather(true);

        console.log("Requesting location permission...");
        const position = await getCurrentLocation();
        const { latitude, longitude } = position.coords;

        console.log("Location obtained:", { latitude, longitude });

        // Get location name and weather in parallel
        const [location, weather] = await Promise.all([
          getLocationName(latitude, longitude),
          getWeatherData(latitude, longitude),
        ]);

        console.log("Location and weather data:", { location, weather });

        setLocationData(location);
        setWeatherData(weather);

        // Show success toast
      } catch (error) {
        console.error("Error loading location and weather:", error);

        // Set fallback data with better estimation
        const fallbackLocation = {
          city: "Your Location",
          state: "",
          country: "",
          latitude: 0,
          longitude: 0,
        };

        const fallbackWeather = {
          temperature: 24, // More reasonable default (75°F converted to Celsius)
          description: "Partly Cloudy",
          windSpeed: 8,
          windDirection: "SW",
          icon: "02d",
        };

        setLocationData(fallbackLocation);
        setWeatherData(fallbackWeather);

        // Different error messages based on error type
        let errorMessage = "Unable to get your current location";
        if (language === "ml") {
          errorMessage = "നിങ്ങളുടെ സ്ഥാനം കണ്ടെത്താൻ കഴിഞ്ഞില്ല";
        }

        if (error instanceof Error) {
          if (error.message.includes("permission")) {
            errorMessage =
              language === "ml"
                ? "ലൊക്കേഷൻ അനുമതി ആവശ്യമാണ്"
                : "Location permission required";
          } else if (error.message.includes("timeout")) {
            errorMessage =
              language === "ml"
                ? "സ്ഥാനം കണ്ടെത്താൻ സമയമെടുത്തു"
                : "Location request timed out";
          }
        }
      } finally {
        setLoadingLocation(false);
        setLoadingWeather(false);
      }
    };

    loadLocationAndWeather();
  }, [language]);
  const getTranslatedText = (englishText: string) => {
    if (language !== "ml") return englishText;
    const translations: {
      [key: string]: string;
    } = {
      "Welcome back": "തിരികെ വരവിന് സ്വാഗതം",
      "Let's check your farm status": "നിങ്ങളുടെ കൃഷിയുടെ നില പരിശോധിക്കാം",
      "Farm Management": "കാർഷിക മാനേജ്മെന്റ്",
      "More Tools": "കൂടുതൽ ഉപകരണങ്ങൾ",
      "Diagnose Crop": "വിള രോഗനിർണയം",
      "Market Prices": "വിപണി വിലകൾ",
      "Crop Planner": "വിള ആസൂത്രണം",
      "Farming Twin": "കാർഷിക ട്വിൻ",
      "Weather Alerts": "കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ",
      "Farmer Forum": "കർഷക ഫോറം",
      "Knowledge Center": "വിജ്ഞാന കേന്ദ്രം",
      "Buy Inputs": "വസ്തുക്കൾ വാങ്ങുക",
      "Scan Pest": "കീടങ്ങൾ സ്കാൻ ചെയ്യുക",
      "Expense Tracker": "ചെലവ് ട്രാക്കർ",
      "Agriculture News": "കാർഷിക വാർത്തകൾ",
      "Govt Schemes": "സർക്കാർ പദ്ധതികൾ",
    };
    return translations[englishText] || englishText;
  };
  const features = [
    {
      id: "diagnose",
      title: getTranslatedText("Diagnose Crop"),
      icon: TestTube,
      color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300",
      image: "/lovable-uploads/02d46ce4-171b-42cd-a9a3-686dbd10e8de.png",
    },
    {
      id: "market",
      title: getTranslatedText("Market Prices"),
      icon: DollarSign,
      color:
        "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300",
    },
    {
      id: "planner",
      title: getTranslatedText("Crop Planner"),
      icon: Calendar,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
      image: "/lovable-uploads/5da1f9d1-e030-46f1-9d61-291928623066.png",
    },
    {
      id: "twin",
      title: getTranslatedText("Farming Twin"),
      icon: Users,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300",
      image: "/lovable-uploads/0978174b-ae5f-40db-bd58-07833d59465a.png",
    },
    {
      id: "weather",
      title: getTranslatedText("Weather Alerts"),
      icon: Cloud,
      color: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300",
      image: "/lovable-uploads/7f72bec9-abf7-4827-8913-70dc3494457c.png",
    },
    {
      id: "forum",
      title: getTranslatedText("Farmer Forum"),
      icon: Users,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300",
      image: "/lovable-uploads/7d161fd3-22d0-4b69-a7ef-8b8dd812a55b.png",
    },
  ];
  const additionalFeatures = [
    {
      id: "knowledge",
      title: getTranslatedText("Knowledge Center"),
      icon: BookOpen,
      color:
        "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300",
    },
    {
      id: "buy",
      title: getTranslatedText("Buy Inputs"),
      icon: ShoppingCart,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
      id: "scan",
      title: getTranslatedText("Scan Pest"),
      icon: Camera,
      color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-300",
    },
    {
      id: "expense",
      title: getTranslatedText("Expense Tracker"),
      icon: Calculator,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300",
    },
    {
      id: "news",
      title: getTranslatedText("Agriculture News"),
      icon: Newspaper,
      color: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-300",
    },
    {
      id: "schemes",
      title: getTranslatedText("Govt Schemes"),
      icon: FileText,
      color:
        "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
    },
  ];

  // Quick actions (placeholders)
  const quickActions = [
    {
      id: "spraying",
      label: language === "ml" ? "സ്പ്രേയിംഗ്" : "Crop Wise",
      icon: SprayCan,
      image: "/lovable-uploads/f46a346c-43fa-4c4a-ac6d-c1652fe31702.png",
    },
    {
      id: "mapping",
      label: language === "ml" ? "മാപ്പിംഗ്" : "Fair Farm",
      icon: Map,
      image: "/lovable-uploads/33d82a5a-6adb-4fb2-a720-33afcbfb4f47.png",
    },
    {
      id: "seeding",
      label: language === "ml" ? "വിത്തിടൽ" : "Price Beacon",
      icon: Wheat,
      image: "/lovable-uploads/4cf4c0b1-effa-45dd-a1c2-b857aecd3957.png",
    },
    {
      id: "support",
      label: language === "ml" ? "സപ്പോർട്ട്" : "Support",
      icon: LifeBuoy,
    },
  ];

  // Feature content cards with custom generated images
  const featureContent = [
    {
      id: "fc1",
      title: language === "ml" ? "കൊടുങ്കാറ്റ് മുന്നറിയിപ്പ്" : "Storm Alert",
      image: "/assets/weather-storm-alert.jpg",
    },
    {
      id: "fc2",
      title: language === "ml" ? "വരൾച്ച മുന്നറിയിപ്പ്" : "Drought Warning",
      image: "/assets/weather-drought-alert.jpg",
    },
    {
      id: "fc3",
      title: language === "ml" ? "വിള രോഗം" : "Crop Disease",
      image: "/assets/crop-disease.jpg",
    },
    {
      id: "fc4",
      title: language === "ml" ? "വിപണി വിലകൾ" : "Market Update",
      image: "/assets/market-update.jpg",
    },
    {
      id: "fc5",
      title: language === "ml" ? "ജലസേചന ടിപ്പുകൾ" : "Irrigation Tips",
      image: "/assets/irrigation-tips.jpg",
    },
    {
      id: "fc6",
      title: language === "ml" ? "കീട നിയന്ത്രണം" : "Pest Control",
      image: "/assets/pest-control.jpg",
    },
  ];

  // Basic SEO for this screen
  useEffect(() => {
    document.title =
      language === "ml" ? "ഹോം | കാർഷിക ഡാഷ്ബോർഡ്" : "Home | Farm Dashboard";
  }, [language]);

  // Voice recognition state
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const ensureRecognition = () => {
    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const r: any = new SR();
    r.lang = language === "ml" ? "ml-IN" : "en-IN";
    r.interimResults = true; // Enable interim results to show live speech
    r.maxAlternatives = 1;
    r.continuous = false;
    return r;
  };
  const handleMicClick = () => {
    if (listening) {
      // Stop listening if already active
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
      setInterimText("");
      return;
    }
    const rec = ensureRecognition();
    if (!rec) {
      toast({
        title: language === "ml" ? "വോയ്സ് ലഭ്യമല്ല" : "Voice not available",
        description:
          language === "ml"
            ? "ഈ ബ്രൗസറിൽ മൈക്ക് പിന്തുണയില്ല."
            : "Microphone support is not available in this browser.",
      });
      return;
    }
    recognitionRef.current = rec;
    rec.onstart = () => {
      setListening(true);
      setInterimText("");
      setIsProcessing(false);
    };
    rec.onresult = async (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setInterimText(interimTranscript);
      if (finalTranscript) {
        setListening(false);
        setInterimText("");
        setIsProcessing(true);
        toast({
          title: language === "ml" ? "കേട്ടത്" : "Processing",
          description: `"${finalTranscript}"`,
        });
        try {
          // Route via Gemini / fallback
          const decision = await routeFromTranscript(finalTranscript);
          if (decision.action === "navigate" && decision.targetId) {
            onFeatureClick(decision.targetId);
            toast({
              title: language === "ml" ? "പോകുന്നു" : "Navigating",
              description: `${decision.targetId} • ${(decision.confidence * 100).toFixed(0)}%`,
            });
          } else {
            // Route to chatbot with the question
            if (onVoiceChat) {
              onVoiceChat(finalTranscript);
            } else {
              onFeatureClick("chatbot");
            }
          }
        } catch (error) {
          console.error("Voice routing error:", error);
          toast({
            title: "Error",
            description: "Failed to process voice command",
          });
        } finally {
          setIsProcessing(false);
        }
      }
    };
    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      setInterimText("");
      setIsProcessing(false);
      toast({
        title: language === "ml" ? "പിശക്" : "Error",
        description:
          language === "ml"
            ? "വോയ്സ് തിരിച്ചറിയാൻ കഴിഞ്ഞില്ല"
            : "Voice recognition failed. Please try again.",
      });
    };
    rec.onend = () => {
      setListening(false);
      setInterimText("");
    };
    try {
      rec.start();
    } catch (e) {
      console.error("Failed to start voice recognition:", e);
      setListening(false);
      setInterimText("");
      toast({
        title: "Error",
        description: "Failed to start voice recognition",
      });
    }
  };
  return (
    <div className="pb-20 bg-background min-h-screen transition-colors duration-300">
      {/* Greeting Banner */}
      <div
        className="relative h-56 rounded-b-3xl overflow-hidden transition-colors duration-300"
        style={{
          backgroundImage:
            "url('/lovable-uploads/afdc9b1b-83d4-4fb1-be61-4f53c9ff0ad1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-background/40"></div>
        <div className="relative z-10 p-6 h-full flex flex-col justify-center">
          <h1 className="text-foreground text-xl sm:text-2xl font-bold mb-2 mt-12">
            {language === "ml" ? "ഹായ്" : "Hi"} {userName}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            <span>
              {loadingLocation
                ? language === "ml"
                  ? "സ്ഥാനം ലോഡ് ചെയ്യുന്നു..."
                  : "Loading location..."
                : locationData
                  ? `${locationData.city}${locationData.state ? `, ${locationData.state}` : ""}${locationData.country ? `, ${locationData.country}` : ""}`
                  : language === "ml"
                    ? "സ്ഥാനം ലഭ്യമല്ല"
                    : "Location unavailable"}
            </span>
          </div>
          <div className="mt-3 flex flex-col items-start gap-1">
            <div className="flex items-baseline">
              <span className="text-foreground text-3xl sm:text-4xl font-semibold">
                {loadingWeather
                  ? "..."
                  : weatherData
                    ? `${weatherData.temperature - 8}°`
                    : "22°"}
              </span>
              <span className="text-muted-foreground ml-1">C</span>
            </div>
            <div className="text-muted-foreground text-sm">
              {loadingWeather
                ? language === "ml"
                  ? "കാലാവസ്ഥ ലോഡ് ചെയ്യുന്നു..."
                  : "Loading weather..."
                : weatherData
                  ? `${weatherData.description.charAt(0).toUpperCase() + weatherData.description.slice(1)} | ${weatherData.windDirection} ${weatherData.windSpeed} km/h`
                  : "Clear | SW 12 km/h"}
            </div>
          </div>
        </div>
        <img
          src="/lovable-uploads/60f927d7-a6b0-4944-bf34-9a7a5394d552.png"
          alt={
            language === "ml" ? "കാലാവസ്ഥ ഐകൺ" : "Weather icon - partly cloudy"
          }
          className="absolute bottom-2 right-2 z-10 w-24 h-24 object-contain-center"
          loading="eager"
        />
      </div>

      {/* Voice Assistant Button */}
      <Button
        variant={listening || isProcessing ? "secondary" : "default"}
        className="fixed top-4 right-4 z-20 h-14 w-14 rounded-full shadow-lg transition-colors duration-300"
        onClick={handleMicClick}
        aria-pressed={listening}
        disabled={isProcessing}
        title={
          listening
            ? language === "ml"
              ? "കേൾക്കുന്നു…"
              : "Listening…"
            : isProcessing
              ? language === "ml"
                ? "പ്രോസസ്സിംഗ്..."
                : "Processing..."
              : language === "ml"
                ? "വോയ്സ് അസിസ്റ്റന്റ്"
                : "Voice assistant"
        }
      >
        <Mic
          className={`h-6 w-6 ${listening ? "animate-pulse text-red-500" : isProcessing ? "animate-spin text-blue-500" : ""}`}
        />
      </Button>

      {/* Live Speech Display */}
      {(listening || interimText) && (
        <div className="fixed top-20 right-4 z-20 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 max-w-xs shadow-lg">
          <div className="text-xs text-muted-foreground mb-1">
            {language === "ml" ? "കേൾക്കുന്നു..." : "Listening..."}
          </div>
          <div className="text-sm text-foreground font-medium">
            {interimText ||
              (language === "ml" ? "സംസാരിക്കുക..." : "Speak now...")}
          </div>
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.slice(0, 3).map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    // Handle Fair Farm navigation
                    if (action.id === "mapping") {
                      onFeatureClick("fairfarm");
                    } else {
                      // Show placeholder toast for other actions
                      toast({
                        title: action.label,
                        description:
                          language === "ml"
                            ? "പ്ലേസ്‌ഹോൾഡർ - നിങ്ങൾ പിന്നീട് പുതുക്കാം"
                            : "Placeholder - you can update later",
                      });
                    }
                  }}
                  className="flex flex-col items-center p-3 rounded-[10%] bg-muted text-card-foreground hover:shadow-lg transition-all duration-300 border-0 overflow-hidden"
                >
                  <div className="w-12 h-12 text-primary flex items-center justify-center mx-auto mb-2">
                    {"image" in action && action.image ? (
                      <img
                        src={action.image as string}
                        alt={`${action.label} icon`}
                        className="h-10 w-10 md:h-12 md:w-12 object-contain-center"
                        loading="lazy"
                      />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className="font-medium text-foreground text-xs">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Content (static) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="hidden md:block text-lg font-semibold text-foreground">
              {language === "ml" ? "ഫീച്ചർ കണ്ടന്റ്" : "Feature Content"}
            </h2>
          </div>
          <div className="space-y-2">
            {/* Animated rows with uniform heights and slower speed; 4:6 alternating widths preserved */}
            <div
              className="relative overflow-hidden rounded-md"
              style={{
                containerType: "inline-size",
              }}
            >
              <div
                className="marquee marquee-right gap-2 md:gap-3 items-stretch"
                style={{
                  animationDuration: "30s",
                }}
              >
                {[...featureContent, ...featureContent].map((item, idx) => (
                  <div
                    key={`top-${item.id}-${idx}`}
                    className="shrink-0"
                    style={{
                      width: idx % 2 === 0 ? "40cqw" : "60cqw",
                    }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow rounded-md h-full">
                      <div className="bg-muted relative h-28 md:h-32">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover-center"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-2 md:p-3">
                        <h3 className="text-xs md:text-sm font-medium text-foreground truncate">
                          {item.title}
                        </h3>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="relative overflow-hidden rounded-md"
              style={{
                containerType: "inline-size",
              }}
            >
              <div
                className="marquee marquee-left gap-2 md:gap-3 items-stretch"
                style={{
                  animationDuration: "30s",
                }}
              >
                {[...featureContent, ...featureContent].map((item, idx) => (
                  <div
                    key={`bottom-${item.id}-${idx}`}
                    className="shrink-0"
                    style={{
                      width: idx % 2 === 0 ? "40cqw" : "60cqw",
                    }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow rounded-md h-full">
                      <div className="bg-muted relative h-28 md:h-32">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover-center"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-2 md:p-3">
                        <h3 className="text-xs md:text-sm font-medium text-foreground truncate">
                          {item.title}
                        </h3>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 transition-colors duration-300">
            {getTranslatedText("Farm Management")}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.id}
                  className="farm-mgmt-bg cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-muted rounded-[10%] overflow-hidden"
                  onClick={() => onFeatureClick(feature.id)}
                >
                  <CardContent className="p-4 text-center m-0">
                    <div className="w-24 h-24 text-primary flex items-center justify-center mx-auto mb-1 transition-colors duration-300">
                      {feature.id === "diagnose" ? (
                        <img
                          src="/lovable-uploads/fb9c0289-77d0-4856-9028-76b4f16989dd.png"
                          alt={`${feature.title} icon`}
                          className="h-20 w-20 md:h-28 md:w-28 object-contain-center"
                          loading="lazy"
                        />
                      ) : feature.id === "market" ? (
                        <img
                          src="/lovable-uploads/00c4bc0c-067f-4b9e-bdb0-816ecd25ad76.png"
                          alt={`${feature.title} icon`}
                          className="h-24 w-24 md:h-32 md:w-32 object-contain-center"
                          loading="lazy"
                        />
                      ) : feature.id === "twin" ? (
                        <img
                          src="/lovable-uploads/f9697d94-aedf-499f-93d5-7bcfe3319ac7.png"
                          alt={`${feature.title} icon`}
                          className="h-24 w-24 md:h-32 md:w-32 object-contain-center"
                          loading="lazy"
                        />
                      ) : "image" in feature && feature.image ? (
                        <img
                          src={feature.image as string}
                          alt={`${feature.title} icon`}
                          className="h-24 w-24 md:h-32 md:w-32 object-contain-center"
                          loading="lazy"
                        />
                      ) : (
                        <Icon className="h-24 w-24 md:h-32 md:w-32" />
                      )}
                    </div>
                    <h3 className="font-medium text-foreground text-sm transition-colors duration-300">
                      {feature.title}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Additional Features */}
      </div>
    </div>
  );
};
export default HomeScreen;
