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
import html2canvas from "html2canvas";

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
  const [isLanguageMalayalam, setIsLanguageMalayalam] = useState(false);
  const [showTempDiagram, setShowTempDiagram] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hiddenMermaidRef = useRef<HTMLDivElement>(null);
  const tempDiagramRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid
  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: "linear",
          padding: 40,
          nodeSpacing: 80,
          rankSpacing: 120,
          diagramPadding: 50,
        },
        themeVariables: {
          darkMode: false,
          background: "#ffffff",
          primaryColor: "#f8fafc",
          primaryTextColor: "#1f2937",
          primaryBorderColor: "#e2e8f0",
          lineColor: "#64748b",
          sectionBkgColor: "#f1f5f9",
          altSectionBkgColor: "#ffffff",
          gridColor: "#e2e8f0",
          secondaryColor: "#dbeafe",
          tertiaryColor: "#fef3c7",
          fontFamily: '"Noto Sans Malayalam", "Manjari", "Inter", sans-serif',
          fontSize: "16px",
          edgeLabelBackground: "#ffffff",
          clusterBkg: "#f8fafc",
          clusterBorder: "#cbd5e1",
          nodeBorder: "#cbd5e1",
          mainBkg: "#ffffff",
          nodeBkg: "#f8fafc",
        },
        securityLevel: "loose"
      });
      console.log("Mermaid initialized successfully");
    } catch (error) {
      console.error("Error initializing mermaid:", error);
    }
  }, []);

  // Render mermaid diagram when roadmapData changes
  useEffect(() => {
    if (roadmapData && typeof window !== 'undefined' && (window as any).mermaid) {
      const element = document.getElementById('mermaid-diagram');
      if (element) {
        try {
          // Clear previous content
          element.innerHTML = roadmapData;
          element.removeAttribute('data-processed');
          
          // Render the new diagram
          (window as any).mermaid.init(undefined, element).then(() => {
            console.log('Mermaid diagram rendered successfully');
          }).catch((error: any) => {
            console.error('Error rendering mermaid diagram:', error);
          });
        } catch (error) {
          console.error('Error setting up mermaid diagram:', error);
        }
      }
    }
  }, [roadmapData]);

  // Detect if text contains Malayalam characters
  const detectMalayalam = (text: string) => {
    const malayalamRegex = /[\u0D00-\u0D7F]/;
    return malayalamRegex.test(text);
  };

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
                      text: "Transcribe this audio and detect the language. If Malayalam, respond in Malayalam. If English or other languages, respond in English. Extract the crop/plant name mentioned. If no clear crop is mentioned, suggest 'tomato' as default. Respond with just the transcribed text in the detected language.",
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
          setIsLanguageMalayalam(detectMalayalam(transcribed));
          generateRoadmap(transcribed);
        } else {
          // Fallback if audio transcription fails
          const fallbackText = "tomato farming guide";
          setTranscribedText(fallbackText);
          setIsLanguageMalayalam(false);
          generateRoadmap(fallbackText);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      // Fallback
      const fallbackText = "tomato farming guide";
      setTranscribedText(fallbackText);
      setIsLanguageMalayalam(false);
      generateRoadmap(fallbackText);
    }
  };

  // Generate structured farming roadmap using Gemini AI with multiple steps
  const generateRoadmap = async (cropText: string) => {
    console.log("Starting roadmap generation for:", cropText);
    setIsGenerating(true);
    
    try {
      console.log("Checking Gemini API key...");
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found. Please check your environment variables.");
      }
      
      const isMalayalam = detectMalayalam(cropText);
      setIsLanguageMalayalam(isMalayalam);
      console.log("Language detected:", isMalayalam ? "Malayalam" : "English");

      // Language-specific prompts
      const languageInstruction = isMalayalam 
        ? "Respond in Malayalam language only. Use Malayalam script for all text."
        : "Respond in English language only.";

      // Enhanced Step 1: Deep analysis of user input
      const deepAnalysisPrompt = `${languageInstruction}

Analyze this farming request in detail: "${cropText}"

Extract comprehensive information and return as JSON:
{
  "crop": "main crop name",
  "variety": "specific variety if mentioned",
  "area": "cultivation area with units",
  "season": "preferred season or current season",
  "location": "geographic location if mentioned",
  "experience": "farmer experience level",
  "goals": "specific goals",
  "budget": "budget range if mentioned",
  "timeline": "project timeline if mentioned",
  "challenges": "specific challenges or concerns mentioned",
  "methods": "farming methods preferred",
  "market": "target market"
}

If information is not explicitly mentioned, infer reasonable defaults based on context. Use ${isMalayalam ? 'Malayalam' : 'English'} for all text values.`;

      const analysisResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: deepAnalysisPrompt }] }],
          }),
        }
      );

      let cropAnalysis = {
        crop: isMalayalam ? "തക്കാളി" : "tomato",
        variety: isMalayalam ? "സങ്കര ഇനം" : "hybrid variety",
        area: isMalayalam ? "1 ഏക്കർ" : "1 acre",
        season: isMalayalam ? "വേനൽക്കാലം" : "spring",
        location: isMalayalam ? "മിതശീതോഷ്ണ മേഖല" : "temperate region",
        experience: isMalayalam ? "തുടക്കക്കാരൻ" : "beginner",
        goals: isMalayalam ? "നല്ല വിളവും ലാഭവും" : "good yield and profit",
        budget: isMalayalam ? "മധ്യമം" : "moderate",
        timeline: isMalayalam ? "6 മാസം" : "6 months",
        challenges: isMalayalam ? "കീട നിയന്ത്രണം" : "pest management",
        methods: isMalayalam ? "പരമ്പരാഗത" : "conventional",
        market: isMalayalam ? "പ്രാദേശിക വിപണി" : "local market"
      };

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        const analysisText = analysisData.candidates[0]?.content?.parts[0]?.text;
        try {
          const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
          const parsedAnalysis = JSON.parse(cleanJson);
          cropAnalysis = { ...cropAnalysis, ...parsedAnalysis };
        } catch (e) {
          console.log("Using enhanced default analysis due to parsing error");
        }
      }

      // Step 3: Generate detailed farming guidance text for PDF
      const detailedContentPrompt = `${languageInstruction}

Generate comprehensive farming guidance content for ${cropAnalysis.crop} cultivation that will be included in a PDF report. 

Create detailed content in this exact format:

**FARMING OVERVIEW**
[2-3 detailed sentences about the crop and its importance]

**SOIL REQUIREMENTS**
[3-4 specific requirements with technical details]

**PLANTING GUIDELINES**
[4-5 detailed steps with timing and spacing]

**IRRIGATION MANAGEMENT**
[3-4 specific watering guidelines with quantities]

**FERTILIZATION SCHEDULE**
[4-5 detailed fertilizer applications with timing]

**PEST & DISEASE CONTROL**
[3-4 common issues and specific solutions]

**HARVESTING TECHNIQUES**
[3-4 detailed harvesting guidelines]

**POST-HARVEST HANDLING**
[2-3 specific storage and processing steps]

**EXPECTED YIELD & PROFIT**
[2-3 sentences with realistic numbers for ${cropAnalysis.area}]

**EXPERT TIPS**
[3-4 professional recommendations]

Total content should be 25-35 detailed lines. Use ${isMalayalam ? 'Malayalam' : 'English'} language only.`;

      const contentResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: detailedContentPrompt }] }],
          }),
        }
      );

      let detailedContent = isMalayalam ? `
**കൃഷി വിവരണം**
${cropAnalysis.crop} ഒരു പ്രധാന വാണിജ്യ വിള ആണ്. ഇത് നല്ല വരുമാനവും പോഷകാഹാരവും നൽകുന്നു.

**മണ്ണിന്റെ ആവശ്യകതകൾ**
• pH 6.0-7.0 ഉള്ള നല്ല നീർവാർച്ചയുള്ള മണ്ണ്
• ജൈവവസ്തുക്കൾ അടങ്ങിയ ഫലപ്രദമായ മണ്ണ്
• വേരുകൾക്ക് 15-20 സെ.മീ ആഴം ആവശ്യം

**നടീൽ മാർഗ്ഗനിർദ്ദേശങ്ങൾ**
• വിത്ത്/തൈകൾ 30x30 സെ.മീ അകലത്തിൽ നടുക
• 2-3 സെ.മീ ആഴത്തിൽ വിത്ത് ഇടുക
• ${cropAnalysis.season} സീസണിൽ നടുന്നത് അനുയോജ്യം
• ഈർപ്പം നിലനിർത്തുക
      ` : `
**FARMING OVERVIEW**
${cropAnalysis.crop} is a valuable commercial crop that provides excellent nutrition and income potential. It requires systematic cultivation practices for optimal yield.

**SOIL REQUIREMENTS**
• Well-drained soil with pH 6.0-7.0
• Rich organic matter content
• Minimum 15-20 cm depth for proper root development
• Good water retention capacity

**PLANTING GUIDELINES**
• Plant seeds/seedlings at 30x30 cm spacing
• Sow seeds at 2-3 cm depth
• Best planting time is during ${cropAnalysis.season} season
• Maintain consistent soil moisture after planting
• Use quality certified seeds for better germination
      `;

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        const contentText = contentData.candidates[0]?.content?.parts[0]?.text;
        if (contentText && contentText.length > 200) {
          detailedContent = contentText;
        }
      }

      // Step 4: Enhanced comprehensive farming roadmap with more stages
      const enhancedComprehensivePrompt = `${languageInstruction}

Create an EXTREMELY detailed farming roadmap for ${cropAnalysis.crop} cultivation with 15-20 comprehensive stages. 

Return as JSON array with this exact structure:
[
  {
    "id": "stage_1",
    "title": "Stage Name",
    "duration": "time period", 
    "activities": ["activity 1", "activity 2", "activity 3", "activity 4"],
    "requirements": ["requirement 1", "requirement 2", "requirement 3"],
    "costs": "estimated costs",
    "tips": ["tip 1", "tip 2", "tip 3"],
    "success_indicators": ["indicator 1", "indicator 2"]
  }
]

Include these detailed stages: Pre-planning, Site Selection, Soil Testing, Variety Selection, Land Preparation, Irrigation Setup, Seedbed Preparation, Planting, Early Growth Monitoring, Fertilization, Pest Prevention, Disease Management, Growth Management, Flowering Care, Pre-harvest Preparation, Harvesting, Post-harvest Processing, Quality Control, Marketing, and Profit Analysis.

Make each stage very detailed with 4-5 activities and specific guidance for ${cropAnalysis.crop}. Use ${isMalayalam ? 'Malayalam' : 'English'} language only.`;

      const roadmapResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: enhancedComprehensivePrompt }] }],
          }),
        }
      );

      let farmingStages = [];
      if (roadmapResponse.ok) {
        const roadmapData = await roadmapResponse.json();
        const roadmapText = roadmapData.candidates[0]?.content?.parts[0]?.text;
        try {
          const cleanJson = roadmapText.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
          farmingStages = JSON.parse(cleanJson);
        } catch (e) {
          console.log("Using enhanced fallback stages due to parsing error");
          farmingStages = generateEnhancedFallbackStages(cropAnalysis, isMalayalam);
        }
      } else {
        farmingStages = generateEnhancedFallbackStages(cropAnalysis, isMalayalam);
      }

      // Step 5: Create the enhanced mermaid diagram from the structured data
      const mermaidDiagram = createEnhancedMermaidDiagram(cropAnalysis, farmingStages, isMalayalam);
      
      console.log("Generated detailed mermaid diagram:", mermaidDiagram.substring(0, 200) + "...");
      
      setRoadmapData(mermaidDiagram);
      // PDF generation disabled as per user request
      // await generateDetailedPDF(mermaidDiagram, cropAnalysis.crop, detailedContent, farmingStages);

    } catch (error) {
      console.error("Error generating roadmap:", error);
      
      // Enhanced fallback with user input consideration
      const enhancedFallback = createContextualFallbackDiagram(cropText);
      const fallbackContent = detectMalayalam(cropText) ? "വിശദമായ കൃഷി മാർഗ്ഗനിർദ്ദേശങ്ങൾ" : "Detailed farming guidance";
      console.log("Using fallback diagram due to error");
      setRoadmapData(enhancedFallback);
      // PDF generation disabled as per user request
      // await generateDetailedPDF(enhancedFallback, "Farming Guide", fallbackContent, []);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate enhanced fallback stages based on analysis
  const generateEnhancedFallbackStages = (analysis: any, isMalayalam: boolean) => {
    const crop = analysis.crop || (isMalayalam ? "തക്കാളി" : "tomato");
    
    if (isMalayalam) {
      return [
        {
          id: "planning",
          title: `${crop.toUpperCase()} പദ്ധതി ആസൂത്രണം`,
          duration: "1-2 ആഴ്ച",
          activities: [`${crop} ഇനങ്ങൾ ഗവേഷണം ചെയ്യുക`, `${analysis.area} ബജറ്റ് കണക്കാക്കുക`, `${analysis.season} സീസണിനായുള്ള സമയക്രമം ആസൂത്രണം ചെയ്യുക`],
          costs: `₹${Math.round(50 * parseFloat(analysis.area) || 50)}`,
          tips: [`${analysis.experience} കർഷകർക്ക് അനുയോജ്യമായ ഇനങ്ങൾ തിരഞ്ഞെടുക്കുക`, "അപ്രതീക്ഷിത ചെലവുകൾക്കായി ആസൂത്രണം ചെയ്യുക"]
        },
        {
          id: "soil_prep",
          title: "മണ്ണ് വിശകലനവും തയ്യാറാക്കലും",
          duration: "2-3 ആഴ്ച", 
          activities: [`മണ്ണിന്റെ pH, പോഷകങ്ങൾ പരിശോധിക്കുക`, `${analysis.area} ആഴത്തിൽ ഉഴുതുമറിക്കുക`, `മണ്ണ് പരിശോധനയുടെ അടിസ്ഥാനത്തിൽ ജൈവവസ്തുക്കൾ ചേർക്കുക`],
          costs: `₹${Math.round(200 * parseFloat(analysis.area) || 200)}`,
          tips: [`${crop} ന് pH 6.0-7.0 അനുയോജ്യം`, "നല്ല നീർവാർച്ച അത്യാവശ്യം"]
        },
        {
          id: "planting",
          title: `${crop.toUpperCase()} നടീൽ`,
          duration: "1 ആഴ്ച",
          activities: [`ഗുണമേന്മയുള്ള ${crop} വിത്തുകൾ/തൈകൾ തിരഞ്ഞെടുക്കുക`, `ശരിയായ അകലത്തിൽ നടുക`, `ആവശ്യമെങ്കിൽ താങ്ങ് ഘടനകൾ സ്ഥാപിക്കുക`],
          costs: `₹${Math.round(100 * parseFloat(analysis.area) || 100)}`,
          tips: [`ഉത്തമമായ ${analysis.season} സമയത്ത് നടുക`, "നടീലിനു ശേഷം സ്ഥിരമായ ഈർപ്പം നിലനിർത്തുക"]
        }
      ];
    } else {
      return [
        {
          id: "planning",
          title: `${crop.toUpperCase()} Project Planning`,
          duration: "1-2 weeks",
          activities: [`Research ${crop} varieties for ${analysis.location}`, `Calculate budget for ${analysis.area}`, `Plan timeline for ${analysis.season} season`],
          costs: `$${Math.round(50 * parseFloat(analysis.area) || 50)}`,
          tips: [`Choose varieties suitable for ${analysis.experience} farmers`, "Plan for unexpected costs"]
        },
        {
          id: "soil_prep",
          title: "Soil Analysis & Preparation",
          duration: "2-3 weeks", 
          activities: [`Test soil pH and nutrients`, `Deep plowing for ${analysis.area}`, `Add organic amendments based on soil test`],
          costs: `$${Math.round(200 * parseFloat(analysis.area) || 200)}`,
          tips: [`${crop} prefers pH 6.0-7.0`, "Good drainage is essential"]
        },
        {
          id: "planting",
          title: `${crop.toUpperCase()} Planting`,
          duration: "1 week",
          activities: [`Select quality ${crop} seeds/seedlings`, `Plant with proper spacing`, `Install support structures if needed`],
          costs: `$${Math.round(100 * parseFloat(analysis.area) || 100)}`,
          tips: [`Plant during optimal ${analysis.season} timing`, "Maintain consistent moisture after planting"]
        }
      ];
    }
  };

  // Create enhanced structured mermaid diagram from analysis data
  const createEnhancedMermaidDiagram = (analysis: any, stages: any[], isMalayalam: boolean) => {
    const cropName = analysis.crop || (isMalayalam ? "തക്കാളി" : "tomato");
    const area = analysis.area || (isMalayalam ? "1 ഏക്കർ" : "1 acre");
    const budget = analysis.budget || (isMalayalam ? "മധ്യമം" : "moderate");
    const experience = analysis.experience || (isMalayalam ? "തുടക്കക്കാരൻ" : "beginner");
    
    if (!stages || stages.length === 0) {
      return createContextualFallbackDiagram(`${cropName} farming for ${experience} farmer`);
    }

    let diagram = `flowchart TD\n`;
    
    // Enhanced start node with comprehensive information
    const startText = isMalayalam 
      ? `${cropName.toUpperCase()} വിശദ പദ്ധതി<br/>വിസ്തീർണ്ണം: ${area}<br/>ബജറ്റ്: ${budget}<br/>അനുഭവം: ${experience}<br/>ലക്ഷ്യം: ${analysis.goals || 'ലാഭകരമായ കൃഷി'}<br/>സീസൺ: ${analysis.season || 'നിലവിലെ സീസൺ'}<br/>സ്ഥലം: ${analysis.location || 'പ്രാദേശിക'}`
      : `${cropName.toUpperCase()} COMPREHENSIVE PLAN<br/>Area: ${area}<br/>Budget: ${budget}<br/>Experience: ${experience}<br/>Goal: ${analysis.goals || 'Profitable farming'}<br/>Season: ${analysis.season || 'Current season'}<br/>Location: ${analysis.location || 'Local'}`;
    
    const analysisText = isMalayalam ? 'പ്രാരംഭ വിശകലനം' : 'Initial Analysis';
    diagram += `    START[${startText}] --> ANALYSIS{${analysisText}}\n\n`;
    
    // Add analysis branches with proper language
    if (isMalayalam) {
      diagram += `    ANALYSIS --> SOIL[മണ്ണ് പരിശോധന<br/>pH പരിശോധന<br/>പോഷക വിശകലനം<br/>മണ്ണിന്റെ ഗുണനിലവാരം]\n`;
      diagram += `    ANALYSIS --> MARKET[വിപണി ഗവേഷണം<br/>വില നിർണ്ണയം<br/>ഡിമാൻഡ് വിശകലനം<br/>മത്സര പഠനം]\n`;
      diagram += `    ANALYSIS --> CLIMATE[കാലാവസ്ഥ പഠനം<br/>മഴയുടെ പ്രവചനം<br/>താപനില നിരീക്ഷണം<br/>ആർദ്രത അളവ്]\n\n`;
    } else {
      diagram += `    ANALYSIS --> SOIL[Soil Testing<br/>pH Analysis<br/>Nutrient Check<br/>Soil Quality Assessment]\n`;
      diagram += `    ANALYSIS --> MARKET[Market Research<br/>Price Analysis<br/>Demand Study<br/>Competition Review]\n`;
      diagram += `    ANALYSIS --> CLIMATE[Climate Study<br/>Rain Forecast<br/>Temperature Monitor<br/>Humidity Level]\n\n`;
    }
    
    // Merge analysis results
    const planningText = isMalayalam ? 'വിശദ ആസൂത്രണം' : 'Detailed Planning';
    diagram += `    SOIL --> PLANNING[${planningText}]\n`;
    diagram += `    MARKET --> PLANNING\n`;
    diagram += `    CLIMATE --> PLANNING\n\n`;
    
    // Create detailed stage nodes with proper language separation
    let currentNode = 'PLANNING';
    const stageNodes = [];
    const maxStages = Math.min(stages.length, 8); // Reduced for better display

    for (let index = 0; index < maxStages; index++) {
      const stage = stages[index];
      const stageNode = `STAGE${index + 1}`;
      
      // Get stage title in appropriate language
      let stageTitle = stage.title || stage.id || `Stage ${index + 1}`;
      if (isMalayalam && stage.title) {
        // Keep original Malayalam if available, otherwise translate common terms
        if (!detectMalayalam(stage.title)) {
          const commonTranslations: { [key: string]: string } = {
            'Land Preparation': 'ഭൂമി തയ്യാറാക്കൽ',
            'Seed Selection': 'വിത്ത് തിരഞ്ഞെടുപ്പ്',
            'Planting': 'നടീൽ',
            'Irrigation': 'ജലസേചനം',
            'Fertilization': 'വളപ്രയോഗം',
            'Pest Control': 'കീട നിയന്ത്രണം',
            'Harvesting': 'വിളവെടുപ്പ്',
            'Post Harvest': 'വിളവെടുപ്പിനു ശേഷം'
          };
          stageTitle = commonTranslations[stage.title] || stage.title;
        }
      }
      
      // Get activities with proper language
      const activities = Array.isArray(stage.activities) ? stage.activities.slice(0, 2) : [
        isMalayalam ? 'പ്രവർത്തനം നടത്തുക' : 'Execute activities',
        isMalayalam ? 'പുരോഗതി നിരീക്ഷിക്കുക' : 'Monitor progress'
      ];
      
      const activityText = activities.map(act => `• ${act}`).join('<br/>');
      const durationLabel = isMalayalam ? 'കാലാവധി' : 'Duration';
      const durationText = stage.duration || (isMalayalam ? '1-2 ആഴ്ച' : '1-2 weeks');
      
      const nodeContent = `${stageTitle}<br/>${activityText}<br/>${durationLabel}: ${durationText}`;
      
      diagram += `    ${currentNode} --> ${stageNode}[${nodeContent}]\n`;
      currentNode = stageNode;
      stageNodes.push(stageNode);
      
      // Add decision points for critical stages
      if (index === 2) { // After planting
        const checkNode = `CHECK${index + 1}`;
        const checkText = isMalayalam ? 'വിത്ത് മുളച്ചോ?' : 'Seeds Germinated?';
        const yesText = isMalayalam ? 'അതെ' : 'Yes';
        const noText = isMalayalam ? 'ഇല്ല' : 'No';
        const replantText = isMalayalam ? 'വീണ്ടും നടുക' : 'Replant Seeds';
        
        diagram += `    ${stageNode} --> ${checkNode}{${checkText}}\n`;
        diagram += `    ${checkNode} -->|${yesText}| STAGE${index + 2}\n`;
        diagram += `    ${checkNode} -->|${noText}| REPLANT[${replantText}]\n`;
        diagram += `    REPLANT --> STAGE${index + 2}\n`;
        currentNode = `STAGE${index + 2}`;
        index++; // Skip next index since we used it
      }
      
      // Break if we've reached our limit
      if (index >= maxStages - 1) break;
    }

    // Add harvest evaluation
    const harvestEvalText = isMalayalam ? 'വിളവെടുപ്പ് തയ്യാറോ?' : 'Ready for Harvest?';
    const yesText = isMalayalam ? 'അതെ' : 'Yes';
    const notYetText = isMalayalam ? 'ഇതുവരെ ഇല്ല' : 'Not Yet';
    
    diagram += `    ${currentNode} --> HARVEST_EVAL{${harvestEvalText}}\n`;
    
    const harvestText = isMalayalam 
      ? 'വിളവെടുപ്പ്<br/>• ശരിയായ സമയം<br/>• ഗുണനിലവാര പരിശോധന<br/>• ശേഖരണ രീതികൾ'
      : 'Harvesting<br/>• Right timing<br/>• Quality check<br/>• Collection methods';
    
    const waitText = isMalayalam 
      ? 'കൂടുതൽ കാത്തിരിക്കുക<br/>പക്വത പരിശോധിക്കുക'
      : 'Wait More<br/>Check maturity';
    
    diagram += `    HARVEST_EVAL -->|${yesText}| HARVEST[${harvestText}]\n`;
    diagram += `    HARVEST_EVAL -->|${notYetText}| WAIT[${waitText}]\n`;
    diagram += `    WAIT --> HARVEST_EVAL\n`;
    
    // Final success
    const successText = isMalayalam 
      ? `കൃഷി വിജയം<br/>${cropName} പദ്ധതി പൂർത്തിയായി<br/>ലക്ഷ്യം കൈവരിച്ചു<br/>ലാഭകരമായ വിളവ്<br/>അനുഭവം നേടി`
      : `FARMING SUCCESS<br/>${cropName.toUpperCase()} PROJECT COMPLETE<br/>Goals Achieved<br/>Profitable Harvest<br/>Experience Gained`;
    
    diagram += `    HARVEST --> SUCCESS[${successText}]\n`;

    // Add comprehensive styling
    diagram += `\n    style START fill:#e0f2fe,stroke:#0284c7,stroke-width:3px,color:#0f172a\n`;
    diagram += `    style ANALYSIS fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a\n`;
    diagram += `    style PLANNING fill:#f3e8ff,stroke:#8b5cf6,stroke-width:2px,color:#0f172a\n`;
    diagram += `    style SUCCESS fill:#dcfce7,stroke:#16a34a,stroke-width:4px,color:#0f172a\n`;
    diagram += `    style HARVEST fill:#fef3c7,stroke:#f59e0b,stroke-width:3px,color:#0f172a\n`;
    
    // Style analysis nodes
    diagram += `    style SOIL fill:#fef2f2,stroke:#ef4444,stroke-width:2px,color:#0f172a\n`;
    diagram += `    style MARKET fill:#fff7ed,stroke:#f97316,stroke-width:2px,color:#0f172a\n`;
    diagram += `    style CLIMATE fill:#f0f9ff,stroke:#06b6d4,stroke-width:2px,color:#0f172a\n`;
    
    // Style stage nodes with varied colors
    const stageColors = [
      'fill:#fef2f2,stroke:#ef4444', 'fill:#fff7ed,stroke:#f97316', 'fill:#fefbf2,stroke:#f59e0b',
      'fill:#f7fee7,stroke:#84cc16', 'fill:#ecfdf5,stroke:#10b981', 'fill:#f0f9ff,stroke:#06b6d4',
      'fill:#eff6ff,stroke:#3b82f6', 'fill:#eef2ff,stroke:#6366f1'
    ];
    
    stageNodes.forEach((node, index) => {
      const colorIndex = index % stageColors.length;
      diagram += `    style ${node} ${stageColors[colorIndex]},stroke-width:2px,color:#0f172a\n`;
    });

    return diagram;
  };

  // Create contextual fallback diagram based on user input
  const createContextualFallbackDiagram = (userInput: string) => {
    const isMalayalam = detectMalayalam(userInput);
    
    // Extract crop from user input or default to tomato
    const cropMatch = userInput.toLowerCase().match(/(tomato|potato|wheat|rice|corn|maize|beans|peas|lettuce|spinach|carrot|onion|pepper|cucumber|cabbage|broccoli)/);
    const cropName = cropMatch ? cropMatch[1] : (isMalayalam ? "തക്കാളി" : "tomato");
    
    // Extract area if mentioned
    const areaMatch = userInput.match(/(\d+(?:\.\d+)?)\s*(acre|hectare|sqft|m2)/i);
    const area = areaMatch ? `${areaMatch[1]} ${areaMatch[2]}` : (isMalayalam ? "1 ഏക്കർ" : "1 acre");

    if (isMalayalam) {
      return `flowchart TD
    A[${cropName.toUpperCase()} കൃഷി യാത്ര<br/>നിങ്ങളുടെ വ്യക്തിഗത റോഡ്മാപ്പ്<br/>വിസ്തീർണ്ണം: ${area}<br/>അടിസ്ഥാനം: "${userInput.slice(0, 40)}..."] --> B{ആസൂത്രണ ഘട്ടം പൂർത്തിയായോ?}
    
    B -->|അതെ| C[ഉടനടി ആരംഭം<br/>ഭൂമി തയ്യാർ<br/>സാമഗ്രികൾ ലഭ്യം<br/>കാലാവസ്ഥ അനുകൂലം<br/>കൃഷി ആരംഭിക്കുക]
    B -->|ഇല്ല| D[വിശദമായ ആസൂത്രണം<br/>${cropName} ഇനങ്ങൾ ഗവേഷണം<br/>മണ്ണ് പരിശോധന ആവശ്യം<br/>ബജറ്റ് കണക്കുകൂട്ടൽ<br/>വിപണി വിശകലനം ആവശ്യം]
    
    C --> E[മണ്ണ് ഒപ്റ്റിമൈസേഷൻ<br/>${cropName} ന് pH പരിശോധന<br/>പോഷക വിശകലനം<br/>ജൈവവസ്തു കൂട്ടിച്ചേർക്കൽ<br/>ഡ്രെയിനേജ് മെച്ചപ്പെടുത്തൽ]
    D --> E
    
    E --> F[നേരിട്ട് നടീൽ<br/>പ്രീമിയം ${cropName} വിത്തുകൾ<br/>ഒപ്റ്റിമൽ സ്പേസിംഗ്<br/>മികച്ച അവസ്ഥകൾ<br/>ഉയർന്ന വിളവ് പ്രതീക്ഷിക്കുന്നു]
    
    F --> G[വിളവെടുപ്പ് വിജയം<br/>${cropName.toUpperCase()} കൃഷി പൂർത്തിയായി<br/>ലാഭകരമായ വിളവെടുപ്പ് നേടി<br/>അനുഭവം നേടി<br/>അടുത്ത സീസണിന് തയ്യാർ<br/>പ്രവർത്തനങ്ങൾ വിപുലീകരിക്കുക]
    
    style A fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0f172a
    style B fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a
    style C fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#0f172a
    style D fill:#fed7d7,stroke:#dc2626,stroke-width:2px,color:#0f172a
    style E fill:#e9d5ff,stroke:#8b5cf6,stroke-width:2px,color:#0f172a
    style F fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#0f172a
    style G fill:#dcfce7,stroke:#16a34a,stroke-width:3px,color:#0f172a`;
    } else {
      return `flowchart TD
    A[${cropName.toUpperCase()} FARMING JOURNEY<br/>Your personalized roadmap<br/>Area: ${area}<br/>Based on: "${userInput.slice(0, 40)}..."] --> B{Planning Phase Complete?}
    
    B -->|Yes| C[IMMEDIATE START<br/>Land is ready<br/>Materials available<br/>Weather is favorable<br/>Begin cultivation now]
    B -->|No| D[DETAILED PLANNING<br/>Research ${cropName} varieties<br/>Soil testing required<br/>Budget calculation<br/>Market analysis needed]
    
    C --> E[SOIL OPTIMIZATION<br/>pH testing for ${cropName}<br/>Nutrient analysis<br/>Organic matter addition<br/>Drainage improvement]
    D --> E
    
    E --> F[DIRECT PLANTING<br/>Premium ${cropName} seeds<br/>Optimal spacing<br/>Perfect conditions<br/>Expected high yield]
    
    F --> G[SUCCESS CELEBRATION<br/>${cropName.toUpperCase()} FARMING COMPLETE<br/>Profitable harvest achieved<br/>Experience gained<br/>Ready for next season<br/>Scale up operations]
    
    style A fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0f172a
    style B fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a
    style C fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#0f172a
    style D fill:#fed7d7,stroke:#dc2626,stroke-width:2px,color:#0f172a
    style E fill:#e9d5ff,stroke:#8b5cf6,stroke-width:2px,color:#0f172a
    style F fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#0f172a
    style G fill:#dcfce7,stroke:#16a34a,stroke-width:3px,color:#0f172a`;
    }
  };

  // Generate PDF from mermaid diagram
  const generatePDF = async (mermaidCode: string, cropName: string) => {
    try {
      console.log("Starting PDF generation...");
      
      // Try with temporary visible container first
      if (tempDiagramRef.current) {
        setShowTempDiagram(true);
        await generatePDFWithTempContainer(mermaidCode, cropName);
        setShowTempDiagram(false);
        return;
      }
      
      if (!hiddenMermaidRef.current) {
        console.error("Hidden mermaid ref not found");
        throw new Error("PDF container not initialized");
      }

      // Clear previous content
      hiddenMermaidRef.current.innerHTML = "";

      // Clean the diagram code
      let cleanDiagram = mermaidCode
        .replace(/```mermaid\n?/g, "")
        .replace(/\n?```/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Clean diagram:", cleanDiagram.substring(0, 100) + "...");

      // Validate diagram syntax
      if (!cleanDiagram || !cleanDiagram.includes("flowchart")) {
        console.error("Invalid diagram syntax");
        throw new Error("Invalid mermaid diagram syntax");
      }

      // Generate unique ID for this diagram
      const diagramId = `pdf-diagram-${Date.now()}`;

      console.log("Rendering mermaid diagram...");
      
      // Render the diagram with error handling
      let svg;
      try {
        const result = await mermaid.render(diagramId, cleanDiagram);
        svg = result.svg;
      } catch (mermaidError) {
        console.error("Mermaid rendering failed:", mermaidError);
        // Create a simple fallback diagram
        const fallbackDiagram = `flowchart TD
    A[${cropName} Farming Plan] --> B[Soil Preparation]
    B --> C[Planting]
    C --> D[Growth & Care]
    D --> E[Harvesting]
    E --> F[Success]
    
    style A fill:#e0f2fe,stroke:#0284c7,stroke-width:2px
    style F fill:#dcfce7,stroke:#16a34a,stroke-width:2px`;
        
        const fallbackResult = await mermaid.render(`fallback-${Date.now()}`, fallbackDiagram);
        svg = fallbackResult.svg;
      }

      hiddenMermaidRef.current.innerHTML = svg;

      // Style the SVG for PDF with better error handling
      const svgElement = hiddenMermaidRef.current.querySelector("svg");
      if (!svgElement) {
        throw new Error("SVG element not found after rendering");
      }

      // Get the natural dimensions of the SVG first
      const bbox = svgElement.getBBox();
      const naturalWidth = bbox.width + bbox.x * 2;
      const naturalHeight = bbox.height + bbox.y * 2;
      
      console.log("SVG natural dimensions:", naturalWidth, "x", naturalHeight);

      // Set dimensions based on content but ensure minimum size
      const containerWidth = Math.max(naturalWidth + 100, 1200);
      const containerHeight = Math.max(naturalHeight + 100, 800);

      // Set explicit dimensions and styling for better visibility
      svgElement.setAttribute("width", containerWidth.toString());
      svgElement.setAttribute("height", containerHeight.toString());
      svgElement.setAttribute("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
      svgElement.style.width = containerWidth + "px";
      svgElement.style.height = containerHeight + "px";
      svgElement.style.background = "#ffffff";
      svgElement.style.fontFamily = "Arial, sans-serif";
      svgElement.style.display = "block";
      svgElement.style.border = "1px solid #ccc";
      svgElement.style.maxWidth = "none";

      // Ensure all text elements are visible and larger
      const textElements = svgElement.querySelectorAll("text, tspan");
      textElements.forEach((textEl) => {
        const element = textEl as SVGElement;
        element.style.fill = "#000000";
        element.style.fontSize = "16px";
        element.style.fontFamily = "Arial, sans-serif";
        element.style.fontWeight = "500";
      });

      // Ensure all paths and shapes are visible
      const pathElements = svgElement.querySelectorAll("path, rect, circle, ellipse");
      pathElements.forEach((pathEl) => {
        const element = pathEl as SVGElement;
        if (element.style.fill === "none" || !element.style.fill) {
          element.style.fill = "#f8fafc";
        }
        if (!element.style.stroke) {
          element.style.stroke = "#64748b";
          element.style.strokeWidth = "2px";
        }
      });

      // Update container dimensions to match SVG
      hiddenMermaidRef.current.style.width = containerWidth + "px";
      hiddenMermaidRef.current.style.height = containerHeight + "px";

      console.log("SVG prepared, final dimensions:", containerWidth, "x", containerHeight);
      console.log("Converting to canvas...");

      // Wait a bit for SVG to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Convert to canvas with better options
      const canvas = await html2canvas(hiddenMermaidRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        width: containerWidth,
        height: containerHeight,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        logging: true,
        removeContainer: false,
        imageTimeout: 0,
        scrollX: 0,
        scrollY: 0
      });

      console.log("Canvas created, dimensions:", canvas.width, "x", canvas.height);

      // Check if canvas has content
      const ctx = canvas.getContext('2d');
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData?.data.some((pixel, index) => index % 4 !== 3 && pixel !== 255);
      
      if (!hasContent) {
        console.warn("Canvas appears to be empty, trying alternative approach");
        throw new Error("Canvas conversion resulted in empty image");
      }

      console.log("Creating PDF...");

      // Create PDF with proper error handling - use larger format
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a3" // Use A3 for larger diagrams
      });

      // Calculate proper scaling for A3
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Reserve space for title and date
      const titleSpace = 25;
      const availableHeight = pageHeight - titleSpace - 10;
      const availableWidth = pageWidth - 20;
      
      // Calculate scaling to fit the diagram while maintaining aspect ratio
      const canvasAspectRatio = canvas.width / canvas.height;
      const availableAspectRatio = availableWidth / availableHeight;
      
      let finalWidth, finalHeight;
      
      if (canvasAspectRatio > availableAspectRatio) {
        // Canvas is wider, fit to width
        finalWidth = availableWidth;
        finalHeight = availableWidth / canvasAspectRatio;
      } else {
        // Canvas is taller, fit to height
        finalHeight = availableHeight;
        finalWidth = availableHeight * canvasAspectRatio;
      }
      
      // Center the image
      const x = (pageWidth - finalWidth) / 2;
      const y = titleSpace + (availableHeight - finalHeight) / 2;

      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // Add image to PDF with proper scaling
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

      // Add title with safe font handling
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      const title = isLanguageMalayalam 
        ? `${cropName} കൃഷി റോഡ്മാപ്പ്` // Use Malayalam for PDF title
        : `${cropName} Farming Roadmap`;
      await addTextToPDF(pdf, title, 20, 15, undefined, 18);

      // Add generation date
      pdf.setFontSize(12);
      const dateLabel = isLanguageMalayalam ? "തയ്യാറാക്കിയത്:" : "Generated on:";
      const dateText = `${dateLabel} ${new Date().toLocaleDateString()}`;
      await addTextToPDF(pdf, dateText, 20, 22, undefined, 12);

      console.log("PDF creation successful with dimensions:", finalWidth, "x", finalHeight);

      // Convert to blob and store
      const pdfBlob = pdf.output('blob');
      setPdfBlob(pdfBlob);
      setIsPdfReady(true);

    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Try alternative SVG-to-PDF approach
      try {
        console.log("Trying alternative SVG-to-PDF approach...");
        await generateAlternativePDF(mermaidCode, cropName);
      } catch (altError) {
        console.error("Alternative PDF generation also failed:", altError);
        setIsPdfReady(false);
        setPdfBlob(null);
        
        // Show more specific error message
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        alert(`Error generating PDF: ${errorMessage}. Please check the console for more details.`);
      }
    }
  };

  // Generate PDF using temporary visible container for better rendering
  const generatePDFWithTempContainer = async (mermaidCode: string, cropName: string) => {
    try {
      console.log("Using temporary container for PDF generation...");
      
      if (!tempDiagramRef.current) {
        throw new Error("Temporary diagram container not found");
      }

      // Clear previous content
      tempDiagramRef.current.innerHTML = "";

      // Clean the diagram code
      const cleanDiagram = mermaidCode
        .replace(/```mermaid\n?/g, "")
        .replace(/\n?```/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Rendering diagram in temp container...");

      // Generate unique ID for this diagram
      const diagramId = `temp-pdf-diagram-${Date.now()}`;

      // Render the diagram
      const { svg } = await mermaid.render(diagramId, cleanDiagram);
      tempDiagramRef.current.innerHTML = svg;

      // Style the SVG
      const svgElement = tempDiagramRef.current.querySelector("svg");
      if (!svgElement) {
        throw new Error("SVG element not found after rendering");
      }

      // Get natural dimensions
      const bbox = svgElement.getBBox();
      const naturalWidth = Math.max(bbox.width + bbox.x * 2, 1000);
      const naturalHeight = Math.max(bbox.height + bbox.y * 2, 700);

      // Set explicit dimensions
      svgElement.setAttribute("width", naturalWidth.toString());
      svgElement.setAttribute("height", naturalHeight.toString());
      svgElement.setAttribute("viewBox", `0 0 ${naturalWidth} ${naturalHeight}`);
      svgElement.style.width = naturalWidth + "px";
      svgElement.style.height = naturalHeight + "px";
      svgElement.style.background = "#ffffff";
      svgElement.style.border = "2px solid #000";
      svgElement.style.maxWidth = "none";

      // Update container size
      tempDiagramRef.current.style.width = naturalWidth + "px";
      tempDiagramRef.current.style.height = naturalHeight + "px";

      console.log("Converting temp container to canvas...");

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Convert to canvas
      const canvas = await html2canvas(tempDiagramRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        width: naturalWidth,
        height: naturalHeight,
        useCORS: true,
        allowTaint: true,
        logging: true,
        scrollX: 0,
        scrollY: 0
      });

      console.log("Canvas created from temp container:", canvas.width, "x", canvas.height);

      // Create PDF with larger format
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a3"
      });

      // Add title
      pdf.setFontSize(18);
      pdf.text(`${cropName} Farming Roadmap`, 20, 15);
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 22);

      // Add image with better scaling
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const titleSpace = 25;
      const availableHeight = pageHeight - titleSpace - 10;
      const availableWidth = pageWidth - 20;
      
      const canvasAspectRatio = canvas.width / canvas.height;
      const availableAspectRatio = availableWidth / availableHeight;
      
      let finalWidth, finalHeight;
      
      if (canvasAspectRatio > availableAspectRatio) {
        finalWidth = availableWidth;
        finalHeight = availableWidth / canvasAspectRatio;
      } else {
        finalHeight = availableHeight;
        finalWidth = availableHeight * canvasAspectRatio;
      }
      
      const x = (pageWidth - finalWidth) / 2;
      const y = titleSpace + (availableHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

      // Store PDF
      const pdfBlob = pdf.output('blob');
      setPdfBlob(pdfBlob);
      setIsPdfReady(true);
      
      console.log("PDF generated successfully using temp container");

    } catch (error) {
      console.error("Error in temp container PDF generation:", error);
      throw error;
    }
  };

  // Alternative PDF generation method using direct SVG embedding
  const generateAlternativePDF = async (mermaidCode: string, cropName: string) => {
    try {
      console.log("Starting alternative PDF generation...");
      
      const cleanDiagram = mermaidCode
        .replace(/```mermaid\n?/g, "")
        .replace(/\n?```/g, "")
        .replace(/```/g, "")
        .trim();

      // Generate SVG string directly
      const diagramId = `alt-pdf-diagram-${Date.now()}`;
      const { svg } = await mermaid.render(diagramId, cleanDiagram);
      
      // Create PDF with text-based approach
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      // Add title
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      const title = `${cropName} Farming Roadmap`;
      pdf.text(title, 20, 20);

      // Add date
      pdf.setFontSize(10);
      const dateText = `Generated on: ${new Date().toLocaleDateString()}`;
      pdf.text(dateText, 20, 25);

      // Add diagram info
      pdf.setFontSize(12);
      pdf.text("Farming Roadmap Diagram Generated", 20, 35);
      pdf.text("Please check the web application for the visual diagram.", 20, 45);
      
      // Add some basic farming steps as text
      const steps = [
        "1. Planning & Crop Selection",
        "2. Soil Preparation & Testing", 
        "3. Planting & Initial Care",
        "4. Growth Monitoring & Maintenance",
        "5. Pest & Disease Management",
        "6. Harvesting & Post-Harvest",
        "7. Marketing & Profit Analysis"
      ];
      
      let yPos = 60;
      steps.forEach(step => {
        pdf.text(step, 20, yPos);
        yPos += 8;
      });

      // Try to embed SVG as text for reference
      pdf.setFontSize(8);
      pdf.text("Technical Diagram Data (for reference):", 20, yPos + 10);
      
      // Convert to blob
      const pdfBlob = pdf.output('blob');
      setPdfBlob(pdfBlob);
      setIsPdfReady(true);
      
      console.log("Alternative PDF generation successful");
      
    } catch (error) {
      console.error("Alternative PDF generation failed:", error);
      throw error;
    }
  };

  // Helper function to render Malayalam text as image for PDF
  const renderMalayalamTextAsImage = async (text: string, fontSize: number = 12, color: string = '#000000'): Promise<string | null> => {
    try {
      console.log('Rendering Malayalam text as image:', text);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Set font with Malayalam support
      ctx.font = `${fontSize}px "Noto Sans Malayalam", "Manjari", "Karla", Arial, sans-serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';

      // Measure text
      const metrics = ctx.measureText(text);
      const width = Math.ceil(metrics.width) + 20; // Add padding
      const height = fontSize + 10; // Add padding

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Clear and set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Redraw text with proper font settings
      ctx.font = `${fontSize}px "Noto Sans Malayalam", "Manjari", "Karla", Arial, sans-serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';
      ctx.fillText(text, 10, 5);

      // Convert to data URL
      const imageData = canvas.toDataURL('image/png');
      console.log('Successfully rendered Malayalam text as image');
      return imageData;
    } catch (error) {
      console.error('Error rendering Malayalam text as image:', error);
      return null;
    }
  };

  // Enhanced helper function to safely add text to PDF (handles Malayalam Unicode)
  const addTextToPDF = async (pdf: any, text: string, x: number, y: number, maxWidth?: number, fontSize: number = 10): Promise<number> => {
    try {
      // Check if text contains Malayalam characters
      const hasMalayalam = detectMalayalam(text);
      console.log('Adding text to PDF:', text.substring(0, 50), 'Has Malayalam:', hasMalayalam);
      
      if (hasMalayalam) {
        // For Malayalam text, try to render as image first
        try {
          const imageData = await renderMalayalamTextAsImage(text, fontSize, '#000000');
          if (imageData) {
            // Add Malayalam text as image
            const imgWidth = Math.min(maxWidth || 100, 150);
            const imgHeight = fontSize + 5;
            pdf.addImage(imageData, 'PNG', x, y - fontSize/2, imgWidth, imgHeight);
            console.log('Successfully added Malayalam text as image to PDF');
            return imgHeight + 2;
          }
        } catch (imageError) {
          console.warn('Malayalam image rendering failed, using transliteration:', imageError);
        }

        // Fallback to transliteration
        console.log('Using transliteration for Malayalam text');
        const transliteratedText = transliterateMalayalam(text);
        console.log('Transliterated text:', transliteratedText);
        if (maxWidth) {
          const splitLines = pdf.splitTextToSize(transliteratedText, maxWidth);
          pdf.text(splitLines, x, y);
          return splitLines.length * 5;
        } else {
          pdf.text(transliteratedText, x, y);
          return 5;
        }
      } else {
        // For English text, use normal method
        if (maxWidth) {
          const splitLines = pdf.splitTextToSize(text, maxWidth);
          pdf.text(splitLines, x, y);
          return splitLines.length * 5;
        } else {
          pdf.text(text, x, y);
          return 5;
        }
      }
    } catch (error) {
      console.error("Error adding text to PDF:", error);
      // Final fallback: simplified text
      const fallbackText = text.replace(/[\u0D00-\u0D7F]/g, '?');
      try {
        if (maxWidth) {
          const splitLines = pdf.splitTextToSize(fallbackText, maxWidth);
          pdf.text(splitLines, x, y);
          return splitLines.length * 5;
        } else {
          pdf.text(fallbackText, x, y);
          return 5;
        }
      } catch (finalError) {
        console.error("Final fallback failed:", finalError);
        return 5;
      }
    }
  };

  // Helper function to transliterate Malayalam for PDF compatibility
  const transliterateMalayalam = (text: string): string => {
    const malayalamToRoman: { [key: string]: string } = {
      // Vowels
      'അ': 'a', 'ആ': 'aa', 'ഇ': 'i', 'ഈ': 'ii', 'ഉ': 'u', 'ഊ': 'uu', 'ഋ': 'ri', 
      'എ': 'e', 'ഏ': 'ee', 'ഐ': 'ai', 'ഒ': 'o', 'ഓ': 'oo', 'ഔ': 'au',
      
      // Consonants
      'ക': 'ka', 'ഖ': 'kha', 'ഗ': 'ga', 'ഘ': 'gha', 'ങ': 'nga',
      'ച': 'cha', 'ഛ': 'chha', 'ജ': 'ja', 'ഝ': 'jha', 'ഞ': 'nja',
      'ട': 'ta', 'ഠ': 'tha', 'ഡ': 'da', 'ഢ': 'dha', 'ണ': 'na',
      'ത': 'tha', 'ഥ': 'thha', 'ദ': 'da', 'ധ': 'dha', 'ന': 'na',
      'പ': 'pa', 'ഫ': 'pha', 'ബ': 'ba', 'ഭ': 'bha', 'മ': 'ma',
      'യ': 'ya', 'ര': 'ra', 'ല': 'la', 'വ': 'va', 'ശ': 'sha', 
      'ഷ': 'sha', 'സ': 'sa', 'ഹ': 'ha', 'ള': 'la', 'ഴ': 'zha', 'റ': 'ra',
      
      // Common farming terms
      'കൃഷി': 'Krishi (Farming)', 
      'വിളവെടുപ്പ്': 'Harvest', 
      'നടീൽ': 'Planting', 
      'വിത്ത്': 'Seed', 
      'മണ്ണ്': 'Soil', 
      'വെള്ളം': 'Water',
      'തക്കാളി': 'Tomato', 
      'വാഴ': 'Banana', 
      'നെൽ': 'Rice', 
      'ഇഞ്ചി': 'Ginger', 
      'മുളക്': 'Chili',
      'ഘട്ടങ്ങൾ': 'Stages', 
      'പ്രക്രിയ': 'Process', 
      'ഡയഗ്രാം': 'Diagram', 
      'നുറുങ്ങുകൾ': 'Tips', 
      'കാലാവധി': 'Duration',
      'വിപണനം': 'Marketing',
      'വിശകലനം': 'Analysis',
      'ലാഭം': 'Profit',
      'ചെലവ്': 'Cost',
      'വില': 'Price',
      'ഗുണനിലവാരം': 'Quality',
      'പരിശോധന': 'Testing',
      'സംസ്കരണം': 'Processing',
      'പാക്കേജിംഗ്': 'Packaging',
      'വിൽപ്പന': 'Sales',
      'കാലാവസ്ഥ': 'Weather',
      'മഴ': 'Rain',
      'താപനില': 'Temperature',
      'ആർദ്രത': 'Humidity',
      'സൂര്യപ്രകാശം': 'Sunlight',
      'ജൈവവളം': 'Organic Fertilizer',
      'കീടനാശിനി': 'Pesticide',
      'രോഗം': 'Disease',
      'വേര്': 'Root',
      'ഇല': 'Leaf',
      'പുഷ്പം': 'Flower',
      'കായ്': 'Fruit',
      'മുളക്കൽ': 'Germination',
      'വളർച്ച': 'Growth',
      'പക്വത': 'Ripening',
      'വിളവ്': 'Yield',
      'ആദായം': 'Income',
      'നിക്ഷേപം': 'Investment',
      'അപകടസാധ്യത': 'Risk',
      'ഇൻഷുറൻസ്': 'Insurance',
      'വായ്പ': 'Loan',
      'സബ്സിഡി': 'Subsidy',
      'ഗവൺമെന്റ്': 'Government',
      'പദ്ധതി': 'Project',
      'പരിശീലനം': 'Training',
      'സാങ്കേതികവിദ്യ': 'Technology',
      'യന്ത്രം': 'Machine',
      'ഉപകരണം': 'Equipment',
      'സ്ഥലം': 'Location',
      'ഏക്കർ': 'Acre',
      'സെന്റ്': 'Cent',
      'ഹെക്ടർ': 'Hectare',
      'കിലോഗ്രാം': 'Kilogram',
      'ടൺ': 'Ton',
      'ലിറ്റർ': 'Liter',
      'മീറ്റർ': 'Meter',
      'അടി': 'Feet',
      'ഇഞ്ച്': 'Inch'
    };

    let transliterated = text;
    
    // First try to replace complete words
    Object.keys(malayalamToRoman).forEach(malayalam => {
      const roman = malayalamToRoman[malayalam];
      const regex = new RegExp(malayalam, 'g');
      transliterated = transliterated.replace(regex, roman);
    });

    // Then handle remaining individual Malayalam characters
    transliterated = transliterated.replace(/[\u0D00-\u0D7F]/g, (match) => {
      // If we have a mapping for this character, use it
      if (malayalamToRoman[match]) {
        return malayalamToRoman[match];
      }
      // Otherwise, use a generic placeholder
      return '*';
    });
    
    return transliterated;
  };

  // Generate detailed multi-page PDF with content and diagram
  const generateDetailedPDF = async (mermaidCode: string, cropName: string, detailedContent: string, farmingStages: any[]) => {
    try {
      console.log("Starting detailed PDF generation...");
      
      // Create PDF with multiple pages and UTF-8 support
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Page 1: Title and Overview
      pdf.setFontSize(24);
      pdf.setTextColor(0, 100, 0);
      await addTextToPDF(pdf, `${cropName.toUpperCase()} FARMING ROADMAP`, margin, 30, undefined, 24);
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      await addTextToPDF(pdf, `Generated on: ${new Date().toLocaleDateString()}`, margin, 45, undefined, 12);
      
      const guideTitle = detectMalayalam(detailedContent) ? "വിശദമായ കൃഷി ഗൈഡ്" : "Comprehensive Farming Guide";
      await addTextToPDF(pdf, guideTitle, margin, 55, undefined, 12);
      
      // Add detailed content
      const contentLines = detailedContent.split('\n').filter(line => line.trim());
      let yPos = 70;
      
      for (const line of contentLines) {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 30;
        }
        
        if (line.startsWith('**') && line.endsWith('**')) {
          // Section headers
          pdf.setFontSize(14);
          pdf.setTextColor(0, 100, 0);
          const headerText = line.replace(/\*\*/g, '');
          const heightUsed = await addTextToPDF(pdf, headerText, margin, yPos, contentWidth, 14);
          yPos += heightUsed + 5;
        } else if (line.startsWith('•') || line.startsWith('-')) {
          // Bullet points
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          const bulletText = line.substring(1).trim();
          await addTextToPDF(pdf, '•', margin, yPos, undefined, 10);
          const heightUsed = await addTextToPDF(pdf, bulletText, margin + 10, yPos, contentWidth - 10, 10);
          yPos += heightUsed + 2;
        } else if (line.trim()) {
          // Regular text
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          const heightUsed = await addTextToPDF(pdf, line.trim(), margin, yPos, contentWidth, 10);
          yPos += heightUsed + 3;
        }
        yPos += 3;
      }

      // Add farming stages details
      if (farmingStages && farmingStages.length > 0) {
        pdf.addPage();
        yPos = 30;
        
        pdf.setFontSize(18);
        pdf.setTextColor(0, 100, 0);
        const stagesTitle = detectMalayalam(detailedContent) ? "വിശദമായ കൃഷി ഘട്ടങ്ങൾ" : "DETAILED FARMING STAGES";
        await addTextToPDF(pdf, stagesTitle, margin, yPos, undefined, 18);
        yPos += 15;
        
        for (let index = 0; index < Math.min(farmingStages.length, 20); index++) {
          const stage = farmingStages[index];
          if (yPos > pageHeight - 50) {
            pdf.addPage();
            yPos = 30;
          }
          
          // Stage title
          pdf.setFontSize(12);
          pdf.setTextColor(0, 100, 0);
          const stageTitle = `${index + 1}. ${stage.title || stage.id}`;
          const heightUsed1 = await addTextToPDF(pdf, stageTitle, margin, yPos, contentWidth, 12);
          yPos += heightUsed1 + 3;
          
          // Duration
          if (stage.duration) {
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            const durationLabel = detectMalayalam(stage.duration) ? "കാലാവധി:" : "Duration:";
            const durationText = `${durationLabel} ${stage.duration}`;
            const heightUsed2 = await addTextToPDF(pdf, durationText, margin + 5, yPos, contentWidth - 5, 10);
            yPos += heightUsed2 + 3;
          }
          
          // Activities
          if (stage.activities && Array.isArray(stage.activities)) {
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            for (const activity of stage.activities.slice(0, 4)) {
              const activityText = `• ${activity}`;
              const heightUsed3 = await addTextToPDF(pdf, activityText, margin + 5, yPos, contentWidth - 10, 10);
              yPos += heightUsed3 + 2;
            }
          }
          
          // Tips
          if (stage.tips && Array.isArray(stage.tips)) {
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 150);
            const tipsLabel = detectMalayalam(detailedContent) ? "നുറുങ്ങുകൾ:" : "Tips:";
            await addTextToPDF(pdf, tipsLabel, margin + 5, yPos, undefined, 9);
            yPos += 5;
            for (const tip of stage.tips.slice(0, 2)) {
              const tipText = `- ${tip}`;
              const heightUsed4 = await addTextToPDF(pdf, tipText, margin + 10, yPos, contentWidth - 15, 9);
              yPos += heightUsed4 + 2;
            }
          }
          
          yPos += 8;
        }
      }

      // Add new page for diagram
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.setTextColor(0, 100, 0);
      const diagramTitle = detectMalayalam(detailedContent) ? "കൃഷി പ്രക്രിയ ഡയഗ്രാം" : "FARMING PROCESS DIAGRAM";
      await addTextToPDF(pdf, diagramTitle, margin, 30, undefined, 16);

      // Generate diagram on new page
      try {
        if (tempDiagramRef.current) {
          setShowTempDiagram(true);
          
          // Clear and render diagram
          tempDiagramRef.current.innerHTML = "";
          const cleanDiagram = mermaidCode
            .replace(/```mermaid\n?/g, "")
            .replace(/\n?```/g, "")
            .replace(/```/g, "")
            .trim();

          const diagramId = `detailed-pdf-diagram-${Date.now()}`;
          const { svg } = await mermaid.render(diagramId, cleanDiagram);
          tempDiagramRef.current.innerHTML = svg;

          const svgElement = tempDiagramRef.current.querySelector("svg");
          if (svgElement) {
            // Style for PDF
            svgElement.setAttribute("width", "600");
            svgElement.setAttribute("height", "500");
            svgElement.style.width = "600px";
            svgElement.style.height = "500px";
            svgElement.style.background = "#ffffff";

            await new Promise(resolve => setTimeout(resolve, 1000));

            // Convert to canvas
            const canvas = await html2canvas(tempDiagramRef.current, {
              scale: 2,
              backgroundColor: "#ffffff",
              width: 600,
              height: 500,
              useCORS: true,
              allowTaint: true
            });

            // Add to PDF
            const imgData = canvas.toDataURL("image/png", 1.0);
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height / canvas.width) * imgWidth;
            
            pdf.addImage(imgData, "PNG", margin, 40, imgWidth, Math.min(imgHeight, 200));
          }
          
          setShowTempDiagram(false);
        }
      } catch (diagramError) {
        console.error("Error adding diagram to PDF:", diagramError);
        pdf.setFontSize(12);
        const errorMsg1 = detectMalayalam(detailedContent) ? "ഡയഗ്രാം തയ്യാറാക്കുന്നു..." : "Diagram generation in progress...";
        const errorMsg2 = detectMalayalam(detailedContent) ? "ദൃശ്യ ഡയഗ്രാമിനായി വെബ് ആപ്ലിക്കേഷൻ പരിശോധിക്കുക." : "Please refer to the web application for the visual diagram.";
        await addTextToPDF(pdf, errorMsg1, margin, 50, undefined, 12);
        await addTextToPDF(pdf, errorMsg2, margin, 65, undefined, 12);
      }

      // Store PDF
      const pdfBlob = pdf.output('blob');
      setPdfBlob(pdfBlob);
      setIsPdfReady(true);
      
      // Show success message with Malayalam handling note
      const successMessage = detectMalayalam(detailedContent) 
        ? "വിശദമായ PDF വിജയകരമായി സൃഷ്ടിച്ചു! മലയാളം ടെക്സ്റ്റ് ലാറ്റിൻ അക്ഷരങ്ങളിലേക്ക് മാറ്റിയിരിക്കാം."
        : "Detailed PDF generated successfully!";
      
      console.log("Detailed PDF generation successful:", successMessage);

    } catch (error) {
      console.error("Error generating detailed PDF:", error);
      // Fallback to simple PDF
      await generatePDF(mermaidCode, cropName);
    }
  };

  // Download PDF
  const downloadPDF = () => {
    try {
      if (!pdfBlob) {
        console.error("No PDF blob available");
        alert("PDF not ready. Please generate the roadmap first.");
        return;
      }

      console.log("Starting PDF download...");
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      const filename = isLanguageMalayalam 
        ? 'farming-roadmap-malayalam.pdf' // Use safe filename for Malayalam
        : 'farming-roadmap.pdf';
      a.download = filename;
      
      // Ensure the link is added to DOM before clicking
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log("PDF download initiated successfully");
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Error downloading PDF. Please try again.");
    }
  };

  // Handle manual text input
  const handleManualGeneration = () => {
    if (transcribedText.trim()) {
      console.log("Manual generation started with text:", transcribedText);
      const isMalayalam = detectMalayalam(transcribedText);
      setIsLanguageMalayalam(isMalayalam);
      console.log("Language detected:", isMalayalam ? "Malayalam" : "English");
      generateRoadmap(transcribedText);
    } else {
      console.error("No text provided for generation");
      alert("Please enter some text to generate the roadmap.");
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
              Get personalized farming guidance with voice or text input (English/Malayalam)
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
              Get a comprehensive crop-specific farming roadmap as an interactive diagram. 
              Our AI analyzes your specific crop and generates a detailed roadmap covering 
              variety selection, soil preparation, planting, pest management, harvesting, 
              and post-harvest processing with timelines and best practices. Supports both English and Malayalam.
            </p>
            <Dialog
              open={showRoadmapDialog}
              onOpenChange={setShowRoadmapDialog}
            >
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Farming Roadmap PDF
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    AI Farming Roadmap PDF Generator
                  </DialogTitle>
                  <DialogDescription>
                    Describe your specific crop using voice or text (English/Malayalam). 
                    Our AI will create a comprehensive farming roadmap and generate a downloadable PDF 
                    with detailed stages, timelines, costs, and best practices.
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
                            Recording... Speak clearly about your farming plans in English or Malayalam
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
                      Or Type Your Farming Plan (English/Malayalam)
                    </Label>
                    <Textarea
                      id="crop-description"
                      placeholder="E.g., I want to grow tomatoes in 2 acres / ഞാൻ 2 ഏക്കറിൽ തക്കാളി കൃഷി ചെയ്യാൻ ആഗ്രഹിക്കുന്നു"
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
                          Generating PDF Roadmap...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Generate PDF Roadmap
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Debug section - only show if generating failed */}
                  {isGenerating === false && !isPdfReady && transcribedText && (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                          ⚠️ PDF Generation Debug
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                          If you're having issues, try this simple test to generate a basic PDF.
                        </p>
                        <Button
                          onClick={async () => {
                            try {
                              console.log("Testing simple PDF generation...");
                              setIsGenerating(true);
                              
                              const simpleDiagram = `flowchart TD
    A[Test Farming Plan] --> B[Soil Preparation]
    B --> C[Planting]
    C --> D[Growth]
                              
    style A fill:#e0f2fe,stroke:#0284c7
    style D fill:#dcfce7,stroke:#16a34a`;
                              
                              await generatePDF(simpleDiagram, "Test Crop");
                            } catch (error) {
                              console.error("Test PDF failed:", error);
                              alert("Test PDF generation failed. Check console for details.");
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                          disabled={isGenerating}
                        >
                          {isGenerating ? "Testing..." : "Test Simple PDF Generation"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Language Detection Info */}
                  {transcribedText && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Detected Language:</strong> {isLanguageMalayalam ? 'Malayalam (മലയാളം)' : 'English'}
                        <br />
                        <strong>Input:</strong> {transcribedText.slice(0, 100)}...
                      </p>
                    </div>
                  )}

                  {/* Mermaid Diagram Display */}
                  {roadmapData && (
                    <div className="space-y-4">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded">
                        <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          🌾 Your Farming Roadmap ({isLanguageMalayalam ? 'Malayalam' : 'English'})
                        </h4>
                        <div 
                          id="mermaid-display-container"
                          className="bg-white dark:bg-gray-900 p-4 rounded border overflow-auto max-h-96"
                        >
                          <div 
                            id="mermaid-diagram"
                            className="mermaid"
                            dangerouslySetInnerHTML={{ __html: '' }}
                          ></div>
                        </div>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2">
                          {isLanguageMalayalam 
                            ? 'മുകളിൽ നിങ്ങളുടെ വ്യക്തിഗത കൃഷി റോഡ്മാപ്പ് കാണാം.'
                            : 'Above is your personalized farming roadmap diagram.'
                          }
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

      {/* Hidden div for PDF generation */}
      <div
        ref={hiddenMermaidRef}
        className="hidden-pdf-container"
      ></div>

      {/* Temporary visible diagram container for PDF generation */}
      {showTempDiagram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-center mb-4">Generating PDF... Please wait</p>
            <div
              ref={tempDiagramRef}
              className="temp-diagram-container"
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmingTwinScreen;
