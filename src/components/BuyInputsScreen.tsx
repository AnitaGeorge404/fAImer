import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  Star,
  ArrowLeft,
  Check,
  X,
  Minus,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Input {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  vendor: string;
  imageUrl: string;
  availability: string;
  marketplace?: string;
  discount?: number;
  isLoading?: boolean;
}

interface BuyInputsScreenProps {
  onBack?: () => void;
}

const BuyInputsScreen: React.FC<BuyInputsScreenProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [inputs, setInputs] = useState<Input[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if Gemini API key is available
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

  const staticInputs: Input[] = [
    {
      id: 1,
      name: "Neem Oil - 5 Litre",
      category: "Pesticides",
      price: 450,
      rating: 4.5,
      vendor: "Agro Solutions",
      imageUrl: "https://example.com/neem-oil.jpg",
      availability: "In Stock",
    },
    {
      id: 2,
      name: "Organic Fertilizer - 50 kg",
      category: "Fertilizers",
      price: 800,
      rating: 4.8,
      vendor: "EcoFarm",
      imageUrl: "https://example.com/organic-fertilizer.jpg",
      availability: "In Stock",
    },
    {
      id: 3,
      name: "Hybrid Tomato Seeds - 1000 seeds",
      category: "Seeds",
      price: 1200,
      rating: 4.2,
      vendor: "SeedCo",
      imageUrl: "https://example.com/tomato-seeds.jpg",
      availability: "In Stock",
    },
    {
      id: 4,
      name: "Drip Irrigation Kit - 500m",
      category: "Equipment",
      price: 3500,
      rating: 4.6,
      vendor: "Irrigation Systems Ltd.",
      imageUrl: "https://example.com/drip-kit.jpg",
      availability: "In Stock",
    },
    {
      id: 5,
      name: "Bio Pest Control - 1 Litre",
      category: "Pesticides",
      price: 600,
      rating: 4.9,
      vendor: "Green Earth Agro",
      imageUrl: "https://example.com/bio-pest-control.jpg",
      availability: "In Stock",
    },
  ];

  const fetchRealTimePrices = async () => {
    setIsLoading(true);

    // Check if API key is available
    if (!genAI) {
      console.warn("Gemini API key not found, using static prices");
      setInputs(
        staticInputs.map((item) => ({
          ...item,
          marketplace: "Static Data",
          availability: "In Stock",
        }))
      );
      toast({
        title: "API Key Missing",
        description:
          "Using static prices. Configure Gemini API key for real-time pricing.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemma-3n-e2b-it" });

      const updatedInputs = await Promise.all(
        staticInputs.map(async (item) => {
          try {
            const prompt = `Find the current market price in Indian Rupees (₹) for "${item.name}" from online marketplaces like Amazon India, BigBasket, or agricultural suppliers in India. Return ONLY a JSON object with this exact format:
{
  "price": <current_price_as_number>,
  "originalPrice": <higher_price_if_discounted_or_same_as_price>,
  "marketplace": "<marketplace_name>",
  "discount": <discount_percentage_if_any_or_0>
}

If no exact match found, provide estimated price based on similar products. Keep prices realistic for Indian agricultural market.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const priceData = JSON.parse(jsonMatch[0]);
              return {
                ...item,
                price: priceData.price || item.price,
                originalPrice:
                  priceData.originalPrice || priceData.price || item.price,
                marketplace: priceData.marketplace || "Market Estimate",
                discount: priceData.discount || 0,
                isLoading: false,
              };
            }
          } catch (error) {
            console.error(`Error fetching price for ${item.name}:`, error);
          }

          return {
            ...item,
            marketplace: "Static Price",
            isLoading: false,
          };
        })
      );

      setInputs(updatedInputs);
      toast({
        title: "Prices Updated",
        description:
          "Real-time commodity prices have been fetched successfully.",
      });
    } catch (error) {
      console.error("Error fetching prices:", error);
      setInputs(
        staticInputs.map((item) => ({
          ...item,
          marketplace: "Offline Mode",
          availability: "In Stock",
        }))
      );
      toast({
        title: "Connection Error",
        description: "Using cached prices. Check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimePrices();
  }, []);

  const categories = ["All", "Seeds", "Fertilizers", "Pesticides", "Equipment"];

  const filteredInputs = inputs.filter((input) => {
    const searchTermMatch = input.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatch =
      filterCategory === "all" || input.category === filterCategory;
    return searchTermMatch && categoryMatch;
  });

  const addToCart = (inputId: number) => {
    setCartItems((prev) => [...prev, inputId]);
  };

  const isInCart = (inputId: number) => {
    return cartItems.includes(inputId);
  };

  const removeFromCart = (inputId: number) => {
    setCartItems((prev) => prev.filter((id) => id !== inputId));
  };

  const getCartItems = () => {
    const cartItemsWithDetails = cartItems
      .map((itemId) => {
        const item = inputs.find((input) => input.id === itemId);
        return item;
      })
      .filter(Boolean);
    return cartItemsWithDetails;
  };

  const getTotalPrice = () => {
    return getCartItems().reduce(
      (total, item) => total + (item?.price || 0),
      0
    );
  };

  return (
    <div className="pb-20 bg-gray-50 dark:bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
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
              <h1 className="text-xl font-bold">Buy Inputs</h1>
              <p className="text-emerald-100 dark:text-emerald-200 text-sm">
                {isLoading
                  ? "Updating prices..."
                  : "Real-time marketplace prices"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRealTimePrices}
              disabled={isLoading}
              className="text-white hover:bg-white/20 dark:hover:bg-white/10"
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 dark:hover:bg-white/10"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Cart ({cartItems.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                    Shopping Cart
                  </DialogTitle>
                  <DialogDescription>
                    Review your selected farming supplies before checkout.
                  </DialogDescription>
                </DialogHeader>

                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Add some farming supplies to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getCartItems().map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {item?.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {item?.vendor}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item?.category}
                            </Badge>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {item?.rating}
                              </span>
                            </div>
                            {item?.marketplace && (
                              <Badge
                                variant="outline"
                                className="text-xs text-blue-600"
                              >
                                {item.marketplace}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-800 dark:text-white">
                            ₹{item?.price}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item?.id || 0)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">
                          Total:
                        </span>
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{getTotalPrice()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowCartDialog(false)}
                        >
                          Continue Shopping
                        </Button>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                          Proceed to Checkout
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search for seeds, fertilizers, pesticides..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={
                filterCategory === category.toLowerCase()
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => setFilterCategory(category.toLowerCase())}
              className={`whitespace-nowrap ${filterCategory === category.toLowerCase() ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700" : "dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Inputs List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card
                  key={index}
                  className="dark:bg-gray-800 dark:border-gray-700 animate-pulse"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16 ml-2"></div>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                    </div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-3"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            filteredInputs.map((input) => (
              <Card
                key={input.id}
                className="cursor-pointer hover:shadow-lg dark:hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border-gray-700"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex-1">
                      {input.name}
                    </h3>
                    <div className="flex flex-col items-end ml-2">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 mb-1">
                        {input.category}
                      </Badge>
                      {input.marketplace && (
                        <Badge
                          variant="outline"
                          className="text-xs text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600"
                        >
                          {input.marketplace}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <span className="font-bold text-xl text-gray-800 dark:text-white">
                          ₹{input.price}
                        </span>
                        {input.originalPrice &&
                          input.originalPrice > input.price && (
                            <>
                              <span className="text-gray-500 dark:text-gray-400 line-through ml-2 text-sm">
                                ₹{input.originalPrice}
                              </span>
                              {input.discount && input.discount > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="ml-2 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                >
                                  {input.discount}% OFF
                                </Badge>
                              )}
                            </>
                          )}
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          {" "}
                          / unit
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 dark:text-yellow-400" />
                      <span>{input.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <span>Vendor: {input.vendor}</span>
                    {input.availability && (
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          input.availability === "In Stock"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : input.availability === "Limited Stock"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {input.availability}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={isInCart(input.id) ? "default" : "outline"}
                    className={`w-full ${
                      isInCart(input.id)
                        ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                        : "dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                    }`}
                    onClick={() => addToCart(input.id)}
                    disabled={
                      isInCart(input.id) ||
                      input.availability === "Out of Stock"
                    }
                  >
                    {isInCart(input.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Added to Cart
                      </>
                    ) : input.availability === "Out of Stock" ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Out of Stock
                      </>
                    ) : (
                      "Add to Cart"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Filters */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {["Seeds", "Fertilizers", "Pesticides"].map((category, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                onClick={() => setFilterCategory(category.toLowerCase())}
              >
                {category}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyInputsScreen;
