import React, { useState } from "react";
import { ArrowLeft, Search, Camera } from "lucide-react";
import DiagnoseCropScreen from "./DiagnoseCropScreen";
import ScanPestScreen from "./ScanPestScreen";
import WeedIdentifyScreen from "./WeedIdentifyScreen";
import { Button } from "@/components/ui/button";

interface MultiScanScreenProps {
  onBack?: () => void;
  initialTab?: "diagnose" | "scan" | "weed";
}

const tabs = [
  { id: "diagnose", title: "Crop Diagnosis" },
  { id: "scan", title: "Pest Scan" },
  { id: "weed", title: "Weed Identify" },
];

const MultiScanScreen: React.FC<MultiScanScreenProps> = ({
  onBack,
  initialTab = "diagnose",
}) => {
  const [active, setActive] = useState<string>(initialTab);

  // Get header config based on active tab
  const getHeaderConfig = () => {
    switch (active) {
      case "diagnose":
        return {
          title: "Diagnose Crop",
          subtitle: "AI-powered crop disease detection",
          bgColor:
            "bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800",
          textColor: "text-red-100 dark:text-red-200",
        };
      case "scan":
        return {
          title: "Scan & Detect Pests",
          subtitle: "AI-powered pest identification",
          bgColor: "bg-pink-600 dark:bg-pink-700",
          textColor: "text-pink-100 dark:text-pink-200",
        };
      case "weed":
        return {
          title: "Identify Weed",
          subtitle: "AI-powered weed identification",
          bgColor: "bg-green-600 dark:bg-green-700",
          textColor: "text-green-100 dark:text-green-200",
        };
      default:
        return {
          title: "Scanner",
          subtitle: "AI-powered analysis",
          bgColor: "bg-gray-600 dark:bg-gray-700",
          textColor: "text-gray-100 dark:text-gray-200",
        };
    }
  };

  const headerConfig = getHeaderConfig();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Fixed Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 ${headerConfig.bgColor} text-white p-4 shadow-lg`}
      >
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
            <h1 className="text-xl font-bold">{headerConfig.title}</h1>
            <p className={`${headerConfig.textColor} text-sm`}>
              {headerConfig.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Tab Switcher - positioned just below header */}
      <div className="fixed top-[72px] left-0 right-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div
          className="flex items-center justify-center p-2"
          style={{ marginTop: "1vh" }}
        >
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1 gap-1 ">
            {tabs.map((t) => {
              // Get tab-specific colors based on the header config
              const getTabColors = (tabId: string, isActive: boolean) => {
                if (isActive) {
                  // Show colored text when active/selected
                  switch (tabId) {
                    case "diagnose":
                      return "bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-md";
                    case "scan":
                      return "bg-white dark:bg-gray-600 text-pink-600 dark:text-pink-400 shadow-md";
                    case "weed":
                      return "bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-md";
                    default:
                      return "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md";
                  }
                } else {
                  // Black/gray text when not selected
                  return "text-gray-900 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50";
                }
              };

              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${getTabColors(t.id, active === t.id)}`}
                  aria-pressed={active === t.id}
                >
                  {t.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content area with padding for fixed elements */}
      <div className="pt-[128px] pb-20">
        {/* Embedded screens - only render the active one to avoid duplicate camera usage */}
        {/* Pass hideHeader to prevent duplicate headers */}
        {active === "diagnose" && (
          <DiagnoseCropScreen onBack={onBack} hideHeader={true} />
        )}
        {active === "scan" && (
          <ScanPestScreen onBack={onBack} hideHeader={true} />
        )}
        {active === "weed" && (
          <WeedIdentifyScreen onBack={onBack} hideHeader={true} />
        )}
      </div>
    </div>
  );
};

export default MultiScanScreen;
