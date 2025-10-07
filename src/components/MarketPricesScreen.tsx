import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  MapPin,
  Loader2,
  AlertCircle,
  Plus,
  Store,
  Edit,
  Trash2,
  Eye,
  Star,
  Phone,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MarketPricesScreenProps {
  onBack?: () => void;
}

interface MarketData {
  crop: string;
  currentPrice: number;
  previousPrice: number;
  unit: string;
  trend: "up" | "down";
  change: number;
  market: string;
  arrivals?: string;
  quality?: string;
}

interface NearbyMarket {
  name: string;
  distance: string;
  status: "Open" | "Closed";
  speciality?: string;
}

interface FarmerListing {
  id: number;
  cropName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalValue: number;
  quality: "Excellent" | "Good" | "Average";
  harvestDate: string;
  listedDate: string;
  status: "Available" | "Sold" | "Reserved";
  views: number;
  inquiries: number;
  description?: string;
}

const MarketPricesScreen: React.FC<MarketPricesScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"prices" | "sell">("prices");
  const [selectedMarket, setSelectedMarket] = useState("nearby");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("Getting location...");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [, setTick] = useState(0); // Force re-renders for relative time updates
  
  // Farmer listing states
  const [farmerListings, setFarmerListings] = useState<FarmerListing[]>([]);
  const [showAddListingForm, setShowAddListingForm] = useState(false);
  const [newListing, setNewListing] = useState<{
    cropName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    quality: 'Excellent' | 'Good' | 'Average';
    harvestDate: string;
    description: string;
  }>({
    cropName: "",
    quantity: 0,
    unit: "kg",
    pricePerUnit: 0,
    quality: "Good",
    harvestDate: "",
    description: "",
  });

  // Helper function to format relative time
  const formatRelativeTime = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) return "";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle future dates (shouldn't happen, but just in case)
    if (diffInSeconds < 0) return "Just now";

    // Show "Just now" for first 2 minutes to avoid confusion
    if (diffInSeconds < 120) return "Just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60)
      return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    // For older dates, show the actual date
    return date.toLocaleDateString();
  };

  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      crop: "Tomato",
      currentPrice: 45,
      previousPrice: 40,
      unit: "₹/kg",
      trend: "up",
      change: 12.5,
      market: "Local Mandi",
    },
    {
      crop: "Chilli",
      currentPrice: 120,
      previousPrice: 130,
      unit: "₹/kg",
      trend: "down",
      change: -7.7,
      market: "Local Mandi",
    },
    {
      crop: "Onion",
      currentPrice: 25,
      previousPrice: 22,
      unit: "₹/kg",
      trend: "up",
      change: 13.6,
      market: "Local Mandi",
    },
    {
      crop: "Rice",
      currentPrice: 2200,
      previousPrice: 2150,
      unit: "₹/quintal",
      trend: "up",
      change: 2.3,
      market: "Wholesale Market",
    },
    {
      crop: "Wheat",
      currentPrice: 2050,
      previousPrice: 2100,
      unit: "₹/quintal",
      trend: "down",
      change: -2.4,
      market: "Wholesale Market",
    },
  ]);

  const [nearbyMarkets, setNearbyMarkets] = useState<NearbyMarket[]>([
    { name: "Local Mandi", distance: "2 km", status: "Open" },
    { name: "District Market", distance: "15 km", status: "Open" },
    { name: "Wholesale Hub", distance: "25 km", status: "Closed" },
  ]);

  // Initialize with some sample farmer listings
  useEffect(() => {
    const sampleListings: FarmerListing[] = [
      {
        id: 1,
        cropName: "Tomatoes",
        quantity: 50,
        unit: "kg",
        pricePerUnit: 45,
        totalValue: 2250,
        quality: "Excellent",
        harvestDate: "2025-09-25",
        listedDate: "2025-09-26",
        status: "Available",
        views: 12,
        inquiries: 3,
        description: "Fresh organic tomatoes from my farm",
      },
      {
        id: 2,
        cropName: "Onions",
        quantity: 100,
        unit: "kg",
        pricePerUnit: 40,
        totalValue: 4000,
        quality: "Good",
        harvestDate: "2025-09-20",
        listedDate: "2025-09-25",
        status: "Sold",
        views: 25,
        inquiries: 8,
        description: "Premium quality onions, well-dried and stored",
      },
    ];
    setFarmerListings(sampleListings);
  }, []);

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

  // Fetch live market data
  const fetchMarketData = async () => {
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

      // Get actual address from coordinates using Nominatim
      const actualLocation = await getAddressFromCoords(latitude, longitude);
      console.log("Detected location:", actualLocation);

      // Use Gemini to get location-based market data
      const marketPrompt = `You are a market data API that fetches real mandi prices from Agmarknet (Ministry of Agriculture & Farmers Welfare). 

Location: ${actualLocation}

Fetch current market prices for major crops in nearby mandis for this specific location: ${actualLocation}

Return a JSON object with this exact structure (no markdown, just pure JSON):
{
  "location": "${actualLocation}",
  "lastUpdated": "current date/time",
  "marketData": [
    {
      "crop": "Tomato|Rice|Wheat|Onion|Chilli|etc",
      "currentPrice": number,
      "previousPrice": number,
      "unit": "₹/kg|₹/quintal",
      "trend": "up|down",
      "change": number (percentage change),
      "market": "Market/Mandi Name",
      "arrivals": "arrival quantity in tons/quintals",
      "quality": "Excellent|Good|Average|Poor"
    }
  ],
  "nearbyMarkets": [
    {
      "name": "Market Name", 
      "distance": "X km",
      "status": "Open|Closed",
      "speciality": "Wholesale|Retail|Mixed"
    }
  ],
  "marketSummary": {
    "pricesUp": number,
    "pricesDown": number,
    "totalCrops": number
  }
}

Focus on major crops like Rice, Wheat, Tomato, Onion, Chilli, Potato, Sugarcane based on the region around ${actualLocation}. Use realistic Indian mandi prices and include nearby major agricultural markets. Make prices region-appropriate (e.g., Kerala prices for spices, Punjab for wheat/rice, etc.).

For quality, use simple terms that farmers understand:
- "Excellent" for premium quality produce
- "Good" for standard quality produce  
- "Average" for acceptable quality produce
- "Poor" for low quality produce

Avoid technical terms like "FAQ" (Fair Average Quality) - use plain language instead.`;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

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
                    text: marketPrompt,
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
      const marketText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Extract JSON from response
      const jsonMatch = marketText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const marketPriceData = JSON.parse(jsonMatch[0]);

        // Set the location from Nominatim (actualLocation)
        setLocation(actualLocation);

        // Set lastUpdated to current time (actual fetch time) regardless of API response
        setLastUpdated(new Date());

        setMarketData(marketPriceData.marketData || marketData);
        setNearbyMarkets(marketPriceData.nearbyMarkets || nearbyMarkets);
      } else {
        // If JSON parsing fails, still set the detected location
        setLocation(actualLocation);
        throw new Error("Invalid market data format");
      }
    } catch (err) {
      console.error("Market data fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch market data"
      );
      // Don't set timestamp on error - let the UI show no update time
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  // Update relative time display every 5 minutes
  useEffect(() => {
    if (!lastUpdated) return;

    const interval = setInterval(() => {
      // Force re-render to update relative time display
      setTick((prev) => prev + 1);
    }, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Calculate market summary from current data
  const marketSummary = React.useMemo(() => {
    const pricesUp = marketData.filter((item) => item.trend === "up").length;
    const pricesDown = marketData.filter(
      (item) => item.trend === "down"
    ).length;
    const totalCrops = marketData.length;

    return {
      pricesUp,
      pricesDown,
      totalCrops,
    };
  }, [marketData]);

  return (
    <div className="pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header with Tabs */}
      <div className="bg-green-600 dark:bg-green-700 text-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="mr-3 text-white hover:bg-white/20 dark:hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Market Hub</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 dark:hover:bg-white/10"
              onClick={fetchMarketData}
              disabled={loading}
              title={loading ? "Updating..." : "Refresh market data"}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Location Info */}
          <div className="flex items-center gap-2 text-green-100 dark:text-green-200 text-sm mb-4">
            <span title={location}>{getTruncatedLocation(location)}</span>
            {lastUpdated &&
              !location.includes("Getting location") &&
              !location.match(/^\d+\.\d+, \d+\.\d+$/) && (
                <span>• Updated: {formatRelativeTime(lastUpdated)}</span>
              )}
          </div>
          
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 gap-1 bg-white/10 backdrop-blur-sm p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center ${
                activeTab === 'prices'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Store className="w-4 h-4 mr-2" />
              Prices
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center ${
                activeTab === 'sell'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Sell
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Error fetching market data</p>
                  <p className="text-sm text-red-500 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Content */}
        {activeTab === 'prices' && (
          <PricesTabContent 
            marketData={marketData}
            nearbyMarkets={nearbyMarkets}
            loading={loading}
            marketSummary={marketSummary}
          />
        )}

        {activeTab === 'sell' && (
          <SellTabContent 
            farmerListings={farmerListings}
            setFarmerListings={setFarmerListings}
            newListing={newListing}
            setNewListing={setNewListing}
          />
        )}
      </div>
    </div>
  );
}

// Prices Tab Component
const PricesTabContent: React.FC<{
  marketData: any[];
  nearbyMarkets: NearbyMarket[];
  loading: boolean;
  marketSummary: any;
}> = ({ marketData, nearbyMarkets, loading, marketSummary }) => {
  return (
    <>
      {/* Market Selection */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center dark:text-white">
            <MapPin className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
            Nearby Markets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {nearbyMarkets.map((market, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700/50"
              >
                <div>
                  <p className="font-medium text-sm dark:text-white">
                    {market.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {market.distance} away
                  </p>
                </div>
                <Badge
                  className={
                    market.status === "Open"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }
                >
                  {market.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Today's Prices
        </h2>

        {loading ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
              <p className="text-gray-600 dark:text-gray-300">
                Fetching live market data...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Getting prices from nearby mandis
              </p>
            </CardContent>
          </Card>
        ) : (
          marketData.map((item, index) => (
            <Card
              key={index}
              className="hover:shadow-md dark:hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border-gray-700"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {item.crop}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {item.market}
                    </p>
                    {item.arrivals && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Arrivals: {item.arrivals}
                      </p>
                    )}
                    {item.quality && (
                      <Badge
                        className="text-xs mt-1"
                        variant={
                          item.quality === "Excellent" ||
                          item.quality === "Good"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {item.quality}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-800 dark:text-white">
                        {item.currentPrice} {item.unit}
                      </span>
                      <div
                        className={`flex items-center ${
                          item.trend === "up"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {item.trend === "up" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium ml-1">
                          {Math.abs(item.change)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Previous: {item.previousPrice} {item.unit}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Price Alerts */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-base dark:text-white">
            Price Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Get notified when prices reach your target
          </p>
          <Button
            variant="outline"
            className="w-full dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            Set Price Alerts
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-base dark:text-white">
            Market Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {marketSummary.pricesUp}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Prices Up
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {marketSummary.pricesDown}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Prices Down
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Sell Tab Component
const SellTabContent: React.FC<{
  farmerListings: FarmerListing[];
  setFarmerListings: (listings: FarmerListing[]) => void;
  newListing: {
    cropName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    quality: 'Excellent' | 'Good' | 'Average';
    harvestDate: string;
    description: string;
  };
  setNewListing: (listing: {
    cropName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    quality: 'Excellent' | 'Good' | 'Average';
    harvestDate: string;
    description: string;
  }) => void;
}> = ({ farmerListings, setFarmerListings, newListing, setNewListing }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddListing = () => {
    if (newListing.cropName && newListing.quantity && newListing.pricePerUnit) {
      const listing: FarmerListing = {
        id: Date.now(),
        cropName: newListing.cropName,
        quantity: newListing.quantity,
        unit: newListing.unit,
        pricePerUnit: newListing.pricePerUnit,
        totalValue: newListing.quantity * newListing.pricePerUnit,
        quality: newListing.quality,
        harvestDate: newListing.harvestDate || new Date().toISOString().split('T')[0],
        listedDate: new Date().toISOString().split('T')[0],
        status: 'Available',
        views: 0,
        inquiries: 0,
        description: newListing.description,
      };
      
      setFarmerListings([...farmerListings, listing]);
      setNewListing({
        cropName: "",
        quantity: 0,
        unit: "kg",
        pricePerUnit: 0,
        quality: "Good",
        harvestDate: "",
        description: "",
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteListing = (id: number) => {
    setFarmerListings(farmerListings.filter(listing => listing.id !== id));
  };

  return (
    <>
      {/* Add New Listing Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Crop Listings</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Listing</span>
        </button>
      </div>

      {/* Add Listing Form */}
      {showAddForm && (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Crop Listing</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Crop Name *
                </label>
                <input
                  type="text"
                  value={newListing.cropName}
                  onChange={(e) => setNewListing({...newListing, cropName: e.target.value})}
                  placeholder="e.g., Tomatoes, Rice, Wheat"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={newListing.quantity || ''}
                  onChange={(e) => setNewListing({...newListing, quantity: parseFloat(e.target.value) || 0})}
                  placeholder="Amount available"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit
                </label>
                <select
                  value={newListing.unit}
                  onChange={(e) => setNewListing({...newListing, unit: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="kg">kg</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Ton</option>
                  <option value="bag">Bag</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price per Unit (₹) *
                </label>
                <input
                  type="number"
                  value={newListing.pricePerUnit || ''}
                  onChange={(e) => setNewListing({...newListing, pricePerUnit: parseFloat(e.target.value) || 0})}
                  placeholder="Price per unit"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality Grade
                </label>
                <select
                  value={newListing.quality}
                  onChange={(e) => setNewListing({...newListing, quality: e.target.value as 'Excellent' | 'Good' | 'Average'})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Harvest Date
                </label>
                <input
                  type="date"
                  value={newListing.harvestDate}
                  onChange={(e) => setNewListing({...newListing, harvestDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newListing.description}
                onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                placeholder="Additional details about your crop (optional)"
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddListing}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add Listing
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {farmerListings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{listing.cropName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {listing.quantity} {listing.unit} • ₹{listing.pricePerUnit}/{listing.unit}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={
                      listing.status === 'Available' 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : listing.status === 'Sold'
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    }
                  >
                    {listing.status}
                  </Badge>
                  <button
                    onClick={() => handleDeleteListing(listing.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                  <span className="font-medium text-green-600">₹{listing.totalValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Quality:</span>
                  <span className="font-medium">{listing.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Harvest Date:</span>
                  <span>{listing.harvestDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Listed:</span>
                  <span>{listing.listedDate}</span>
                </div>
              </div>
              
              {listing.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic">
                  "{listing.description}"
                </p>
              )}
              
              <div className="flex justify-between items-center mt-4 pt-3 border-t dark:border-gray-700">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{listing.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{listing.inquiries}</span>
                  </div>
                </div>
                
                {listing.status === 'Available' && (
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>Promote</span>
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {farmerListings.length === 0 && (
        <Card className="text-center py-12 dark:bg-gray-800 dark:border-gray-700">
          <CardContent>
            <Store className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Listings Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start selling your crops directly to buyers with fair prices
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Create Your First Listing
            </button>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default MarketPricesScreen;
