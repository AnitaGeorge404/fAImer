
import React, { useState } from 'react';
import { Users, MessageCircle, Settings, TrendingUp, Lightbulb, ArrowLeft, Thermometer, Droplet, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FarmingTwinScreenProps {
  onBack?: () => void;
}

const FarmingTwinScreen: React.FC<FarmingTwinScreenProps> = ({ onBack }) => {
  const twinData = {
    farmName: "Ramesh's Farm",
    totalArea: "2.5 acres",
    activeFields: 3,
    currentCrops: ["Tomato", "Chilli", "Onion"],
    soilHealth: 85,
    weatherCondition: "Partly Cloudy",
    temperature: "28°C",
    humidity: "65%",
    lastIrrigation: "2 days ago"
  };

  const fieldData = [
    {
      field: "Field A",
      crop: "Tomato",
      area: "1 acre",
      plantingDate: "2024-01-15",
      expectedHarvest: "2024-04-15",
      currentStage: "Flowering",
      health: 92,
      irrigation: "Good",
      issues: 0
    },
    {
      field: "Field B",
      crop: "Chilli",
      area: "0.8 acre",
      plantingDate: "2024-02-01",
      expectedHarvest: "2024-05-01",
      currentStage: "Vegetative",
      health: 78,
      irrigation: "Needs Water",
      issues: 1
    },
    {
      field: "Field C",
      crop: "Onion",
      area: "0.7 acre",
      plantingDate: "2024-01-10",
      expectedHarvest: "2024-04-10",
      currentStage: "Bulb Formation",
      health: 88,
      irrigation: "Good",
      issues: 0
    }
  ];

  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-green-600 dark:text-green-400";
    if (health >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getHealthBadge = (health: number) => {
    if (health >= 80) return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    if (health >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
  };

  return (
    <div className="pb-20 bg-gray-50 dark:bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="mr-3 text-white hover:bg-white/20 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Farming Twin</h1>
              <p className="text-purple-100 dark:text-purple-200 text-sm">AI-powered farming assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 dark:hover:bg-white/10">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Farm Overview */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base text-foreground">{twinData.farmName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{twinData.totalArea}</p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Total Area</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{twinData.activeFields}</p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Active Fields</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 dark:bg-accent rounded">
                <Thermometer className="h-4 w-4 mx-auto mb-1 text-orange-600 dark:text-orange-400" />
                <p className="text-xs text-gray-600 dark:text-muted-foreground">{twinData.temperature}</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-accent rounded">
                <Droplet className="h-4 w-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                <p className="text-xs text-gray-600 dark:text-muted-foreground">{twinData.humidity}</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-accent rounded">
                <Calendar className="h-4 w-4 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                <p className="text-xs text-gray-600 dark:text-muted-foreground">{twinData.lastIrrigation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Field Details */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-foreground">Field Status</h2>
          {fieldData.map((field, index) => (
            <Card key={index} className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 dark:text-foreground">{field.field}</h3>
                  <Badge className={getHealthBadge(field.health)}>
                    {field.health}% Health
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-muted-foreground">Crop: <span className="font-medium text-gray-800 dark:text-foreground">{field.crop}</span></p>
                    <p className="text-gray-600 dark:text-muted-foreground">Area: <span className="font-medium text-gray-800 dark:text-foreground">{field.area}</span></p>
                    <p className="text-gray-600 dark:text-muted-foreground">Stage: <span className="font-medium text-gray-800 dark:text-foreground">{field.currentStage}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-muted-foreground">Irrigation: <span className={`font-medium ${field.irrigation === 'Good' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>{field.irrigation}</span></p>
                    <p className="text-gray-600 dark:text-muted-foreground">Harvest: <span className="font-medium text-gray-800 dark:text-foreground">{new Date(field.expectedHarvest).toLocaleDateString()}</span></p>
                    <p className="text-gray-600 dark:text-muted-foreground">Issues: <span className={`font-medium ${field.issues === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{field.issues}</span></p>
                  </div>
                </div>
                
                {field.issues > 0 && (
                  <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                      <span className="text-sm text-orange-800 dark:text-orange-300">Requires attention - Check irrigation system</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Recommendations */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base text-foreground">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Irrigation</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">Field B needs irrigation within 24 hours</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded">
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Fertilization</h4>
              <p className="text-sm text-green-700 dark:text-green-300">Apply potassium fertilizer to tomato field next week</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded">
              <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Harvest Planning</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">Onion harvest ready in 2 weeks - prepare storage</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmingTwinScreen;
