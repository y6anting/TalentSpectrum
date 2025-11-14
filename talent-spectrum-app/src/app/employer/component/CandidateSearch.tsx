"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Users,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  Shield,
  Heart,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  SortAsc,
  SortDesc,
  Briefcase,
  ChevronDown,
  ChevronUp,
  FileText,
  GraduationCap,
  Code,
  TrendingUp,
  Award,
  ArrowUpWideNarrow,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToastHelpers } from "@/components/ui/toast";

// Priority Badge Component (same as Report tab)
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

interface JobWithApplicants {
  id: number;
  job_title: string;
  location: string;
  job_type: string;
  applicants: Applicant[];
}

interface Applicant {
  id: string;
  applicationId?: number; // Database application ID for status updates
  candidate_email: string;
  candidate_name: string;
  applied_date: string;
  status: string;
  score?: number;
  accommodations_requested: boolean;
}

export default function CandidateList() {
  // API base URL from environment variable
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const { data: session } = useSession();
  const { success, error: showError } = useToastHelpers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set());

  // Jobs with applicants
  const [jobsWithApplicants, setJobsWithApplicants] = useState<JobWithApplicants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unique applicants (deduplicated by email)
  const [uniqueApplicants, setUniqueApplicants] = useState<Map<string, Applicant>>(new Map());
  
  // View Profile Dialog state
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [candidateReportData, setCandidateReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  // Helper function to process jobs and applicants data
  const processJobsAndApplicants = (jobsData: any[], applicationsData: any[]) => {
    const jobsMap = new Map<number, JobWithApplicants>();
    const applicantsMap = new Map<string, Applicant>();

    // Initialize jobs map
    (Array.isArray(jobsData) ? jobsData : []).forEach((job: any) => {
      jobsMap.set(job.id, {
        id: job.id,
        job_title: job.job_title,
        location: job.location || "",
        job_type: job.job_type || "",
        applicants: []
      });
    });

    // Process applications and group by job
    (Array.isArray(applicationsData) ? applicationsData : []).forEach((app: any) => {
      const matchingJob = Array.from(jobsMap.values()).find(
        job => job.job_title === app.job_title
      );

      if (matchingJob) {
        let formattedDate = "";
        if (app.applied_date) {
          if (typeof app.applied_date === 'string') {
            formattedDate = app.applied_date;
          } else if (app.applied_date instanceof Date) {
            formattedDate = app.applied_date.toISOString();
          } else {
            try {
              formattedDate = new Date(app.applied_date).toISOString();
            } catch {
              formattedDate = String(app.applied_date);
            }
          }
        }
        
        const applicant: Applicant = {
          id: String(app.id || `${app.candidate_email}-${app.job_title}`),
          applicationId: app.id, // Store the database ID for status updates
          candidate_email: app.candidate_email,
          candidate_name: app.candidate_name || "Unknown",
          applied_date: formattedDate,
          status: app.status || "under_review",
          score: app.score,
          accommodations_requested: app.accommodations_requested || false,
        };

        matchingJob.applicants.push(applicant);

        // Track unique applicants (by email) - keep the first occurrence
        if (!applicantsMap.has(app.candidate_email)) {
          applicantsMap.set(app.candidate_email, applicant);
        }
      }
    });

    return {
      jobs: Array.from(jobsMap.values()),
      uniqueApplicants: applicantsMap
    };
  };

  useEffect(() => {
    const fetchJobsAndApplicants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const employerEmail = session?.user?.email;
        console.log("CandidateSearch: Fetching data for employer:", employerEmail);
        
        if (!employerEmail) {
          setError("Please sign in to view applicants");
          setIsLoading(false);
          return;
        }

        // Fetch jobs and applications in parallel
        const jobsUrl = `${API_BASE}/jobs/employer/${employerEmail}`;
        const applicationsUrl = `${API_BASE}/applications/employer/${employerEmail}`;
        
        console.log("CandidateSearch: Fetching jobs from:", jobsUrl);
        console.log("CandidateSearch: Fetching applications from:", applicationsUrl);
        
        const [jobsResponse, applicationsResponse] = await Promise.all([
          fetch(jobsUrl),
          fetch(applicationsUrl)
        ]);

        console.log("CandidateSearch: Jobs response status:", jobsResponse.status);
        console.log("CandidateSearch: Applications response status:", applicationsResponse.status);

        // Handle errors gracefully - don't show error messages to users
        if (!jobsResponse.ok) {
          const errorText = await jobsResponse.text();
          console.error("CandidateSearch: Failed to fetch jobs:", jobsResponse.status, errorText);
          // Don't throw - just log and continue with empty data
          console.log("CandidateSearch: Continuing with empty jobs data");
        }
        
        if (!applicationsResponse.ok) {
          const errorText = await applicationsResponse.text();
          console.error("CandidateSearch: Failed to fetch applications:", applicationsResponse.status, errorText);
          // Don't throw - just log and continue with empty data
          console.log("CandidateSearch: Continuing with empty applications data");
        }

        // Parse JSON only if response was OK, otherwise use empty arrays
        const jobsData = jobsResponse.ok ? await jobsResponse.json() : [];
        const applicationsData = applicationsResponse.ok ? await applicationsResponse.json() : [];

        console.log("CandidateSearch: Jobs data:", jobsData);
        console.log("CandidateSearch: Applications data:", applicationsData);
        console.log("CandidateSearch: Jobs count:", Array.isArray(jobsData) ? jobsData.length : 0);
        console.log("CandidateSearch: Applications count:", Array.isArray(applicationsData) ? applicationsData.length : 0);

        // Process jobs and applicants using helper function
        const processed = processJobsAndApplicants(jobsData, applicationsData);
        console.log("CandidateSearch: Final jobs with applicants:", processed.jobs.map(j => ({ id: j.id, title: j.job_title, applicants: j.applicants.length })));
        console.log("CandidateSearch: Final unique applicants:", processed.uniqueApplicants.size);

        setJobsWithApplicants(processed.jobs);
        setUniqueApplicants(processed.uniqueApplicants);
      } catch (err: any) {
        console.error("CandidateSearch: Error fetching data:", err);
        // Don't set error state - just log it and show empty state
        // setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session?.user?.email) {
      fetchJobsAndApplicants();
    } else {
      console.log("CandidateSearch: No session email, skipping fetch");
      setIsLoading(false);
    }
  }, [session]);

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
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMatchScoreColor = (score?: number) => {
    if (!score) return "text-gray-600";
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredJobs = jobsWithApplicants.filter((job) => {
    const matchesSearch = job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredUniqueApplicants = Array.from(uniqueApplicants.values()).filter((applicant) => {
    const matchesSearch = applicant.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.candidate_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || applicant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const toggleJobExpansion = (jobId: number) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
    } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  // Generate areas for improvement from profile (same as Report tab)
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

  // Mock report data fallback (same as Report tab)
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

  const handleViewProfile = async (candidateEmail: string) => {
    setSelectedCandidateEmail(candidateEmail);
    setShowProfileDialog(true);
    setLoadingReport(true);
    
    try {
      // Fetch all candidate report data (same as Report tab)
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

  const handleViewResume = async (candidateEmail: string) => {
    try {
      // Try to fetch candidate profile to check for resume
      const profileResponse = await fetch(`${API_BASE}/profiles/${encodeURIComponent(candidateEmail)}`);
      const profileData = profileResponse.ok ? await profileResponse.json() : null;
      
      // Check if resume file exists in uploads/resumes directory
      // For now, we'll try common resume file patterns
      // In production, you'd want to store resume URL in the database
      const possibleResumePaths = [
        `/uploads/resumes/${candidateEmail.replace('@', '_').replace('.', '_')}.pdf`,
        `/uploads/resumes/resume_${candidateEmail.split('@')[0]}.pdf`
      ];
      
      // Try to access resume file
      let resumeFound = false;
      for (const path of possibleResumePaths) {
        try {
          const testResponse = await fetch(`${API_BASE}${path}`);
          if (testResponse.ok) {
            setResumeUrl(`${API_BASE}${path}`);
            resumeFound = true;
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }
      
      if (!resumeFound && profileData) {
        // Generate resume from profile data
        // For now, open a new window with profile data formatted as resume
        const resumeWindow = window.open('', '_blank');
        if (resumeWindow) {
          const resumeHTML = generateResumeFromProfile(profileData);
          resumeWindow.document.write(resumeHTML);
          resumeWindow.document.close();
        }
        return;
      }
      
      if (resumeFound && resumeUrl) {
        setShowResumeDialog(true);
      } else {
        // Generate resume from profile
        if (profileData) {
          const resumeWindow = window.open('', '_blank');
          if (resumeWindow) {
            const resumeHTML = generateResumeFromProfile(profileData);
            resumeWindow.document.write(resumeHTML);
            resumeWindow.document.close();
          }
        }
      }
    } catch (error) {
      console.error("Error viewing resume:", error);
    }
  };

  const handleUpdateStatus = async (applicationId: string | number | undefined, newStatus: string) => {
    if (!applicationId) {
      showError("Update Failed", "No application ID provided");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const statusLabels: Record<string, string> = {
          'shortlisted': 'Shortlisted',
          'under_review': 'Under Review',
          'rejected': 'Rejected'
        };
        success("Status Updated", `Application status updated to ${statusLabels[newStatus] || newStatus}`);
        
        // Refresh the data
        const employerEmail = session?.user?.email;
        if (employerEmail) {
          const [jobsResponse, applicationsResponse] = await Promise.all([
            fetch(`${API_BASE}/jobs/employer/${employerEmail}`),
            fetch(`${API_BASE}/applications/employer/${employerEmail}`)
          ]);
          
          const jobsData = jobsResponse.ok ? await jobsResponse.json() : [];
          const applicationsData = applicationsResponse.ok ? await applicationsResponse.json() : [];
          
          // Process and update state
          const processedJobs = processJobsAndApplicants(jobsData, applicationsData);
          setJobsWithApplicants(processedJobs.jobs);
          setUniqueApplicants(processedJobs.uniqueApplicants);
        }
      } else {
        const errorText = await response.text();
        let errorMessage = "Failed to update application status";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        showError("Update Failed", errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while updating status";
      showError("Update Failed", errorMessage);
    }
  };

  const generateResumeFromProfile = (profile: any): string => {
    const name = profile.name || profile.personal_identifiers?.fullName || 'Candidate';
    const email = profile.candidate_email || profile.personal_identifiers?.emailAddress || '';
    const phone = profile.personal_identifiers?.phoneNumber || '';
    const address = profile.personal_identifiers?.residentialAddress || '';
    
    const experiences = Array.isArray(profile.experience) ? profile.experience : [];
    const educations = Array.isArray(profile.education) ? profile.education : [];
    const hardSkills = profile.skills?.hardSkills || [];
    const softSkills = profile.skills?.softSkills || [];
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${name} - Resume</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #635bff; padding-bottom: 10px; }
          h2 { color: #635bff; margin-top: 30px; }
          .section { margin-bottom: 25px; }
          .experience-item, .education-item { margin-bottom: 15px; }
          .skills { display: flex; flex-wrap: wrap; gap: 10px; }
          .skill-tag { background: #635bff; color: white; padding: 5px 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>${name}</h1>
        <p>${email}${phone ? ` | ${phone}` : ''}${address ? ` | ${address}` : ''}</p>
        
        ${experiences.length > 0 ? `
        <div class="section">
          <h2>Experience</h2>
          ${experiences.map((exp: any) => `
            <div class="experience-item">
              <strong>${exp.RoleTitle || exp.roleTitle || exp.title || 'Position'}</strong>
              ${exp.employer || exp.company ? ` at ${exp.employer || exp.company}` : ''}
              ${exp.YearsInRole || exp.yearsInRole || exp.duration ? ` (${exp.YearsInRole || exp.yearsInRole || exp.duration})` : ''}
              ${exp.Achievements ? `<p>${exp.Achievements}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${educations.length > 0 ? `
        <div class="section">
          <h2>Education</h2>
          ${educations.map((edu: any) => `
            <div class="education-item">
              <strong>${edu.level || edu.degree || ''}</strong> in ${edu.fieldOfStudy || edu.field || ''}
              ${edu.institution ? ` - ${edu.institution}` : ''}
              ${edu.graduationYear ? ` (${edu.graduationYear})` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${(hardSkills.length > 0 || softSkills.length > 0) ? `
        <div class="section">
          <h2>Skills</h2>
          <div class="skills">
            ${[...hardSkills, ...softSkills].map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        {/* <h1 className="text-2xl font-bold text-[#3a4043] mb-4">Search Applicants</h1> */}

        {/* Search and Filters */}
        <Card className="mb-3">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                  <Input
                    placeholder="Search by job title, location, candidate name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="score">Best Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCandidates.length > 0 && (
              <div className="mt-4 p-4 bg-[#635bff]/5 border border-[#635bff]/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#635bff] font-medium">
                    {selectedCandidates.length} candidate(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button size="sm" variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 ml-2">
          {isLoading && <p className="text-[#6f7a80]">Loading...</p>}
          {!isLoading && (
            <p className="text-[#6f7a80] text-sm">
              {filteredJobs.length === 0 && filteredUniqueApplicants.length === 0 
                ? "No jobs or applicants found. Post jobs to start receiving applications."
                : `Showing ${filteredUniqueApplicants.length} unique applicant(s) across ${filteredJobs.length} job(s)`
              }
            </p>
          )}
        </div>

        {/* Jobs with Applicants - Two columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.length === 0 && !isLoading && (
            <Card className="lg:col-span-2">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#3a4043] mb-2">No Jobs Posted Yet</h3>
                <p className="text-[#6f7a80]">
                  Post jobs to start receiving applications from candidates.
                </p>
              </CardContent>
            </Card>
          )}
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.job_title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-[#6f7a80]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.job_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm">
                        {job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleJobExpansion(job.id)}
                        className="hover:bg-gray-100 cursor-pointer"
                      >
                        {expandedJobs.has(job.id) ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Hide Applicants
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show Applicants
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedJobs.has(job.id) && (
                  <CardContent>
                    {job.applicants.length === 0 ? (
                      <p className="text-[#6f7a80] text-sm text-center py-4">No applicants for this job yet</p>
                    ) : (
                      <div className="space-y-3">
                        {job.applicants.map((applicant) => (
                          <Card key={applicant.id} className="bg-gray-50">
                            <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                                      checked={selectedCandidates.includes(applicant.candidate_email)}
                                      onChange={() => handleSelectCandidate(applicant.candidate_email)}
                          className="mt-1"
                        />
                                    <h4 className="font-semibold text-[#3a4043]">{applicant.candidate_name}</h4>
                                    {getStatusBadge(applicant.status)}
                                    {applicant.score && (
                                      <div className={`text-sm font-medium ${getMatchScoreColor(applicant.score)}`}>
                                        {applicant.score}% match
                              </div>
                            )}
                          </div>
                                  <p className="text-sm text-[#6f7a80] mb-2">{applicant.candidate_email}</p>
                                  <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                            <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Applied: {new Date(applicant.applied_date).toLocaleDateString()}
                            </span>
                          </div>
                            </div>
                                <div className="flex flex-col gap-2 ml-4">
                                  <Button 
                                    size="sm" 
                                    className="bg-[#635bff] hover:bg-[#524aff] text-white cursor-pointer"
                                    onClick={() => handleViewProfile(applicant.candidate_email)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Profile
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleViewResume(applicant.candidate_email)}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Resume
                                  </Button>
                                  <Select
                                    value={applicant.status || 'under_review'}
                                    onValueChange={(value) => handleUpdateStatus(applicant.applicationId || applicant.id, value)}
                                  >
                                    <SelectTrigger className="w-full text-xs h-8">
                                      <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="under_review">Under Review</SelectItem>
                                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                          </div>
                            </div>
                            </CardContent>
                          </Card>
                              ))}
                            </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
                          </div>

        {/* Unique Applicants List */}
        {filteredUniqueApplicants.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-[#3a4043] mb-4">All Unique Applicants ({filteredUniqueApplicants.length})</h2>
            <div className="space-y-4">
              {filteredUniqueApplicants.map((applicant, index) => (
                <motion.div
                  key={applicant.candidate_email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.includes(applicant.candidate_email)}
                              onChange={() => handleSelectCandidate(applicant.candidate_email)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-[#3a4043]">{applicant.candidate_name}</h3>
                                {getStatusBadge(applicant.status)}
                                {applicant.score && (
                                  <div className={`text-sm font-medium ${getMatchScoreColor(applicant.score)}`}>
                                    {applicant.score}% match
                            </div>
                          )}
                            </div>
                              <p className="text-[#635bff] font-medium mb-2">{applicant.candidate_email}</p>
                              <div className="flex items-center gap-4 text-sm text-[#6f7a80]">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Applied: {new Date(applicant.applied_date).toLocaleDateString()}
                                </span>
                            </div>
                            </div>
                            </div>
                          </div>
                    <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            size="sm" 
                            className="bg-[#635bff] hover:bg-[#524aff] text-white cursor-pointer"
                            onClick={() => handleViewProfile(applicant.candidate_email)}
                          >
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewResume(applicant.candidate_email)}
                          >
                        <Download className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                          <Select
                            value={applicant.status || 'under_review'}
                            onValueChange={(value) => handleUpdateStatus(applicant.applicationId || applicant.id, value)}
                          >
                            <SelectTrigger className="w-full text-xs h-8">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
          </div>
        )}

        {/* No Results */}
        {filteredJobs.length === 0 && filteredUniqueApplicants.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-[#6f7a80] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#3a4043] mb-2">No results found</h3>
              <p className="text-[#6f7a80] mb-4">
                Try adjusting your search criteria or filters to find more results.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="cursor-pointer"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* View Profile Dialog - Full Candidate Report */}
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="max-w-[98vw] w-[98vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Candidate Feedback Report</DialogTitle>
              <DialogDescription>
                {selectedCandidateEmail && `Comprehensive analysis for ${candidateReportData?.profile?.name || selectedCandidateEmail}`}
              </DialogDescription>
            </DialogHeader>
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

                {/* Resume Summary */}
                {candidateReportData.profile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#635bff]" />
                        Resume Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Experience */}
                        {Array.isArray(candidateReportData.profile.experience) && candidateReportData.profile.experience.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-[#635bff]" />
                              Experience
                            </h4>
                            <div className="space-y-2">
                              {candidateReportData.profile.experience.slice(0, 3).map((exp: any, index: number) => (
                                <div key={index} className="text-gray-700 text-sm">
                                  <p className="font-medium">{exp.RoleTitle || exp.roleTitle || exp.title || 'Position'}</p>
                                  <p className="text-gray-600">{exp.employer || exp.company || ''} • {exp.YearsInRole || exp.yearsInRole || exp.duration || ''}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {Array.isArray(candidateReportData.profile.education) && candidateReportData.profile.education.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-[#635bff]" />
                              Education
                            </h4>
                            <div className="space-y-2">
                              {candidateReportData.profile.education.slice(0, 2).map((edu: any, index: number) => (
                                <div key={index} className="text-gray-700 text-sm">
                                  <p className="font-medium">{edu.level || edu.degree || ''} in {edu.fieldOfStudy || edu.field || ''}</p>
                                  <p className="text-gray-600">{edu.institution || ''} {edu.graduationYear ? `• ${edu.graduationYear}` : ''}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills */}
                        {(() => {
                          const skills = candidateReportData.profile.skills;
                          const hardSkills = skills?.hardSkills || (Array.isArray(skills) ? skills : []);
                          const softSkills = skills?.softSkills || [];
                          const allSkills = [...(Array.isArray(hardSkills) ? hardSkills : []), ...(Array.isArray(softSkills) ? softSkills : [])];
                          
                          if (allSkills.length > 0) {
                            return (
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                  <Code className="w-4 h-4 text-[#635bff]" />
                                  Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {allSkills.slice(0, 10).map((skill: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 rounded-full text-xs font-medium bg-[#635bff]/10 text-[#635bff]"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Resume Summary + Areas for Improvement */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Resume Summary - from Candidate Profile */}
                  {candidateReportData.profile && (
                    <Card>
                      <CardContent className="px-6">
                        <div className="flex items-center gap-2 mb-6">
                          <FileText className="w-5 h-5" style={{ color: "rgb(99, 91, 255)" }} />
                          <h3 className="text-xl font-bold text-gray-800">Resume Summary</h3>
                        </div>

                        <div className="space-y-6">
                          {/* Fallback data */}
                          {(() => {
                            const fallbackResumeData = {
                              experience: [
                                { title: "CNC Programming Engineer (Mechanical)", employer: "Tonasco Malaysia", duration: "2019-2025" },
                                { title: "Project Designer & Coordinator", employer: "Medi-Care Products", duration: "2016" },
                                { title: "AI Academy Participant", employer: "Gamuda AI Academy, Yayasan Gamuda", duration: "2025-Present" }
                              ],
                              education: [
                                { level: "Degree", fieldOfStudy: "Mechanical Engineering", institution: "Universiti Tenaga Nasional (UNITEN)", graduationYear: 2014, cgpa_grade: "First Class Honours (3.6/4.0)" },
                                { level: "STPM / A-level / Diploma", fieldOfStudy: "Mechanical Engineering", institution: "Universiti Tenaga Nasional (UNITEN)", graduationYear: 2010, cgpa_grade: "First Class (3.97/4.0)" }
                              ],
                              skills: {
                                hardSkills: ["Microsoft Excel", "Engineering Design Process", "SolidWorks", "Drafting/Technical Drawing", "SketchUp", "CNC Programming", "HyperMill", "GD&T", "PLC", "CAD/CAM"],
                                softSkills: ["Problem Solving", "Detail-oriented", "Communication", "Teamwork", "Adaptability", "Project Management", "Technical Communication"]
                              }
                            };

                            const profile = candidateReportData.profile;
                            const hasExperience = Array.isArray(profile?.experience) && profile.experience.length > 0;
                            const hasEducation = Array.isArray(profile?.education) && profile.education.length > 0;
                            const hasSkills = (() => {
                              if (!profile?.skills) return false;
                              if (Array.isArray(profile.skills)) return profile.skills.length > 0;
                              if (profile.skills.hardSkills && Array.isArray(profile.skills.hardSkills) && profile.skills.hardSkills.length > 0) return true;
                              if (profile.skills.softSkills && Array.isArray(profile.skills.softSkills) && profile.skills.softSkills.length > 0) return true;
                              return false;
                            })();

                            const usingFallback = !hasExperience && !hasEducation && !hasSkills;
                            const displayData = usingFallback ? fallbackResumeData : profile;

                            return (
                              <>
                                {/* Experience */}
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Briefcase className="w-4 h-4" style={{ color: "rgb(99, 91, 255)" }} />
                                    <h4 className="font-semibold text-gray-800">Experience</h4>
                                  </div>
                                  {usingFallback ? (
                                    <div className="space-y-2">
                                      {displayData.experience.map((exp: any, index: number) => (
                                        <div key={index} className="text-gray-700 text-sm">
                                          <p className="font-medium">{exp.title || 'Position'}</p>
                                          <p className="text-gray-600">{exp.employer || ''} • {exp.duration || ''}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : hasExperience ? (
                                    <div className="space-y-2">
                                      {profile.experience.slice(0, 3).map((exp: any, index: number) => (
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
                                  {usingFallback ? (
                                    <div className="space-y-2">
                                      {displayData.education.map((edu: any, index: number) => (
                                        <div key={index} className="text-gray-700 text-sm">
                                          <p className="font-medium">{edu.level || ''} in {edu.fieldOfStudy || ''}</p>
                                          <p className="text-gray-600">{edu.institution || ''} {edu.graduationYear ? `• ${edu.graduationYear}` : ''}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : hasEducation ? (
                                    <div className="space-y-2">
                                      {profile.education.slice(0, 2).map((edu: any, index: number) => (
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
                                      const skills = usingFallback ? displayData.skills : profile.skills;
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
                              </>
                            );
                          })()}
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

                {/* Suitable Job Roles */}
                {candidateReportData.resumeFeedback?.career_guidance?.suitable_job_roles && Array.isArray(candidateReportData.resumeFeedback.career_guidance.suitable_job_roles) && candidateReportData.resumeFeedback.career_guidance.suitable_job_roles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#635bff]" />
                        Suitable Job Roles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {candidateReportData.resumeFeedback.career_guidance.suitable_job_roles.map((role: any, index: number) => (
                          <div key={index} className="border-l-4 border-[#635bff] pl-4">
                            <p className="font-semibold text-gray-800">{role.role || role}</p>
                            {role.reason && <p className="text-sm text-gray-600 mt-1">{role.reason}</p>}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <p className="text-[#6f7a80] text-center py-8">
                Unable to load candidate report data.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
