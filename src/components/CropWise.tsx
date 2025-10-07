import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Wheat,
  Search,
  Filter,
  MapPin,
  Calendar,
  Droplets,
  Sun,
  Cloud,
  ThermometerSun,
  Sprout,
  TreePine,
  Leaf,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Users,
  DollarSign,
  Layers,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/contexts/TranslationContext";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface CropRecommendation {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  suitability: "High" | "Medium" | "Low";
  growthDuration: string;
  yield: string;
  waterRequirement: "Low" | "Medium" | "High";
  sunlightRequirement: "Full Sun" | "Partial Sun" | "Shade";
  soilType: string[];
  bestSeason: string;
  marketPrice: string;
  profitability: number; // 1-5 scale
  difficulty: "Easy" | "Moderate" | "Hard";
  imageUrl: string;
  advantages: string[];
  considerations: string[];
  spacing: string;
  fertilizer: string;
  pests: string[];
  diseases: string[];
}

interface LocationData {
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  climate: string;
  soilType: string;
}

interface FarmerInput {
  farmSize: string;
  farmSizeUnit: string;
  laborAvailability: string;
  waterAvailability: string;
  irrigationType: string;
  budget: string;
  budgetUnit: string;
  soilType: string;
  experience: string;
}

interface CropWiseProps {
  onBack?: () => void;
}

const CropWise: React.FC<CropWiseProps> = ({ onBack }) => {
  const { currentLanguage, t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSeason, setFilterSeason] = useState("all");
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>(
    []
  );
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(
    null
  );
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [farmerInput, setFarmerInput] = useState<FarmerInput>({
    farmSize: "",
    farmSizeUnit: "acres",
    laborAvailability: "",
    waterAvailability: "",
    irrigationType: "",
    budget: "",
    budgetUnit: "INR",
    soilType: "",
    experience: "",
  });
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] =
    useState(false);
  const { toast } = useToast();

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const getTranslatedText = (englishText: string) => {
    if (currentLanguage !== "ml") return englishText;
    const translations: { [key: string]: string } = {
      "CropWise Recommendations": "വിള ശുപാർശകൾ",
      "Smart crop recommendations for your region":
        "നിങ്ങളുടെ പ്രദേശത്തിനുള്ള മികച്ച വിള ശുപാർശകൾ",
      "Search crops": "വിളകൾ തിരയുക",
      "All Categories": "എല്ലാ വിഭാഗങ്ങളും",
      "All Seasons": "എല്ലാ സീസണുകളും",
      "High Suitability": "ഉയർന്ന അനുയോജ്യത",
      "Medium Suitability": "മധ്യമ അനുയോജ്യത",
      "Low Suitability": "കുറഞ്ഞ അനുയോജ്യത",
      "Growth Duration": "വളർച്ചാ കാലയളവ്",
      "Expected Yield": "പ്രതീക്ഷിത വിളവ്",
      "Water Requirement": "ജലാവശ്യകത",
      Sunlight: "സൂര്യപ്രകാശം",
      Profitability: "ലാഭകരത",
      Difficulty: "ബുദ്ധിമുട്ട്",
      "View Details": "വിശദാംശങ്ങൾ കാണുക",
      "Loading recommendations...": "ശുപാർശകൾ ലോഡ് ചെയ്യുന്നു...",
      "Getting your location...": "നിങ്ങളുടെ സ്ഥാനം കണ്ടെത്തുന്നു...",
    };
    return translations[englishText] || englishText;
  };

  // Sample crop recommendations
  const sampleRecommendations: CropRecommendation[] = [
    {
      id: "rice-1",
      name: "Basmati Rice",
      scientificName: "Oryza sativa",
      category: "Grains",
      suitability: "High",
      growthDuration: "120-140 days",
      yield: "4-6 tons/hectare",
      waterRequirement: "High",
      sunlightRequirement: "Full Sun",
      soilType: ["Clay", "Loamy"],
      bestSeason: "Kharif",
      marketPrice: "₹40-60/kg",
      profitability: 4,
      difficulty: "Moderate",
      imageUrl: "/assets/quick-seeding.png",
      advantages: [
        "High market demand",
        "Premium price for quality produce",
        "Well-established supply chain",
        "Government support programs",
      ],
      considerations: [
        "High water requirement",
        "Needs proper drainage",
        "Pest management required",
        "Weather dependent",
      ],
      spacing: "20cm x 15cm",
      fertilizer: "NPK 10:26:26",
      pests: ["Brown Plant Hopper", "Rice Stem Borer"],
      diseases: ["Blast Disease", "Brown Spot"],
    },
    {
      id: "wheat-1",
      name: "Wheat",
      scientificName: "Triticum aestivum",
      category: "Grains",
      suitability: "High",
      growthDuration: "100-130 days",
      yield: "3-5 tons/hectare",
      waterRequirement: "Medium",
      sunlightRequirement: "Full Sun",
      soilType: ["Loamy", "Sandy Loam"],
      bestSeason: "Rabi",
      marketPrice: "₹20-25/kg",
      profitability: 3,
      difficulty: "Easy",
      imageUrl: "/assets/quick-seeding.png",
      advantages: [
        "Stable market demand",
        "Lower water requirement than rice",
        "Good for crop rotation",
        "Government procurement support",
      ],
      considerations: [
        "Temperature sensitive",
        "Requires timely harvesting",
        "Storage challenges in humid areas",
      ],
      spacing: "Broadcast or 20cm rows",
      fertilizer: "DAP and Urea",
      pests: ["Aphids", "Termites"],
      diseases: ["Rust", "Smut"],
    },
    {
      id: "tomato-1",
      name: "Tomato",
      scientificName: "Solanum lycopersicum",
      category: "Vegetables",
      suitability: "High",
      growthDuration: "70-90 days",
      yield: "40-60 tons/hectare",
      waterRequirement: "Medium",
      sunlightRequirement: "Full Sun",
      soilType: ["Loamy", "Sandy Loam", "Clay Loam"],
      bestSeason: "All Season",
      marketPrice: "₹15-40/kg",
      profitability: 5,
      difficulty: "Moderate",
      imageUrl: "/assets/crop-disease.jpg",
      advantages: [
        "High profitability",
        "Multiple harvests",
        "Growing market demand",
        "Value addition opportunities",
      ],
      considerations: [
        "Disease prone",
        "Requires staking",
        "Price volatility",
        "Post-harvest management",
      ],
      spacing: "60cm x 45cm",
      fertilizer: "Organic compost + NPK",
      pests: ["Fruit Borer", "Whitefly"],
      diseases: ["Late Blight", "Early Blight"],
    },
    {
      id: "sugarcane-1",
      name: "Sugarcane",
      scientificName: "Saccharum officinarum",
      category: "Cash Crops",
      suitability: "Medium",
      growthDuration: "10-12 months",
      yield: "80-120 tons/hectare",
      waterRequirement: "High",
      sunlightRequirement: "Full Sun",
      soilType: ["Clay Loam", "Sandy Clay"],
      bestSeason: "Kharif",
      marketPrice: "₹3500-4000/ton",
      profitability: 4,
      difficulty: "Moderate",
      imageUrl: "/assets/quick-crop-wise.png",
      advantages: [
        "Long-term crop",
        "Assured government purchase",
        "Multiple by-products",
        "Good for semi-arid regions",
      ],
      considerations: [
        "High initial investment",
        "Water intensive",
        "Long growth period",
        "Heavy machinery required",
      ],
      spacing: "90cm x 60cm",
      fertilizer: "High nitrogen requirement",
      pests: ["Red Rot", "Borer"],
      diseases: ["Smut", "Red Rot"],
    },
    {
      id: "cotton-1",
      name: "Cotton",
      scientificName: "Gossypium hirsutum",
      category: "Cash Crops",
      suitability: "Medium",
      growthDuration: "180-200 days",
      yield: "500-800 kg/hectare",
      waterRequirement: "Medium",
      sunlightRequirement: "Full Sun",
      soilType: ["Black Cotton Soil", "Alluvial"],
      bestSeason: "Kharif",
      marketPrice: "₹5000-7000/quintal",
      profitability: 3,
      difficulty: "Hard",
      imageUrl: "/assets/pest-control.jpg",
      advantages: [
        "High market value",
        "Industrial demand",
        "Export potential",
        "Government support",
      ],
      considerations: [
        "Pest prone",
        "Weather dependent",
        "High input costs",
        "Quality sensitive market",
      ],
      spacing: "45cm x 30cm",
      fertilizer: "Balanced NPK",
      pests: ["Bollworm", "Aphids"],
      diseases: ["Wilt", "Boll Rot"],
    },
    {
      id: "maize-1",
      name: "Maize",
      scientificName: "Zea mays",
      category: "Grains",
      suitability: "High",
      growthDuration: "90-120 days",
      yield: "6-8 tons/hectare",
      waterRequirement: "Medium",
      sunlightRequirement: "Full Sun",
      soilType: ["Loamy", "Sandy Loam"],
      bestSeason: "Kharif",
      marketPrice: "₹18-25/kg",
      profitability: 4,
      difficulty: "Easy",
      imageUrl: "/assets/irrigation-tips.jpg",
      advantages: [
        "Versatile crop",
        "Growing demand",
        "Less water than rice",
        "Good for food security",
      ],
      considerations: [
        "Storage pest issues",
        "Market price fluctuations",
        "Birds and wild animal damage",
      ],
      spacing: "60cm x 20cm",
      fertilizer: "High nitrogen requirement",
      pests: ["Stem Borer", "Fall Army Worm"],
      diseases: ["Leaf Blight", "Rust"],
    },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get location details (simplified)
            const locationData: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              city: "Your Location",
              region: `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`,
              climate: "Tropical",
              soilType: "Loamy",
            };

            // Determine climate and soil based on coordinates (simplified)
            if (
              position.coords.latitude > 23 &&
              position.coords.latitude < 35
            ) {
              locationData.climate = "Sub-tropical";
            } else if (position.coords.latitude < 23) {
              locationData.climate = "Tropical";
            } else {
              locationData.climate = "Temperate";
            }

            setLocation(locationData);
          } catch (error) {
            console.error("Location processing error:", error);
            setLocation({
              city: "Unknown Location",
              region: "Unknown Region",
              latitude: 0,
              longitude: 0,
              climate: "Tropical",
              soilType: "Mixed",
            });
          }
        },
        (error) => {
          console.error("Location error:", error);
          setLocation({
            city: "Location Unavailable",
            region: "Enable location for better recommendations",
            latitude: 0,
            longitude: 0,
            climate: "Mixed",
            soilType: "Mixed",
          });
        }
      );
    }
  };

  const generateAIRecommendations = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please configure your Gemini API key",
        variant: "destructive",
      });
      setRecommendations(sampleRecommendations);
      return;
    }

    setIsGeneratingRecommendations(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are an expert agricultural advisor. Based on the following farmer information, provide detailed crop recommendations.

        Farmer Details:
        - Farm Size: ${farmerInput.farmSize} ${farmerInput.farmSizeUnit}
        - Labor Availability: ${farmerInput.laborAvailability}
        - Water Availability: ${farmerInput.waterAvailability}
        - Irrigation Type: ${farmerInput.irrigationType}
        - Budget: ${farmerInput.budget} ${farmerInput.budgetUnit}
        - Soil Type: ${farmerInput.soilType}
        - Farming Experience: ${farmerInput.experience}
        - Location: ${location?.city}, ${location?.region}
        - Climate: ${location?.climate}

        Provide 6 crop recommendations in the following JSON format. Each recommendation should be tailored to the farmer's specific situation:
        [
          {
            "name": "Crop name",
            "scientificName": "Scientific name",
            "category": "Grains/Vegetables/Cash Crops/Fruits",
            "suitability": "High/Medium/Low",
            "reasoning": "Detailed explanation of why this crop is recommended based on the farmer's specific situation (2-3 sentences)",
            "growthDuration": "XX-XX days",
            "yield": "X-X tons/hectare",
            "waterRequirement": "Low/Medium/High",
            "sunlightRequirement": "Full Sun/Partial Sun/Shade",
            "soilType": ["soil type 1", "soil type 2"],
            "bestSeason": "Kharif/Rabi/All Season",
            "marketPrice": "₹XX-XX/kg or per unit",
            "profitability": 1-5,
            "difficulty": "Easy/Moderate/Hard",
            "advantages": ["advantage 1", "advantage 2", "advantage 3"],
            "considerations": ["consideration 1", "consideration 2"],
            "spacing": "spacing details",
            "fertilizer": "fertilizer recommendations",
            "pests": ["pest 1", "pest 2"],
            "diseases": ["disease 1", "disease 2"],
            "estimatedInvestment": "₹XXXX per ${farmerInput.farmSizeUnit}",
            "estimatedProfit": "₹XXXX per ${farmerInput.farmSizeUnit}"
          }
        ]

        Important:
        - Prioritize crops that match the farmer's budget, farm size, and labor availability
        - Consider the irrigation type and water availability
        - Match crops to the soil type and climate
        - For beginners, prioritize easier crops with lower risk
        - Provide realistic market prices in Indian Rupees
        - Include detailed reasoning for each recommendation
        - Return ONLY valid JSON array, no markdown or extra text
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const aiRecommendations = JSON.parse(jsonMatch[0]);

        // Add IDs and imageUrl to recommendations
        const processedRecommendations = aiRecommendations.map(
          (crop: any, index: number) => ({
            ...crop,
            id: `ai-crop-${index}`,
            imageUrl: "/assets/quick-crop-wise.png",
          })
        );

        setRecommendations(processedRecommendations);

        toast({
          title: "Recommendations Generated",
          description: `Found ${processedRecommendations.length} crops perfect for your farm!`,
        });
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description:
          "Failed to generate AI recommendations. Showing default recommendations.",
        variant: "destructive",
      });
      setRecommendations(sampleRecommendations);
    } finally {
      setIsGeneratingRecommendations(false);
      setShowOnboarding(false);
    }
  };

  const handleNextStep = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      generateAIRecommendations();
    }
  };

  const handlePreviousStep = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const isStepValid = () => {
    switch (onboardingStep) {
      case 0:
        return farmerInput.farmSize && farmerInput.soilType;
      case 1:
        return farmerInput.laborAvailability && farmerInput.experience;
      case 2:
        return farmerInput.waterAvailability && farmerInput.irrigationType;
      case 3:
        return farmerInput.budget;
      default:
        return false;
    }
  };

  const filteredRecommendations = recommendations.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || crop.category === filterCategory;
    const matchesSeason =
      filterSeason === "all" || crop.bestSeason === filterSeason;
    return matchesSearch && matchesCategory && matchesSeason;
  });

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "High":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Low":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getWaterRequirementIcon = (requirement: string) => {
    switch (requirement) {
      case "High":
        return <Droplets className="h-4 w-4 text-blue-600" />;
      case "Medium":
        return <Droplets className="h-4 w-4 text-blue-400" />;
      case "Low":
        return <Droplets className="h-4 w-4 text-gray-400" />;
      default:
        return <Droplets className="h-4 w-4" />;
    }
  };

  const getProfitabilityStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < rating ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"
        }`}
      >
        ★
      </span>
    ));
  };

  const addToCropPlanner = (crop: CropRecommendation) => {
    try {
      // Get existing crop plans from localStorage
      const existingPlans = localStorage.getItem("cropPlans");
      let cropPlans = existingPlans ? JSON.parse(existingPlans) : [];

      // Get the highest ID
      const maxId =
        cropPlans.length > 0
          ? Math.max(...cropPlans.map((plan: any) => plan.id))
          : 0;

      // Create new crop plan
      const newPlan = {
        id: maxId + 1,
        crop: crop.name,
        area: `${farmerInput.farmSize} ${farmerInput.farmSizeUnit}`,
        variety: crop.scientificName,
        expectedYieldPerAcre: parseFloat(crop.yield.split("-")[0]) || 0,
        currentMarketPrice:
          parseFloat(crop.marketPrice.replace(/[^0-9.-]/g, "")) || 0,
        expenses: parseFloat(farmerInput.budget) || 0,
      };

      // Add to crop plans
      cropPlans.push(newPlan);
      localStorage.setItem("cropPlans", JSON.stringify(cropPlans));

      toast({
        title: "Added to Crop Planner",
        description: `${crop.name} has been added to your crop planner successfully!`,
      });

      // Close the dialog
      setSelectedCrop(null);
    } catch (error) {
      console.error("Error adding to crop planner:", error);
      toast({
        title: "Error",
        description: "Failed to add crop to planner. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Onboarding Screen
  if (showOnboarding) {
    return (
      <div className="pb-20 bg-background min-h-screen">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center gap-4 p-4">
            {onboardingStep > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousStep}
                className="text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                Farm Information
              </h1>
              <p className="text-sm text-muted-foreground">
                Step {onboardingStep + 1} of 4
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((onboardingStep + 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 space-y-6 max-w-2xl mx-auto">
          {/* Step 0: Farm Size & Soil */}
          {onboardingStep === 0 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Farm Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Farm Size *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Enter size"
                        className="flex-1 p-3 border border-border rounded-lg bg-background text-foreground"
                        value={farmerInput.farmSize}
                        onChange={(e) =>
                          setFarmerInput({
                            ...farmerInput,
                            farmSize: e.target.value,
                          })
                        }
                      />
                      <select
                        className="p-3 border border-border rounded-lg bg-background text-foreground"
                        value={farmerInput.farmSizeUnit}
                        onChange={(e) =>
                          setFarmerInput({
                            ...farmerInput,
                            farmSizeUnit: e.target.value,
                          })
                        }
                      >
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                        <option value="bigha">Bigha</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Soil Type *
                    </label>
                    <select
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                      value={farmerInput.soilType}
                      onChange={(e) =>
                        setFarmerInput({
                          ...farmerInput,
                          soilType: e.target.value,
                        })
                      }
                    >
                      <option value="">Select soil type</option>
                      <option value="Clay">Clay</option>
                      <option value="Loamy">Loamy</option>
                      <option value="Sandy">Sandy</option>
                      <option value="Sandy Loam">Sandy Loam</option>
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Black Cotton Soil">
                        Black Cotton Soil
                      </option>
                      <option value="Red Soil">Red Soil</option>
                      <option value="Alluvial">Alluvial</option>
                    </select>
                  </div>

                  {location && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>
                          {location.city} • {location.climate} Climate
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 1: Labor & Experience */}
          {onboardingStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Labor & Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Labor Availability *
                    </label>
                    <select
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                      value={farmerInput.laborAvailability}
                      onChange={(e) =>
                        setFarmerInput({
                          ...farmerInput,
                          laborAvailability: e.target.value,
                        })
                      }
                    >
                      <option value="">Select availability</option>
                      <option value="Abundant (5+ workers)">
                        Abundant (5+ workers)
                      </option>
                      <option value="Moderate (2-4 workers)">
                        Moderate (2-4 workers)
                      </option>
                      <option value="Limited (1 worker)">
                        Limited (1 worker)
                      </option>
                      <option value="Self only">Self only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Farming Experience *
                    </label>
                    <select
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                      value={farmerInput.experience}
                      onChange={(e) =>
                        setFarmerInput({
                          ...farmerInput,
                          experience: e.target.value,
                        })
                      }
                    >
                      <option value="">Select experience level</option>
                      <option value="Beginner (0-2 years)">
                        Beginner (0-2 years)
                      </option>
                      <option value="Intermediate (3-5 years)">
                        Intermediate (3-5 years)
                      </option>
                      <option value="Experienced (6-10 years)">
                        Experienced (6-10 years)
                      </option>
                      <option value="Expert (10+ years)">
                        Expert (10+ years)
                      </option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Water & Irrigation */}
          {onboardingStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-primary" />
                    Water & Irrigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Water Availability *
                    </label>
                    <select
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                      value={farmerInput.waterAvailability}
                      onChange={(e) =>
                        setFarmerInput({
                          ...farmerInput,
                          waterAvailability: e.target.value,
                        })
                      }
                    >
                      <option value="">Select water availability</option>
                      <option value="Abundant (River/Canal)">
                        Abundant (River/Canal)
                      </option>
                      <option value="Good (Well/Borewell)">
                        Good (Well/Borewell)
                      </option>
                      <option value="Moderate (Seasonal)">
                        Moderate (Seasonal)
                      </option>
                      <option value="Limited (Rainfed)">
                        Limited (Rainfed)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Irrigation Type *
                    </label>
                    <select
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                      value={farmerInput.irrigationType}
                      onChange={(e) =>
                        setFarmerInput({
                          ...farmerInput,
                          irrigationType: e.target.value,
                        })
                      }
                    >
                      <option value="">Select irrigation type</option>
                      <option value="Drip Irrigation">Drip Irrigation</option>
                      <option value="Sprinkler">Sprinkler</option>
                      <option value="Flood/Furrow">Flood/Furrow</option>
                      <option value="Rainfed">Rainfed</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Budget */}
          {onboardingStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Investment Budget
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Available Budget (per season) *
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 border border-border rounded-lg bg-muted text-foreground">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        className="flex-1 p-3 border border-border rounded-lg bg-background text-foreground"
                        value={farmerInput.budget}
                        onChange={(e) =>
                          setFarmerInput({
                            ...farmerInput,
                            budget: e.target.value,
                          })
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Include costs for seeds, fertilizers, labor, and other
                      inputs
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Summary</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        • Farm: {farmerInput.farmSize}{" "}
                        {farmerInput.farmSizeUnit}
                      </p>
                      <p>• Soil: {farmerInput.soilType}</p>
                      <p>• Labor: {farmerInput.laborAvailability}</p>
                      <p>• Water: {farmerInput.waterAvailability}</p>
                      <p>• Irrigation: {farmerInput.irrigationType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleNextStep}
            disabled={!isStepValid() || isGeneratingRecommendations}
          >
            {isGeneratingRecommendations ? (
              <>
                <Wheat className="h-5 w-5 mr-2 animate-spin" />
                Generating Recommendations...
              </>
            ) : onboardingStep === 3 ? (
              <>
                Get Recommendations
                <CheckCircle className="h-5 w-5 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pb-20 bg-background min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Wheat className="h-16 w-16 mx-auto text-primary animate-pulse mb-4" />
            <p className="text-foreground font-medium">
              Generating your personalized recommendations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-background min-h-screen">
      <div className="p-4 space-y-6">
        {/* Location Info */}
        {location && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{location.city}</p>
                  <p className="text-sm text-muted-foreground">
                    {location.region} • Climate: {location.climate} • Soil:{" "}
                    {location.soilType}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={getTranslatedText("Search crops")}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{getTranslatedText("All Categories")}</option>
              <option value="Grains">Grains</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Cash Crops">Cash Crops</option>
              <option value="Fruits">Fruits</option>
            </select>

            <select
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              className="flex-1 p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{getTranslatedText("All Seasons")}</option>
              <option value="Kharif">Kharif</option>
              <option value="Rabi">Rabi</option>
              <option value="All Season">All Season</option>
            </select>
          </div>
        </div>

        {/* Crop Recommendations */}
        <div className="space-y-4">
          {filteredRecommendations.map((crop) => (
            <Card key={crop.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-foreground text-lg">
                        {crop.name}
                      </h3>
                      <Badge className={getSuitabilityColor(crop.suitability)}>
                        {getTranslatedText(`${crop.suitability} Suitability`)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-2">
                      {crop.scientificName}
                    </p>
                    <Badge variant="outline" className="mb-3">
                      {crop.category}
                    </Badge>

                    {/* AI Reasoning */}
                    {(crop as any).reasoning && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-foreground leading-relaxed">
                          <strong className="text-primary">
                            Why this crop:{" "}
                          </strong>
                          {(crop as any).reasoning}
                        </p>
                      </div>
                    )}
                  </div>
                  <Wheat className="h-8 w-8 text-primary" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {getTranslatedText("Growth Duration")}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {crop.growthDuration}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {getTranslatedText("Expected Yield")}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {crop.yield}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getWaterRequirementIcon(crop.waterRequirement)}
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {getTranslatedText("Water Requirement")}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {crop.waterRequirement}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {getTranslatedText("Sunlight")}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {crop.sunlightRequirement}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {getTranslatedText("Profitability")}:
                    </span>
                    <div className="flex">
                      {getProfitabilityStars(crop.profitability)}
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(crop.difficulty)}>
                    {getTranslatedText("Difficulty")}: {crop.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-primary">
                      {crop.marketPrice}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Best Season: {crop.bestSeason}
                    </p>
                    {(crop as any).estimatedProfit && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                        Est. Profit: {(crop as any).estimatedProfit}
                      </p>
                    )}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCrop(crop)}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        {getTranslatedText("View Details")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Wheat className="h-5 w-5" />
                          {crop.name}
                        </DialogTitle>
                        <DialogDescription>
                          {crop.scientificName} • {crop.category}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">
                              Growth Duration:
                            </span>
                            <p className="text-muted-foreground">
                              {crop.growthDuration}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Expected Yield:</span>
                            <p className="text-muted-foreground">
                              {crop.yield}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Spacing:</span>
                            <p className="text-muted-foreground">
                              {crop.spacing}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Fertilizer:</span>
                            <p className="text-muted-foreground">
                              {crop.fertilizer}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-green-700">
                            Advantages:
                          </h4>
                          <ul className="text-sm space-y-1">
                            {crop.advantages.map((advantage, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                <span className="text-muted-foreground">
                                  {advantage}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-orange-700">
                            Considerations:
                          </h4>
                          <ul className="text-sm space-y-1">
                            {crop.considerations.map((consideration, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                                <span className="text-muted-foreground">
                                  {consideration}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">
                            Common Pests & Diseases:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {crop.pests.map((pest, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {pest}
                              </Badge>
                            ))}
                            {crop.diseases.map((disease, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {disease}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Add to Crop Planner Button */}
                        <Button
                          className="w-full"
                          onClick={() => addToCropPlanner(crop)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Crop Planner
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <Wheat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">No crops found</p>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropWise;
