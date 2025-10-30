"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/button";
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

type CompanyProfile = {
  id: number;
  email: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  employees: string;
  size: string;
  inclusion_score: number;
  certifications: string; // JSON string
  description: string;
  founded_year: number;
  company_type: string;
};

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();

  const applications = [
    {
      id: "1",
      candidateName: "Alex Johnson",
      jobTitle: "Frontend Developer",
      appliedDate: "2024-01-18",
      status: "under_review",
      accommodationsRequested: true,
      accommodationDetails: "Flexible hours, quiet workspace",
      experience: "3 years",
      score: 92,
    },
    {
      id: "2",
      candidateName: "Sam Chen",
      jobTitle: "Frontend Developer",
      appliedDate: "2024-01-17",
      status: "interview_scheduled",
      accommodationsRequested: false,
      experience: "2 years",
      score: 88,
      interviewDate: "2024-01-25",
    },
    {
      id: "3",
      candidateName: "Jordan Smith",
      jobTitle: "Frontend Developer",
      appliedDate: "2024-01-16",
      status: "shortlisted",
      accommodationsRequested: true,
      accommodationDetails: "Extended time for technical tests",
      experience: "4 years",
      score: 95,
    },
  ];

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [companyName, setCompanyName] = useState("");
  const [companyData, setCompanyData] = useState({
    name: "",
    industry: "",
    location: "",
    size: "",
  });
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [currentEmployerEmail, setCurrentEmployerEmail] = useState<string>("");
  const [inclusionSettings, setInclusionSettings] = useState({
    neurodivergentFriendly: true,
    workplaceAccommodations: true,
    equalOpportunity: true,
    accessibleRecruitment: false,
  });
  const [accommodationPolicy, setAccommodationPolicy] = useState<string>("");

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

  // Calculator
  const [baseSalary, setBaseSalary] = useState<number>(10000);
  const result = calculateEmployerCosts(baseSalary || 0);

  // Handle job deletion
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
        // Refresh the job postings
        const employerEmail = localStorage.getItem("employerEmail");
        if (employerEmail) {
          const jobsResponse = await fetch(
            `http://127.0.0.1:8000/jobs/employer/${employerEmail}`
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

  // Handle job view
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editJobData, setEditJobData] = useState<Partial<JobPosting>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const handleViewJob = (job: JobPosting) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
  };

  // Handle job edit
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

    // Basic client-side validation (example for required fields)
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
      const employerEmail = localStorage.getItem("employerEmail");
      if (employerEmail) {
        try {
          const jobsRes = await fetch(
            `http://127.0.0.1:8000/jobs/employer/${employerEmail}`
          );
          if (jobsRes.ok) {
            const jobsData = await jobsRes.json();
            setJobPostings(jobsData);
          } else {
            // Fallback to optimistic local update if refetch fails
            setJobPostings((prev) =>
              prev.map((j) => (j.id === updated.id ? updated : j))
            );
          }
        } catch {
          // Network error fallback
          setJobPostings((prev) =>
            prev.map((j) => (j.id === updated.id ? updated : j))
          );
        }
      } else {
        // No employer email available, still update locally
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

  // Handle company settings save
  const handleSaveCompanySettings = async () => {
    try {
      const employerEmail = localStorage.getItem("employerEmail");
      if (!employerEmail) {
        alert("Please log in as an employer to save settings.");
        return;
      }

      const companyData = {
        email: employerEmail,
        name: companyName,
        industry: companyIndustry,
        location: companyLocation,
        size: companySize,
        inclusion_score: companyProfile?.inclusion_score || 0,
        certifications: companyProfile?.certifications || "[]",
        description: companyProfile?.description || "",
        founded_year: companyProfile?.founded_year || null,
        company_type: companyProfile?.company_type || "",
        website: companyProfile?.website || "",
        employees: companyProfile?.employees || "",
        neurodivergent_friendly: inclusionSettings.neurodivergentFriendly,
        workplace_accommodations: inclusionSettings.workplaceAccommodations,
        equal_opportunity: inclusionSettings.equalOpportunity,
        accessible_recruitment: inclusionSettings.accessibleRecruitment,
      };

      const response = await fetch(
        `http://127.0.0.1:8000/jobs/company/${employerEmail}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(companyData),
        }
      );

      if (response.ok) {
        alert("Company settings saved successfully!");
        // Refresh the company profile data
        const updatedResponse = await fetch(
          `http://127.0.0.1:8000/jobs/company/${employerEmail}`
        );
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setCompanyProfile(updatedData);
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

  // Fetch company profile and job postings from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const employerEmail = localStorage.getItem("employerEmail") || "";
        setCurrentEmployerEmail(employerEmail);
        if (!employerEmail) {
          setIsLoading(false);
          return;
        }

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
        setCompanyData({
          name: companyData.name,
          industry: companyData.industry,
          location: companyData.location,
          size: companyData.size,
        });

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
  }, []);

  // Handle inclusion settings changes
  const handleInclusionSettingChange = (
    setting: keyof typeof inclusionSettings
  ) => {
    setInclusionSettings((prev) => {
      const next = { ...prev, [setting]: !prev[setting] };
      try {
        localStorage.setItem("inclusionSettings", JSON.stringify(next));
      } catch {}
      const trueCount = Object.values(next).filter(Boolean).length;
      const score = Math.round((trueCount / Object.keys(next).length) * 100);
      setCompanyProfile((cp) => (cp ? { ...cp, inclusion_score: score } : cp));
      return next;
    });
  };

  const handleSaveInclusionSettings = async () => {
    try {
      const employerEmail = localStorage.getItem("employerEmail");
      if (!employerEmail) {
        alert("Please log in as an employer to save settings.");
        return;
      }

      try {
        localStorage.setItem(
          "inclusionSettings",
          JSON.stringify(inclusionSettings)
        );
        localStorage.setItem("accommodationPolicy", accommodationPolicy ?? "");
      } catch {}

      const payload = {
        email: employerEmail,
        neurodivergent_friendly: inclusionSettings.neurodivergentFriendly,
        workplace_accommodations: inclusionSettings.workplaceAccommodations,
        equal_opportunity: inclusionSettings.equalOpportunity,
        accessible_recruitment: inclusionSettings.accessibleRecruitment,
        description: accommodationPolicy ?? companyProfile?.description ?? "",
        inclusion_score: companyProfile?.inclusion_score ?? 0,
      };

      const response = await fetch(
        `http://127.0.0.1:8000/jobs/company/${employerEmail}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setCompanyProfile((cp) => (cp ? { ...cp, ...updated } : cp));
        alert("Inclusion settings saved successfully!");
      } else {
        const err = await response.text();
        console.error("Failed to save inclusion settings", err);
        alert("Failed to save inclusion settings. Please try again.");
      }
    } catch (error) {
      console.error("Error saving inclusion settings", error);
      alert("An error occurred while saving inclusion settings.");
    }
  };

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
      <input
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
            onChange(Number(val.replace(/^0+/, "").replace(/-/, "")));
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
    <div className="min-h-screen bg-gradient-to-b from--50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Employer Login */}
        {/* <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200"> */}
        {/*<h3 className="text-sm font-medium text-blue-800 mb-2">Test Employer Login:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { email: "hr@neurotech.com", name: "NeuroTech Inc." },
              { email: "careers@inclusivetech.com", name: "InclusiveTech Solutions" },
              { email: "jobs@diverseworks.com", name: "DiverseWorks Corp" },
              { email: "hr@accessibledesign.com", name: "Accessible Design Co" },
              { email: "careers@inclusivefinance.com", name: "Inclusive Finance Ltd" }
            ].map((employer) => (
              <Button
                key={employer.email}
                variant="outline"
                size="sm"
                onClick={() => setTestEmployerEmail(employer.email)}
                className="text-xs"
              >
                {employer.name}
              </Button>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Current: {currentEmployerEmail || 'Not logged in'}
          </p>
        </div>*/}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          {/* Left section */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-[#3a4043] mb-1">
              Welcome back, {companyProfile?.name || "Company"}!
            </h1>
            <p className="text-gray-600 mb-4 sm:mb-0">
              Manage your job postings and find the best neurodivergent talent.
            </p>

            {/* Button visible only on small screens */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-block rounded-lg sm:hidden"
            >
              <Button
                className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 rounded-full shadow-md transition-all duration-200 hover:cursor-pointer"
                onClick={() => router.push("/post-job")}
              >
                <Plus className="h-4 w-4 mr-2" /> Post New Job
              </Button>
            </motion.div>
          </div>

          {/* Button visible only on larger screens */}
          <Button
            className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 rounded-full shadow-md transition-all duration-200 hover:cursor-pointer"
            onClick={() => router.push("/post-job")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 space-y-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold">
                    <Building className="h-6 w-6" />
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

                {/* <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#3a4043]">
                      Inclusion Score
                    </span>
                    <span className="text-sm font-medium text-[#635bff]">
                      {companyProfile?.inclusion_score || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#ff1b6b] to-[#00b4d8] h-2 rounded-full"
                      style={{ width: `${companyProfile?.inclusion_score || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Excellent inclusion practices
                  </p>
                </div> */}

                <nav className="space-y-2">
                  {[
                    { id: "overview", label: "Overview", icon: BarChart3 },
                    { id: "jobs", label: "Job Postings", icon: FileText },
                    { id: "applications", label: "Applications", icon: Users },
                    {
                      id: "settings",
                      label: "Company Settings",
                      icon: Settings,
                    },
                    {
                      id: "tax-calculator",
                      label: "Calculator",
                      icon: Calculator,
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
                <div className="grid md:grid-cols-4 gap-6">
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
                      title: "Total Applications",
                      value: applications.length,
                    },
                    {
                      icon: Eye,
                      iconColor: "text-green-600",
                      title: "Total Views",
                      value: 0,
                    },
                    {
                      icon: Shield,
                      iconColor: "text-purple-600",
                      title: "Inclusion Score",
                      value: `${companyProfile?.inclusion_score || 0}%`,
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

                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Applications</CardTitle>
                      <div className="text-sm text-[#635bff] font-medium hover:underline hover:cursor-pointer">
                        View More
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applications.slice(0, 3).map((app) => (
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
                                {app.jobTitle} • {app.experience} experience
                              </p>
                            </div>
                            {app.accommodationsRequested && (
                              <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-800 flex items-center gap-1"
                              >
                                <Shield className="h-3 w-3" /> Accommodations
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
                    </div>
                  </CardContent>
                </Card>

                {/* Company Certifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-emerald-600" /> Inclusion
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {companyProfile?.certifications
                        ? JSON.parse(companyProfile.certifications).map(
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
                        : null}
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 bg-[#635bff] hover:bg-[#524aff] text-white px-4 py-2 rounded-full font-medium shadow-sm transition-all duration-200 hover:cursor-pointer hover:text-white"
                    >
                      View All Certifications
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Job Postings Tab */}
            {activeTab === "jobs" && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-[#3a4043] mt-4">
                  Job Postings
                </h1>
                {isLoading ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500">Loading job postings...</p>
                    </CardContent>
                  </Card>
                ) : jobPostings.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500">
                        No job postings found. Create your first job posting!
                      </p>
                      <Button
                        className="mt-4 bg-[#635bff] hover:bg-[#5748e5] text-white"
                        onClick={() => router.push("/post-job")}
                      >
                        Post Your First Job
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  jobPostings.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[#3a4043] mb-1">
                              {job.job_title}
                            </h3>
                            <p className="text-[#635bff] font-medium mb-2">
                              {job.job_type}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.work_mode}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {SALARY_RANGES[job.salary_range] ??
                                  job.salary_range}
                              </span>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <strong>Experience Level:</strong>{" "}
                                {job.experience_level}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Summary:</strong> {job.job_summary}
                              </p>
                            </div>
                          </div>
                          {/* <div className="text-right"><Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge></div> */}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {(job.flexible_work_hour ||
                              job.sensory_friendly_environment ||
                              job.mental_health_support) && (
                              <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-800"
                              >
                                <Shield className="h-3 w-3 mr-1" />{" "}
                                Accommodation Friendly
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewJob(job)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditJob(job)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
            {activeTab === "applications" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-[#3a4043] mt-4">
                    Applications
                  </h1>
                  <div className="flex gap-2">
                    <Button variant="outline">Filter</Button>
                    <Button variant="outline">Sort</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {applications.map((app) => (
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
                              <span>Applied: {app.appliedDate}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            {app.interviewDate && (
                              <p className="text-xs text-blue-600 mt-1">
                                Interview: {app.interviewDate}
                              </p>
                            )}
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
                            <Button variant="outline" size="sm">
                              Schedule Interview
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#635bff] hover:bg-[#5346e6] text-white"
                            >
                              Shortlist
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-[#3a4043] mt-4">
                  Company Settings
                </h1>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Company Name
                        </label>
                        <input
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
                        <input
                          type="text"
                          value={currentEmployerEmail}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                          onChange={(e) =>
                            setCurrentEmployerEmail(e.target.value)
                          }
                          placeholder="Please enter company email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Industry
                        </label>
                        <input
                          type="text"
                          value={companyIndustry}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                          onChange={(e) => setCompanyIndustry(e.target.value)}
                          placeholder="Please enter industry"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={companyLocation}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                          onChange={(e) => setCompanyLocation(e.target.value)}
                          placeholder="Please enter company location"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Company Size
                        </label>
                        <select
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
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
                      <Button
                        className="bg-[#635bff] hover:bg-[#5346e6] text-white"
                        onClick={handleSaveCompanySettings}
                      >
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Inclusion Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(inclusionSettings).map(([key, value]) => (
                        <div key={key}>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={() =>
                                handleInclusionSettingChange(
                                  key as keyof typeof inclusionSettings
                                )
                              }
                              className="text-[#635bff]"
                            />
                            <span className="text-sm">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>
                          </label>
                        </div>
                      ))}
                      {/* <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Accommodation Policy</label>
                        <textarea rows={3} className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]" placeholder="Describe your workplace accommodation policies..." />
                      </div>
                      <Button className="bg-[#635bff] hover:bg-[#5346e6] text-white">Update Policies</Button> */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Accommodation Policy
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                          placeholder="Describe your workplace accommodation policies..."
                          value={accommodationPolicy}
                          onChange={(e) =>
                            setAccommodationPolicy(e.target.value)
                          }
                        />
                      </div>
                      <Button
                        className="bg-[#635bff] hover:bg-[#5346e6] text-white"
                        onClick={handleSaveInclusionSettings}
                      >
                        Save Inclusion Settings
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
                  <div className="text-sm text-[#3a4043] ml-6">
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
                            neuro: result.baseSalary.toFixed(2),
                            oku: result.monthlyEmployerCost.toFixed(2),
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

            {/* // Edit Job Modal */}
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
