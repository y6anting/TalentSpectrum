"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  AlertCircle, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Code,
  Award,
  TrendingUp,
  Download,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { useSession } from "next-auth/react";
import { handleDownloadReport } from "./downloadReport";

interface ReportData {
  resume_feedback: {
    overall_resume_score: number;
    summary: string;
    strengths: string[];
    areas_for_improvement: string[];
  };
  career_guidance: {
    suitable_job_roles: Array<{
      role: string;
      reason: string;
    }>;
    transferable_skills: string[];
    next_steps: string[];
  };
  resume_summary?: {
    experience: string;
    education: string;
    skills: string[];
    key_achievements: string[];
  };
}

interface PriorityBadgeProps {
  priority: "High" | "Medium" | "Low";
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const styles = {
    High: { bg: "rgb(254, 226, 226)", text: "rgb(153, 27, 27)", border: "rgb(252, 165, 165)" },
    Medium: { bg: "rgb(254, 240, 138)", text: "rgb(133, 77, 14)", border: "rgb(253, 224, 71)" },
    Low: { bg: "rgb(219, 234, 254)", text: "rgb(30, 64, 175)", border: "rgb(147, 197, 253)" },
  };

  const s = styles[priority];

  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        borderColor: s.border,
      }}
    >
      {priority}
    </span>
  );
};

const ReportPage: React.FC = () => {
  const router = useRouter();
  const { data: authSession } = useSession();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockInterviewFeedback, setMockInterviewFeedback] = useState<any>(null);
  const [mockInterviewDetails, setMockInterviewDetails] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  // Color constants (safe RGB)
  const PRIMARY = "rgb(99, 91, 255)";
  const PRIMARY_HOVER = "rgb(86, 72, 232)";
  const PRIMARY_10 = "rgba(99, 91, 255, 0.1)";
  const PRIMARY_5 = "rgba(99, 91, 255, 0.05)";
  const BORDER_20 = "rgba(99, 91, 255, 0.2)";

  useEffect(() => {
    const loadReportData = async () => {
      try {
        // Load profile data and mock interview feedback using email from session
        if (authSession?.user?.email) {
          const userEmail = authSession.user.email;
          
          // Fetch candidate profile data
          try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
            const profileResponse = await fetch(`${backendUrl}/profiles/${encodeURIComponent(userEmail)}`);
            if (profileResponse.ok) {
              const profile = await profileResponse.json();
              setProfileData(profile);
              console.log('Profile data loaded for report:', profile);
            }
          } catch (err) {
            console.error("Failed to fetch profile data:", err);
          }
          
          // Fetch mock interview feedback
          try {
            const response = await fetch(`/api/mock-interview/reports/latest?email=${encodeURIComponent(userEmail)}`);
            if (response.ok) {
              const latestReport = await response.json();
              if (latestReport) {
                setMockInterviewFeedback({
                  overall_score: latestReport.overall_score || 0,
                  strengths: latestReport.strengths || [],
                  areas_for_improvement: latestReport.improvements || []
                });
                setMockInterviewDetails({
                  position: latestReport.position_title,
                  interviewType: latestReport.interview_type,
                  positionLevel: latestReport.position_level,
                  questionCount: latestReport.total_questions,
                  date: new Date(latestReport.created_at).toLocaleDateString(),
                  duration: Math.round(latestReport.duration_seconds / 60)
                });
              }
            }
          } catch (err) {
            console.error("Failed to fetch mock interview report:", err);
          }
        }

        // Fallback: sessionStorage
        if (!mockInterviewFeedback) {
          const mockSession = sessionStorage.getItem('mockInterviewSession');
          if (mockSession) {
            const session = JSON.parse(mockSession);
            if (session.feedback) {
              setMockInterviewFeedback(parseMockInterviewFeedback(session.feedback));
              setMockInterviewDetails({
                position: session.selectedPosition?.title || 'N/A',
                interviewType: session.interviewType || 'N/A',
                positionLevel: session.selectedPosition?.level || 'N/A',
                questionCount: session.answers?.length || 0
              });
            }
          }
        }

        // Resume report
        const storedReport = sessionStorage.getItem("resumeReport");
        if (storedReport) {
          const parsedReport = JSON.parse(storedReport);
          setReportData(parsedReport);
          setLoading(false);
          return;
        }

        try {
          const resumeFile = await getResumeFile();
          if (resumeFile) {
            // Fetch both resume feedback and summary in parallel
            const [feedbackResponse, summaryResponse] = await Promise.all([
              fetchResumeFeedback(resumeFile),
              fetchResumeSummary(resumeFile)
            ]);

            // Combine the responses
            const combinedData: ReportData = {
              resume_feedback: feedbackResponse.resume_feedback,
              career_guidance: feedbackResponse.career_guidance,
              resume_summary: summaryResponse
            };

            sessionStorage.setItem("resumeReport", JSON.stringify(combinedData));
            setReportData(combinedData);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to fetch from API:", err);
        }

        // Fallback to mock data if API fails
        const mockData = getMockReportData();
        setReportData(mockData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading report:", error);
        setReportData(getMockReportData());
        setLoading(false);
      }
    };
    loadReportData();
  }, [authSession]);

  const parseMockInterviewFeedback = (feedbackData: any) => {
    if (typeof feedbackData === 'object' && feedbackData !== null) {
      return {
        overall_score: feedbackData.overall_score,
        strengths: feedbackData.strengths || [],
        areas_for_improvement: feedbackData.areas_for_improvement || []
      };
    }
    return null;
  };

  const getResumeFile = async (): Promise<File | null> => {
    try {
      // Check if user has uploaded a resume in sessionStorage
      const uploadedResume = sessionStorage.getItem("uploadedResume");
      if (uploadedResume) {
        const resumeData = JSON.parse(uploadedResume);
        const response = await fetch(resumeData.url);
        const blob = await response.blob();
        return new File([blob], resumeData.filename, { type: "application/pdf" });
      }

      // Try to fetch the default resume PDF
      const resumeResponse = await fetch("/pdfs/resume-txt.pdf");
      if (resumeResponse.ok) {
        const blob = await resumeResponse.blob();
        return new File([blob], "resume-txt.pdf", { type: "application/pdf" });
      }
    } catch (err) {
      console.error("Could not load resume PDF:", err);
    }
    return null;
  };

  const fetchResumeFeedback = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(API_ENDPOINTS.RESUME_FEEDBACK, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to fetch resume feedback");
    const data = await response.json();
    return typeof data.feedback === "string" ? JSON.parse(data.feedback) : data.feedback || data;
  };

  const fetchResumeSummary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(API_ENDPOINTS.RESUME_SUMMARY, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to fetch resume summary");
    const data = await response.json();
    return data.summary;
  };

  const getMockReportData = (): ReportData => ({
    resume_feedback: {
      overall_resume_score: 78,
      summary: "Strong technical background with clear project experience. Resume demonstrates solid foundation in software development.",
      strengths: [
        "Exceptional attention to detail",
        "Strong analytical thinking",
        "Deep focus on complex problems",
        "Systematic approach to tasks",
        "Pattern recognition skills"
      ],
      areas_for_improvement: [
        "Communication in team meetings - Practice active participation in smaller group settings first",
        "Time management under pressure - Use time-blocking techniques and set clear priorities",
        "Adapting to sudden changes - Work with supervisor to establish change notification protocols"
      ],
      // recommendations: {
      //   what_to_add: ["Quantifiable achievements", "Leadership examples", "Technical certifications"],
      //   what_to_remove: ["Outdated technologies", "Irrelevant work experience"],
      //   formatting_tips: ["Use consistent bullet points", "Add more white space", "Highlight key metrics"],
      //   tone_and_language: ["Use active voice", "Be more specific", "Show confidence"]
      // }
    },
    career_guidance: {
      suitable_job_roles: [
        { role: "Software Engineer", reason: "Strong coding skills and problem-solving abilities" },
        { role: "Data Analyst", reason: "Analytical mindset and attention to detail" },
        { role: "Quality Assurance Engineer", reason: "Systematic approach and pattern recognition" }
      ],
      transferable_skills: ["Problem Solving", "Technical Writing", "Code Review", "Testing"],
      next_steps: ["Complete online certifications", "Build portfolio projects", "Network with industry professionals"]
    },
    resume_summary: {
      experience: "3 years of software development experience with focus on backend systems and database optimization",
      education: "Bachelor's in Computer Science, GPA: 3.8",
      skills: ["Python", "Java", "SQL", "Git", "Problem Solving", "Data Analysis"],
      key_achievements: [
        "Optimized database queries reducing load time by 40%",
        "Contributed to 5 open-source projects",
        "Completed advanced algorithms certification"
      ]
    }
  });

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: PRIMARY, borderBottomColor: "transparent" }}
            />
            <p className="text-gray-600">Loading your report...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Download Button - Hidden in PDF */}
        <div className="max-w-7xl mx-auto mb-4 flex justify-end no-print">
          <Button
            onClick={() => handleDownloadReport()}
            style={{
              backgroundColor: PRIMARY,
              color: 'white',
            }}
            className="hover:opacity-90 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>

        <div id="report-content" className="max-w-7xl mx-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button> */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Feedback Report</h1>
                  <p className="text-gray-600 mt-1">Comprehensive analysis of your profile and interview performance</p>
                </div>
              </div>
              <Button
                onClick={handleDownloadReport}
                className="bg-[rgb(99,91,255)] hover:bg-[rgb(86, 72, 232)] text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>

            {/* Strengths & Needs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5" style={{ color: PRIMARY }} />
                    <h3 className="text-xl font-bold text-gray-800">Strength</h3>
                  </div>
                  <div className="space-y-3">
                    {reportData.resume_feedback.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="mt-1" style={{ color: PRIMARY }}>•</span>
                        <p className="text-gray-700">{strength}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5" style={{ color: PRIMARY }} />
                    <h3 className="text-xl font-bold text-gray-800">Needs</h3>
                  </div>
                  <div className="space-y-3">
                    {reportData.resume_feedback.areas_for_improvement.slice(0, 3).map((need, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="mt-1" style={{ color: PRIMARY }}>•</span>
                        <p className="text-gray-700">{need}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resume Summary + Areas for Improvement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Resume Summary */}
              {reportData.resume_summary && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="w-5 h-5" style={{ color: PRIMARY }} />
                      <h3 className="text-xl font-bold text-gray-800">Resume Summary</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="w-4 h-4" style={{ color: PRIMARY }} />
                          <h4 className="font-semibold text-gray-800">Experience</h4>
                        </div>
                        <p className="text-gray-700 text-sm">{reportData.resume_summary.experience}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-4 h-4" style={{ color: PRIMARY }} />
                          <h4 className="font-semibold text-gray-800">Education</h4>
                        </div>
                        <p className="text-gray-700 text-sm">{reportData.resume_summary.education}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-4 h-4" style={{ color: PRIMARY }} />
                          <h4 className="font-semibold text-gray-800">Skills</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {reportData.resume_summary.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: PRIMARY_10,
                                color: PRIMARY,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-4 h-4" style={{ color: PRIMARY }} />
                          <h4 className="font-semibold text-gray-800">Key Achievements</h4>
                        </div>
                        <ul className="space-y-2">
                          {reportData.resume_summary.key_achievements.map((achievement, index) => (
                            <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                              <span className="mt-1" style={{ color: PRIMARY }}>•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Areas for Improvement + Score */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    <h3 className="text-xl font-bold text-gray-800">Resume Areas for Improvement</h3>
                  </div>

                  {/* Score Circle - SVG (PDF-safe) */}
                  <div 
                    className="mb-6 p-4 rounded-lg"
                    data-pdf-bg="#f8f5ff"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">Overall Resume Score</h4>
                        <p className="text-gray-600 text-sm">{reportData.resume_feedback.summary}</p>
                      </div>

                      <div className="relative w-28 h-28 flex-shrink-0">
                        <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={PRIMARY}
                            strokeWidth="10"
                            strokeDasharray={`${(reportData.resume_feedback.overall_resume_score / 100) * 283} 283`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-2xl font-bold transform rotate-90" style={{ color: PRIMARY }}>
                            {reportData.resume_feedback.overall_resume_score}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Areas List */}
                  <div className="space-y-3">
                    {reportData.resume_feedback.areas_for_improvement.map((area, index) => {
                      const priority: "High" | "Medium" | "Low" = 
                        index === 0 ? "High" : index === 1 ? "Medium" : "Low";

                      return (
                        <div
                          key={index}
                          className="p-3 border-l-4 border-red-600 bg-gradient-to-r from-red-50 to-white rounded-lg"
                          data-pdf-bg="#fff5f5"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-gray-700 text-sm flex-1 pr-2">{area}</p>
                            <PriorityBadge priority={priority} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Suitable Job Roles */}
            {reportData.career_guidance?.suitable_job_roles && reportData.career_guidance.suitable_job_roles.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Briefcase className="w-5 h-5" style={{ color: PRIMARY }} />
                    <h3 className="text-xl font-bold text-gray-800">You Are Suitable to Work As</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.career_guidance.suitable_job_roles.map((job, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        style={{
                          borderColor: BORDER_20,
                          backgroundColor: PRIMARY_5,
                        }}
                        data-pdf-bg="#f8f9ff"
                      >
                        <h4 className="font-semibold mb-2" style={{ color: PRIMARY }}>{job.role}</h4>
                        <p className="text-gray-600 text-sm">{job.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mock Interview Performance */}
            <Card className="my-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" style={{ color: PRIMARY }} />
                    <h3 className="text-xl font-bold text-gray-800">Mock Interview Performance</h3>
                  </div>
                  {mockInterviewFeedback?.overall_score > 0 && (
                    <div className="text-center">
                      <div className="text-3xl font-bold" style={{ color: PRIMARY }}>{mockInterviewFeedback.overall_score}/100</div>
                      <div className="text-xs text-gray-600">Interview Score</div>
                    </div>
                  )}
                </div>

                {mockInterviewFeedback ? (
                  <>
                    {mockInterviewDetails && (
                      <div 
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                        data-pdf-bg="#f8f9ff"
                      >
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Position</div>
                          <div className="font-semibold text-gray-800">{mockInterviewDetails.position}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Interview Type</div>
                          <div className="font-semibold text-gray-800 capitalize">{mockInterviewDetails.interviewType}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Position Level</div>
                          <div className="font-semibold text-gray-800 capitalize">{mockInterviewDetails.positionLevel}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Questions Answered</div>
                          <div className="font-semibold text-gray-800">{mockInterviewDetails.questionCount}</div>
                        </div>
                        {mockInterviewDetails.date && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Completed On
                            </div>
                            <div className="font-semibold text-gray-800">{mockInterviewDetails.date}</div>
                            {mockInterviewDetails.duration && (
                              <div className="text-xs text-gray-500 mt-0.5">{mockInterviewDetails.duration} min</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Key Strengths
                        </h4>
                        <div className="space-y-3">
                          {mockInterviewFeedback.strengths?.length > 0 ? (
                            mockInterviewFeedback.strengths.map((strength: string, index: number) => (
                              <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-gray-700 text-sm flex items-start gap-2">
                                  <span className="text-green-600 mt-0.5">Checkmark</span>
                                  <span>{strength}</span>
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm italic">No strengths data available</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          Areas to Improve
                        </h4>
                        <div className="space-y-3">
                          {mockInterviewFeedback.areas_for_improvement?.length > 0 ? (
                            mockInterviewFeedback.areas_for_improvement.map((area: string, index: number) => (
                              <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-gray-700 text-sm flex items-start gap-2">
                                  <span className="text-orange-600 mt-0.5">Right Arrow</span>
                                  <span>{area}</span>
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm italic">No improvement areas identified</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">No Mock Interview Completed Yet</h4>
                      <p className="text-gray-600 mb-6">
                        Complete a mock interview to get personalized feedback.
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push('/candidate/candidate-dashboard')}
                      style={{
                        backgroundColor: PRIMARY,
                        color: 'white',
                      }}
                      className="hover:opacity-90"
                    >
                      Start Mock Interview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReportPage;