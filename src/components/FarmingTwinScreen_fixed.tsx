import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Lightbulb,
  Mic,
  MicOff,
  FileText,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import mermaid from "mermaid";

interface FarmingTwinScreenProps {
  onBack?: () => void;
}

const FarmingTwinScreen: React.FC<FarmingTwinScreenProps> = ({ onBack }) => {
  const [showRoadmapDialog, setShowRoadmapDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [roadmapData, setRoadmapData] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "cardinal",
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 80,
        diagramPadding: 20,
      },
      themeVariables: {
        darkMode: true,
        background: "#1f2937",
        primaryColor: "#10b981",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#059669",
        lineColor: "#6b7280",
        sectionBkgColor: "#374151",
        altSectionBkgColor: "#1f2937",
        gridColor: "#4b5563",
        secondaryColor: "#3b82f6",
        tertiaryColor: "#f59e0b",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        edgeLabelBackground: "#1f2937",
        clusterBkg: "#374151",
        clusterBorder: "#6b7280",
      },
    });
  }, []);

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Convert audio to text using Gemini
  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      // Convert audio blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Transcribe this audio and extract the crop/plant name mentioned. If no clear crop is mentioned, suggest 'tomato' as default. Respond with just the transcribed text.",
                    },
                    {
                      inlineData: {
                        mimeType: "audio/wav",
                        data: base64Audio,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const transcribed =
            data.candidates[0]?.content?.parts[0]?.text || "tomato farming";
          setTranscribedText(transcribed);
          generateRoadmap(transcribed);
        } else {
          // Fallback if audio transcription fails
          const fallbackText = "tomato farming guide";
          setTranscribedText(fallbackText);
          generateRoadmap(fallbackText);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      // Fallback
      const fallbackText = "tomato farming guide";
      setTranscribedText(fallbackText);
      generateRoadmap(fallbackText);
    }
  };

  // Generate structured farming roadmap using Gemini AI with multiple steps
  const generateRoadmap = async (cropText: string) => {
    setIsGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      // Step 1: Extract and analyze the crop
      const cropAnalysisPrompt = `Analyze this farming request: "${cropText}"

Extract the following information and return as JSON:
{
  "crop": "main crop name (lowercase)",
  "area": "cultivation area if mentioned",
  "season": "preferred season if mentioned",
  "goals": "farmer's goals (yield, profit, organic, etc.)"
}

If no specific crop is mentioned, use "tomato" as default.`;

      const analysisResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: cropAnalysisPrompt }] }],
          }),
        }
      );

      let cropAnalysis = {
        crop: "tomato",
        area: "1 acre",
        season: "spring",
        goals: "good yield",
      };

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        const analysisText =
          analysisData.candidates[0]?.content?.parts[0]?.text;
        try {
          const cleanJson = analysisText
            .replace(/```json\n?/g, "")
            .replace(/\n?```/g, "")
            .trim();
          cropAnalysis = JSON.parse(cleanJson);
        } catch (e) {
          console.log("Using default analysis due to parsing error");
        }
      }

      // Step 2: Get detailed farming stages for the specific crop
      const stagesPrompt = `For ${cropAnalysis.crop} cultivation, provide detailed farming stages with specific information.

Return a JSON array with exactly 8-12 stages, each containing:
{
  "id": "unique_id",
  "title": "Stage Title",
  "duration": "time duration",
  "activities": ["activity1", "activity2", "activity3"],
  "requirements": ["requirement1", "requirement2"],
  "tips": ["tip1", "tip2"]
}

Focus specifically on ${cropAnalysis.crop} with realistic timelines, specific varieties, pest management, and harvesting techniques.`;

      const stagesResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: stagesPrompt }] }],
          }),
        }
      );

      let farmingStages = [];
      if (stagesResponse.ok) {
        const stagesData = await stagesResponse.json();
        const stagesText = stagesData.candidates[0]?.content?.parts[0]?.text;
        try {
          const cleanJson = stagesText
            .replace(/```json\n?/g, "")
            .replace(/\n?```/g, "")
            .trim();
          farmingStages = JSON.parse(cleanJson);
        } catch (e) {
          console.log("Using fallback stages due to parsing error");
        }
      }

      // Step 3: Create the mermaid diagram from the structured data
      const mermaidDiagram = createMermaidDiagram(cropAnalysis, farmingStages);

      setRoadmapData(mermaidDiagram);
      renderMermaid(mermaidDiagram);
    } catch (error) {
      console.error("Error generating roadmap:", error);

      // Comprehensive fallback diagram
      const fallbackDiagram = createFallbackDiagram("tomato");
      setRoadmapData(fallbackDiagram);
      renderMermaid(fallbackDiagram);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create structured mermaid diagram from analysis data
  const createMermaidDiagram = (analysis: any, stages: any[]) => {
    const cropName = analysis.crop || "tomato";

    if (!stages || stages.length === 0) {
      return createFallbackDiagram(cropName);
    }

    let diagram = `flowchart TD\n`;

    // Start node
    diagram += `    A[🌱 ${cropName.toUpperCase()} CULTIVATION START<br/>• Target: ${analysis.area || "1 acre"}<br/>• Season: ${analysis.season || "optimal season"}<br/>• Goal: ${analysis.goals || "high yield"}<br/>• Crop: ${cropName}] --> B{Ready to Start?}\n\n`;

    // Create nodes for each stage
    let nodeId = "C";
    let prevNode = "B";
    const stageNodes = [];

    stages.forEach((stage, index) => {
      const currentNode = String.fromCharCode(67 + index); // C, D, E, etc.
      const emoji = getStageEmoji(stage.title || stage.id);

      const activities = Array.isArray(stage.activities)
        ? stage.activities.slice(0, 3)
        : ["Monitor progress", "Follow best practices", "Document activities"];
      const activityText = activities.map((act) => `• ${act}`).join("<br/>");

      diagram += `    ${currentNode}[${emoji} ${(stage.title || stage.id).toUpperCase()}<br/>${activityText}<br/>• Duration: ${stage.duration || "varies"}] --> `;

      if (index < stages.length - 1) {
        const nextNode = String.fromCharCode(68 + index);
        diagram += `${nextNode}\n`;
      } else {
        diagram += `END[🎉 HARVEST SUCCESS<br/>• Process ${cropName}<br/>• Package for market<br/>• Calculate profits<br/>• Plan next season]\n`;
      }

      stageNodes.push(currentNode);
    });

    // Add decision branch from B
    diagram += `\n    B -->|Yes| C\n`;
    diagram += `    B -->|Need Preparation| PREP[📋 PRE-PLANNING<br/>• Research ${cropName} varieties<br/>• Soil testing and preparation<br/>• Market research<br/>• Budget planning]\n`;
    diagram += `    PREP --> C\n\n`;

    // Add styling
    diagram += `    style A fill:#10b981,stroke:#059669,stroke-width:4px,color:#ffffff\n`;
    diagram += `    style B fill:#3b82f6,stroke:#1d4ed8,stroke-width:3px,color:#ffffff\n`;
    diagram += `    style PREP fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#ffffff\n`;
    diagram += `    style END fill:#10b981,stroke:#059669,stroke-width:4px,color:#ffffff\n`;

    // Style stage nodes with different colors
    const colors = [
      "#ef4444,stroke:#dc2626",
      "#8b5cf6,stroke:#7c3aed",
      "#06b6d4,stroke:#0891b2",
      "#14b8a6,stroke:#0d9488",
      "#84cc16,stroke:#65a30d",
      "#f97316,stroke:#ea580c",
      "#ec4899,stroke:#db2777",
      "#6366f1,stroke:#4f46e5",
      "#10b981,stroke:#059669",
    ];

    stageNodes.forEach((node, index) => {
      const colorIndex = index % colors.length;
      diagram += `    style ${node} fill:#${colors[colorIndex]},stroke-width:2px,color:#ffffff\n`;
    });

    return diagram;
  };

  // Helper function to get appropriate emoji for stage
  const getStageEmoji = (stageTitle: string) => {
    const title = stageTitle.toLowerCase();
    if (title.includes("soil") || title.includes("land")) return "🚜";
    if (title.includes("seed") || title.includes("plant")) return "🌾";
    if (title.includes("water") || title.includes("irrigat")) return "💧";
    if (title.includes("fertiliz") || title.includes("nutri")) return "🌱";
    if (title.includes("pest") || title.includes("disease")) return "🦗";
    if (title.includes("growth") || title.includes("monitor")) return "🌿";
    if (title.includes("harvest") || title.includes("crop")) return "🚜";
    if (title.includes("post") || title.includes("process")) return "📦";
    if (title.includes("market") || title.includes("sell")) return "💰";
    return "📈";
  };

  // Create fallback diagram when API fails
  const createFallbackDiagram = (cropName: string) => {
    return `flowchart TD
    A[🌱 ${cropName.toUpperCase()} CULTIVATION MASTER PLAN<br/>• Complete ${cropName} growing guide<br/>• Season-specific planning<br/>• Market-oriented approach<br/>• Sustainable farming practices] --> B{${cropName.toUpperCase()} VARIETY SELECTION}
    
    B -->|High Yield| C[🏆 COMMERCIAL VARIETIES<br/>• Select disease-resistant ${cropName}<br/>• High market demand varieties<br/>• Suitable for local climate<br/>• Good storage qualities]
    B -->|Organic| D[🌿 ORGANIC VARIETIES<br/>• Open-pollinated ${cropName} seeds<br/>• Traditional varieties<br/>• Chemical-free cultivation<br/>• Premium market pricing]
    
    C --> E[🧪 SOIL PREPARATION FOR ${cropName.toUpperCase()}<br/>• Test soil pH and nutrients<br/>• Deep plowing 20-30cm<br/>• Add organic compost 3-5 tons/acre<br/>• Ensure proper drainage]
    D --> E
    
    E --> F[📅 ${cropName.toUpperCase()} PLANTING SCHEDULE<br/>• Optimal planting season<br/>• Seed treatment and preparation<br/>• Proper spacing and depth<br/>• Weather-based timing]
    
    F --> G[💧 IRRIGATION SYSTEM FOR ${cropName.toUpperCase()}<br/>• Install drip irrigation<br/>• Monitor soil moisture daily<br/>• Water requirement: varies by stage<br/>• Avoid waterlogging]
    F --> H[🌱 ${cropName.toUpperCase()} GROWTH MONITORING<br/>• Weekly plant health checks<br/>• Growth stage identification<br/>• Nutrient deficiency signs<br/>• Environmental stress indicators]
    
    G --> I[🦗 ${cropName.toUpperCase()} PEST MANAGEMENT<br/>• Integrated Pest Management<br/>• Common ${cropName} pests identification<br/>• Organic treatments first<br/>• Chemical control if needed]
    H --> I
    
    I --> J[💊 ${cropName.toUpperCase()} DISEASE CONTROL<br/>• Fungal disease prevention<br/>• Bacterial infection management<br/>• Viral disease symptoms<br/>• Preventive spray schedule]
    
    J --> K[🌾 ${cropName.toUpperCase()} FERTILIZATION<br/>• NPK requirements for ${cropName}<br/>• Organic fertilizer application<br/>• Micronutrient supplements<br/>• Growth stage-wise feeding]
    
    K --> L[📈 ${cropName.toUpperCase()} MATURITY TRACKING<br/>• Physical maturity indicators<br/>• Color and texture changes<br/>• Optimal harvest timing<br/>• Quality assessment criteria]
    
    L --> M[🚜 ${cropName.toUpperCase()} HARVESTING<br/>• Proper harvesting techniques<br/>• Post-harvest handling<br/>• Immediate processing needs<br/>• Quality preservation methods]
    
    M --> N[📦 ${cropName.toUpperCase()} POST-HARVEST<br/>• Cleaning and grading<br/>• Storage requirements<br/>• Packaging for market<br/>• Value addition opportunities]
    
    N --> O[💰 ${cropName.toUpperCase()} MARKETING<br/>• Market research and pricing<br/>• Direct sales opportunities<br/>• Bulk buyer connections<br/>• Profit margin calculation]
    
    style A fill:#10b981,stroke:#059669,stroke-width:4px,color:#ffffff
    style B fill:#3b82f6,stroke:#1d4ed8,stroke-width:3px,color:#ffffff
    style C fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#ffffff
    style D fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#ffffff
    style E fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#ffffff
    style F fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#ffffff
    style G fill:#14b8a6,stroke:#0d9488,stroke-width:2px,color:#ffffff
    style H fill:#84cc16,stroke:#65a30d,stroke-width:2px,color:#ffffff
    style I fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#ffffff
    style J fill:#ec4899,stroke:#db2777,stroke-width:2px,color:#ffffff
    style K fill:#6366f1,stroke:#4f46e5,stroke-width:2px,color:#ffffff
    style L fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#ffffff
    style M fill:#10b981,stroke:#059669,stroke-width:3px,color:#ffffff
    style N fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#ffffff
    style O fill:#10b981,stroke:#059669,stroke-width:4px,color:#ffffff`;
  };

  // Render mermaid diagram
  const renderMermaid = async (diagram: string) => {
    if (mermaidRef.current && diagram) {
      try {
        // Clear previous content
        mermaidRef.current.innerHTML = "";

        // Clean the diagram code thoroughly
        let cleanDiagram = diagram
          .replace(/```mermaid\n?/g, "")
          .replace(/\n?```/g, "")
          .replace(/```/g, "")
          .trim();

        // Validate mermaid syntax
        if (
          !cleanDiagram.startsWith("flowchart") &&
          !cleanDiagram.startsWith("graph")
        ) {
          throw new Error("Invalid mermaid syntax");
        }

        // Generate unique ID for this diagram
        const diagramId = `roadmap-diagram-${Date.now()}`;

        console.log("Rendering diagram:", cleanDiagram);

        // Render the diagram
        const { svg } = await mermaid.render(diagramId, cleanDiagram);
        mermaidRef.current.innerHTML = svg;

        // Make SVG responsive and add zoom/pan functionality
        const svgElement = mermaidRef.current.querySelector("svg");
        if (svgElement) {
          svgElement.style.maxWidth = "none";
          svgElement.style.width = "100%";
          svgElement.style.height = "auto";
          svgElement.style.display = "block";
          svgElement.style.margin = "0 auto";
          svgElement.style.cursor = "grab";
          svgElement.style.userSelect = "none";

          // Add zoom and pan functionality
          let isPanning = false;
          let startX = 0,
            startY = 0;
          let translateX = 0,
            translateY = 0;
          let scale = 1;

          const updateTransform = () => {
            svgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
          };

          // Mouse wheel zoom
          svgElement.addEventListener("wheel", (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale *= delta;
            scale = Math.max(0.5, Math.min(3, scale)); // Limit zoom range
            updateTransform();
          });

          // Mouse drag pan
          svgElement.addEventListener("mousedown", (e) => {
            isPanning = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            svgElement.style.cursor = "grabbing";
          });

          document.addEventListener("mousemove", (e) => {
            if (!isPanning) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
          });

          document.addEventListener("mouseup", () => {
            isPanning = false;
            svgElement.style.cursor = "grab";
          });

          // Touch support for mobile
          let lastTouchDistance = 0;
          svgElement.addEventListener("touchstart", (e) => {
            if (e.touches.length === 2) {
              lastTouchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
            } else if (e.touches.length === 1) {
              isPanning = true;
              startX = e.touches[0].clientX - translateX;
              startY = e.touches[0].clientY - translateY;
            }
          });

          svgElement.addEventListener("touchmove", (e) => {
            e.preventDefault();
            if (e.touches.length === 2) {
              const touchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
              if (lastTouchDistance > 0) {
                const delta = touchDistance / lastTouchDistance;
                scale *= delta;
                scale = Math.max(0.5, Math.min(3, scale));
                updateTransform();
              }
              lastTouchDistance = touchDistance;
            } else if (e.touches.length === 1 && isPanning) {
              translateX = e.touches[0].clientX - startX;
              translateY = e.touches[0].clientY - startY;
              updateTransform();
            }
          });

          svgElement.addEventListener("touchend", () => {
            isPanning = false;
            lastTouchDistance = 0;
          });
        }
      } catch (error) {
        console.error("Error rendering mermaid:", error);

        // If mermaid fails, try to render the fallback
        try {
          const fallbackDiagram = `flowchart TD
    A[🌱 Farming Journey Start<br/>• Plan your crop selection<br/>• Research market demand<br/>• Prepare initial budget] --> B{Soil Analysis}
    
    B -->|Good Quality| C[🚜 Direct Preparation<br/>• Basic tillage required<br/>• Add minimal amendments<br/>• Ready for planting]
    B -->|Needs Work| D[🧪 Soil Enhancement<br/>• Test pH and nutrients<br/>• Add organic matter<br/>• Wait for improvement]
    
    C --> E[🌾 Planting Phase<br/>• Use quality seeds<br/>• Follow spacing guidelines<br/>• Ensure proper depth]
    D --> E
    
    E --> F[💧 Early Care<br/>• Daily watering schedule<br/>• Monitor germination<br/>• Protect from pests]
    
    F --> G[🌿 Growth Management<br/>• Regular fertilization<br/>• Pruning and training<br/>• Disease prevention]
    
    G --> H[🍃 Maturity Stage<br/>• Reduce water gradually<br/>• Monitor for harvest signs<br/>• Prepare harvesting tools]
    
    H --> I[🚜 Harvest & Profit<br/>• Time harvest correctly<br/>• Process and package<br/>• Market your produce]
    
    style A fill:#10b981,stroke:#059669,stroke-width:3px,color:#ffffff
    style B fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#ffffff
    style C fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#ffffff
    style D fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#ffffff
    style E fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#ffffff
    style F fill:#84cc16,stroke:#65a30d,stroke-width:2px,color:#ffffff
    style G fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#ffffff
    style H fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#ffffff
    style I fill:#10b981,stroke:#059669,stroke-width:3px,color:#ffffff`;

          const { svg } = await mermaid.render(
            `fallback-${Date.now()}`,
            fallbackDiagram
          );
          mermaidRef.current.innerHTML = svg;
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          mermaidRef.current.innerHTML = `
            <div class="text-center p-8">
              <p class="text-yellow-600 mb-4">⚠️ Diagram Preview Unavailable</p>
              <p class="text-sm text-gray-600 mb-4">The farming roadmap has been generated but cannot be displayed as a diagram.</p>
              <div class="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm max-h-60 overflow-y-auto">
                <h4 class="font-bold mb-2">Generated Roadmap Steps:</h4>
                <pre class="whitespace-pre-wrap text-xs">${diagram}</pre>
              </div>
            </div>
          `;
        }
      }
    }
  };

  // Handle manual text input
  const handleManualGeneration = () => {
    if (transcribedText.trim()) {
      generateRoadmap(transcribedText);
    }
  };

  return (
    <div className="pb-20 bg-gray-50 dark:bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 text-white p-4 shadow-lg">
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
            <h1 className="text-xl font-bold">AI Farming Roadmap Generator</h1>
            <p className="text-green-100 dark:text-green-200 text-sm">
              Get personalized farming guidance with voice or text input
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Farming Roadmap Generator */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI Farming Roadmap Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
              Get a comprehensive crop-specific farming mind map with voice or
              text input. Our AI analyzes your specific crop and generates a
              detailed roadmap covering variety selection, soil preparation,
              planting, pest management, harvesting, and post-harvest processing
              with timelines and best practices.
            </p>
            <Dialog
              open={showRoadmapDialog}
              onOpenChange={setShowRoadmapDialog}
            >
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Farming Roadmap
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    AI Farming Roadmap Generator
                  </DialogTitle>
                  <DialogDescription>
                    Describe your specific crop (e.g., tomato, wheat, rice)
                    using voice or text. Our AI will create a comprehensive
                    farming mind map tailored to your crop, including variety
                    selection, growing stages, pest management, fertilization
                    schedules, and harvesting techniques with exact timelines.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Voice Input Section */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Voice Input</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`${
                          isRecording
                            ? "bg-red-600 hover:bg-red-700 animate-pulse"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white`}
                        disabled={isGenerating}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="h-4 w-4 mr-2" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-2" />
                            Start Recording
                          </>
                        )}
                      </Button>

                      {audioBlob && !isRecording && (
                        <Button
                          onClick={transcribeAudio}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={isGenerating}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Process Audio
                        </Button>
                      )}
                    </div>

                    {isRecording && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></div>
                          <span className="text-sm text-red-800 dark:text-red-300">
                            Recording... Speak clearly about your farming plans
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Text Input Section */}
                  <div className="space-y-4">
                    <Label
                      htmlFor="crop-description"
                      className="text-sm font-medium"
                    >
                      Or Type Your Farming Plan
                    </Label>
                    <Textarea
                      id="crop-description"
                      placeholder="E.g., I want to grow tomatoes in 2 acres, what are the complete steps, timeline, costs, and profit expectations?"
                      value={transcribedText}
                      onChange={(e) => setTranscribedText(e.target.value)}
                      className="min-h-20"
                      disabled={isGenerating}
                    />
                    <Button
                      onClick={handleManualGeneration}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!transcribedText.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Roadmap...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Generate Roadmap
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Roadmap Display */}
                  {roadmapData && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">
                        Your Personalized Farming Roadmap
                      </Label>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-900 dark:bg-gray-900">
                        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                          <div className="flex items-center justify-between text-sm text-gray-300">
                            <span>
                              🔍 Use mouse wheel to zoom • Drag to pan • Touch
                              gestures supported
                            </span>
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                              Interactive Diagram
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-900 p-4 min-h-[600px] overflow-hidden relative">
                          <div
                            ref={mermaidRef}
                            className="w-full h-full overflow-hidden bg-gray-800 min-h-[500px] rounded-lg"
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                          🎯 Roadmap Generated Successfully!
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          This interactive flowchart shows your complete farming
                          journey with timelines, costs, and key decision
                          points. Use zoom and pan to explore details.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmingTwinScreen;
