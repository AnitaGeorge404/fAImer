
import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, Reply, Plus, Search, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FarmerForumScreenProps {
  onBack?: () => void;
}

const FarmerForumScreen: React.FC<FarmerForumScreenProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const forumPosts = [
    {
      id: 1,
      author: 'Rajesh Kumar',
      title: 'Best fertilizer for tomato plants?',
      content: 'I am growing tomatoes for the first time. Which fertilizer should I use for better yield?',
      category: 'crops',
      replies: 12,
      likes: 8,
      timeAgo: '2 hours ago',
      isAnswered: true
    },
    {
      id: 2,
      author: 'Priya Sharma',
      title: 'Dealing with aphids on chilli plants',
      content: 'My chilli plants are infested with aphids. Looking for organic solutions.',
      category: 'diseases',
      replies: 6,
      likes: 15,
      timeAgo: '4 hours ago',
      isAnswered: false
    },
    {
      id: 3,
      author: 'Mohan Singh',
      title: 'Current market rates in Delhi',
      content: 'Can anyone share the latest mandi rates for wheat and rice in Delhi?',
      category: 'market',
      replies: 3,
      likes: 5,
      timeAgo: '1 day ago',
      isAnswered: true
    },
    {
      id: 4,
      author: 'Sunita Devi',
      title: 'Drip irrigation setup cost',
      content: 'Planning to install drip irrigation for 2 acres. What should be the expected cost?',
      category: 'technology',
      replies: 18,
      likes: 22,
      timeAgo: '2 days ago',
      isAnswered: true
    },
    {
      id: 5,
      author: 'Ramesh Patel',
      title: 'Weather affecting cotton crop',
      content: 'Unexpected rain has damaged my cotton field. What steps should I take now?',
      category: 'weather',
      replies: 9,
      likes: 11,
      timeAgo: '3 days ago',
      isAnswered: false
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', count: 48 },
    { id: 'crops', label: 'Crops & Seeds', count: 15 },
    { id: 'diseases', label: 'Diseases & Pests', count: 12 },
    { id: 'market', label: 'Market Prices', count: 8 },
    { id: 'technology', label: 'Farm Tech', count: 7 },
    { id: 'weather', label: 'Weather & Climate', count: 6 }
  ];

  const expertAnswers = [
    {
      expert: 'Dr. Agricultural Expert',
      title: 'Organic pest control methods',
      preview: 'Neem oil and soap solution work effectively...',
      likes: 45
    },
    {
      expert: 'Farm Technology Specialist',
      title: 'Modern irrigation techniques',
      preview: 'Drip irrigation can save up to 40% water...',
      likes: 32
    }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? forumPosts 
    : forumPosts.filter(post => post.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors = {
      crops: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      diseases: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      market: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      weather: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="pb-20 bg-gray-50 dark:bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 text-white p-4 shadow-lg">
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
              <h1 className="text-xl font-bold">Farmer Forum</h1>
              <p className="text-orange-100 dark:text-orange-200 text-sm">Connect with fellow farmers</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 dark:hover:bg-white/10">
            <Plus className="h-4 w-4 mr-1" />
            New Post
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search and Post Button */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search discussions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700">
            Ask Question
          </Button>
        </div>

        {/* Categories */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base dark:text-white">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${selectedCategory === category.id ? "bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700" : "dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"} text-xs`}
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expert Answers Section */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">Expert Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expertAnswers.map((answer, index) => (
                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{answer.expert}</span>
                    <div className="flex items-center text-blue-600 dark:text-blue-400">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span className="text-xs">{answer.likes}</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-sm mb-1 dark:text-white">{answer.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{answer.preview}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forum Posts */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Discussions</h2>
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md dark:hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                    {post.isAnswered && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Answered
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{post.timeAgo}</span>
                </div>
                
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{post.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{post.content}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">By {post.author}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span className="text-xs">{post.likes}</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">{post.replies}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Community Stats */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">Community Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">2,450</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active Farmers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">1,238</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Questions Answered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">156</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Expert Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerForumScreen;
