import React, { useState } from "react";
import {
  ArrowLeft,
  Store,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Star,
  Filter,
  Search,
  ShoppingCart,
  Heart,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface FairFarmProps {
  onBack?: () => void;
}

interface FarmProduct {
  id: number;
  name: string;
  farmer: string;
  location: string;
  price: number;
  unit: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  organic: boolean;
  inStock: boolean;
  phone: string;
}

interface PurchaseOrder {
  id: number;
  productId: number;
  productName: string;
  farmer: string;
  buyer: string;
  price: number;
  timestamp: string;
  status: "pending" | "confirmed" | "delivered";
}

const FairFarm: React.FC<FairFarmProps> = ({ onBack }) => {
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [buyerNameInput, setBuyerNameInput] = useState("");
  const [pendingProduct, setPendingProduct] = useState<FarmProduct | null>(
    null
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handlePurchase = (product: FarmProduct, buyerName: string) => {
    const now = new Date();
    const indiaTime = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
    });

    const newOrder: PurchaseOrder = {
      id: purchaseOrders.length + 1,
      productId: product.id,
      productName: product.name,
      farmer: product.farmer,
      buyer: buyerName,
      price: product.price,
      timestamp: indiaTime,
      status: "confirmed",
    };

    setPurchaseOrders((prev) => [...prev, newOrder]);

    // Show success message
    setSuccessMessage(
      `Order confirmed! ${product.name} from ${product.farmer} for ₹${product.price}`
    );
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const categories = [
    { id: "all", name: "All Products" },
    { id: "vegetables", name: "Vegetables" },
    { id: "fruits", name: "Fruits" },
    { id: "grains", name: "Grains" },
    { id: "dairy", name: "Dairy" },
    { id: "organic", name: "Organic" },
  ];

  const farmProducts: FarmProduct[] = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      farmer: "Rajesh Kumar",
      location: "Pune, Maharashtra",
      price: 45,
      unit: "kg",
      rating: 4.8,
      reviews: 124,
      image: "/placeholder.svg",
      category: "vegetables",
      organic: true,
      inStock: true,
      phone: "+91 9876543210",
    },
    {
      id: 2,
      name: "Organic Onions",
      farmer: "Sunita Devi",
      location: "Nashik, Maharashtra",
      price: 40,
      unit: "kg",
      rating: 4.6,
      reviews: 89,
      image: "/placeholder.svg",
      category: "vegetables",
      organic: true,
      inStock: true,
      phone: "+91 9876543211",
    },
    {
      id: 3,
      name: "Farm Fresh Milk",
      farmer: "Mahesh Patel",
      location: "Anand, Gujarat",
      price: 55,
      unit: "liter",
      rating: 4.9,
      reviews: 156,
      image: "/placeholder.svg",
      category: "dairy",
      organic: true,
      inStock: true,
      phone: "+91 9876543212",
    },
    {
      id: 4,
      name: "Premium Basmati Rice",
      farmer: "Gurpreet Singh",
      location: "Amritsar, Punjab",
      price: 85,
      unit: "kg",
      rating: 4.7,
      reviews: 203,
      image: "/placeholder.svg",
      category: "grains",
      organic: false,
      inStock: true,
      phone: "+91 9876543213",
    },
    {
      id: 5,
      name: "Sweet Mangoes",
      farmer: "Ravi Sharma",
      location: "Ratnagiri, Maharashtra",
      price: 120,
      unit: "kg",
      rating: 4.9,
      reviews: 298,
      image: "/placeholder.svg",
      category: "fruits",
      organic: true,
      inStock: false,
      phone: "+91 9876543214",
    },
    {
      id: 6,
      name: "Green Chillies",
      farmer: "Anjali Reddy",
      location: "Guntur, Andhra Pradesh",
      price: 80,
      unit: "kg",
      rating: 4.5,
      reviews: 67,
      image: "/placeholder.svg",
      category: "vegetables",
      organic: false,
      inStock: true,
      phone: "+91 9876543215",
    },
  ];

  const filteredProducts = farmProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.farmer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory ||
      (selectedCategory === "organic" && product.organic);
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleContact = (farmer: string, phone: string) => {
    alert(`Calling ${farmer} at ${phone}`);
  };

  const handleAddToCart = (product: FarmProduct) => {
    setPendingProduct(product);
    setShowBuyerModal(true);
    setBuyerNameInput("");
  };

  return (
    <>
      {/* Buyer Name Modal */}
      {showBuyerModal && pendingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowBuyerModal(false)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4 text-green-700">
              Enter Buyer Name
            </h3>
            <Input
              placeholder="Your Name"
              value={buyerNameInput}
              onChange={(e) => setBuyerNameInput(e.target.value)}
              className="mb-4"
            />
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={!buyerNameInput.trim()}
              onClick={() => {
                if (pendingProduct) {
                  handlePurchase(pendingProduct, buyerNameInput.trim());
                }
                setShowBuyerModal(false);
                setPendingProduct(null);
                setBuyerNameInput("");
              }}
            >
              Confirm Purchase
            </Button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {successMessage}
          </div>
        </div>
      )}

      <div className="pb-20 bg-background min-h-screen transition-colors duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Store className="h-5 w-5 text-green-600" />
                  FairFarm Marketplace
                </h1>
                <p className="text-muted-foreground text-sm">
                  Direct from farmers to your table
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Purchase History Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Recent Orders
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPurchaseHistory(!showPurchaseHistory)}
              >
                {showPurchaseHistory ? "Hide" : "Show"} History
              </Button>
            </div>

            {showPurchaseHistory && (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full text-xs">
                  <thead className="bg-muted-foreground/10">
                    <tr>
                      <th className="p-2">Order #</th>
                      <th className="p-2">Product</th>
                      <th className="p-2">Farmer → Buyer</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((order, idx) => (
                      <tr
                        key={order.id}
                        className={
                          idx % 2 === 0
                            ? "bg-background"
                            : "bg-muted-foreground/5"
                        }
                      >
                        <td className="p-2 font-bold text-green-600">
                          #{order.id}
                        </td>
                        <td className="p-2">{order.productName}</td>
                        <td className="p-2">
                          {order.farmer} → {order.buyer}
                        </td>
                        <td className="p-2">₹{order.price}</td>
                        <td className="p-2">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs">{order.timestamp}</td>
                      </tr>
                    ))}
                    {purchaseOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-4 text-center text-muted-foreground"
                        >
                          No orders yet. Start shopping!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Search and Filter */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <div className="text-lg font-semibold text-foreground">
                  150+
                </div>
                <div className="text-xs text-muted-foreground">Farmers</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 text-center">
                <Store className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <div className="text-lg font-semibold text-foreground">
                  500+
                </div>
                <div className="text-xs text-muted-foreground">Products</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                <div className="text-lg font-semibold text-foreground">
                  4.7★
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Available Products ({filteredProducts.length})
              </h2>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original products */}
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Product Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {product.name}
                            </h3>
                            {product.organic && (
                              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Organic
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1 truncate">
                            by {product.farmer}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {product.location}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(product.id)}
                          className="p-1"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites.includes(product.id)
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                      </div>

                      {/* Price and Rating */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">
                            ₹{product.price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            /{product.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {product.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviews})
                          </span>
                        </div>
                      </div>

                      {/* Stock Status */}
                      {!product.inStock && (
                        <Badge
                          variant="secondary"
                          className="text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400"
                        >
                          Out of Stock
                        </Badge>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() =>
                            handleContact(product.farmer, product.phone)
                          }
                          className="flex-1"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          className="flex-1"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                        <Button
                          size="default"
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          //   className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {product.inStock ? "Buy" : "Unavailable"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FairFarm;
