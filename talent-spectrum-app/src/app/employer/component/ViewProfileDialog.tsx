"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { 
  FileText, 
  Star, 
  AlertCircle, 
  Briefcase, 
  GraduationCap, 
  Code,
  TrendingUp,
  Award,
  ArrowUpWideNarrow,
  CheckCircle,
  Clock,
  X
} from "lucide-react";

interface ViewProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateEmail: string | null;
  API_BASE: string;
}

// Priority Badge Component
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

// Generate areas for improvement from profile
const generateAreasForImprovementFromProfile = (profile: any): string[] => {
  const areas: string[] = [];
  if (!profile) return areas;
  
  const experiences = Array.isArray(profile.experience) ? profile.experience : 
                     (profile.experiences && Array.isArray(profile.experiences) ? profile.experiences : []);
  if (experiences.length === 0) {
    areas.push("Add work experience to showcase your professional background and skills");
  } else {
    const incompleteExp = experiences.find((exp: any) => 
      exp && (!exp.achievements || !exp.achievements.toString().trim() || 
      !exp.skillsToolsUsed || !exp.skillsToolsUsed.toString().trim())
    );
    if (incompleteExp) {
      areas.push("Enhance experience entries with specific achievements and skills used in each role");
    }
  }
  
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
  
  const hasHardSkills = profile.skills?.hardSkills && Array.isArray(profile.skills.hardSkills) && profile.skills.hardSkills.length > 0;
  const hasSoftSkills = profile.skills?.softSkills && Array.isArray(profile.skills.softSkills) && profile.skills.softSkills.length > 0;
  if (!hasHardSkills && !hasSoftSkills) {
    areas.push("Add technical and soft skills to highlight your capabilities");
  } else if (!hasHardSkills) {
    areas.push("Include technical/hard skills relevant to your target roles");
  } else if (!hasSoftSkills) {
    areas.push("Add soft skills such as communication, teamwork, and problem-solving");
  }
  
  if (!profile.personal_identifiers?.phoneNumber || !profile.personal_identifiers?.residentialAddress) {
    areas.push("Complete your contact information for better profile visibility");
  }
  
  if (profile.profile_completion && profile.profile_completion < 70) {
    areas.push("Complete more sections of your profile to increase your profile completion score");
  }
  
  return areas;
};

// Mock report data fallback
const getMockReportData = () => ({
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
});

export default function ViewProfileDialog({
  open,
  onOpenChange,
  candidateEmail,
  API_BASE,
}: ViewProfileDialogProps) {
  const [candidateReportData, setCandidateReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (open && candidateEmail) {
      const fetchProfile = async () => {
        setLoadingReport(true);
        try {
          // Fetch all candidate report data (same as CandidateSearch)
          const [profileResponse, mockInterviewResponse] = await Promise.all([
            fetch(`${API_BASE}/profiles/${encodeURIComponent(candidateEmail)}`),
            fetch(`/api/mock-interview/reports/highest-score?email=${encodeURIComponent(candidateEmail)}`)
          ]);
          
          const profileData = profileResponse.ok ? await profileResponse.json() : null;
          const mockInterviewData = mockInterviewResponse.ok ? await mockInterviewResponse.json() : null;
          
          // Build report data with mock fallback
          const mockData = getMockReportData();
          const reportData = {
            profile: profileData,
            mockInterview: mockInterviewData,
            resumeFeedback: {
              resume_feedback: {
                ...mockData.resume_feedback,
                // Override with generated areas if profile exists
                areas_for_improvement: profileData ? generateAreasForImprovementFromProfile(profileData) : mockData.resume_feedback.areas_for_improvement
              },
              career_guidance: mockData.career_guidance
            }
          };
          
          setCandidateReportData(reportData);
        } catch (error) {
          console.error("Error fetching candidate report:", error);
          // Use mock data on error
          const mockData = getMockReportData();
          setCandidateReportData({
            profile: null,
            mockInterview: null,
            resumeFeedback: {
              resume_feedback: mockData.resume_feedback,
              career_guidance: mockData.career_guidance
            }
          });
        } finally {
          setLoadingReport(false);
        }
      };

      fetchProfile();
    }
  }, [open, candidateEmail, API_BASE]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-[70vw] max-h-[95vh] overflow-hidden flex flex-col z-[100000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-[#3a4043]">Candidate Feedback Report</h2>
            <p className="text-sm text-gray-600 mt-1">
              {candidateEmail && `Comprehensive analysis for ${candidateReportData?.profile?.name || candidateEmail}`}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingReport ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
              <p className="text-[#6f7a80]">Loading candidate report...</p>
            </div>
          ) : candidateReportData ? (
            <div className="space-y-6">
            {/* Strengths & Needs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card>
                <CardContent className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-[#635bff]" />
                    <h3 className="text-xl font-bold text-gray-800">Strengths</h3>
                  </div>
                  <div className="space-y-1">
                    {(() => {
                      const profile = candidateReportData.profile;
                      let strengths: string[] = [];
                      
                      if (profile?.neurodivergent_strengths && Array.isArray(profile.neurodivergent_strengths) && profile.neurodivergent_strengths.length > 0) {
                        strengths = profile.neurodivergent_strengths;
                      } else if (candidateReportData.resumeFeedback?.resume_feedback?.strengths && Array.isArray(candidateReportData.resumeFeedback.resume_feedback.strengths)) {
                        strengths = candidateReportData.resumeFeedback.resume_feedback.strengths;
                      }
                      
                      if (strengths.length === 0) {
                        return <p className="text-gray-500 text-sm italic">No strengths data available</p>;
                      }
                      
                      return strengths.map((strength: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="mt-1 text-[#635bff]">•</span>
                          <p className="text-gray-700">{strength}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Needs */}
              <Card>
                <CardContent className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-[#635bff]" />
                    <h3 className="text-xl font-bold text-gray-800">Needs</h3>
                  </div>
                  <div className="space-y-1">
                    {(() => {
                      const profile = candidateReportData.profile;
                      let needs: string[] = [];
                      
                      if (profile?.environment) {
                        const env = profile.environment;
                        if (Array.isArray(env)) {
                          needs = env;
                        } else if (env.preferred_environment && Array.isArray(env.preferred_environment)) {
                          needs = env.preferred_environment;
                        } else if (typeof env === 'object' && env !== null) {
                          const envNeeds: string[] = [];
                          Object.entries(env).forEach(([key, value]) => {
                            if (value && typeof value === 'string' && value.trim()) {
                              envNeeds.push(`${key}: ${value}`);
                            }
                          });
                          if (envNeeds.length > 0) needs = envNeeds;
                        }
                      }
                      
                      if (needs.length === 0 && candidateReportData.resumeFeedback?.resume_feedback?.areas_for_improvement) {
                        needs = candidateReportData.resumeFeedback.resume_feedback.areas_for_improvement;
                      }
                      
                      if (needs.length === 0) {
                        return <p className="text-gray-500 text-sm italic">No needs data available</p>;
                      }
                      
                      return needs.slice(0, 5).map((need: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="mt-1 text-[#635bff]">•</span>
                          <p className="text-gray-700">{need}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resume Summary + Areas for Improvement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resume Summary */}
              {candidateReportData.profile && (
                <Card>
                  <CardContent className="px-6">
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="w-5 h-5" style={{ color: "rgb(99, 91, 255)" }} />
                      <h3 className="text-xl font-bold text-gray-800">Resume Summary</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Experience */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="w-4 h-4" style={{ color: "rgb(99, 91, 255)" }} />
                          <h4 className="font-semibold text-gray-800">Experience</h4>
                        </div>
                        {Array.isArray(candidateReportData.profile.experience) && candidateReportData.profile.experience.length > 0 ? (
                          <div className="space-y-2">
                            {candidateReportData.profile.experience.slice(0, 3).map((exp: any, index: number) => (
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

                      {/* Education */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-4 h-4" style={{ color: "rgb(99, 91, 255)" }} />
                          <h4 className="font-semibold text-gray-800">Education</h4>
                        </div>
                        {Array.isArray(candidateReportData.profile.education) && candidateReportData.profile.education.length > 0 ? (
                          <div className="space-y-2">
                            {candidateReportData.profile.education.slice(0, 2).map((edu: any, index: number) => (
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

                      {/* Skills */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-4 h-4" style={{ color: "rgb(99, 91, 255)" }} />
                          <h4 className="font-semibold text-gray-800">Skills</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const skills = candidateReportData.profile.skills;
                            const hardSkills = skills?.hardSkills || (Array.isArray(skills) ? skills : []);
                            const softSkills = skills?.softSkills || [];
                            const allSkills = [...(Array.isArray(hardSkills) ? hardSkills : []), ...(Array.isArray(softSkills) ? softSkills : [])];
                            
                            return allSkills.length > 0 ? (
                              allSkills.slice(0, 10).map((skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: "rgba(99, 91, 255, 0.1)",
                                    color: "rgb(99, 91, 255)",
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
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Areas for Improvement + Score */}
              <Card>
                <CardContent className="px-6">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    <h3 className="text-xl font-bold text-gray-800">Resume Areas for Improvement</h3>
                  </div>

                  {/* Score Circle */}
                  <div className="mb-6 p-4 rounded-lg bg-[#f8f5ff]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">Overall Resume Score</h4>
                        <p className="text-gray-600 text-sm">
                          {candidateReportData.resumeFeedback?.resume_feedback?.summary || 
                           (candidateReportData.profile?.profile_completion ? 
                             `Based on profile completeness (${candidateReportData.profile.profile_completion}%)` : 
                             'Based on profile completeness and experience')}
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
                            stroke="rgb(99, 91, 255)"
                            strokeWidth="10"
                            strokeDasharray={`${((candidateReportData.resumeFeedback?.resume_feedback?.overall_resume_score || candidateReportData.profile?.profile_completion || 0) / 100) * 283} 283`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-2xl font-bold" style={{ color: "rgb(99, 91, 255)" }}>
                            {candidateReportData.resumeFeedback?.resume_feedback?.overall_resume_score || candidateReportData.profile?.profile_completion || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Areas List */}
                  <div className="space-y-3">
                    {(() => {
                      const profile = candidateReportData.profile;
                      let areas: string[] = [];
                      
                      if (candidateReportData.resumeFeedback?.resume_feedback?.areas_for_improvement && Array.isArray(candidateReportData.resumeFeedback.resume_feedback.areas_for_improvement) && candidateReportData.resumeFeedback.resume_feedback.areas_for_improvement.length > 0) {
                        areas = candidateReportData.resumeFeedback.resume_feedback.areas_for_improvement;
                      } else if (profile) {
                        areas = generateAreasForImprovementFromProfile(profile);
                      }
                      
                      if (areas.length === 0) {
                        return (
                          <div className="text-center py-6">
                            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-gray-500 text-sm italic">
                              No improvement areas identified. Profile looks complete!
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
            {candidateReportData.resumeFeedback?.career_guidance?.suitable_job_roles && Array.isArray(candidateReportData.resumeFeedback.career_guidance.suitable_job_roles) && candidateReportData.resumeFeedback.career_guidance.suitable_job_roles.length > 0 && (
              <Card>
                <CardContent className="px-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Briefcase className="w-5 h-5" style={{ color: "rgb(99, 91, 255)" }} />
                    <h3 className="text-xl font-bold text-gray-800">You Are Suitable to Work As</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {candidateReportData.resumeFeedback.career_guidance.suitable_job_roles.map((job: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        style={{
                          borderColor: "rgba(99, 91, 255, 0.2)",
                          backgroundColor: "rgba(99, 91, 255, 0.05)",
                        }}
                      >
                        <h4 className="font-semibold mb-2" style={{ color: "rgb(99, 91, 255)" }}>{job.role}</h4>
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
                    <Star className="w-5 h-5" style={{ color: "rgb(99, 91, 255)" }} />
                    <h3 className="text-xl font-bold text-gray-800">Mock Interview Performance</h3>
                  </div>
                  {candidateReportData.mockInterview?.overall_score > 0 && (
                    <div className="text-center">
                      <div className="text-3xl font-bold" style={{ color: "rgb(99, 91, 255)" }}>{candidateReportData.mockInterview.overall_score}/100</div>
                      <div className="text-xs text-gray-600">Interview Score</div>
                    </div>
                  )}
                </div>

                {candidateReportData.mockInterview ? (
                  <>
                    {candidateReportData.mockInterview.position_title && (
                      <div 
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                      >
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Position</div>
                          <div className="font-semibold text-gray-800">{candidateReportData.mockInterview.position_title}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Interview Type</div>
                          <div className="font-semibold text-gray-800 capitalize">{candidateReportData.mockInterview.interview_type || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Position Level</div>
                          <div className="font-semibold text-gray-800 capitalize">{candidateReportData.mockInterview.position_level || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Questions Answered</div>
                          <div className="font-semibold text-gray-800">{candidateReportData.mockInterview.total_questions || 0}</div>
                        </div>
                        {candidateReportData.mockInterview.created_at && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Completed On
                            </div>
                            <div className="font-semibold text-gray-800">{new Date(candidateReportData.mockInterview.created_at).toLocaleDateString()}</div>
                            {candidateReportData.mockInterview.duration_seconds && (
                              <div className="text-xs text-gray-500 mt-0.5">{Math.round(candidateReportData.mockInterview.duration_seconds / 60)} min</div>
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
                          {candidateReportData.mockInterview.strengths?.length > 0 ? (
                            candidateReportData.mockInterview.strengths.map((strength: string, index: number) => (
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
                          {candidateReportData.mockInterview.improvements?.length > 0 ? (
                            candidateReportData.mockInterview.improvements.map((area: string, index: number) => (
                              <div key={index} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                    <span className="text-white text-xs">{index + 1}</span>
                                  </div>
                                  <p className="text-gray-800 leading-relaxed">{area.replace(/^\s*([0-9]+\.|[-*•])\s*/, '').replace(/[\s*•-]+$/,'')}</p>
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
                        Candidate has not completed a mock interview yet.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          ) : (
            <p className="text-[#6f7a80] text-center py-8">
              Unable to load candidate report data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
