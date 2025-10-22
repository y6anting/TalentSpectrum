"use client";

import React from "react";
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
import {
  User,
  Search,
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
  MessageCircle,
  BookOpen,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

export default function CandidateHomepage() {
  // Mock data for the candidate homepage
  const candidateStats = {
    name: "Alex Johnson",
    title: "Software Developer",
    location: "San Francisco, CA",
    experience: "3 years",
    profileCompleteness: 85,
    applicationsSubmitted: 12,
    interviewsScheduled: 3,
    jobMatches: 8,
  };

  const recentJobMatches = [
    {
      id: "1",
      title: "Backend Developer",
      company: "TechCorp Inc.",
      location: "Remote",
      type: "Full-time",
      salary: "$70k - $90k",
      matchScore: 92,
      postedDate: "2024-01-15",
      accommodationsFriendly: true,
    },
    {
      id: "2",
      title: "Full Stack Developer",
      company: "InnovateLab",
      location: "Hybrid",
      type: "Full-time",
      salary: "$75k - $95k",
      matchScore: 88,
      postedDate: "2024-01-20",
      accommodationsFriendly: true,
    },
    {
      id: "3",
      title: "Software Engineer",
      company: "DataFlow Systems",
      location: "On-site",
      type: "Full-time",
      salary: "$80k - $110k",
      matchScore: 85,
      postedDate: "2024-01-18",
      accommodationsFriendly: false,
    },
  ];

  const recentApplications = [
    {
      id: "1",
      jobTitle: "Backend Developer",
      company: "TechCorp Inc.",
      appliedDate: "2024-01-18",
      status: "under_review",
      accommodationsRequested: true,
      matchScore: 92,
    },
    {
      id: "2",
      jobTitle: "Full Stack Developer",
      company: "InnovateLab",
      appliedDate: "2024-01-17",
      status: "interview_scheduled",
      accommodationsRequested: false,
      matchScore: 88,
      interviewDate: "2024-01-25",
    },
    {
      id: "3",
      jobTitle: "Software Engineer",
      company: "DataFlow Systems",
      appliedDate: "2024-01-16",
      status: "shortlisted",
      accommodationsRequested: true,
      matchScore: 85,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_review":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Under Review
          </Badge>
        );
      case "interview_scheduled":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Interview Scheduled
          </Badge>
        );
      case "shortlisted":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Shortlisted
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
              Welcome back, {candidateStats.name}!
            </h1>
            <p className="text-xl text-[#6f7a80] mb-6 max-w-3xl mx-auto">
              Discover opportunities that match your unique strengths and career goals
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/jobListing">
              <Button className="bg-[#635bff] hover:bg-[#524aff] text-white px-6 py-3 text-lg">
                <Search className="w-5 h-5 mr-2" />
                Browse Jobs
              </Button>
            </Link>
            <Link href="candidate/candidate-dashboard">
              <Button variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 px-6 py-3 text-lg">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Candidate Overview */}
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
                  <h2 className="text-2xl font-bold text-[#3a4043]">{candidateStats.name}</h2>
                  <p className="text-[#6f7a80]">{candidateStats.title} • {candidateStats.location}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{candidateStats.profileCompleteness}%</div>
                  <div className="text-sm text-[#6f7a80]">Profile Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{candidateStats.applicationsSubmitted}</div>
                  <div className="text-sm text-[#6f7a80]">Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{candidateStats.interviewsScheduled}</div>
                  <div className="text-sm text-[#6f7a80]">Interviews</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{candidateStats.jobMatches}</div>
                  <div className="text-sm text-[#6f7a80]">Job Matches</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          {[
            {
              icon: FileText,
              iconColor: "text-[#635bff]",
              title: "Applications",
              value: candidateStats.applicationsSubmitted,
              change: "+3 this week",
            },
            {
              icon: Clock,
              iconColor: "text-blue-600",
              title: "Interviews",
              value: candidateStats.interviewsScheduled,
              change: "+1 this week",
            },
            {
              icon: Star,
              iconColor: "text-green-600",
              title: "Job Matches",
              value: candidateStats.jobMatches,
              change: "+2 this week",
            },
            {
              icon: Shield,
              iconColor: "text-purple-600",
              title: "Profile Score",
              value: `${candidateStats.profileCompleteness}%`,
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Job Matches */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#635bff]" />
                    Recommended Jobs
                  </CardTitle>
                  <Link href="/jobListing">
                    <Button variant="outline" size="sm" className="text-[#635bff] border-[#635bff] hover:bg-[#635bff]/10">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobMatches.map((job) => (
                    <motion.div
                      key={job.id}
                      whileHover={{ boxShadow: "2px 2px 4px rgba(99,91,255,0.3)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-xl bg-white hover:cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-[#3a4043] mb-1">{job.title}</h4>
                        <p className="text-sm text-[#6f7a80] mb-2">{job.company}</p>
                        <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {job.salary}
                          </span>
                          <span>Match: {job.matchScore}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-[#635bff]/10 text-[#635bff] border-[#635bff]/20">
                          {job.matchScore}% match
                        </Badge>
                        {job.accommodationsFriendly && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 mt-1 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Accommodation Friendly
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#635bff]" />
                    Recent Applications
                  </CardTitle>
                  <Link href="candidate/candidate-dashboard">
                    <Button variant="outline" size="sm" className="text-[#635bff] border-[#635bff] hover:bg-[#635bff]/10">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <motion.div
                      key={app.id}
                      whileHover={{ boxShadow: "2px 2px 4px rgba(99,91,255,0.3)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-xl bg-white hover:cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-[#3a4043] mb-1">{app.jobTitle}</h4>
                        <p className="text-sm text-[#6f7a80] mb-2">{app.company}</p>
                        <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                          <span>Match: {app.matchScore}%</span>
                          <span>Applied: {app.appliedDate}</span>
                          {app.interviewDate && <span>Interview: {app.interviewDate}</span>}
                        </div>
                        {app.accommodationsRequested && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 mt-2 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Accommodations Requested
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(app.status)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-[#635bff]/5 to-[#635bff]/10 border-[#635bff]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                <Target className="w-5 h-5 text-[#635bff]" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-[#6f7a80]">
                Take the next step in your career journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/job-coach?role=candidate">
                  <Button variant="outline" className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 h-auto p-4">
                    <div className="text-center">
                      <BookOpen className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Job Coach</div>
                      <div className="text-xs text-[#6f7a80]">Get career guidance</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/mock-interview">
                  <Button variant="outline" className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 h-auto p-4">
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Mock Interview</div>
                      <div className="text-xs text-[#6f7a80]">Practice interviews</div>
                    </div>
                  </Button>
                </Link>
                <Link href="candidate/candidate-dashboard">
                  <Button variant="outline" className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 h-auto p-4">
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Dashboard</div>
                      <div className="text-xs text-[#6f7a80]">Track progress</div>
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


