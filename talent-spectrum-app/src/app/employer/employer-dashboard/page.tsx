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
  Plus,
  Eye,
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
  Heart,
  Star,
  BarChart3,
  Calculator,
  UserSearch,
  X,
  Briefcase,
  Book,
  Info,
  XCircle,
  Calendar,
  Search,
  ArrowUpDown,
  SquarePen, // Added SquarePen icon, 
  BotMessageSquare,
  Filter,
  SortAsc,
  Sparkles
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
import ViewJobModal from "@/app/employer/component/ViewJobModal";
import EditJobModal from "@/app/employer/component/EditJobModal";
import CandidateList from "@/app/employer/component/CandidateSearch";
import AllCandidates from "@/app/employer/component/AllCandidates";
import MatchedCandidates from "@/app/employer/component/MatchedCandidates";
import { useToastHelpers } from "@/components/ui/toast";

// Import the PostJob component
import PostJob from "@/app/employer/post-job/page"; // Adjust this path if necessary based on your file structure

// Assuming these are custom components, if not, replace with standard HTML input/textarea or import from your UI library
import { Input } from "@/app/components/input"; // Assuming you have an Input component
import { Checkbox } from "@/app/components/checkbox"; // Assuming you have a Checkbox component
import { Textarea } from "@/app/components/textarea"; // Assuming you have a Textarea component
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

  // Search states for filtering
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [applicantSearchTerm, setApplicantSearchTerm] = useState("");
  
  // Filter states for Job Postings
  const [jobFilterStatus, setJobFilterStatus] = useState("all");
  
  // Filter states for Shortlisted Applicants
  const [applicantFilterStatus, setApplicantFilterStatus] = useState("all");
  const [applicantSortBy, setApplicantSortBy] = useState("recent");

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
      shortlisted: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge
        variant="secondary"
        className={badgeStyles[status] || "bg-gray-100 text-gray-800"}
      >
        {status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </Badge>
    );
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
    showConfirm({
      title: "Close Job Posting",
      message: "Are you sure you want to close this job posting? Closed jobs won't be visible to candidates.",
      confirmText: "Close Job",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          // Find the job to get its current data
          const job = jobPostings.find(j => j.id === jobId);
          if (!job) {
            showError("Error", "Job not found");
            return;
          }

          const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...job,
              status: "closed"
            }),
          });

          if (response.ok) {
            success("Job Closed", "Job posting closed successfully!");
            // Clear selection if closed job was selected
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
            showError("Close Failed", "Failed to close job. Please try again.");
          }
        } catch (error) {
          console.error("Error closing job:", error);
          showError("Error", "An error occurred while closing the job.");
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
          if (shortlistResponse.ok) {
            const shortlistData = await shortlistResponse.json();
            // Transform backend data to match frontend state structure
            const transformedData = shortlistData.map((item: any) => ({
              id: item.id,
              candidateName: item.candidate_name,
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
          console.error("Error fetching shortlisted candidates:", err);
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
    "Oldest",
    "A-Z",
    "Work Mode",
    "Job Type",
    "Experience Level",
    "Salary"
  ]

  const sortedJobPostings = [...jobPostings]
    .filter((job) => {
      // Search filter
      const matchesSearch = !jobSearchTerm || 
        job.job_title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.job_type.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.work_mode.toLowerCase().includes(jobSearchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = jobFilterStatus === "all" || 
        (job.status && job.status.toLowerCase() === jobFilterStatus.toLowerCase());
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "Newest":
          return b.id - a.id; // higher ID = newer
        case "Oldest":
          return a.id - b.id; // lower ID = older
        case "A-Z":
          return a.job_title.localeCompare(b.job_title);
        case "Work Mode":
          return a.work_mode.localeCompare(b.work_mode);
        case "Job Type":
          return a.job_type.localeCompare(b.job_type);
        case "Experience Level":
          return a.experience_level.localeCompare(b.experience_level);
        case "Salary":
          return b.salary_range - a.salary_range;
        default:
          return 0;
      }
    });

  const filteredShortlistedCandidates = shortlistedCandidates
    .filter((app) => {
      // Search filter
      const matchesSearch = !applicantSearchTerm || 
        app.candidateName.toLowerCase().includes(applicantSearchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(applicantSearchTerm.toLowerCase()) ||
        app.status.toLowerCase().includes(applicantSearchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = applicantFilterStatus === "all" || 
        app.status.toLowerCase() === applicantFilterStatus.toLowerCase();
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (applicantSortBy) {
        case "recent":
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        case "match":
          return (b.score || 0) - (a.score || 0);
        case "name":
          return a.candidateName.localeCompare(b.candidateName);
        default:
          return 0;
      }
    });

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
                    {
                      id: "search-candidates",
                      label: "Search Applicants",
                      icon: Search,
                    },
                    
                    { id: "applications", label: "Shortlisted Applicants", icon: Users },
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
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-[#3a4043]">
                    Overview
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
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: FileText,
                      iconColor: "text-[#635bff]",
                      title: "Active Jobs",
                      value: jobPostings.length,
                      onClick: () => setActiveTab("jobs"),
                    },
                    {
                      icon: Users,
                      iconColor: "text-blue-600",
                      title: "Total Applicants",
                      value: totalCandidates,
                      onClick: () => setActiveTab("search-candidates"),
                    },
                    {
                      icon: Eye,
                      iconColor: "text-green-600",
                      title: "Total Views",
                      value: 0,
                    },
                  ].map((card) => (
                    <Card
                      key={card.title}
                      onClick={card.onClick}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <CardContent className="p-6 text-center">
                        <card.icon
                          className={`h-8 w-8 mx-auto mb-2 ${card.iconColor}`}
                        />
                        <h3 className="font-semibold text-[#3a4043] mb-1">
                          {card.value}
                        </h3>
                        <p className="text-sm text-gray-600">{card.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Applicants</CardTitle>
                      <div
                        className="text-sm text-[#635bff] font-medium hover:underline hover:cursor-pointer"
                        onClick={() => setActiveTab("applications")}
                      >
                        View More
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {shortlistedCandidates.slice(0, 3).map((app) => (
                        <motion.div
                          key={app.id}
                          whileHover={{
                            boxShadow: "2px 2px 4px rgba(99,91,255,0.3)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="flex items-center justify-between p-4 border border-[#9d95bd] rounded-xl overflow-hidden bg-white hover:cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(app.status)}
                            <div>
                              <h4 className="font-medium text-[#3a4043]">
                                {app.candidateName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {app.jobTitle} • {app.experience}
                              </p>
                            </div>
                            {app.accommodationsRequested && (
                              <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-800 flex items-center gap-1"
                              >
                                <Shield className="h-3 w-3 mr-1" /> Accommodations
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            <p className="text-xs text-gray-500 mt-1">
                              Score: {app.score}%
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {shortlistedCandidates.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          No applicants yet. Start matching candidates!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-emerald-600" /> Inclusion
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {companyProfile?.certifications &&
                        JSON.parse(companyProfile.certifications).length > 0 ? (
                        JSON.parse(companyProfile.certifications).map(
                          (cert: string) => (
                            <Badge
                              key={cert}
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-800"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> {cert}
                            </Badge>
                          )
                        )
                      ) : (
                        <p className="text-sm text-gray-500">
                          No certifications listed.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Job Postings Tab - Split View with Matched Candidates */}
            {activeTab === "jobs" && (
              <div className="space-y-4">
                {/* Header */}
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-[#3a4043]">Job Postings</h2>
                  <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button>
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
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left Side - Job Postings List */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto overflow-x-visible pr-5">
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
                      sortedJobPostings.map((job) => (
                        <motion.div key={job.id} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300 }}>
                          <Card
                            className={`cursor-pointer transition-all ${selectedJobForApplicants?.id === job.id
                              ? "border-2 border-[#635bff] bg-violet-50"
                              : "hover:border-[#635bff]/50"
                              }`}
                            onClick={() => setSelectedJobForApplicants(job)}
                          >
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-[#3a4043] mb-1 truncate">
                                {job.job_title}
                              </h3>

                              <p className="text-sm text-[#635bff] mb-2 truncate">
                                {job.job_type}
                              </p>

                              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 overflow-hidden whitespace-nowrap">
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{job.location}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-600 overflow-hidden whitespace-nowrap">
                                <span className="flex items-center gap-1 truncate">
                                  <DollarSign className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {SALARY_RANGES[job.salary_range] ?? job.salary_range}
                                  </span>
                                </span>
                              </div>

                              {(job.flexible_work_hour ||
                                job.sensory_friendly_environment ||
                                job.mental_health_support) && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-purple-100 text-purple-800 mt-2 text-xs"
                                  >
                                    <Shield className="h-3 w-3 mr-1" />
                                    Inclusive
                                  </Badge>
                                )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Side - Selected Job Details & Matched Candidates */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedJobForApplicants ? (
                    <>
                      {/* Job Details Card */}
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-2xl">
                                {selectedJobForApplicants.job_title}
                              </CardTitle>
                              <p className="text-[#635bff] font-medium mt-1">
                                {selectedJobForApplicants.job_type}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {/* <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewJob(selectedJobForApplicants)
                                }
                              >
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button> */}
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
                                className="border-red-600 text-red-600 hover:bg-red-50 hover:cursor-pointer hover:text-red-700"
                                onClick={() => handleCloseJob(selectedJobForApplicants.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Close Job
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
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              {selectedJobForApplicants.location}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              {selectedJobForApplicants.work_mode}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              {SALARY_RANGES[
                                selectedJobForApplicants.salary_range
                              ] ?? selectedJobForApplicants.salary_range}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Briefcase className="h-4 w-4" />
                              {selectedJobForApplicants.experience_level}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {selectedJobForApplicants.job_summary}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Matched Candidates Section */}
                      <MatchedCandidates
                        jobTitle={selectedJobForApplicants.job_title}
                        onShortlist={handleShortlist}
                      />
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
                  <h2 className="text-2xl font-bold text-[#3a4043]">Search Applicants</h2>
                  <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button>
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

            {/* Applicants Tab */}
            {activeTab === "applications" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[#3a4043]">Shortlisted Applicants</h2>
                  <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button>
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
                            placeholder="Search applicants by name, job title, or status..."
                            value={applicantSearchTerm}
                            onChange={(e) => setApplicantSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="flex gap-4">
                        <Select value={applicantFilterStatus} onValueChange={setApplicantFilterStatus}>
                          <SelectTrigger className="w-52">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={applicantSortBy} onValueChange={setApplicantSortBy}>
                          <SelectTrigger className="w-40">
                            <SortAsc className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recent">Most Recent</SelectItem>
                            <SelectItem value="match">Best Match</SelectItem>
                            <SelectItem value="name">Name A-Z</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="mb-6 ml-2">
                  <p className="text-[#6f7a80] text-sm">
                    Showing {filteredShortlistedCandidates.length} of {shortlistedCandidates.length} shortlisted applicants
                  </p>
                </div>

                <div className="space-y-4">
                  {filteredShortlistedCandidates.length > 0 ? (
                    filteredShortlistedCandidates.map((app) => (
                      <Card key={app.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-[#3a4043] mb-1">
                                {app.candidateName}
                              </h3>
                              <p className="text-[#635bff] font-medium mb-2">
                                Applied for: {app.jobTitle}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Experience: {app.experience}</span>
                                <span>Match Score: {app.score}%</span>
                                <span>Shortlisted: {app.appliedDate}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(app.status)}
                            </div>
                          </div>
                          {app.accommodationsRequested && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                              <div className="flex items-start gap-2">
                                <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-purple-800">
                                    Accommodations Requested
                                  </p>
                                  <p className="text-sm text-purple-700">
                                    {app.accommodationDetails}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= Math.floor(app.score / 20)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                ({app.score}% match)
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View Profile
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-green-600 text-green-600 hover:bg-green-50"
                              >
                                <Calendar className="h-4 w-4 mr-1" />
                                Schedule Interview
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[#635bff] hover:bg-[#5346e6] text-white"
                              >
                                Contact
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[#3a4043] mb-2">
                          {applicantSearchTerm 
                            ? "No Matching Applicants Found" 
                            : "No Shortlisted Candidates Yet"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {applicantSearchTerm
                            ? "Try adjusting your search terms"
                            : "Start shortlisting candidates from your job postings to see them here."}
                        </p>
                        {!applicantSearchTerm && (
                          <Button
                            className="bg-[#635bff] hover:bg-[#5748e5] text-white hover:cursor-pointer"
                            onClick={() => setActiveTab("jobs")}
                          >
                            View Job Postings
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[#3a4043]">Company Settings</h2>
                  <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button>
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
                  <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button>
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
                  <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button>
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
                  <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Run AI Matching"}
                  </Button>
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
    </div>
  );
}

function fetchEmployerJobs(currentEmployerEmail: string) {
  throw new Error("Function not implemented.");
}
