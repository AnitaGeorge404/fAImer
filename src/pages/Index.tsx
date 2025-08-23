import React, { useState } from "react";
import LoginPage from "../components/LoginPage";
import HomeScreen from "../components/HomeScreen";
import FarmingTwinScreen from "../components/FarmingTwinScreen";
import FarmerAssistantScreen from "../components/FarmerAssistantScreen";
import AlertsScreen from "../components/AlertsScreen";
import ProfileScreen from "../components/ProfileScreen";
import DiagnoseCropScreen from "../components/DiagnoseCropScreen";
import MarketPricesScreen from "../components/MarketPricesScreen";
import CropPlannerScreen from "../components/CropPlannerScreen";
import WeatherAlertsScreen from "../components/WeatherAlertsScreen";
import FarmerForumScreen from "../components/FarmerForumScreen";
import KnowledgeCenterScreen from "../components/KnowledgeCenterScreen";
import KnowledgeScreen from "../components/KnowledgeScreen";
import BuyInputsScreen from "../components/BuyInputsScreen";
import ScanPestScreen from "../components/ScanPestScreen";
import ExpenseTrackerScreen from "../components/ExpenseTrackerScreen";
import AgricultureNewsScreen from "../components/AgricultureNewsScreen";
import GovtSchemesScreen from "../components/GovtSchemesScreen";
import LabourerHub from "../components/LabourerHub";
import FairFarm from "../components/FairFarm";
import CropWise from "../components/CropWise";
import BottomNavigation from "../components/BottomNavigation";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Temporarily set to true for local testing
  const [activeTab, setActiveTab] = useState("home");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [initialChatQuestion, setInitialChatQuestion] = useState<string | null>(
    null
  );

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLanguageChange = (languageCode: string) => {
    console.log("Language changed to:", languageCode);
    setSelectedLanguage(languageCode);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            onFeatureClick={(id) => {
              // Reset any pending chat question unless going to chatbot via voice
              if (id !== "chatbot") setInitialChatQuestion(null);
              setActiveTab(id);
            }}
            onVoiceChat={(q) => {
              setInitialChatQuestion(q);
              setActiveTab("chatbot");
            }}
            language={selectedLanguage}
          />
        );
      case "twin":
        return <FarmingTwinScreen onBack={() => setActiveTab("home")} />;
      case "chatbot":
        return (
          <FarmerAssistantScreen
            initialQuestion={initialChatQuestion || undefined}
            onExit={() => {
              setActiveTab("home");
              setInitialChatQuestion(null);
            }}
            onFeatureClick={(id) => {
              // Reset any pending chat question unless staying in chatbot
              if (id !== "chatbot") setInitialChatQuestion(null);
              setActiveTab(id);
            }}
          />
        );
      case "notifications":
        return <AlertsScreen onBack={() => setActiveTab("home")} />;
      case "profile":
        return <ProfileScreen onBack={() => setActiveTab("home")} />;
      case "diagnose":
        return <DiagnoseCropScreen onBack={() => setActiveTab("home")} />;
      case "market":
        return <MarketPricesScreen onBack={() => setActiveTab("home")} />;
      case "planner":
        return <CropPlannerScreen onBack={() => setActiveTab("home")} />;
      case "weather":
        return <WeatherAlertsScreen onBack={() => setActiveTab("home")} />;
      case "forum":
        return <FarmerForumScreen onBack={() => setActiveTab("home")} />;
      case "resources":
        return (
          <KnowledgeCenterScreen
            onBack={() => setActiveTab("home")}
            onFeatureClick={setActiveTab}
          />
        );
      case "knowledge":
        return <KnowledgeScreen onBack={() => setActiveTab("resources")} />;
      case "buy":
        return <BuyInputsScreen onBack={() => setActiveTab("resources")} />;
      case "scan":
        return <ScanPestScreen onBack={() => setActiveTab("resources")} />;
      case "expense":
        return (
          <ExpenseTrackerScreen onBack={() => setActiveTab("resources")} />
        );
      case "news":
        return (
          <AgricultureNewsScreen onBack={() => setActiveTab("resources")} />
        );
      case "schemes":
        return <GovtSchemesScreen onBack={() => setActiveTab("resources")} />;
      case "labourers":
        return <LabourerHub onBack={() => setActiveTab("resources")} />;
      case "fairfarm":
        return <FairFarm onBack={() => setActiveTab("home")} />;
      case "cropwise":
        return (
          <CropWise
            onBack={() => setActiveTab("home")}
            language={selectedLanguage}
          />
        );
      default:
        return (
          <HomeScreen
            onFeatureClick={setActiveTab}
            language={selectedLanguage}
          />
        );
    }
  };

  // Temporarily commented out for local testing
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {renderScreen()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
