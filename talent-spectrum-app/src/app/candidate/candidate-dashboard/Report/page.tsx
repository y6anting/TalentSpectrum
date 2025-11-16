"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowUpWideNarrow
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

interface ReportPageProp {
  handleTabChangeProp?: () => void;
}

const ReportPage: React.FC<ReportPageProp> = ({ handleTabChangeProp }) => {
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

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
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
          
        // Fetch mock interview feedback - use highest score instead of latest
        try {
          const response = await fetch(`/api/mock-interview/reports/highest-score?email=${encodeURIComponent(userEmail)}`);
          if (response.ok) {
            const highestScoreReport = await response.json();
            if (highestScoreReport) {
              setMockInterviewFeedback({
                overall_score: highestScoreReport.overall_score || 0,
                strengths: highestScoreReport.strengths || [],
                areas_for_improvement: highestScoreReport.improvements || []
              });
              setMockInterviewDetails({
                position: highestScoreReport.position_title,
                interviewType: highestScoreReport.interview_type,
                positionLevel: highestScoreReport.position_level,
                questionCount: highestScoreReport.total_questions,
                date: new Date(highestScoreReport.created_at).toLocaleDateString(),
                duration: Math.round(highestScoreReport.duration_seconds / 60)
              });
            }
          }
        } catch (err) {
          console.error("Failed to fetch highest score mock interview report:", err);
          // Fallback to latest if highest score fails
          try {
            const fallbackResponse = await fetch(`/api/mock-interview/reports/latest?email=${encodeURIComponent(userEmail)}`);
            if (fallbackResponse.ok) {
              const latestReport = await fallbackResponse.json();
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
          } catch (fallbackErr) {
            console.error("Failed to fetch latest mock interview report as fallback:", fallbackErr);
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
      }

      // Resume feedback and areas for improvement - fetch from AI if resume file exists
      // Resume summary will use Candidate_Profiles data (already fetched above as profileData)
      let resumeFeedbackData: any = null;
      try {
        const resumeFile = await getResumeFile();
        if (resumeFile) {
          // Only fetch resume feedback (for areas for improvement and suitable job roles)
          // Resume summary will come from Candidate_Profiles data
          const feedbackResponse = await fetchResumeFeedback(resumeFile);
          resumeFeedbackData = feedbackResponse;
          console.log('✅ Resume feedback fetched from AI');
        }
      } catch (err) {
        console.error("Failed to fetch resume feedback from API:", err);
      }

      // Build report data:
      // 1. Resume Summary: Use Candidate_Profiles data (experience, education, skills) - already in profileData
      // 2. Resume Areas for Improvement: Use resume feedback if available, otherwise empty
      // 3. Suitable Job Roles: Use resume feedback if available
      const combinedData: ReportData = {
        resume_feedback: resumeFeedbackData?.resume_feedback || {
          overall_resume_score: 0,
          summary: "",
          strengths: [],
          areas_for_improvement: [], // Will be empty if no resume feedback
          recommendations: {
            what_to_add: [],
            what_to_remove: [],
            formatting_tips: [],
            tone_and_language: []
          }
        },
        career_guidance: resumeFeedbackData?.career_guidance || {
          suitable_job_roles: [],
          transferable_skills: [],
          next_steps: []
        },
        resume_summary: {
          // Resume summary is built from Candidate_Profiles data, not AI
          // This is just a placeholder structure
          experience: "",
          education: "",
          skills: [],
          key_achievements: []
        }
      };

      // Store in sessionStorage for caching
      sessionStorage.setItem("resumeReport", JSON.stringify(combinedData));
      setReportData(combinedData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading report:", error);
      setReportData(getMockReportData());
      setLoading(false);
    }
  }, [authSession?.user?.email]);

  // Initial load and reload when authSession changes
  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Listen for profile updates (resume upload or profile settings change)
  // Only refresh data, don't cause page navigation
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      // Prevent default behavior that might cause page refresh
      e.stopPropagation();
      console.log('Profile updated event detected, refreshing Report page data...');
      // Reload report data when profile is updated (silently, no page refresh)
      loadReportData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('profileUpdated', handleProfileUpdate, { passive: true });
      window.addEventListener('resumeUploaded', handleProfileUpdate, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('profileUpdated', handleProfileUpdate);
        window.removeEventListener('resumeUploaded', handleProfileUpdate);
      }
    };
  }, [loadReportData]);

  // Generate areas for improvement based on Candidate_Profiles data
  const generateAreasForImprovementFromProfile = (profile: any): string[] => {
    const areas: string[] = [];
    
    if (!profile) return areas;
    
    // Check experience completeness - ensure it's an array
    const experiences = Array.isArray(profile.experience) ? profile.experience : 
                       (profile.experiences && Array.isArray(profile.experiences) ? profile.experiences : []);
    if (experiences.length === 0) {
      areas.push("Add work experience to showcase your professional background and skills");
    } else {
      // Check if experience entries are complete
      const incompleteExp = experiences.find((exp: any) => 
        exp && (!exp.achievements || !exp.achievements.toString().trim() || 
        !exp.skillsToolsUsed || !exp.skillsToolsUsed.toString().trim())
      );
      if (incompleteExp) {
        areas.push("Enhance experience entries with specific achievements and skills used in each role");
      }
    }
    
    // Check education completeness - ensure it's an array
    const educations = Array.isArray(profile.education) ? profile.education : 
                      (profile.educations && Array.isArray(profile.educations) ? profile.educations : []);
    if (educations.length === 0) {
      areas.push("Add your educational background including degree, institution, and graduation year");
    } else {
      const incompleteEdu = educations.find((edu: any) => 
        edu && (!edu.fieldOfStudy || !edu.field_of_study || !edu.institution)
      );
      if (incompleteEdu) {
        areas.push("Complete education details including field of study and institution name");
      }
    }
    
    // Check skills completeness
    const hasHardSkills = profile.skills?.hardSkills && Array.isArray(profile.skills.hardSkills) && profile.skills.hardSkills.length > 0;
    const hasSoftSkills = profile.skills?.softSkills && Array.isArray(profile.skills.softSkills) && profile.skills.softSkills.length > 0;
    if (!hasHardSkills && !hasSoftSkills) {
      areas.push("Add technical and soft skills to highlight your capabilities");
    } else if (!hasHardSkills) {
      areas.push("Include technical/hard skills relevant to your target roles");
    } else if (!hasSoftSkills) {
      areas.push("Add soft skills such as communication, teamwork, and problem-solving");
    }
    
    // Check personal identifiers completeness
    if (!profile.personal_identifiers?.phoneNumber || !profile.personal_identifiers?.residentialAddress) {
      areas.push("Complete your contact information for better profile visibility");
    }
    
    // Check if profile completion is low
    if (profile.profile_completion && profile.profile_completion < 70) {
      areas.push("Complete more sections of your profile to increase your profile completion score");
    }
    
    return areas;
  };

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
        "Add quantifiable achievements and metrics to demonstrate impact",
        "Include more specific technical skills and certifications",
        "Enhance project descriptions with measurable outcomes"
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
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
          <p className="text-[#6f7a80]">Loading your report...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
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
              {/* Download Button - Same row as title, Hidden in PDF */}
              <div className="no-print">
                <Button
                  onClick={() => handleDownloadReport({
                    reportData,
                    mockInterviewFeedback,
                    mockInterviewDetails,
                    profileData
                  })}
                  style={{
                    backgroundColor: PRIMARY,
                    color: 'white',
                  }}
                  className="hover:opacity-90 flex items-center gap-2 hover:cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
              </div>
            </div>

            {/* Strengths & Needs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="px-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5" style={{ color: PRIMARY }} />
                    <h3 className="text-xl font-bold text-gray-800">Strength</h3>
                  </div>
                  <div className="space-y-1">
                    {(() => {
                      // Get strengths from neurodivergent_strengths from database
                      let strengths: string[] = [];
                      
                      // First priority: neurodivergent_strengths from profile database
                      if (profileData?.neurodivergent_strengths && Array.isArray(profileData.neurodivergent_strengths) && profileData.neurodivergent_strengths.length > 0) {
                        strengths = profileData.neurodivergent_strengths;
                        console.log('Using strengths from database (neurodivergent_strengths):', strengths);
                      }
                      // Fallback: resume feedback strengths
                      else if (reportData?.resume_feedback?.strengths && Array.isArray(reportData.resume_feedback.strengths) && reportData.resume_feedback.strengths.length > 0) {
                        strengths = reportData.resume_feedback.strengths;
                        console.log('Using strengths from resume feedback:', strengths);
                      }
                      
                      if (strengths.length === 0) {
                        console.warn('No strengths found - profileData:', profileData, 'reportData:', reportData);
                        return <p className="text-gray-500 text-sm italic">No strengths data available</p>;
                      }
                      
                      return strengths.map((strength: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="mt-1" style={{ color: PRIMARY }}>•</span>
                          <p className="text-gray-700">{strength}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="px-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5" style={{ color: PRIMARY }} />
                    <h3 className="text-xl font-bold text-gray-800">Needs</h3>
                  </div>
                  <div className="space-y-1">
                    {(() => {
                      // Get needs from environment preferences if available, otherwise use resume feedback areas for improvement
                      let needs: string[] = [];
                      
                      if (profileData?.environment) {
                        // Extract needs from environment preferences object
                        const env = profileData.environment;
                        
                        // Check if it's an array (legacy format)
                        if (Array.isArray(env)) {
                          needs = env;
                        } 
                        // Check for specific array fields
                        else if (env.preferred_environment && Array.isArray(env.preferred_environment)) {
                          needs = env.preferred_environment;
                        } else if (env.workplace_needs && Array.isArray(env.workplace_needs)) {
                          needs = env.workplace_needs;
                        } 
                        // Convert environment object fields to needs list
                        else if (typeof env === 'object' && env !== null) {
                          const envNeeds: string[] = [];
                          
                          // Extract meaningful preferences as needs
                          const preferenceFields: Record<string, string> = {
                            communicationMedium: 'Communication: ',
                            clarity: 'Clarity preference: ',
                            teamStyle: 'Team style: ',
                            presentationComfort: 'Presentation comfort: ',
                            checkIns: 'Check-ins: ',
                            jobCoach: 'Job coach: ',
                            auditory: 'Auditory preference: ',
                            visual: 'Visual preference: ',
                            workspace: 'Workspace: ',
                            workdayStructure: 'Workday structure: '
                          };
                          
                          Object.entries(env).forEach(([key, value]) => {
                            if (value && typeof value === 'string' && value.trim()) {
                              const prefix = preferenceFields[key] || '';
                              envNeeds.push(`${prefix}${value}`);
                            }
                          });
                          
                          if (envNeeds.length > 0) {
                            needs = envNeeds;
                          }
                        }
                      }
                      
                      // Fallback to resume feedback if no environment needs found
                      if (needs.length === 0) {
                        needs = reportData.resume_feedback.areas_for_improvement || [];
                      }
                      
                      if (needs.length === 0) {
                        return <p className="text-gray-500 text-sm italic">No needs data available</p>;
                      }
                      
                      return needs.slice(0, 3).map((need: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="mt-1" style={{ color: PRIMARY }}>•</span>
                          <p className="text-gray-700">{need}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resume Summary + Areas for Improvement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Resume Summary - from Candidate Profile */}
              <Card>
                <CardContent className="px-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5" style={{ color: PRIMARY }} />
                    <h3 className="text-xl font-bold text-gray-800">Resume Summary</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Check if we have any profile data at all */}
                    {(() => {
                      // Fallback data based on Resume Ahmad Fawaz bin Rahimi R02.pdf
                      const fallbackResumeData = {
                        experience: [
                          {
                            title: "CNC Programming Engineer (Mechanical)",
                            employer: "Tonasco Malaysia",
                            duration: "2019-2025"
                          },
                          {
                            title: "Project Designer & Coordinator",
                            employer: "Medi-Care Products",
                            duration: "2016"
                          },
                          {
                            title: "AI Academy Participant",
                            employer: "Gamuda AI Academy, Yayasan Gamuda",
                            duration: "2025-Present"
                          }
                        ],
                        education: [
                          {
                            level: "Degree",
                            fieldOfStudy: "Mechanical Engineering",
                            institution: "Universiti Tenaga Nasional (UNITEN)",
                            graduationYear: 2014,
                            cgpa_grade: "First Class Honours (3.6/4.0)"
                          },
                          {
                            level: "STPM / A-level / Diploma",
                            fieldOfStudy: "Mechanical Engineering",
                            institution: "Universiti Tenaga Nasional (UNITEN)",
                            graduationYear: 2010,
                            cgpa_grade: "First Class (3.97/4.0)"
                          }
                        ],
                        skills: {
                          hardSkills: ["Microsoft Excel", "Engineering Design Process", "SolidWorks", "Drafting/Technical Drawing", "SketchUp", "CNC Programming", "HyperMill", "GD&T", "PLC", "CAD/CAM"],
                          softSkills: ["Problem Solving", "Detail-oriented", "Communication", "Teamwork", "Adaptability", "Project Management", "Technical Communication"]
                        }
                      };

                      const hasExperience = Array.isArray(profileData?.experience) && profileData.experience.length > 0;
                      const hasEducation = Array.isArray(profileData?.education) && profileData.education.length > 0;
                      const hasSkills = (() => {
                        if (!profileData?.skills) return false;
                        if (Array.isArray(profileData.skills)) return profileData.skills.length > 0;
                        if (profileData.skills.hardSkills && Array.isArray(profileData.skills.hardSkills) && profileData.skills.hardSkills.length > 0) return true;
                        if (profileData.skills.softSkills && Array.isArray(profileData.skills.softSkills) && profileData.skills.softSkills.length > 0) return true;
                        if (typeof profileData.skills === 'string' && profileData.skills.trim()) return true;
                        return false;
                      })();

                      // Determine if using fallback or profile data
                      const usingFallback = !hasExperience && !hasEducation && !hasSkills;
                      
                      if (usingFallback) {
                        console.log('📋 Resume Summary: Using FALLBACK data (based on Resume Ahmad Fawaz bin Rahimi R02.pdf)');
                      } else {
                        console.log('📋 Resume Summary: Using Candidate_Profile data');
                        if (hasExperience) console.log('  ✓ Experience:', profileData.experience.length, 'entries');
                        if (hasEducation) console.log('  ✓ Education:', profileData.education.length, 'entries');
                        if (hasSkills) console.log('  ✓ Skills: Available');
                      }

                      // Show fallback if no data at all
                      if (usingFallback) {
                        // Use fallback data for display
                        const displayData = {
                          experience: fallbackResumeData.experience,
                          education: fallbackResumeData.education,
                          skills: fallbackResumeData.skills
                        };
                        
                        return (
                          <>
                            {/* Experience from fallback */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Briefcase className="w-4 h-4" style={{ color: PRIMARY }} />
                                <h4 className="font-semibold text-gray-800">Experience</h4>
                              </div>
                              <div className="space-y-2">
                                {displayData.experience.map((exp: any, index: number) => (
                                  <div key={index} className="text-gray-700 text-sm">
                                    <p className="font-medium">{exp.title || 'Position'}</p>
                                    <p className="text-gray-600">{exp.employer || ''} • {exp.duration || ''}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Education from fallback */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <GraduationCap className="w-4 h-4" style={{ color: PRIMARY }} />
                                <h4 className="font-semibold text-gray-800">Education</h4>
                              </div>
                              <div className="space-y-2">
                                {displayData.education.map((edu: any, index: number) => (
                                  <div key={index} className="text-gray-700 text-sm">
                                    <p className="font-medium">{edu.level || ''} in {edu.fieldOfStudy || ''}</p>
                                    <p className="text-gray-600">{edu.institution || ''} {edu.graduationYear ? `• ${edu.graduationYear}` : ''}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Skills from fallback */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Code className="w-4 h-4" style={{ color: PRIMARY }} />
                                <h4 className="font-semibold text-gray-800">Skills</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {[...(displayData.skills.hardSkills || []), ...(displayData.skills.softSkills || [])].slice(0, 10).map((skill: string, index: number) => (
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
                          </>
                        );
                      }

                      return (
                        <>
                          {/* Experience from profile */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Briefcase className="w-4 h-4" style={{ color: PRIMARY }} />
                              <h4 className="font-semibold text-gray-800">Experience</h4>
                            </div>
                            {hasExperience ? (
                              <div className="space-y-2">
                                {profileData.experience.slice(0, 3).map((exp: any, index: number) => (
                                  <div key={index} className="text-gray-700 text-sm">
                                    <p className="font-medium">{exp.RoleTitle || exp.roleTitle || exp.title || 'Position'}</p>
                                    <p className="text-gray-600">{exp.employer || exp.company || ''} • {exp.YearsInRole || exp.yearsInRole || exp.duration || ''}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">No experience data available</p>
                            )}
                          </div>

                          {/* Education from profile */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <GraduationCap className="w-4 h-4" style={{ color: PRIMARY }} />
                              <h4 className="font-semibold text-gray-800">Education</h4>
                            </div>
                            {hasEducation ? (
                              <div className="space-y-2">
                                {profileData.education.slice(0, 2).map((edu: any, index: number) => (
                                  <div key={index} className="text-gray-700 text-sm">
                                    <p className="font-medium">{edu.level || edu.degree || ''} in {edu.fieldOfStudy || edu.field || ''}</p>
                                    <p className="text-gray-600">{edu.institution || ''} {edu.graduationYear ? `• ${edu.graduationYear}` : ''}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">No education data available</p>
                            )}
                          </div>

                          {/* Skills from profile */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Code className="w-4 h-4" style={{ color: PRIMARY }} />
                              <h4 className="font-semibold text-gray-800">Skills</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                let skillsList: string[] = [];
                                if (profileData.skills?.hardSkills && Array.isArray(profileData.skills.hardSkills)) {
                                  skillsList = [...skillsList, ...profileData.skills.hardSkills];
                                }
                                if (profileData.skills?.softSkills && Array.isArray(profileData.skills.softSkills)) {
                                  skillsList = [...skillsList, ...profileData.skills.softSkills];
                                }
                                if (Array.isArray(profileData.skills)) {
                                  skillsList = profileData.skills;
                                }
                                if (skillsList.length === 0 && typeof profileData.skills === 'string') {
                                  skillsList = profileData.skills.split(',').map((s: string) => s.trim());
                                }
                                return skillsList.length > 0 ? (
                                  skillsList.slice(0, 10).map((skill: string, index: number) => (
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
                                  ))
                                ) : (
                                  <p className="text-gray-500 text-sm italic">No skills data available</p>
                                );
                              })()}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Areas for Improvement + Score - from Candidate Profile */}
              <Card>
                <CardContent className="px-6">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    <h3 className="text-xl font-bold text-gray-800">Resume Areas for Improvement</h3>
                  </div>

                  {/* Score Circle - SVG (PDF-safe) - Fixed rotation */}
                  <div 
                    className="mb-6 p-4 rounded-lg"
                    data-pdf-bg="#f8f5ff"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">Overall Resume Score</h4>
                        <p className="text-gray-600 text-sm">
                          {reportData.resume_feedback.summary || 
                           (profileData?.profile_completion ? 
                             `Based on your profile completeness (${profileData.profile_completion}%)` : 
                             'Based on your profile completeness and experience')}
                        </p>
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
                            strokeDasharray={`${((reportData.resume_feedback.overall_resume_score || profileData?.profile_completion || 0) / 100) * 283} 283`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-2xl font-bold" style={{ color: PRIMARY }}>
                            {reportData.resume_feedback.overall_resume_score || profileData?.profile_completion || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Areas List - from resume feedback OR generated from Candidate_Profiles */}
                  <div className="space-y-3">
                    {(() => {
                      // Priority 1: Use resume feedback areas for improvement if available
                      let areas: string[] = [];
                      
                      if (reportData?.resume_feedback?.areas_for_improvement && Array.isArray(reportData.resume_feedback.areas_for_improvement) && reportData.resume_feedback.areas_for_improvement.length > 0) {
                        areas = reportData.resume_feedback.areas_for_improvement;
                        console.log('Using areas for improvement from resume feedback:', areas);
                      } else {
                        // Priority 2: Generate areas for improvement from Candidate_Profiles data
                        areas = generateAreasForImprovementFromProfile(profileData);
                        console.log('Generated areas for improvement from Candidate_Profiles:', areas);
                      }
                      
                      // Show fallback if no areas found
                      if (areas.length === 0) {
                        return (
                          <div className="text-center py-6">
                            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-gray-500 text-sm italic">
                              No improvement areas identified. Your profile looks complete!
                            </p>
                          </div>
                        );
                      }
                      
                      return areas.map((area, index) => {
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
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Suitable Job Roles */}
            {reportData.career_guidance?.suitable_job_roles && reportData.career_guidance.suitable_job_roles.length > 0 && (
              <Card className="mb-6">
                <CardContent className="px-6">
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
            <Card>
              <CardContent className="px-6">
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
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
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
                          <Star className="w-5 h-5 text-[#635BFF] mr-2" />
                          Key Strengths
                        </h4>
                        <div className="space-y-3">
                          {mockInterviewFeedback.strengths?.length > 0 ? (
                            mockInterviewFeedback.strengths.map((strength: string, index: number) => (
                              <div key={index} className="p-4 bg-[#635BFF]/5 border border-[#635BFF]/20 rounded-xl text-gray-800">
                                <div className="flex items-start">
                                  <CheckCircle className="w-4 h-4 mr-2 mt-1 text-[#635BFF] flex-shrink-0" />
                                  <span>{strength.replace(/^[-*•\s]+/, '').replace(/[\s*•-]+$/,'')}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm italic">No strengths data available</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <ArrowUpWideNarrow className="w-5 h-5 text-red-600 mr-2" />
                          Areas to Improve
                        </h4>
                        <div className="space-y-3">
                          {mockInterviewFeedback.areas_for_improvement?.length > 0 ? (
                            mockInterviewFeedback.areas_for_improvement.map((area: string, index: number) => (
                              <div key={index} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                    <span className="text-white text-xs">{index + 1}</span>
                                  </div>
                                  <p className="text-gray-800 leading-relaxed ">{area.replace(/^\s*([0-9]+\.|[-*•])\s*/, '').replace(/[\s*•-]+$/,'')}</p>
                                </div>
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