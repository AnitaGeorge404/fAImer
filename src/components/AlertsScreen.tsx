import React from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/TranslationContext";

interface AlertsScreenProps {
  onBack?: () => void;
}

const AlertsScreen: React.FC<AlertsScreenProps> = ({ onBack }) => {
  const { currentLanguage } = useTranslation();

  // Translation helper for Tamil
  const getTranslatedText = (englishText: string): string => {
    if (currentLanguage !== "ta") return englishText;

    const translations: { [key: string]: string } = {
      // Header
      Updates: "புதுப்பிப்புகள்",

      // Alert counts
      Urgent: "அவசர",
      Warning: "எச்சரிக்கை",
      Info: "தகவல்",
      Success: "வெற்றி",

      // Alert titles
      "Pest Attack Detected": "பூச்சி தாக்குதல் கண்டறியப்பட்டது",
      "Weather Alert": "வானிலை எச்சரிக்கை",
      "Irrigation Reminder": "நீர்ப்பாசன நினைவூட்டல்",
      "Harvest Ready": "அறுவடை தயார்",

      // Alert messages
      "High aphid activity detected in tomato field. Immediate action required.":
        "தக்காளி வயலில் அதிக அசுவினி செயல்பாடு கண்டறியப்பட்டது. உடனடி நடவடிக்கை தேவை.",
      "Heavy rainfall expected in next 48 hours. Protect crops.":
        "அடுத்த 48 மணி நேரத்தில் அதிக மழை எதிர்பார்க்கப்படுகிறது. பயிர்களைப் பாதுகாக்கவும்.",
      "Scheduled irrigation for onion field due tomorrow morning.":
        "நாளை காலை வெங்காய வயலுக்கு திட்டமிடப்பட்ட நீர்ப்பாசனம்.",
      "Chilli crop is ready for harvest. Optimal time window.":
        "மிளகாய் பயிர் அறுவடைக்கு தயார். உகந்த நேரம்.",

      // Crops
      Tomato: "தக்காளி",
      "All Crops": "அனைத்து பயிர்கள்",
      Onion: "வெங்காயம்",
      Chilli: "மிளகாய்",

      // Time
      "hours ago": "மணி நேரங்களுக்கு முன்பு",
      "day ago": "நாள் முன்பு",
      "days ago": "நாட்களுக்கு முன்பு",
      "2 hours ago": "2 மணி நேரத்திற்கு முன்",
      "4 hours ago": "4 மணி நேரத்திற்கு முன்",
      "1 day ago": "1 நாளுக்கு முன்",

      // Quick Actions
      "Quick Actions": "விரைவு செயல்கள்",
      "Configure Alert Settings": "எச்சரிக்கை அமைப்புகளை உள்ளமைக்கவும்",
    };

    return translations[englishText] || englishText;
  };

  const alerts = [
    {
      id: 1,
      type: "urgent",
      title: "Pest Attack Detected",
      message:
        "High aphid activity detected in tomato field. Immediate action required.",
      time: "2 hours ago",
      crop: "Tomato",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
    },
    {
      id: 2,
      type: "warning",
      title: "Weather Alert",
      message: "Heavy rainfall expected in next 48 hours. Protect crops.",
      time: "4 hours ago",
      crop: "All Crops",
      icon: Info,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      id: 3,
      type: "info",
      title: "Irrigation Reminder",
      message: "Scheduled irrigation for onion field due tomorrow morning.",
      time: "1 day ago",
      crop: "Onion",
      icon: CheckCircle,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      id: 4,
      type: "success",
      title: "Harvest Ready",
      message: "Chilli crop is ready for harvest. Optimal time window.",
      time: "1 day ago",
      crop: "Chilli",
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
    },
  ];

  const getAlertBadgeClass = (type: string) => {
    const classes = {
      urgent:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
      warning:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
      info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      success:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    };
    return classes[type as keyof typeof classes] || classes.info;
  };

  return (
    <div className="pb-20 bg-background min-h-screen">
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
              {getTranslatedText("Updates")}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Alert Stats */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  1
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {getTranslatedText("Urgent")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  1
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {getTranslatedText("Warning")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  2
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {getTranslatedText("Info")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <Card
                key={alert.id}
                className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full bg-gray-100 dark:bg-accent ${alert.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800 dark:text-foreground">
                          {getTranslatedText(alert.title)}
                        </h3>
                        <Badge className={getAlertBadgeClass(alert.type)}>
                          {getTranslatedText(
                            alert.type.charAt(0).toUpperCase() +
                              alert.type.slice(1)
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">
                        {getTranslatedText(alert.message)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-muted-foreground">
                        <span>{getTranslatedText(alert.time)}</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {getTranslatedText(alert.crop)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              {getTranslatedText("Quick Actions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start dark:border-border dark:hover:bg-accent dark:hover:text-accent-foreground"
            >
              <Bell className="h-4 w-4 mr-2" />
              {getTranslatedText("Configure Alert Settings")}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start dark:border-border dark:hover:bg-accent dark:hover:text-accent-foreground"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlertsScreen;
