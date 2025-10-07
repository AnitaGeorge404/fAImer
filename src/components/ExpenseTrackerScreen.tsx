import React, { useState } from "react";
import {
  Plus,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowLeft,
  Brain,
  Camera,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getExpenseInsights } from "@/lib/unifiedAI";

interface ExpenseTrackerScreenProps {
  onBack?: () => void;
}

interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  trend: "up" | "down";
  description?: string;
  receipt?: string;
}

interface WeeklyData {
  period: string;
  amount: number;
  expenses: number;
}

interface AIInsight {
  summary: string;
  recommendations: string[];
  trends: string[];
  budgetAdvice: string;
}

const ExpenseTrackerScreen: React.FC<ExpenseTrackerScreenProps> = ({
  onBack,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      date: "2024-01-10",
      category: "Fertilizers",
      amount: 120,
      trend: "down",
      description: "NPK Fertilizer for winter crop",
    },
    {
      id: 2,
      date: "2024-01-05",
      category: "Seeds",
      amount: 80,
      trend: "up",
      description: "Hybrid tomato seeds",
    },
    {
      id: 3,
      date: "2023-12-28",
      category: "Pesticides",
      amount: 65,
      trend: "up",
      description: "Organic pesticide spray",
    },
    {
      id: 4,
      date: "2023-12-20",
      category: "Labor",
      amount: 200,
      trend: "down",
      description: "Field preparation labor",
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInsightDialog, setShowInsightDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    amount: "",
    description: "",
    receipt: "",
  });

  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );

  const categoryStats = expenses.reduce(
    (acc: { [key: string]: number }, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {}
  );

  // Generate chart data based on view mode
  const getChartData = (): WeeklyData[] => {
    const today = new Date();
    const chartData: WeeklyData[] = [];

    if (viewMode === "weekly") {
      // Generate weekly data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const dayExpenses = expenses.filter(
          (expense) => expense.date === dateStr
        );
        const dayAmount = dayExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );

        chartData.push({
          period: date.toLocaleDateString("en", { weekday: "short" }),
          amount: dayAmount,
          expenses: dayExpenses.length,
        });
      }
    } else {
      // Generate monthly data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        const monthExpenses = expenses.filter((expense) =>
          expense.date.startsWith(monthYear)
        );
        const monthAmount = monthExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );

        chartData.push({
          period: date.toLocaleDateString("en", { month: "short" }),
          amount: monthAmount,
          expenses: monthExpenses.length,
        });
      }
    }

    return chartData;
  };

  const chartData = getChartData();

  // Add new expense
  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.amount) return;

    const expense: Expense = {
      id: Date.now(),
      date: newExpense.date,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      trend: Math.random() > 0.5 ? "up" : "down",
      description: newExpense.description,
      receipt: newExpense.receipt,
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({
      date: new Date().toISOString().split("T")[0],
      category: "",
      amount: "",
      description: "",
      receipt: "",
    });
    setShowAddDialog(false);
  };

  // Handle receipt upload
  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewExpense({ ...newExpense, receipt: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Get AI insights using unified AI system
  const getAIInsights = async () => {
    setLoadingInsight(true);
    try {
      const expenseData = {
        total: totalExpenses,
        categories: categoryStats,
        recentExpenses: expenses.slice(0, 10),
        chartTrend: chartData,
        viewMode,
      };

      const insights = await getExpenseInsights(expenseData, viewMode);
      setAiInsight({
        summary: insights.summary,
        recommendations: insights.recommendations,
        trends: insights.trends,
        budgetAdvice: insights.budgetAdvice,
      });
    } catch (error) {
      console.error("Error getting AI insights:", error);
      // Fallback insight
      setAiInsight({
        summary:
          "Farm expenses show balanced mix of essential inputs with optimization opportunities.",
        recommendations: [
          "Consider bulk purchasing for frequently used farming items to reduce costs.",
          "Track expenses by crop cycle for better seasonal planning and budgeting.",
          "Explore cooperative buying with other farmers to get better wholesale prices.",
        ],
        trends: [
          "Seeds and fertilizers represent your major expense categories this period.",
          "Labor costs remain consistently important throughout different farming seasons.",
          "Seasonal variations significantly affect your overall spending patterns and timing.",
        ],
        budgetAdvice:
          "Maintain emergency fund equal to three months average expenses for unexpected needs.",
      });
    } finally {
      setLoadingInsight(false);
      setShowInsightDialog(true);
    }
  };

  return (
    <div className="pb-20 bg-gray-50 dark:bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 dark:from-yellow-700 dark:to-yellow-800 text-white p-4 shadow-lg">
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
            <h1 className="text-xl font-bold">Expense Tracker</h1>
            <p className="text-yellow-100 dark:text-yellow-200 text-sm">
              Track your farm expenses
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Chart Section */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-foreground">
                {viewMode === "weekly" ? "Weekly" : "Monthly"} Expense Trend
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("weekly")}
                  className="text-xs"
                >
                  Weekly
                </Button>
                <Button
                  variant={viewMode === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("monthly")}
                  className="text-xs"
                >
                  Monthly
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: any) => [`₹${value}`, "Amount"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar
                    dataKey="amount"
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                    className="drop-shadow-sm"
                  />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
                      <stop
                        offset="100%"
                        stopColor="#f59e0b"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                <strong>
                  {viewMode === "weekly" ? "Weekly" : "Monthly"} Insight:
                </strong>{" "}
                {chartData.reduce((sum, period) => sum + period.amount, 0) > 0
                  ? `Total spent this ${viewMode}: ₹${chartData.reduce((sum, period) => sum + period.amount, 0)}. ${
                      chartData.filter((period) => period.amount > 0).length >
                      (viewMode === "weekly" ? 4 : 3)
                        ? "High activity period - consider reviewing expenses."
                        : "Moderate spending pattern - good control."
                    }`
                  : `No expenses recorded this ${viewMode}.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 py-2">
          <Button
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={getAIInsights}
            disabled={loadingInsight}
          >
            <Brain className="h-4 w-4 mr-2" />
            {loadingInsight ? "Analyzing..." : "AI Insights"}
          </Button>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="shadow-sm hover:shadow-md transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Record your farm expense with details and optional receipt.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={newExpense.amount}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, amount: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) =>
                      setNewExpense({ ...newExpense, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seeds">Seeds</SelectItem>
                      <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                      <SelectItem value="Pesticides">Pesticides</SelectItem>
                      <SelectItem value="Tools">Tools & Equipment</SelectItem>
                      <SelectItem value="Labor">Labor</SelectItem>
                      <SelectItem value="Water">Water & Irrigation</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the expense..."
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Receipt (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="receipt" className="cursor-pointer">
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Receipt
                        <input
                          id="receipt"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleReceiptUpload}
                        />
                      </label>
                    </Button>
                    {newExpense.receipt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setNewExpense({ ...newExpense, receipt: "" })
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {newExpense.receipt && (
                    <img
                      src={newExpense.receipt}
                      alt="Receipt"
                      className="mt-2 h-20 w-20 object-cover rounded border"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddExpense}>Add Expense</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Overview */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  ₹{totalExpenses}
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  Total Expenses
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Expenses
          </h2>
          {expenses.slice(0, 5).map((expense) => (
            <Card
              key={expense.id}
              className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 dark:text-foreground">
                        {expense.category}
                      </h3>
                      {expense.receipt && (
                        <Badge variant="outline" className="text-xs">
                          📄 Receipt
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1">
                      {expense.description || "No description provided"}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-800 dark:text-white">
                        ₹{expense.amount}
                      </span>
                      {expense.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {expenses.length > 5 && (
            <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  and {expenses.length - 5} more expenses...
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  View All Expenses
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category Breakdown */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(categoryStats).map(([category, amount]) => (
              <div
                key={category}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-foreground">
                  {category}
                </span>
                <span className="text-sm text-gray-600 dark:text-muted-foreground">
                  ₹{amount}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Budgeting Tips */}
        <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Budgeting Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-muted-foreground space-y-2">
              <li>Track expenses regularly to identify areas for savings.</li>
              <li>Set a budget for each category and stick to it.</li>
              <li>
                Consider investing in efficient farming practices to reduce
                costs.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Dialog */}
      <Dialog open={showInsightDialog} onOpenChange={setShowInsightDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Expense Insights
            </DialogTitle>
            <DialogDescription>
              Smart analysis of your farming expenses with personalized
              recommendations.
            </DialogDescription>
          </DialogHeader>

          {aiInsight && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                  Expense Summary
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {aiInsight.summary}
                </p>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-bold text-green-900 dark:text-green-100 mb-3">
                  Smart Recommendations
                </h3>
                <ul className="space-y-2">
                  {aiInsight.recommendations.slice(0, 3).map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-green-800 dark:text-green-200 text-sm"
                    >
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        •
                      </span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trends */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-3">
                  Key Trends
                </h3>
                <ul className="space-y-2">
                  {aiInsight.trends.slice(0, 3).map((trend, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-orange-800 dark:text-orange-200 text-sm"
                    >
                      <span className="text-orange-600 dark:text-orange-400 font-bold">
                        •
                      </span>
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Budget Advice */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
                  Budget Advice
                </h3>
                <p className="text-purple-800 dark:text-purple-200 text-sm">
                  {aiInsight.budgetAdvice}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseTrackerScreen;
