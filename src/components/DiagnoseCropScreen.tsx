import React, { useState } from 'react';
import { Camera, Upload, TestTube, AlertTriangle, CheckCircle, Lightbulb, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DiagnoseCropScreenProps {
  onBack?: () => void;
}

const DiagnoseCropScreen: React.FC<DiagnoseCropScreenProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnosis = () => {
    setIsDiagnosing(true);
    // Simulate AI diagnosis
    setTimeout(() => {
      setDiagnosisResult({
        disease: 'Late Blight',
        confidence: 88,
        severity: 'High',
        affectedCrop: 'Tomato',
        symptoms: 'Dark, water-soaked spots on leaves and stems',
        treatment: 'Apply fungicide and remove affected leaves',
        prevention: 'Ensure good air circulation and avoid overhead watering',
        economicImpact: 'Can cause complete crop loss if untreated'
      });
      setIsDiagnosing(false);
    }, 3000);
  };

  const commonDiseases = [
    { name: 'Early Blight', crop: 'Tomato, Potato', severity: 'Medium', icon: '🍂' },
    { name: 'Powdery Mildew', crop: 'Cucumber, Squash', severity: 'Medium', icon: '🍄' },
    { name: 'Downy Mildew', crop: 'Grape, Lettuce', severity: 'High', icon: '🌧️' },
    { name: 'Septoria Leaf Spot', crop: 'Tomato', severity: 'Low', icon: '⚫' },
    { name: 'Fusarium Wilt', crop: 'Tomato, Watermelon', severity: 'High', icon: '🌱' }
  ];

  return (
    <div className="pb-20 bg-gray-50 dark:bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white p-4 shadow-lg">
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
            <h1 className="text-xl font-bold">Diagnose Crop</h1>
            <p className="text-red-100 dark:text-red-200 text-sm">AI-powered crop disease detection</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Diagnosis Section */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center dark:text-white">
              <TestTube className="h-5 w-5 mr-2" />
              Disease Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2 dark:border-border dark:text-white dark:hover:bg-accent dark:hover:text-accent-foreground"
                onClick={() => document.getElementById('camera-input')?.click()}
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs">Take Photo</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2 dark:border-border dark:text-white dark:hover:bg-accent dark:hover:text-accent-foreground"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs">Upload Image</span>
              </Button>
            </div>
            
            <input
              id="camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
            />
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {selectedImage && (
              <div className="mt-4">
                <img
                  src={selectedImage}
                  alt="Selected crop"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  onClick={handleDiagnosis}
                  disabled={isDiagnosing}
                  className="w-full mt-3 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  {isDiagnosing ? 'Diagnosing...' : 'Diagnose Crop'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnosis Result */}
        {diagnosisResult && (
          <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-base flex items-center dark:text-white">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                Disease Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium dark:text-white">Disease:</span>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">{diagnosisResult.disease}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium dark:text-white">Confidence:</span>
                <span className="text-green-600 dark:text-green-400 font-bold">{diagnosisResult.confidence}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium dark:text-white">Severity:</span>
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">{diagnosisResult.severity}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium dark:text-white">Affected Crop:</span>
                <span className="text-gray-700 dark:text-gray-300">{diagnosisResult.affectedCrop}</span>
              </div>
              
              <div className="pt-3 border-t dark:border-border space-y-3">
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Symptoms:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{diagnosisResult.symptoms}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Treatment:
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{diagnosisResult.treatment}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Prevention:
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{diagnosisResult.prevention}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Economic Impact:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{diagnosisResult.economicImpact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Common Diseases */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">Common Diseases in Your Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commonDiseases.map((disease, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-accent/50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{disease.icon}</span>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{disease.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Affects: {disease.crop}</p>
                    </div>
                  </div>
                  <Badge className={
                    disease.severity === 'High' ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" :
                    disease.severity === 'Medium' ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" :
                    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  }>
                    {disease.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">Pro Tips for Better Diagnosis:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Take clear, close-up photos of affected areas</li>
                  <li>• Ensure good lighting to capture details</li>
                  <li>• Focus on leaves, stems, or fruits showing symptoms</li>
                  <li>• Include healthy parts of the plant for comparison</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnoseCropScreen;
