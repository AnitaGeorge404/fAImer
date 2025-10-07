
import React from 'react';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AgricultureNewsScreenProps {
  onBack?: () => void;
}

const AgricultureNewsScreen: React.FC<AgricultureNewsScreenProps> = ({ onBack }) => {
  const newsArticles = [
    {
      id: 1,
      title: "New Drought-Resistant Rice Variety Shows 30% Higher Yield",
      summary: "Scientists develop innovative rice strain that requires 40% less water while maintaining nutritional value.",
      date: "2024-01-15",
      category: "Innovation",
      readTime: "3 min read"
    },
    {
      id: 2,
      title: "Government Announces ₹50,000 Crore Agriculture Infrastructure Fund",
      summary: "New fund aims to modernize farming equipment and improve post-harvest infrastructure across rural India.",
      date: "2024-01-12",
      category: "Policy",
      readTime: "5 min read"
    },
    {
      id: 3,
      title: "Organic Farming Market Expected to Double by 2025",
      summary: "Growing consumer demand drives expansion in organic produce, creating new opportunities for farmers.",
      date: "2024-01-10",
      category: "Market",
      readTime: "4 min read"
    },
    {
      id: 4,
      title: "AI-Powered Pest Detection App Reduces Crop Loss by 25%",
      summary: "New mobile application uses machine learning to identify crop diseases early, helping farmers take preventive action.",
      date: "2024-01-08",
      category: "Technology",
      readTime: "3 min read"
    },
    {
      id: 5,
      title: "Minimum Support Price Increased for Wheat and Rice",
      summary: "Government raises MSP by 8% for major crops, providing better income security for farmers.",
      date: "2024-01-05",
      category: "Policy",
      readTime: "2 min read"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Innovation': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'Policy': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
      case 'Market': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'Technology': return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 text-white p-4 shadow-lg">
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
            <h1 className="text-xl font-bold">Agriculture News</h1>
            <p className="text-teal-100 dark:text-teal-200 text-sm">Stay updated with latest farming news</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {newsArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg leading-tight dark:text-white">{article.title}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(article.category)}`}>
                  {article.category}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{article.summary}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                  <span>{article.readTime}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                  <span>Read More</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgricultureNewsScreen;
