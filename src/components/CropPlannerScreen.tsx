import React, { useState, useMemo } from "react";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Sprout,
  ArrowLeft,
  X,
  Save,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Bell,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  BarChart3,
  Target,
  Droplets,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/contexts/TranslationContext";

interface CropPlannerScreenProps {
  onBack?: () => void;
}

interface CropPlan {
  id: number;
  crop: string;
  area: string;
  variety?: string;
  expectedYieldPerAcre?: number;
  currentMarketPrice?: number;
  sowingDate?: string;
  lastWatered?: string;
  fertilizedDate?: string;
  expenses?: number;
}

interface CropData {
  name: string;
  avgYieldPerAcre: number; // kg per acre
  currentPrice: number; // rupees per kg
  season: string;
  growthPeriod: number; // days
  waterRequirement: "High" | "Medium" | "Low";
  tips: string[];
}

const CropPlannerScreen: React.FC<CropPlannerScreenProps> = ({ onBack }) => {
  const { currentLanguage } = useTranslation();

  // Crop database with market data and agricultural info
  const cropDatabase: Record<string, CropData> = {
    Tomato: {
      name: "Tomato",
      avgYieldPerAcre: 8000, // Reduced to reflect lower-input, smaller plots.
      currentPrice: 28, // Adjusted to a more common, slightly lower local rate.
      season: "Summer",
      growthPeriod: 90,
      waterRequirement: "High",
      tips: [
        "Apply compost before planting",
        "Support with stakes",
        "Watch for blight",
      ],
    },
    Chilli: {
      name: "Chilli",
      avgYieldPerAcre: 3500, // Significant reduction for micro-plots.
      currentPrice: 80, // Lowered price for local, wholesale selling.
      season: "Summer",
      growthPeriod: 120,
      waterRequirement: "Medium",
      tips: [
        "Ensure good drainage",
        "Apply calcium spray",
        "Harvest regularly",
      ],
    },
    Onion: {
      name: "Onion",
      avgYieldPerAcre: 6500, // Reduced yield.
      currentPrice: 20, // Lowered price.
      season: "Winter",
      growthPeriod: 150,
      waterRequirement: "Medium",
      tips: [
        "Plant in raised beds",
        "Reduce watering before harvest",
        "Cure properly after harvest",
      ],
    },
    Rice: {
      name: "Rice",
      avgYieldPerAcre: 2000, // A more realistic yield for non-commercial plots.
      currentPrice: 20, // Lowered price.
      season: "Monsoon",
      growthPeriod: 120,
      waterRequirement: "High",
      tips: [
        "Maintain water levels",
        "Apply nitrogen fertilizer",
        "Watch for brown planthopper",
      ],
    },
    Wheat: {
      name: "Wheat",
      avgYieldPerAcre: 1500, // Reduced for smaller plots and varying soil quality.
      currentPrice: 18, // Lowered price.
      season: "Winter",
      growthPeriod: 120,
      waterRequirement: "Medium",
      tips: [
        "Sow at right time",
        "Apply urea at tillering",
        "Monitor for rust disease",
      ],
    },
    Corn: {
      name: "Corn",
      avgYieldPerAcre: 2800, // Reduced yield.
      currentPrice: 18, // Lowered price.
      season: "Summer",
      growthPeriod: 100,
      waterRequirement: "Medium",
      tips: [
        "Ensure adequate spacing",
        "Side-dress with nitrogen",
        "Watch for corn borer",
      ],
    },
    Potato: {
      name: "Potato",
      avgYieldPerAcre: 12000, // Reduced yield.
      currentPrice: 12, // A very conservative local price.
      season: "Winter",
      growthPeriod: 90,
      waterRequirement: "Medium",
      tips: [
        "Hill the soil around plants",
        "Avoid overwatering",
        "Harvest before flowering",
      ],
    },
    Carrot: {
      name: "Carrot",
      avgYieldPerAcre: 8500, // Reduced yield.
      currentPrice: 35, // A more realistic price for local markets.
      season: "Winter",
      growthPeriod: 75,
      waterRequirement: "Low",
      tips: [
        "Ensure loose soil",
        "Thin seedlings properly",
        "Avoid fresh manure",
      ],
    },
  };
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([
    {
      id: 1,
      crop: "Tomato",
      area: "0.3 acres", // A more realistic plot size for a small farmer
      sowingDate: "2025-03-01",
      lastWatered: "2025-08-20",
      fertilizedDate: "2025-08-15",
      expenses: 8000, // Reduced expenses for a smaller plot
    },
    {
      id: 2,
      crop: "Chilli",
      area: "0.1 acres", // Very small plot for high-value crop
      expenses: 5000,
    },
    {
      id: 3,
      crop: "Carrot", // Changed from Onion to a more common local crop
      area: "0.2 acres", // Small plot size
      expenses: 10000,
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CropPlan | null>(null);
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [selectedCropForTodo, setSelectedCropForTodo] =
    useState<CropPlan | null>(null);
  const [cropTodoList, setCropTodoList] = useState<any[]>([]);
  const [todoLoadingMessage, setTodoLoadingMessage] = useState<string>("");
  const [formData, setFormData] = useState<{
    crop: string;
    area: string;
  }>({
    crop: "",
    area: "",
  });

  // Advanced calculation functions
  const parseArea = (areaString: string): number => {
    const match = areaString.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const calculateEstimatedYield = (crop: string, area: string): number => {
    const cropData = cropDatabase[crop];
    if (!cropData) return 0;
    return cropData.avgYieldPerAcre * parseArea(area);
  };

  const calculateExpectedIncome = (crop: string, area: string): number => {
    const cropData = cropDatabase[crop];
    if (!cropData) return 0;
    const estimatedYield = calculateEstimatedYield(crop, area);
    return estimatedYield * cropData.currentPrice;
  };

  const calculateProfitMargin = (
    crop: string,
    area: string,
    expenses: number = 0
  ): number => {
    const expectedIncome = calculateExpectedIncome(crop, area);
    return expectedIncome - expenses;
  };

  const getWeatherIcon = (season: string) => {
    switch (season) {
      case "Summer":
        return <Sun className="h-4 w-4 text-orange-500" />;
      case "Monsoon":
        return <CloudRain className="h-4 w-4 text-blue-500" />;
      case "Winter":
        return <Cloud className="h-4 w-4 text-gray-500" />;
      default:
        return <Sun className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getUpcomingTasks = (plan: CropPlan) => {
    const tasks = [];
    const today = new Date();
    const cropData = cropDatabase[plan.crop];

    if (cropData) {
      // Water reminder (every 3 days)
      if (plan.lastWatered) {
        const lastWater = new Date(plan.lastWatered);
        const daysSinceWater = Math.floor(
          (today.getTime() - lastWater.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceWater >= 3) {
          tasks.push({
            type: "watering",
            message: `Watering overdue by ${daysSinceWater} days`,
            urgency: "high",
          });
        } else if (daysSinceWater === 2) {
          tasks.push({
            type: "watering",
            message: "Watering due tomorrow",
            urgency: "medium",
          });
        }
      }

      // Fertilizer reminder (every 15 days)
      if (plan.fertilizedDate) {
        const lastFertilizer = new Date(plan.fertilizedDate);
        const daysSinceFertilizer = Math.floor(
          (today.getTime() - lastFertilizer.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceFertilizer >= 15) {
          tasks.push({
            type: "fertilizer",
            message: `Fertilizer application due`,
            urgency: "medium",
          });
        }
      }
    }

    return tasks;
  };

  // Memoized calculations for performance
  const analytics = useMemo(() => {
    const totalArea = cropPlans.reduce(
      (sum, plan) => sum + parseArea(plan.area),
      0
    );
    const totalExpectedYield = cropPlans.reduce(
      (sum, plan) => sum + calculateEstimatedYield(plan.crop, plan.area),
      0
    );
    const totalExpectedIncome = cropPlans.reduce(
      (sum, plan) => sum + calculateExpectedIncome(plan.crop, plan.area),
      0
    );
    const totalExpenses = cropPlans.reduce(
      (sum, plan) => sum + (plan.expenses || 0),
      0
    );
    const totalProfit = totalExpectedIncome - totalExpenses;

    const upcomingHarvests = 0; // Removed date-based logic

    const allTasks = cropPlans.flatMap((plan) => getUpcomingTasks(plan));

    return {
      totalArea,
      totalExpectedYield: Math.round(totalExpectedYield),
      totalExpectedIncome: Math.round(totalExpectedIncome),
      totalExpenses,
      totalProfit: Math.round(totalProfit),
      upcomingHarvests,
      pendingTasks: allTasks,
    };
  }, [cropPlans]);

  const handleOpenModal = (plan: CropPlan | null = null) => {
    setSelectedPlan(plan);
    if (plan) {
      setFormData({
        crop: plan.crop,
        area: plan.area,
      });
    } else {
      setFormData({
        crop: "",
        area: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setFormData({
      crop: "",
      area: "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateCropTodoList = (crop: string, area: string) => {
    // Comprehensive hardcoded todo lists for different crops
    const cropTodoLists = {
      tomato: [
        {
          day: 1,
          tasks: [
            "Prepare soil with compost and organic matter",
            "Test soil pH (optimal 6.0-6.8) and adjust if needed",
            "Set up drip irrigation system for efficient watering",
            "Apply neem cake as natural pest deterrent",
          ],
        },
        {
          day: 2,
          tasks: [
            "Plant tomato seedlings 18-24 inches apart",
            "Install bamboo stakes or tomato cages for support",
            "Apply balanced NPK fertilizer (10-10-10) around plants",
            "Water gently at soil level to avoid leaf diseases",
          ],
        },
        {
          day: 3,
          tasks: [
            "Apply organic mulch around plants to retain moisture",
            "Check for early signs of pests like aphids or whiteflies",
            "Prune lower leaves touching the ground",
            "Monitor soil moisture and water if top inch is dry",
          ],
        },
      ],
      chilli: [
        {
          day: 1,
          tasks: [
            "Prepare well-drained soil with organic compost",
            "Ensure good air circulation for disease prevention",
            "Set up raised beds for better drainage",
            "Apply bone meal for phosphorus-rich soil",
          ],
        },
        {
          day: 2,
          tasks: [
            "Plant chilli seedlings with 12-15 inch spacing",
            "Apply calcium-rich fertilizer to prevent blossom end rot",
            "Install support stakes for heavy fruiting varieties",
            "Water moderately - chillies prefer slightly dry conditions",
          ],
        },
        {
          day: 3,
          tasks: [
            "Apply light mulch to conserve moisture",
            "Check for thrips and spider mites under leaves",
            "Pinch off flower buds for first 2-3 weeks for stronger plants",
            "Monitor for proper drainage after watering",
          ],
        },
      ],
      rice: [
        {
          day: 1,
          tasks: [
            "Prepare and level paddy field with proper bunding",
            "Ensure water inlet and outlet channels are clear",
            "Apply farmyard manure and incorporate into soil",
            "Check water pH (optimal 6.0-7.0) and quality",
          ],
        },
        {
          day: 2,
          tasks: [
            "Soak rice seeds in water for 24 hours before sowing",
            "Prepare nursery beds with fine, well-leveled soil",
            "Broadcast pre-soaked seeds evenly in nursery",
            "Maintain 2-3 cm water level in nursery beds",
          ],
        },
        {
          day: 3,
          tasks: [
            "Transplant 20-25 day old seedlings to main field",
            "Maintain continuous 3-5 cm water level",
            "Apply urea fertilizer for initial nitrogen boost",
            "Remove weeds manually to prevent competition",
          ],
        },
      ],
      wheat: [
        {
          day: 1,
          tasks: [
            "Deep till the soil to 20-25 cm depth",
            "Apply well-decomposed farmyard manure",
            "Level the field properly for uniform water distribution",
            "Apply recommended dose of phosphorus fertilizer",
          ],
        },
        {
          day: 2,
          tasks: [
            "Sow wheat seeds using seed drill or broadcast method",
            "Maintain proper seed rate (40-50 kg per acre)",
            "Apply light irrigation immediately after sowing",
            "Apply pre-emergence herbicide if needed",
          ],
        },
        {
          day: 3,
          tasks: [
            "Check for proper germination (7-10 days)",
            "Apply first dose of nitrogen fertilizer at 3-4 leaf stage",
            "Monitor for early pest problems like termites",
            "Ensure proper moisture but avoid waterlogging",
          ],
        },
      ],
      onion: [
        {
          day: 1,
          tasks: [
            "Prepare raised beds with good drainage system",
            "Add well-decomposed compost to improve soil structure",
            "Ensure soil pH between 6.0-7.0 for optimal growth",
            "Install drip irrigation for precise water management",
          ],
        },
        {
          day: 2,
          tasks: [
            "Plant onion seedlings or sets 4-6 inches apart",
            "Plant with proper depth - bulb should be just below surface",
            "Apply balanced fertilizer with emphasis on phosphorus",
            "Water gently to settle soil around roots",
          ],
        },
        {
          day: 3,
          tasks: [
            "Apply light irrigation to maintain consistent moisture",
            "Remove competing weeds carefully by hand",
            "Check for thrips damage on leaves",
            "Apply organic mulch between rows to suppress weeds",
          ],
        },
      ],
      corn: [
        {
          day: 1,
          tasks: [
            "Prepare field with deep plowing and harrowing",
            "Apply organic matter and balanced fertilizer",
            "Create proper spacing between planting rows",
            "Ensure good drainage to prevent waterlogging",
          ],
        },
        {
          day: 2,
          tasks: [
            "Plant corn seeds 1-2 inches deep with proper spacing",
            "Apply starter fertilizer high in phosphorus",
            "Water immediately after planting if soil is dry",
            "Mark rows clearly for easy cultivation",
          ],
        },
        {
          day: 3,
          tasks: [
            "Monitor for germination (5-7 days in warm soil)",
            "Check for cutworm and other early pest damage",
            "Side-dress with nitrogen fertilizer if needed",
            "Ensure adequate moisture for strong root development",
          ],
        },
      ],
      potato: [
        {
          day: 1,
          tasks: [
            "Prepare well-drained soil with organic compost",
            "Create raised rows or ridges for better drainage",
            "Ensure soil temperature is cool for planting",
            "Apply balanced fertilizer before planting",
          ],
        },
        {
          day: 2,
          tasks: [
            "Plant seed potatoes with eyes facing up",
            "Space tubers 8-10 inches apart in rows",
            "Cover with 2-3 inches of loose soil",
            "Water lightly to initiate sprouting",
          ],
        },
        {
          day: 3,
          tasks: [
            "Monitor soil moisture - keep consistently moist but not wet",
            "Watch for early emergence of shoots",
            "Begin hilling soil around plants as they grow",
            "Check for early signs of pest problems",
          ],
        },
      ],
      carrot: [
        {
          day: 1,
          tasks: [
            "Prepare loose, well-drained soil free of stones",
            "Add compost but avoid fresh manure",
            "Create fine seedbed with smooth soil surface",
            "Ensure proper pH between 6.0-6.8",
          ],
        },
        {
          day: 2,
          tasks: [
            "Sow carrot seeds thinly in shallow furrows",
            "Cover seeds lightly with fine soil",
            "Water gently with fine spray to avoid disturbing seeds",
            "Mark planting areas clearly",
          ],
        },
        {
          day: 3,
          tasks: [
            "Keep soil consistently moist for germination",
            "Watch for germination (10-14 days)",
            "Thin seedlings when 2 inches tall",
            "Remove weeds carefully to avoid root damage",
          ],
        },
      ],
      default: [
        {
          day: 1,
          tasks: [
            "Prepare soil thoroughly with organic matter",
            "Test soil pH and nutrient levels",
            "Plan efficient irrigation and drainage system",
            "Apply appropriate base fertilizer for crop type",
          ],
        },
        {
          day: 2,
          tasks: [
            "Plant seeds or seedlings with proper spacing",
            "Apply mulch if beneficial for the crop",
            "Set up plant support systems if needed",
            "Water appropriately based on crop requirements",
          ],
        },
        {
          day: 3,
          tasks: [
            "Monitor for proper germination or establishment",
            "Check for early pest and disease symptoms",
            "Adjust watering schedule based on weather",
            "Remove weeds that compete with crop plants",
          ],
        },
      ],
    };

    // Get crop-specific todos
    const cropKey = crop.toLowerCase() as keyof typeof cropTodoLists;
    const selectedTodos = cropTodoLists[cropKey] || cropTodoLists.default;

    console.log(`Generated todo list for ${crop} on ${area}`);
    setTodoLoadingMessage(`Farming plan loaded for ${crop}`);

    return selectedTodos;
  };

  const handleSavePlan = async () => {
    if (!formData.crop || !formData.area) {
      alert("Please fill in all fields");
      return;
    }

    // Generate todo list for new plans
    let todoList = null;
    if (!selectedPlan) {
      setTodoLoadingMessage("Generating farming plan...");
      todoList = generateCropTodoList(formData.crop, formData.area);

      // Save todo list to localStorage
      if (todoList) {
        localStorage.setItem(
          "cropTodoList",
          JSON.stringify({
            crop: formData.crop,
            area: formData.area,
            todoList: todoList,
            createdAt: new Date().toISOString(),
          })
        );
      }
    }

    if (selectedPlan) {
      // Update existing plan
      setCropPlans((prev) =>
        prev.map((plan) =>
          plan.id === selectedPlan.id ? { ...selectedPlan, ...formData } : plan
        )
      );
    } else {
      // Add new plan
      const newPlan: CropPlan = {
        id: Date.now(),
        ...formData,
      };
      setCropPlans((prev) => [...prev, newPlan]);
    }
    handleCloseModal();
  };

  const handleAddPlan = (newPlan: CropPlan) => {
    setCropPlans([...cropPlans, { ...newPlan, id: Date.now() }]);
    handleCloseModal();
  };

  const handleUpdatePlan = (updatedPlan: CropPlan) => {
    setCropPlans(
      cropPlans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    );
    handleCloseModal();
  };

  const handleDeletePlan = (id: number) => {
    if (confirm("Are you sure you want to delete this crop plan?")) {
      setCropPlans(cropPlans.filter((plan) => plan.id !== id));
    }
  };

  const handleViewTodoList = (plan: CropPlan) => {
    setSelectedCropForTodo(plan);
    setIsTodoModalOpen(true);
    setTodoLoadingMessage("Loading farming tasks...");

    // Generate todo list for the selected crop
    try {
      const todoList = generateCropTodoList(plan.crop, plan.area);
      setCropTodoList(todoList || []);
    } catch (error) {
      console.error("Error generating todo list:", error);
      setTodoLoadingMessage("Error loading tasks, please try again");
      setCropTodoList([]);
    }
  };

  return (
    <div className="pb-20 bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Crop Planner
              </h1>
              <p className="text-muted-foreground text-sm">
                Plan your farming calendar with smart analytics
              </p>
            </div>
          </div>
          <Button
            className="w-half bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
            size="sm"
            onClick={() => handleOpenModal()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Plan
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <BarChart3 className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold text-foreground">
                {analytics.totalArea.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Total Acres</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <Target className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <div className="text-lg font-semibold text-foreground">
                {(analytics.totalExpectedYield / 1000).toFixed(1)}t
              </div>
              <div className="text-xs text-muted-foreground">
                Expected Yield
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-blue-600" />
              <div className="text-lg font-semibold text-foreground">
                ₹{(analytics.totalExpectedIncome / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-muted-foreground">
                Expected Income
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-orange-600" />
              <div className="text-lg font-semibold text-foreground">
                ₹{(analytics.totalProfit / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-muted-foreground">Est. Profit</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Crop Plans List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Your Crop Plans ({cropPlans.length})
          </h2>
          {cropPlans.map((plan) => {
            const cropData = cropDatabase[plan.crop];
            const expectedYield = calculateEstimatedYield(plan.crop, plan.area);
            const expectedIncome = calculateExpectedIncome(
              plan.crop,
              plan.area
            );
            const profit = calculateProfitMargin(
              plan.crop,
              plan.area,
              plan.expenses || 0
            );

            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-foreground">
                          {plan.crop}
                        </h3>
                        {cropData && getWeatherIcon(cropData.season)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenModal(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-4">
                      <div className="text-center bg-muted/50 p-2 rounded-lg">
                        <div className="font-semibold text-foreground">
                          {plan.area}
                        </div>
                        <div className="text-muted-foreground">Area</div>
                      </div>
                      <div className="text-center bg-muted/50 p-2 rounded-lg">
                        <div className="font-semibold text-green-600">
                          {(expectedYield / 1000).toFixed(1)}t
                        </div>
                        <div className="text-muted-foreground">Est. Yield</div>
                      </div>
                      <div className="text-center bg-muted/50 p-2 rounded-lg">
                        <div className="font-semibold text-blue-600">
                          ₹{(expectedIncome / 1000).toFixed(0)}k
                        </div>
                        <div className="text-muted-foreground">Est. Income</div>
                      </div>
                      <div className="text-center bg-muted/50 p-2 rounded-lg">
                        <div
                          className={`font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          ₹{(profit / 1000).toFixed(0)}k
                        </div>
                        <div className="text-muted-foreground">
                          {profit >= 0 ? "Profit" : "Loss"}
                        </div>
                      </div>
                    </div>

                    {/* View Todo List Button */}
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-sm"
                        onClick={() => handleViewTodoList(plan)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        View Todo List for {plan.crop}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add New Plan Button */}
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
          onClick={() => handleOpenModal()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Crop Plan
        </Button>
      </div>

      {/* Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? "Edit Crop Plan" : "Add New Crop Plan"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="crop">Crop Type</Label>
              <Input
                id="crop"
                placeholder="Enter crop type (e.g., Tomato, Rice, Wheat)"
                value={formData.crop}
                onChange={(e) => handleInputChange("crop", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                placeholder="e.g., 1 acre, 0.5 hectare"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePlan}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {selectedPlan ? "Update Plan" : "Save Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Todo List Modal Dialog */}
      <Dialog open={isTodoModalOpen} onOpenChange={setIsTodoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCropForTodo?.crop} Todo List</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            {todoLoadingMessage && (
              <div className="text-center py-2">
                <p className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 p-2 rounded-lg">
                  {todoLoadingMessage}
                </p>
              </div>
            )}
            {cropTodoList.length > 0 ? (
              <div className="space-y-3">
                {cropTodoList.map((dayTodo, dayIndex) => (
                  <div key={dayIndex} className="space-y-2">
                    <h3 className="font-semibold text-sm text-foreground">
                      Day {dayTodo.day}
                    </h3>
                    <div className="space-y-2 pl-4">
                      {dayTodo.tasks.map((task: string, taskIndex: number) => (
                        <div
                          key={taskIndex}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : todoLoadingMessage.includes("Loading") ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Loading farming tasks...
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No todo list available for this crop
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsTodoModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CropPlannerScreen;
