"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Settings,
  CalendarClock,
} from "lucide-react";
import { motion } from "motion/react";

export default function JobCoachCandidate() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("candidates");

  // Mock data for job coach candidate overview
  const candidateStats = {
    totalCandidates: 24,
    activeCandidates: 18,
    completedCandidates: 6,
    needsHelp: 3,
    averageProgress: 78,
  };

  const candidates = [
    {
      id: "1",
      name: "Alex Johnson",
      title: "Software Developer",
      location: "San Francisco, CA",
      status: "active",
      lastSession: "2024-01-20",
      nextSession: "2024-01-25",
      progress: 75,
      needsHelp: true,
      growthTrend: "up",
      keyStrengths: ["Problem-solving", "Attention to detail"],
      areasForImprovement: ["Interview confidence", "Networking"],
      matchScore: 92,
      experience: "3 years",
      accommodations: ["Flexible schedule", "Quiet workspace"],
    },
    {
      id: "2",
      name: "Sam Chen",
      title: "UX Designer",
      location: "Seattle, WA",
      status: "active",
      lastSession: "2024-01-22",
      nextSession: "2024-01-28",
      progress: 90,
      needsHelp: false,
      growthTrend: "up",
      keyStrengths: ["Creative thinking", "User empathy"],
      areasForImprovement: ["Portfolio presentation"],
      matchScore: 88,
      experience: "2 years",
      accommodations: ["Remote work", "Extended deadlines"],
    },
    {
      id: "3",
      name: "Jordan Smith",
      title: "Data Analyst",
      location: "Austin, TX",
      status: "completed",
      lastSession: "2024-01-15",
      nextSession: null,
      progress: 100,
      needsHelp: false,
      growthTrend: "stable",
      keyStrengths: ["Analytical thinking", "Pattern recognition"],
      areasForImprovement: [],
      matchScore: 95,
      experience: "4 years",
      accommodations: ["Structured environment", "Clear instructions"],
    },
  ];

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
        return <Target className="w-4 h-4 text-blue-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || candidate.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3a4043] mb-2">
            Welcome back, Job Coach
          </h1>
          <p className="text-[#6f7a80]">Here's your session management</p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <div>
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold">
                      JC
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#635bff]">
                        Job Coach
                      </h3>
                      <p className="text-sm text-gray-600">Adhd Expert</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#635bff]">
                        Profile Completion
                      </span>
                      <span className="text-sm font-medium text-[#635bff]">
                        85%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#635bff] h-2 rounded-full"
                        style={{ width: "85%" }}
                      />
                    </div>
                  </div>
                  <nav className="space-y-2">
                    {[
                      {
                        id: "profile",
                        label: "Profile Settings",
                        icon: Settings,
                      },
                      {
                        id: "appointment",
                        label: "Appointment",
                        icon: CalendarClock,
                      },
                      {
                        id: "candidates",
                        label: "Candidate List",
                        icon: Users,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                            activeTab === item.id
                              ? "bg-[#635bff] text-white"
                              : "text-[#3a4043] hover:bg-gray-100"
                          } hover:cursor-pointer`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
            <div>
            {activeTab === "candidates" && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#3a4043] mb-2">
                    Candidate Overview
                  </h2>
                  <p className="text-[#6f7a80]">
                    Manage and track your candidates' progress and development
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
                            placeholder="Search candidates by name, title, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="flex gap-4">
                        <Select
                          value={filterStatus}
                          onValueChange={setFilterStatus}
                        >
                          <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="needs_help">
                              Needs Help
                            </SelectItem>
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

                {/* Stats Overview */}
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
                      value: candidateStats.totalCandidates,
                      change: "+3 this week",
                    },
                    {
                      icon: CheckCircle,
                      iconColor: "text-green-600",
                      title: "Active Candidates",
                      value: candidateStats.activeCandidates,
                      change: "+2 this week",
                    },
                    {
                      icon: Star,
                      iconColor: "text-blue-600",
                      title: "Completed",
                      value: candidateStats.completedCandidates,
                      change: "+1 this week",
                    },
                    {
                      icon: AlertCircle,
                      iconColor: "text-red-600",
                      title: "Need Help",
                      value: candidateStats.needsHelp,
                      change: "Requires attention",
                    },
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="rounded-xl overflow-hidden hover:cursor-pointer"
                      >
                        <Card>
                          <CardContent className="p-6 text-center">
                            <Icon
                              className={`h-8 w-8 mx-auto mb-3 ${stat.iconColor}`}
                            />
                            <h3 className="text-2xl font-bold text-[#3a4043] mb-1">
                              {stat.value}
                            </h3>
                            <p className="text-sm text-[#6f7a80] mb-1">
                              {stat.title}
                            </p>
                            <p className="text-xs text-green-600">
                              {stat.change}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Results Summary */}
                <div className="mb-6">
                  <p className="text-[#6f7a80]">
                    Showing {filteredCandidates.length} of {candidates.length}{" "}
                    candidates
                  </p>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-6">
                  {filteredCandidates.map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-[#3a4043]">
                                  {candidate.name}
                                </h3>
                                {getStatusBadge(candidate.status)}
                                {candidate.needsHelp && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-red-100 text-red-800"
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Needs Help
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-[#6f7a80] mb-3">
                                <span className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  {candidate.title}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {candidate.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {candidate.experience}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  {candidate.matchScore}% match
                                </span>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-[#3a4043]">
                                    Progress
                                  </span>
                                  <span className="text-sm text-[#6f7a80]">
                                    {candidate.progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-[#635bff] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${candidate.progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Key Strengths */}
                              <div className="mb-4">
                                <h4 className="font-medium text-[#3a4043] mb-2">
                                  Key Strengths:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {candidate.keyStrengths.map(
                                    (strength, strengthIndex) => (
                                      <Badge
                                        key={strengthIndex}
                                        variant="secondary"
                                        className="text-xs bg-green-100 text-green-800"
                                      >
                                        {strength}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Areas for Improvement */}
                              {candidate.areasForImprovement.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-[#3a4043] mb-2">
                                    Areas for Improvement:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {candidate.areasForImprovement.map(
                                      (area, areaIndex) => (
                                        <Badge
                                          key={areaIndex}
                                          variant="outline"
                                          className="text-xs border-yellow-300 text-yellow-700"
                                        >
                                          {area}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Accommodations */}
                              <div className="mb-4">
                                <h4 className="font-medium text-[#3a4043] mb-2">
                                  Accommodations:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {candidate.accommodations.map(
                                    (accommodation, accIndex) => (
                                      <Badge
                                        key={accIndex}
                                        variant="outline"
                                        className="text-xs border-purple-300 text-purple-700"
                                      >
                                        <Shield className="h-3 w-3 mr-1" />
                                        {accommodation}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Session Info */}
                              <div className="flex items-center gap-6 text-sm text-[#6f7a80]">
                                <span>
                                  Last session: {candidate.lastSession}
                                </span>
                                {candidate.nextSession && (
                                  <span>Next: {candidate.nextSession}</span>
                                )}
                                <div className="flex items-center gap-1">
                                  {getTrendIcon(candidate.growthTrend)}
                                  <span>Growth trend</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              <Button className="bg-[#635bff] hover:bg-[#524aff] text-white">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                              <Button
                                variant="outline"
                                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                                onClick={() => setActiveTab("appointment")}
                              >
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
                {filteredCandidates.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Search className="w-16 h-16 text-[#6f7a80] mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[#3a4043] mb-2">
                        No candidates found
                      </h3>
                      <p className="text-[#6f7a80] mb-4">
                        Try adjusting your search criteria or filters to find
                        more candidates.
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
                {filteredCandidates.length > 0 && (
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
            )}

            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-bold text-[#3a4043] mb-4">
                  Profile Settings
                </h2>
                <p className="text-[#6f7a80]">
                  Manage your job coach profile settings here.
                </p>
              </div>
            )}

            {activeTab === "appointment" && (
              <div>
                <h2 className="text-2xl font-bold text-[#3a4043] mb-4">
                  Appointment
                </h2>
                <p className="text-[#6f7a80]">
                  View and manage your appointments here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
