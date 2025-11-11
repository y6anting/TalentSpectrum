"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
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
  Target,
  Filter,
  SortAsc,
  Settings,
  CalendarClock,
  User,
  Mail,
  Briefcase,
  Save,
  Camera,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import AppointmentPage from "@/app/candidate/candidate-dashboard/Appointment/page";

export default function JobCoachDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("candidates");
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Dr. Sarah Chen",
    jobTitle: "Job Coach",
    specialization: "ADHD Expert",
    email: "jobcoach@gamuda.com",
  });

  // Mock data for job coach candidate overview
  const candidateStats = {
    totalCandidates: 24,
    activeCandidates: 18,
    completedCandidates: 6,
    needsHelp: 3,
  };

  const candidates = [
    {
      id: "1",
      name: "Alex Johnson",
      title: "Software Developer",
      location: "San Francisco, CA",
      status: "active",
      lastSession: "2025-10-20",
      nextSession: "2025-11-10",
      progress: 75,
      needsHelp: true,
      growthTrend: "up",
      keyStrengths: ["Problem-solving", "Attention to detail"],
      areasForImprovement: ["Interview confidence", "Networking"],
      matchScore: 92,
      experience: "3 years",
      accommodations: ["Flexible schedule", "Quiet workspace"],
      mockInterviewResult:
        "Strong technical answers, needs work on articulation - 7.5/10",
    },
    {
      id: "2",
      name: "Sam Chen",
      title: "UX Designer",
      location: "Seattle, WA",
      status: "active",
      lastSession: "2025-10-28",
      nextSession: "2025-11-12",
      progress: 90,
      needsHelp: false,
      growthTrend: "up",
      keyStrengths: ["Creative thinking", "User empathy"],
      areasForImprovement: ["Portfolio presentation"],
      matchScore: 88,
      experience: "2 years",
      accommodations: ["Remote work", "Extended deadlines"],
      mockInterviewResult:
        "Excellent portfolio presentation, great communication - 9/10",
    },
    {
      id: "3",
      name: "Jordan Smith",
      title: "Data Analyst",
      location: "Austin, TX",
      status: "completed",
      lastSession: "2025-10-15",
      nextSession: null,
      progress: 100,
      needsHelp: false,
      growthTrend: "stable",
      keyStrengths: ["Analytical thinking", "Pattern recognition"],
      areasForImprovement: [],
      matchScore: 95,
      experience: "4 years",
      accommodations: ["Structured environment", "Clear instructions"],
      mockInterviewResult: "Outstanding performance across all areas - 9.5/10",
    },
    {
      id: "4",
      name: "Maria Garcia",
      title: "Frontend Developer",
      location: "Los Angeles, CA",
      status: "active",
      lastSession: "2025-10-25",
      nextSession: "2025-11-08",
      progress: 65,
      needsHelp: false,
      growthTrend: "up",
      keyStrengths: ["UI implementation", "Responsive design"],
      areasForImprovement: ["Time management", "Code optimization"],
      matchScore: 85,
      experience: "2 years",
      accommodations: ["Written instructions", "Flexible hours"],
      mockInterviewResult:
        "Good technical knowledge, could improve communication - 7/10",
    },
    {
      id: "5",
      name: "James Wilson",
      title: "Product Manager",
      location: "New York, NY",
      status: "active",
      lastSession: "2025-10-18",
      nextSession: "2025-11-05",
      progress: 80,
      needsHelp: false,
      growthTrend: "up",
      keyStrengths: ["Strategic thinking", "Stakeholder management"],
      areasForImprovement: ["Technical depth", "Agile methodologies"],
      matchScore: 90,
      experience: "5 years",
      accommodations: ["Clear expectations", "Regular check-ins"],
      mockInterviewResult:
        "Strong leadership skills, solid product knowledge - 8.5/10",
    },
    {
      id: "6",
      name: "Emily Brown",
      title: "Marketing Specialist",
      location: "Boston, MA",
      status: "active",
      lastSession: "2025-10-30",
      nextSession: "2025-11-15",
      progress: 70,
      needsHelp: true,
      growthTrend: "up",
      keyStrengths: ["Content creation", "Social media strategy"],
      areasForImprovement: ["Data analysis", "Presentation skills"],
      matchScore: 82,
      experience: "3 years",
      accommodations: ["Quiet workspace", "Visual aids"],
      mockInterviewResult:
        "Creative approach, needs confidence in delivery - 7/10",
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
      <div className="page-wrap py-8">
        <div className="mb-8">
          {/* <h1 className="text-3xl font-bold text-[#3a4043] mb-2">
            Welcome back, Dr. Sarah Chen
          </h1>
          <p className="text-[#6f7a80]">Here's your session management</p> */}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
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
                      {
                        id: "AI Consult",
                        label: "AI Consult",
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
          <div className="lg:col-span-3">
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

                <Card className="mb-8">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
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

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-64">
                          <SortAsc className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">
                            Most Recent Session
                          </SelectItem>
                          <SelectItem value="name">Name A-Z</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="pb-6">
                  <p className="text-[#6f7a80]">
                    Showing {filteredCandidates.length} of {candidates.length}{" "}
                    candidates
                  </p>
                </div>

                <div className="space-y-4">
                  {filteredCandidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className="hover:shadow-md transition-all"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-6">
                          {/* Left: Name and Title */}
                          <div className="flex-1 min-w-[200px]">
                            <h3 className="text-base font-semibold text-[#3a4043] mb-1">
                              {candidate.name}
                            </h3>
                            <p className="text-sm text-[#6f7a80] mb-1">
                              {candidate.title}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-[#6f7a80]">
                              <Clock className="h-3 w-3" />
                              Last session: {candidate.lastSession}
                            </div>
                          </div>

                          {/* Middle: Interview Score and Strengths - Fixed width columns */}
                          <div className="flex items-center gap-12">
                            <div className="w-32 text-center">
                              <div className="text-xs text-[#6f7a80] mb-2">
                                Interview Score
                              </div>
                              <div className="text-2xl font-bold text-[#635bff]">
                                {candidate.mockInterviewResult
                                  .split("-")[1]
                                  ?.trim() || "8/10"}
                              </div>
                            </div>

                            <div className="w-52">
                              <div className="text-xs text-[#6f7a80] mb-2">
                                Strengths
                              </div>
                              <div className="space-y-1">
                                {candidate.keyStrengths
                                  .slice(0, 2)
                                  .map((strength, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs text-green-700"
                                    >
                                      • {strength}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 ml-auto">
                            <Button
                              size="sm"
                              className="bg-[#635bff] hover:bg-[#524aff] text-white"
                              onClick={() =>
                                router.push(
                                  `/job-coach/Candidate/${candidate.id}`
                                )
                              }
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-300 hover:cursor-pointer"
                              onClick={() => setActiveTab("appointment")}
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Schedule
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#3a4043] mb-2">
                    Profile Settings
                  </h2>
                  <p className="text-[#6f7a80]">
                    Manage your job coach profile information
                  </p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Avatar Upload Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-[#635bff]" />
                            Profile Picture
                          </div>
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                            JC
                          </div>
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Handle file upload here
                                  console.log("File selected:", file.name);
                                }
                              }}
                              className="w-full"
                            />
                            <p className="text-xs text-[#6f7a80] mt-1">
                              Upload a profile picture (JPG, PNG, max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#635bff]" />
                            Full Name
                          </div>
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter your full name"
                          className="w-full"
                        />
                      </div>

                      {/* Job Title Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-[#635bff]" />
                            Job Title
                          </div>
                        </label>
                        <Input
                          type="text"
                          name="jobTitle"
                          value={profileData.jobTitle}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              jobTitle: e.target.value,
                            })
                          }
                          placeholder="Enter your job title"
                          className="w-full"
                        />
                      </div>

                      {/* Specialization Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-[#635bff]" />
                            Specialization
                          </div>
                        </label>
                        <Input
                          type="text"
                          name="specialization"
                          value={profileData.specialization}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              specialization: e.target.value,
                            })
                          }
                          placeholder="e.g., ADHD Expert, Autism Specialist"
                          className="w-full"
                        />
                      </div>

                      {/* Company Email Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#635bff]" />
                            Company Email
                          </div>
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          placeholder="jobcoach@company.com"
                          className="w-full"
                        />
                        <p className="text-xs text-[#6f7a80] mt-1">
                          Your professional email address
                        </p>
                      </div>

                      {/* Save Button */}
                      <div className="pt-4">
                        <Button
                          onClick={async () => {
                            setIsSaving(true);
                            await new Promise((resolve) =>
                              setTimeout(resolve, 1000)
                            );
                            setIsSaving(false);
                          }}
                          disabled={isSaving}
                          className="w-full bg-[#635bff] hover:bg-[#524aff] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "appointment" && (
              <AppointmentPage />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
