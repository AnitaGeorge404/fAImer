import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  Leaf,
  ArrowLeft,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface WeedResult {
  name: string;
  confidence: number;
  description: string;
  treatment: string;
  prevention: string;
  severity: string;
  seasonalData: { month: string; occurrence: number }[];
  causes: string[];
}

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
}

interface WeedIdentifyScreenProps {
  onBack?: () => void;
}

const WeedIdentifyScreen: React.FC<WeedIdentifyScreenProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [result, setResult] = useState<WeedResult | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">(
    "environment"
  );

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const commonWeeds = [
    { name: "Bermuda Grass", crop: "All crops", severity: "High", icon: "🌾" },
    {
      name: "Pigweed",
      crop: "Vegetables, Grains",
      severity: "Medium",
      icon: "🌿",
    },
    {
      name: "Crabgrass",
      crop: "Lawns, Gardens",
      severity: "Medium",
      icon: "🌱",
    },
    { name: "Dandelion", crop: "Lawns, Fields", severity: "Low", icon: "🌼" },
    { name: "Bindweed", crop: "All crops", severity: "High", icon: "🌿" },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          try {
            locationData.city = "Location Detected";
            locationData.region = `${locationData.latitude.toFixed(2)}, ${locationData.longitude.toFixed(2)}`;
          } catch (error) {
            locationData.city = "Unknown Location";
            locationData.region = "Unknown Region";
          }

          setLocation(locationData);
        },
        (error) => {
          setLocationError(
            "Location access denied. Results may be less accurate."
          );
        }
      );
    } else {
      setLocationError("Geolocation not supported by this browser.");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        setSelectedImage(dataUrl);
        stopCamera();
        setResult(null);
      }
    }
  };

  const convertImageToBase64 = (imageDataUrl: string): string => {
    return imageDataUrl.split(",")[1];
  };

  const cleanText = (text: string) =>
    text
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/^\s*>\s*/gm, "")
      .replace(/\n\s*\n/g, "\n")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\.+/g, ".")
      .trim();

  const identifyWeed = async () => {
    if (!selectedImage || !apiKey) {
      setResult({
        name: "Error",
        confidence: 0,
        description: "Please select an image and ensure API key is configured.",
        treatment: "N/A",
        prevention: "N/A",
        severity: "Unknown",
        seasonalData: [],
        causes: ["Configuration error"],
      });
      return;
    }

    setIsIdentifying(true);
    setResult(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const base64Image = convertImageToBase64(selectedImage);
      const locationInfo = location
        ? `Location: ${location.city}, ${location.region} (${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)})`
        : "Location: Not available";

      const prompt = `
        You are an expert agronomist specialized in weed identification. Analyze this image and identify the weed species if present.
        ${locationInfo}

        Provide output as a single JSON object only with these fields in plain text (no markdown):
        {
          "name": "Name of the weed species or 'No weed detected'",
          "confidence": confidence_percentage_as_number,
          "severity": "Low/Medium/High/None",
          "description": "Brief description of the weed and identifying features",
          "treatment": "Practical treatment recommendations in plain text",
          "prevention": "Prevention strategies in plain text",
          "seasonalData": [{"month": "Jan", "occurrence": percentage_number}, /*...*/],
          "causes": ["Reason 1", "Reason 2"]
        }
      `;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      };

      const resultObj = await model.generateContent([prompt, imagePart]);
      const response = await resultObj.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const weedData = JSON.parse(jsonMatch[0]);
        if (weedData.description)
          weedData.description = cleanText(weedData.description);
        if (weedData.treatment)
          weedData.treatment = cleanText(weedData.treatment);
        if (weedData.prevention)
          weedData.prevention = cleanText(weedData.prevention);
        if (weedData.causes && Array.isArray(weedData.causes)) {
          weedData.causes = weedData.causes.map((c: string) => cleanText(c));
        }

        setResult(weedData);
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (error) {
      console.error("Weed identification error:", error);
      setResult({
        name: "Analysis Error",
        confidence: 0,
        description:
          "Failed to analyze the image. Please try again with a clearer photo.",
        treatment: "Retake the photo ensuring good lighting and focus.",
        prevention: "N/A",
        severity: "Unknown",
        seasonalData: [],
        causes: ["Analysis failed due to image quality or API error"],
      });
    } finally {
      setIsIdentifying(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="bg-green-600 dark:bg-green-700 text-white p-4 shadow-lg">
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
            <h1 className="text-xl font-bold">Identify Weed</h1>
            <p className="text-green-100 dark:text-green-200 text-sm">
              AI-powered weed identification
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tips */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                  Pro Tips for Better Identification:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Take clear, close-up photos of the entire weed</li>
                  <li>
                    • Ensure good lighting to capture leaf and stem details
                  </li>
                  <li>• Include the flower or seed head if present</li>
                  <li>• Capture both leaf structure and growth pattern</li>
                  <li>• Take photos of the root system if possible</li>
                  <li>• Avoid blurry or dark images for best results</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center dark:text-white">
              <Leaf className="h-5 w-5 mr-2" />
              Weed Identifier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {location && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <MapPin className="h-4 w-4 mr-2" />
                Location: {location.city}
              </div>
            )}
            {locationError && (
              <div className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                {locationError}
              </div>
            )}

            {/* Camera / Upload controls */}
            {showCamera ? (
              <div className="space-y-3">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={capturePhoto} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                  onClick={startCamera}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                  onClick={() =>
                    document.getElementById("weed-file-input")?.click()
                  }
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Upload Image</span>
                </Button>
              </div>
            )}

            <input
              id="weed-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              aria-label="Upload image file"
            />

            {selectedImage && (
              <div className="mt-4">
                <img
                  src={selectedImage}
                  alt="Selected weed"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  onClick={identifyWeed}
                  disabled={isIdentifying}
                  className="w-full mt-3 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  {isIdentifying ? "Identifying..." : "Identify Weed"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Common Weeds */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">
              Common Weeds in Your Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commonWeeds.map((weed, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{weed.icon}</span>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {weed.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Affects: {weed.crop}
                      </p>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(weed.severity)}>
                    {weed.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <>
            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-base flex items-center dark:text-white">
                  <AlertTriangle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Identification Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium dark:text-white">Weed:</span>
                  <Badge
                    className={
                      result.confidence > 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {result.name}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium dark:text-white">
                    Confidence:
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    {result.confidence}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium dark:text-white">Severity:</span>
                  <Badge className={getSeverityColor(result.severity)}>
                    {result.severity}
                  </Badge>
                </div>

                <div className="pt-3 border-t dark:border-gray-600 space-y-3">
                  <div>
                    <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                      Description:
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {result.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                      Treatment:
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {result.treatment}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                      Prevention:
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {result.prevention}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Causes and Seasonal */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-base dark:text-white flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Causes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {result.causes.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-base dark:text-white flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Seasonality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.seasonalData.map((data, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <span className="text-sm font-medium w-10 dark:text-white">
                          {data.month}
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-400 to-red-500 h-full rounded-full"
                            style={{ width: `${data.occurrence}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-10">
                          {data.occurrence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default WeedIdentifyScreen;
