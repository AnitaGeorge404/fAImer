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
  Timer,
  Droplets,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CropPlannerScreenProps {
  onBack?: () => void;
}

interface CropPlan {
  id: number;
  crop: string;
  startDate: string;
  endDate: string;
  area: string;
  status: "Active" | "Planned" | "Completed";
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
  // Crop database with market data and agricultural info
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
      startDate: "2025-03-01",
      endDate: "2025-06-01",
      area: "0.3 acres", // A more realistic plot size for a small farmer
      status: "Active" as const,
      sowingDate: "2025-03-01",
      lastWatered: "2025-08-20",
      fertilizedDate: "2025-08-15",
      expenses: 8000, // Reduced expenses for a smaller plot
    },
    {
      id: 2,
      crop: "Chilli",
      startDate: "2025-09-01",
      endDate: "2025-12-30",
      area: "0.1 acres", // Very small plot for high-value crop
      status: "Planned" as const,
      expenses: 5000,
    },
    {
      id: 3,
      crop: "Carrot", // Changed from Onion to a more common local crop
      startDate: "2024-11-01",
      endDate: "2025-04-01",
      area: "0.2 acres", // Small plot size
      status: "Completed" as const,
      expenses: 10000,
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CropPlan | null>(null);
  const [formData, setFormData] = useState<{
    crop: string;
    startDate: string;
    endDate: string;
    area: string;
    status: "Active" | "Planned" | "Completed";
  }>({
    crop: "",
    startDate: "",
    endDate: "",
    area: "",
    status: "Planned",
  });

  const cropOptions = [
    "Tomato",
    "Chilli",
    "Onion",
    "Rice",
    "Wheat",
    "Corn",
    "Potato",
    "Carrot",
    "Cabbage",
    "Lettuce",
    "Spinach",
    "Beans",
    "Peas",
    "Cucumber",
    "Pepper",
    "Brinjal",
    "Okra",
    "Cauliflower",
    "Broccoli",
    "Radish",
  ];

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

  const getDaysUntilHarvest = (endDate: string): number => {
    const today = new Date();
    const harvest = new Date(endDate);
    const diffTime = harvest.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCropProgress = (startDate: string, endDate: string): number => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
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

    if (plan.status === "Active" && cropData) {
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

      // Harvest reminder
      const daysUntilHarvest = getDaysUntilHarvest(plan.endDate);
      if (daysUntilHarvest <= 7 && daysUntilHarvest > 0) {
        tasks.push({
          type: "harvest",
          message: `Harvest in ${daysUntilHarvest} days`,
          urgency: "high",
        });
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

    const upcomingHarvests = cropPlans.filter((plan) => {
      const daysUntilHarvest = getDaysUntilHarvest(plan.endDate);
      return (
        daysUntilHarvest <= 30 &&
        daysUntilHarvest > 0 &&
        plan.status === "Active"
      );
    }).length;

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
        startDate: plan.startDate,
        endDate: plan.endDate,
        area: plan.area,
        status: plan.status,
      });
    } else {
      setFormData({
        crop: "",
        startDate: "",
        endDate: "",
        area: "",
        status: "Planned",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setFormData({
      crop: "",
      startDate: "",
      endDate: "",
      area: "",
      status: "Planned",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePlan = () => {
    if (
      !formData.crop ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.area
    ) {
      alert("Please fill in all fields");
      return;
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200";
      case "Planned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200";
      case "Completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
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

        {/* Smart Reminders */}
        {analytics.pendingTasks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                <Bell className="h-4 w-4 text-orange-600" />
                Upcoming Tasks ({analytics.pendingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {analytics.pendingTasks.slice(0, 3).map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50"
                  >
                    {task.type === "watering" && (
                      <Droplets className="h-4 w-4 text-blue-600" />
                    )}
                    {task.type === "fertilizer" && (
                      <Sprout className="h-4 w-4 text-green-600" />
                    )}
                    {task.type === "harvest" && (
                      <Calendar className="h-4 w-4 text-orange-600" />
                    )}
                    <span className="text-foreground">{task.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Crop Plans List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Your Crop Plans ({cropPlans.length})
          </h2>
          {cropPlans.map((plan) => {
            const cropData = cropDatabase[plan.crop];
            const progress = getCropProgress(plan.startDate, plan.endDate);
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
            const daysToHarvest = getDaysUntilHarvest(plan.endDate);

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
                        <Badge className={getStatusBadgeVariant(plan.status)}>
                          {plan.status}
                        </Badge>
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

                    {/* Progress Bar */}
                    {plan.status === "Active" && (
                      <div className="w-full rounded-full h-5 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1 mb-6">
                          <span>Sowing</span>
                          <span>Growing ({Math.round(progress)}%)</span>
                          <span>Harvest</span>
                        </div>
                      </div>
                    )}

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

                    {/* Timeline and Tips */}
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>
                        {plan.startDate} → {plan.endDate}
                      </span>
                      {plan.status === "Active" && (
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {daysToHarvest > 0
                            ? `${daysToHarvest} days to harvest`
                            : "Ready to harvest!"}
                        </span>
                      )}
                    </div>

                    {/* Crop Health Tips */}
                    {cropData && cropData.tips && plan.status === "Active" && (
                      <div className="bg-muted/50 p-2 rounded-lg text-xs">
                        <div className="flex items-center gap-1 text-foreground font-medium mb-1">
                          <AlertCircle className="h-3 w-3 text-orange-600" />
                          Monthly Tip
                        </div>
                        <div className="text-muted-foreground">
                          {cropData.tips[0]}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {cropPlans.filter((plan) => plan.status === "Active").length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Active Plans
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {cropPlans.filter((plan) => plan.status === "Planned").length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Planned Plans
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {
                    cropPlans.filter((plan) => plan.status === "Completed")
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Completed Plans
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <Select
                value={formData.crop}
                onValueChange={(value) => handleInputChange("crop", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a crop" />
                </SelectTrigger>
                <SelectContent>
                  {cropOptions.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "Active" | "Planned" | "Completed") =>
                  handleInputChange("status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  );
};

export default CropPlannerScreen;
