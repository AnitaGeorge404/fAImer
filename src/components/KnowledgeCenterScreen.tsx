import React from "react";
import {
  BookOpen,
  Camera,
  ArrowLeft,
  ShoppingCart,
  Calculator,
  Newspaper,
  FileText,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
interface KnowledgeCenterScreenProps {
  onBack?: () => void;
  onFeatureClick?: (featureId: string) => void;
}
const KnowledgeCenterScreen: React.FC<KnowledgeCenterScreenProps> = ({
  onBack,
  onFeatureClick,
}) => {
  return (
    <div className="pb-20 bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Resources</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Tools Section */}
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              id: "knowledge",
              title: "Knowledge Center",
              icon: BookOpen,
              image: "lovable-uploads/86b21139-1e5c-4315-b423-e9539e553332.png",
            },
            {
              id: "buy",
              title: "Buy Inputs",
              icon: ShoppingCart,
              image:
                "/lovable-uploads/3f6b7ec9-3d85-4141-822f-70464f2c5be4.png",
            },
            {
              id: "scan",
              title: "Pest Scanner",
              icon: Camera,
              image:
                "/lovable-uploads/f2bb06a9-32a5-4aa1-bf76-447eb1fb0c64.png",
            },
            {
              id: "expense",
              title: "Expense Tracker",
              icon: Calculator,
              image:
                "/lovable-uploads/ea1a065b-d883-4cf8-a40d-b8cfbccfed9f.png",
            },
            {
              id: "news",
              title: "Agriculture News",
              icon: Newspaper,
              image:
                "/lovable-uploads/f265217e-9457-499b-a32c-35f5b5c2b345.png",
            },
            {
              id: "schemes",
              title: "Govt Schemes",
              icon: FileText,
              image:
                "/lovable-uploads/635dff41-e60d-46a3-b325-6bd5578cd7f1.png",
            },
            {
              id: "labourers",
              title: "Labourers",
              icon: Users,
              image:
                "/lovable-uploads/87bc0776-6ff4-4209-a8b5-8b0c47dc938a.png",
            },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-muted rounded-[10%] overflow-hidden"
                onClick={() => onFeatureClick?.(tool.id)}
              >
                <CardContent className="p-4 text-center m-0">
                  <div className="w-24 h-24 text-primary flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                    <img
                      src={tool.image}
                      alt={`${tool.title} icon`}
                      className="h-24 w-24 object-contain-center"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-medium text-foreground text-sm transition-colors duration-300">
                    {tool.title}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default KnowledgeCenterScreen;
