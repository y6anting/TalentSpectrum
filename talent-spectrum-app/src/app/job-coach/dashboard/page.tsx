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
  Users,
  Building,
  MessageCircle,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  MapPin,
  DollarSign,
  Bell,
  Shield,
  Heart,
  Star,
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Globe,
  BookOpen,
  Eye,
  Download,
  AlertCircle,
  Lightbulb,
  User,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  ExternalLink,
} from "lucide-react";
import { motion } from "motion/react";

export default function JobCoachDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Mock data for job coach dashboard
  const dashboardStats = {
    totalCandidates: 24,
    activeCandidates: 18,
    completedCandidates: 6,
    connectedEmployers: 12,
    upcomingSessions: 8,
    thisWeekSessions: 12,
    successRate: 94,
    averageProgress: 78,
  };

  const notifications = [
    {
      id: "1",
      type: "upcoming_session",
      title: "Upcoming Session",
      message: "Alex Johnson - Career Guidance session in 2 hours",
      time: "2 hours ago",
      priority: "high",
      action: "View Details",
    },
    {
      id: "2",
      type: "candidate_needs_help",
      title: "Candidate Needs Help",
      message: "Sam Chen hasn't applied to jobs in 3 days. Consider reaching out.",
      time: "4 hours ago",
      priority: "medium",
      action: "Schedule Check-in",
    },
    {
      id: "3",
      type: "company_consultation",
      title: "Company Consultation Request",
      message: "TechCorp Inc. requested advice on inclusive hiring practices",
      time: "1 day ago",
      priority: "medium",
      action: "Book Consultation",
    },
    {
      id: "4",
      type: "candidate_progress",
      title: "Candidate Progress",
      message: "Jordan Smith completed mock interview practice successfully",
      time: "2 days ago",
      priority: "low",
      action: "View Progress",
    },
  ];

  const candidateProgress = [
    {
      id: "1",
      name: "Alex Johnson",
      title: "Software Developer",
      status: "active",
      progress: 75,
      lastSession: "2024-01-20",
      nextSession: "2024-01-25",
      needsHelp: true,
      growthTrend: "up",
      keyStrengths: ["Problem-solving", "Attention to detail"],
      areasForImprovement: ["Interview confidence", "Networking"],
    },
    {
      id: "2",
      name: "Sam Chen",
      title: "UX Designer",
      status: "active",
      progress: 90,
      lastSession: "2024-01-22",
      nextSession: "2024-01-28",
      needsHelp: false,
      growthTrend: "up",
      keyStrengths: ["Creative thinking", "User empathy"],
      areasForImprovement: ["Portfolio presentation"],
    },
    {
      id: "3",
      name: "Jordan Smith",
      title: "Data Analyst",
      status: "completed",
      progress: 100,
      lastSession: "2024-01-15",
      nextSession: null,
      needsHelp: false,
      growthTrend: "stable",
      keyStrengths: ["Analytical thinking", "Pattern recognition"],
      areasForImprovement: [],
    },
  ];

  const companySupport = [
    {
      id: "1",
      name: "TechCorp Inc.",
      industry: "Technology",
      inclusionScore: 85,
      lastConsultation: "2024-01-18",
      nextConsultation: "2024-01-30",
      needsSupport: true,
      keyAreas: ["Interview practices", "Accommodation planning"],
    },
    {
      id: "2",
      name: "InnovateLab",
      industry: "Design",
      inclusionScore: 92,
      lastConsultation: "2024-01-20",
      nextConsultation: null,
      needsSupport: false,
      keyAreas: ["Team training", "Policy development"],
    },
  ];

  const aiInsights = [
    {
      type: "candidate_recommendation",
      title: "AI Recommendation",
      description: "Based on Alex Johnson's progress, consider focusing on interview preparation and confidence building.",
      confidence: 92,
      action: "View Detailed Analysis",
    },
    {
      type: "company_support",
      title: "Company Support Suggestion",
      description: "TechCorp Inc. shows strong interest in neurodivergent hiring. Recommend advanced inclusion training.",
      confidence: 88,
      action: "Schedule Training",
    },
    {
      type: "resource_recommendation",
      title: "Resource Recommendation",
      description: "Sam Chen would benefit from portfolio optimization resources and networking strategies.",
      confidence: 85,
      action: "Assign Resources",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case "stable":
        return <BarChart3 className="w-4 h-4 text-blue-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3a4043] mb-2">Job Coach Dashboard</h1>
          <p className="text-[#6f7a80]">
            Overview of your candidates, companies, and coaching progress
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
                    placeholder="Search candidates, companies, or sessions..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="needs_help">Needs Help</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              icon: Users,
              iconColor: "text-[#635bff]",
              title: "Total Candidates",
              value: dashboardStats.totalCandidates,
              change: "+3 this week",
            },
            {
              icon: Building,
              iconColor: "text-blue-600",
              title: "Connected Employers",
              value: dashboardStats.connectedEmployers,
              change: "+1 this week",
            },
            {
              icon: Calendar,
              iconColor: "text-green-600",
              title: "This Week Sessions",
              value: dashboardStats.thisWeekSessions,
              change: "+2 this week",
            },
            {
              icon: TrendingUp,
              iconColor: "text-purple-600",
              title: "Success Rate",
              value: `${dashboardStats.successRate}%`,
              change: "Excellent",
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#635bff]" />
                    Notifications
                  </CardTitle>
                  <Badge variant="secondary" className="bg-[#635bff]/10 text-[#635bff]">
                    {notifications.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      whileHover={{ boxShadow: "2px 2px 4px rgba(99,91,255,0.3)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-start gap-3 p-4 border border-[#e8e6f0] rounded-xl bg-white hover:cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[#3a4043] mb-1">{notification.title}</h4>
                        <p className="text-sm text-[#6f7a80] mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#6f7a80]">{notification.time}</span>
                          <Button size="sm" variant="outline" className="text-xs">
                            {notification.action}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Coach Assistant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-[#635bff]/5 to-[#635bff]/10 border-[#635bff]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                  <Lightbulb className="w-5 h-5 text-[#635bff]" />
                  AI Coach Assistant
                </CardTitle>
                <CardDescription className="text-[#6f7a80]">
                  AI-powered insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="border border-[#e8e6f0] rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-[#3a4043] text-sm">{insight.title}</h4>
                        <Badge variant="secondary" className="bg-[#635bff]/10 text-[#635bff] text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-[#6f7a80] mb-3">{insight.description}</p>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        {insight.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                  <Target className="w-5 h-5 text-[#635bff]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full bg-[#635bff] hover:bg-[#524aff] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Session
                  </Button>
                  <Button variant="outline" className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                    <Users className="w-4 h-4 mr-2" />
                    View Candidates
                  </Button>
                  <Button variant="outline" className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                    <Building className="w-4 h-4 mr-2" />
                    Company Support
                  </Button>
                  <Button variant="outline" className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                    <Download className="w-4 h-4 mr-2" />
                    Export Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Candidate Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                  <Users className="w-5 h-5 text-[#635bff]" />
                  Candidate Progress Overview
                </CardTitle>
                <Button variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidateProgress.map((candidate) => (
                  <motion.div
                    key={candidate.id}
                    whileHover={{ boxShadow: "2px 2px 4px rgba(99,91,255,0.3)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-xl bg-white hover:cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-[#3a4043]">{candidate.name}</h4>
                        {getStatusBadge(candidate.status)}
                        {candidate.needsHelp && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Needs Help
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#6f7a80] mb-2">{candidate.title}</p>
                      <div className="flex items-center gap-4 text-xs text-[#6f7a80] mb-2">
                        <span>Progress: {candidate.progress}%</span>
                        <span>Last session: {candidate.lastSession}</span>
                        {candidate.nextSession && <span>Next: {candidate.nextSession}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(candidate.growthTrend)}
                        <span className="text-xs text-[#635bff]">
                          {candidate.keyStrengths.join(", ")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-[#635bff] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${candidate.progress}%` }}
                        />
                      </div>
                      <Button size="sm" variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Company Support Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                  <Building className="w-5 h-5 text-[#635bff]" />
                  Company Support Overview
                </CardTitle>
                <Button variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {companySupport.map((company) => (
                  <motion.div
                    key={company.id}
                    whileHover={{ boxShadow: "2px 2px 4px rgba(99,91,255,0.3)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-xl bg-white hover:cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-[#3a4043] mb-1">{company.name}</h4>
                      <p className="text-sm text-[#6f7a80] mb-2">{company.industry}</p>
                      <div className="flex items-center gap-4 text-xs text-[#6f7a80] mb-2">
                        <span>Inclusion Score: {company.inclusionScore}%</span>
                        <span>Last consultation: {company.lastConsultation}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {company.keyAreas.map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                      {company.needsSupport && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-2 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Needs Support
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <Button size="sm" className="bg-[#635bff] hover:bg-[#524aff] text-white">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Support
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}



