import React from 'react';
import { ArrowLeft, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpdatesScreenProps {
  onBack?: () => void;
}

const UpdatesScreen: React.FC<UpdatesScreenProps> = ({ onBack }) => {
  const updates = [
    {
      id: 1,
      title: "New Weather Alert System",
      description: "Get real-time notifications for severe weather conditions in your area",
      date: "2 hours ago",
      type: "feature",
      isNew: true
    },
    {
      id: 2,
      title: "Market Price Update",
      description: "Latest commodity prices for rice, wheat, and vegetables updated",
      date: "5 hours ago",
      type: "market",
      isNew: true
    },
    {
      id: 3,
      title: "Pest Control Guide Updated",
      description: "New organic pest control methods added to the knowledge center",
      date: "1 day ago",
      type: "content",
      isNew: false
    },
    {
      id: 4,
      title: "Government Scheme Alert",
      description: "New subsidy scheme for solar irrigation systems now available",
      date: "2 days ago",
      type: "scheme",
      isNew: false
    },
    {
      id: 5,
      title: "App Performance Improvements",
      description: "Faster loading times and improved offline functionality",
      date: "3 days ago",
      type: "technical",
      isNew: false
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'market': return 'bg-green-100 text-green-800';
      case 'content': return 'bg-purple-100 text-purple-800';
      case 'scheme': return 'bg-orange-100 text-orange-800';
      case 'technical': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature': return 'New Feature';
      case 'market': return 'Market Update';
      case 'content': return 'Content Update';
      case 'scheme': return 'Government Scheme';
      case 'technical': return 'Technical';
      default: return 'Update';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">
              Updates
            </h1>
          </div>
        </div>
      </div>

      {/* Updates List */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {updates.map((update) => (
          <Card key={update.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className={getTypeColor(update.type)}>
                      {getTypeLabel(update.type)}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{update.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-3">
                {update.description}
              </CardDescription>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {update.date}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UpdatesScreen;