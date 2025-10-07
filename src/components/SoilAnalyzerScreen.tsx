import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  TestTube,
  Sprout,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface SoilAnalyzerScreenProps {
  onBack?: () => void;
}

const SoilAnalyzerScreen: React.FC<SoilAnalyzerScreenProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [soilData, setSoilData] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"file" | "manual" | "camera">("manual");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const cropOptions = [
    // Cereals & Grains
    { value: "rice", label: "🌾 Rice / നെല്ല്" },
    { value: "wheat", label: "🌾 Wheat / ഗോതമ്പ്" },
    { value: "maize", label: "🌽 Maize / ചോളം" },
    { value: "millets", label: "🌾 Millets / തിനകൾ" },
    
    // Spices
    { value: "pepper", label: "🌶️ Black Pepper / കുരുമുളക്" },
    { value: "cardamom", label: "🫘 Cardamom / ഏലം" },
    { value: "turmeric", label: "🟡 Turmeric / മഞ്ഞൾ" },
    { value: "ginger", label: "🫚 Ginger / ഇഞ്ചി" },
    { value: "chili", label: "🌶️ Chili / മുളക്" },
    
    // Cash Crops
    { value: "coconut", label: "🥥 Coconut / തെങ്ങ്" },
    { value: "rubber", label: "🌳 Rubber / റബ്ബർ" },
    { value: "coffee", label: "☕ Coffee / കാപ്പി" },
    { value: "tea", label: "🍵 Tea / ചായ" },
    
    // Fruits
    { value: "banana", label: "🍌 Banana / വാഴ്" },
    { value: "mango", label: "🥭 Mango / മാവ്" },
    { value: "jackfruit", label: "🍈 Jackfruit / ചക്ക" },
    { value: "papaya", label: "🧡 Papaya / പപ്പായ" },
    
    // Vegetables
    { value: "tomato", label: "🍅 Tomato / തക്കാളി" },
    { value: "potato", label: "🥔 Potato / ഉരുളക്കിഴങ്ങ്" },
    { value: "onion", label: "🧅 Onion / സവാള" },
    { value: "okra", label: "🫛 Okra / വെണ്ടക്ക" },
    { value: "eggplant", label: "🍆 Eggplant / വഴുതന" },
    { value: "cucumber", label: "🥒 Cucumber / വെള്ളരി" },
    
    // Pulses & Legumes
    { value: "beans", label: "🫘 Beans / പയർ" },
    { value: "cowpea", label: "🫛 Cowpea / പയർ" },
    { value: "groundnut", label: "🥜 Groundnut / നിലക്കടല" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCapturedImage(null); // Clear camera image if file is uploaded
      // Here you would typically parse the file content
      // For now, we'll just show the filename
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview of captured image
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setIsCameraActive(false);
    }
  };

  const openCamera = () => {
    setIsCameraActive(true);
    // Clear any previous captures
    setCapturedImage(null);
    setSelectedFile(null);
    
    // Trigger the camera input
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const clearCamera = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setIsCameraActive(false);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const analyzeSoil = async () => {
    if (!soilData && !selectedFile && !capturedImage) {
      alert("Please provide soil data by entering manually, uploading a file, or taking a photo.");
      return;
    }

    if (!selectedCrop) {
      alert("Please select the crop you're planning to grow.");
      return;
    }

    setIsLoading(true);
    setAnalysis(""); // Clear previous analysis

    try {
      console.log("🌱 Starting soil analysis for:", selectedCrop);
      console.log("📊 Soil data provided:", soilData ? "Manual entry" : `File: ${selectedFile?.name}`);
      
      // Initialize Gemini AI
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("AIzaSyCEqOhNbkfUrk0DhceXwOd9_0Eyr0QtiEo");
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);

      const prompt = `
        Analyze soil data for ${selectedCrop} cultivation. Provide a concise professional report.

        Soil Data: ${soilData || `File: ${selectedFile?.name}`}

        Format response as follows (no markdown symbols, keep it brief):

        SOIL HEALTH
        Condition: [Good/Fair/Poor]
        Main issues: [List key problems]

        NUTRIENTS
        pH: [Value] - [Interpretation]
        Nitrogen: [Status]
        Phosphorus: [Status] 
        Potassium: [Status]
        Organic matter: [Percentage]

        FERTILIZER FOR ${selectedCrop.toUpperCase()}
        Primary: [Fertilizer type and rate]
        Secondary: [Additional fertilizers if needed]
        Timing: [When to apply]

        IMPROVEMENTS NEEDED
        Immediate: [Quick fixes]
        Long-term: [Future actions]

        CROP MANAGEMENT
        Best planting: [Season/month]
        Water needs: [Frequency]
        Expected yield: [Amount per area]

        WATCH FOR
        Risks: [Key problems to monitor]
        Prevention: [How to avoid issues]

        Keep all responses short, factual, and actionable. No formatting symbols or verbose explanations.
      `;

      console.log("🔄 Sending request to Gemini API...");
      
      // Try different models in order of preference
      const modelsToTry = ["gemini-2.5-flash"];
      let result;
      let lastError;
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`🤖 Trying model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          result = await model.generateContent(prompt);
          console.log(`✅ Success with model: ${modelName}`);
          break;
        } catch (error) {
          console.warn(`⚠️ Model ${modelName} failed:`, error);
          lastError = error;
          continue;
        }
      }
      
      if (!result) {
        throw lastError || new Error("All models failed");
      }
      
      const response = await result.response;
      const analysisText = response.text();
      
      console.log("✅ Analysis completed successfully");
      setAnalysis(analysisText);
    } catch (error) {
      console.error("❌ Error analyzing soil:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setAnalysis(`Sorry, there was an error analyzing your soil data: ${errorMessage}\n\nPlease check your internet connection and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis("");
    setSoilData("");
    setSelectedFile(null);
    setSelectedCrop("");
    setCapturedImage(null);
    setIsCameraActive(false);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-950 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white flex-shrink-0">
        <div className="flex items-center justify-between p-4 safe-area-inset-top">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Soil Analyzer</h1>
              <p className="text-sm text-white/80">
                AI-powered soil analysis and fertilizer recommendations
              </p>
            </div>
          </div>
          <TestTube className="h-8 w-8" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
        {/* Upload Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Soil Data Input</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={uploadMethod === "manual" ? "default" : "outline"}
                onClick={() => setUploadMethod("manual")}
                className="flex flex-col items-center p-4 h-auto"
              >
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-xs">Manual Entry</span>
              </Button>
              <Button
                variant={uploadMethod === "file" ? "default" : "outline"}
                onClick={() => setUploadMethod("file")}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Upload className="h-6 w-6 mb-2" />
                <span className="text-xs">Upload Report</span>
              </Button>
              <Button
                variant={uploadMethod === "camera" ? "default" : "outline"}
                onClick={() => setUploadMethod("camera")}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Camera className="h-6 w-6 mb-2" />
                <span className="text-xs">Take Photo</span>
              </Button>
            </div>

            {uploadMethod === "manual" && (
              <div className="space-y-4">
                <Label htmlFor="soil-data">Enter Soil Test Results</Label>
                <Textarea
                  id="soil-data"
                  placeholder="Enter your soil test results here (pH, N-P-K levels, organic matter %, soil type, etc.)"
                  value={soilData}
                  onChange={(e) => setSoilData(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            )}

            {uploadMethod === "file" && (
              <div className="space-y-4">
                <Label htmlFor="soil-file">Upload Soil Test Report</Label>
                <Input
                  id="soil-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
                {selectedFile && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>File uploaded: {selectedFile.name}</span>
                  </div>
                )}
              </div>
            )}

            {uploadMethod === "camera" && (
              <div className="space-y-4">
                <Label>Take Photo of Soil Report</Label>
                
                {/* Hidden camera input */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />
                
                {!capturedImage ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Capture your soil test report</p>
                    <Button
                      type="button"
                      onClick={openCamera}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Open Camera
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={capturedImage}
                        alt="Captured soil report"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Photo captured successfully</span>
                      </div>
                      <div className="space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearCamera}
                        >
                          Retake
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crop Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sprout className="h-5 w-5" />
              <span>Crop Selection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="crop-select">What crop are you planning to grow?</Label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a crop" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto z-50">
                  {cropOptions.map((crop) => (
                    <SelectItem key={crop.value} value={crop.value} className="cursor-pointer">
                      {crop.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Analyze Button */}
        <Button
          onClick={analyzeSoil}
          disabled={isLoading || (!soilData && !selectedFile && !capturedImage) || !selectedCrop}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Soil...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Analyze Soil & Get Recommendations
            </>
          )}
        </Button>

        {/* Analysis Results */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Analysis Results</span>
                </div>
                <Button variant="outline" size="sm" onClick={clearAnalysis}>
                  New Analysis
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[50vh] overflow-y-auto pb-4">
                <div className="space-y-4">
                  {analysis.split('\n\n').map((section, index) => {
                  const lines = section.trim().split('\n');
                  if (lines.length === 0 || !lines[0]) return null;
                  
                  const heading = lines[0].trim();
                  const content = lines.slice(1);
                  
                  // Determine section color based on heading
                  let sectionColor = "bg-gray-50 dark:bg-gray-800";
                  let borderColor = "border-gray-200 dark:border-gray-600";
                  let iconColor = "text-gray-600";
                  
                  if (heading.includes('SOIL HEALTH')) {
                    sectionColor = "bg-green-50 dark:bg-green-900/20";
                    borderColor = "border-green-200 dark:border-green-700";
                    iconColor = "text-green-600";
                  } else if (heading.includes('NUTRIENTS')) {
                    sectionColor = "bg-blue-50 dark:bg-blue-900/20";
                    borderColor = "border-blue-200 dark:border-blue-700";
                    iconColor = "text-blue-600";
                  } else if (heading.includes('FERTILIZER')) {
                    sectionColor = "bg-purple-50 dark:bg-purple-900/20";
                    borderColor = "border-purple-200 dark:border-purple-700";
                    iconColor = "text-purple-600";
                  } else if (heading.includes('IMPROVEMENTS')) {
                    sectionColor = "bg-orange-50 dark:bg-orange-900/20";
                    borderColor = "border-orange-200 dark:border-orange-700";
                    iconColor = "text-orange-600";
                  } else if (heading.includes('CROP MANAGEMENT')) {
                    sectionColor = "bg-emerald-50 dark:bg-emerald-900/20";
                    borderColor = "border-emerald-200 dark:border-emerald-700";
                    iconColor = "text-emerald-600";
                  } else if (heading.includes('WATCH FOR')) {
                    sectionColor = "bg-red-50 dark:bg-red-900/20";
                    borderColor = "border-red-200 dark:border-red-700";
                    iconColor = "text-red-600";
                  }
                  
                  return (
                    <div key={index} className={`${sectionColor} ${borderColor} border rounded-lg p-4`}>
                      <h3 className={`font-semibold text-sm mb-3 ${iconColor} flex items-center`}>
                        {heading.includes('SOIL HEALTH') && <TestTube className="h-4 w-4 mr-2" />}
                        {heading.includes('NUTRIENTS') && <Sprout className="h-4 w-4 mr-2" />}
                        {heading.includes('FERTILIZER') && <FileText className="h-4 w-4 mr-2" />}
                        {heading.includes('IMPROVEMENTS') && <Upload className="h-4 w-4 mr-2" />}
                        {heading.includes('CROP MANAGEMENT') && <CheckCircle className="h-4 w-4 mr-2" />}
                        {heading.includes('WATCH FOR') && <AlertCircle className="h-4 w-4 mr-2" />}
                        {heading}
                      </h3>
                      <div className="space-y-1">
                        {content.map((line, lineIndex) => {
                          if (!line.trim()) return null;
                          return (
                            <div key={lineIndex} className="text-sm text-gray-700 dark:text-gray-300">
                              {line.trim()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        {!analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span>Tips for Better Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Include pH levels in your soil data</li>
                <li>• Mention N-P-K (Nitrogen-Phosphorus-Potassium) values</li>
                <li>• Add organic matter percentage if available</li>
                <li>• Include soil texture (clay, sand, loam)</li>
                <li>• Mention your location for climate-specific advice</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SoilAnalyzerScreen;