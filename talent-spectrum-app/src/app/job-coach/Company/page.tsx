"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Input } from "@/app/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import {
  Search,
  Building,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  Eye,
  MessageCircle,
  Calendar,
  TrendingUp,
  AlertCircle,
  Shield,
  Heart,
  Target,
  BookOpen,
  Zap,
  Filter,
  SortAsc,
  Plus,
  ExternalLink,
  Users,
  BarChart3,
} from "lucide-react";
import { motion } from "motion/react";

export default function JobCoachCompany() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Mock data for job coach company support
  const companyStats = {
    totalCompanies: 12,
    activeCompanies: 8,
    needsSupport: 2,
    averageInclusionScore: 85,
  };

  const companies = [
    {
      id: "1",
      name: "TechCorp Inc.",
      industry: "Technology",
      location: "San Francisco, CA",
      size: "50-100 employees",
      inclusionScore: 85,
      lastConsultation: "2024-01-18",
      nextConsultation: "2024-01-30",
      needsSupport: true,
      keyAreas: ["Interview practices", "Accommodation planning"],
      progress: 75,
      growthTrend: "up",
      contactPerson: "Sarah Johnson",
      contactEmail: "sarah.johnson@techcorp.com",
      phone: "+1 (555) 123-4567",
    },
    {
      id: "2",
      name: "InnovateLab",
      industry: "Design",
      location: "Seattle, WA",
      size: "11-50 employees",
      inclusionScore: 92,
      lastConsultation: "2024-01-20",
      nextConsultation: null,
      needsSupport: false,
      keyAreas: ["Team training", "Policy development"],
      progress: 95,
      growthTrend: "stable",
      contactPerson: "Michael Chen",
      contactEmail: "michael.chen@innovatelab.com",
      phone: "+1 (555) 987-6543",
    },
    {
      id: "3",
      name: "DataFlow Systems",
      industry: "Analytics",
      location: "Austin, TX",
      size: "100-500 employees",
      inclusionScore: 70,
      lastConsultation: "2024-01-15",
      nextConsultation: "2024-02-01",
      needsSupport: true,
      keyAreas: ["Hiring practices", "Workplace accommodations"],
      progress: 60,
      growthTrend: "up",
      contactPerson: "Emily Rodriguez",
      contactEmail: "emily.rodriguez@dataflow.com",
      phone: "+1 (555) 456-7890",
    },
  ];

  const getStatusBadge = (needsSupport: boolean, inclusionScore: number) => {
    if (needsSupport) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Needs Support
        </Badge>
      );
    } else if (inclusionScore >= 90) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Excellent
        </Badge>
      );
    } else if (inclusionScore >= 80) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Good
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Needs Improvement
        </Badge>
      );
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case "stable":
        return <Target className="w-4 h-4 text-blue-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "needs_support" && company.needsSupport) ||
                         (filterStatus === "excellent" && company.inclusionScore >= 90) ||
                         (filterStatus === "good" && company.inclusionScore >= 80 && company.inclusionScore < 90);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3a4043] mb-2">Company Support</h1>
          <p className="text-[#6f7a80]">
            Support companies in building inclusive workplaces and hiring practices
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                  <Input
                    placeholder="Search companies by name, industry, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="needs_support">Needs Support</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="score">Inclusion Score</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              icon: Building,
              iconColor: "text-[#635bff]",
              title: "Total Companies",
              value: companyStats.totalCompanies,
              change: "+2 this week",
            },
            {
              icon: CheckCircle,
              iconColor: "text-green-600",
              title: "Active Companies",
              value: companyStats.activeCompanies,
              change: "+1 this week",
            },
            {
              icon: AlertCircle,
              iconColor: "text-red-600",
              title: "Need Support",
              value: companyStats.needsSupport,
              change: "Requires attention",
            },
            {
              icon: BarChart3,
              iconColor: "text-blue-600",
              title: "Avg Inclusion Score",
              value: `${companyStats.averageInclusionScore}%`,
              change: "Good progress",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-xl overflow-hidden hover:cursor-pointer"
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.iconColor}`} />
                    <h3 className="text-2xl font-bold text-[#3a4043] mb-1">{stat.value}</h3>
                    <p className="text-sm text-[#6f7a80] mb-1">{stat.title}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-[#6f7a80]">
            Showing {filteredCompanies.length} of {companies.length} companies
          </p>
        </div>

        {/* Company Cards */}
        <div className="space-y-6">
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-[#3a4043]">{company.name}</h3>
                        {getStatusBadge(company.needsSupport, company.inclusionScore)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[#6f7a80] mb-3">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {company.industry}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {company.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {company.size}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {company.inclusionScore}% inclusion score
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#3a4043]">Progress</span>
                          <span className="text-sm text-[#6f7a80]">{company.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#635bff] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${company.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Key Areas */}
                      <div className="mb-4">
                        <h4 className="font-medium text-[#3a4043] mb-2">Key Support Areas:</h4>
                        <div className="flex flex-wrap gap-2">
                          {company.keyAreas.map((area, areaIndex) => (
                            <Badge key={areaIndex} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="mb-4">
                        <h4 className="font-medium text-[#3a4043] mb-2">Contact Information:</h4>
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-[#6f7a80]">
                          <div>Contact: {company.contactPerson}</div>
                          <div>Email: {company.contactEmail}</div>
                          <div>Phone: {company.phone}</div>
                        </div>
                      </div>

                      {/* Session Info */}
                      <div className="flex items-center gap-6 text-sm text-[#6f7a80]">
                        <span>Last consultation: {company.lastConsultation}</span>
                        {company.nextConsultation && <span>Next: {company.nextConsultation}</span>}
                        <div className="flex items-center gap-1">
                          {getTrendIcon(company.growthTrend)}
                          <span>Growth trend</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button className="bg-[#635bff] hover:bg-[#524aff] text-white">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Consult
                      </Button>
                      <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredCompanies.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-[#6f7a80] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#3a4043] mb-2">No companies found</h3>
              <p className="text-[#6f7a80] mb-4">
                Try adjusting your search criteria or filters to find more companies.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {filteredCompanies.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button size="sm" className="bg-[#635bff] text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



