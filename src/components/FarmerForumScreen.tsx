import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Plus,
  Search,
  ArrowLeft,
  AlertTriangle,
  Bell,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Post, Alert, Comment, Vote } from "@/lib/supabase";

interface FarmerForumScreenProps {
  onBack?: () => void;
}

const FarmerForumScreen: React.FC<FarmerForumScreenProps> = ({ onBack }) => {
  const { firebaseUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeSection, setActiveSection] = useState<"alerts" | "discussions">(
    "alerts"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [isAlertDetailOpen, setIsAlertDetailOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "crops",
  });
  const [newAlert, setNewAlert] = useState({
    title: "",
    description: "",
    alertType: "warning",
    location: "",
    urgency: "medium",
  });

  // State for dynamic data
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);

  // Dummy alerts to keep initially (mixed with real data)
  const dummyAlerts: Alert[] = [
    {
      id: "dummy-1",
      user_id: "system",
      author_name: "Agricultural Department",
      title: "Pest Attack Warning - Aphids",
      description:
        "High aphid activity reported in tomato fields. Immediate action recommended.",
      alert_type: "danger",
      location: "Punjab Region",
      urgency: "high",
      likes: 15,
      dislikes: 2,
      response_count: 5,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "dummy-2",
      user_id: "system",
      author_name: "Weather Service",
      title: "Weather Alert - Heavy Rain Expected",
      description:
        "Monsoon intensity expected to increase. Protect crops from waterlogging.",
      alert_type: "warning",
      location: "Maharashtra",
      urgency: "high",
      likes: 23,
      dislikes: 1,
      response_count: 12,
      created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
      updated_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: "dummy-3",
      user_id: "system",
      author_name: "Market Analysis Team",
      title: "Market Price Drop - Wheat",
      description:
        "Wheat prices have dropped by 15%. Consider storage options.",
      alert_type: "info",
      location: "National",
      urgency: "medium",
      likes: 8,
      dislikes: 3,
      response_count: 8,
      created_at: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
      updated_at: new Date(Date.now() - 21600000).toISOString(),
    },
  ];

  // Load data from Supabase
  useEffect(() => {
    loadPosts();
    loadAlerts();
    if (firebaseUser?.uid) {
      loadUserVotes();
    }
  }, [firebaseUser]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading posts:", error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading alerts:", error);
        // Use dummy data if Supabase fails
        setAlerts(dummyAlerts);
        return;
      }

      // Combine real alerts with dummy alerts
      setAlerts([...(data || []), ...dummyAlerts]);
    } catch (error) {
      console.error("Error loading alerts:", error);
      // Fallback to dummy data
      setAlerts(dummyAlerts);
    }
  };

  const loadUserVotes = async () => {
    if (!firebaseUser?.uid) return;

    try {
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", firebaseUser.uid);

      if (error) {
        console.error("Error loading user votes:", error);
        return;
      }

      setUserVotes(data || []);
    } catch (error) {
      console.error("Error loading user votes:", error);
    }
  };

  const loadComments = async (postId?: string, alertId?: string) => {
    try {
      let query = supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: true });

      if (postId) {
        query = query.eq("post_id", postId);
      } else if (alertId) {
        query = query.eq("alert_id", alertId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading comments:", error);
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const categories = [
    { id: "all", label: "All Topics", count: posts.length },
    {
      id: "crops",
      label: "Crops & Seeds",
      count: posts.filter((p) => p.category === "crops").length,
    },
    {
      id: "diseases",
      label: "Diseases & Pests",
      count: posts.filter((p) => p.category === "diseases").length,
    },
    {
      id: "market",
      label: "Market Prices",
      count: posts.filter((p) => p.category === "market").length,
    },
    {
      id: "technology",
      label: "Farm Tech",
      count: posts.filter((p) => p.category === "technology").length,
    },
    {
      id: "weather",
      label: "Weather & Climate",
      count: posts.filter((p) => p.category === "weather").length,
    },
  ];

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  const handleCreatePost = async () => {
    if (!firebaseUser?.uid || !newPost.title.trim() || !newPost.content.trim())
      return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            user_id: firebaseUser.uid,
            author_name: firebaseUser.displayName || "Anonymous Farmer",
            title: newPost.title,
            content: newPost.content,
            category: newPost.category,
          },
        ])
        .select();

      if (error) {
        console.error("Error creating post:", error);
        return;
      }

      // Add to local state
      if (data && data[0]) {
        setPosts([data[0], ...posts]);
      }

      setNewPost({ title: "", content: "", category: "crops" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (
      !firebaseUser?.uid ||
      !newAlert.title.trim() ||
      !newAlert.description.trim() ||
      !newAlert.location.trim()
    )
      return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("alerts")
        .insert([
          {
            user_id: firebaseUser.uid,
            author_name: firebaseUser.displayName || "Anonymous Farmer",
            title: newAlert.title,
            description: newAlert.description,
            alert_type: newAlert.alertType,
            location: newAlert.location,
            urgency: newAlert.urgency,
          },
        ])
        .select();

      if (error) {
        console.error("Error creating alert:", error);
        return;
      }

      // Add to local state
      if (data && data[0]) {
        setAlerts([data[0], ...alerts]);
      }

      setNewAlert({
        title: "",
        description: "",
        alertType: "warning",
        location: "",
        urgency: "medium",
      });
      setIsAlertDialogOpen(false);
    } catch (error) {
      console.error("Error creating alert:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (
    targetId: string,
    targetType: "post" | "alert" | "comment",
    voteType: "upvote" | "downvote"
  ) => {
    if (!firebaseUser?.uid) return;

    try {
      // Check if user already voted
      const existingVote = userVotes.find(
        (vote) =>
          (targetType === "post" && vote.post_id === targetId) ||
          (targetType === "alert" && vote.alert_id === targetId) ||
          (targetType === "comment" && vote.comment_id === targetId)
      );

      if (existingVote) {
        // Update existing vote or remove if same type
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase.from("votes").delete().eq("id", existingVote.id);
          setUserVotes(userVotes.filter((v) => v.id !== existingVote.id));
        } else {
          // Update vote type
          await supabase
            .from("votes")
            .update({ vote_type: voteType })
            .eq("id", existingVote.id);
          setUserVotes(
            userVotes.map((v) =>
              v.id === existingVote.id ? { ...v, vote_type: voteType } : v
            )
          );
        }
      } else {
        // Create new vote
        const voteData: any = {
          user_id: firebaseUser.uid,
          vote_type: voteType,
        };

        if (targetType === "post") voteData.post_id = targetId;
        else if (targetType === "alert") voteData.alert_id = targetId;
        else if (targetType === "comment") voteData.comment_id = targetId;

        const { data, error } = await supabase
          .from("votes")
          .insert([voteData])
          .select();

        if (error) {
          console.error("Error creating vote:", error);
          return;
        }

        if (data && data[0]) {
          setUserVotes([...userVotes, data[0]]);
        }
      }

      // Update counts locally (in a real app, you might use triggers or functions)
      updateVoteCounts(targetId, targetType);
    } catch (error) {
      console.error("Error handling vote:", error);
    }
  };

  const updateVoteCounts = async (
    targetId: string,
    targetType: "post" | "alert" | "comment"
  ) => {
    try {
      const { data: votes } = await supabase
        .from("votes")
        .select("vote_type")
        .eq(
          targetType === "post"
            ? "post_id"
            : targetType === "alert"
              ? "alert_id"
              : "comment_id",
          targetId
        );

      const upvotes =
        votes?.filter((v) => v.vote_type === "upvote").length || 0;
      const downvotes =
        votes?.filter((v) => v.vote_type === "downvote").length || 0;

      if (targetType === "post") {
        await supabase
          .from("posts")
          .update({ likes: upvotes, dislikes: downvotes })
          .eq("id", targetId);
        setPosts(
          posts.map((p) =>
            p.id === targetId
              ? { ...p, likes: upvotes, dislikes: downvotes }
              : p
          )
        );
      } else if (targetType === "alert") {
        await supabase
          .from("alerts")
          .update({ likes: upvotes, dislikes: downvotes })
          .eq("id", targetId);
        setAlerts(
          alerts.map((a) =>
            a.id === targetId
              ? { ...a, likes: upvotes, dislikes: downvotes }
              : a
          )
        );
      }
    } catch (error) {
      console.error("Error updating vote counts:", error);
    }
  };

  const handleAddComment = async () => {
    if (!firebaseUser?.uid || !newComment.trim()) return;

    setLoading(true);
    try {
      const commentData: any = {
        user_id: firebaseUser.uid,
        author_name: firebaseUser.displayName || "Anonymous Farmer",
        content: newComment,
      };

      if (selectedPost) {
        commentData.post_id = selectedPost.id;
      } else if (selectedAlert) {
        commentData.alert_id = selectedAlert.id;
      }

      const { data, error } = await supabase
        .from("comments")
        .insert([commentData])
        .select();

      if (error) {
        console.error("Error adding comment:", error);
        return;
      }

      if (data && data[0]) {
        setComments([...comments, data[0]]);
      }

      setNewComment("");

      // Refresh posts/alerts to update reply counts
      if (selectedPost) {
        loadPosts();
      } else if (selectedAlert) {
        loadAlerts();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPostDetail = async (post: Post) => {
    setSelectedPost(post);
    setSelectedAlert(null);
    setIsPostDetailOpen(true);
    await loadComments(post.id);
  };

  const openAlertDetail = async (alert: Alert) => {
    setSelectedAlert(alert);
    setSelectedPost(null);
    setIsAlertDetailOpen(true);
    await loadComments(undefined, alert.id);
  };

  const getUserVote = (
    targetId: string,
    targetType: "post" | "alert" | "comment"
  ): "upvote" | "downvote" | null => {
    const vote = userVotes.find(
      (v) =>
        (targetType === "post" && v.post_id === targetId) ||
        (targetType === "alert" && v.alert_id === targetId) ||
        (targetType === "comment" && v.comment_id === targetId)
    );
    return vote ? vote.vote_type : null;
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getAlertColor = (alertType: string) => {
    const colors = {
      danger:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
      warning:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700",
      info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700",
    };
    return (
      colors[alertType as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
    );
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500",
    };
    return colors[urgency as keyof typeof colors] || "bg-gray-500";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      crops:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      diseases: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      market: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      technology:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      weather: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
    };
    return (
      colors[category as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  return (
    <div className="pb-20 bg-gray-50 dark:bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 text-white p-4 shadow-lg">
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
            <p className="text-orange-100 dark:text-orange-200 text-sm">
              Connect with fellow farmers
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Section */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Search discussions and alerts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Categories Dropdown */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base dark:text-white">
              Filter by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="dark:text-white dark:focus:bg-gray-600"
                  >
                    {category.label} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Toggle Section for Alerts and Discussions */}
        <div className="space-y-3">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 max-w-sm">
            <Button
              variant={activeSection === "alerts" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("alerts")}
              className={`flex-1 ${
                activeSection === "alerts"
                  ? "bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                  : "dark:text-white dark:hover:bg-gray-700"
              }`}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alerts ({alerts.length})
            </Button>
            <Button
              variant={activeSection === "discussions" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("discussions")}
              className={`flex-1 ${
                activeSection === "discussions"
                  ? "bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                  : "dark:text-white dark:hover:bg-gray-700"
              }`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Discussions ({filteredPosts.length})
            </Button>
          </div>

          {/* Conditional Content Rendering */}
          {activeSection === "alerts" ? (
            /* Active Alerts Section */
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                Active Alerts
              </h2>
              {alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`hover:shadow-md dark:hover:shadow-xl transition-shadow border-l-4 ${getAlertColor(alert.alert_type)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getUrgencyColor(alert.urgency)}`}
                        ></div>
                        <Badge
                          variant="outline"
                          className="text-xs dark:border-gray-600 dark:text-gray-300"
                        >
                          {alert.alert_type.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs dark:border-gray-600 dark:text-gray-300"
                        >
                          {alert.location}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(alert.created_at)}
                      </span>
                    </div>

                    <h3
                      className="font-semibold text-gray-800 dark:text-white mb-2 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400"
                      onClick={() => openAlertDetail(alert)}
                    >
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {alert.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        By {alert.author_name}
                      </span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleVote(alert.id, "alert", "upvote")
                            }
                            className={`p-1 h-8 w-8 ${getUserVote(alert.id, "alert") === "upvote" ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {alert.likes}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleVote(alert.id, "alert", "downvote")
                            }
                            className={`p-1 h-8 w-8 ${getUserVote(alert.id, "alert") === "downvote" ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {alert.dislikes}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">
                            {alert.response_count}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Respond
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Recent Discussions Section */
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                Recent Discussions
              </h2>
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-md dark:hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border-gray-700"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(post.category)}>
                          {post.category}
                        </Badge>
                        {post.is_answered && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Answered
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(post.created_at)}
                      </span>
                    </div>

                    <h3
                      className="font-semibold text-gray-800 dark:text-white mb-2 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400"
                      onClick={() => openPostDetail(post)}
                    >
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        By {post.author_name}
                      </span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleVote(post.id, "post", "upvote")
                            }
                            className={`p-1 h-8 w-8 ${getUserVote(post.id, "post") === "upvote" ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {post.likes}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleVote(post.id, "post", "downvote")
                            }
                            className={`p-1 h-8 w-8 ${getUserVote(post.id, "post") === "downvote" ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {post.dislikes}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">{post.reply_count}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Popover open={isFabOpen} onOpenChange={setIsFabOpen}>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="w-48 p-2 dark:bg-gray-800 dark:border-gray-700 mb-2"
          >
            <div className="space-y-2">
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (open) setIsFabOpen(false);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start dark:text-white dark:hover:bg-gray-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-3" />
                    New Post
                  </Button>
                </DialogTrigger>
              </Dialog>

              <Dialog
                open={isAlertDialogOpen}
                onOpenChange={(open) => {
                  setIsAlertDialogOpen(open);
                  if (open) setIsFabOpen(false);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start dark:text-white dark:hover:bg-gray-700"
                  >
                    <Bell className="h-4 w-4 mr-3" />
                    New Alert
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* New Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Create New Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category" className="dark:text-white">
                Category
              </Label>
              <Select
                value={newPost.category}
                onValueChange={(value) =>
                  setNewPost({ ...newPost, category: value })
                }
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem
                    value="crops"
                    className="dark:text-white dark:focus:bg-gray-600"
                  >
                    Crops & Seeds
                  </SelectItem>
                  <SelectItem
                    value="diseases"
                    className="dark:text-white dark:focus:bg-gray-600"
                  >
                    Diseases & Pests
                  </SelectItem>
                  <SelectItem
                    value="market"
                    className="dark:text-white dark:focus:bg-gray-600"
                  >
                    Market Prices
                  </SelectItem>
                  <SelectItem
                    value="technology"
                    className="dark:text-white dark:focus:bg-gray-600"
                  >
                    Farm Tech
                  </SelectItem>
                  <SelectItem
                    value="weather"
                    className="dark:text-white dark:focus:bg-gray-600"
                  >
                    Weather & Climate
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title" className="dark:text-white">
                Title
              </Label>
              <Input
                id="title"
                placeholder="What's your question or topic?"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="content" className="dark:text-white">
                Content
              </Label>
              <Textarea
                id="content"
                placeholder="Describe your question or share your knowledge..."
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                rows={4}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={
                  !newPost.title.trim() || !newPost.content.trim() || loading
                }
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                {loading ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Alert Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white flex items-center">
              <Bell className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
              Create New Alert
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alertType" className="dark:text-white">
                  Alert Type
                </Label>
                <Select
                  value={newAlert.alertType}
                  onValueChange={(value) =>
                    setNewAlert({ ...newAlert, alertType: value })
                  }
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem
                      value="danger"
                      className="dark:text-white dark:focus:bg-gray-600"
                    >
                      🔴 Danger
                    </SelectItem>
                    <SelectItem
                      value="warning"
                      className="dark:text-white dark:focus:bg-gray-600"
                    >
                      🟡 Warning
                    </SelectItem>
                    <SelectItem
                      value="info"
                      className="dark:text-white dark:focus:bg-gray-600"
                    >
                      🔵 Info
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="urgency" className="dark:text-white">
                  Urgency
                </Label>
                <Select
                  value={newAlert.urgency}
                  onValueChange={(value) =>
                    setNewAlert({ ...newAlert, urgency: value })
                  }
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem
                      value="high"
                      className="dark:text-white dark:focus:bg-gray-600"
                    >
                      High
                    </SelectItem>
                    <SelectItem
                      value="medium"
                      className="dark:text-white dark:focus:bg-gray-600"
                    >
                      Medium
                    </SelectItem>
                    <SelectItem
                      value="low"
                      className="dark:text-white dark:focus:bg-gray-600"
                    >
                      Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="alertTitle" className="dark:text-white">
                Alert Title
              </Label>
              <Input
                id="alertTitle"
                placeholder="What's the alert about?"
                value={newAlert.title}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, title: e.target.value })
                }
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="location" className="dark:text-white">
                Location/Region
              </Label>
              <Input
                id="location"
                placeholder="e.g., Punjab, Maharashtra, National"
                value={newAlert.location}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, location: e.target.value })
                }
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="alertDescription" className="dark:text-white">
                Description
              </Label>
              <Textarea
                id="alertDescription"
                placeholder="Describe the alert details and recommended actions..."
                value={newAlert.description}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, description: e.target.value })
                }
                rows={4}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAlertDialogOpen(false)}
                className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAlert}
                disabled={
                  !newAlert.title.trim() ||
                  !newAlert.description.trim() ||
                  !newAlert.location.trim() ||
                  loading
                }
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                {loading ? "Creating..." : "Create Alert"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Detail Dialog */}
      <Dialog open={isPostDetailOpen} onOpenChange={setIsPostDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="dark:text-white text-left">
                      {selectedPost.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        className={getCategoryColor(selectedPost.category)}
                      >
                        {selectedPost.category}
                      </Badge>
                      {selectedPost.is_answered && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Answered
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        By {selectedPost.author_name} •{" "}
                        {formatTimeAgo(selectedPost.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleVote(selectedPost.id, "post", "upvote")
                      }
                      className={`p-2 ${getUserVote(selectedPost.id, "post") === "upvote" ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="ml-1">{selectedPost.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleVote(selectedPost.id, "post", "downvote")
                      }
                      className={`p-2 ${getUserVote(selectedPost.id, "post") === "downvote" ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="ml-1">{selectedPost.dislikes}</span>
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedPost.content}
                </p>

                <div className="border-t pt-4 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                    Comments ({comments.length})
                  </h4>

                  {/* Add Comment */}
                  {firebaseUser && (
                    <div className="flex space-x-2 mb-4">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddComment()
                        }
                        className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || loading}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              {comment.author_name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(comment.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleVote(comment.id, "comment", "upvote")
                              }
                              className={`p-1 h-6 w-6 ${getUserVote(comment.id, "comment") === "upvote" ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.likes}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleVote(comment.id, "comment", "downvote")
                              }
                              className={`p-1 h-6 w-6 ${getUserVote(comment.id, "comment") === "downvote" ? "text-red-600 dark:text-red-400" : "text-gray-400"}`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.dislikes}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Detail Dialog */}
      <Dialog open={isAlertDetailOpen} onOpenChange={setIsAlertDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="dark:text-white text-left flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                      {selectedAlert.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getUrgencyColor(selectedAlert.urgency)}`}
                      ></div>
                      <Badge
                        variant="outline"
                        className="text-xs dark:border-gray-600 dark:text-gray-300"
                      >
                        {selectedAlert.alert_type.toUpperCase()}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs dark:border-gray-600 dark:text-gray-300"
                      >
                        {selectedAlert.location}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        By {selectedAlert.author_name} •{" "}
                        {formatTimeAgo(selectedAlert.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleVote(selectedAlert.id, "alert", "upvote")
                      }
                      className={`p-2 ${getUserVote(selectedAlert.id, "alert") === "upvote" ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="ml-1">{selectedAlert.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleVote(selectedAlert.id, "alert", "downvote")
                      }
                      className={`p-2 ${getUserVote(selectedAlert.id, "alert") === "downvote" ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="ml-1">{selectedAlert.dislikes}</span>
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedAlert.description}
                </p>

                <div className="border-t pt-4 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                    Responses ({comments.length})
                  </h4>

                  {/* Add Response */}
                  {firebaseUser && (
                    <div className="flex space-x-2 mb-4">
                      <Input
                        placeholder="Add a response..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddComment()
                        }
                        className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || loading}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Responses List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              {comment.author_name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(comment.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleVote(comment.id, "comment", "upvote")
                              }
                              className={`p-1 h-6 w-6 ${getUserVote(comment.id, "comment") === "upvote" ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.likes}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleVote(comment.id, "comment", "downvote")
                              }
                              className={`p-1 h-6 w-6 ${getUserVote(comment.id, "comment") === "downvote" ? "text-red-600 dark:text-red-400" : "text-gray-400"}`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.dislikes}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerForumScreen;
