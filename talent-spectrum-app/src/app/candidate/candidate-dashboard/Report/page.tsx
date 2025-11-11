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
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";

interface ReportData {
  resume_feedback: {
    overall_resume_score: number;
    summary: string;
    strengths: string[];
    areas_for_improvement: string[];
    recommendations: {
      what_to_add: string[];
      what_to_remove: string[];
      formatting_tips: string[];
      tone_and_language: string[];
    };
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
  const colors = {
    High: "bg-red-100 text-red-800 border-red-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Low: "bg-blue-100 text-blue-800 border-blue-200"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const ReportPage: React.FC = () => {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mockInterviewFeedback, setMockInterviewFeedback] = useState<any>(null);
  const [mockInterviewDetails, setMockInterviewDetails] = useState<any>(null);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        // Load mock interview feedback from sessionStorage
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

        // First check sessionStorage for resume report
        const storedReport = sessionStorage.getItem("resumeReport");
        if (storedReport) {
          const parsedReport = JSON.parse(storedReport);
          setReportData(parsedReport);
          setLoading(false);
          return;
        }

        // Try to fetch from consolidated backend
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
        setError("Failed to load report. Using sample data.");
        // Use mock data as fallback
        setReportData(getMockReportData());
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

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

    if (!response.ok) {
      throw new Error("Failed to fetch resume feedback");
    }

    const data = await response.json();
    
    // Parse the feedback if it's a string
    if (typeof data.feedback === "string") {
      return JSON.parse(data.feedback);
    }
    
    return data.feedback || data;
  };

  const fetchResumeSummary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(API_ENDPOINTS.RESUME_SUMMARY, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch resume summary");
    }

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
      recommendations: {
        what_to_add: ["Quantifiable achievements", "Leadership examples", "Technical certifications"],
        what_to_remove: ["Outdated technologies", "Irrelevant work experience"],
        formatting_tips: ["Use consistent bullet points", "Add more white space", "Highlight key metrics"],
        tone_and_language: ["Use active voice", "Be more specific", "Show confidence"]
      }
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

  const handleDownloadReport = () => {
    // Implement PDF download functionality
    console.log("Downloading report...");
    alert("Report download feature coming soon!");
  };

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bFF] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your report...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
       <div className="p-6">
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
            className="bg-[#635BFF] hover:bg-[#5648E8] hover:cursor-pointer text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>

        {/* Strengths & Needs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-[#635BFF]" />
                <h3 className="text-xl font-bold text-gray-800">Strength</h3>
              </div>
              <div className="space-y-3">
                {reportData.resume_feedback.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-[#635BFF] mt-1">•</span>
                    <p className="text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Needs */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#635BFF]" />
                <h3 className="text-xl font-bold text-gray-800">Needs</h3>
              </div>
              <div className="space-y-3">
                {reportData.resume_feedback.recommendations.what_to_add.map((need, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-[#635BFF] mt-1">•</span>
                    <p className="text-gray-700">{need}</p>
                  </div>
                ))}
                {reportData.resume_feedback.recommendations.formatting_tips.slice(0, 2).map((tip, index) => (
                  <div key={`tip-${index}`} className="flex items-start gap-2">
                    <span className="text-[#635BFF] mt-1">•</span>
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
          {reportData.resume_summary && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-[#635BFF]" />
                  <h3 className="text-xl font-bold text-gray-800">Resume Summary</h3>
                </div>

                <div className="space-y-6">
                  {/* Experience */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-[#635BFF]" />
                      <h4 className="font-semibold text-gray-800">Experience</h4>
                    </div>
                    <p className="text-gray-700 text-sm">{reportData.resume_summary.experience}</p>
                  </div>

                  {/* Education */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4 text-[#635BFF]" />
                      <h4 className="font-semibold text-gray-800">Education</h4>
                    </div>
                    <p className="text-gray-700 text-sm">{reportData.resume_summary.education}</p>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Code className="w-4 h-4 text-[#635BFF]" />
                      <h4 className="font-semibold text-gray-800">Skills</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {reportData.resume_summary.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#635BFF]/10 text-[#635BFF] rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Achievements */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-[#635BFF]" />
                      <h4 className="font-semibold text-gray-800">Key Achievements</h4>
                    </div>
                    <ul className="space-y-2">
                      {reportData.resume_summary.key_achievements.map((achievement, index) => (
                        <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-[#635BFF] mt-1">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Right: Resume Areas for Improvement with Overall Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <h3 className="text-xl font-bold text-gray-800">Resume Areas for Improvement</h3>
              </div>

              {/* Overall Resume Score */}
              <div className="mb-6 p-4 bg-gradient-to-r from-[#635BFF]/10 to-purple-100/30 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex-1 pr-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Overall Resume Score</h4>
                    <p className="text-gray-600 text-sm">{reportData.resume_feedback.summary}</p>
                    </div>

                    {/* Larger score circle */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                        background: `conic-gradient(#635BFF ${reportData.resume_feedback.overall_resume_score * 3.6}deg, #e5e7eb 0deg)`
                        }}
                    />
                    <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#635BFF]">
                        {reportData.resume_feedback.overall_resume_score}
                        </span>
                    </div>
                    </div>
                </div>
                </div>


              {/* Areas for Improvement List */}
              <div className="space-y-3">
                {reportData.resume_feedback.areas_for_improvement.map((area, index) => {
                  // Determine priority based on content (simple heuristic)
                  const priority: "High" | "Medium" | "Low" = 
                    index === 0 ? "High" : index === 1 ? "Medium" : "Low";

                  return (
                    <div
                      key={index}
                      className="p-3 border-l-4 border-red-600 bg-gradient-to-r from-red-50 to-white rounded-lg"
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

        {/* Suitable Job Roles Section */}
        {reportData.career_guidance?.suitable_job_roles && reportData.career_guidance.suitable_job_roles.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-[#635BFF]" />
                <h3 className="text-xl font-bold text-gray-800">You Are Suitable to Work As</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportData.career_guidance.suitable_job_roles.map((job, index) => (
                  <div
                    key={index}
                    className="p-4 border border-[#635BFF]/20 bg-gradient-to-br from-[#635BFF]/5 to-white rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-semibold text-[#635BFF] mb-2">{job.role}</h4>
                    <p className="text-gray-600 text-sm">{job.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Recommendations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What to Add */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  What to Add
                </h4>
                <ul className="space-y-2">
                  {reportData.resume_feedback.recommendations.what_to_add.map((item, index) => (
                    <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What to Remove */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  What to Remove
                </h4>
                <ul className="space-y-2">
                  {reportData.resume_feedback.recommendations.what_to_remove.map((item, index) => (
                    <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formatting Tips */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Formatting Tips
                </h4>
                <ul className="space-y-2">
                  {reportData.resume_feedback.recommendations.formatting_tips.map((tip, index) => (
                    <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                      <span className="text-blue-500 mt-1">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tone & Language */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Tone & Language
                </h4>
                <ul className="space-y-2">
                  {reportData.resume_feedback.recommendations.tone_and_language.map((item, index) => (
                    <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                      <span className="text-purple-500 mt-1">💬</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mock Interview Performance Section */}
        <Card className="my-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#635BFF]" />
                <h3 className="text-xl font-bold text-gray-800">Mock Interview Performance</h3>
              </div>
              {mockInterviewFeedback?.overall_score > 0 && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635BFF]">{mockInterviewFeedback.overall_score}/100</div>
                  <div className="text-xs text-gray-600">Interview Score</div>
                </div>
              )}
            </div>

            {mockInterviewFeedback ? (
              <>
                {/* Interview Details */}
                {mockInterviewDetails && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
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
                  </div>
                )}

                {/* Strengths and Areas for Improvement */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Interview Strengths */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Key Strengths
                    </h4>
                    <div className="space-y-3">
                      {mockInterviewFeedback.strengths && mockInterviewFeedback.strengths.length > 0 ? (
                        mockInterviewFeedback.strengths.map((strength: string, index: number) => (
                          <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-gray-700 text-sm flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">✓</span>
                              <span>{strength}</span>
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm italic">No strengths data available</p>
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
                      {mockInterviewFeedback.areas_for_improvement && mockInterviewFeedback.areas_for_improvement.length > 0 ? (
                        mockInterviewFeedback.areas_for_improvement.map((area: string, index: number) => (
                          <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-gray-700 text-sm flex items-start gap-2">
                              <span className="text-orange-600 mt-0.5">→</span>
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
                    Complete a mock interview to get personalized feedback on your interview performance.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/candidate/candidate-dashboard')}
                  className="bg-[#635BFF] hover:bg-[#5648E8] text-white hover:cursor-pointer"
                >
                  Start Mock Interview
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        {/* <Card className="mt-6 border-0 shadow-lg bg-gradient-to-r from-[#635BFF]/10 to-purple-100/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Next Steps</h3>
            <div className="space-y-3">
              {reportData.career_guidance.next_steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#635BFF] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
     </Card>
  );
};

export default ReportPage;
