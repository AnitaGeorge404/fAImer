import React, { useState, useEffect } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Droplet,
  ArrowLeft,
  MapPin,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WeatherAlertsScreenProps {
  onBack?: () => void;
}

const WeatherAlertsScreen: React.FC<WeatherAlertsScreenProps> = ({
  onBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<string>("Getting location...");
  const [error, setError] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState({
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    condition: "Partly Cloudy",
    rainfall: 0,
  });

  const [alerts, setAlerts] = useState([
    {
      type: "warning",
      title: "Heavy Rainfall Expected",
      message:
        "Heavy rain expected tomorrow. Protect your crops and ensure proper drainage.",
      time: "2 hours ago",
      severity: "High",
    },
    {
      type: "advisory",
      title: "High Temperature Alert",
      message: "Temperature may reach 35°C. Increase irrigation frequency.",
      time: "4 hours ago",
      severity: "Medium",
    },
    {
      type: "info",
      title: "Favorable Weather",
      message: "Good weather conditions for crop spraying operations.",
      time: "1 day ago",
      severity: "Low",
    },
  ]);

  const [weeklyForecast, setWeeklyForecast] = useState([
    { day: "Mon", condition: "Sunny", high: 30, low: 22, rain: 0 },
    { day: "Tue", condition: "Rainy", high: 26, low: 20, rain: 85 },
    { day: "Wed", condition: "Cloudy", high: 28, low: 21, rain: 20 },
    { day: "Thu", condition: "Sunny", high: 32, low: 24, rain: 0 },
    { day: "Fri", condition: "Partly Cloudy", high: 29, low: 23, rain: 10 },
    { day: "Sat", condition: "Sunny", high: 31, low: 25, rain: 0 },
    { day: "Sun", condition: "Cloudy", high: 27, low: 22, rain: 40 },
  ]);

  // Function to get address from coordinates using Nominatim
  const getAddressFromCoords = async (
    lat: number,
    lng: number
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.log("Nominatim geocoding failed:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Function to truncate address for display
  const getTruncatedLocation = (fullAddress: string): string => {
    // Split by both commas and spaces to get individual words
    const words = fullAddress.split(/[,\s]+/).filter((word) => word.length > 0);

    // Show only first two words followed by "..."
    if (words.length > 4) {
      return `${words[0]} ${words[1]} ${words[2]} ${words[3]}...`;
    }

    // If 2 or fewer words, return as is
    return words.join(" ");
  };

  // Get user location and fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's location
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error("Geolocation is not supported"));
              return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000, // 5 minutes
            });
          }
        );

        const { latitude, longitude } = position.coords;
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        // Get actual address from coordinates using Nominatim
        const actualLocation = await getAddressFromCoords(latitude, longitude);
        console.log("Detected location:", actualLocation);

        // Use Gemini to get comprehensive weather data
        const weatherPrompt = `You are a weather data API that provides accurate location-based weather information for farming.

Location: ${actualLocation}

Provide current weather information and 7-day forecast for this specific location: ${actualLocation}

Return a JSON object with exactly this structure (no markdown, just pure JSON):
{
  "location": "${actualLocation}",
  "currentWeather": {
    "temperature": number (in Celsius),
    "humidity": number (percentage),
    "windSpeed": number (km/h),
    "condition": "Sunny|Rainy|Cloudy|Partly Cloudy",
    "rainfall": number (mm in last 24h)
  },
  "alerts": [
    {
      "type": "warning|advisory|info",
      "title": "Alert Title",
      "message": "Short Farm-relevant alert message for ${actualLocation}",
      "time": "X hours/days ago",
      "severity": "High|Medium|Low"
    }
  ],
  "weeklyForecast": [
    {
      "day": "Mon|Tue|Wed|Thu|Fri|Sat|Sun",
      "condition": "Sunny|Rainy|Cloudy|Partly Cloudy", 
      "high": number,
      "low": number,
      "rain": number (percentage chance)
    }
  ],
  "farmAdvisory": [
    {
      "category": "Irrigation|Crop Protection|Harvesting",
      "title": "Advisory Title",
      "message": "Specific farming advice for ${actualLocation}",
      "priority": "high|medium|low"
    }
  ]
}

Base the weather data on the current conditions for ${actualLocation}. Make alerts and advisories relevant to farming activities in this specific region. Include realistic temperature ranges and weather patterns typical for ${actualLocation} and its climate zone.`;

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: weatherPrompt,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const weatherText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Extract JSON from response
        const jsonMatch = weatherText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const weatherData = JSON.parse(jsonMatch[0]);

          // Set the location from Nominatim (actualLocation)
          setLocation(actualLocation);

          if (weatherData.currentWeather) {
            setCurrentWeather(weatherData.currentWeather);
          }
          if (weatherData.alerts) {
            setAlerts(weatherData.alerts);
          }
          if (weatherData.weeklyForecast) {
            setWeeklyForecast(weatherData.weeklyForecast);
          }
        } else {
          // If JSON parsing fails, still set the detected location
          setLocation(actualLocation);
          throw new Error("Invalid weather data format");
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch weather data"
        );
        // Keep fallback data on error
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "Sunny":
        return <Sun className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />;
      case "Rainy":
        return (
          <CloudRain className="h-6 w-6 text-blue-500 dark:text-blue-400" />
        );
      case "Cloudy":
        return <Cloud className="h-6 w-6 text-gray-500 dark:text-gray-400" />;
      case "Partly Cloudy":
        return <Cloud className="h-6 w-6 text-gray-400 dark:text-gray-300" />;
      default:
        return <Sun className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      High: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
      Medium:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700",
      Low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700",
    };
    return colors[severity as keyof typeof colors];
  };

  return (
    <div className="pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-sky-600 dark:bg-sky-700 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-3 text-white hover:bg-white/20 dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Weather Alerts</h1>
            <div className="flex items-center text-sky-100 dark:text-sky-200 text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Getting location...
                </div>
              ) : (
                <span title={location}>{getTruncatedLocation(location)}</span>
              )}
            </div>
          </div>
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        </div>
      </div>

      {error && (
        <div className="p-4">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <p className="text-red-800 dark:text-red-300 text-sm">
              {error}. Showing sample data.
            </p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Current Weather */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base dark:text-white flex items-center">
              Current Weather
              {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getWeatherIcon(currentWeather.condition)}
                <div>
                  <p className="text-2xl font-bold dark:text-white">
                    {currentWeather.temperature}°C
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {currentWeather.condition}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Humidity
                </span>
                <span className="font-medium dark:text-white">
                  {currentWeather.humidity}%
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Wind className="h-4 w-4 text-gray-600 dark:text-gray-400 mb-1" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Wind
                </span>
                <span className="font-medium dark:text-white">
                  {currentWeather.windSpeed} km/h
                </span>
              </div>
              <div className="flex flex-col items-center">
                <CloudRain className="h-4 w-4 text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Rainfall
                </span>
                <span className="font-medium dark:text-white">
                  {currentWeather.rainfall} mm
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Alerts */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base dark:text-white flex items-center">
              Active Alerts
              {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700/50 animate-pulse"
                  >
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700/50 ${
                      alert.severity === "high"
                        ? "border-l-4 border-l-red-500 dark:border-l-red-400"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm dark:text-white">
                        {alert.title}
                      </h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {alert.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 7-Day Forecast */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base dark:text-white flex items-center">
              7-Day Forecast
              {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 animate-pulse"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {weeklyForecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium w-8 dark:text-white">
                        {day.day}
                      </span>
                      {getWeatherIcon(day.condition)}
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {day.condition}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="font-medium dark:text-white">
                          {day.high}°
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                          {day.low}°
                        </span>
                      </div>
                      <div className="flex items-center text-blue-600 dark:text-blue-400">
                        <Droplet className="h-3 w-3 mr-1" />
                        <span className="text-xs">{day.rain}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Farm Impact Advisory */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">
              Farm Impact Advisory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Irrigation
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Reduce watering due to expected rainfall
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">
                  Crop Protection
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Good conditions for disease prevention spray
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-1">
                  Harvesting
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Complete harvest before Tuesday's rain
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeatherAlertsScreen;
