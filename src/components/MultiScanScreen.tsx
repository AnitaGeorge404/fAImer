import React, { useState } from "react";
import { ArrowLeft, Search, Camera } from "lucide-react";
import DiagnoseCropScreen from "./DiagnoseCropScreen";
import ScanPestScreen from "./ScanPestScreen";
import WeedIdentifyScreen from "./WeedIdentifyScreen";
import { Button } from "@/components/ui/button";

interface MultiScanScreenProps {
  onBack?: () => void;
}

const tabs = [
  { id: "diagnose", title: "Crop Diagnosis" },
  { id: "scan", title: "Pest Scan" },
  { id: "weed", title: "Weed Identify" },
];

const MultiScanScreen: React.FC<MultiScanScreenProps> = ({ onBack }) => {
  const [active, setActive] = useState<string>(tabs[0].id);

  return (
    <div className="pb-20 bg-background min-h-screen transition-colors duration-300">
      {/* Top glass slider */}
      <div className="sticky top-0 z-20 p-3 bg-white/30 backdrop-blur-md border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex items-center gap-2">
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full p-1 gap-1 shadow-sm">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`px-4 py-2 rounded-full transition-all text-sm ${
                  active === t.id
                    ? "bg-white text-black shadow"
                    : "text-black/70 hover:bg-white/10"
                }`}
                aria-pressed={active === t.id}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded screens - only render the active one to avoid duplicate camera usage */}
      <div>
        {active === "diagnose" && <DiagnoseCropScreen onBack={onBack} />}
        {active === "scan" && <ScanPestScreen onBack={onBack} />}
        {active === "weed" && <WeedIdentifyScreen onBack={onBack} />}
      </div>
    </div>
  );
};

export default MultiScanScreen;
