import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  TestTube,
  Leaf,
  Droplets,
  Bug,
  Sun,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface KnowledgeScreenProps {
  onBack?: () => void;
}

const KnowledgeScreen: React.FC<KnowledgeScreenProps> = ({ onBack }) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const knowledgeSections = [
    {
      id: "soil-testing",
      title: "Soil Testing & pH Detection",
      icon: TestTube,
      color: "text-blue-600",
      content: {
        introduction:
          "Learn to test your soil using simple homemade methods to determine pH levels and nutrient deficiencies.",
        methods: [
          {
            title: "Baking Soda pH Test",
            description:
              "Mix 2 tablespoons of soil with 2 tablespoons of distilled water. Add 1/2 tablespoon of baking soda. If it fizzes, your soil is acidic (pH below 7).",
            materials: [
              "Soil sample",
              "Distilled water",
              "Baking soda",
              "Small container",
            ],
          },
          {
            title: "Vinegar pH Test",
            description:
              "Mix soil with distilled water as above, then add white vinegar. If it fizzes, your soil is alkaline (pH above 7).",
            materials: [
              "Soil sample",
              "Distilled water",
              "White vinegar",
              "Small container",
            ],
          },
          {
            title: "Red Cabbage Indicator",
            description:
              "Boil red cabbage leaves to make purple water. Mix with soil sample. Purple = neutral, pink/red = acidic, green/blue = alkaline.",
            materials: [
              "Red cabbage leaves",
              "Boiling water",
              "Soil sample",
              "Strainer",
            ],
          },
        ],
        remedies: [
          {
            problem: "Acidic Soil (pH < 6.5)",
            solution:
              "Add crushed eggshells, wood ash, or lime. For quick fix: 1 tablespoon baking soda per gallon of water for watering.",
          },
          {
            problem: "Alkaline Soil (pH > 7.5)",
            solution:
              "Add coffee grounds, pine needles, or peat moss. For quick fix: 1 tablespoon vinegar per gallon of water.",
          },
          {
            problem: "Compacted Soil",
            solution:
              "Add organic matter like compost, aged manure, or shredded leaves. Till gently to improve drainage.",
          },
        ],
      },
    },
    {
      id: "crop-diseases",
      title: "Disease Identification & Treatment",
      icon: Bug,
      color: "text-red-600",
      content: {
        introduction:
          "Identify common plant diseases early and treat them with natural homemade remedies.",
        diseases: [
          {
            name: "Powdery Mildew",
            symptoms: "White powdery coating on leaves",
            remedy:
              "Mix 1 tsp baking soda + 1/2 tsp liquid soap + 1 quart water. Spray weekly.",
            prevention: "Ensure good air circulation, avoid overhead watering",
          },
          {
            name: "Leaf Spot",
            symptoms: "Brown or black spots on leaves",
            remedy:
              "Mix 2 tbsp neem oil + 1 tbsp mild dish soap + 1 gallon water. Spray affected areas.",
            prevention:
              "Water at soil level, remove infected leaves immediately",
          },
          {
            name: "Root Rot",
            symptoms: "Yellowing leaves, wilting, soft black roots",
            remedy:
              "Improve drainage, reduce watering. Mix 1 tbsp hydrogen peroxide in 1 cup water for soil treatment.",
            prevention:
              "Well-draining soil, proper spacing, avoid overwatering",
          },
          {
            name: "Aphid Infestation",
            symptoms: "Small green/black insects on leaves",
            remedy:
              "Mix 2 tbsp dish soap + 1 quart water. Spray directly on aphids.",
            prevention: "Companion planting with marigolds, regular inspection",
          },
        ],
      },
    },
    {
      id: "seasonal-guide",
      title: "Seasonal Farming Calendar",
      icon: Calendar,
      color: "text-green-600",
      content: {
        seasons: [
          {
            season: "Spring (March-May)",
            activities: [
              "Prepare seedbeds and start seedlings indoors",
              "Plant cool-season crops: lettuce, peas, carrots",
              "Apply compost and organic fertilizers",
              "Prune fruit trees before bud break",
            ],
            tips: "Soil temperature should be 50-60°F for most seeds",
          },
          {
            season: "Summer (June-August)",
            activities: [
              "Plant warm-season crops: tomatoes, peppers, beans",
              "Implement regular watering schedule",
              "Mulch around plants to retain moisture",
              "Monitor for pests and diseases daily",
            ],
            tips: "Water early morning or evening to reduce evaporation",
          },
          {
            season: "Monsoon/Rainy (June-September)",
            activities: [
              "Plant rice, sugarcane, and monsoon vegetables",
              "Ensure proper drainage to prevent waterlogging",
              "Apply fungicide treatments preventively",
              "Harvest early summer crops before heavy rains",
            ],
            tips: "Cover sensitive crops during heavy rainfall",
          },
          {
            season: "Winter (December-February)",
            activities: [
              "Plant winter vegetables: cabbage, cauliflower, spinach",
              "Protect plants from frost with row covers",
              "Plan next year's crop rotation",
              "Maintain and repair farm equipment",
            ],
            tips: "Use cold frames or greenhouses for extended growing season",
          },
        ],
      },
    },
    {
      id: "water-management",
      title: "Water Management & Conservation",
      icon: Droplets,
      color: "text-cyan-600",
      content: {
        techniques: [
          {
            method: "Drip Irrigation DIY",
            description:
              "Create efficient watering system using plastic bottles",
            steps: [
              "Pierce small holes in plastic bottle cap",
              "Fill bottle with water and invert near plant roots",
              "Adjust hole size for desired drip rate",
              "Refill bottles every 2-3 days",
            ],
          },
          {
            method: "Mulching for Moisture",
            description: "Retain soil moisture and reduce watering needs",
            materials: ["Straw, leaves, grass clippings, newspaper"],
            benefits: [
              "Reduces evaporation by 70%",
              "Suppresses weeds",
              "Adds organic matter as it decomposes",
            ],
          },
          {
            method: "Rainwater Harvesting",
            description: "Collect and store rainwater for irrigation",
            setup: [
              "Install gutters and downspouts",
              "Connect to storage barrels or tanks",
              "Add first-flush diverter for cleaner water",
              "Cover storage to prevent mosquito breeding",
            ],
          },
        ],
        wateringTips: [
          "Water deeply but less frequently to encourage deep root growth",
          "Check soil moisture by inserting finger 2 inches deep",
          "Water early morning (6-10 AM) for best absorption",
          "Use gray water from kitchen for non-edible plants",
        ],
      },
    },
    {
      id: "organic-fertilizers",
      title: "Homemade Organic Fertilizers",
      icon: Leaf,
      color: "text-emerald-600",
      content: {
        recipes: [
          {
            name: "Compost Tea",
            ingredients: ["Finished compost", "Water", "Molasses (optional)"],
            method:
              "Steep 1 cup compost in 1 gallon water for 24-48 hours. Strain and dilute 1:10 before use.",
            benefits: "Rich in nutrients and beneficial microorganisms",
          },
          {
            name: "Banana Peel Fertilizer",
            ingredients: ["Banana peels", "Water"],
            method:
              "Soak chopped banana peels in water for 2 weeks. Use liquid to water plants.",
            benefits:
              "High in potassium, good for flowering and fruit development",
          },
          {
            name: "Eggshell Calcium",
            ingredients: ["Clean eggshells"],
            method:
              "Crush eggshells and sprinkle around plants or add to compost.",
            benefits: "Provides calcium, prevents blossom end rot in tomatoes",
          },
          {
            name: "Coffee Ground Amendment",
            ingredients: ["Used coffee grounds", "Brown materials"],
            method:
              "Mix with 4x volume of brown materials (leaves, paper) before adding to soil.",
            benefits: "Adds nitrogen and improves soil structure",
          },
        ],
        applicationSchedule: [
          "Early Spring: Apply compost and slow-release organic fertilizers",
          "Growing Season: Weekly liquid fertilizer applications",
          "Pre-flowering: Increase phosphorus with bone meal or rock phosphate",
          "Fall: Apply compost and organic matter for winter soil improvement",
        ],
      },
    },
    {
      id: "companion-planting",
      title: "Companion Planting Guide",
      icon: Sun,
      color: "text-orange-600",
      content: {
        combinations: [
          {
            mainCrop: "Tomatoes",
            companions: ["Basil", "Marigolds", "Carrots"],
            benefits:
              "Basil improves flavor, marigolds repel pests, carrots loosen soil",
            avoid: "Fennel, walnut trees",
          },
          {
            mainCrop: "Corn",
            companions: ["Beans", "Squash"],
            benefits:
              "Three Sisters: beans fix nitrogen, squash suppresses weeds",
            avoid: "Tomatoes",
          },
          {
            mainCrop: "Carrots",
            companions: ["Chives", "Leeks", "Rosemary"],
            benefits: "Aromatic herbs repel carrot fly",
            avoid: "Dill, parsnips",
          },
          {
            mainCrop: "Cabbage Family",
            companions: ["Dill", "Onions", "Potatoes"],
            benefits:
              "Dill attracts beneficial insects, onions repel cabbage worms",
            avoid: "Strawberries, tomatoes",
          },
        ],
        principles: [
          "Plant tall crops on north side to avoid shading shorter plants",
          "Group plants with similar water and nutrient needs",
          "Use aromatic herbs to confuse pests",
          "Rotate crop families annually to prevent soil depletion",
        ],
      },
    },
  ];

  return (
    <div className="pb-20 bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              Knowledge Center
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="text-muted-foreground mb-6">
          Comprehensive farming knowledge and practical solutions using homemade
          remedies and natural methods.
        </p>

        <div className="space-y-4">
          {knowledgeSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id];

            return (
              <Card key={section.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className="w-full p-4 justify-between hover:bg-muted/50"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${section.color}`} />
                      <span className="font-medium text-foreground">
                        {section.title}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border">
                      {/* Soil Testing Content */}
                      {section.id === "soil-testing" && (
                        <>
                          <p className="text-sm text-muted-foreground mt-4">
                            {section.content.introduction}
                          </p>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground">
                              Testing Methods:
                            </h4>
                            {section.content.methods?.map((method, idx) => (
                              <div
                                key={idx}
                                className="bg-muted/50 rounded-lg p-3"
                              >
                                <h5 className="font-medium text-sm text-foreground mb-2">
                                  {method.title}
                                </h5>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {method.description}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                  <strong>Materials needed:</strong>{" "}
                                  {method.materials.join(", ")}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground">
                              Common Problems & Solutions:
                            </h4>
                            {section.content.remedies?.map((remedy, idx) => (
                              <div
                                key={idx}
                                className="border-l-2 border-primary pl-3"
                              >
                                <h5 className="font-medium text-sm text-foreground">
                                  {remedy.problem}
                                </h5>
                                <p className="text-xs text-muted-foreground">
                                  {remedy.solution}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Disease Content */}
                      {section.id === "crop-diseases" && (
                        <>
                          <p className="text-sm text-muted-foreground mt-4">
                            {section.content.introduction}
                          </p>

                          <div className="grid gap-3">
                            {section.content.diseases?.map((disease, idx) => (
                              <div
                                key={idx}
                                className="bg-muted/50 rounded-lg p-3"
                              >
                                <h5 className="font-medium text-sm text-foreground">
                                  {disease.name}
                                </h5>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <strong>Symptoms:</strong> {disease.symptoms}
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <strong>Treatment:</strong> {disease.remedy}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  <strong>Prevention:</strong>{" "}
                                  {disease.prevention}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Seasonal Guide Content */}
                      {section.id === "seasonal-guide" && (
                        <div className="grid gap-3">
                          {section.content.seasons?.map((season, idx) => (
                            <div
                              key={idx}
                              className="bg-muted/50 rounded-lg p-3"
                            >
                              <h5 className="font-medium text-sm text-foreground mb-2">
                                {season.season}
                              </h5>
                              <ul className="text-xs text-muted-foreground space-y-1 mb-2">
                                {season.activities.map((activity, i) => (
                                  <li key={i}>• {activity}</li>
                                ))}
                              </ul>
                              <p className="text-xs text-primary font-medium">
                                💡 {season.tips}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Water Management Content */}
                      {section.id === "water-management" && (
                        <>
                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground">
                              Conservation Techniques:
                            </h4>
                            {section.content.techniques?.map(
                              (technique, idx) => (
                                <div
                                  key={idx}
                                  className="bg-muted/50 rounded-lg p-3"
                                >
                                  <h5 className="font-medium text-sm text-foreground">
                                    {technique.method}
                                  </h5>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {technique.description}
                                  </p>
                                  {technique.steps && (
                                    <ol className="text-xs text-muted-foreground space-y-1">
                                      {technique.steps.map((step, i) => (
                                        <li key={i}>
                                          {i + 1}. {step}
                                        </li>
                                      ))}
                                    </ol>
                                  )}
                                  {technique.materials && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      <strong>Materials:</strong>{" "}
                                      {technique.materials.join(", ")}
                                    </p>
                                  )}
                                  {technique.benefits && (
                                    <ul className="text-xs text-muted-foreground mt-2">
                                      {technique.benefits.map((benefit, i) => (
                                        <li key={i}>✓ {benefit}</li>
                                      ))}
                                    </ul>
                                  )}
                                  {technique.setup && (
                                    <ol className="text-xs text-muted-foreground mt-2">
                                      {technique.setup.map((step, i) => (
                                        <li key={i}>
                                          {i + 1}. {step}
                                        </li>
                                      ))}
                                    </ol>
                                  )}
                                </div>
                              )
                            )}
                          </div>

                          <div className="bg-primary/10 rounded-lg p-3">
                            <h4 className="font-medium text-foreground mb-2">
                              💧 Watering Tips:
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {section.content.wateringTips?.map((tip, idx) => (
                                <li key={idx}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {/* Organic Fertilizers Content */}
                      {section.id === "organic-fertilizers" && (
                        <>
                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground">
                              DIY Fertilizer Recipes:
                            </h4>
                            {section.content.recipes?.map((recipe, idx) => (
                              <div
                                key={idx}
                                className="bg-muted/50 rounded-lg p-3"
                              >
                                <h5 className="font-medium text-sm text-foreground">
                                  {recipe.name}
                                </h5>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <strong>Ingredients:</strong>{" "}
                                  {recipe.ingredients.join(", ")}
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <strong>Method:</strong> {recipe.method}
                                </p>
                                <p className="text-xs text-primary">
                                  <strong>Benefits:</strong> {recipe.benefits}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="bg-primary/10 rounded-lg p-3">
                            <h4 className="font-medium text-foreground mb-2">
                              📅 Application Schedule:
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {section.content.applicationSchedule?.map(
                                (schedule, idx) => (
                                  <li key={idx}>• {schedule}</li>
                                )
                              )}
                            </ul>
                          </div>
                        </>
                      )}

                      {/* Companion Planting Content */}
                      {section.id === "companion-planting" && (
                        <>
                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground">
                              Planting Combinations:
                            </h4>
                            {section.content.combinations?.map((combo, idx) => (
                              <div
                                key={idx}
                                className="bg-muted/50 rounded-lg p-3"
                              >
                                <h5 className="font-medium text-sm text-foreground">
                                  {combo.mainCrop}
                                </h5>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <strong>Good Companions:</strong>{" "}
                                  {combo.companions.join(", ")}
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <strong>Benefits:</strong> {combo.benefits}
                                </p>
                                <p className="text-xs text-red-600">
                                  <strong>Avoid Planting With:</strong>{" "}
                                  {combo.avoid}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="bg-primary/10 rounded-lg p-3">
                            <h4 className="font-medium text-foreground mb-2">
                              🌱 General Principles:
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {section.content.principles?.map(
                                (principle, idx) => (
                                  <li key={idx}>• {principle}</li>
                                )
                              )}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Reference Card */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <TestTube className="h-4 w-4 text-primary" />
              Quick Soil pH Reference
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-red-100 dark:bg-red-950 rounded">
                <div className="font-medium text-red-700 dark:text-red-300">
                  Acidic
                </div>
                <div className="text-red-600 dark:text-red-400">pH 0-6.9</div>
                <div className="text-red-500 dark:text-red-500">Add lime</div>
              </div>
              <div className="text-center p-2 bg-green-100 dark:bg-green-950 rounded">
                <div className="font-medium text-green-700 dark:text-green-300">
                  Neutral
                </div>
                <div className="text-green-600 dark:text-green-400">pH 7.0</div>
                <div className="text-green-500 dark:text-green-500">
                  Ideal range
                </div>
              </div>
              <div className="text-center p-2 bg-blue-100 dark:bg-blue-950 rounded">
                <div className="font-medium text-blue-700 dark:text-blue-300">
                  Alkaline
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  pH 7.1-14
                </div>
                <div className="text-blue-500 dark:text-blue-500">
                  Add sulfur
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeScreen;
