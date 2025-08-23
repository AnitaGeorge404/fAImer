import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Filter,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface LabourerHubProps {
  onBack?: () => void;
}

interface Labourer {
  id: string;
  name: string;
  skills: string[];
  rating: number;
  totalJobs: number;
  hourlyRate: number;
  location: string;
  distance: string;
  avatar: string;
  isAvailable: boolean;
  specialties: string[];
  experience: string;
  languages: string[];
}

const LabourerHub: React.FC<LabourerHubProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Mock data for laborers
  const labourers: Labourer[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      skills: ["Planting", "Harvesting", "Irrigation"],
      rating: 4.8,
      totalJobs: 156,
      hourlyRate: 250,
      location: "Kochi, Kerala",
      distance: "2.5 km",
      avatar: "/lovable-uploads/852b0cb2-1c40-4d2d-9582-b65109704e1a.png",
      isAvailable: true,
      specialties: ["Rice cultivation", "Coconut farming"],
      experience: "8 years",
      languages: ["Malayalam", "Tamil", "Hindi"],
    },
    {
      id: "2",
      name: "Priya Nair",
      skills: ["Pest Control", "Organic Farming", "Soil Testing"],
      rating: 4.9,
      totalJobs: 89,
      hourlyRate: 300,
      location: "Thrissur, Kerala",
      distance: "4.2 km",
      avatar: "/lovable-uploads/b68830df-4731-4efe-b233-08588e1334b3.png",
      isAvailable: true,
      specialties: ["Organic pesticides", "Soil analysis"],
      experience: "6 years",
      languages: ["Malayalam", "English"],
    },
    {
      id: "3",
      name: "Muthu Selvam",
      skills: ["Machinery Operation", "Land Preparation", "Harvesting"],
      rating: 4.7,
      totalJobs: 203,
      hourlyRate: 350,
      location: "Palakkad, Kerala",
      distance: "6.8 km",
      avatar: "/lovable-uploads/2836c528-e19c-4aaf-af8c-3a59c6bdbfde.png",
      isAvailable: false,
      specialties: ["Tractor operation", "Land leveling"],
      experience: "12 years",
      languages: ["Tamil", "Malayalam", "English"],
    },
    {
      id: "4",
      name: "Lakshmi Devi",
      skills: ["Weeding", "Transplanting", "Post-harvest"],
      rating: 4.6,
      totalJobs: 134,
      hourlyRate: 220,
      location: "Alappuzha, Kerala",
      distance: "8.1 km",
      avatar: "/lovable-uploads/f0dce081-a1df-47f4-9b51-31b86f69b3e4.png",
      isAvailable: true,
      specialties: ["Paddy transplanting", "Vegetable farming"],
      experience: "10 years",
      languages: ["Malayalam", "Hindi"],
    },
    {
      id: "5",
      name: "Arjun Menon",
      skills: ["Irrigation Systems", "Drip Installation", "Maintenance"],
      rating: 4.9,
      totalJobs: 98,
      hourlyRate: 400,
      location: "Ernakulam, Kerala",
      distance: "1.2 km",
      avatar: "/lovable-uploads/60f927d7-a6b0-4944-bf34-9a7a5394d552.png",
      isAvailable: true,
      specialties: ["Modern irrigation", "Water management"],
      experience: "7 years",
      languages: ["Malayalam", "English", "Hindi"],
    },
    {
      id: "6",
      name: "Kamala Suresh",
      skills: ["Pruning", "Grafting", "Garden Maintenance"],
      rating: 4.8,
      totalJobs: 167,
      hourlyRate: 280,
      location: "Kannur, Kerala",
      distance: "12.3 km",
      avatar: "/lovable-uploads/7d161fd3-22d0-4b69-a7ef-8b8dd812a55b.png",
      isAvailable: true,
      specialties: ["Fruit tree care", "Spice cultivation"],
      experience: "9 years",
      languages: ["Malayalam", "Kannada"],
    },
  ];

  const skillCategories = [
    "All",
    "Planting",
    "Harvesting",
    "Irrigation",
    "Pest Control",
    "Machinery Operation",
    "Organic Farming",
    "Soil Testing",
    "Weeding",
  ];

  const filteredLabourers = labourers.filter((labourer) => {
    const matchesSearch =
      labourer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labourer.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      labourer.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkill =
      !selectedSkill ||
      selectedSkill === "All" ||
      labourer.skills.includes(selectedSkill);

    return matchesSearch && matchesSkill;
  });

  const handleContactLabourer = (labourer: Labourer) => {
    // Mock contact functionality
    alert(
      `Contacting ${labourer.name}. In a real app, this would open a chat or call interface.`
    );
  };

  return (
    <div className="pb-20 bg-background min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              Labourer Hub
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, skills, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Skill Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {skillCategories.map((skill) => (
              <Badge
                key={skill}
                variant={selectedSkill === skill ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedSkill(skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-primary/10">
            <CardContent className="p-3 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-1" />
              <div className="text-lg font-semibold text-foreground">
                {labourers.length}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </CardContent>
          </Card>
          <Card className="bg-green-100 dark:bg-green-950">
            <CardContent className="p-3 text-center">
              <Star className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-semibold text-foreground">4.8</div>
              <div className="text-xs text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-100 dark:bg-blue-950">
            <CardContent className="p-3 text-center">
              <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-semibold text-foreground">5.2</div>
              <div className="text-xs text-muted-foreground">Avg Distance</div>
            </CardContent>
          </Card>
        </div>

        {/* Labourer List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {filteredLabourers.length} Labourers Found
          </h2>

          {filteredLabourers.map((labourer) => (
            <Card key={labourer.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="relative">
                    <img
                      src={labourer.avatar}
                      alt={labourer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div
                      className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-background ${
                        labourer.isAvailable ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {labourer.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {labourer.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({labourer.totalJobs} jobs)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          ₹{labourer.hourlyRate}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per hour
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {labourer.location} • {labourer.distance}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {labourer.skills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {labourer.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{labourer.skills.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Experience:</span>{" "}
                        {labourer.experience} •
                        <span className="font-medium"> Languages:</span>{" "}
                        {labourer.languages.join(", ")}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleContactLabourer(labourer)}
                        disabled={!labourer.isAvailable}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {labourer.isAvailable ? "Contact" : "Unavailable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alert(`Calling ${labourer.name}...`)}
                        disabled={!labourer.isAvailable}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLabourers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No labourers found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabourerHub;
