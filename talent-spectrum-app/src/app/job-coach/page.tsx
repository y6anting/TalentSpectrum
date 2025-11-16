"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Input } from "@/app/components/input";
import { Textarea } from "@/app/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import {
  Search,
  Users,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  Eye,
  MessageCircle,
  Calendar,
  TrendingUp,
  AlertCircle,
  Shield,
  Target,
  Filter,
  SortAsc,
  Settings,
  CalendarClock,
  User,
  Mail,
  Briefcase,
  Save,
  Camera,
  Upload,
  Sparkles,
  X,
  Download,
  FileText,
  GraduationCap,
  Code,
} from "lucide-react";
import { motion } from "motion/react";
import AppointmentPage from "@/app/candidate/candidate-dashboard/Appointment/page";
import JobCoachAppointmentPage from "@/app/job-coach/Appointment/page";
import { useToastHelpers } from "@/components/ui/toast";
import { useRef, ChangeEvent } from "react";
import * as ChatBot from "@/app/chat-bot";

export default function JobCoachDashboard() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { success, error: showError } = useToastHelpers();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileSettingsFileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("candidates");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [profileData, setProfileData] = useState({
    name: "",
    organization: "",
    specializations: [] as string[],
    certifications: [] as string[],
    bio: "",
    experience_years: null as number | null,
    email: "",
    profile_picture_url: "" as string | undefined,
  });
  const [assignedCandidates, setAssignedCandidates] = useState<string[]>([]);
  const [candidateReports, setCandidateReports] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // View Profile Dialog state
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [candidateReportData, setCandidateReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Fetch job coach profile and data on mount
  useEffect(() => {
    const fetchJobCoachData = async () => {
      if (sessionStatus === "loading") {
        return;
      }
      
      if (sessionStatus === "unauthenticated") {
        router.push("/login");
        return;
      }

      const coachEmail = session?.user?.email;
      if (!coachEmail) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch profile
        const profileResponse = await fetch(`/api/job-coach/profile?coachEmail=${encodeURIComponent(coachEmail)}`);
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          if (profile) {
            setProfileData({
              name: profile.name || "",
              organization: profile.organization || "",
              specializations: profile.specializations || [],
              certifications: profile.certifications || [],
              bio: profile.bio || "",
              experience_years: profile.experience_years || null,
              email: coachEmail,
              profile_picture_url: profile.profile_picture_url || "",
            });
            setProfilePictureUrl(profile.profile_picture_url || "");
          } else {
            // Profile doesn't exist, use defaults
            setProfileData({
              name: session.user.name || "",
              organization: "",
              specializations: [],
              certifications: [],
              bio: "",
              experience_years: null,
              email: coachEmail,
              profile_picture_url: "",
            });
          }
        }

        // Fetch assigned candidates
        const candidatesResponse = await fetch(`/api/job-coach/candidates?coachEmail=${encodeURIComponent(coachEmail)}`);
        if (candidatesResponse.ok) {
          const candidatesData = await candidatesResponse.json();
          setAssignedCandidates(candidatesData.assigned_candidates || []);
        }

        // Fetch candidate reports
        const reportsResponse = await fetch(`/api/job-coach/candidate-reports?coachEmail=${encodeURIComponent(coachEmail)}`);
        if (reportsResponse.ok) {
          const reports = await reportsResponse.json();
          setCandidateReports(reports || []);
        }
      } catch (error) {
        console.error("Error fetching job coach data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobCoachData();
  }, [session, sessionStatus, router]);

  // Fetch all candidates from database
  useEffect(() => {
    const fetchAllCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${API_BASE}/profiles/`);
        
        if (!response.ok) {
          console.error("Failed to fetch candidates:", response.status);
          return;
        }

        const profilesData = await response.json();
        const allProfiles = Array.isArray(profilesData) ? profilesData : [];

        // Transform profiles to match the candidate structure expected by the UI
        const transformedCandidates = allProfiles.map((profile: any, index: number) => {
          const email = profile.candidate_email || profile.email || "";
          // Get name from profile, fallback to email username, but never show "Unknown"
          const name = profile.name || profile.personal_identifiers?.fullName || profile.personal_identifiers?.name || email.split('@')[0] || email;
          const personalIdentifiers = profile.personal_identifiers || {};
          
          // Get location from profile
          const location = personalIdentifiers.location || profile.location || "Not specified";
          
          // Get job title/position from experience or profile
          const experiences = profile.experiences || [];
          const currentJob = experiences.find((exp: any) => exp.is_current) || experiences[0];
          const title = currentJob?.job_title || profile.desired_position || "Not specified";
          
          // Get mock interview results from candidate reports
          const candidateReport = candidateReports.find((r: any) => r.candidate_email === email);
          const overallScore = candidateReport?.overall_score;
          const mockInterviewResult = overallScore !== undefined && overallScore !== null
            ? `Overall Score: ${overallScore}/100`
            : "No interview data yet";
          
          // Calculate progress (placeholder - can be enhanced based on profile completion)
          const profileCompletion = profile.profile_completion || 0;
          const progress = Math.min(profileCompletion, 100);
          
          // Determine status based on assigned candidates
          const isAssigned = assignedCandidates.includes(email);
          const status = isAssigned ? "active" : "available";
          
          // Get neurodivergent strengths for badge display
          const neurodivergentStrengths = profile.neurodivergent_strengths || [];
          const strengthsArray = Array.isArray(neurodivergentStrengths) 
            ? neurodivergentStrengths 
            : (neurodivergentStrengths.strengths || []);
          
          return {
            id: email || `candidate-${index}`,
            email: email,
            name: name,
            title: title,
            location: location,
            status: status,
            lastSession: candidateReport?.created_at 
              ? new Date(candidateReport.created_at).toLocaleDateString()
              : null, // Don't show "No sessions yet", just don't display anything
            nextSession: null, // Can be enhanced with appointment data
            progress: progress,
            needsHelp: progress < 50,
            growthTrend: progress > 75 ? "up" : progress > 50 ? "stable" : "down",
            keyStrengths: strengthsArray.length > 0 ? strengthsArray : (profile.strengths || []),
            neurodivergent_strengths: strengthsArray,
            areasForImprovement: profile.areas_for_improvement || ["Complete profile"],
            matchScore: candidateReport?.overall_score || 0,
            experience: currentJob ? `${new Date().getFullYear() - (new Date(currentJob.start_date || new Date()).getFullYear())} years` : "Not specified",
            accommodations: personalIdentifiers.accommodations || [],
            mockInterviewResult: mockInterviewResult,
          };
        });

        setCandidates(transformedCandidates);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoadingCandidates(false);
      }
    };

    // Fetch candidates when component mounts or when assignedCandidates/candidateReports change
    if (session?.user?.email) {
      fetchAllCandidates();
    }
  }, [session?.user?.email, assignedCandidates, candidateReports]);

  // Function to handle profile picture upload
  const handleProfilePictureUpload = async (file: File) => {
    const coachEmail = session?.user?.email;
    if (!coachEmail) {
      showError("Not Logged In", "Please log in to upload a profile picture.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/job-coach/profile/${encodeURIComponent(coachEmail)}/upload-profile-picture`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newPictureUrl = data.profile_picture_url;
        
        console.log("Profile picture uploaded successfully. Backend returned:", newPictureUrl);
        
        // Update profile picture state immediately - the key prop on img will force re-render
        setProfilePictureUrl(newPictureUrl);
        
        // Update profileData state with the new profile_picture_url
        setProfileData(prev => ({
          ...prev,
          profile_picture_url: newPictureUrl
        }));
        
        success("Profile Picture Uploaded", "Profile picture uploaded successfully!");
      } else {
        const errorText = await response.text();
        console.error("Error uploading profile picture:", errorText);
        showError("Upload Failed", `Failed to upload profile picture: ${errorText}`);
      }
    } catch (error) {
      console.error("Network error during profile picture upload:", error);
      showError("Network Error", "An error occurred during profile picture upload.");
    }
  };

  // Handler for when a file is selected
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleProfilePictureUpload(event.target.files[0]);
      // Clear the file input so the same file can be selected again
      event.target.value = '';
    }
  };

  // Function to handle profile save
  const handleProfileSave = async () => {
    const coachEmail = session?.user?.email;
    if (!coachEmail) {
      showError("Not Logged In", "Please log in to save your profile.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/job-coach/profile?coachEmail=${encodeURIComponent(coachEmail)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: profileData.name,
            organization: profileData.organization,
            specializations: profileData.specializations,
            certifications: profileData.certifications,
            bio: profileData.bio,
            experience_years: profileData.experience_years,
          }),
        }
      );

      if (response.ok) {
        const savedProfile = await response.json();
        console.log("Profile saved successfully:", savedProfile);
        
        // Update local state with saved data
        setProfileData(prev => ({
          ...prev,
          ...savedProfile,
        }));
        
        success("Profile Saved", "Your profile has been saved successfully!");
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to save profile" }));
        console.error("Error saving profile:", errorData);
        showError("Save Failed", errorData.error || errorData.detail || "Failed to save profile. Please try again.");
      }
    } catch (error) {
      console.error("Network error during profile save:", error);
      showError("Network Error", "An error occurred while saving your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate candidate stats from fetched data
  const candidateStats = {
    totalCandidates: candidates.length,
    activeCandidates: candidates.filter(c => c.status === "active").length,
    completedCandidates: candidates.filter(c => c.status === "completed").length,
    needsHelp: candidates.filter(c => c.needsHelp).length,
  };

  const getStatusBadge = (candidate: any) => {
    // Show first strength as badge (matching Talent Pool format)
    const strengths = candidate?.keyStrengths || candidate?.neurodivergent_strengths || [];
    if (strengths.length > 0 && Array.isArray(strengths)) {
      const firstStrength = strengths[0];
      if (firstStrength && firstStrength !== "Profile in progress") {
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
            {firstStrength}
          </Badge>
        );
      }
    }
    // Fallback to status if no strengths available
    const status = candidate?.status || "available";
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Available
          </Badge>
        );
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case "stable":
        return <Target className="w-4 h-4 text-blue-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  // Use fetched candidates
  const candidatesToDisplay = candidates;
  
  const filteredCandidates = candidatesToDisplay.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || candidate.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Sort filtered candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        const dateA = a.lastSession ? new Date(a.lastSession).getTime() : 0;
        const dateB = b.lastSession ? new Date(b.lastSession).getTime() : 0;
        return dateB - dateA; // Most recent first
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "score":
        return (b.matchScore || 0) - (a.matchScore || 0); // Highest score first
      default:
        return 0;
    }
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCandidates = sortedCandidates.slice(startIndex, endIndex);

  // Reset to page 1 when search/filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortBy]);

  // Generate areas for improvement based on Candidate_Profiles data (same as Report page)
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
    
    if (profile.profile_completion && profile.profile_completion < 70) {
      areas.push("Complete more sections of your profile to increase your profile completion score");
    }
    
    return areas;
  };

  // Handle View Profile - fetch candidate report (same as Candidate Dashboard Report tab)
  const handleViewProfile = async (candidateEmail: string) => {
    setSelectedCandidateEmail(candidateEmail);
    setShowProfileDialog(true);
    setLoadingReport(true);
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      // 1. Fetch profile data
      const profileResponse = await fetch(`${API_BASE}/profiles/${encodeURIComponent(candidateEmail)}`);
      const profileData = profileResponse.ok ? await profileResponse.json() : null;
      
      // 2. Fetch mock interview feedback - use highest score (same as Report tab)
      let mockInterviewData = null;
      try {
        const mockInterviewResponse = await fetch(`/api/mock-interview/reports/highest-score?email=${encodeURIComponent(candidateEmail)}`);
        if (mockInterviewResponse.ok) {
          const highestScoreReport = await mockInterviewResponse.json();
          if (highestScoreReport) {
            mockInterviewData = {
              overall_score: highestScoreReport.overall_score || 0,
              strengths: highestScoreReport.strengths || [],
              areas_for_improvement: highestScoreReport.improvements || [],
              position: highestScoreReport.position_title,
              interviewType: highestScoreReport.interview_type,
              positionLevel: highestScoreReport.position_level,
              questionCount: highestScoreReport.total_questions,
              date: new Date(highestScoreReport.created_at).toLocaleDateString(),
              duration: Math.round(highestScoreReport.duration_seconds / 60)
            };
          }
        }
      } catch (err) {
        console.error("Failed to fetch highest score mock interview report:", err);
        // Fallback to latest if highest score fails (same as Report tab)
        try {
          const fallbackResponse = await fetch(`/api/mock-interview/reports/latest?email=${encodeURIComponent(candidateEmail)}`);
          if (fallbackResponse.ok) {
            const latestReport = await fallbackResponse.json();
            if (latestReport) {
              mockInterviewData = {
                overall_score: latestReport.overall_score || 0,
                strengths: latestReport.strengths || [],
                areas_for_improvement: latestReport.improvements || [],
                position: latestReport.position_title,
                interviewType: latestReport.interview_type,
                positionLevel: latestReport.position_level,
                questionCount: latestReport.total_questions,
                date: new Date(latestReport.created_at).toLocaleDateString(),
                duration: Math.round(latestReport.duration_seconds / 60)
              };
            }
          }
        } catch (fallbackErr) {
          console.error("Failed to fetch latest mock interview report as fallback:", fallbackErr);
        }
      }
      
      // 3. Build report data structure (same as Report tab)
      const reportData = {
        profile: profileData,
        mockInterview: mockInterviewData,
        mockInterviewFeedback: mockInterviewData ? {
          overall_score: mockInterviewData.overall_score || 0,
          strengths: mockInterviewData.strengths || [],
          areas_for_improvement: mockInterviewData.areas_for_improvement || []
        } : null,
        mockInterviewDetails: mockInterviewData ? {
          position: mockInterviewData.position,
          interviewType: mockInterviewData.interviewType,
          positionLevel: mockInterviewData.positionLevel,
          questionCount: mockInterviewData.questionCount,
          date: mockInterviewData.date,
          duration: mockInterviewData.duration
        } : null,
        // Resume feedback - use profile-based data with generated areas for improvement
        resumeFeedback: {
          overall_resume_score: profileData?.profile_completion || 0,
          summary: profileData?.profile_completion ? `Based on profile completeness (${profileData.profile_completion}%)` : 'Based on profile data',
          areas_for_improvement: profileData ? generateAreasForImprovementFromProfile(profileData) : []
        }
      };
      
      setCandidateReportData(reportData);
    } catch (error) {
      console.error("Error fetching candidate report:", error);
      setCandidateReportData({
        profile: null,
        mockInterview: null,
        mockInterviewFeedback: null,
        mockInterviewDetails: null,
        resumeFeedback: null
      });
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
        <div className="page-wrap py-8">
          <div className="grid lg:grid-cols-[300px_1fr] gap-8 py-8">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-[calc(var(--app-header-height)+32px)] lg:self-start lg:max-h-[calc(100vh-var(--app-header-height)-64px)] lg:overflow-y-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                      {(() => {
                        const picUrl = profilePictureUrl || profileData.profile_picture_url;
                        const cleanUrl = picUrl?.split('#')[0]; // Remove any hash we added for refresh
                        return cleanUrl && cleanUrl.trim() !== "";
                      })() ? (
                        <img
                          key={`sidebar-profile-img-${profilePictureUrl || profileData.profile_picture_url || 'default'}`}
                          src={
                            (() => {
                              const picUrl = profilePictureUrl || profileData.profile_picture_url;
                              const cleanUrl = picUrl?.split('#')[0] || picUrl; // Remove hash if present
                              if (!cleanUrl) return '';
                              if (cleanUrl.startsWith("http")) {
                                return `${cleanUrl}?t=${Date.now()}`;
                              }
                              const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                              return `${API_BASE}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}?t=${Date.now()}`;
                            })()
                          }
                          alt="Profile Picture"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const picUrl = profilePictureUrl || profileData.profile_picture_url;
                            console.error("Profile picture failed to load:", picUrl);
                            (e.target as HTMLImageElement).style.display = "none";
                            const parentDiv = e.currentTarget.parentElement;
                            if (parentDiv && !parentDiv.querySelector('.fallback-initials')) {
                              const fallback = document.createElement("div");
                              fallback.className = "fallback-initials w-full h-full flex items-center justify-center text-white text-sm font-semibold";
                              fallback.textContent = profileData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'JC';
                              parentDiv.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <span>{profileData.name.split(' ').map(n => n[0]).join('') || 'JC'}</span>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
                        title="Upload profile picture"
                      >
                        <Camera className="h-5 w-5 text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#635bff]">
                        {profileData.name || "Job Coach"}
                      </h3>
                      <p className="text-sm text-gray-600">{profileData.organization || "Job Coach"}</p>
                    </div>
                  </div>
                  <nav className="space-y-2">
                    {[
                      {
                        id: "profile",
                        label: "Profile Settings",
                        icon: Settings,
                      },
                      {
                        id: "appointment",
                        label: "Appointment",
                        icon: CalendarClock,
                      },
                      {
                        id: "candidates",
                        label: "Candidate List",
                        icon: Users,
                      },
                      {
                        id: "consult-ai",
                        label: "AI Consult",
                        icon: Users,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                            activeTab === item.id
                              ? "bg-[#635bff] text-white"
                              : "text-[#3a4043] hover:bg-gray-100"
                          } hover:cursor-pointer`}
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
          <div className="w-full">
            {activeTab === "candidates" && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#3a4043] mb-2">
                    Candidate List
                  </h2>
                  {/* <p className="text-[#6f7a80]">
                    View and manage all candidates in the talent pool
                  </p> */}
                </div>

                {/* Search and Filters - Matching Talent Pool format */}
                <Card className="mb-3">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Search */}
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                          <Input
                            placeholder="Search by candidate name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Sort */}
                      <div className="flex gap-4">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-fit cursor-pointer">
                            <SortAsc className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recent" className="cursor-pointer">Most Recent</SelectItem>
                            <SelectItem value="name" className="cursor-pointer">Name A-Z</SelectItem>
                            <SelectItem value="score" className="cursor-pointer">Best Match</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="mb-6 ml-2">
                  {loadingCandidates ? (
                    <p className="text-[#6f7a80]">Loading...</p>
                  ) : (
                    <p className="text-[#6f7a80] text-sm">
                      {sortedCandidates.length === 0 
                        ? "No candidates found."
                        : `Showing ${sortedCandidates.length} candidate${sortedCandidates.length !== 1 ? 's' : ''}`
                      }
                    </p>
                  )}
                </div>

                {loadingCandidates ? (
                  <div className="w-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
                      <p className="text-[#6f7a80]">Loading candidates...</p>
                    </div>
                  </div>
                ) : sortedCandidates.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="h-16 w-16 text-[#6f7a80] mx-auto mb-4" />
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
                ) : (
                  <div>
                    {/* Two columns grid layout - Matching Talent Pool */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {paginatedCandidates.map((candidate, index) => (
                        <motion.div
                          key={candidate.id || candidate.email}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="hover:shadow-lg transition-all duration-300 h-full border border-gray-300">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-[#3a4043] mb-2">
                                    {candidate.name}
                                  </h3>
                                  <p className="text-[#635bff] font-medium mb-2 text-sm">
                                    {candidate.email}
                                  </p>
                                  <div className="flex items-center gap-3 mb-3">
                                    {getStatusBadge(candidate)}
                                    {candidate.matchScore > 0 && (
                                      <div className={`text-sm font-medium ${
                                        candidate.matchScore >= 80 ? "text-green-600" :
                                        candidate.matchScore >= 60 ? "text-blue-600" :
                                        "text-yellow-600"
                                      }`}>
                                        {candidate.matchScore}% match
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                                    {candidate.lastSession && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {candidate.lastSession}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                  <Button 
                                    size="sm" 
                                    className="bg-[#635bff] hover:bg-[#524aff] text-white cursor-pointer whitespace-nowrap"
                                    onClick={() => handleViewProfile(candidate.email)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Profile
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                                    onClick={() => {
                                      setActiveTab("appointment");
                                      // Dispatch event to auto-select candidate in appointment page
                                      if (typeof window !== 'undefined') {
                                        window.dispatchEvent(new CustomEvent('selectCandidateForAppointment', {
                                          detail: { candidateEmail: candidate.email }
                                        }));
                                      }
                                    }}
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Schedule
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex justify-center items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="hover:cursor-pointer"
                        >
                          Previous
                        </Button>
                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => (
                            <Button
                              key={i + 1}
                              size="sm"
                              variant={currentPage === i + 1 ? "default" : "outline"}
                              onClick={() => setCurrentPage(i + 1)}
                              className={currentPage === i + 1 
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
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="hover:cursor-pointer"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                    <div className="mt-4 text-sm text-[#6f7a80] text-center">
                      Showing {startIndex + 1}-{Math.min(endIndex, sortedCandidates.length)} of {sortedCandidates.length} candidate{sortedCandidates.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#3a4043] mb-2">
                    Profile Settings
                  </h2>
                  {/* <p className="text-[#6f7a80]">
                    Manage your job coach profile information
                  </p> */}
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Avatar Upload Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-[#635bff]" />
                            Profile Picture
                          </div>
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-20 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold text-2xl overflow-hidden">
                            {(() => {
                              const picUrl = profilePictureUrl || profileData.profile_picture_url;
                              const cleanUrl = picUrl?.split('#')[0]; // Remove any hash we added for refresh
                              return cleanUrl && cleanUrl.trim() !== "";
                            })() ? (
                              <img
                                key={`profile-img-${profilePictureUrl || profileData.profile_picture_url || 'default'}`}
                                src={
                                  (() => {
                                    const picUrl = profilePictureUrl || profileData.profile_picture_url;
                                    const cleanUrl = picUrl?.split('#')[0] || picUrl; // Remove hash if present
                                    if (!cleanUrl) return '';
                                    if (cleanUrl.startsWith("http")) {
                                      return `${cleanUrl}?t=${Date.now()}`;
                                    }
                                    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                                    return `${API_BASE}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}?t=${Date.now()}`;
                                  })()
                                }
                                alt="Profile Picture"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const picUrl = profilePictureUrl || profileData.profile_picture_url;
                                  console.error("Profile picture failed to load:", picUrl);
                                  (e.target as HTMLImageElement).style.display = "none";
                                  const parentDiv = e.currentTarget.parentElement;
                                  if (parentDiv && !parentDiv.querySelector('.fallback-initials')) {
                                    const fallback = document.createElement("div");
                                    fallback.className = "fallback-initials w-full h-full flex items-center justify-center text-white text-sm font-semibold";
                                    fallback.textContent = profileData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'JC';
                                    parentDiv.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <span>{profileData.name.split(' ').map(n => n[0]).join('') || 'JC'}</span>
                            )}
                            <input
                              type="file"
                              ref={profileSettingsFileInputRef}
                              onChange={onFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              onClick={() => profileSettingsFileInputRef.current?.click()}
                              className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
                              title="Upload profile picture"
                            >
                              <Camera className="h-5 w-5 text-white" />
                            </button>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-[#6f7a80]">
                              Click on the profile picture to upload a new one (JPG, PNG, max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#635bff]" />
                            Full Name
                          </div>
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter your full name"
                          className="w-full"
                        />
                      </div>

                      {/* Job Title Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-[#635bff]" />
                            Job Title
                          </div>
                        </label>
                        <Input
                          type="text"
                          name="organization"
                          value={profileData.organization}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              organization: e.target.value,
                            })
                          }
                          placeholder="Enter your organization"
                          className="w-full"
                        />
                      </div>

                      {/* Specialization Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-[#635bff]" />
                            Specialization
                          </div>
                        </label>
                        <Input
                          type="text"
                          name="specializations"
                          value={profileData.specializations.join(", ")}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              specializations: e.target.value.split(",").map(s => s.trim()).filter(s => s),
                            })
                          }
                          placeholder="e.g., ADHD Expert, Autism Specialist (comma-separated)"
                          className="w-full"
                        />
                      </div>

                      {/* Certifications Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#635bff]" />
                            Certifications
                          </div>
                        </label>
                        <Input
                          type="text"
                          name="certifications"
                          value={profileData.certifications.join(", ")}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              certifications: e.target.value.split(",").map(s => s.trim()).filter(s => s),
                            })
                          }
                          placeholder="e.g., Certified ADHD Coach (comma-separated)"
                          className="w-full"
                        />
                      </div>

                      {/* Bio Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-[#635bff]" />
                            Bio
                          </div>
                        </label>
                        <Textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            setProfileData({
                              ...profileData,
                              bio: e.target.value,
                            })
                          }
                          placeholder="A short description about yourself and your coaching philosophy"
                          className="w-full min-h-[100px]"
                          rows={4}
                        />
                      </div>

                      {/* Experience Years Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#635bff]" />
                            Years of Experience
                          </div>
                        </label>
                        <Input
                          type="number"
                          name="experience_years"
                          value={profileData.experience_years ?? ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              experience_years: parseInt(e.target.value) || null,
                            })
                          }
                          placeholder="e.g., 5"
                          className="w-full"
                        />
                      </div>

                      {/* Company Email Field */}
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#635bff]" />
                            Company Email
                          </div>
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          placeholder="jobcoach@company.com"
                          className="w-full"
                        />
                        <p className="text-xs text-[#6f7a80] mt-1">
                          Your professional email address
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Save Button - Right Corner */}
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleProfileSave}
                    disabled={isSaving}
                    className="bg-[#635bff] hover:bg-[#524aff] text-white cursor-pointer"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "appointment" && (
              <JobCoachAppointmentPage />
            )}

            {activeTab === "consult-ai" && (
              <div className="flex flex-col h-[calc(100vh-200px)]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[#3a4043]">
                    Consult AI
                  </h2>
                </div>
                <div className="flex-1 min-h-0">
                  <ChatBot.Chat />
                </div>
              </div>  
            )}
            </div>
          </div>
        </div>
      </div>
      
      {/* View Profile Modal - Full Candidate Report */}
      {showProfileDialog && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowProfileDialog(false)}
          />
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-[60vw] max-h-[95vh] overflow-hidden flex flex-col z-[100000]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-[#3a4043]">Candidate Feedback Report</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCandidateEmail && `Comprehensive analysis for ${candidateReportData?.profile?.name || selectedCandidateEmail}`}
                </p>
              </div>
              <button
                onClick={() => setShowProfileDialog(false)}
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
                  {/* Strengths & Needs - Same as Report page */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <Card>
                      <CardContent className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Star className="w-5 h-5 text-[#635bff]" />
                          <h3 className="text-xl font-bold text-gray-800">Strength</h3>
                        </div>
                        <div className="space-y-1">
                          {(() => {
                            let strengths: string[] = [];
                            if (candidateReportData.profile?.neurodivergent_strengths && Array.isArray(candidateReportData.profile.neurodivergent_strengths) && candidateReportData.profile.neurodivergent_strengths.length > 0) {
                              strengths = candidateReportData.profile.neurodivergent_strengths;
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
                              let needs: string[] = [];
                            if (candidateReportData.profile?.environment) {
                              const env = candidateReportData.profile.environment;
                              if (Array.isArray(env)) {
                                needs = env;
                              } else if (env.preferred_environment && Array.isArray(env.preferred_environment)) {
                                needs = env.preferred_environment;
                              } else if (env.workplace_needs && Array.isArray(env.workplace_needs)) {
                                needs = env.workplace_needs;
                              } else if (typeof env === 'object' && env !== null) {
                                const envNeeds: string[] = [];
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
                            if (needs.length === 0 && candidateReportData.resumeFeedback?.areas_for_improvement) {
                              needs = candidateReportData.resumeFeedback.areas_for_improvement;
                            }
                            if (needs.length === 0) {
                              return <p className="text-gray-500 text-sm italic">No needs data available</p>;
                            }
                            return needs.slice(0, 3).map((need: string, index: number) => (
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

                  {/* Resume Summary + Areas for Improvement - Same as Report page */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Resume Summary */}
                    <Card>
                      <CardContent className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-6">
                          <FileText className="w-5 h-5 text-[#635bff]" />
                          <h3 className="text-xl font-bold text-gray-800">Resume Summary</h3>
                        </div>
                        <div className="space-y-6">
                          {/* Experience */}
                          {candidateReportData.profile?.experience && Array.isArray(candidateReportData.profile.experience) && candidateReportData.profile.experience.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Briefcase className="w-4 h-4 text-[#635bff]" />
                                <h4 className="font-semibold text-gray-800">Experience</h4>
                              </div>
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
                          {candidateReportData.profile?.education && Array.isArray(candidateReportData.profile.education) && candidateReportData.profile.education.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <GraduationCap className="w-4 h-4 text-[#635bff]" />
                                <h4 className="font-semibold text-gray-800">Education</h4>
                              </div>
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
                          {candidateReportData.profile?.skills && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Code className="w-4 h-4 text-[#635bff]" />
                                <h4 className="font-semibold text-gray-800">Skills</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  let skillsList: string[] = [];
                                  if (candidateReportData.profile.skills?.hardSkills && Array.isArray(candidateReportData.profile.skills.hardSkills)) {
                                    skillsList = [...skillsList, ...candidateReportData.profile.skills.hardSkills];
                                  }
                                  if (candidateReportData.profile.skills?.softSkills && Array.isArray(candidateReportData.profile.skills.softSkills)) {
                                    skillsList = [...skillsList, ...candidateReportData.profile.skills.softSkills];
                                  }
                                  if (Array.isArray(candidateReportData.profile.skills)) {
                                    skillsList = candidateReportData.profile.skills;
                                  }
                                  return skillsList.length > 0 ? (
                                    skillsList.slice(0, 10).map((skill: string, index: number) => (
                                      <span key={index} className="px-3 py-1 rounded-full text-xs font-medium bg-[#635bff]/10 text-[#635bff]">
                                        {skill}
                                      </span>
                                ))
                              ) : (
                                    <p className="text-gray-500 text-sm italic">No skills data available</p>
                              );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Resume Areas for Improvement */}
                    <Card>
                      <CardContent className="px-6 py-4">
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
                                {candidateReportData.resumeFeedback?.summary || 'Based on profile completeness'}
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
                                  stroke="#635bff"
                                  strokeWidth="10"
                                  strokeDasharray={`${((candidateReportData.resumeFeedback?.overall_resume_score || 0) / 100) * 283} 283`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-[#635bff]">
                                  {candidateReportData.resumeFeedback?.overall_resume_score || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Areas List */}
                        <div className="space-y-3">
                          {(() => {
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
                                areas.push("Add both hard skills (technical) and soft skills (interpersonal) to strengthen your profile");
                              }
                              
                              return areas;
                            };
                            
                            let areas: string[] = [];
                            if (candidateReportData.resumeFeedback?.areas_for_improvement && Array.isArray(candidateReportData.resumeFeedback.areas_for_improvement) && candidateReportData.resumeFeedback.areas_for_improvement.length > 0) {
                              areas = candidateReportData.resumeFeedback.areas_for_improvement;
                            } else if (candidateReportData.profile) {
                              areas = generateAreasForImprovementFromProfile(candidateReportData.profile);
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
                              const styles = {
                                High: { bg: "rgb(254, 226, 226)", text: "rgb(153, 27, 27)", border: "rgb(252, 165, 165)" },
                                Medium: { bg: "rgb(254, 240, 138)", text: "rgb(133, 77, 14)", border: "rgb(253, 224, 71)" },
                                Low: { bg: "rgb(219, 234, 254)", text: "rgb(30, 64, 175)", border: "rgb(147, 197, 253)" },
                              };
                              const s = styles[priority];
                              
                              return (
                                <div
                                  key={index}
                                  className="p-3 border-l-4 border-red-600 bg-gradient-to-r from-red-50 to-white rounded-lg"
                                >
                                  <div className="flex items-start justify-between">
                                    <p className="text-gray-700 text-sm flex-1 pr-2">{area}</p>
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
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Suitable Job Roles - Same as Report page */}
                  {candidateReportData.resumeFeedback && (
                    <Card>
                      <CardContent className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-6">
                          <Briefcase className="w-5 h-5 text-[#635bff]" />
                          <h3 className="text-xl font-bold text-gray-800">You Are Suitable to Work As</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {candidateReportData.profile?.suitable_job_roles && Array.isArray(candidateReportData.profile.suitable_job_roles) && candidateReportData.profile.suitable_job_roles.length > 0 ? (
                            candidateReportData.profile.suitable_job_roles.slice(0, 6).map((job: any, index: number) => (
                              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
                                <h4 className="font-semibold text-gray-800 mb-2">{job.role || job}</h4>
                                {job.reason && <p className="text-gray-600 text-sm">{job.reason}</p>}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm italic col-span-full">No suitable job roles data available</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Mock Interview Performance - Same as Report page */}
                  {candidateReportData.mockInterviewFeedback && (
                    <Card>
                      <CardContent className="px-6 py-4">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-[#635bff]" />
                            <h3 className="text-xl font-bold text-gray-800">Mock Interview Performance</h3>
                        </div>
                          {candidateReportData.mockInterviewFeedback?.overall_score > 0 && (
                            <div className="text-center">
                              <div className="text-3xl font-bold text-[#635bff]">{candidateReportData.mockInterviewFeedback.overall_score}/100</div>
                              <div className="text-xs text-gray-600">Interview Score</div>
                            </div>
                          )}
                        </div>
                        {candidateReportData.mockInterviewDetails && (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Position</div>
                              <div className="font-semibold text-gray-800">{candidateReportData.mockInterviewDetails.position || 'N/A'}</div>
                                  </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Interview Type</div>
                              <div className="font-semibold text-gray-800 capitalize">{candidateReportData.mockInterviewDetails.interviewType || 'N/A'}</div>
                              </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Position Level</div>
                              <div className="font-semibold text-gray-800 capitalize">{candidateReportData.mockInterviewDetails.positionLevel || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Questions Answered</div>
                              <div className="font-semibold text-gray-800">{candidateReportData.mockInterviewDetails.questionCount || 0}</div>
                            </div>
                            {candidateReportData.mockInterviewDetails.date && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Date
                                </div>
                                <div className="font-semibold text-gray-800">{candidateReportData.mockInterviewDetails.date}</div>
                            </div>
                          )}
                            {candidateReportData.mockInterviewDetails.duration && (
                            <div>
                                <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Duration
                                </div>
                                <div className="font-semibold text-gray-800">{candidateReportData.mockInterviewDetails.duration} min</div>
                              </div>
                            )}
                          </div>
                        )}
                        {candidateReportData.mockInterviewFeedback.strengths && candidateReportData.mockInterviewFeedback.strengths.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Strengths</h4>
                            <div className="space-y-1">
                              {candidateReportData.mockInterviewFeedback.strengths.slice(0, 3).map((strength: string, index: number) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="mt-1 text-green-600">•</span>
                                  <p className="text-gray-700">{strength}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        {candidateReportData.mockInterviewFeedback.areas_for_improvement && candidateReportData.mockInterviewFeedback.areas_for_improvement.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Areas for Improvement</h4>
                            <div className="space-y-1">
                              {candidateReportData.mockInterviewFeedback.areas_for_improvement.slice(0, 3).map((area: string, index: number) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="mt-1 text-red-600">•</span>
                                  <p className="text-gray-700">{area}</p>
                        </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No report data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
