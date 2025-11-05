"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Target,
  MessageCircle,
  Calendar,
  Shield,
  CheckCircle,
  TrendingUp,
  Settings,
  CalendarClock,
  Users,
  FileText,
  GraduationCap,
  Code,
  Award,
  AlertCircle,
  Download,
} from "lucide-react";

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;
  const [activeMenuItem, setActiveMenuItem] = useState("candidates");

  // Mock candidate data - in real app, fetch based on candidateId
  const candidates = [
    {
      id: "1",
      name: "Alex Johnson",
      title: "Software Developer",
      email: "alex.johnson@email.com",
      phone: "+60198765432",
      location: "San Francisco, CA",
      status: "active",
      lastSession: "2025-10-20",
      nextSession: "2025-11-10",
      progress: 75,
      experience: "3 years",
      keyStrengths: ["Problem-solving", "Attention to detail"],
      areasForImprovement: ["Interview confidence", "Networking"],
      accommodations: ["Flexible schedule", "Quiet workspace"],
      mockInterviewResult:
        "Strong technical answers, needs work on articulation - 7.5/10",
      matchScore: 88,
      diagnosis: "Autism",
    },
    {
      id: "2",
      name: "Sam Chen",
      title: "UX Designer",
      email: "sam.chen@email.com",
      phone: "+60198765432",
      location: "Seattle, WA",
      status: "active",
      lastSession: "2025-10-28",
      nextSession: "2025-11-12",
      progress: 90,
      experience: "2 years",
      keyStrengths: ["Creative thinking", "User empathy"],
      areasForImprovement: ["Portfolio presentation"],
      accommodations: ["Remote work", "Extended deadlines"],
      mockInterviewResult:
        "Excellent portfolio presentation, great communication - 9/10",
      matchScore: 88,
      diagnosis: "Autism",
    },
    {
      id: "3",
      name: "Jordan Smith",
      title: "Data Analyst",
      email: "jordan.smith@email.com",
      phone: "+60198765432",
      location: "Austin, TX",
      status: "completed",
      lastSession: "2025-10-15",
      nextSession: null,
      progress: 100,
      experience: "4 years",
      keyStrengths: ["Analytical thinking", "Pattern recognition"],
      areasForImprovement: [],
      accommodations: ["Structured environment", "Clear instructions"],
      mockInterviewResult: "Outstanding performance across all areas - 9.5/10",
      matchScore: 95,
      diagnosis: "Autism",
    },
    {
      id: "4",
      name: "Maria Garcia",
      title: "Frontend Developer",
      email: "maria.garcia@email.com",
      phone: "+60198765432",
      location: "Los Angeles, CA",
      status: "active",
      lastSession: "2025-10-25",
      nextSession: "2025-11-08",
      progress: 65,
      experience: "2 years",
      keyStrengths: ["UI implementation", "Responsive design"],
      areasForImprovement: ["Time management", "Code optimization"],
      accommodations: ["Written instructions", "Flexible hours"],
      mockInterviewResult:
        "Good technical knowledge, could improve communication - 7/10",
      matchScore: 85,
      diagnosis: "Autism",
    },
    {
      id: "5",
      name: "James Wilson",
      title: "Product Manager",
      email: "james.wilson@email.com",
      phone: "+60198765432",
      location: "New York, NY",
      status: "active",
      lastSession: "2025-10-18",
      nextSession: "2025-11-05",
      progress: 80,
      experience: "5 years",
      keyStrengths: ["Strategic thinking", "Stakeholder management"],
      areasForImprovement: ["Technical depth", "Agile methodologies"],
      accommodations: ["Clear expectations", "Regular check-ins"],
      mockInterviewResult:
        "Strong leadership skills, solid product knowledge - 8.5/10",
      matchScore: 90,
      diagnosis: "Autism",
    },
    {
      id: "6",
      name: "Emily Brown",
      title: "Marketing Specialist",
      email: "emily.brown@email.com",
      phone: "+60198765432",
      location: "Boston, MA",
      status: "active",
      lastSession: "2025-10-30",
      nextSession: "2025-11-15",
      progress: 70,
      experience: "3 years",
      keyStrengths: ["Content creation", "Social media strategy"],
      areasForImprovement: ["Data analysis", "Presentation skills"],
      accommodations: ["Quiet workspace", "Visual aids"],
      mockInterviewResult:
        "Creative approach, needs confidence in delivery - 7/10",
      matchScore: 82,
      diagnosis: "Autism",
    },
  ];

  const candidate = candidates.find((c) => c.id === candidateId);

  // Mock report data for the candidate
  const reportData = {
    resume_feedback: {
      overall_resume_score: 78,
      summary:
        "Strong technical background with clear project experience. Resume demonstrates solid foundation in software development.",
      strengths: [
        "Exceptional attention to detail",
        "Strong analytical thinking",
        "Deep focus on complex problems",
        "Systematic approach to tasks",
        "Pattern recognition skills",
      ],
      areas_for_improvement: [
        "Communication in team meetings - Practice active participation in smaller group settings first",
        "Time management under pressure - Use time-blocking techniques and set clear priorities",
        "Adapting to sudden changes - Work with supervisor to establish change notification protocols",
      ],
      recommendations: {
        what_to_add: [
          "Quantifiable achievements",
          "Leadership examples",
          "Technical certifications",
        ],
        what_to_remove: ["Outdated technologies", "Irrelevant work experience"],
        formatting_tips: [
          "Use consistent bullet points",
          "Add more white space",
          "Highlight key metrics",
        ],
        tone_and_language: [
          "Use active voice",
          "Be more specific",
          "Show confidence",
        ],
      },
    },
    career_guidance: {
      suitable_job_roles: [
        {
          role: "Software Engineer",
          reason: "Strong coding skills and problem-solving abilities",
        },
        {
          role: "Data Analyst",
          reason: "Analytical mindset and attention to detail",
        },
        {
          role: "Quality Assurance Engineer",
          reason: "Systematic approach and pattern recognition",
        },
      ],
      transferable_skills: [
        "Problem Solving",
        "Technical Writing",
        "Code Review",
        "Testing",
      ],
      next_steps: [
        "Complete online certifications",
        "Build portfolio projects",
        "Network with industry professionals",
      ],
    },
    resume_summary: {
      experience: candidate?.title
        ? `${candidate.experience} of experience as ${candidate.title}`
        : "3 years of software development experience",
      education: "Bachelor's in Computer Science, GPA: 3.8",
      skills: [
        "Python",
        "Java",
        "SQL",
        "Git",
        "Problem Solving",
        "Data Analysis",
      ],
      key_achievements: [
        "Optimized database queries reducing load time by 40%",
        "Contributed to 5 open-source projects",
        "Completed advanced algorithms certification",
      ],
    },
  };

  const mockInterviewFeedback = {
    overall_score: 85,
    strengths: candidate?.keyStrengths || [],
    areas_for_improvement: candidate?.areasForImprovement || [],
  };

  const mockInterviewDetails = {
    position: candidate?.title || "N/A",
    interviewType: "technical",
    positionLevel: "mid-level",
    questionCount: 5,
  };

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#3a4043] mb-4">
            Candidate not found
          </h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3a4043] mb-2">
            Candidate Details
          </h1>
          <p className="text-[#6f7a80]">
            View and manage candidate information
          </p>
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

                  <nav className="space-y-1">
                    <button
                      onClick={() => router.push("/job-coach")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeMenuItem === "profile"
                          ? "bg-[#635bff] text-white shadow-lg"
                          : "text-[#6f7a80] hover:bg-gray-100"
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Profile Settings</span>
                    </button>

                    <button
                      onClick={() => router.push("/job-coach")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeMenuItem === "appointment"
                          ? "bg-[#635bff] text-white shadow-lg"
                          : "text-[#6f7a80] hover:bg-gray-100"
                      }`}
                    >
                      <CalendarClock className="w-5 h-5" />
                      <span className="font-medium">Appointment</span>
                    </button>

                    <button
                      onClick={() => router.push("/job-coach")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-[#635bff] text-white shadow-lg`}
                    >
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Candidate List</span>
                    </button>
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </Button>

            {/* Candidate Profile Header */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold text-3xl flex-shrink-0">
                    {candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-[#3a4043]">
                        {candidate.name}
                      </h1>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {candidate.status}
                      </Badge>
                    </div>

                    <p className="text-xl text-[#6f7a80] mb-4">
                      {candidate.title}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-[#6f7a80]">
                        <Mail className="h-4 w-4" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6f7a80]">
                        <Phone className="h-4 w-4" />
                        <span>{candidate.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6f7a80]">
                        <MapPin className="h-4 w-4" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6f7a80]">
                        <Briefcase className="h-4 w-4" />
                        <span>{candidate.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6f7a80]">
                        <Shield className="h-4 w-4" />
                        <span>{candidate.diagnosis}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6f7a80]">
                        <Target className="h-4 w-4" />
                        <span>{candidate.matchScore}% match score</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button className="bg-[#635bff] hover:bg-[#524aff] text-white">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#635bff] text-[#635bff]"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Report Section */}
            <div className="space-y-6">
              {/* Strengths & Needs Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Strengths */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-[#635bff]" />
                      <h3 className="text-xl font-bold text-gray-800">
                        Strength
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {reportData.resume_feedback.strengths.map(
                        (strength, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-[#635bff] mt-1">•</span>
                            <p className="text-gray-700">{strength}</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Needs */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-[#635bff]" />
                      <h3 className="text-xl font-bold text-gray-800">Needs</h3>
                    </div>
                    <div className="space-y-3">
                      {reportData.resume_feedback.recommendations.what_to_add.map(
                        (need, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-[#635bff] mt-1">•</span>
                            <p className="text-gray-700">{need}</p>
                          </div>
                        )
                      )}
                      {reportData.resume_feedback.recommendations.formatting_tips
                        .slice(0, 2)
                        .map((tip, index) => (
                          <div
                            key={`tip-${index}`}
                            className="flex items-start gap-2"
                          >
                            <span className="text-[#635bff] mt-1">•</span>
                            <p className="text-gray-700">{tip}</p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resume Summary (Left) and Areas for Improvement (Right) Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Left: Resume Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="w-5 h-5 text-[#635bff]" />
                      <h3 className="text-xl font-bold text-gray-800">
                        Resume Summary
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {/* Experience */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="w-4 h-4 text-[#635bff]" />
                          <h4 className="font-semibold text-gray-800">
                            Experience
                          </h4>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {reportData.resume_summary.experience}
                        </p>
                      </div>

                      {/* Education */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-4 h-4 text-[#635bff]" />
                          <h4 className="font-semibold text-gray-800">
                            Education
                          </h4>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {reportData.resume_summary.education}
                        </p>
                      </div>

                      {/* Skills */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-4 h-4 text-[#635bff]" />
                          <h4 className="font-semibold text-gray-800">
                            Skills
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {reportData.resume_summary.skills.map(
                            (skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-[#635bff]/10 text-[#635bff] rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Key Achievements */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-4 h-4 text-[#635bff]" />
                          <h4 className="font-semibold text-gray-800">
                            Key Achievements
                          </h4>
                        </div>
                        <ul className="space-y-2">
                          {reportData.resume_summary.key_achievements.map(
                            (achievement, index) => (
                              <li
                                key={index}
                                className="text-gray-700 text-sm flex items-start gap-2"
                              >
                                <span className="text-[#635bff] mt-1">•</span>
                                <span>{achievement}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right: Resume Areas for Improvement with Overall Score */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-5 h-5 text-red-600" />
                      <h3 className="text-xl font-bold text-gray-800">
                        Resume Areas for Improvement
                      </h3>
                    </div>

                    {/* Overall Resume Score */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-[#635bff]/10 to-purple-100/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-1">
                            Overall Resume Score
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {reportData.resume_feedback.summary}
                          </p>
                        </div>

                        {/* Score circle */}
                        <div className="relative w-28 h-28 flex-shrink-0">
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(#635bff ${
                                reportData.resume_feedback
                                  .overall_resume_score * 3.6
                              }deg, #e5e7eb 0deg)`,
                            }}
                          />
                          <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-[#635bff]">
                              {reportData.resume_feedback.overall_resume_score}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Areas for Improvement List */}
                    <div className="space-y-3">
                      {reportData.resume_feedback.areas_for_improvement.map(
                        (area, index) => (
                          <div
                            key={index}
                            className="p-3 border-l-4 border-red-600 bg-gradient-to-r from-red-50 to-white rounded-lg"
                          >
                            <p className="text-gray-700 text-sm">{area}</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Suitable Job Roles Section */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Briefcase className="w-5 h-5 text-[#635bff]" />
                    <h3 className="text-xl font-bold text-gray-800">
                      You Are Suitable to Work As
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.career_guidance.suitable_job_roles.map(
                      (job, index) => (
                        <div
                          key={index}
                          className="p-4 border border-[#635bff]/20 bg-gradient-to-br from-[#635bff]/5 to-white rounded-lg hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-semibold text-[#635bff] mb-2">
                            {job.role}
                          </h4>
                          <p className="text-gray-600 text-sm">{job.reason}</p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    Recommendations
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* What to Add */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        What to Add
                      </h4>
                      <ul className="space-y-2">
                        {reportData.resume_feedback.recommendations.what_to_add.map(
                          (item, index) => (
                            <li
                              key={index}
                              className="text-gray-700 text-sm flex items-start gap-2"
                            >
                              <span className="text-green-500 mt-1">✓</span>
                              <span>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* What to Remove */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        What to Remove
                      </h4>
                      <ul className="space-y-2">
                        {reportData.resume_feedback.recommendations.what_to_remove.map(
                          (item, index) => (
                            <li
                              key={index}
                              className="text-gray-700 text-sm flex items-start gap-2"
                            >
                              <span className="text-red-500 mt-1">✗</span>
                              <span>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Formatting Tips */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Formatting Tips
                      </h4>
                      <ul className="space-y-2">
                        {reportData.resume_feedback.recommendations.formatting_tips.map(
                          (tip, index) => (
                            <li
                              key={index}
                              className="text-gray-700 text-sm flex items-start gap-2"
                            >
                              <span className="text-blue-500 mt-1">→</span>
                              <span>{tip}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Tone & Language */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Tone & Language
                      </h4>
                      <ul className="space-y-2">
                        {reportData.resume_feedback.recommendations.tone_and_language.map(
                          (item, index) => (
                            <li
                              key={index}
                              className="text-gray-700 text-sm flex items-start gap-2"
                            >
                              <span className="text-purple-500 mt-1">💬</span>
                              <span>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mock Interview Performance Section */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#635bff]" />
                      <h3 className="text-xl font-bold text-gray-800">
                        Mock Interview Performance
                      </h3>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#635bff]">
                        {mockInterviewFeedback.overall_score}/100
                      </div>
                      <div className="text-xs text-gray-600">
                        Interview Score
                      </div>
                    </div>
                  </div>

                  {/* Interview Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Position</div>
                      <div className="font-semibold text-gray-800">
                        {mockInterviewDetails.position}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">
                        Interview Type
                      </div>
                      <div className="font-semibold text-gray-800 capitalize">
                        {mockInterviewDetails.interviewType}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">
                        Position Level
                      </div>
                      <div className="font-semibold text-gray-800 capitalize">
                        {mockInterviewDetails.positionLevel}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">
                        Questions Answered
                      </div>
                      <div className="font-semibold text-gray-800">
                        {mockInterviewDetails.questionCount}
                      </div>
                    </div>
                  </div>

                  {/* Strengths and Areas for Improvement */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Interview Strengths */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Key Strengths
                      </h4>
                      <div className="space-y-3">
                        {mockInterviewFeedback.strengths.map(
                          (strength, index) => (
                            <div
                              key={index}
                              className="p-3 bg-green-50 border border-green-200 rounded-lg"
                            >
                              <p className="text-gray-700 text-sm flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{strength}</span>
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Interview Areas for Improvement */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Areas to Improve
                      </h4>
                      <div className="space-y-3">
                        {mockInterviewFeedback.areas_for_improvement.map(
                          (area, index) => (
                            <div
                              key={index}
                              className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                            >
                              <p className="text-gray-700 text-sm flex items-start gap-2">
                                <span className="text-orange-600 mt-0.5">
                                  →
                                </span>
                                <span>{area}</span>
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
