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
      theme: "base",
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: "cardinal",
        padding: 30,
        nodeSpacing: 60,
        rankSpacing: 100,
        diagramPadding: 40,
      },
      themeVariables: {
        darkMode: false,
        background: "#ffffff",
        primaryColor: "#e3f2fd",
        primaryTextColor: "#1a202c",
        primaryBorderColor: "#90caf9",
        lineColor: "#64b5f6",
        sectionBkgColor: "#f3e5f5",
        altSectionBkgColor: "#e8f5e8",
        gridColor: "#e0e0e0",
        secondaryColor: "#fff3e0",
        tertiaryColor: "#fce4ec",
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        edgeLabelBackground: "#ffffff",
        clusterBkg: "#f5f5f5",
        clusterBorder: "#bdbdbd",
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

      // Step 1: Detect language and analyze input
      const languageDetectionPrompt = `Analyze this farming input and detect the language: "${cropText}"

Determine:
1. Language: Is this Malayalam, English, or other language?
2. If Malayalam, provide English translation
3. Extract farming details

Return as JSON:
{
  "detected_language": "malayalam" or "english" or "other",
  "english_translation": "if input is Malayalam, provide English translation, otherwise same text",
  "original_text": "${cropText}",
  "crop": "main crop mentioned (lowercase)",
  "variety": "specific variety if mentioned", 
  "area": "cultivation area with units",
  "season": "preferred season",
  "location": "geographic location if mentioned",
  "experience": "farmer experience level inferred",
  "goals": "specific farming goals mentioned",
  "budget": "budget constraints if mentioned",
  "timeline": "project timeline if mentioned",
  "challenges": "specific challenges or concerns",
  "methods": "farming methods preferred",
  "market": "target market mentioned",
  "specific_questions": "specific questions asked by user",
  "context": "overall context and intent of the request"
}

Infer reasonable defaults where information is not explicitly stated, but base everything on the user's actual input.`;

      const analysisResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: languageDetectionPrompt }] }],
          }),
        }
      );

      let userAnalysis = {
        detected_language: "english",
        english_translation: cropText,
        original_text: cropText,
        crop: "tomato",
        variety: "hybrid",
        area: "1 acre",
        season: "spring",
        location: "temperate region",
        experience: "beginner",
        goals: "good yield",
        budget: "moderate",
        timeline: "one season",
        challenges: "general farming",
        methods: "conventional",
        market: "local",
        specific_questions: "complete farming process",
        context: "general farming guidance",
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
          const parsedAnalysis = JSON.parse(cleanJson);
          userAnalysis = { ...userAnalysis, ...parsedAnalysis };
        } catch (e) {
          console.log("Using default analysis due to parsing error");
        }
      }

      // Enhanced Step 2: Generate mermaid flowchart in appropriate language
      const ismalayalam = userAnalysis.detected_language === "malayalam";
      const inputForDiagram = ismalayalam
        ? userAnalysis.original_text
        : userAnalysis.english_translation;
      const language = ismalayalam ? "Malayalam" : "English";

      const mermaidGenerationPrompt = `Create a comprehensive mermaid flowchart diagram specifically for: "${inputForDiagram}"

IMPORTANT: Generate the ENTIRE flowchart in ${language} language only.

User Analysis Context:
- Crop: ${userAnalysis.crop}
- Goals: ${userAnalysis.goals}
- Experience: ${userAnalysis.experience}
- Language: ${language}
- Original Input: ${userAnalysis.original_text}

${
  ismalayalam
    ? `
MALAYALAM INSTRUCTIONS:
- ALL text in nodes must be in Malayalam script (മലയാളം)
- ALL descriptions must be in Malayalam
- Use proper Malayalam agricultural terms
- Node text should be meaningful in Malayalam
- Decision points in Malayalam
- Process steps in Malayalam
- NO English words in the diagram
`
    : `
ENGLISH INSTRUCTIONS:
- ALL text in nodes must be in English
- Use clear agricultural terminology
- Professional farming language
`
}

Generate a detailed mermaid flowchart that directly addresses the user's input. Include:
1. Start node reflecting user's specific crop and goals in ${language}
2. Decision points based on user's experience level in ${language}
3. Multiple pathways for different scenarios in ${language}
4. Detailed process steps with clear descriptions in ${language}
5. Risk management branches in ${language}
6. Success metrics and outcomes in ${language}
7. Light color styling

Requirements:
- NO EMOJIS in any text
- Use light pastel colors for nodes
- Include 12-15 nodes minimum
- Address the specific user input directly
- Make it comprehensive but easy to follow
- Use proper mermaid syntax
- ENTIRE diagram must be in ${language} language

Return ONLY the mermaid flowchart code without any explanation or code blocks.`;

      const mermaidResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: mermaidGenerationPrompt }] }],
          }),
        }
      );

      let mermaidDiagram = "";
      if (mermaidResponse.ok) {
        const mermaidData = await mermaidResponse.json();
        mermaidDiagram = mermaidData.candidates[0]?.content?.parts[0]?.text;

        // Clean the mermaid code thoroughly
        mermaidDiagram = mermaidDiagram
          .replace(/```mermaid\n?/g, "")
          .replace(/\n?```/g, "")
          .replace(/```/g, "")
          .replace(/[🌱🚜🧪📋💧🌾🦗💊📈🎉🏆✅📊⚠️💰🔄📦🌿🍃📅💵⏱️👨‍🌾📍🎯]/g, "")
          .trim();
      }

      // Enhanced fallback with light colors and no emojis
      if (!mermaidDiagram || !mermaidDiagram.includes("flowchart")) {
        mermaidDiagram = createEnhancedFlowchartFromInput(
          userAnalysis,
          inputForDiagram,
          ismalayalam
        );
      }

      setRoadmapData(mermaidDiagram);
      renderMermaid(mermaidDiagram);
    } catch (error) {
      console.error("Error generating roadmap:", error);

      // Final fallback - detect language from original input
      const ismalayalamFallback = /[\u0d00-\u0d7f]/.test(cropText); // Malayalam Unicode range
      const fallbackDiagram = createSimpleFallbackDiagram(
        cropText,
        ismalayalamFallback
      );
      setRoadmapData(fallbackDiagram);
      renderMermaid(fallbackDiagram);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create enhanced flowchart specifically from user input
  const createEnhancedFlowchartFromInput = (
    analysis: any,
    userInput: string,
    ismalayalam: boolean = false
  ) => {
    const crop = analysis.crop || "tomato";
    const goals = analysis.goals || "successful farming";

    if (ismalayalam) {
      // Malayalam version
      return `flowchart TD
    START["${crop.toUpperCase()} കൃഷി പദ്ധതി<br/>ലക്ഷ്യം: വിജയകരമായ കൃഷി<br/>വിസ്തീർണ്ണം: ${analysis.area}<br/>അനുഭവം: ${analysis.experience}"] --> ASSESS{പ്രാരംഭിക വിലയിരുത്തൽ}
    
    ASSESS -->|തയ്യാറാണ്| DIRECT["നേരിട്ടുള്ള നടത്തിപ്പ്<br/>ഭൂമി തയ്യാറാക്കിയിട്ടുണ്ട്<br/>വിഭവങ്ങൾ ലഭ്യമാണ്<br/>ഉടനടി ആരംഭിക്കുക"]
    ASSESS -->|ആസൂത്രണം ആവശ്യം| PLAN["വിശദമായ ആസൂത്രണ ഘട്ടം<br/>${crop} ഇനങ്ങളെക്കുറിച്ച് പഠനം<br/>വിപണി വിശകലനം<br/>ബജറ്റ് കണക്കുകൂട്ടൽ<br/>സമയക്രമം വികസിപ്പിക്കൽ"]
    
    PLAN --> PREP["തയ്യാറെടുപ്പ് ഘട്ടം<br/>മണ്ണ് പരിശോധനയും വിശകലനവും<br/>ഭൂമി തയ്യാറാക്കൽ<br/>വിഭവ സംഭരണം<br/>ഉപകരണങ്ങളുടെ സജ്ജീകരണം"]
    DIRECT --> PREP
    
    PREP --> PLANT["നടീൽ ഘട്ടം<br/>${crop} വിത്ത് തിരഞ്ഞെടുക്കൽ<br/>അനുയോജ്യമായ നടീൽ സമയം<br/>ശരിയായ അകലവും ആഴവും<br/>പ്രാരംഭിക പരിചരണം സജ്ജീകരണം"]
    
    PLANT --> EARLY["പ്രാരംഭിക വളർച്ച മാനേജ്മെന്റ്<br/>ദൈനംദിന നിരീക്ഷണം<br/>നനയ്ക്കൽ സമയക്രമം<br/>പോഷക പ്രയോഗം<br/>കീട പ്രതിരോധം"]
    
    EARLY --> GROWTH{വളർച്ച വിലയിരുത്തൽ}
    GROWTH -->|മികച്ചത്| ACCELERATE["ത്വരിതപ്പെടുത്തിയ വളർച്ച<br/>അവസ്ഥകൾ ഒപ്റ്റിമൈസ് ചെയ്യുക<br/>പോഷകങ്ങൾ വർദ്ധിപ്പിക്കുക<br/>അടുത്ത സീസണിലേക്ക് വിസ്തീർണ്ണം വികസിപ്പിക്കുക"]
    GROWTH -->|സാധാരണ| MAINTAIN["സ്റ്റാൻഡേർഡ് മെയിന്റനൻസ്<br/>പതിവ് പരിചരണ ദിനചര്യ<br/>വികസനം നിരീക്ഷിക്കുക<br/>ആവശ്യാനുസരണം ക്രമീകരിക്കുക"]
    GROWTH -->|പ്രശ്നങ്ങൾ| TROUBLESHOOT["പ്രശ്ന പരിഹാരം<br/>പ്രത്യേക പ്രശ്നങ്ങൾ തിരിച്ചറിയുക<br/>ലക്ഷ്യമിട്ട പരിഹാരങ്ങൾ പ്രയോഗിക്കുക<br/>ഭാവിയിലെ പ്രശ്നങ്ങൾ തടയുക"]
    
    ACCELERATE --> PROTECTION["വിള സംരക്ഷണം<br/>കീട മാനേജ്മെന്റ്<br/>രോഗ പ്രതിരോധം<br/>കാലാവസ്ഥാ സംരക്ഷണം<br/>ഗുണനിലവാര ഉറപ്പ്"]
    MAINTAIN --> PROTECTION
    TROUBLESHOOT --> PROTECTION
    
    PROTECTION --> MATURITY["പക്വത നിരീക്ഷണം<br/>വികസന ഘട്ടങ്ങൾ ട്രാക്ക് ചെയ്യുക<br/>വിളവെടുപ്പ് തയ്യാറെടുപ്പ് വിലയിരുത്തുക<br/>വിളവെടുപ്പ് ലോജിസ്റ്റിക്സ് പ്ലാൻ ചെയ്യുക<br/>സംഭരണം തയ്യാറാക്കുക"]
    
    MATURITY --> HARVEST_READY{വിളവെടുപ്പിന് തയ്യാറോ?}
    HARVEST_READY -->|അതെ| HARVEST["വിളവെടുപ്പ് പ്രവർത്തനങ്ങൾ<br/>അനുയോജ്യമായ സമയം<br/>ശരിയായ സാങ്കേതിക വിദ്യകൾ<br/>ഗുണനിലവാര കൈകാര്യം<br/>ഉടനടി പ്രോസസ്സിംഗ്"]
    HARVEST_READY -->|കാത്തിരിക്കുക| FINAL_CARE["അന്തിമ പരിചരണ കാലയളവ്<br/>നിരീക്ഷണം തുടരുക<br/>ക്രമാനുഗതമായ തയ്യാറെടുപ്പ്<br/>വിപണി സമയം ഒപ്റ്റിമൈസേഷൻ"]
    
    FINAL_CARE --> HARVEST
    HARVEST --> POST["വിളവെടുപ്പിനു ശേഷമുള്ള പ്രോസസ്സിംഗ്<br/>വൃത്തിയാക്കലും തരംതിരിക്കലും<br/>പാക്കേജിംഗ് തയ്യാറെടുപ്പ്<br/>ഗുണനിലവാര ഗ്രേഡിംഗ്<br/>സംഭരണ മാനേജ്മെന്റ്"]
    
    POST --> MARKET["വിപണനവും വിൽപ്പനയും<br/>വാങ്ങുന്നവരുമായുള്ള ബന്ധം<br/>വില ചർച്ചകൾ<br/>ഡെലിവറി ക്രമീകരണങ്ങൾ<br/>പേയ്മെന്റ് ശേഖരണം"]
    
    MARKET --> SUCCESS["പദ്ധതി പൂർത്തീകരണം<br/>ലാഭം കണക്കാക്കുക<br/>പഠിച്ച പാഠങ്ങൾ രേഖപ്പെടുത്തുക<br/>അടുത്ത കൃഷി ആസൂത്രണം ചെയ്യുക<br/>പ്രവർത്തനങ്ങൾ വിപുലീകരിക്കുക"]
    
    style START fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#1a202c
    style ASSESS fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#1a202c
    style DIRECT fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#1a202c
    style PLAN fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#1a202c
    style PREP fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#1a202c
    style PLANT fill:#e0f2f1,stroke:#00796b,stroke-width:2px,color:#1a202c
    style EARLY fill:#f1f8e9,stroke:#689f38,stroke-width:2px,color:#1a202c
    style GROWTH fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a202c
    style ACCELERATE fill:#e0f7fa,stroke:#0097a7,stroke-width:2px,color:#1a202c
    style MAINTAIN fill:#f9fbe7,stroke:#827717,stroke-width:2px,color:#1a202c
    style TROUBLESHOOT fill:#ffebee,stroke:#d32f2f,stroke-width:2px,color:#1a202c
    style PROTECTION fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#1a202c
    style MATURITY fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#1a202c
    style HARVEST_READY fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#1a202c
    style HARVEST fill:#e0f2f1,stroke:#00695c,stroke-width:2px,color:#1a202c
    style FINAL_CARE fill:#fce4ec,stroke:#ad1457,stroke-width:2px,color:#1a202c
    style POST fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#1a202c
    style MARKET fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#1a202c
    style SUCCESS fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1a202c`;
    }

    // English version (existing code)
    return `flowchart TD
    START["${crop.toUpperCase()} FARMING PROJECT<br/>Goal: ${goals}<br/>Area: ${analysis.area}<br/>Experience Level: ${analysis.experience}"] --> ASSESS{Initial Assessment}
    
    ASSESS -->|Ready to Start| DIRECT["Direct Implementation<br/>Land prepared<br/>Resources available<br/>Begin immediately"]
    ASSESS -->|Need Planning| PLAN["Detailed Planning Phase<br/>Research ${crop} varieties<br/>Market analysis<br/>Budget calculation<br/>Timeline development"]
    
    PLAN --> PREP["Preparation Stage<br/>Soil testing and analysis<br/>Land preparation<br/>Resource procurement<br/>Tool and equipment setup"]
    DIRECT --> PREP
    
    PREP --> PLANT["Planting Phase<br/>Seed selection for ${crop}<br/>Optimal planting time<br/>Proper spacing and depth<br/>Initial care setup"]
    
    PLANT --> EARLY["Early Growth Management<br/>Daily monitoring<br/>Watering schedule<br/>Nutrient application<br/>Pest prevention"]
    
    EARLY --> GROWTH{Growth Assessment}
    GROWTH -->|Excellent| ACCELERATE["Accelerated Growth<br/>Optimize conditions<br/>Increase nutrients<br/>Expand area for next season"]
    GROWTH -->|Normal| MAINTAIN["Standard Maintenance<br/>Regular care routine<br/>Monitor development<br/>Adjust as needed"]
    GROWTH -->|Issues| TROUBLESHOOT["Problem Resolution<br/>Identify specific issues<br/>Apply targeted solutions<br/>Prevent future problems"]
    
    ACCELERATE --> PROTECTION["Crop Protection<br/>Pest management<br/>Disease prevention<br/>Weather protection<br/>Quality assurance"]
    MAINTAIN --> PROTECTION
    TROUBLESHOOT --> PROTECTION
    
    PROTECTION --> MATURITY["Maturity Monitoring<br/>Track development stages<br/>Assess harvest readiness<br/>Plan harvest logistics<br/>Prepare storage"]
    
    MATURITY --> HARVEST_READY{Ready for Harvest?}
    HARVEST_READY -->|Yes| HARVEST["Harvesting Operations<br/>Optimal timing<br/>Proper techniques<br/>Quality handling<br/>Immediate processing"]
    HARVEST_READY -->|Wait| FINAL_CARE["Final Care Period<br/>Continue monitoring<br/>Gradual preparation<br/>Market timing optimization"]
    
    FINAL_CARE --> HARVEST
    HARVEST --> POST["Post Harvest Processing<br/>Cleaning and sorting<br/>Packaging preparation<br/>Quality grading<br/>Storage management"]
    
    POST --> MARKET["Marketing and Sales<br/>Buyer connections<br/>Price negotiations<br/>Delivery arrangements<br/>Payment collection"]
    
    MARKET --> SUCCESS["Project Completion<br/>Calculate profits<br/>Document lessons learned<br/>Plan next cultivation<br/>Scale operations"]
    
    style START fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#1a202c
    style ASSESS fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#1a202c
    style DIRECT fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#1a202c
    style PLAN fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#1a202c
    style PREP fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#1a202c
    style PLANT fill:#e0f2f1,stroke:#00796b,stroke-width:2px,color:#1a202c
    style EARLY fill:#f1f8e9,stroke:#689f38,stroke-width:2px,color:#1a202c
    style GROWTH fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#1a202c
    style ACCELERATE fill:#e0f7fa,stroke:#0097a7,stroke-width:2px,color:#1a202c
    style MAINT