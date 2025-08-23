
import React, { useState } from 'react';
import { Clock, Calendar, Droplet, Bug, Sprout, ArrowLeft, TrendingUp, DollarSign, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HistoryScreenProps {
  onBack?: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const historyData = [
    {
      id: 1,
      date: '2024-03-15',
      type: 'yield',
      crop: 'Tomato',
      details: '450 kg harvested',
      amount: '₹58,500',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 2,
      date: '2024-03-10',
      type: 'disease',
      crop: 'Chilli',
      details: 'Leaf curl detected and treated',
      amount: '₹2,500',
      icon: Bug,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      id: 3,
      date: '2024-03-05',
      type: 'irrigation',
      crop: 'Onion',
      details: 'Drip irrigation activated',
      amount: '-',
      icon: Droplet,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 4,
      date: '2024-02-28',
      type: 'yield',
      crop: 'Onion',
      details: '300 kg harvested',
      amount: '₹21,000',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 5,
      date: '2024-02-20',
      type: 'expense',
      crop: 'Tomato',
      details: 'Fertilizer purchase',
      amount: '₹3,200',
      icon: DollarSign,
      color: 'text-orange-600 dark:text-orange-400'
    },
  ];

  const filters = [
    { id: 'all', label: 'All Records' },
    { id: 'yield', label: 'Yields' },
    { id: 'disease', label: 'Diseases' },
    { id: 'expense', label: 'Expenses' },
  ];

  const filteredData = selectedFilter === 'all' 
    ? historyData 
    : historyData.filter(item => item.type === selectedFilter);

  const getTypeLabel = (type: string) => {
    const labels = {
      yield: 'Harvest',
      disease: 'Disease',
      irrigation: 'Irrigation',
      expense: 'Expense'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      yield: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
      disease: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
      irrigation: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      expense: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="pb-20 bg-gray-50 dark:bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-4 shadow-lg">
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
            <h1 className="text-xl font-bold">Farm History</h1>
            <p className="text-blue-100 dark:text-blue-200 text-sm">Track your farming activities</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter.id)}
                className={selectedFilter === filter.id ? 
                  "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700" : 
                  "dark:border-border dark:hover:bg-accent dark:hover:text-accent-foreground"
                }
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Export Button */}
          <Button variant="outline" className="w-full mb-4 dark:border-border dark:hover:bg-accent dark:hover:text-accent-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export Records (PDF/Excel)
          </Button>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredData.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className="hover:shadow-md dark:hover:shadow-xl transition-all duration-300 dark:bg-card dark:border-border shadow-sm dark:shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full bg-gray-100 dark:bg-accent ${item.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getTypeBadgeColor(item.type)}>
                            {getTypeLabel(item.type)}
                          </Badge>
                          <span className="text-sm font-medium text-gray-800 dark:text-foreground">{item.crop}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1">{item.details}</p>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground">{new Date(item.date).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    {item.amount && item.amount !== '-' && (
                      <div className="text-right">
                        <span className={`font-semibold ${item.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {item.amount}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredData.length === 0 && (
          <Card className="dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 dark:text-muted-foreground">No records found for the selected filter.</p>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <Card className="mt-6 dark:bg-card dark:border-border shadow-sm dark:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹79,500</p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Total Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹5,700</p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Total Expenses</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹73,800</p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Net Profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoryScreen;
