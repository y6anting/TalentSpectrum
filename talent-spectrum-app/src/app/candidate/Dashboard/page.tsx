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
import { Progress } from "@/app/components/progress";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Building,
  Eye,
  Bookmark,
  Share,
  Target,
  Award,
  Users,
  MessageCircle,
  Bell,
  Heart,
  Shield,
  Zap,
  Lightbulb,
} from "lucide-react";
import { motion } from "motion/react";

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for candidate dashboard
  const candidateStats = {
    name: "Alex Johnson",
    title: "Software Developer",
    location: "San Francisco, CA",
    profileCompleteness: 85,
    applicationsSubmitted: 12,
    interviewsScheduled: 3,
    jobMatches: 8,
    successRate: 75,
  };

  const recentApplications = [
    {
      id: "1",
      jobTitle: "Backend Developer",
      company: "TechCorp Inc.",
      appliedDate: "2024-01-18",
      status: "under_review",
      matchScore: 92,
      accommodationsRequested: true,
      nextStep: "Interview scheduled for Jan 25",
    },
    {
      id: "2",
      jobTitle: "Full Stack Developer",
      company: "InnovateLab",
      appliedDate: "2024-01-17",
      status: "interview_scheduled",
      matchScore: 88,
      accommodationsRequested: false,
      nextStep: "Interview on Jan 26 at 2:00 PM",
    },
    {
      id: "3",
      jobTitle: "Software Engineer",
      company: "DataFlow Systems",
      appliedDate: "2024-01-16",
      status: "shortlisted",
      matchScore: 85,
      accommodationsRequested: true,
      nextStep: "Awaiting final decision",
    },
  ];

  const upcomingInterviews = [
    {
      id: "1",
      company: "TechCorp Inc.",
      position: "Backend Developer",
      date: "2024-01-25",
      time: "2:00 PM",
      type: "Technical Interview",
      preparation: "Review Python, Django, and system design",
    },
    {
      id: "2",
      company: "InnovateLab",
      position: "Full Stack Developer",
      date: "2024-01-26",
      time: "10:00 AM",
      type: "Behavioral Interview",
      preparation: "Practice STAR method and accommodation requests",
    },
  ];

  const skillProgress = [
    { skill: "Python Programming", progress: 90, level: "Expert" },
    { skill: "Django Framework", progress: 85, level: "Advanced" },
    { skill: "System Design", progress: 70, level: "Intermediate" },
    { skill: "Interview Skills", progress: 65, level: "Intermediate" },
    { skill: "Communication", progress: 80, level: "Advanced" },
  ];

  const achievements = [
    {
      title: "Profile Completion",
      description: "Completed 85% of your profile",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "First Interview",
      description: "Scheduled your first interview",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Skill Development",
      description: "Improved Python skills to Expert level",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3a4043] mb-2">Your Dashboard</h1>
          <p className="text-[#6f7a80]">
            Track your job search progress and career development
          </p>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
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
              icon: Calendar,
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
              icon: TrendingUp,
              iconColor: "text-purple-600",
              title: "Success Rate",
              value: `${candidateStats.successRate}%`,
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
          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#635bff]" />
                    Recent Applications
                  </CardTitle>
                  <Button variant="outline" size="sm" className="text-[#635bff] border-[#635bff] hover:bg-[#635bff]/10">
                    View All
                  </Button>
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
                        <div className="flex items-center gap-4 text-xs text-[#6f7a80] mb-2">
                          <span>Match: {app.matchScore}%</span>
                          <span>Applied: {app.appliedDate}</span>
                        </div>
                        <p className="text-xs text-[#635bff]">{app.nextStep}</p>
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

          {/* Upcoming Interviews */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#635bff]" />
                  Upcoming Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="p-4 border border-[#e8e6f0] rounded-lg">
                      <h4 className="font-medium text-[#3a4043] mb-1">{interview.position}</h4>
                      <p className="text-sm text-[#6f7a80] mb-2">{interview.company}</p>
                      <div className="flex items-center gap-2 text-xs text-[#6f7a80] mb-2">
                        <Clock className="h-3 w-3" />
                        {interview.date} at {interview.time}
                      </div>
                      <Badge variant="secondary" className="text-xs mb-2">{interview.type}</Badge>
                      <p className="text-xs text-[#635bff]">{interview.preparation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Skill Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                <TrendingUp className="w-5 h-5 text-[#635bff]" />
                Skill Development Progress
              </CardTitle>
              <CardDescription className="text-[#6f7a80]">
                Track your skill development and areas for improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillProgress.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#3a4043]">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#6f7a80]">{skill.level}</span>
                        <Badge variant="secondary" className="text-xs">{skill.progress}%</Badge>
                      </div>
                    </div>
                    <Progress value={skill.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                <Award className="w-5 h-5 text-[#635bff]" />
                Recent Achievements
              </CardTitle>
              <CardDescription className="text-[#6f7a80]">
                Celebrate your progress and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center gap-3 p-4 border border-[#e8e6f0] rounded-lg hover:shadow-md transition-all duration-300"
                    >
                      <div className={`p-2 rounded-lg ${achievement.bgColor}`}>
                        <Icon className={`w-5 h-5 ${achievement.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-[#3a4043] text-sm">{achievement.title}</h4>
                        <p className="text-xs text-[#6f7a80]">{achievement.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8"
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
              <div className="grid md:grid-cols-4 gap-4">
                <Button className="bg-[#635bff] hover:bg-[#524aff] text-white h-auto p-4">
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Apply to Jobs</div>
                    <div className="text-xs opacity-90">Find opportunities</div>
                  </div>
                </Button>
                <Button variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 h-auto p-4">
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Mock Interview</div>
                    <div className="text-xs">Practice interviews</div>
                  </div>
                </Button>
                <Button variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 h-auto p-4">
                  <div className="text-center">
                    <Lightbulb className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Job Coach</div>
                    <div className="text-xs">Get guidance</div>
                  </div>
                </Button>
                <Button variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 h-auto p-4">
                  <div className="text-center">
                    <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">View Progress</div>
                    <div className="text-xs">Track development</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}



