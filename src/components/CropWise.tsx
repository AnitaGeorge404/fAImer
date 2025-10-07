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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(
    null
  );
  const { toast } = useToast();

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
    loadRecommendations();
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

  const loadRecommendations = () => {
    setTimeout(() => {
      setRecommendations(sampleRecommendations);
      setIsLoading(false);
    }, 1500);
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

  if (isLoading) {
    return (
      <div className="pb-20 bg-background min-h-screen">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center gap-4 p-4">
            
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {getTranslatedText("CropWise Recommendations")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {getTranslatedText(
                  "Smart crop recommendations for your region"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Wheat className="h-16 w-16 mx-auto text-primary animate-pulse mb-4" />
              <p className="text-foreground font-medium">
                {getTranslatedText("Loading recommendations...")}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {getTranslatedText("Getting your location...")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {getTranslatedText("CropWise Recommendations")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {getTranslatedText("Smart crop recommendations for your region")}
            </p>
          </div>
        </div>
      </div>

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
