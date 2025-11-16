// talent-spectrum-app/src/app/employer/employer-dashboard/pages.tsx
"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react"; // Added useRef, ChangeEvent
import { Button } from "@/app/components/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog"; // Import confirm dialog
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import {
  Building,
  Users,
  Edit,
  Trash2,
  FileText,
  Camera,
  Clock,
  CheckCircle,
  MapPin,
  DollarSign,
  Settings,
  Shield,
  Star,
  BarChart3,
  Calculator,
  Briefcase,
  XCircle,
  Calendar,
  Search,
  SquarePen, // Added SquarePen icon, 
  BotMessageSquare,
  Filter,
  SortAsc,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import { calculateEmployerCosts } from "@/app/employer/component/taxCalculator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/select";
import EditJobModal from "@/app/employer/component/EditJobModal";
import CandidateList from "@/app/employer/component/CandidateSearch";
import AllCandidates from "@/app/employer/component/AllCandidates";
import MatchedCandidates from "@/app/employer/component/MatchedCandidates";
import ApplicantCard from "@/app/employer/component/ApplicantCard";
import JobViewModeButtons, { ViewMode } from "@/app/employer/component/JobViewModeButtons";
import ViewProfileDialog from "@/app/employer/component/ViewProfileDialog";
import ResumeDialog from "@/app/employer/component/ResumeDialog";
import EmployerOverview from "@/app/employer/component/EmployerOverview";
import ShortlistedApplicants from "@/app/employer/component/ShortlistedApplicants";
import { useToastHelpers } from "@/components/ui/toast";
import PostJob from "@/app/employer/post-job/page"; 
import { Input } from "@/app/components/input"; 
import * as ChatBot from "@/app/chat-bot";

const SALARY_RANGES = [
  "Below RM 3,000",
  "RM 3,000 - RM 5,000",
  "RM 5,001 - RM 8,000",
  "RM 8,001 - RM 12,000",
  "RM 12,001 - RM 18,000",
  "RM 18,001 - RM 25,000",
  "Above RM 25,000",
];

export type JobPosting = {
  id: number;
  employer_email: string;
  job_title: string;
  job_type: string;
  work_mode: string;
  experience_level: string;
  location: string;
  salary_range: number;
  job_summary: string;
  job_requirements?: string;
  soft_skills?: string;
  status?: string; // active, draft, closed, expired
  created_at?: string; // ISO date string
  application_deadline?: string; // ISO date string
  flexible_work_hour: boolean;
  sensory_friendly_environment: boolean;
  peer_support_system: boolean;
  dedicated_workspace: boolean;
  neurodiversity_awareness_training: boolean;
  regular_supervisor_check_in: boolean;
  zero_tolerance_bullying_mobbing_policy: boolean;
  augmentative_alternative_communication: boolean;
  quiet_room: boolean;
  sensory_aids: boolean;
  provide_visual_guidance: boolean;
  uses_project_management_tools: boolean;
  optional_social_event: boolean;
  mental_health_support: boolean;
  near_public_transport: boolean;
};

export type CompanyProfile = {
  id: number;
  email: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  employees: string;
  size: string;
  inclusion_score: number;
  certifications: string;
  description: string;
  founded_year: number;
  company_type: string;
  neurodivergent_friendly: boolean;
  workplace_accommodations: boolean;
  equal_opportunity: boolean;
  accessible_recruitment: boolean;
  logo_url?: string | null;  // Added logo_url field
};

// Matched Candidate Types
type EnvironmentPreference = {
  patternRecognition: string;
  attention: string;
  systematicThinking: string;
  bigVsDetail: string;
  taskSwitching: string;
  hyperfocus: string;
  communicationMedium: string;
  clarity: string;
  teamStyle: string;
  presentationComfort: string;
  checkIns: string;
  jobCoach: string;
  auditory: string;
  visual: string;
  workspace: string;
  workdayStructure: string;
};

type CandidateProfileSummary = {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  accommodations: string[];
  preferences: {
    workType: string;
    communication: string;
    schedule: string;
  };
  experienceSummary: string;
  educationSummary: string;
  environment: EnvironmentPreference;
};

interface MatchBreakdown {
  percentage: number;
  comments: string;
  matchedPoints: string[];
  mismatchedPoints?: string[];
  aiRecommendation?: string;
}

interface MatchedCandidate {
  id: string;
  candidateId: string;
  jobTitle: string;
  overallMatchPercentage: number;
  candidateSummary: CandidateProfileSummary;
  primaryMatch: MatchBreakdown;
  secondaryMatch: MatchBreakdown;
  tertiaryMatch: MatchBreakdown;
}

export default function EmployerDashboard() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  
  const { success, error: showError, warning, info } = useToastHelpers();
  
  const { showConfirm } = useConfirmDialog();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [currentEmployerEmail, setCurrentEmployerEmail] = useState<string>("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null); // State for company logo URL

  // Job posting states
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editJobData, setEditJobData] = useState<Partial<JobPosting>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedJobForApplicants, setSelectedJobForApplicants] =
    useState<JobPosting | null>(null);

  // Matched candidates states
  const [shortlistedCandidates, setShortlistedCandidates] = useState<any[]>([]);
  const [totalCandidates, setTotalCandidates] = useState<number>(0);
  
  // Recent applicants for overview (all applicants, not just shortlisted)
  const [recentApplicants, setRecentApplicants] = useState<any[]>([]);

  // Search states for filtering
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [applicantSearchTerm, setApplicantSearchTerm] = useState("");
  const [applicantSortBy, setApplicantSortBy] = useState("recent"); // Sort for Job Postings Applicants tab
  
  // Filter states for Job Postings
  const [jobFilterStatus, setJobFilterStatus] = useState("all");
  
  // Filter states for Shortlisted Applicants
  const [applicantFilterStatus, setApplicantFilterStatus] = useState("all");
  const [shortlistedApplicantSortBy, setShortlistedApplicantSortBy] = useState("recent");

  // View mode for job details (description, applicants, matched) - per job ID
  const [jobViewModes, setJobViewModes] = useState<Map<number, ViewMode>>(new Map());
  
  // Applicants for selected job
  const [jobApplicants, setJobApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantCurrentPage, setApplicantCurrentPage] = useState(1);
  const applicantItemsPerPage = 10;
  
  // View Profile Dialog state
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  // Calculator
  const [baseSalary, setBaseSalary] = useState<number>(10000);

  const [selectedSort, setSelectedSort] = useState("Newest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // State for AI matching
  const [isRunningAiMatch, setIsRunningAiMatch] = useState(false);

  const result = calculateEmployerCosts(baseSalary || 0);

  // Ensure latest jobs appear on top (descending by id as proxy for recency)
  const sortJobsByLatest = (jobs: JobPosting[]) => {
    return [...jobs].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  };

  const getStatusBadge = (status: string) => {
    const badgeStyles: { [key: string]: string } = {
      active: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      closed: "bg-red-100 text-red-800",
      under_review: "bg-yellow-100 text-yellow-800",
      interview_scheduled: "bg-blue-100 text-blue-800",
      interview_accepted: "bg-green-100 text-green-800",
      interview_rejected: "bg-red-100 text-red-800",
      shortlisted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const statusLabels: { [key: string]: string } = {
      under_review: "Under Review",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
      interview_scheduled: "Interview Scheduled",
      interview_accepted: "Interview Accepted",
      interview_rejected: "Interview Rejected",
      active: "Active",
      draft: "Draft",
      closed: "Closed",
    };
    return (
      <Badge
        variant="secondary"
        className={badgeStyles[status] || "bg-gray-100 text-gray-800"}
      >
        {statusLabels[status] || status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </Badge>
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "font-bold text-green-600";
    if (score >= 80) return "font-bold text-blue-600";
    if (score >= 70) return "font-bold text-yellow-600";
    return "font-bold text-red-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "under_review":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "interview_scheduled":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "shortlisted":
        return <Star className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Handle shortlist
  const handleShortlist = async (candidate: MatchedCandidate) => {
    if (!currentEmployerEmail) {
      showError("Error", "Please log in to shortlist candidates");
      return;
    }

    // Find the job ID from the job title
    const job = jobPostings.find(j => j.job_title === candidate.jobTitle);
    if (!job) {
      showError("Error", "Job not found");
      return;
    }

    const newApplicant = {
      employer_email: currentEmployerEmail,
      candidate_id: candidate.id,
      candidate_name: candidate.candidateSummary.name,
      candidate_email: candidate.candidateSummary.email || "",
      job_id: job.id,
      job_title: candidate.jobTitle,
      applied_date: new Date().toISOString().split("T")[0],
      status: "shortlisted",
      accommodations_requested:
        candidate.candidateSummary.accommodations.length > 0,
      accommodation_details:
        candidate.candidateSummary.accommodations.join(", "),
      experience: candidate.candidateSummary.experienceSummary,
      score: candidate.overallMatchPercentage,
    };

    try {
      const response = await fetch(`${API_BASE}/shortlist/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newApplicant),
      });

      if (response.ok) {
        const savedShortlist = await response.json();
        
        // Also create an application entry so it appears in applications list
        try {
          const applicationResponse = await fetch(`${API_BASE}/applications/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              employer_email: currentEmployerEmail,
              candidate_email: candidate.candidateSummary.email || "",
              candidate_name: candidate.candidateSummary.name,
              job_id: job.id,
              job_title: candidate.jobTitle,
              applied_date: new Date().toISOString().split("T")[0],
              status: "shortlisted",
              accommodations_requested: candidate.candidateSummary.accommodations.length > 0,
              accommodation_details: candidate.candidateSummary.accommodations.join(", "),
              score: candidate.overallMatchPercentage,
            }),
          });
          
          if (applicationResponse.ok) {
            // Refresh recent applicants list
            const applicationsRes = await fetch(`${API_BASE}/applications/employer/${currentEmployerEmail}`);
            if (applicationsRes.ok) {
              const applicationsData = await applicationsRes.json();
              const transformed = Array.isArray(applicationsData)
                ? applicationsData
                    .map((item: any) => ({
                      id: item.id || item.application_id,
                      candidateName: item.candidate_name || item.candidate_email || "Unknown Candidate",
                      jobTitle: item.job_title || "",
                      appliedDate: item.applied_date || new Date().toISOString(),
                      status: item.status || "under_review",
                      score: item.score || undefined,
                      accommodationsRequested: item.accommodations_requested || false,
                    }))
                    .sort((a: any, b: any) => {
                      const dateA = new Date(a.appliedDate).getTime();
                      const dateB = new Date(b.appliedDate).getTime();
                      return dateB - dateA;
                    })
                : [];
              setRecentApplicants(transformed);
            }
          }
        } catch (appError) {
          console.error("Error creating application entry:", appError);
          // Continue even if application creation fails
        }
        
        // Update local state with the saved data
        setShortlistedCandidates((prev) => [...prev, {
          id: savedShortlist.id,
          candidateName: savedShortlist.candidate_name,
          jobTitle: savedShortlist.job_title,
          appliedDate: savedShortlist.applied_date,
          status: savedShortlist.status,
          accommodationsRequested: savedShortlist.accommodations_requested,
          accommodationDetails: savedShortlist.accommodation_details,
          experience: savedShortlist.experience,
          score: savedShortlist.score,
        }]);
        
        // Refresh shortlisted candidates list
        try {
          const shortlistResponse = await fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}`);
          if (shortlistResponse.ok) {
            const shortlistData = await shortlistResponse.json();
              const transformedData = shortlistData.map((item: any) => ({
                id: item.id,
                candidateName: item.candidate_name,
                candidateEmail: item.candidate_email || "",
                jobTitle: item.job_title,
                appliedDate: item.applied_date,
                status: item.status,
                accommodationsRequested: item.accommodations_requested,
                accommodationDetails: item.accommodation_details,
                experience: item.experience,
                score: item.score,
              }));
              setShortlistedCandidates(transformedData);
          }
        } catch (err) {
          console.error("Error refreshing shortlisted candidates:", err);
        }
        
        success(
          "Candidate Shortlisted",
          `${candidate.candidateSummary.name} has been added to Applicants tab!`
        );
      } else {
        const errorData = await response.json();
        showError("Shortlist Failed", errorData.detail || "Failed to shortlist candidate");
      }
    } catch (error) {
      console.error("Error shortlisting candidate:", error);
      showError("Error", "An error occurred while shortlisting the candidate");
    }
  };

  const handleRunAiMatching = async () => {
    if (isRunningAiMatch) return;
    setIsRunningAiMatch(true);
    try {
      const response = await fetch(`${API_BASE}/ai-matching/run_matching`, {
        method: "POST",
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const payload = isJson ? await response.json() : null;

      if (!response.ok) {
        const errorMessage =
          (payload && (payload.detail?.message || payload.detail || payload.error || payload.message)) ||
          "Failed to trigger AI job matching.";
        throw new Error(errorMessage);
      }

      const message = (payload && (payload.message || payload.detail)) || "AI job matching completed successfully.";
      success("AI Matching Completed", message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to trigger AI job matching.";
      showError("AI Matching Failed", errorMessage);
    } finally {
      setIsRunningAiMatch(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    showConfirm({
      title: "Delete Job Posting",
      message: "Are you sure you want to delete this job posting? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            success("Job Deleted", "Job posting deleted successfully!");
            // Clear selection if deleted job was selected
            if (selectedJobForApplicants?.id === jobId) {
              setSelectedJobForApplicants(null);
            }
            if (currentEmployerEmail) {
              const jobsResponse = await fetch(
                `${API_BASE}/jobs/employer/${currentEmployerEmail}`
              );
              if (jobsResponse.ok) {
                const jobsData = await jobsResponse.json();
                setJobPostings(jobsData);
              }
            }
          } else {
            showError("Delete Failed", "Failed to delete job. Please try again.");
          }
        } catch (error) {
          console.error("Error deleting job:", error);
          showError("Error", "An error occurred while deleting the job.");
        }
      }
    });
  };

  const handleCloseJob = async (jobId: number) => {
    // Find the job to get its current status
    const job = jobPostings.find(j => j.id === jobId);
    if (!job) {
      showError("Error", "Job not found");
      return;
    }

    const isCurrentlyClosed = job.status === 'closed';
    const newStatus = isCurrentlyClosed ? 'active' : 'closed';
    const actionText = isCurrentlyClosed ? 'reopen' : 'close';

    showConfirm({
      title: isCurrentlyClosed ? "Reopen Job Posting" : "Close Job Posting",
      message: isCurrentlyClosed 
        ? "Are you sure you want to reopen this job posting? It will be visible to candidates again."
        : "Are you sure you want to close this job posting? Closed jobs won't be visible to candidates.",
      confirmText: isCurrentlyClosed ? "Reopen Job" : "Close Job",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...job,
              status: newStatus
            }),
          });

          if (response.ok) {
            success(
              isCurrentlyClosed ? "Job Reopened" : "Job Closed", 
              `Job posting ${actionText}d successfully!`
            );
            // Refresh job postings
            if (currentEmployerEmail) {
              const jobsResponse = await fetch(
                `${API_BASE}/jobs/employer/${currentEmployerEmail}`
              );
              if (jobsResponse.ok) {
                const jobsData = await jobsResponse.json();
                setJobPostings(jobsData);
                // Update selected job if it's the one that was closed/reopened
                if (selectedJobForApplicants?.id === jobId) {
                  const updatedJob = jobsData.find((j: JobPosting) => j.id === jobId);
                  if (updatedJob) {
                    setSelectedJobForApplicants(updatedJob);
                  }
                }
              }
            }
          } else {
            showError(`${isCurrentlyClosed ? "Reopen" : "Close"} Failed`, `Failed to ${actionText} job. Please try again.`);
          }
        } catch (error) {
          console.error(`Error ${actionText}ing job:`, error);
          showError("Error", `An error occurred while ${actionText}ing the job.`);
        }
      }
    });
  };

  const handleViewJob = (job: JobPosting) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
  };

  const handleEditJob = (job: JobPosting) => {
    setSelectedJob(job);
    setEditJobData(job);
    setIsEditModalOpen(true);
  };

  // Fetch applicants for a specific job
  const fetchJobApplicants = async (jobId: number, jobTitle: string) => {
    if (!currentEmployerEmail) return;
    setLoadingApplicants(true);
    try {
      const response = await fetch(`${API_BASE}/applications/employer/${currentEmployerEmail}`);
      if (response.ok) {
        const allApplications = await response.json();
        // Filter applications for this specific job
        const filtered = Array.isArray(allApplications)
          ? allApplications.filter((app: any) => 
              app.job_title === jobTitle || app.job_id === jobId
            )
          : [];
        setJobApplicants(filtered);
      } else {
        console.error("Failed to fetch applicants");
        setJobApplicants([]);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setJobApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Handle viewing candidate profile
  const handleViewProfile = (candidateEmail: string) => {
    setSelectedCandidateEmail(candidateEmail);
    setShowProfileDialog(true);
  };

  // Handle downloading resume (same as ShortlistedApplicants)
  const handleViewResume = async (candidateEmail: string, candidateName?: string) => {
    try {
      const response = await fetch(`${API_BASE}/profiles/${encodeURIComponent(candidateEmail)}`);
      if (response.ok) {
        const profileData = await response.json();
        if (!profileData.resume_url) {
          showError("Resume Not Found", "This candidate has not uploaded a resume.");
          return;
        }

        // Construct full URL if it's a relative path
        const resumeUrl = profileData.resume_url.startsWith('http') 
          ? profileData.resume_url 
          : `${API_BASE}${profileData.resume_url.startsWith('/') ? '' : '/'}${profileData.resume_url}`;

        // Fetch the resume file
        const resumeResponse = await fetch(resumeUrl);
        if (!resumeResponse.ok) {
          throw new Error("Failed to download resume file");
        }

        // Get the blob
        const blob = await resumeResponse.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Extract filename from URL or use candidate name
        const urlParts = profileData.resume_url.split('/');
        const filename = urlParts[urlParts.length - 1] || `${candidateName || candidateEmail}_resume.pdf`;
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        success("Resume Downloaded", `Resume for ${candidateName || candidateEmail} has been downloaded successfully.`);
      } else {
        showError("Error", "Failed to fetch candidate profile.");
      }
    } catch (error) {
      console.error("Error downloading resume:", error);
      showError("Error", "An error occurred while downloading the resume.");
    }
  };

  // Handle updating application status
  const handleUpdateStatus = async (applicationId: number | string | undefined, newStatus: string) => {
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
        
        // Dispatch event for notification system
        window.dispatchEvent(new CustomEvent('applicationStatusUpdated', {
          detail: {
            applicationId,
            newStatus,
            timestamp: new Date().toISOString()
          }
        }));
        
        // Refresh applicants for the current job
        if (selectedJobForApplicants) {
          await fetchJobApplicants(selectedJobForApplicants.id, selectedJobForApplicants.job_title);
        }
        
        // If status changed to shortlisted, create/update shortlist entry
        if (newStatus === 'shortlisted' && currentEmployerEmail) {
          try {
            // Get the application details to create shortlist entry
            const applicationResponse = await fetch(`${API_BASE}/applications/${applicationId}`);
            if (applicationResponse.ok) {
              const applicationData = await applicationResponse.json();
              
              // Create or update shortlist entry
              const shortlistData = {
                employer_email: currentEmployerEmail,
                candidate_id: applicationData.candidate_id || 0,
                candidate_name: applicationData.candidate_name || applicationData.candidate_email || "",
                candidate_email: applicationData.candidate_email || "",
                job_id: applicationData.job_id || 0,
                job_title: applicationData.job_title || "",
                applied_date: applicationData.applied_date || new Date().toISOString().split("T")[0],
                status: "shortlisted",
                accommodations_requested: applicationData.accommodations_requested || false,
                accommodation_details: applicationData.accommodation_details || "",
                experience: applicationData.experience || "",
                score: applicationData.score || 0,
              };
              
              // Check if shortlist entry already exists
              const existingShortlistResponse = await fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}`);
              if (existingShortlistResponse.ok) {
                const existingShortlists = await existingShortlistResponse.json();
                const existingEntry = existingShortlists.find((item: any) => 
                  item.candidate_email === shortlistData.candidate_email && 
                  item.job_id === shortlistData.job_id
                );
                
                if (existingEntry) {
                  // Update existing entry
                  await fetch(`${API_BASE}/shortlist/${existingEntry.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'shortlisted' }),
                  });
                } else {
                  // Create new shortlist entry
                  await fetch(`${API_BASE}/shortlist/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shortlistData),
                  });
                }
              }
              
              // Refresh shortlisted candidates list
              const shortlistResponse = await fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}`);
              if (shortlistResponse.ok) {
                const shortlistData = await shortlistResponse.json();
                const transformedData = shortlistData.map((item: any) => ({
                  id: item.id,
                  candidateName: item.candidate_name,
                  candidateEmail: item.candidate_email || "",
                  jobTitle: item.job_title,
                  appliedDate: item.applied_date,
                  status: item.status,
                  accommodationsRequested: item.accommodations_requested,
                  accommodationDetails: item.accommodation_details,
                  experience: item.experience,
                  score: item.score,
                }));
                setShortlistedCandidates(transformedData);
              }
            }
          } catch (err) {
            console.error("Error creating/updating shortlist entry:", err);
          }
        }
        
        // Refresh recent applicants list
        if (currentEmployerEmail) {
          try {
            const applicationsRes = await fetch(`${API_BASE}/applications/employer/${currentEmployerEmail}`);
            if (applicationsRes.ok) {
              const applicationsData = await applicationsRes.json();
              const transformed = Array.isArray(applicationsData)
                ? applicationsData
                    .map((item: any) => ({
                      id: item.id || item.application_id,
                      candidateName: item.candidate_name || item.candidate_email || "Unknown Candidate",
                      jobTitle: item.job_title || "",
                      appliedDate: item.applied_date || new Date().toISOString(),
                      status: item.status || "under_review",
                      score: item.score || undefined,
                      accommodationsRequested: item.accommodations_requested || false,
                    }))
                    .sort((a: any, b: any) => {
                      const dateA = new Date(a.appliedDate).getTime();
                      const dateB = new Date(b.appliedDate).getTime();
                      return dateB - dateA;
                    })
                : [];
              setRecentApplicants(transformed);
            }
          } catch (err) {
            console.error("Error refreshing recent applicants:", err);
          }
        }
      } else {
        const errorText = await response.text();
        showError("Update Failed", errorText || "Failed to update application status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showError("Error", "An error occurred while updating the status.");
    }
  };

  // Refresh the employer's job postings from the backend
  const refreshJobsForEmployer = async () => {
    if (!currentEmployerEmail) return;
    try {
      const jobsRes = await fetch(
        `${API_BASE}/jobs/employer/${currentEmployerEmail}`
      );
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobPostings(sortJobsByLatest(jobsData));
      }
    } catch (error) {
      console.error("Error refreshing job postings:", error);
    }
  };

  // After a successful post, refresh jobs and switch to Jobs tab
  const handleJobPosted = async () => {
    await refreshJobsForEmployer();
    // setActiveTab("jobs");
  };

const handleSaveEditJob = async () => {
    if (!editJobData || !editJobData.id) {
      setErrors({ general: "No job selected" });
      return;
    }

    const requiredFields: (keyof JobPosting)[] = ["job_title", "location"];
    const newErrors: { [key: string]: string } = {};
    requiredFields.forEach((field) => {
      const value = (editJobData as JobPosting)[field];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        newErrors[field] = "This field is required";
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch(`${API_BASE}/jobs/${editJobData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editJobData),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update job");
      }

      const updated = await res.json();

      // Update job list immediately for instant UI feedback
      setJobPostings((prev) =>
        prev.map((j) => (j.id === updated.id ? updated : j))
      );

      // Also update selectedJobForApplicants if it's the same job
      if (selectedJobForApplicants && selectedJobForApplicants.id === updated.id) {
        setSelectedJobForApplicants(updated);
      }

      // Refresh from server in background for consistency
      if (currentEmployerEmail) {
        fetchEmployerJobs(currentEmployerEmail);
      }

      // Show success toast
      success("Job Updated", "Job edited successfully!");

      setIsEditModalOpen(false);
      setSelectedJob(null);
    } catch (err: any) {
      setErrors({ general: err.message || "Update failed" });
    }
  };

  // Function to handle logo upload
  const handleLogoUpload = async (file: File) => {
    if (!currentEmployerEmail) {
      showError("Not Logged In", "Please log in as an employer to upload a logo.");
      return;
    }
    // Add this check if companyProfile.name is needed by backend for filename
    // and companyProfile might not be loaded yet.
    if (!companyProfile || !companyProfile.name) {
      showError("Profile Not Loaded", "Company profile not loaded. Cannot upload logo.");
      return;
    }

    // Optional: Set a loading state here (e.g., setIsUploading(true))
    // to provide user feedback.

    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(
        `${API_BASE}/jobs/company/${currentEmployerEmail}/upload-company-logo`,
        {
          method: "POST",
          body: formData,
          // Do NOT set Content-Type header for FormData, browser does it automatically
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newLogoUrl = data.logo_url; // Get the new logo URL from the backend response

        console.log("Logo uploaded successfully. Backend returned:", newLogoUrl);
        
        setCompanyLogo(newLogoUrl); // Update the logo displayed in the UI

        // Update the companyProfile state with the new logo_url for consistency
        setCompanyProfile(prevProfile => {
          if (prevProfile) {
            return { ...prevProfile, logo_url: newLogoUrl };
          }
          return null;
        });

        success("Logo Uploaded", "Company logo uploaded successfully!");

        // REMOVED: await handleSaveCompanySettings(data.logo_url);
        // The backend's /upload-company-logo endpoint already updates the DB.
        // This call is no longer needed for the logo_url itself.

      } else {
        const errorText = await response.text();
        console.error("Error uploading logo:", errorText);
        showError("Upload Failed", `Failed to upload logo: ${errorText}`);
      }
    } catch (error) {
      console.error("Network error during logo upload:", error);
      showError("Network Error", "An error occurred during logo upload.");
    } finally {
      // Optional: Reset loading state here (e.g., setIsUploading(false))
    }
  };

  // Handler for when a file is selected
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleLogoUpload(event.target.files[0]);
      // Clear the file input so the same file can be selected again
      event.target.value = '';
    }
  };

  // Handle company settings save (now accepts an optional logoUrl to update)
  const handleSaveCompanySettings = async (newLogoUrl: string | null = null) => {
    if (!currentEmployerEmail) {
      showError("Not Logged In", "Please log in as an employer to save settings.");
      return;
    }

    try {
      const companyData = {
        email: currentEmployerEmail,
        name: companyName,
        industry: companyIndustry,
        location: companyLocation,
        size: companySize,
        inclusion_score: companyProfile?.inclusion_score || 0,
        certifications: companyProfile?.certifications || "[]",
        founded_year: companyProfile?.founded_year || null,
        company_type: companyProfile?.company_type || "",
        website: companyProfile?.website || "",
        employees: companyProfile?.employees || "",
        logo_url: newLogoUrl !== null ? newLogoUrl : companyLogo, // Use newLogoUrl if provided, else current state
      };

      const response = await fetch(
        `${API_BASE}/jobs/company/${currentEmployerEmail}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(companyData),
        }
      );

      if (response.ok) {
        // Refresh the company profile data immediately
        const updatedResponse = await fetch(
          `${API_BASE}/jobs/company/${currentEmployerEmail}`
        );
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          
          // Update all company-related states
          setCompanyProfile(updatedData);
          setCompanyName(updatedData.name);
          setCompanyIndustry(updatedData.industry);
          setCompanyLocation(updatedData.location);
          setCompanySize(updatedData.size);
          setCompanyLogo(updatedData.logo_url || null);
        }
        
        // Show toast after state is updated (only if not part of logo upload)
        if (newLogoUrl === null) {
          success("Settings Saved", "Company settings saved successfully!");
        }
      } else {
        let errorText: string;
        try {
          errorText = await response.text();
        } catch {
          errorText = "Unknown error";
        }
        console.error("Error saving company settings:", errorText);
        showError("Save Failed", "Failed to save company settings. Please try again.");
      }
    } catch (error) {
      console.error("Error saving company settings:", error);
      showError("Error", "An error occurred while saving company settings.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Check if session is loading or not authenticated
      if (status === "loading") {
        return; // Do nothing while session is loading
      }
      if (status === "unauthenticated") {
        router.push("/auth/signin");
        setIsLoading(false);
        return;
      }

      const employerEmail = session?.user?.email || "";
      setCurrentEmployerEmail(employerEmail);

      if (!employerEmail) {
        setIsLoading(false);
        return;
      }

      try {
        const companyResponse = await fetch(
          `${API_BASE}/jobs/company/${employerEmail}`
        );
        const defaultCompany: CompanyProfile = {
          id: 0,
          email: employerEmail,
          name: "Your Company",
          industry: "Technology",
          location: "Your Location",
          website: "",
          employees: "",
          size: "1-10 employees",
          inclusion_score: 0,
          certifications: "[]",
          description: "",
          founded_year: 2020,
          company_type: "Private",
          neurodivergent_friendly: false,
          workplace_accommodations: false,
          equal_opportunity: false,
          accessible_recruitment: false,
          logo_url: null, // Default logo_url
        };

        let companyData: CompanyProfile;
        if (companyResponse.ok) {
          companyData = await companyResponse.json();
        } else if (companyResponse.status === 404) {
          const createResponse = await fetch(
            `${API_BASE}/jobs/company/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(defaultCompany),
            }
          );
          companyData = createResponse.ok
            ? await createResponse.json()
            : defaultCompany;
        } else {
          companyData = defaultCompany;
        }

        setCompanyProfile(companyData);
        setCompanyName(companyData.name);
        setCompanyIndustry(companyData.industry);
        setCompanyLocation(companyData.location);
        setCompanySize(companyData.size);
        setCompanyLogo(companyData.logo_url || null);
        
        console.log("Company profile loaded. Logo URL:", companyData.logo_url);

        const jobsResponse = await fetch(
          `${API_BASE}/jobs/employer/${employerEmail}`
        );
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobPostings(sortJobsByLatest(jobsData));
        }

        // Fetch shortlisted candidates
        try {
          const shortlistResponse = await fetch(`${API_BASE}/shortlist/employer/${employerEmail}`);
          console.log("Shortlisted candidates API response status:", shortlistResponse.status);
          if (shortlistResponse.ok) {
            const shortlistData = await shortlistResponse.json();
            console.log("Shortlisted candidates raw data:", shortlistData);
            // Transform backend data to match frontend state structure
            const transformedData = Array.isArray(shortlistData) ? shortlistData.map((item: any) => ({
              id: item.id,
              candidateName: item.candidate_name || item.candidateName || "Unknown Candidate",
              candidateEmail: item.candidate_email || item.candidateEmail || "",
              jobTitle: item.job_title || item.jobTitle || "",
              appliedDate: item.applied_date || item.appliedDate || new Date().toISOString(),
              status: item.status || "shortlisted",
              accommodationsRequested: item.accommodations_requested || item.accommodationsRequested || false,
              accommodationDetails: item.accommodation_details || item.accommodationDetails || "",
              experience: item.experience || "",
              score: item.score || 0,
            })) : [];
            console.log("Shortlisted candidates transformed:", transformedData.length, transformedData);
            setShortlistedCandidates(transformedData);
          } else {
            const errorText = await shortlistResponse.text();
            console.error("Failed to fetch shortlisted candidates. Status:", shortlistResponse.status, "Error:", errorText);
            setShortlistedCandidates([]);
          }
        } catch (err) {
          console.error("Error fetching shortlisted candidates:", err);
          setShortlistedCandidates([]);
        }

        // Fetch recent applicants (all applicants for overview)
        try {
          const applicationsResponse = await fetch(`${API_BASE}/applications/employer/${employerEmail}`);
          console.log("Recent applicants API response status:", applicationsResponse.status);
          if (applicationsResponse.ok) {
            const applicationsData = await applicationsResponse.json();
            console.log("Recent applicants raw data:", applicationsData);
            // Transform and sort by applied_date (most recent first)
            const transformed = Array.isArray(applicationsData)
              ? applicationsData
                  .map((item: any) => ({
                    id: item.id || item.application_id,
                    candidateName: item.candidate_name || item.candidate_email || "Unknown Candidate",
                    jobTitle: item.job_title || "",
                    appliedDate: item.applied_date || new Date().toISOString(),
                    status: item.status || "under_review",
                    score: item.score || undefined,
                    accommodationsRequested: item.accommodations_requested || false,
                  }))
                  .sort((a: any, b: any) => {
                    const dateA = new Date(a.appliedDate).getTime();
                    const dateB = new Date(b.appliedDate).getTime();
                    return dateB - dateA; // Most recent first
                  })
              : [];
            console.log("Recent applicants transformed:", transformed.length, transformed);
            setRecentApplicants(transformed);
          } else {
            const errorText = await applicationsResponse.text();
            console.error("Failed to fetch recent applicants. Status:", applicationsResponse.status, "Error:", errorText);
            setRecentApplicants([]);
          }
        } catch (err) {
          console.error("Error fetching recent applicants:", err);
          setRecentApplicants([]);
        }

        // Fetch total candidates count
        try {
          const candidatesResponse = await fetch(`${API_BASE}/profiles/`);
          if (candidatesResponse.ok) {
            const candidatesData = await candidatesResponse.json();
            setTotalCandidates(Array.isArray(candidatesData) ? candidatesData.length : 0);
          }
        } catch (err) {
          console.error("Error fetching candidates count:", err);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session, status, router]);

  // Note: ShortlistedApplicants component handles its own data fetching

  // Auto-select the first job when job postings update (after edit, delete, or refresh)
  useEffect(() => {
    if (jobPostings.length > 0) {
      // If current selected job is not in the list, or there's no selection, select the first one
      const currentJobStillExists = selectedJobForApplicants && 
        jobPostings.some(job => job.id === selectedJobForApplicants.id);
      
      if (!currentJobStillExists) {
        setSelectedJobForApplicants(jobPostings[0]);
      } else {
        // Update the selected job with the latest data
        const updatedJob = jobPostings.find(job => job.id === selectedJobForApplicants.id);
        if (updatedJob) {
          setSelectedJobForApplicants(updatedJob);
        }
      }
    } else {
      setSelectedJobForApplicants(null);
    }
  }, [jobPostings]);

  
  const fetchEmployerJobs = async (email: string) => {
    try {
      const jobsResponse = await fetch(
        `${API_BASE}/jobs/employer/${email}`
      );
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        console.log("Fetched jobs:", jobsData);
        setJobPostings(jobsData);
      } else {
        console.error("Failed to fetch employer jobs");
      }
    } catch (error) {
      console.error("Error fetching employer jobs:", error);
    }
  };

  const jobPostingsSortModes = [
    "Newest",
    "Oldest"
  ]

  const sortedJobPostings = [...jobPostings]
    .filter((job) => {
      // Search filter
      const matchesSearch = !jobSearchTerm || 
        job.job_title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.job_type.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.work_mode.toLowerCase().includes(jobSearchTerm.toLowerCase());
      
      // Status filter - include expired jobs
      const matchesStatus = jobFilterStatus === "all" || 
        (job.status && job.status.toLowerCase() === jobFilterStatus.toLowerCase()) ||
        (jobFilterStatus === "expired" && (
          job.status === "expired" || 
          (job.application_deadline && new Date(job.application_deadline) < new Date())
        ));
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "Newest":
          return b.id - a.id; // higher ID = newer
        case "Oldest":
          return a.id - b.id; // lower ID = older
        default:
          return 0;
      }
    });

  // Note: Filtering logic moved to ShortlistedApplicants component

  const renderInputField = (
    label: string,
    field: string,
    value: string | number,
    onChange: (value: string | number) => void,
    type = "text"
  ) => (
    <div>
      <label className="block text-sm font-medium text-[#3a4043] mb-1">
        {label}
      </label>
      <Input
        type={type}
        value={
          type === "number"
            ? String(value).replace(/^0+/, "") || ""
            : value ?? ""
        }
        onChange={(e) => {
          const val = e.target.value;
          if (type === "number") {
            if (val === "") return onChange("");
            if (!/^\d*\.?\d*$/.test(val)) return;
            onChange(Number(val));
          } else {
            onChange(val);
          }
        }}
        className="w-full px-3 py-2 rounded-lg outline-none focus-visible:border-gray-300 focus-visible:ring-gray-300/50 focus-visible:ring-[1px] border-2 border-[#635BFF]/30"
        placeholder={`Please enter ${label.toLowerCase()}`}
        onKeyDown={(e) =>
          type === "number" &&
          ["-", "+", "e"].includes(e.key) &&
          e.preventDefault()
        }
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="page-wrap py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            {/* <h1 className="text-3xl font-bold text-[#3a4043] mb-1">
              Welcome back, {companyProfile?.name || "Company"}!
            </h1>
            <p className="text-gray-600 mb-4 sm:mb-0">
              Manage your job postings and find the best neurodivergent talent.
            </p> */}
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <div className="sticky top-[var(--app-header-height)]">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                    {companyLogo && companyLogo.trim() !== "" ? (
                      <img
                        src={
                          companyLogo.startsWith("http")
                            ? `${companyLogo}?t=${Date.now()}`
                            : `${API_BASE}${companyLogo.startsWith('/') ? '' : '/'}${companyLogo}?t=${Date.now()}`
                        }
                        alt="Company Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Logo failed to load:", companyLogo);
                          // hide broken image and show fallback icon
                          (e.target as HTMLImageElement).style.display = "none";
                          const parentDiv = e.currentTarget.parentElement;
                          if (parentDiv && !parentDiv.querySelector('.fallback-icon')) {
                            const fallback = document.createElement("div");
                            fallback.className = "fallback-icon";
                            fallback.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6 text-white mx-auto' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 21h18M9 8h6m-3-5v5m4 0h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2' /></svg>`;
                            parentDiv.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <Building className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3a4043]">
                      {companyProfile?.name || "Company"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentEmployerEmail || "Email"}
                    </p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {[
                    { id: "overview", label: "Overview", icon: BarChart3 },

                    { id: "post-job", label: "Post New Job", icon: SquarePen },
                    { id: "jobs", label: "Job Postings", icon: FileText },
                     { id: "shortlisted applicants", label: "Shortlisted Applicants", icon: Users },
                    {
                      id: "search-candidates",
                      label: "Talent Pool",
                      icon: Search,
                    },
                    
                   
                    // { id: "all-candidates", label: "Candidate Pool", icon: UserSearch  },
                    {
                      id: "tax-calculator",
                      label: "Calculator",
                      icon: Calculator,
                    },
                    {
                      id: "settings",
                      label: "Company Settings",
                      icon: Settings,
                    },
                    {
                      id: "consult-ai",
                      label: "Consult AI",
                      icon: BotMessageSquare
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors hover:cursor-pointer ${activeTab === item.id
                          ? "bg-[#635bff] text-white"
                          : "text-[#3a4043] hover:bg-gray-100"
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div>
            {activeTab === "overview" && (
              <EmployerOverview
                activeJobs={jobPostings.filter(j => j.status === 'active').length}
                totalApplicants={recentApplicants.length}
                totalViews={0}
                recentApplicants={recentApplicants}
                handleTabChange={setActiveTab}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
              />
            )}

            {/* Job Postings Tab - Split View with Matched Candidates */}
            {activeTab === "jobs" && (
              <div className="space-y-4">
                {/* Header */}
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-[#3a4043]">Job Postings</h2>
                  {/* <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button> */}
                </div>

                {/* Search and Filters */}
                <Card className="mb-3">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Search */}
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                          <Input
                            placeholder="Search jobs by title, type, location, or work mode..."
                            value={jobSearchTerm}
                            onChange={(e) => setJobSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="flex gap-4">
                        <Select value={jobFilterStatus} onValueChange={setJobFilterStatus}>
                          <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Jobs</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={selectedSort} onValueChange={setSelectedSort}>
                          <SelectTrigger className="w-48">
                            <SortAsc className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Newest">Newest</SelectItem>
                            <SelectItem value="Oldest">Oldest</SelectItem>
                            <SelectItem value="A-Z">A-Z</SelectItem>
                            <SelectItem value="Work Mode">Work Mode</SelectItem>
                            <SelectItem value="Job Type">Job Type</SelectItem>
                            <SelectItem value="Experience Level">Experience Level</SelectItem>
                            <SelectItem value="Salary">Salary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="mb-6 ml-2">
                  <p className="text-[#6f7a80] text-sm">
                    Showing {sortedJobPostings.length} of {jobPostings.length} job postings
                  </p>
                </div>

                {/* Job Cards (Left) and Job Details (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
                  {/* Left Side - Job Postings List */}
                  <div className="lg:col-span-1 xl:col-span-2 space-y-4">
                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#c5c4d4] scrollbar-track-transparent overflow-visible">
                    {isLoading ? (
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-gray-500 text-sm">Loading...</p>
                        </CardContent>
                      </Card>
                    ) : jobPostings.length === 0 ? (
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-gray-500 text-sm mb-3">
                            No job postings found.
                          </p>
                          <Button
                            size="sm"
                            className="bg-[#635bff] hover:bg-[#5748e5] text-white hover:cursor-pointer"
                            onClick={() => setActiveTab("post-job")}
                          >
                            Post Your First Job
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      sortedJobPostings.map((job, index) => (
                        <motion.div 
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card
                            className={`transition-all duration-300 hover:shadow-lg bg-[#F8F8FC] cursor-pointer ${
                              selectedJobForApplicants?.id === job.id
                                ? "ring-2 ring-[#635bff] bg-[#635bff]/5 "
                                : "hover:shadow-md"
                              }`}
                          >
                            <CardContent className="p-4 flex flex-col h-full">
                              <div 
                                className="flex flex-col sm:flex-row justify-between gap-4 h-full cursor-pointer flex-1"
                                onClick={() => {
                                  setSelectedJobForApplicants(job);
                                  if (!jobViewModes.has(job.id)) {
                                    const newModes = new Map(jobViewModes);
                                    newModes.set(job.id, "description");
                                    setJobViewModes(newModes);
                                  }
                                }}
                              >
                                {/* LEFT CONTENT */}
                                <div className="flex-1 min-w-0">
                                  {/* Top Row: Job Title and Status Badge */}
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className="text-lg font-semibold text-[#3a4043] truncate">{job.job_title}</h3>
                                    {getStatusBadge(job.status || "active")}
                                  </div>

                                  {/* Second Row: Company, Location, Type */}
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#3a4043] mb-3">
                                    <span className="flex items-center gap-1">
                                      <Building className="h-4 w-4" />
                                      {companyProfile?.name || "Company"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {job.job_type}
                                    </span>
                                  </div>

                                  {/* Third Row: Salary */}
                                  <div className="flex items-center gap-1 text-sm text-[#3a4043] mb-3">
                                    <DollarSign className="h-4 w-4" />
                                    <span>{SALARY_RANGES[job.salary_range] ?? job.salary_range}</span>
                                  </div>

                                  {/* Fourth Row: Description */}
                                  <p className="text-[#3a4043] text-sm mb-3 line-clamp-2 overflow-hidden">
                                    {job.job_summary || "No description available"}
                                  </p>

                                  {/* Bottom Row: Posted Date */}
                                  <div className="flex items-center gap-4 text-xs text-[#3a4043]">
                                    {job.created_at && (
                                      <span>Posted: {new Date(job.created_at).toISOString().split('T')[0]}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {/* View Mode Buttons - At Bottom */}
                              <JobViewModeButtons
                                jobId={job.id}
                                currentMode={jobViewModes.get(job.id) || "description"}
                                onModeChange={(mode) => {
                                  setSelectedJobForApplicants(job);
                                  const newModes = new Map(jobViewModes);
                                  newModes.set(job.id, mode);
                                  setJobViewModes(newModes);
                                }}
                                onApplicantsClick={async () => {
                                  await fetchJobApplicants(job.id, job.job_title);
                                }}
                              />
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Side - Selected Job Details & Matched Candidates */}
                <div className="lg:col-span-1 xl:col-span-3 space-y-4">
                  {selectedJobForApplicants ? (
                    <>
                      {/* Job Details Card */}
                      <Card className="sticky top-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        <CardHeader className="pb-4 relative">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-2xl font-bold text-[#3a4043] mb-2">
                                {selectedJobForApplicants.job_title}
                              </CardTitle>
                              <div className="flex items-center gap-4 text-[#6f7a80] mb-4">
                                <span className="flex items-center gap-1">
                                  <Building className="h-4 w-4" />
                                  {companyProfile?.name || "Company"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {selectedJobForApplicants.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-[#6f7a80]">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {selectedJobForApplicants.job_type}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {SALARY_RANGES[selectedJobForApplicants.salary_range] ?? selectedJobForApplicants.salary_range}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  {selectedJobForApplicants.experience_level}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              {getStatusBadge(selectedJobForApplicants.status || "active")}
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleEditJob(selectedJobForApplicants)
                                  }
                                  className="border border-gray-400 hover:cursor-pointer bg-white"
                                >
                                  <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`${
                                    selectedJobForApplicants.status === 'closed'
                                      ? "border-green-600 text-green-600 hover:bg-green-50 hover:cursor-pointer hover:text-green-700"
                                      : "border-red-600 text-red-600 hover:bg-red-50 hover:cursor-pointer hover:text-red-700"
                                  }`}
                                  onClick={() => handleCloseJob(selectedJobForApplicants.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" /> {selectedJobForApplicants.status === 'closed' ? 'Reopen' : 'Close'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteJob(selectedJobForApplicants.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white hover:text-white hover:cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {(jobViewModes.get(selectedJobForApplicants.id) || "description") === "description" && (
                            <>
                          {/* Job Description */}
                          <div>
                            <h4 className="font-semibold text-[#3a4043] mb-3">Job Description</h4>
                            <p className="text-[#6f7a80] break-words leading-relaxed whitespace-pre-line">
                              {selectedJobForApplicants.job_summary || "No description available."}
                            </p>
                          </div>

                          {/* Requirements */}
                          {selectedJobForApplicants.job_requirements && (
                            <div>
                              <h4 className="font-semibold text-[#3a4043] mb-3">Requirements</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedJobForApplicants.job_requirements.split(',').map((req: string, reqIndex: number) => (
                                  <Badge key={reqIndex} variant="secondary" className="text-xs">
                                    {req.trim()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Accommodations Offered */}
                          {(selectedJobForApplicants.flexible_work_hour ||
                            selectedJobForApplicants.sensory_friendly_environment ||
                            selectedJobForApplicants.peer_support_system ||
                            selectedJobForApplicants.dedicated_workspace ||
                            selectedJobForApplicants.neurodiversity_awareness_training ||
                            selectedJobForApplicants.regular_supervisor_check_in ||
                            selectedJobForApplicants.zero_tolerance_bullying_mobbing_policy ||
                            selectedJobForApplicants.augmentative_alternative_communication ||
                            selectedJobForApplicants.quiet_room ||
                            selectedJobForApplicants.sensory_aids ||
                            selectedJobForApplicants.provide_visual_guidance ||
                            selectedJobForApplicants.uses_project_management_tools ||
                            selectedJobForApplicants.optional_social_event ||
                            selectedJobForApplicants.mental_health_support ||
                            selectedJobForApplicants.near_public_transport) && (
                            <div>
                              <h4 className="font-semibold text-[#3a4043] mb-3">Accommodations Offered</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedJobForApplicants.flexible_work_hour && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Flexible Work Hours
                                  </Badge>
                                )}
                                {selectedJobForApplicants.quiet_room && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Quiet Room/Space
                                  </Badge>
                                )}
                                {selectedJobForApplicants.sensory_friendly_environment && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Sensory-Friendly Environment
                                  </Badge>
                                )}
                                {selectedJobForApplicants.peer_support_system && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Peer Support System
                                  </Badge>
                                )}
                                {selectedJobForApplicants.dedicated_workspace && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Dedicated Workspace
                                  </Badge>
                                )}
                                {selectedJobForApplicants.sensory_aids && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Sensory Aids Allowed
                                  </Badge>
                                )}
                                {selectedJobForApplicants.neurodiversity_awareness_training && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Neurodiversity Awareness Training
                                  </Badge>
                                )}
                                {selectedJobForApplicants.provide_visual_guidance && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Visual Project-Tracking Tool
                                  </Badge>
                                )}
                                {selectedJobForApplicants.regular_supervisor_check_in && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Regular Check-in with Supervisor
                                  </Badge>
                                )}
                                {selectedJobForApplicants.optional_social_event && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    No Forced Social Events
                                  </Badge>
                                )}
                                {selectedJobForApplicants.zero_tolerance_bullying_mobbing_policy && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Zero Tolerance Policy for Bullying & Mobbing
                                  </Badge>
                                )}
                                {selectedJobForApplicants.mental_health_support && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Mental Health Support
                                  </Badge>
                                )}
                                {selectedJobForApplicants.augmentative_alternative_communication && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Alternative Communication App Allowed
                                  </Badge>
                                )}
                                {selectedJobForApplicants.near_public_transport && (
                                  <Badge variant="outline" className="text-xs border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/10">
                                    Near Public Transport
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Company Info */}
                          <div>
                            <h4 className="font-semibold text-[#3a4043] mb-3">Company Information</h4>
                            <div className="space-y-2 text-sm text-[#6f7a80]">
                              <div className="flex justify-between">
                                <span>Industry:</span>
                                <span>{companyProfile?.industry || "Not specified"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Company Size:</span>
                                <span>{companyProfile?.size || "Not specified"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Posted:</span>
                                <span>{selectedJobForApplicants.created_at ? new Date(selectedJobForApplicants.created_at).toISOString().split('T')[0] : "Recently"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Work Mode:</span>
                                <span>{selectedJobForApplicants.work_mode || "Not specified"}</span>
                              </div>
                            </div>
                          </div>
                          </>
                          )}

                          {(jobViewModes.get(selectedJobForApplicants.id) || "description") === "applicants" && (
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-[#3a4043]">Applicants</h4>
                                {/* Search Bar and Sort Filter for Applicants */}
                                {jobApplicants.length > 0 && (
                                  <div className="flex items-center gap-3">
                                  <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                                    <Input
                                      placeholder="Search applicants..."
                                      value={applicantSearchTerm}
                                      onChange={(e) => {
                                        setApplicantSearchTerm(e.target.value);
                                        setApplicantCurrentPage(1);
                                      }}
                                      className="pl-10"
                                    />
                                    </div>
                                    <Select value={applicantSortBy} onValueChange={(value) => {
                                      setApplicantSortBy(value);
                                      setApplicantCurrentPage(1);
                                    }}>
                                      <SelectTrigger className="w-48 cursor-pointer">
                                        <SortAsc className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Sort by" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="recent" className="cursor-pointer">Most Recent</SelectItem>
                                        <SelectItem value="match" className="cursor-pointer">Highest Match Score</SelectItem>
                                        <SelectItem value="name" className="cursor-pointer">Name A-Z</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                              {loadingApplicants ? (
                                <div className="text-center py-8">
                                  <p className="text-[#6f7a80]">Loading applicants...</p>
                                </div>
                              ) : (() => {
                                // Filter applicants by search term
                                let filteredApplicants = jobApplicants.filter((app: any) => {
                                  if (!applicantSearchTerm) return true;
                                  const search = applicantSearchTerm.toLowerCase();
                                  return (
                                    (app.candidate_name && app.candidate_name.toLowerCase().includes(search)) ||
                                    (app.candidate_email && app.candidate_email.toLowerCase().includes(search)) ||
                                    (app.job_title && app.job_title.toLowerCase().includes(search))
                                  );
                                });

                                // Sort applicants
                                filteredApplicants = [...filteredApplicants].sort((a: any, b: any) => {
                                  switch (applicantSortBy) {
                                    case "match":
                                      return (b.score || 0) - (a.score || 0); // Highest score first
                                    case "name":
                                      return (a.candidate_name || a.candidate_email || "").localeCompare(b.candidate_name || b.candidate_email || "");
                                    case "recent":
                                    default:
                                      const dateA = a.applied_date ? new Date(a.applied_date).getTime() : 0;
                                      const dateB = b.applied_date ? new Date(b.applied_date).getTime() : 0;
                                      return dateB - dateA; // Most recent first
                                  }
                                });

                                // Pagination
                                const applicantTotalPages = Math.ceil(filteredApplicants.length / applicantItemsPerPage);
                                const applicantStartIndex = (applicantCurrentPage - 1) * applicantItemsPerPage;
                                const applicantEndIndex = applicantStartIndex + applicantItemsPerPage;
                                const paginatedApplicants = filteredApplicants.slice(applicantStartIndex, applicantEndIndex);

                                return filteredApplicants.length === 0 ? (
                                  <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-[#6f7a80]">
                                      {applicantSearchTerm ? "No applicants match your search." : "No applicants for this job yet."}
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="space-y-3">
                                      {paginatedApplicants.map((applicant: any, index: number) => (
                                        <ApplicantCard
                                          key={index}
                                          applicant={applicant}
                                          onViewProfile={handleViewProfile}
                                          onViewResume={handleViewResume}
                                          onUpdateStatus={handleUpdateStatus}
                                          getStatusBadge={getStatusBadge}
                                          getMatchScoreColor={getMatchScoreColor}
                                        />
                                      ))}
                                    </div>
                                    {/* Pagination for Applicants */}
                                    {applicantTotalPages > 1 && (
                                      <div className="mt-6 flex justify-center items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setApplicantCurrentPage(p => Math.max(1, p - 1))}
                                          disabled={applicantCurrentPage === 1}
                                          className="hover:cursor-pointer"
                                        >
                                          Previous
                                        </Button>
                                        <div className="flex gap-1">
                                          {Array.from({ length: applicantTotalPages }, (_, i) => (
                                            <Button
                                              key={i + 1}
                                              size="sm"
                                              variant={applicantCurrentPage === i + 1 ? "default" : "outline"}
                                              onClick={() => setApplicantCurrentPage(i + 1)}
                                              className={applicantCurrentPage === i + 1 
                                                ? "bg-[#635bff] text-white hover:bg-[#524aff] cursor-pointer" 
                                                : "hover:cursor-pointer"
                                              }
                                            >
                                              {i + 1}
                                            </Button>
                                          ))}
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setApplicantCurrentPage(p => Math.min(applicantTotalPages, p + 1))}
                                          disabled={applicantCurrentPage === applicantTotalPages}
                                          className="hover:cursor-pointer"
                                        >
                                          Next
                                        </Button>
                                      </div>
                                    )}
                                    <div className="mt-4 text-sm text-[#6f7a80] text-center">
                                      Showing {applicantStartIndex + 1}-{Math.min(applicantEndIndex, filteredApplicants.length)} of {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? 's' : ''}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          )}

                          {(jobViewModes.get(selectedJobForApplicants.id) || "description") === "matched" && (
                            <div>
                              <h4 className="font-semibold text-[#3a4043] mb-3">AI Matched Candidates</h4>
                              <MatchedCandidates
                                jobTitle={selectedJobForApplicants.job_title}
                                onShortlist={handleShortlist}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card className="h-full">
                      <CardContent className="flex items-center justify-center h-96">
                        <div className="text-center text-gray-500">
                          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">
                            Select a job posting
                          </p>
                          <p className="text-sm">
                            View details and matched candidates
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                </div>
              </div>
            )}

            {/* Search Candidates Tab */}
            {activeTab === "search-candidates" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[#3a4043]">Talent Pool</h2>
                  {/* <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button> */}
                </div>
                <CandidateList />
              </div>
            )}

            {/* All Candidates Tab */}
            {activeTab === "all-candidates" && (
              <div>
                <AllCandidates />
              </div>
            )}

            {/* Shortlisted Applicants Tab */}
            {activeTab === "shortlisted applicants" && (
              <ShortlistedApplicants
                currentEmployerEmail={currentEmployerEmail}
                API_BASE={API_BASE}
                onViewProfile={handleViewProfile}
                onRunAiMatching={handleRunAiMatching}
                isRunningAiMatch={isRunningAiMatch}
                getStatusBadge={getStatusBadge}
                getMatchScoreColor={getMatchScoreColor}
                onTabChange={setActiveTab}
              />
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[#3a4043]">Company Settings</h2>
                  {/* <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button> */}
                </div>

                {/* Changed to full width (md:grid-cols-1) */}
                <div className="grid md:grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div>
                        <label htmlFor="companyLogoInput" className="block text-sm font-semibold text-gray-700 mb-1">Company Logo</label>
                        <div className="flex items-center space-x-4">
                          {companyLogo && companyLogo.trim() !== "" ? (
                            <img
                              src={
                                companyLogo.startsWith("http")
                                  ? `${companyLogo}?t=${Date.now()}`
                                  : `${API_BASE}${companyLogo.startsWith('/') ? '' : '/'}${companyLogo}?t=${Date.now()}`
                              }
                              alt="Company Logo"
                              className="w-20 h-20 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                console.error("Logo failed to load in settings:", companyLogo);
                                // Show fallback camera icon
                                (e.target as HTMLImageElement).style.display = "none";
                                const parentDiv = e.currentTarget.parentElement;
                                if (parentDiv && !parentDiv.querySelector('.fallback-camera')) {
                                  const fallback = document.createElement("div");
                                  fallback.className = "w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 fallback-camera";
                                  fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`;
                                  parentDiv.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                              <Camera className="h-8 w-8" />
                            </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={onFileChange}
                            className="hidden"
                            accept="image/*"
                          />
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="hover:cursor-pointer"
                          >
                            Upload New Logo
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3a4043] mb-1">
                          Company Name
                        </label>
                        <Input
                          type="text"
                          value={companyName}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Please enter company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3a4043] mb-1">
                          Company Email
                        </label>
                        <Input
                          type="text"
                          value={currentEmployerEmail}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                          onChange={(e) =>
                            setCurrentEmployerEmail(e.target.value)
                          }
                          placeholder="Please enter company email"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3a4043] mb-1">
                          Industry
                        </label>
                        <Select value={companyIndustry} onValueChange={setCompanyIndustry}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aerospace">Aerospace</SelectItem>
                            <SelectItem value="Agriculture">Agriculture</SelectItem>
                            <SelectItem value="Automotive">Automotive</SelectItem>
                            <SelectItem value="Banking & Finance">Banking & Finance</SelectItem>
                            <SelectItem value="Biotechnology">Biotechnology</SelectItem>
                            <SelectItem value="Chemical & Petrochemical">Chemical & Petrochemical</SelectItem>
                            <SelectItem value="Construction & Building Materials">Construction & Building Materials</SelectItem>
                            <SelectItem value="Creative & Media">Creative & Media</SelectItem>
                            <SelectItem value="Digital Economy & Startups">Digital Economy & Startups</SelectItem>
                            <SelectItem value="E-commerce & Retail">E-commerce & Retail</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Electrical & Electronics (E&E)">Electrical & Electronics (E&E)</SelectItem>
                            <SelectItem value="Energy & Utilities">Energy & Utilities</SelectItem>
                            <SelectItem value="Engineering & Machinery">Engineering & Machinery</SelectItem>
                            <SelectItem value="Fisheries & Aquaculture">Fisheries & Aquaculture</SelectItem>
                            <SelectItem value="Food & Beverage Processing">Food & Beverage Processing</SelectItem>
                            <SelectItem value="Forestry & Timber">Forestry & Timber</SelectItem>
                            <SelectItem value="Green Technology & Renewable Energy">Green Technology & Renewable Energy</SelectItem>
                            <SelectItem value="Healthcare & Medical">Healthcare & Medical</SelectItem>
                            <SelectItem value="ICT & Software Development">ICT & Software Development</SelectItem>
                            <SelectItem value="Legal & Professional Services">Legal & Professional Services</SelectItem>
                            <SelectItem value="Logistics & Transportation">Logistics & Transportation</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Mining & Minerals">Mining & Minerals</SelectItem>
                            <SelectItem value="Oil & Gas">Oil & Gas</SelectItem>
                            <SelectItem value="Pharmaceuticals & Medical Devices">Pharmaceuticals & Medical Devices</SelectItem>
                            <SelectItem value="Real Estate & Property Development">Real Estate & Property Development</SelectItem>
                            <SelectItem value="Rubber">Rubber</SelectItem>
                            <SelectItem value="Textiles & Apparel">Textiles & Apparel</SelectItem>
                            <SelectItem value="Tourism & Hospitality">Tourism & Hospitality</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3a4043] mb-1">
                          Location
                        </label>
                        <Select value={companyLocation} onValueChange={setCompanyLocation}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kuala Lumpur">Kuala Lumpur</SelectItem>
                            <SelectItem value="Selangor">Selangor</SelectItem>
                            <SelectItem value="Penang">Penang</SelectItem>
                            <SelectItem value="Johor">Johor</SelectItem>
                            <SelectItem value="Perak">Perak</SelectItem>
                            <SelectItem value="Kedah">Kedah</SelectItem>
                            <SelectItem value="Melaka">Melaka</SelectItem>
                            <SelectItem value="Negeri Sembilan">Negeri Sembilan</SelectItem>
                            <SelectItem value="Pahang">Pahang</SelectItem>
                            <SelectItem value="Terengganu">Terengganu</SelectItem>
                            <SelectItem value="Kelantan">Kelantan</SelectItem>
                            <SelectItem value="Sabah">Sabah</SelectItem>
                            <SelectItem value="Sarawak">Sarawak</SelectItem>
                            <SelectItem value="Perlis">Perlis</SelectItem>
                            <SelectItem value="Putrajaya">Putrajaya</SelectItem>
                            <SelectItem value="Labuan">Labuan</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#3a4043] mb-1">
                          Company Size
                        </label>
                        <Select value={companySize} onValueChange={setCompanySize}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                            <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                            <SelectItem value="50-100 employees">50-100 employees</SelectItem>
                            <SelectItem value="100-500 employees">100-500 employees</SelectItem>
                            <SelectItem value="500+ employees">500+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                     
                      <div className=" flex justify-end">
                      <Button
                        className="bg-[#635bff] hover:bg-[#5346e6] text-white hover:cursor-pointer"
                        onClick={() => handleSaveCompanySettings()} // Call without newLogoUrl to save other settings
                      >
                        Save Changes
                      </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "tax-calculator" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[#3a4043]">
                    Double Tax Relief Calculator
                  </h2>
                  {/* <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button> */}
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Employer Cost Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4 ">
                    {renderInputField(
                      "Base Salary (RM)",
                      "baseSalary",
                      baseSalary,
                      (val) => setBaseSalary(val === "" ? 0 : Number(val)),
                      "number"
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Comparison: Neurotypical vs OKU Cardholder
                    </CardTitle>
                  </CardHeader>
                  <div className="text-sm text-[#3a4043] ml-6 mt-4">
                    <p>
                      <strong className="text-green-600 text-xl">
                        Annual Savings (Per OKU Hire):
                      </strong>{" "}
                      <span className="text-green-600 font-semibold text-xl">
                        RM{result.annualSavings.toFixed(2)}
                      </span>
                    </p>
                  </div>
                  <CardContent className="overflow-x-auto">
                    <table className="w-full border border-[#e8e6f0] text-sm">
                      <thead className="bg-[#f9f9ff] text-[#3a4043]">
                        <tr>
                          <th className="p-2 text-left ">Category</th>
                          <th className="p-2 text-left border-1 border-[#e8e6f0]">
                            Neurotypical Staff (RM)
                          </th>
                          <th className="p-2 text-left border-1 border-[#e8e6f0]">
                            OKU Cardholder (RM)
                          </th>
                          <th className="p-2 text-left border-1 border-[#e8e6f0]">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            category: "Base Salary",
                            neuro: baseSalary.toFixed(2),
                            oku: baseSalary.toFixed(2),
                            notes: "Same gross salary (Monthly)",
                          },
                          {
                            category: "EPF",
                            neuro: result.epfCost.toFixed(2),
                            oku: result.epfCost.toFixed(2),
                            notes:
                              "Mandatory employer contribution (Employer 13%)",
                          },
                          {
                            category: "SOCSO",
                            neuro: result.socsoCost.toFixed(2),
                            oku: result.socsoCost.toFixed(2),
                            notes:
                              "Based on SOCSO rate for Employment Injury Scheme (Employer ~1.75%)",
                          },
                          {
                            category: "EIS",
                            neuro: result.eisCost.toFixed(2),
                            oku: result.eisCost.toFixed(2),
                            notes:
                              "Employment Insurance System contribution (Employer 0.2%)",
                          },
                          {
                            category: "Total monthly Employer Cost",
                            neuro: result.monthlyEmployerCost.toFixed(2),
                            oku: result.monthlyEmployerCost.toFixed(2),
                            notes: "Same total cash flow (Before Tax Relief)",
                          },
                          {
                            category: "Annual Employer Cost",
                            neuro: result.annualCost.toFixed(2),
                            oku: result.annualCost.toFixed(2),
                            notes: `RM${result.monthlyEmployerCost.toFixed(
                              2
                            )} x 12 months (Before Tax Relief)`,
                          },
                          {
                            category: "Tax Relief",
                            neuro: "❌ not applicable",
                            oku: "✅ Eligible for Double Tax Deduction on remuneration paid to OKU employees",
                            notes:
                              "Employers can claim twice the amount of remuneration as deductible expense under Income Tax Act 1967 (Double Deduction)",
                          },
                          {
                            category: "Effective Deductible Expense",
                            neuro: result.annualCost.toFixed(2),
                            oku: (result.annualCost * 2).toFixed(2),
                            notes: "For OKU, deduction = 2 x salary paid",
                          },
                          {
                            category: "Tax Savings",
                            neuro: result.neuroTaxSavings.toFixed(2),
                            oku: result.okuTaxSavings.toFixed(2),
                            notes:
                              "Double deduction doubles the tax shield @ 24% Corporate Tax Rate",
                          },
                          {
                            category: "Net Effective Annual Employer Cost",
                            neuro: result.neuroAfterTax.toFixed(2),
                            oku: result.okuAfterTax.toFixed(2),
                            notes: `RM${result.annualCost.toFixed(
                              2
                            )} - tax savings (After Tax)`,
                          },
                        ].map((row) => (
                          <tr
                            key={row.category}
                            className={`border-t ${row.category ===
                              "Net Effective Annual Employer Cost"
                              ? "font-semibold bg-[#f7f6ff]"
                              : ""
                              }`}
                          >
                            <td className="p-2 min-h-[120px]">
                              {row.category}
                            </td>
                            <td className="p-2 text-[#3a4043] border-1 border-[#e8e6f0]">
                              {row.neuro}
                            </td>
                            <td className="p-2 text-[#3a4043] border-1 border-[#e8e6f0]">
                              {row.oku}
                            </td>
                            <td className="p-2 border-1 border-[#e8e6f0]">
                              {row.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="mt-4 text-gray-700 text-sm">
                      Hiring an OKU cardholder doesn't just promote inclusion—it
                      also reduces your effective headcount cost by
                      approximately{" "}
                      <strong>
                        {(
                          (result.annualSavings / result.neuroAfterTax) *
                          100
                        ).toFixed(1)}
                        %
                      </strong>{" "}
                      (thanks to the Double Tax Deduction incentive).
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "post-job" && (
              <div className="space-y-4">
                <div className="flex justify-end mb-4">
                  {/* <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button> */}
                </div>
                <PostJob
                  // onJobPosted={handleJobPosted}
                  onJobPosted={async () => {
                    if (currentEmployerEmail) {
                      await fetchEmployerJobs(currentEmployerEmail);
                    }
                    // Stay on post-job tab after posting
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onCancel={() => setActiveTab("overview")}
                />
              </div>
            )}

            {activeTab === "consult-ai" && (
              <div className="flex flex-col h-[calc(100vh-200px)]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[#3a4043]">
                    Consult AI
                  </h2>
                  {/* <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button> */}
                </div>
                <div className="flex-1 min-h-0">
                  <ChatBot.Chat />
                </div>
              </div>
            )}
            {/* // View Job Modal */}
            {/* <ViewJobModal
              isOpen={isViewModalOpen}
              job={selectedJob}
              salaryRanges={SALARY_RANGES}
              onClose={() => setIsViewModalOpen(false)}
              onEdit={() => {
                setIsViewModalOpen(false);
                selectedJob && handleEditJob(selectedJob);
              }} */}
            {/* /> */}

            <EditJobModal
              isOpen={isEditModalOpen}
              editJobData={editJobData}
              setEditJobData={setEditJobData}
              errors={errors}
              salaryRanges={SALARY_RANGES}
              onClose={() => setIsEditModalOpen(false)}
              onSave={handleSaveEditJob}
            />
          </div>
        </div>
      </div>

      {/* View Profile Dialog */}
      <ViewProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        candidateEmail={selectedCandidateEmail}
        API_BASE={API_BASE}
      />

      {/* Resume Dialog */}
      <ResumeDialog
        open={showResumeDialog}
        onOpenChange={setShowResumeDialog}
        resumeUrl={resumeUrl}
      />
    </div>
  );
}
