import React from "react";
import { ArrowLeft, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";

interface UpdatesScreenProps {
  onBack?: () => void;
}

const UpdatesScreen: React.FC<UpdatesScreenProps> = ({ onBack }) => {
  const { currentLanguage } = useTranslation();

  // Translation helper for Tamil
  const getTranslatedText = (englishText: string): string => {
    if (currentLanguage !== "ta") return englishText;

    const translations: { [key: string]: string } = {
      "Updates & Announcements": "புதுப்பிப்புகள் & அறிவிப்புகள்",
      "Stay informed with the latest news and features":
        "சமீபத்திய செய்திகள் மற்றும் அம்சங்களுடன் தகவல் பெறுங்கள்",
      New: "புதியது",
      "New Feature": "புதிய அம்சம்",
      "Market Update": "சந்தை புதுப்பிப்பு",
      "Content Update": "உள்ளடக்க புதுப்பிப்பு",
      "Government Scheme": "அரசு திட்டம்",
      Technical: "தொழில்நுட்பம்",
      Update: "புதுப்பிப்பு",
      "hours ago": "மணி நேரங்களுக்கு முன்பு",
      "day ago": "நாள் முன்பு",
      "days ago": "நாட்களுக்கு முன்பு",
      "New Weather Alert System": "புதிய வானிலை எச்சரிக்கை அமைப்பு",
      "Get real-time notifications for severe weather conditions in your area":
        "உங்கள் பகுதியில் கடுமையான வானிலை நிலைமைகளுக்கு நேரடி அறிவிப்புகளைப் பெறுங்கள்",
      "Market Price Update": "சந்தை விலை புதுப்பிப்பு",
      "Latest commodity prices for rice, wheat, and vegetables updated":
        "அரிசி, கோதுமை மற்றும் காய்கறிகளுக்கான சமீபத்திய பண்டங்கள் விலைகள் புதுப்பிக்கப்பட்டன",
      "Pest Control Guide Updated":
        "பூச்சி கட்டுப்பாடு வழிகாட்டி புதுப்பிக்கப்பட்டது",
      "New organic pest control methods added to the knowledge center":
        "அறிவு மையத்தில் புதிய இயற்கை பூச்சி கட்டுப்பாடு முறைகள் சேர்க்கப்பட்டுள்ளன",
      "Government Scheme Alert": "அரசு திட்ட எச்சரிக்கை",
      "New subsidy scheme for solar irrigation systems now available":
        "சூரிய நீர்ப்பாசன அமைப்புகளுக்கான புதிய மானிய திட்டம் இப்போது கிடைக்கிறது",
      "App Performance Improvements": "செயலி செயல்திறன் மேம்பாடுகள்",
      "Faster loading times and improved offline functionality":
        "வேகமான ஏற்றும் நேரங்கள் மற்றும் மேம்படுத்தப்பட்ட ஆஃப்லைன் செயல்பாடு",
    };

    return translations[englishText] || englishText;
  };

  const updates = [
    {
      id: 1,
      title: "New Weather Alert System",
      description:
        "Get real-time notifications for severe weather conditions in your area",
      date: "2 hours ago",
      type: "feature",
      isNew: true,
    },
    {
      id: 2,
      title: "Market Price Update",
      description:
        "Latest commodity prices for rice, wheat, and vegetables updated",
      date: "5 hours ago",
      type: "market",
      isNew: true,
    },
    {
      id: 3,
      title: "Pest Control Guide Updated",
      description:
        "New organic pest control methods added to the knowledge center",
      date: "1 day ago",
      type: "content",
      isNew: false,
    },
    {
      id: 4,
      title: "Government Scheme Alert",
      description:
        "New subsidy scheme for solar irrigation systems now available",
      date: "2 days ago",
      type: "scheme",
      isNew: false,
    },
    {
      id: 5,
      title: "App Performance Improvements",
      description: "Faster loading times and improved offline functionality",
      date: "3 days ago",
      type: "technical",
      isNew: false,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-blue-100 text-blue-800";
      case "market":
        return "bg-green-100 text-green-800";
      case "content":
        return "bg-purple-100 text-purple-800";
      case "scheme":
        return "bg-orange-100 text-orange-800";
      case "technical":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    const label = (() => {
      switch (type) {
        case "feature":
          return "New Feature";
        case "market":
          return "Market Update";
        case "content":
          return "Content Update";
        case "scheme":
          return "Government Scheme";
        case "technical":
          return "Technical";
        default:
          return "Update";
      }
    })();
    return getTranslatedText(label);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">
              {getTranslatedText("Updates & Announcements")}
            </h1>
          </div>
        </div>
      </div>

      {/* Updates List */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {updates.map((update) => (
          <Card key={update.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={getTypeColor(update.type)}
                    >
                      {getTypeLabel(update.type)}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">
                    {getTranslatedText(update.title)}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-3">
                {getTranslatedText(update.description)}
              </CardDescription>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {getTranslatedText(update.date)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UpdatesScreen;
