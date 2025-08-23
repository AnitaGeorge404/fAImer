import React from "react";
import {
  User,
  MapPin,
  Settings,
  HelpCircle,
  LogOut,
  Edit,
  Camera,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "../contexts/TranslationContext";

interface ProfileScreenProps {
  onBack?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const farmerData = {
    name: "Ramesh Kumar",
    phone: "+91 9876543210",
    location: "Mysore, Karnataka",
    farmSize: "2.5 acres",
    soilType: "Red Soil",
    experience: "15 years",
    language: "Kannada",
    aiLevel: "Intermediate",
  };

  const menuItems = [
    {
      id: "edit-profile",
      title: t("Edit Profile"),
      subtitle: "Update personal information",
      icon: Edit,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "language",
      title: t("Language Settings"),
      subtitle: "Change app language",
      icon: Globe,
      color: "text-green-600 dark:text-green-400",
    },
    {
      id: "voice-settings",
      title: t("Voice Assistant"),
      subtitle: "Configure voice settings",
      icon: Settings,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      id: "privacy",
      title: t("Data Privacy"),
      subtitle: "Privacy & export settings",
      icon: Settings,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      id: "help",
      title: t("Help & Support"),
      subtitle: "Get help and contact support",
      icon: HelpCircle,
      color: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="pb-20 bg-gray-50 dark:bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t("profile")}</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-2 ring-green-500/20 dark:ring-green-400/30">
                  <AvatarImage src="" alt={farmerData.name} />
                  <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xl font-semibold">
                    {farmerData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white p-2 rounded-full transition-colors shadow-lg">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-foreground">
                  {farmerData.name}
                </h2>
                <p className="text-gray-600 dark:text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {farmerData.location}
                </p>
                <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
                  {farmerData.phone}
                </p>
              </div>
            </div>

            {/* Farm Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {farmerData.farmSize}
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  Farm Size
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {farmerData.experience}
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  Experience
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farm Information */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              {t("Farm Information")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-muted-foreground">
                Soil Type
              </span>
              <span className="font-medium text-foreground">
                {farmerData.soilType}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-muted-foreground">
                Primary Language
              </span>
              <span className="font-medium text-foreground">
                {farmerData.language}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-muted-foreground">
                AI Assistance Level
              </span>
              <span className="font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm border border-blue-200 dark:border-blue-800">
                {farmerData.aiLevel}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-accent">
                  {theme === "light" ? (
                    <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-foreground">
                    {t("Dark Mode")}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md dark:hover:shadow-xl transition-all duration-300 dark:bg-card dark:border-border group"
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full bg-gray-100 dark:bg-accent group-hover:scale-105 transition-transform duration-200 ${item.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 dark:text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="text-gray-400 dark:text-muted-foreground group-hover:text-gray-600 dark:group-hover:text-foreground transition-colors">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-400 dark:hover:border-red-600 transition-all duration-300"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t("Logout")}
        </Button>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-muted-foreground">
            VayalCare v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
