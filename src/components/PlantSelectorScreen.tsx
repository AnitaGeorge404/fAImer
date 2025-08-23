import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  Home,
  Database,
  FileText,
  Bell,
  User,
  ArrowLeft,
} from "lucide-react";
import "./PlantSelector.css";

// Define a type for our plant objects for type safety
interface Plant {
  id: string;
  name: string;
  emoji: string;
  color: string;
  personality: string;
}

const PlantSelectorScreen = () => {
  const [selectedPlant, setSelectedPlant] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);

  // The array of plants, now typed with our Plant interface
  const plants: Plant[] = [
    {
      id: "1",
      name: "Rosie",
      emoji: "🌹",
      color: "rose-red",
      personality: "Cheerful and romantic",
    },
    {
      id: "2",
      name: "Sunny",
      emoji: "🌻",
      color: "yellow-500",
      personality: "Bright and energetic",
    },
    {
      id: "3",
      name: "Daisy",
      emoji: "🌼",
      color: "pink-accent",
      personality: "Sweet and gentle",
    },
    {
      id: "4",
      name: "Cactus Carl",
      emoji: "🌵",
      color: "leaf-green",
      personality: "Cool and collected",
    },
    {
      id: "5",
      name: "Tulip",
      emoji: "🌷",
      color: "pink-deep",
      personality: "Elegant and graceful",
    },
  ];

  const handlePlantSelect = (index: number) => {
    setSelectedPlant(index);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const currentPlant = plants[selectedPlant];

  return (
    <div className="plant-interface">
      {/* A simple back button to fit into the app flow */}
      <div className="header-bar">
        <button className="back-button">
          <ArrowLeft size={24} />
        </button>
        <h1 className="header-title">Crop Companion</h1>
      </div>

      {/* Carousel Selector */}
      <div className="carousel-container">
        <div className="carousel-wrapper">
          {plants.map((plant, index) => (
            <motion.button
              key={plant.id}
              onClick={() => handlePlantSelect(index)}
              className={`carousel-item ${
                selectedPlant === index ? "active" : ""
              }`}
              whileHover={{ scale: selectedPlant === index ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                scale: selectedPlant === index ? 1.1 : 1,
                opacity: selectedPlant === index ? 1 : 0.7,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <span className="plant-emoji">{plant.emoji}</span>
              {selectedPlant === index && (
                <motion.div
                  className="selected-indicator"
                  layoutId="selectedIndicator"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Character Display */}
      <div className="main-character-container">
        <div className="character-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPlant}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="character-content"
            >
              <motion.div
                className="main-character"
                animate={{
                  rotate: isListening ? [0, 2, -2, 0] : 0,
                  scale: isListening ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: isListening ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                {currentPlant.emoji}
              </motion.div>
              <motion.div
                className="character-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="character-name">{currentPlant.name}</h2>
                <p className="character-personality">
                  {currentPlant.personality}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
          {isListening && (
            <motion.div
              className="listening-indicator"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className="waveform-bars">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="waveform-bar"
                    animate={{ height: [8, 20, 8] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Audio Section */}
      <div className="audio-section">
        <div className="mic-container">
          <motion.button
            onClick={toggleListening}
            className={`mic-button ${isListening ? "listening" : ""}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: isListening
                ? [
                    "0 0 30px rgba(76, 175, 80, 0.6)",
                    "0 0 50px rgba(76, 175, 80, 0.8)",
                    "0 0 30px rgba(76, 175, 80, 0.6)",
                  ]
                : "0 0 20px rgba(76, 175, 80, 0.3)",
            }}
            transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
          >
            <Mic className={`mic-icon ${isListening ? "active" : ""}`} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PlantSelectorScreen;
