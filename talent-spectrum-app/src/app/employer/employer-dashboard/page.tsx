// talent-spectrum-app/src/app/employer/employer-dashboard/pages.tsx
"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react"; // Added useRef, ChangeEvent
import { Button } from "@/app/components/button";
import { Camera } from 'lucide-react'; // Imported Camera icon
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
  X,
  Briefcase,
  Book,
  Info,
  XCircle,
  Calendar,
  Search,
  User,
  SquarePen, // Added SquarePen icon, 
  BotMessageSquare
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
import MatchedCandidates from "@/app/employer/component/MatchedCandidates";

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

  // Calculator
  const [baseSalary, setBaseSalary] = useState<number>(10000);
  const result = calculateEmployerCosts(baseSalary || 0);

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
  const handleShortlist = (candidate: MatchedCandidate) => {
    const newApplicant = {
      id: candidate.id,
      candidateName: candidate.candidateSummary.name,
      jobTitle: candidate.jobTitle,
      appliedDate: new Date().toISOString().split("T")[0],
      status: "shortlisted",
      accommodationsRequested:
        candidate.candidateSummary.accommodations.length > 0,
      accommodationDetails:
        candidate.candidateSummary.accommodations.join(", "),
      experience: candidate.candidateSummary.experienceSummary,
      score: candidate.overallMatchPercentage,
    };

    setShortlistedCandidates((prev) => [...prev, newApplicant]);
    alert(
      `${candidate.candidateSummary.name} has been shortlisted and added to Applicants tab!`
    );
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job posting?")) {
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Job deleted successfully!");
        if (currentEmployerEmail) {
          const jobsResponse = await fetch(
            `http://127.0.0.1:8000/jobs/employer/${currentEmployerEmail}`
          );
          if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            setJobPostings(jobsData);
          }
        }
      } else {
        alert("Failed to delete job. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("An error occurred while deleting the job.");
    }
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
      const res = await fetch(`http://127.0.0.1:8000/jobs/${editJobData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editJobData),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update job");
      }

      const updated = await res.json();

      // Refresh job postings from server for immediate consistency
      if (currentEmployerEmail) {
        try {
          const jobsRes = await fetch(
            `http://127.0.0.1:8000/jobs/employer/${currentEmployerEmail}`
          );
          if (jobsRes.ok) {
            const jobsData = await jobsRes.json();
            setJobPostings(jobsData);
          } else {
            setJobPostings((prev) =>
              prev.map((j) => (j.id === updated.id ? updated : j))
            );
          }
        } catch {
          setJobPostings((prev) =>
            prev.map((j) => (j.id === updated.id ? updated : j))
          );
        }
      } else {
        setJobPostings((prev) =>
          prev.map((j) => (j.id === updated.id ? updated : j))
        );
      }

      setIsEditModalOpen(false);
      setSelectedJob(null);
    } catch (err: any) {
      setErrors({ general: err.message || "Update failed" });
    }
  };

// Function to handle logo upload
const handleLogoUpload = async (file: File) => {
  if (!currentEmployerEmail) {
    alert("Please log in as an employer to upload a logo.");
    return;
  }
  // Add this check if companyProfile.name is needed by backend for filename
  // and companyProfile might not be loaded yet.
  if (!companyProfile || !companyProfile.name) {
    alert("Company profile not loaded. Cannot upload logo.");
    return;
  }

  // Optional: Set a loading state here (e.g., setIsUploading(true))
  // to provide user feedback.

  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/jobs/company/${currentEmployerEmail}/upload-company-logo`,
      {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type header for FormData, browser does it automatically
      }
    );

    if (response.ok) {
      const data = await response.json();
      const newLogoUrl = data.logo_url; // Get the new logo URL from the backend response

      setCompanyLogo(newLogoUrl); // Update the logo displayed in the UI

      // Update the companyProfile state with the new logo_url for consistency
      setCompanyProfile(prevProfile => {
        if (prevProfile) {
          return { ...prevProfile, logo_url: newLogoUrl };
        }
        return null;
      });

      alert("Company logo uploaded successfully!");

      // REMOVED: await handleSaveCompanySettings(data.logo_url);
      // The backend's /upload-company-logo endpoint already updates the DB.
      // This call is no longer needed for the logo_url itself.

    } else {
      const errorText = await response.text();
      console.error("Error uploading logo:", errorText);
      alert(`Failed to upload logo: ${errorText}`); // Display the backend's error message
    }
  } catch (error) {
    console.error("Network error during logo upload:", error);
    alert("An error occurred during logo upload.");
  } finally {
    // Optional: Reset loading state here (e.g., setIsUploading(false))
  }
};

// Handler for when a file is selected
const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  if (event.target.files && event.target.files[0]) {
    handleLogoUpload(event.target.files[0]);
  }
};

  // Handle company settings save (now accepts an optional logoUrl to update)
  const handleSaveCompanySettings = async (newLogoUrl: string | null = null) => {
    if (!currentEmployerEmail) {
      alert("Please log in as an employer to save settings.");
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
        `http://127.0.0.1:8000/jobs/company/${currentEmployerEmail}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(companyData),
        }
      );

      if (response.ok) {
        // Only show alert if it's not part of a logo upload chain
        if (newLogoUrl === null) {
            alert("Company settings saved successfully!");
        }
        // Refresh the company profile data
        const updatedResponse = await fetch(
          `http://127.0.0.1:8000/jobs/company/${currentEmployerEmail}`
        );
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setCompanyProfile(updatedData);
          setCompanyName(updatedData.name);
          setCompanyIndustry(updatedData.industry);
          setCompanyLocation(updatedData.location);
          setCompanySize(updatedData.size);
          setCompanyLogo(updatedData.logo_url || null); // Update logo from fetched data
        }
      } else {
        let errorText: string;
        try {
          errorText = await response.text();
        } catch {
          errorText = "Unknown error";
        }
        console.error("Error saving company settings:", errorText);
        alert("Failed to save company settings. Please try again.");
      }
    } catch (error) {
      console.error("Error saving company settings:", error);
      alert("An error occurred while saving company settings.");
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
          `http://127.0.0.1:8000/jobs/company/${employerEmail}`
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
            "http://127.0.0.1:8000/jobs/company/",
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
        setCompanyLogo(companyData.logo_url || null); // Initialize logo from fetched data

        const jobsResponse = await fetch(
          `http://127.0.0.1:8000/jobs/employer/${employerEmail}`
        );
        if (jobsResponse.ok) setJobPostings(await jobsResponse.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session, status, router]);

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
        className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-[#3a4043] mb-1">
              Welcome back, {companyProfile?.name || "Company"}!
            </h1>
            <p className="text-gray-600 mb-4 sm:mb-0">
              Manage your job postings and find the best neurodivergent talent.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 space-y-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                    {companyLogo && companyLogo.trim() !== "" ? (
                      <img
                        src={
                          companyLogo.startsWith("http")
                            ? companyLogo
                            : `/logo/${companyLogo.replace(/^\/?logo\//, "")}`
                        }
                        alt="Company Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // hide broken image and show fallback icon
                          (e.target as HTMLImageElement).style.display = "none";
                          const fallback = document.createElement("div");
                          fallback.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6 text-white mx-auto' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 21h18M9 8h6m-3-5v5m4 0h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2' /></svg>`;
                          e.currentTarget.parentElement?.appendChild(fallback);
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
                    { id: "jobs", label: "Job Posted", icon: FileText },
                    {
                      id: "search-candidates",
                      label: "Search Candidates",
                      icon: Search,
                    },
                    { id: "applications", label: "Applicants", icon: Users },
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
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors hover:cursor-pointer ${
                          activeTab === item.id
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
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-4">
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
                      value: shortlistedCandidates.length,
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
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Side - Job Postings List */}
                <div className="lg:col-span-1 space-y-4">
                  <h2 className="text-xl font-bold text-[#3a4043]">
                    Job Postings ({jobPostings.length})
                  </h2>
                  <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
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
                            className="bg-[#635bff] hover:bg-[#5748e5] text-white"
                            onClick={() => setActiveTab("post-job")}
                          >
                            Post Your First Job
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      jobPostings.map((job) => (
                        <motion.div
                          key={job.id}
                          whileHover={{ x: 4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all ${
                              selectedJobForApplicants?.id === job.id
                                ? "border-2 border-[#635bff] bg-violet-50"
                                : "hover:border-[#635bff]/50"
                            }`}
                            onClick={() => setSelectedJobForApplicants(job)}
                          >
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-[#3a4043] mb-1 line-clamp-1">
                                {job.job_title}
                              </h3>
                              <p className="text-sm text-[#635bff] mb-2">
                                {job.job_type}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {SALARY_RANGES[job.salary_range] ??
                                    job.salary_range}
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewJob(selectedJobForApplicants)
                                }
                              >
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEditJob(selectedJobForApplicants)
                                }
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteJob(selectedJobForApplicants.id)
                                }
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
                          <p className="text-sm text-gray-700">
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
            )}

            {/* Search Candidates Tab */}
            {activeTab === "search-candidates" && (
              <div>
                {/* Import and use CandidateList component here */}
                <p className="text-gray-600 mb-4">
                  Search through all available candidates in the talent pool
                </p>
                {/* You'll need to import CandidateList component from document 3 */}
                <CandidateList />
              </div>
            )}

            {/* Applicants Tab */}
            {activeTab === "applications" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-[#3a4043] mt-4">
                    Shortlisted Applicants
                  </h1>
                  <div className="flex gap-2">
                    <Button variant="outline">Filter</Button>
                    <Button variant="outline">Sort</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {shortlistedCandidates.length > 0 ? (
                    shortlistedCandidates.map((app) => (
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
                                    className={`h-4 w-4 ${
                                      star <= Math.floor(app.score / 20)
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
                          No Shortlisted Candidates Yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Start shortlisting candidates from your job postings
                          to see them here.
                        </p>
                        <Button
                          className="bg-[#635bff] hover:bg-[#5748e5] text-white"
                          onClick={() => setActiveTab("jobs")}
                        >
                          View Job Postings
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-[#3a4043] mt-4">
                  Company Settings
                </h1>

                {/* Changed to full width (md:grid-cols-1) */}
                <div className="grid md:grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
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
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
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
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
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
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
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
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Company Size
                        </label>
                        <select
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg text-[#3a4043] bg-white"
                        >
                          <option value="1-10 employees">1-10 employees</option>
                          <option value="11-50 employees">
                            11-50 employees
                          </option>
                          <option value="50-100 employees">
                            50-100 employees
                          </option>
                          <option value="100-500 employees">
                            100-500 employees
                          </option>
                          <option value="500+ employees">500+ employees</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="companyLogoInput" className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                        <div className="flex items-center space-x-4">
                          {companyLogo ? (
                            <img
                              src={`${companyLogo}`}
                              alt="Company Logo"
                              className="w-20 h-20 rounded-full object-cover border border-gray-200"
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
                          >
                            Upload New Logo
                          </Button>
                        </div>
                      </div>
                      <Button
                        className="bg-[#635bff] hover:bg-[#5346e6] text-white"
                        onClick={() => handleSaveCompanySettings()} // Call without newLogoUrl to save other settings
                      >
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "tax-calculator" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[#3a4043] mt-4">
                  Double Tax Relief Calculator
                </h1>
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Employer Cost Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
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
                            className={`border-t ${
                              row.category ===
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
              <PostJob
                onJobPosted={() => setActiveTab("jobs")}
                onCancel={() => setActiveTab("overview")}
              />
            )}

            {activeTab === "consult-ai" && (
              <>
                <Card>
                  <ChatBot.Chat />
                </Card>
              </>
            )}
          {/* // View Job Modal */}
            <ViewJobModal
              isOpen={isViewModalOpen}
              job={selectedJob}
              salaryRanges={SALARY_RANGES}
              onClose={() => setIsViewModalOpen(false)}
              onEdit={() => {
                setIsViewModalOpen(false);
                selectedJob && handleEditJob(selectedJob);
              }}
            />

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