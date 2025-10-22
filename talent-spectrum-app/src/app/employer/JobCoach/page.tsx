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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs";
import {
  Brain,
  FileText,
  Users,
  BookOpen,
  MessageCircle,
  Calendar,
  Star,
  CheckCircle,
  Target,
  Lightbulb,
  Shield,
  Clock,
  TrendingUp,
  Award,
  Compass,
  Book,
  Heart,
  Zap,
  Building,
  User,
  BarChart3,
  Download,
} from "lucide-react";
import { motion } from "motion/react";

export default function EmployerJobCoach() {
  const [activeTab, setActiveTab] = useState("inclusive-hiring");

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-[#3a4043] mb-4">
              Employer Job Coach
            </h1>
            <p className="text-xl text-[#6f7a80] mb-6 max-w-3xl mx-auto">
              Build inclusive hiring practices and create neurodivergent-friendly workplaces
            </p>
          </motion.div>
        </div>

        {/* Main Coaching Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl border border-[#e8e6f0] p-1 mb-8">
            <TabsTrigger value="inclusive-hiring" className="text-sm data-[state=active]:bg-[#635bff] data-[state=active]:text-white rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4" />
              Inclusive Hiring Support
            </TabsTrigger>
            <TabsTrigger value="workplace-inclusion" className="text-sm data-[state=active]:bg-[#635bff] data-[state=active]:text-white rounded-lg flex items-center gap-2">
              <Building className="w-4 h-4" />
              Workplace Inclusion
            </TabsTrigger>
            <TabsTrigger value="progress-feedback" className="text-sm data-[state=active]:bg-[#635bff] data-[state=active]:text-white rounded-lg flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Progress & Feedback
            </TabsTrigger>
          </TabsList>

          {/* Inclusive Hiring Support Tab */}
          <TabsContent value="inclusive-hiring" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                    <Calendar className="w-5 h-5 text-[#635bff]" />
                    Book a Job Coach
                  </CardTitle>
                  <CardDescription className="text-[#6f7a80]">
                    Schedule sessions with experienced coaches to improve your hiring practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Free Consultation",
                        price: "Free",
                        duration: "30 minutes",
                        description: "Initial assessment of your hiring practices",
                        features: ["Current state analysis", "Basic recommendations", "Next steps planning"]
                      },
                      {
                        title: "Strategy Session",
                        price: "$150",
                        duration: "1 hour",
                        description: "Comprehensive hiring strategy development",
                        features: ["Detailed assessment", "Custom strategy", "Implementation plan", "Follow-up support"]
                      },
                      {
                        title: "Monthly Coaching",
                        price: "$500/month",
                        duration: "Ongoing",
                        description: "Continuous support for inclusive hiring",
                        features: ["Monthly sessions", "Ongoing support", "Progress tracking", "Team training"]
                      }
                    ].map((session, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="p-6 border border-[#e8e6f0] rounded-lg hover:shadow-md transition-all duration-300"
                      >
                        <h4 className="font-semibold text-[#3a4043] mb-2">{session.title}</h4>
                        <div className="text-2xl font-bold text-[#635bff] mb-1">{session.price}</div>
                        <div className="text-sm text-[#6f7a80] mb-3">{session.duration}</div>
                        <p className="text-sm text-[#6f7a80] mb-4">{session.description}</p>
                        <ul className="space-y-2 mb-4">
                          {session.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full bg-[#635bff] hover:bg-[#524aff] text-white">
                          Book Session
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card> */}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                    <FileText className="w-5 h-5 text-[#635bff]" />
                    Interview Guide for Neurodivergent Candidates
                  </CardTitle>
                  <CardDescription className="text-[#6f7a80]">
                    Best practices for conducting inclusive interviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-[#3a4043] mb-3">Pre-Interview Preparation</h4>
                      <div className="space-y-3">
                        {[
                          "Provide interview questions in advance",
                          "Offer alternative interview formats",
                          "Ensure accessible meeting spaces",
                          "Share company culture information"
                        ].map((tip, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border border-[#e8e6f0] rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-[#3a4043]">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3a4043] mb-3">During the Interview</h4>
                      <div className="space-y-3">
                        {[
                          "Allow processing time for responses",
                          "Use clear, direct questions",
                          "Avoid ambiguous language",
                          "Focus on skills and potential"
                        ].map((tip, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border border-[#e8e6f0] rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-[#3a4043]">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                    <CheckCircle className="w-5 h-5 text-[#635bff]" />
                    Inclusive Job Posting Checklist
                  </CardTitle>
                  <CardDescription className="text-[#6f7a80]">
                    Ensure your job postings are accessible and inclusive
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-[#3a4043] mb-3">Job Description</h4>
                      <div className="space-y-3">
                        {[
                          "Use clear, simple language",
                          "Focus on essential requirements only",
                          "Highlight neurodivergent-friendly benefits",
                          "Include accommodation information"
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border border-[#e8e6f0] rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-[#3a4043]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3a4043] mb-3">Application Process</h4>
                      <div className="space-y-3">
                        {[
                          "Offer multiple application methods",
                          "Provide clear instructions",
                          "Include accommodation requests",
                          "Set realistic deadlines"
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border border-[#e8e6f0] rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-[#3a4043]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Workplace Inclusion Tab */}
          <TabsContent value="workplace-inclusion" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                    <Users className="w-5 h-5 text-[#635bff]" />
                    Manager Toolkit
                  </CardTitle>
                  <CardDescription className="text-[#6f7a80]">
                    Essential resources for managing neurodivergent employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      {
                        title: "Understanding Neurodivergence",
                        description: "Learn about different neurodivergent conditions and their strengths",
                        icon: Brain,
                        color: "text-blue-600",
                        bgColor: "bg-blue-100"
                      },
                      {
                        title: "Team Management",
                        description: "Strategies for inclusive team leadership and communication",
                        icon: Users,
                        color: "text-green-600",
                        bgColor: "bg-green-100"
                      },
                      {
                        title: "Conflict Resolution",
                        description: "Handle workplace conflicts with neurodivergent employees",
                        icon: Heart,
                        color: "text-red-600",
                        bgColor: "bg-red-100"
                      }
                    ].map((resource, index) => {
                      const Icon = resource.icon;
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="p-4 border border-[#e8e6f0] rounded-lg hover:shadow-md transition-all duration-300"
                        >
                          <div className={`p-3 rounded-lg ${resource.bgColor} w-fit mb-3`}>
                            <Icon className={`w-6 h-6 ${resource.color}`} />
                          </div>
                          <h4 className="font-medium text-[#3a4043] mb-2">{resource.title}</h4>
                          <p className="text-sm text-[#6f7a80]">{resource.description}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                    <Building className="w-5 h-5 text-[#635bff]" />
                    Workplace Adaptation Ideas
                  </CardTitle>
                  <CardDescription className="text-[#6f7a80]">
                    Practical suggestions for creating inclusive work environments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-[#3a4043] mb-3">Physical Environment</h4>
                      <div className="space-y-3">
                        {[
                          "Quiet workspaces and noise-canceling areas",
                          "Flexible lighting options",
                          "Sensory-friendly break rooms",
                          "Clear visual organization systems"
                        ].map((idea, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border border-[#e8e6f0] rounded-lg">
                            <Lightbulb className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-[#3a4043]">{idea}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3a4043] mb-3">Work Processes</h4>
                      <div className="space-y-3">
                        {[
                          "Flexible work schedules and remote options",
                          "Clear task instructions and deadlines",
                          "Regular check-ins and feedback sessions",
                          "Accommodation request processes"
                        ].map((idea, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border border-[#e8e6f0] rounded-lg">
                            <Lightbulb className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-[#3a4043]">{idea}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                    <MessageCircle className="w-5 h-5 text-[#635bff]" />
                    Consult with a Coach
                  </CardTitle>
                  <CardDescription className="text-[#6f7a80]">
                    Get personalized advice for workplace challenges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-[#e8e6f0] rounded-lg">
                      <h4 className="font-medium text-[#3a4043] mb-2">Workplace Consultation</h4>
                      <p className="text-sm text-[#6f7a80] mb-3">
                        Get expert advice on creating inclusive workplaces and managing neurodivergent teams.
                      </p>
                      <Button className="bg-[#635bff] hover:bg-[#524aff] text-white">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Schedule Consultation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Progress & Feedback Tab */}
          <TabsContent value="progress-feedback" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                    <BarChart3 className="w-5 h-5 text-[#635bff]" />
                    Inclusion Readiness Score
                  </CardTitle>
                  <CardDescription className="text-[#6f7a80]">
                    Track your company's progress in creating inclusive workplaces
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#635bff] mb-2">85%</div>
                      <div className="text-sm text-[#6f7a80]">Overall Inclusion Score</div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { category: "Hiring Practices", score: 90, color: "text-green-600" },
                        { category: "Workplace Accommodations", score: 85, color: "text-blue-600" },
                        { category: "Team Training", score: 80, color: "text-yellow-600" },
                        { category: "Communication", score: 85, color: "text-blue-600" },
                        { category: "Company Culture", score: 90, color: "text-green-600" }
                      ].map((item, index) => (
                        <div key={index} className="p-4 border border-[#e8e6f0] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-[#3a4043]">{item.category}</span>
                            <span className={`font-bold ${item.color}`}>{item.score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#635bff] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                    <MessageCircle className="w-5 h-5 text-[#635bff]" />
                    Coach Feedback Portal
                  </CardTitle>
                  <CardDescription className="text-[#6f7a80]">
                    Recent feedback and recommendations from your coaches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Hiring Process Improvement",
                        feedback: "Your job postings are well-structured. Consider adding more specific accommodation information.",
                        date: "2024-01-20",
                        coach: "Dr. Sarah Chen"
                      },
                      {
                        title: "Team Training Recommendation",
                        feedback: "Your team would benefit from neurodivergence awareness training. I recommend starting with basic education sessions.",
                        date: "2024-01-18",
                        coach: "Michael Rodriguez"
                      }
                    ].map((feedback, index) => (
                      <div key={index} className="p-4 border border-[#e8e6f0] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-[#3a4043]">{feedback.title}</h4>
                          <span className="text-xs text-[#6f7a80]">{feedback.date}</span>
                        </div>
                        <p className="text-sm text-[#6f7a80] mb-2">{feedback.feedback}</p>
                        <div className="text-xs text-[#635bff]">Coach: {feedback.coach}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                    <BookOpen className="w-5 h-5 text-[#635bff]" />
                    Team Learning Resources
                  </CardTitle>
                  <CardDescription className="text-[#6f7a80]">
                    Educational materials for your team's inclusion journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Neurodivergence Awareness Training",
                        description: "Basic understanding of neurodivergent conditions and strengths",
                        duration: "2 hours",
                        progress: 75
                      },
                      {
                        title: "Inclusive Communication Workshop",
                        description: "Learn effective communication strategies with neurodivergent colleagues",
                        duration: "1.5 hours",
                        progress: 50
                      },
                      {
                        title: "Accommodation Planning Guide",
                        description: "How to implement and manage workplace accommodations",
                        duration: "1 hour",
                        progress: 25
                      }
                    ].map((resource, index) => (
                      <div key={index} className="p-4 border border-[#e8e6f0] rounded-lg">
                        <h4 className="font-medium text-[#3a4043] mb-2">{resource.title}</h4>
                        <p className="text-sm text-[#6f7a80] mb-3">{resource.description}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[#6f7a80]">Duration: {resource.duration}</span>
                          <span className="text-xs text-[#635bff]">{resource.progress}% complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#635bff] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${resource.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


