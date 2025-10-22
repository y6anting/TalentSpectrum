"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { motion } from "motion/react";

export default function JobCoachHomepage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("candidates");

  // Mock data for job coach homepage
  const coachStats = {
    name: "Dr. Sarah Chen",
    title: "Senior Job Coach",
    location: "San Francisco, CA",
    experience: "8 years",
    activeCandidates: 24,
    connectedEmployers: 12,
    upcomingSessions: 8,
    completionRate: 94,
  };

  const aiInsights = [
    {
      type: "candidate_needs_help",
      title: "Alex Johnson needs support",
      description: "Hasn't applied to jobs in 2 weeks. Consider scheduling a check-in.",
      priority: "high",
      action: "Schedule Session",
    },
    {
      type: "company_consultation",
      title: "TechCorp Inc. requested consultation",
      description: "Wants advice on inclusive interview practices for neurodivergent candidates.",
      priority: "medium",
      action: "Book Consultation",
    },
    {
      type: "candidate_progress",
      title: "Sam Chen made progress",
      description: "Successfully completed mock interview practice. Ready for real interviews.",
      priority: "low",
      action: "View Progress",
    },
  ];

  const upcomingSessions = [
    {
      id: "1",
      candidateName: "Alex Johnson",
      type: "Career Guidance",
      date: "2024-01-25",
      time: "2:00 PM",
      duration: "1 hour",
      status: "confirmed",
    },
    {
      id: "2",
      candidateName: "Sam Chen",
      type: "Interview Prep",
      date: "2024-01-26",
      time: "10:00 AM",
      duration: "45 minutes",
      status: "confirmed",
    },
    {
      id: "3",
      companyName: "TechCorp Inc.",
      type: "Company Consultation",
      date: "2024-01-27",
      time: "3:30 PM",
      duration: "1.5 hours",
      status: "pending",
    },
  ];

  const candidateOverview = [
    {
      id: "1",
      name: "Alex Johnson",
      title: "Software Developer",
      location: "San Francisco, CA",
      status: "active",
      lastSession: "2024-01-20",
      progress: 75,
      nextAction: "Apply to 3 jobs",
      needsHelp: true,
    },
    {
      id: "2",
      name: "Sam Chen",
      title: "UX Designer",
      location: "Seattle, WA",
      status: "active",
      lastSession: "2024-01-22",
      progress: 90,
      nextAction: "Interview preparation",
      needsHelp: false,
    },
    {
      id: "3",
      name: "Jordan Smith",
      title: "Data Analyst",
      location: "Austin, TX",
      status: "completed",
      lastSession: "2024-01-15",
      progress: 100,
      nextAction: "Job placement achieved",
      needsHelp: false,
    },
  ];

  const companySupport = [
    {
      id: "1",
      name: "TechCorp Inc.",
      industry: "Technology",
      location: "San Francisco, CA",
      inclusionScore: 85,
      lastConsultation: "2024-01-18",
      nextAction: "Review job postings",
      needsSupport: true,
    },
    {
      id: "2",
      name: "InnovateLab",
      industry: "Design",
      location: "Seattle, WA",
      inclusionScore: 92,
      lastConsultation: "2024-01-20",
      nextAction: "Team training scheduled",
      needsSupport: false,
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
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-[#3a4043] mb-4">
              Welcome back, {coachStats.name}!
            </h1>
            <p className="text-xl text-[#6f7a80] mb-6 max-w-3xl mx-auto">
              Guide neurodivergent talent to success and help companies build inclusive workplaces
            </p>
          </motion.div>

          {/* Compact Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search candidates or jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidates">Candidates</SelectItem>
                  <SelectItem value="jobs">Jobs</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-[#635bff] hover:bg-[#524aff] text-white">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Coach Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-[#635bff]/5 to-[#635bff]/10 border-[#635bff]/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#635bff] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#3a4043]">{coachStats.name}</h2>
                  <p className="text-[#6f7a80]">{coachStats.title} • {coachStats.location}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{coachStats.activeCandidates}</div>
                  <div className="text-sm text-[#6f7a80]">Active Candidates</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{coachStats.connectedEmployers}</div>
                  <div className="text-sm text-[#6f7a80]">Connected Employers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{coachStats.upcomingSessions}</div>
                  <div className="text-sm text-[#6f7a80]">Upcoming Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{coachStats.completionRate}%</div>
                  <div className="text-sm text-[#6f7a80]">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                <Lightbulb className="w-5 h-5 text-[#635bff]" />
                AI Insights & Recommendations
              </CardTitle>
              <CardDescription className="text-[#6f7a80]">
                AI-powered insights on candidates needing support and recommended actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ boxShadow: "2px 2px 4px rgba(99,91,255,0.3)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-xl bg-white hover:cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getPriorityColor(insight.priority)}`}>
                        {insight.type === "candidate_needs_help" && <AlertCircle className="w-4 h-4" />}
                        {insight.type === "company_consultation" && <Building className="w-4 h-4" />}
                        {insight.type === "candidate_progress" && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#3a4043] mb-1">{insight.title}</h4>
                        <p className="text-sm text-[#6f7a80]">{insight.description}</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-[#635bff] hover:bg-[#524aff] text-white">
                      {insight.action}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#635bff]" />
                    Upcoming Sessions
                  </CardTitle>
                  <Link href="/job-coach/dashboard">
                    <Button variant="outline" size="sm" className="text-[#635bff] border-[#635bff] hover:bg-[#635bff]/10">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      whileHover={{ boxShadow: "2px 2px 4px rgba(99,91,255,0.3)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-xl bg-white hover:cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-[#3a4043] mb-1">
                          {session.candidateName || session.companyName}
                        </h4>
                        <p className="text-sm text-[#6f7a80] mb-2">{session.type}</p>
                        <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.date} at {session.time}
                          </span>
                          <span>{session.duration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(session.status)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Candidate Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#635bff]" />
                    Candidate Overview
                  </CardTitle>
                  <Link href="/job-coach/candidates">
                    <Button variant="outline" size="sm" className="text-[#635bff] border-[#635bff] hover:bg-[#635bff]/10">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidateOverview.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      whileHover={{ boxShadow: "2px 2px 4px rgba(99,91,255,0.3)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-xl bg-white hover:cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-[#3a4043] mb-1">{candidate.name}</h4>
                        <p className="text-sm text-[#6f7a80] mb-2">{candidate.title} • {candidate.location}</p>
                        <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                          <span>Progress: {candidate.progress}%</span>
                          <span>Last session: {candidate.lastSession}</span>
                        </div>
                        <p className="text-xs text-[#635bff] mt-1">{candidate.nextAction}</p>
                        {candidate.needsHelp && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 mt-1 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Needs Help
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(candidate.status)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Company Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                <Building className="w-5 h-5 text-[#635bff]" />
                Company Support
              </CardTitle>
              <CardDescription className="text-[#6f7a80]">
                Companies you're supporting with inclusion practices
              </CardDescription>
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
                      <p className="text-sm text-[#6f7a80] mb-2">{company.industry} • {company.location}</p>
                      <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                        <span>Inclusion Score: {company.inclusionScore}%</span>
                        <span>Last consultation: {company.lastConsultation}</span>
                      </div>
                      <p className="text-xs text-[#635bff] mt-1">{company.nextAction}</p>
                      {company.needsSupport && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-1 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Needs Support
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Consult
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-[#635bff]/5 to-[#635bff]/10 border-[#635bff]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                <Target className="w-5 h-5 text-[#635bff]" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-[#6f7a80]">
                Access your most important tools and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Link href="/job-coach/dashboard">
                  <Button variant="outline" className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 h-auto p-4">
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Dashboard</div>
                      <div className="text-xs text-[#6f7a80]">View analytics</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/job-coach/candidates">
                  <Button variant="outline" className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 h-auto p-4">
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Candidates</div>
                      <div className="text-xs text-[#6f7a80]">Manage candidates</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/job-coach/companies">
                  <Button variant="outline" className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 h-auto p-4">
                    <div className="text-center">
                      <Building className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Companies</div>
                      <div className="text-xs text-[#6f7a80]">Support employers</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/job-coach/resources">
                  <Button variant="outline" className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 h-auto p-4">
                    <div className="text-center">
                      <BookOpen className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Resources</div>
                      <div className="text-xs text-[#6f7a80]">Learning materials</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


